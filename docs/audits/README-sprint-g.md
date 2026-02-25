# Sprint G — Operação: superfícies forenses e manutenção de execuções órfãs

## Entregas
- View `public.v7vv_audit_runs_v1`: projeção achatada de metadados de auditoria (`auditGate`, `releaseForensicReport`, erro canônico).
- Function `public.get_v7vv_audit_runs(limit_rows, run_id_filter)`: consulta segura (evita erro de UUID placeholder).
- Function `public.close_stale_pipeline_runs(age_threshold, do_update)`: manutenção de execuções `pending/in_progress` órfãs (dry-run por padrão).

## Execução recomendada
1. **Listagem forense padrão**
```sql
select * from public.get_v7vv_audit_runs(120, null);
```

2. **Dry-run de limpeza de execuções órfãs**
```sql
select * from public.close_stale_pipeline_runs(interval '30 days', false);
```

3. **Aplicar limpeza (somente após validação do dry-run)**
```sql
select * from public.close_stale_pipeline_runs(interval '30 days', true);
```

## Segurança operacional
- `close_stale_pipeline_runs` só fecha execuções com status `pending|in_progress` acima do limiar.
- Quando fecha, grava erro canônico `STALE_EXECUTION_TIMEOUT` se `error_message` estiver nulo.
- Use sempre dry-run antes de `do_update=true`.
