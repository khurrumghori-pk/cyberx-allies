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

    const { type } = await req.json();

    // Use AI to generate a realistic threat notification
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

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
            content: "You are a cybersecurity threat detection system. Generate realistic security alerts."
          },
          {
            role: "user",
            content: `Generate a ${type || 'threat'} security notification. Return JSON with: advisor (SOC Analyst/Threat Intel/vCISO/IR Advisor/Malware Analyst), severity (CRITICAL/HIGH/MEDIUM/LOW), title (short alert title), body (detailed description under 200 chars). Return only valid JSON, no markdown.`
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI generation failed");
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || "";
    
    let notification;
    try {
      // Try to parse JSON from AI response, handle markdown wrapping
      const jsonStr = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      notification = JSON.parse(jsonStr);
    } catch {
      notification = {
        advisor: "SOC Analyst",
        severity: "HIGH",
        title: "Anomalous Activity Detected",
        body: content.slice(0, 200),
      };
    }

    // Insert into notifications table (triggers realtime)
    const { data, error } = await supabase.from("notifications").insert({
      user_id: user.id,
      advisor: notification.advisor || "SOC Analyst",
      severity: notification.severity || "MEDIUM",
      title: notification.title || "Security Alert",
      body: notification.body || "New threat detected",
      icon_type: notification.severity === "CRITICAL" ? "shield" : "alert",
    }).select().single();

    if (error) throw error;

    return new Response(JSON.stringify({ success: true, notification: data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-notification error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
