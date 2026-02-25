# Sprint H — Forensic Report Persistence Fix (v7-vv-1.1.5)

## Problema Diagnosticado
O `releaseForensicReport` e `auditGate` eram persistidos em `output_data.meta` apenas para runs **completed** que passaram o audit gate.
Runs **failed** (AUDIT_GATE_FAILED ou UNREACHABLE) tinham o relatório construído mas apenas retornado no HTTP response — nunca persistido no banco.

### Evidência Forense (antes do fix)
```sql
-- Completed create runs: auditGate ✅, releaseForensicReport ✅
-- Failed create runs:    auditGate ❌, releaseForensicReport ❌
```

## Correções Aplicadas (v7-vv-1.1.5-forensic-persist)

### 1. AUDIT_GATE_FAILED path
- Agora faz fetch do `output_data` existente antes de atualizar
- Merge `auditGate` + `releaseForensicReport` em `output_data.meta`
- Persiste junto com `status=failed` e `error_message`

### 2. AUDIT_GATE UNREACHABLE path
- Mesmo padrão: fetch → merge → persist

### 3. Global catch (erros genéricos)
- `failedOutputData.meta` agora inclui `releaseForensicReport` com `auditChecked: false`

## Validação

### Testes unitários
```bash
npx vitest run src/components/lessons/v7/cinematic/validators/__tests__/forensicReportPersistence.test.ts
```

### SQL de validação pós-deploy
```sql
-- Q1: Coverage por status (deve ser 100% para v7-vv-1.1.5+)
-- Ver: docs/audits/sprint-h-forensic-persist-validation.sql

-- Q3: Gap detection (deve retornar 0 rows)
SELECT count(*) FROM pipeline_executions
WHERE pipeline_version LIKE 'v7-vv-1.1.5%'
  AND mode IN ('create', 'reprocess')
  AND status IN ('completed', 'failed')
  AND output_data->'meta'->'releaseForensicReport' IS NULL;
```

## Plano de Validação Pós-Deploy

1. Executar um `dry_run` (não persiste forensic — esperado)
2. Executar um `create` com input válido → verificar Q2
3. Executar um `create` com input que cause AUDIT_GATE_FAILED → verificar Q3 retorna 0
4. Executar `sprint-h-forensic-persist-validation.sql` completo

## Compatibilidade Retroativa
- ✅ Nenhuma alteração de schema
- ✅ Runs antigos (v7-vv-1.1.4) continuam funcionando
- ✅ View `v7vv_audit_runs_v1` e function `get_v7vv_audit_runs` continuam compatíveis
- ✅ `output_data.meta` usa spread (`...existingMeta`), preservando campos existentes
