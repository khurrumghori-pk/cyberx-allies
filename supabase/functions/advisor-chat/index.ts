import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.98.0";

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
    const { messages, advisorRole, advisorId } = await req.json();
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

    // Clone the stream: one for client, one for passive learning
    const [clientStream, learningStream] = response.body!.tee();

    // Fire-and-forget: extract learning from the conversation in the background
    if (advisorId) {
      const authHeader = req.headers.get("Authorization");
      (async () => {
        try {
          // Read the full response from learningStream
          const reader = learningStream.getReader();
          const decoder = new TextDecoder();
          let fullResponse = "";
          let buffer = "";
          
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            let idx;
            while ((idx = buffer.indexOf("\n")) !== -1) {
              let line = buffer.slice(0, idx);
              buffer = buffer.slice(idx + 1);
              if (line.endsWith("\r")) line = line.slice(0, -1);
              if (!line.startsWith("data: ")) continue;
              const jsonStr = line.slice(6).trim();
              if (jsonStr === "[DONE]") break;
              try {
                const parsed = JSON.parse(jsonStr);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) fullResponse += content;
              } catch { /* partial */ }
            }
          }

          // Now extract learnings from the conversation
          const userMessages = messages.filter((m: any) => m.role === "user").map((m: any) => m.content).join("\n");
          const conversationSummary = `User asked: ${userMessages}\n\nAdvisor (${advisorRole}) responded: ${fullResponse.slice(0, 500)}`;

          const learnResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${LOVABLE_API_KEY}` },
            body: JSON.stringify({
              messages: [
                { role: "system", content: "Extract 1-2 key user preferences, interests, or behavioral patterns from this conversation. Return ONLY a JSON array of short strings. If nothing notable, return []. No markdown." },
                { role: "user", content: conversationSummary }
              ],
            }),
          });

          if (learnResp.ok) {
            const learnData = await learnResp.json();
            const text = learnData.choices?.[0]?.message?.content || "[]";
            const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
            let facts: string[] = [];
            try { facts = JSON.parse(cleaned); } catch { /* ignore */ }

            if (Array.isArray(facts) && facts.length > 0) {
              const supabase = createClient(
                Deno.env.get("SUPABASE_URL")!,
                Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
              );
              for (const fact of facts.slice(0, 2)) {
                await supabase.from("twin_memories").insert({
                  advisor_id: advisorId,
                  memory_type: "conversation_pattern",
                  content: fact
                });
              }
            }
          }
        } catch (e) {
          console.error("Passive learning error (non-blocking):", e);
        }
      })();
    } else {
      // If no advisorId, just cancel the learning stream
      learningStream.cancel();
    }

    return new Response(clientStream, {
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