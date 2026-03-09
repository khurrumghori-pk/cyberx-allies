import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.98.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing auth");
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, { 
      global: { headers: { Authorization: authHeader } } 
    });
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error("Unauthorized");
    
    const { advisorId } = await req.json();
    if (!advisorId) throw new Error("advisorId is required");

    const { data: advisor, error: advError } = await supabase.from("advisors").select("*").eq("id", advisorId).single();
    if (advError || !advisor) throw new Error("Advisor not found");

    // Fetch some recent memories to include
    const { data: memories } = await supabase.from("twin_memories").select("content").eq("advisor_id", advisorId).limit(5);
    const memoryContext = memories && memories.length > 0 
      ? `\n\nUser Preferences & Learned Facts:\n` + memories.map(m => `- ${m.content}`).join("\n")
      : "";

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");
    
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${LOVABLE_API_KEY}` },
      body: JSON.stringify({
        messages: [
          { 
            role: "system", 
            content: `You are a proactive Digital Twin named ${advisor.name} with the role of ${advisor.role}. Generate a short, actionable daily security briefing or meeting prep notes for your assigned user. Keep it under 250 characters if possible, focusing on top priority items.` + memoryContext 
          },
          { role: "user", content: "Generate my daily briefing based on what you know." }
        ],
      }),
    });
    
    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || "Your daily security overview is ready for review.";

    // Insert into notifications
    await supabase.from("notifications").insert({
      user_id: user.id,
      advisor: advisor.name,
      severity: "MEDIUM",
      title: "Daily Proactive Brief",
      body: content.slice(0, 250),
      icon_type: "bell"
    });

    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});