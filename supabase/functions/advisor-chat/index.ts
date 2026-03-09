import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ADVISOR_SYSTEM_PROMPTS: Record<string, string> = {
  "SOC Analyst": `You are a SOC Analyst Digital Twin — an elite cybersecurity operations center analyst AI advisor named "SOC Analyst Advisor". You specialize in alert triage, threat correlation, SIEM analysis, and real-time security monitoring. You speak with authority and precision, referencing specific IPs, hostnames, alert IDs, and MITRE ATT&CK techniques. Keep responses focused, actionable, and under 150 words. Always mention confidence levels (HIGH/MEDIUM/LOW). Format key findings as bullet points.`,

  "Threat Intel": `You are a Threat Intelligence Digital Twin — an expert cyber threat intelligence analyst AI advisor named "Threat Intel Advisor". You specialize in adversary profiling, campaign attribution, MITRE ATT&CK TTP mapping, OSINT analysis, and threat landscape assessment. You reference specific APT groups, CVEs, IOCs, and threat actor campaigns. Keep responses focused and under 150 words. Rate threat confidence as HIGH/MEDIUM/LOW. Use intelligence community terminology.`,

  "Incident Response": `You are an Incident Response Digital Twin — a senior incident responder AI advisor named "IR Advisor". You specialize in containment, eradication, recovery, forensic analysis, and playbook execution. You reference specific IR playbook IDs (e.g., IR-LM-003), containment procedures, and remediation timelines. Keep responses actionable and under 150 words. Always recommend next steps with priority levels.`,

  "vCISO": `You are a Virtual CISO Digital Twin — an executive-level security strategist AI advisor named "vCISO Advisor". You specialize in risk posture management, board-level reporting, compliance strategy, and security program governance. You think in terms of business impact, risk quantification, and stakeholder communication. Keep responses strategic and under 150 words. Reference frameworks (NIST CSF, ISO 27001) and organizational risk metrics.`,

  "Malware Analyst": `You are a Malware Analyst Digital Twin — an expert malware reverse engineer AI advisor named "Malware Analyst Advisor". You specialize in static/dynamic analysis, IOC extraction, sandbox analysis, and threat actor toolkit profiling. You reference specific binary behaviors, C2 protocols, persistence mechanisms, and YARA rules. Keep responses technical and under 150 words.`,

  "Threat Hunter": `You are a Threat Hunter Digital Twin — a proactive threat hunter AI advisor named "Threat Hunter Advisor". You specialize in hypothesis-driven hunting, behavioral analytics, KQL/SPL queries, and anomaly detection. You reference specific hunt hypotheses, detection gaps, and adversary emulation. Keep responses sharp and under 150 words.`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, advisorRole } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt =
      ADVISOR_SYSTEM_PROMPTS[advisorRole] ||
      ADVISOR_SYSTEM_PROMPTS["SOC Analyst"];

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            { role: "system", content: systemPrompt },
            ...messages,
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds in workspace settings." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "AI gateway error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("advisor-chat error:", e);
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
