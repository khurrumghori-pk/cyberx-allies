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
    
    const { advisorId, messages } = await req.json();
    if (!advisorId) throw new Error("advisorId is required");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");
    
    const chatText = messages ? messages.map((m: any) => `${m.role}: ${m.content}`).join("\n") : "No specific messages provided, analyze general usage.";

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${LOVABLE_API_KEY}` },
      body: JSON.stringify({
        messages: [{ 
            role: "system", 
            content: "You are an AI analyzing a user's security workspace activities. Extract 1-3 key user preferences, patterns, or facts from this context to improve future interactions. Return ONLY a JSON array of strings: [\"fact1\", \"fact2\"]. Do not use markdown blocks or explanations." 
          },
          { role: "user", content: chatText }
        ],
      }),
    });
    
    const aiData = await aiResponse.json();
    let facts: string[] = [];
    try {
        const text = aiData.choices?.[0]?.message?.content || "[]";
        const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        facts = JSON.parse(cleaned);
    } catch(e) {
        console.error("Parse error:", e);
        facts = ["User engaged in general security discussion"];
    }

    if (Array.isArray(facts) && facts.length > 0) {
        for (const fact of facts) {
            await supabase.from("twin_memories").insert({
                advisor_id: advisorId,
                memory_type: "conversation_pattern",
                content: fact
            });
        }
    }

    return new Response(JSON.stringify({ success: true, facts }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});