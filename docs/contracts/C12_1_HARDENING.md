# C12.1 — Hardening de Confiabilidade + Image Sequence

**Status**: ACTIVE  
**Version**: 1.0  
**Created**: 2026-02-18  
**Depends on**: C12_IMAGE_LAB_GEN_v0.1

---

## Invariantes Obrigatórios

### C12.1_RETRY_POLICY
- **Regra**: Máximo 3 attempts por job
- **Fluxo**: Attempt 1 (original) → Attempt 2 (retry same provider) → Attempt 3 (fallback other provider)
- **Error code**: `MAX_ATTEMPTS_EXCEEDED` (HTTP 429)
- **Invariante**: Nenhum job pode ter `count(image_attempts) > 3`

### C12.1_CIRCUIT_BREAKER
- **Tabela**: `image_lab_circuit_state`
- **Estados**: `CLOSED` → `OPEN` → `HALF_OPEN` → `CLOSED`
- **Trigger OPEN**: `fail_count / total_count > 0.4` em janela de 20 attempts
- **Cooldown**: 10 minutos
- **HALF_OPEN**: 1 request teste. Sucesso → CLOSED. Falha → OPEN novamente.

### C12.1_NO_STUCK_JOBS
- **Regra**: Nenhum job pode permanecer `processing > 120s`
- **Implementação**: `cleanup_stale_image_attempts()` via pg_cron cada 5min
- **Thresholds**: processing > 2min, queued > 10min

### C12.1_SLO_GUARD
- **Regra**: Pipeline bridge só gera imagens se:
  - `first_pass_accept_rate >= 75%`
  - `avg_latency < 60s` (pelo menos um provider)
  - `stuck_jobs = 0`
- **Violation response**: HTTP 503, `{ reason: "SLO_VIOLATION" }`

### C12.1_CACHE_GUARD
- **Regra**: Mesmo hash → reutilizar asset existente
- **Invariante**: `cache_hit=true` não cria novos attempts

### C12.1_PIPELINE_IMAGE_SEQUENCE
- **Regra**: `visual.type === "image-sequence"` suporta múltiplos frames
- **Restrições**:
  - Somente `scene.type === "narrative"`
  - Máximo 3 frames por cena
  - Cada frame: `promptScene` não vazio, `durationMs >= 1000`
  - Soma total `durationMs >= 2000`
  - Não coexiste com `microVisual.type === "image"`
- **Preset padrão**: `cinematic-01`

---

## Error Codes

| Code | HTTP | Descrição |
|------|------|-----------|
| `MAX_ATTEMPTS_EXCEEDED` | 429 | Job já tem 3 attempts |
| `SLO_VIOLATION` | 503 | KPIs fora do threshold |
| `CIRCUIT_OPEN` | N/A | Provider temporariamente bloqueado (fallback automático) |

---

## Métricas na Resposta

```json
{
  "retry_count": 2,
  "fallback_used": true,
  "circuit_state": "CLOSED"
}
```

---

## Debug Logs (v7DebugLogger)

| Tag | Payload |
|-----|---------|
| `IMAGE_SEQUENCE_START` | `{ phaseId, frameCount, currentTime }` |
| `IMAGE_SEQUENCE_FRAME_RENDER` | `{ phaseId, frameId, frameIndex, currentTime }` |
| `IMAGE_SEQUENCE_END` | `{ phaseId, currentTime }` |
| `IMAGE_SEQUENCE_FALLBACK` | `{ frameIndex, storagePath, currentTime }` |

---

## Backward Compatibility

| Aspecto | Impacto |
|---------|---------|
| Cenas existentes (image-flash, icon, etc.) | ZERO |
| V7SceneType | ZERO — image-sequence é V7VisualType |
| Contratos C01–C11 | ZERO |
| C12_AUTH_GATE | Mantido |
| C12_STORAGE_PRIVACY | Mantido |
| DryRun existente | ADITIVO — novas validações, nenhuma removida |

---

## Limites da Fase 1

- Máximo 3 frames por cena
- Sem geração paralela de frames
- Apenas preset `cinematic-01` ativo
- Circuit breaker baseado em contagem simples
- `image-sequence` apenas em `scene.type="narrative"`
