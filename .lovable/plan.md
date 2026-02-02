
# Plano: Remover Tabela v7_debug_reports

## Confirmação de Segurança

A tabela `v7_debug_reports` pode ser removida com segurança. O novo V7 Diagnostic Engine:
- Busca dados diretamente da tabela `lessons`
- Executa análises on-demand (sem persistência)
- Não tem nenhuma referência à tabela legada

---

## Ação: Migration SQL

```sql
-- Migration: Remover tabela legada v7_debug_reports
-- Seguro: O novo V7 Diagnostic Engine não usa esta tabela

DROP TABLE IF EXISTS v7_debug_reports;
```

---

## Resultado Esperado

Após a migration:
1. Tabela `v7_debug_reports` será removida do banco
2. O arquivo `src/integrations/supabase/types.ts` será regenerado automaticamente (sem a interface dessa tabela)
3. O V7 Diagnostic Engine continuará funcionando normalmente

---

## Impacto

| Componente | Afetado? |
|------------|----------|
| V7 Diagnostic Engine | Não |
| AdminV7Diagnostic.tsx | Não |
| Tabela lessons | Não |
| Outros sistemas | Não |

