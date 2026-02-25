

# Correção do SLO_GUARD v2 na Bridge

## Problema confirmado com dados reais

A view `image_lab_kpis_last_7d` retorna `fail_rate_openai` e `fail_rate_gemini` na escala **0-100** (percentual), conforme SQL real da view:

```sql
round(count(failed)::numeric / count(total)::numeric * 100::numeric, 1) AS fail_rate_openai
```

O plano anterior propunha `> 0.4`, o que bloquearia a bridge com apenas **0.4% de falha** -- virtualmente qualquer erro esporadico.

O threshold correto para "40% de falha real" e **`> 40`**.

---

## Alteracao proposta

**Arquivo**: `supabase/functions/image-lab-pipeline-bridge/index.ts`, linhas 349-369

Substituir o bloco SLO_GUARD atual por:

```typescript
if (kpis && !fault.active) {
  // C12.1_SLO_GUARD v2: Bridge is server-to-server automated
  // Skip first_pass_accept_rate (requires manual approval, not applicable)
  // Only block on real operational failures

  // fail_rate from view is 0-100 scale (percentage)
  const failRateViolation = (kpis.fail_rate_openai || 0) > 40
    && (kpis.fail_rate_gemini || 0) > 40;

  // Both providers must be slow (at least one healthy = proceed)
  const latencyViolation = (kpis.avg_latency_openai || 0) > 60000
    && (kpis.avg_latency_gemini || 0) > 60000;

  const stuckViolation = (stuckCount || 0) > 0;

  if (failRateViolation || latencyViolation || stuckViolation) {
    console.warn(`[bridge:C12.1_SLO] VIOLATION: failRate=${failRateViolation}, latency=${latencyViolation}, stuck=${stuckViolation}`);
    return new Response(JSON.stringify({
      ok: false,
      reason: "SLO_VIOLATION",
      details: {
        fail_rate_openai: kpis.fail_rate_openai,
        fail_rate_gemini: kpis.fail_rate_gemini,
        avg_latency_openai: kpis.avg_latency_openai,
        avg_latency_gemini: kpis.avg_latency_gemini,
        stuck_jobs: stuckCount,
      },
    }), {
      status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}
```

### Mudancas em relacao ao plano anterior

| Aspecto | Plano anterior (errado) | Correcao |
|---------|------------------------|----------|
| `first_pass_accept_rate` | Removido (correto) | Mantido removido |
| `fail_rate threshold` | `> 0.4` (bloquearia a 0.4%) | `> 40` (bloqueia a 40%) |
| Latencia AND | Ambos > 60s (correto) | Sem alteracao |
| Stuck jobs | `> 0` (correto) | Sem alteracao |

### Nota sobre inconsistencia de escalas no sistema

O endpoint `image-lab-health` calcula fail_rate in-code na escala 0-1 (`failed/total`). A view `image_lab_kpis_last_7d` usa escala 0-100 (`* 100`). Isso nao precisa ser corrigido agora mas deve ser documentado para evitar erros futuros.

---

## Sequencia de execucao

1. Editar linhas 349-369 de `image-lab-pipeline-bridge/index.ts`
2. Deploy da edge function
3. Reprocessar o run `dee5182e` (ou novo processamento) para validar que a bridge agora tenta gerar imagens
4. Confirmar `scenesResolved > 0` no bridgeReport

## Impacto

- Nenhuma alteracao no contrato C12.1 de retry/circuit breaker
- Nenhuma alteracao no player ou renderer
- Nenhuma alteracao na view do banco
- Apenas a logica de decisao de bloqueio da bridge muda

