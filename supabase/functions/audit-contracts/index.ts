/**
 * AUDIT CONTRACTS — Gate Function
 * 
 * Runs forensic SQL queries against pipeline_executions to validate
 * all required contracts. Returns a JSON scorecard.
 * 
 * Returns non-200 if any REQUIRED contract fails.
 * 
 * Usage:
 *   POST /audit-contracts
 *   Body: { "pipeline_version": "v7-vv-1.1.4%", "limit": 50 }
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AuditCheck {
  contract_id: string;
  name: string;
  status: 'required' | 'optional' | 'deprecated' | 'known_gap';
  pass: boolean;
  details: string;
  evidence?: any;
}

interface AuditScorecard {
  audit_version: string;
  contract_version: string;
  pipeline_version_filter: string;
  audited_at: string;
  total_checks: number;
  passed: number;
  failed: number;
  required_failed: number;
  gate_pass: boolean;
  checks: AuditCheck[];
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const body = await req.json().catch(() => ({}));
    const pipelineVersion = body.pipeline_version || 'v7-vv-1.1.4%';
    const limit = body.limit || 50;
    const batchId = body.batch_id || null;
    const singleRunId = body.run_id || null; // Per-run gate mode

    const checks: AuditCheck[] = [];

    // ========================================================================
    // HELPER: Build filtered query (supports per-run or per-version filtering)
    // ========================================================================
    function buildQuery(select: string) {
      let q = supabase.from('pipeline_executions').select(select);
      if (singleRunId) {
        q = q.eq('run_id', singleRunId);
      } else {
        q = q.like('pipeline_version', pipelineVersion);
      }
      return q;
    }

    // ========================================================================
    // CHECK 1: C01 — No duplicate run_ids
    // ========================================================================
    const { data: dupeCheck, error: dupeErr } = await buildQuery('run_id').limit(1000);
    
    const runIds = (dupeCheck || []).map((r: any) => r.run_id);
    const uniqueRunIds = new Set(runIds);
    const dupeCount = runIds.length - uniqueRunIds.size;
    
    checks.push({
      contract_id: 'C01',
      name: 'Idempotency (no duplicate run_ids)',
      status: 'required',
      pass: dupeCount === 0,
      details: `${runIds.length} runs, ${dupeCount} duplicates`,
    });

    // ========================================================================
    // CHECK 2: EXEC_STATE — No stuck runs (in_progress)
    // ========================================================================
    let stuckQuery = supabase.from('pipeline_executions').select('run_id, pipeline_version').eq('status', 'in_progress');
    if (singleRunId) {
      stuckQuery = stuckQuery.eq('run_id', singleRunId);
    } else {
      stuckQuery = stuckQuery.like('pipeline_version', pipelineVersion);
    }
    const { data: stuckRuns } = await stuckQuery;
    
    const stuckCount = (stuckRuns || []).length;
    checks.push({
      contract_id: 'EXEC_STATE_CANONICAL_JSON',
      name: 'No stuck runs (in_progress)',
      status: 'required',
      pass: stuckCount === 0,
      details: `stuck_count = ${stuckCount}`,
      evidence: stuckCount > 0 ? stuckRuns?.slice(0, 5) : undefined,
    });

    // ========================================================================
    // CHECK 3: EXEC_STATE — Failed runs have canonical JSON error_message
    // ========================================================================
    const { data: failedRuns } = await buildQuery('run_id, error_message, completed_at')
      .eq('status', 'failed')
      .limit(limit);

    let unstructuredCount = 0;
    let missingCompletedAt = 0;
    const unstructuredSamples: any[] = [];
    
    for (const run of (failedRuns || [])) {
      // Check completed_at
      if (!run.completed_at) missingCompletedAt++;
      
      // Check canonical JSON format
      if (run.error_message) {
        try {
          const parsed = JSON.parse(run.error_message);
          if (!parsed.error_code) {
            unstructuredCount++;
            unstructuredSamples.push({ run_id: run.run_id, reason: 'missing error_code' });
          }
        } catch {
          unstructuredCount++;
          unstructuredSamples.push({ run_id: run.run_id, reason: 'not valid JSON' });
        }
      }
    }

    checks.push({
      contract_id: 'EXEC_STATE_CANONICAL_JSON',
      name: 'Failed runs have canonical JSON error_message',
      status: 'required',
      pass: unstructuredCount === 0,
      details: `${(failedRuns || []).length} failed runs, ${unstructuredCount} unstructured`,
      evidence: unstructuredCount > 0 ? unstructuredSamples.slice(0, 3) : undefined,
    });

    checks.push({
      contract_id: 'EXEC_STATE_CANONICAL_JSON',
      name: 'Failed runs have completed_at',
      status: 'required',
      pass: missingCompletedAt === 0,
      details: `${missingCompletedAt} failed runs missing completed_at`,
    });

    // ========================================================================
    // CHECK 4: C05 — Completed runs have pipeline_version and output_content_hash
    // ========================================================================
    const { data: completedRuns } = await buildQuery('run_id, pipeline_version, output_content_hash, output_data')
      .eq('status', 'completed')
      .limit(limit);

    let missingHash = 0;
    let missingVersion = 0;
    
    for (const run of (completedRuns || [])) {
      if (!run.output_content_hash) missingHash++;
      if (!run.pipeline_version) missingVersion++;
    }

    checks.push({
      contract_id: 'C05',
      name: 'Completed runs have output_content_hash',
      status: 'required',
      pass: missingHash === 0,
      details: `${(completedRuns || []).length} completed, ${missingHash} missing hash`,
    });

    // ========================================================================
    // CHECK 5: C06 — triggerContract = anchorActions
    // ========================================================================
    let c06Mismatch = 0;
    for (const run of (completedRuns || [])) {
      const tc = run.output_data?.meta?.triggerContract;
      if (tc !== 'anchorActions') c06Mismatch++;
    }

    checks.push({
      contract_id: 'C06',
      name: 'triggerContract == anchorActions',
      status: 'required',
      pass: c06Mismatch === 0,
      details: `${c06Mismatch} runs with wrong triggerContract`,
    });

    // ========================================================================
    // CHECK 6: CONTRACT META — contractVersion present
    // ========================================================================
    let metaMissing = 0;
    let metaMismatch = 0;
    const expectedVersion = 'c10b-boundaryfix-execstate-c11-1.0';
    
    for (const run of (completedRuns || [])) {
      const cv = run.output_data?.meta?.contractVersion;
      if (!cv) {
        metaMissing++;
      } else if (cv !== expectedVersion) {
        metaMismatch++;
      }
    }

    checks.push({
      contract_id: 'EXEC_STATE_CANONICAL_JSON',
      name: 'contractVersion present and correct',
      status: 'required',
      pass: metaMissing === 0 && metaMismatch === 0,
      details: `missing=${metaMissing}, mismatch=${metaMismatch} (expected=${expectedVersion})`,
    });

    // ========================================================================
    // CHECK 7: BOUNDARY_FIX_GUARD — Boundary invariants
    // ========================================================================
    let boundaryViolations = 0;
    let totalPhasesChecked = 0;
    
    for (const run of (completedRuns || [])) {
      const phases = run.output_data?.content?.phases || [];
      for (let i = 0; i < phases.length; i++) {
        totalPhasesChecked++;
        const p = phases[i];
        const duration = p.endTime - p.startTime;
        if (duration <= 0) boundaryViolations++;
        
        if (i < phases.length - 1) {
          const next = phases[i + 1];
          if (p.endTime > next.startTime) boundaryViolations++;
        }
      }
    }

    checks.push({
      contract_id: 'BOUNDARY_FIX_GUARD',
      name: 'All phases: duration > 0 && monotonic',
      status: 'required',
      pass: boundaryViolations === 0,
      details: `${totalPhasesChecked} phases checked, ${boundaryViolations} violations`,
    });

    // ========================================================================
    // CHECK 8: C10 — Interactive phases have pause anchorActions
    // ========================================================================
    let interactiveMissingPause = 0;
    const interactiveTypes = ['interaction', 'playground', 'secret-reveal', 'quiz', 'cta'];
    
    for (const run of (completedRuns || [])) {
      const phases = run.output_data?.content?.phases || [];
      for (const phase of phases) {
        if (interactiveTypes.includes(phase.type)) {
          const hasPause = (phase.anchorActions || []).some((a: any) => a.type === 'pause');
          if (!hasPause) interactiveMissingPause++;
        }
      }
    }

    checks.push({
      contract_id: 'C10',
      name: 'All interactive phases have pause anchorAction',
      status: 'required',
      pass: interactiveMissingPause === 0,
      details: `${interactiveMissingPause} interactive phases missing pause`,
    });

    // ========================================================================
    // CHECK 9: wordTimestamps present for completed runs
    // ========================================================================
    let wtMissing = 0;
    for (const run of (completedRuns || [])) {
      const wt = run.output_data?.content?.audio?.mainAudio?.wordTimestamps;
      if (!Array.isArray(wt) || wt.length === 0) wtMissing++;
    }

    checks.push({
      contract_id: 'C05',
      name: 'wordTimestamps present in completed runs',
      status: 'required',
      pass: wtMissing === 0,
      details: `${wtMissing} runs missing wordTimestamps`,
    });

    // ========================================================================
    // CHECK 10: C10B — Pause delta within 1.5s (spot check)
    // ========================================================================
    let c10bViolations = 0;
    let c10bChecked = 0;
    
    for (const run of (completedRuns || []).slice(0, 10)) {
      const phases = run.output_data?.content?.phases || [];
      const wt = run.output_data?.content?.audio?.mainAudio?.wordTimestamps || [];
      
      for (const phase of phases) {
        if (!interactiveTypes.includes(phase.type)) continue;
        
        const pauseAction = (phase.anchorActions || []).find((a: any) => a.type === 'pause');
        if (!pauseAction) continue;
        
        c10bChecked++;
        // Check if pause is within 1.5s of phase end
        const narrationAfter = phase.endTime - pauseAction.keywordTime;
        if (narrationAfter > 1.5) {
          c10bViolations++;
        }
      }
    }

    checks.push({
      contract_id: 'C10B',
      name: 'Pause anchors within 1.5s of narration end',
      status: 'required',
      pass: c10bViolations === 0,
      details: `${c10bChecked} interactive pauses checked, ${c10bViolations} violations (>1.5s)`,
    });

    // ========================================================================
    // DEPRECATED CONTRACTS (informational)
    // ========================================================================
    checks.push({
      contract_id: 'C07',
      name: 'Pause Priority Rule (DEPRECATED)',
      status: 'deprecated',
      pass: true,
      details: 'Deprecated by C10 — Hard Pause Anchor Contract',
    });

    checks.push({
      contract_id: 'C09',
      name: 'Pause at Last Word (DEPRECATED)',
      status: 'deprecated',
      pass: true,
      details: 'Deprecated by C10 — Hard Pause Anchor Contract',
    });

    // ========================================================================
    // KNOWN GAPS (informational)
    // ========================================================================
    checks.push({
      contract_id: 'C03',
      name: 'Scenes Array Population (KNOWN GAP)',
      status: 'known_gap',
      pass: true,
      details: 'scenes[] currently empty. Renderer uses visual fallback. Deferred to future version.',
    });

    // ========================================================================
    // BUILD SCORECARD
    // ========================================================================
    const requiredChecks = checks.filter(c => c.status === 'required');
    const requiredFailed = requiredChecks.filter(c => !c.pass).length;

    const scorecard: AuditScorecard = {
      audit_version: '1.0.0',
      contract_version: expectedVersion,
      pipeline_version_filter: pipelineVersion,
      audited_at: new Date().toISOString(),
      total_checks: checks.length,
      passed: checks.filter(c => c.pass).length,
      failed: checks.filter(c => !c.pass).length,
      required_failed: requiredFailed,
      gate_pass: requiredFailed === 0,
      checks,
    };

    const httpStatus = scorecard.gate_pass ? 200 : 422;

    return new Response(JSON.stringify(scorecard, null, 2), {
      status: httpStatus,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('[audit-contracts] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
