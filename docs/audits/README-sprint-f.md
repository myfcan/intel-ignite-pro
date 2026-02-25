# Sprint F — Operational SQL Audit

Arquivo principal: `docs/audits/sprint-f-operational-audit.sql`.

## Como executar
1. Abra o SQL Editor do Supabase do ambiente alvo.
2. Execute os blocos Q1→Q6 em sequência.
3. Se precisar filtrar um `run_id`, altere `run_id_filter` no CTE `params` do Q1 para um UUID válido.

## O que este playbook evita explicitamente
- Erro `22P02 invalid input syntax for type uuid` por placeholder textual (`RUN_ID_AQUI`).
- Erro `42703 column ... does not exist` no `lesson_migrations_audit` (usa `migration_status`, não `audit_status`/`status`).

## Evidências esperadas
- Status por modo (`create`, `reprocess`, `dry_run`).
- Carimbo de audit gate em `output_data.meta.auditGate`.
- Cobertura de `releaseForensicReport` (Sprint C).
- Correlação por `run_id` entre `pipeline_executions` e `lesson_migrations_audit`.
