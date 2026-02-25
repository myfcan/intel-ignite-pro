-- Sprint H: forensic persist validation

-- Q1) Cobertura geral por status (últimos 30 dias)
select
  status,
  count(*) as total,
  count(*) filter (where output_data->'meta' ? 'auditGate') as with_audit_gate,
  count(*) filter (where output_data->'meta' ? 'releaseForensicReport') as with_release_forensic_report
from public.pipeline_executions
where created_at >= now() - interval '30 days'
  and pipeline_version = 'v7-vv-1.1.5-forensic-persist'
group by status
order by status;

-- Q2) Amostra das últimas falhas
select
  run_id,
  mode,
  status,
  created_at,
  output_data->'meta'->'auditGate'->>'checked' as audit_checked,
  output_data->'meta'->'releaseForensicReport'->>'generatedAt' as forensic_generated_at,
  output_data->'meta'->'releaseForensicReport'->'auditGate'->>'passed' as forensic_audit_passed,
  error_message
from public.pipeline_executions
where pipeline_version = 'v7-vv-1.1.5-forensic-persist'
  and status = 'failed'
order by created_at desc
limit 50;

-- Q3) failed sem releaseForensicReport (deve retornar ZERO linhas)
select
  run_id,
  mode,
  status,
  created_at,
  error_message
from public.pipeline_executions
where pipeline_version = 'v7-vv-1.1.5-forensic-persist'
  and status = 'failed'
  and not (coalesce(output_data->'meta', '{}'::jsonb) ? 'releaseForensicReport')
order by created_at desc;

-- Q4) Recorte AUDIT_GATE_FAILED
select
  count(*) as total_audit_gate_failed,
  count(*) filter (where coalesce(output_data->'meta', '{}'::jsonb) ? 'releaseForensicReport') as with_release_forensic_report
from public.pipeline_executions
where pipeline_version = 'v7-vv-1.1.5-forensic-persist'
  and status = 'failed'
  and error_message::jsonb ->> 'error_code' = 'AUDIT_GATE_FAILED';
