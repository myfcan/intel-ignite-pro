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

## C02 Audit Implementation (2026-02-03)

### New Function: `selectAnchorOccurrence()`

```typescript
type AnchorStrategy = 'FIRST_IN_RANGE' | 'LAST_IN_RANGE' | 'CLOSEST_TO_TARGET';

function selectAnchorOccurrence(
  keyword: string,
  wordTimestamps: WordTimestamp[],
  afterTime: number,
  beforeTime: number,
  strategy: AnchorStrategy = 'FIRST_IN_RANGE',
  targetTime?: number
): AnchorSelectionResult {
  // Returns: selectedTime, matchedCount, selectedIndex, selectedWord, strategyUsed, allMatches
}
```

### C02 Changes Applied

| Change | Before | After |
|--------|--------|-------|
| pauseAt selection | `findKeywordTime` (FIRST) | `selectAnchorOccurrence(LAST_IN_RANGE)` |
| Fallback 80% | Used when keyword not found | **REMOVED** - returns NULL |
| Multi-match logging | None | `matchedCount`, `strategyUsed` in logs |
| Strategy in audit | Not tracked | `strategyUsed` in `diff_summary` |

### Multi-match Case Verified

| Keyword | Phase | Occurrences | Strategy | Selected |
|---------|-------|-------------|----------|----------|
| brinquedo | cena-1-impacto | 2 (6.722s, 12.121s) | FIRST | 7.709s |

---

## C02 Reprocess Mode (2026-02-03)

### New: `reprocess_preserve_structure: true`

When `reprocess_preserve_structure: true` is passed in the payload:
1. Pipeline reads `phases` from existing `content` in database
2. Uses `recalculateAnchorKeywordTimes()` to update ONLY `keywordTime` values
3. Preserves ALL structure (phase IDs, anchor IDs, types, targetIds, etc.)
4. Guarantees `structureHashMatch: true` in audit

### Request Payload for C02

```json
{
  "reprocess": true,
  "reprocess_preserve_structure": true,
  "existing_lesson_id": "19f7e1df-6fb8-435f-ad51-cc44ac67618d",
  "run_id": "uuid-from-client",
  "title": "O Fim da Brincadeira com IA",
  "scenes": []  // Required but ignored when preserve_structure=true
}
```

### C02 Audit Additions

| Field | Description |
|-------|-------------|
| `c02Mode` | `true` if preserve_structure was used |
| `c02Stats.t1` | Anchors out of range (should be 0) |
| `c02Stats.t2` | Anchors with null keywordTime (missing keyword) |
| `c02Stats.totalAnchors` | Total anchors recalculated |
| `c02MultiMatchReport` | Top 10 multi-match cases with strategy used |

### C02 Success Criteria

- `structureHashMatch: true`
- `c02Stats.t1 = 0`
- `anchorsOnlyInOld = 0`
- `anchorsOnlyInNew = 0`

---

## C03 Phase Timing Correction (2026-02-03)

### Problem Statement

Lessons can have phases with invalid durations:
- **T3_NEGATIVE**: `endTime < startTime` (duration < 0)
- **T3_ZERO**: `endTime = startTime` (duration = 0)
- **T3_MICRO**: Interactive phases with `duration < 5.0s`

Example from lesson `19f7e1df`:
```
cena-10-playground: startTime=90.089s, endTime=86.737s, duration=-3.35s ❌
```

### C03 Rules

#### R1: Duration Must Be Positive
```
phase.endTime > phase.startTime (always)
```

#### R2: Interactive Minimum Duration
```
if (phase.type in ['interaction', 'playground', 'quiz', 'secret-reveal']) {
  duration >= 5.0s (MANDATORY)
}
```

#### R3: No Overlap Between Phases
```
Phase[N].endTime <= Phase[N+1].startTime
```

#### R4: Last Phase Ends at Audio Duration
```
phases[last].endTime = totalAudioDuration
```

### C03 Fix Algorithm

```typescript
function recalculatePhaseTimings(phases, totalAudioDuration) {
  // 1. Sort phases by startTime
  // 2. For each phase:
  //    - Fix overlap with previous (adjust startTime)
  //    - Fix negative/zero duration (extend endTime)
  //    - Fix micro duration for interactive (extend to 5s)
  //    - Cap endTime to next phase's startTime
  // 3. Set last phase endTime = totalAudioDuration
}
```

### C03 Metrics (diff_summary)

| Field | Description |
|-------|-------------|
| `c03Stats.t3NegativeBefore` | Phases with negative duration (BEFORE) |
| `c03Stats.t3ZeroBefore` | Phases with zero duration (BEFORE) |
| `c03Stats.t3MicroBefore` | Interactive phases < 5s (BEFORE) |
| `c03Stats.t3Fixed` | Total phases corrected |
| `c03Stats.t3NegativeAfter` | Should be 0 |
| `c03Stats.t3ZeroAfter` | Should be 0 |
| `c03Stats.phaseTimingChanges` | Top 10 phase changes with fix type |

### C03 Success Criteria

```
C03 DONE = (
  c03Stats.t3NegativeAfter = 0 AND
  c03Stats.t3ZeroAfter = 0 AND
  ALL phases: endTime > startTime AND
  ALL interactive phases: duration >= 5.0s
)
```

---

## Versão e Data

- **Versão:** v2.3 (C03 Phase Timing Correction Complete)
- **Data:** 2026-02-03
- **Status:** C01 ✅, C02 ✅, C03 ✅
- **Functions:** selectAnchorOccurrence, recalculateAnchorKeywordTimes, recalculatePhaseTimings
