import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { controls, framework, policies } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const nonCompliant = controls.filter((c: any) => c.status === "non_compliant" || c.status === "not_assessed" || c.status === "partial");

    if (nonCompliant.length === 0) {
      return new Response(JSON.stringify({ analysis: "All controls are compliant. No gaps found." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const controlList = nonCompliant.map((c: any) => `- [${c.control_ref}] ${c.control_name} — Status: ${c.status.replace("_", " ")}`).join("\n");
    const policyList = (policies || []).map((p: any) => `- ${p.title} (${p.category}, ${p.status})`).join("\n") || "No policies uploaded yet.";

    const systemPrompt = `You are a senior cybersecurity compliance advisor and Digital Twin specializing in ${framework} compliance gap analysis.

Your role is to analyze non-compliant or unassessed controls and provide:
1. An executive summary of the compliance posture
2. For each gap: root cause analysis, risk rating (Critical/High/Medium/Low), and specific remediation steps
3. Quick wins vs. long-term improvements
4. Policy recommendations tied to existing organizational policies

Be specific, actionable, and reference industry best practices. Format using markdown with clear sections.`;

    const userPrompt = `Analyze the following compliance gaps for the ${framework} framework:

## Non-Compliant / Unassessed Controls:
${controlList}

## Existing Organizational Policies:
${policyList}

Provide a comprehensive gap analysis with prioritized remediation recommendations.`;

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
          { role: "user", content: userPrompt },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("compliance-gap-analysis error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
