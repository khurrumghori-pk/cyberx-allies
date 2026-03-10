import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.98.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Find assessments where next_review is today or overdue
    const today = new Date().toISOString().split("T")[0];

    const { data: dueAssessments, error: fetchErr } = await supabase
      .from("compliance_assessments")
      .select("id, framework, control_ref, control_name, next_review, assessed_by")
      .not("next_review", "is", null)
      .lte("next_review", today);

    if (fetchErr) {
      console.error("Error fetching assessments:", fetchErr);
      throw fetchErr;
    }

    if (!dueAssessments || dueAssessments.length === 0) {
      return new Response(JSON.stringify({ message: "No reviews due", count: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Group by user to avoid spamming
    const byUser: Record<string, typeof dueAssessments> = {};
    for (const a of dueAssessments) {
      if (!byUser[a.assessed_by]) byUser[a.assessed_by] = [];
      byUser[a.assessed_by].push(a);
    }

    let notificationsCreated = 0;

    for (const [userId, controls] of Object.entries(byUser)) {
      // Check if we already sent a reminder today for this user
      const { data: existing } = await supabase
        .from("notifications")
        .select("id")
        .eq("user_id", userId)
        .eq("title", "Compliance Review Due")
        .gte("created_at", `${today}T00:00:00Z`)
        .limit(1);

      if (existing && existing.length > 0) continue; // Already notified today

      const overdue = controls.filter(c => c.next_review! < today);
      const dueToday = controls.filter(c => c.next_review === today);

      const bodyParts: string[] = [];
      if (overdue.length > 0) {
        bodyParts.push(`${overdue.length} overdue control(s): ${overdue.slice(0, 3).map(c => `${c.control_ref} (${c.control_name})`).join(", ")}${overdue.length > 3 ? ` +${overdue.length - 3} more` : ""}`);
      }
      if (dueToday.length > 0) {
        bodyParts.push(`${dueToday.length} due today: ${dueToday.slice(0, 3).map(c => `${c.control_ref} (${c.control_name})`).join(", ")}${dueToday.length > 3 ? ` +${dueToday.length - 3} more` : ""}`);
      }

      const severity = overdue.length > 0 ? "HIGH" : "MEDIUM";

      const { error: insertErr } = await supabase.from("notifications").insert({
        user_id: userId,
        title: "Compliance Review Due",
        body: bodyParts.join(". "),
        advisor: "Governance",
        severity,
        icon_type: "compliance",
      });

      if (insertErr) {
        console.error("Error inserting notification:", insertErr);
      } else {
        notificationsCreated++;
      }
    }

    // Advance next_review dates that are overdue by 30 days so they don't fire every day
    for (const a of dueAssessments) {
      if (a.next_review && a.next_review < today) {
        const nextDate = new Date(a.next_review);
        nextDate.setDate(nextDate.getDate() + 30);
        await supabase
          .from("compliance_assessments")
          .update({ next_review: nextDate.toISOString().split("T")[0] })
          .eq("id", a.id);
      }
    }

    return new Response(JSON.stringify({ 
      message: `Processed ${dueAssessments.length} due reviews, created ${notificationsCreated} notifications`,
      count: notificationsCreated 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("check-compliance-reviews error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
