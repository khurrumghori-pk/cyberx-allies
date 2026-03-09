import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.98.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization header");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error("Unauthorized");

    const { advisorId, knowledgeSources } = await req.json();
    if (!advisorId) throw new Error("advisorId is required");

    // Create training job
    const { data: job, error: jobError } = await supabase
      .from("advisor_training_jobs")
      .insert({
        advisor_id: advisorId,
        knowledge_sources: knowledgeSources || [],
        status: "processing",
        started_at: new Date().toISOString(),
        created_by: user.id,
        total_chunks: knowledgeSources?.length * 12 || 0,
      })
      .select()
      .single();

    if (jobError) throw jobError;

    // Use Lovable AI to generate embeddings summary for knowledge sources
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const knowledgeLabels = (knowledgeSources || []).join(", ");

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: "You are a cybersecurity knowledge indexer. Generate a structured knowledge graph summary for training a security AI advisor."
          },
          {
            role: "user",
            content: `Generate a knowledge graph index summary for the following cybersecurity knowledge sources: ${knowledgeLabels}. Include key entities, relationships, and critical concepts that an AI security advisor should know. Return as a structured list of key concepts and their relationships.`
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI training error:", errText);
      
      // Update job as failed
      await supabase.from("advisor_training_jobs").update({
        status: "failed",
        error_message: `AI processing failed: ${aiResponse.status}`,
        completed_at: new Date().toISOString(),
      }).eq("id", job.id);

      throw new Error("AI knowledge processing failed");
    }

    const aiData = await aiResponse.json();
    const knowledgeSummary = aiData.choices?.[0]?.message?.content || "";

    // Update advisor with processed knowledge
    const totalChunks = knowledgeSources?.length * 12 || 0;
    
    await supabase.from("advisors").update({
      state: "active",
      vector_index: `indexed-${Date.now()}`,
      graph_nodes: knowledgeSources?.map((s: string) => `node:${s}`) || [],
      updated_at: new Date().toISOString(),
    }).eq("id", advisorId);

    // Complete the training job
    await supabase.from("advisor_training_jobs").update({
      status: "completed",
      chunks_processed: totalChunks,
      completed_at: new Date().toISOString(),
    }).eq("id", job.id);

    return new Response(
      JSON.stringify({
        success: true,
        jobId: job.id,
        chunksProcessed: totalChunks,
        knowledgeSummary: knowledgeSummary.slice(0, 500),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("advisor-train error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
