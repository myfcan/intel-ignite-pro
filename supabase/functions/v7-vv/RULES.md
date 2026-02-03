# V7-vv Pipeline Rules (Contrato Congelado v2.1)

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

## C01 Audit Results (2026-02-03)

### Lesson Audited: b4fc066f-19e3-49b9-8707-e572c12ac577

| Metric | Value |
|--------|-------|
| Total Anchors | 20 |
| OK (in-range) | 20 |
| T1 Failures | 0 |
| T2 NULL | 0 |
| OK Rate | 100.00% |
| T1 Fail Rate | 0.00% |

### Critical Phases Verified

| Phase | Keyword | keywordTime | Range | Status |
|-------|---------|-------------|-------|--------|
| cena-6-quiz | representa você | 52.488s | [46.56, 52.988] | ✅ OK |
| cena-7-promessa | resultado | 62.606s | [54.497, 64.433] | ✅ OK |
| cena-9-perfeito | Formato | 76.545s | [71.633, 118.129] | ✅ OK |
| cena-10-playground | teste agora | 131.854s | [123.182, 131.854] | ✅ OK |

### Comparison with Golden Standard (19f7e1df)

| Phase | TARGET (b4fc066f) | GOLDEN (19f7e1df) | Note |
|-------|-------------------|-------------------|------|
| cena-7-promessa | `resultado` @ 62.606s | `você faz` @ 63.425s | TARGET uses corrected keyword |

---

## Versão e Data

- **Versão:** v2.1 (C01 Audit Complete)
- **Data:** 2026-02-03
- **Status:** T1 = 0, T2 = 0, OK = 100%
