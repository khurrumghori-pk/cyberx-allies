import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.98.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, mode, targetAdvisorId, targetUserName, teamName, teamMembers, context, conversationHistory } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";

    let memoryContext = "";
    if (targetAdvisorId) {
      try {
        const authHeader = req.headers.get("Authorization");
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseKey, { 
          global: { headers: { Authorization: authHeader || "" } } 
        });
        
        const { data: memories } = await supabase.from("twin_memories").select("content").eq("advisor_id", targetAdvisorId).limit(5);
        if (memories && memories.length > 0) {
          memoryContext = `\n\nLearned Context & Preferences:\n` + memories.map(m => `- ${m.content}`).join("\n");
        }
      } catch (e) {
        console.error("Failed to fetch memories", e);
      }
    }

    if (mode === "twin") {
      systemPrompt = `You are the Digital Twin of ${targetUserName || "a team member"}. You represent their knowledge, expertise, communication style, and institutional memory.
      
${memoryContext}

When responding as this person's Digital Twin:
1. Answer as if you ARE this person, using "I" perspective
2. Draw on typical domain expertise for their role and the learned context above
3. Reference relevant past experiences and knowledge areas
4. Be helpful and collaborative — you're enabling async communication
5. If unsure about specifics, acknowledge it naturally: "I'd need to double-check that, but from what I recall…"
6. Use markdown for clear formatting

Remember: You're bridging communication gaps — the user is asking YOU because the real person may be unavailable.`;
    } else if (mode === "team") {
      const memberList = (teamMembers || [])
        .map((m: any) => `- ${m.name} (${m.role}) — Digital Twin: ${m.advisorName}`)
        .join("\n");

      systemPrompt = `You are the Collective Digital Twin for team "${teamName || "Unknown"}". You synthesize the combined knowledge and perspectives of all team members:

${memberList}

When responding:
1. Synthesize perspectives from multiple team members when relevant
2. Attribute insights to specific team members: "[Steve] would point out that…"
3. Highlight areas of agreement AND potential differences of opinion
4. Provide actionable, consolidated recommendations
5. Use markdown with clear sections
6. Be comprehensive — this is the team's collective brain

One question → the whole team's answer.`;
    } else {
      systemPrompt = `You are a helpful security advisor Digital Twin. Answer questions clearly and concisely using markdown.`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("twin-to-twin-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
