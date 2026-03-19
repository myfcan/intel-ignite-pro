

# Fix PR#245: Completar referências c2Fixes/c3Fixes

## Alteração

**Arquivo:** `supabase/functions/v10-generate-steps/index.ts`  
**Linhas 369-370** — trocar variáveis inexistentes pelas propriedades do objeto `c2c3Result`:

```typescript
// DE (atual — erro TS2304)
c2_fixes: c2Fixes,
c3_fixes: c3Fixes,

// PARA
c2_fixes: c2c3Result.c2Fixes,
c3_fixes: c2c3Result.c3Fixes,
```

## Impacto

- Completa a intenção do PR#245: gravar contagem de auto-fixes C2/C3 no `v10_bpa_pipeline_log`
- Resolve o erro de build `TS2304: Cannot find name`
- Sem migration necessária — correção puramente TypeScript

