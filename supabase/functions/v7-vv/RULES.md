# V7-vv Pipeline Rules (Contrato Congelado v2.0)

## R1: Range Filter (EPS Tolerance)

```
ANCHOR_EPS = 0.30s (300ms)

Match condition:
  wt.start >= (afterTime - ANCHOR_EPS) && wt.start <= beforeTime
  
Where:
  - afterTime = phase.startTime (originalStartTime)
  - beforeTime = nextPhase.startTime || totalAudioDuration (maxEndTime)
```

**Justificativa numérica:** Gaps observados no baseline forense:
- T4 (cena-5-espelho): -63ms
- Casos limítrofes: até -232ms

EPS = 0.30s cobre 100% dos casos T4 com margem de segurança.

---

## R2: Anchor Missing

Quando `occurrencesInRange = 0`:

```
RETORNAR: null
LOG: [ANCHOR-MISSING] com JSON obrigatório:
{
  "phaseId": "<phase_id>",
  "keyword": "<pauseAt_keyword>",
  "range": [startTime, maxEndTime],
  "occurrencesInRange": 0,
  "verdict": "NULL_ASSIGNED"
}
```

**PROIBIDO:** Fallback para busca global.

---

## R3: Estratégia por Tipo (Múltiplas Ocorrências)

| Contexto | Estratégia | Justificativa |
|----------|------------|---------------|
| `pauseAt` (interaction/playground) | **LAST** ocorrência no range | Pausa deve ocorrer no final da narração da fase |
| `endTime` derivado de narração | **LAST** ocorrência no range | Marcar o fim real da narração |
| `microVisuals` (type=show) | **FIRST** ocorrência no range | Trigger visual deve coincidir com primeira menção |

---

## R4: Pós-Validação

Após calcular `keywordTime`, validar:

```
if (keywordTime < (startTime - EPS) || keywordTime > endTime) {
  LOG: [ANCHOR-OUT-OF-RANGE] com JSON:
  {
    "phaseId": "<phase_id>",
    "keyword": "<keyword>",
    "keywordTime": <calculated>,
    "range": [startTime, endTime],
    "verdict": "DISCARDED"
  }
  RETORNAR: null
}
```

---

## R5: Proibições Absolutas

1. **PROIBIDO:** Fallback global (buscar keyword fora do range)
2. **PROIBIDO:** Fallback percentual (ex: 80% da duração da fase)
3. **PROIBIDO:** Default `beforeTime = totalAudioDuration` em buscas de keyword
4. **PROIBIDO:** Ignorar `null` e atribuir timestamp arbitrário

---

## Versão e Data

- **Versão:** v2.0 (Contrato Congelado)
- **Data:** 2026-02-03
- **Commit:** Pós-patches 1, 2, 3
