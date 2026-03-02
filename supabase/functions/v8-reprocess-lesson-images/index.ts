import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const { lessonId, allowText = false, sectionsToReprocess } = await req.json();

    if (!lessonId) {
      return new Response(JSON.stringify({ error: "Missing lessonId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Fetch lesson
    const { data: lesson, error: fetchError } = await (supabase as any)
      .from("lessons")
      .select("content")
      .eq("id", lessonId)
      .single();

    if (fetchError || !lesson) {
      return new Response(JSON.stringify({ error: `Lesson not found: ${fetchError?.message}` }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const content = lesson.content as any;
    if (!content?.sections || !Array.isArray(content.sections)) {
      return new Response(JSON.stringify({ error: "Lesson has no sections array" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const sections = content.sections;
    const indices: number[] = sectionsToReprocess ?? sections.map((_: any, i: number) => i);
    const report: Array<{ index: number; status: string; imageUrl?: string; error?: string }> = [];

    console.log(`[v8-reprocess] Starting reprocess for lesson=${lessonId}, sections=${JSON.stringify(indices)}`);

    // 2. Process each section sequentially
    for (const idx of indices) {
      if (idx < 0 || idx >= sections.length) {
        report.push({ index: idx, status: "skipped", error: "Index out of range" });
        continue;
      }

      const section = sections[idx];
      console.log(`[v8-reprocess] Processing section ${idx}: "${section.title?.slice(0, 40)}"`);

      try {
        // Call the existing generation function via HTTP
        const fnUrl = `${supabaseUrl}/functions/v1/v8-generate-section-image`;
        const response = await fetch(fnUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({
            mode: "auto",
            content: section.content,
            lessonId,
            sectionIndex: idx,
            allowText,
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          console.error(`[v8-reprocess] Section ${idx} failed (${response.status}):`, errText);
          report.push({ index: idx, status: "error", error: `HTTP ${response.status}: ${errText.slice(0, 200)}` });

          // If rate limited, wait 10s before next
          if (response.status === 429) {
            console.log("[v8-reprocess] Rate limited, waiting 10s...");
            await new Promise((r) => setTimeout(r, 10000));
          }
          continue;
        }

        const result = await response.json();
        if (result.error) {
          report.push({ index: idx, status: "error", error: result.error });
          continue;
        }

        // Update section imageUrl in content
        sections[idx].imageUrl = result.imageUrl;
        report.push({ index: idx, status: "ok", imageUrl: result.imageUrl });
        console.log(`[v8-reprocess] Section ${idx} OK: ${result.imageUrl}`);

        // Small delay between sections to avoid rate limits
        if (idx !== indices[indices.length - 1]) {
          await new Promise((r) => setTimeout(r, 3000));
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`[v8-reprocess] Section ${idx} exception:`, msg);
        report.push({ index: idx, status: "error", error: msg });
      }
    }

    // 3. Save updated content back to DB
    const updatedContent = { ...content, sections };
    const { error: updateError } = await (supabase as any)
      .from("lessons")
      .update({ content: updatedContent })
      .eq("id", lessonId);

    if (updateError) {
      console.error("[v8-reprocess] DB update error:", updateError);
      return new Response(
        JSON.stringify({ error: `DB update failed: ${updateError.message}`, report }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const successCount = report.filter((r) => r.status === "ok").length;
    console.log(`[v8-reprocess] Done. ${successCount}/${indices.length} sections reprocessed.`);

    return new Response(
      JSON.stringify({ success: true, reprocessed: successCount, total: indices.length, report }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("[v8-reprocess] Error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
