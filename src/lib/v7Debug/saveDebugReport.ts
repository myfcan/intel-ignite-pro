/**
 * Save V7 Debug Report to Database
 * =================================
 * 
 * Utilitário para persistir debug reports no Supabase.
 */

import { supabase } from '@/integrations/supabase/client';
import type { V7DebugReport, V7DebugIssue } from '@/types/V7DebugSchema';
import type { Json } from '@/integrations/supabase/types';

export interface SaveDebugReportResult {
  success: boolean;
  reportId?: string;
  error?: string;
}

/**
 * Salva um debug report no banco de dados
 */
export async function saveDebugReport(report: V7DebugReport): Promise<SaveDebugReportResult> {
  try {
    const { data, error } = await supabase
      .from('v7_debug_reports')
      .insert({
        lesson_id: report.lessonId,
        lesson_title: report.lessonTitle,
        generated_at: report.generatedAt,
        source: report.source,
        schema_version: report.schemaVersion,
        health_score: report.summary?.healthScore ?? 100,
        severity: report.summary?.severity ?? 'info',
        total_issues: report.summary?.totalIssues ?? 0,
        audio_report: report.audio ? (JSON.parse(JSON.stringify(report.audio)) as Json) : null,
        timeline_report: report.timeline ? (JSON.parse(JSON.stringify(report.timeline)) as Json) : null,
        execution_report: report.execution ? (JSON.parse(JSON.stringify(report.execution)) as Json) : null,
        rendering_report: report.rendering ? (JSON.parse(JSON.stringify(report.rendering)) as Json) : null,
        player_report: report.player ? (JSON.parse(JSON.stringify(report.player)) as Json) : null,
        summary_report: JSON.parse(JSON.stringify(report.summary ?? { severity: 'info', totalIssues: 0, healthScore: 100 })) as Json,
        all_issues: JSON.parse(JSON.stringify(report.allIssues ?? [])) as Json,
      })
      .select('id')
      .single();

    if (error) {
      console.error('[saveDebugReport] Error:', error);
      return { success: false, error: error.message };
    }

    console.log(`[saveDebugReport] ✅ Report saved with ID: ${data.id}`);
    return { success: true, reportId: data.id };
  } catch (err) {
    console.error('[saveDebugReport] Exception:', err);
    return { success: false, error: (err as Error).message };
  }
}

/**
 * Busca o último debug report de uma aula
 */
export async function getLatestDebugReport(lessonId: string): Promise<V7DebugReport | null> {
  try {
    const { data, error } = await supabase
      .from('v7_debug_reports')
      .select('*')
      .eq('lesson_id', lessonId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('[getLatestDebugReport] Error:', error);
      return null;
    }

    if (!data) return null;

    // Convert database format to V7DebugReport with proper type handling
    return {
      lessonId: data.lesson_id,
      lessonTitle: data.lesson_title,
      generatedAt: data.generated_at,
      schemaVersion: data.schema_version,
      source: data.source as 'pipeline' | 'player' | 'combined',
      audio: data.audio_report as unknown as V7DebugReport['audio'],
      timeline: data.timeline_report as unknown as V7DebugReport['timeline'],
      execution: data.execution_report as unknown as V7DebugReport['execution'],
      rendering: data.rendering_report as unknown as V7DebugReport['rendering'],
      player: data.player_report as unknown as V7DebugReport['player'],
      summary: data.summary_report as unknown as V7DebugReport['summary'],
      allIssues: (data.all_issues as unknown as V7DebugIssue[]) || [],
    };
  } catch (err) {
    console.error('[getLatestDebugReport] Exception:', err);
    return null;
  }
}
