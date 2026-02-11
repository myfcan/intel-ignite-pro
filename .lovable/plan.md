

# B1 FIX: Post-Validation de Anchors Show (Step 4.8)

## Root Cause Confirmado

O bug ocorre porque a sequencia de execucao no pipeline e:

1. **Step 4** (`generatePhases`, linha 6044): Calcula `triggerTime` para microVisuals usando range global
2. **Step 4.5** (`calculateWordBasedTimings`, linha 6051): Recalcula `startTime`/`endTime` das fases com base em word matching
3. **Step 4.6** (`c06NormalizeTriggerContract`, linha 6058): Cria `anchorActions` tipo `show` usando o `triggerTime` antigo (pre-boundary)
4. **Step 4.7** (`applyBoundaryFixGuard`, linha 6066): Ajusta boundaries finais

Resultado: anchors `show` com `keywordTime` calculado no Step 4 nunca sao revalidados contra os boundaries finais do Step 4.7.

Exemplo real do run `1d3a98b3`: `show-mv-c8-escuro` com `keywordTime: 73.661` mas fase comecando em `80.125`.

## Correcao Proposta

Inserir **Step 4.8: ANCHOR_BOUNDARY_REVALIDATION** apos o Step 4.7 (apos linha 6079), antes do bloco `} else {` na linha 6080.

### Codigo exato a inserir (entre linhas 6079 e 6080):

```typescript
// =========================================================================
// PASSO 4.8: ANCHOR_BOUNDARY_REVALIDATION - Filtrar anchors show fora do range
// =========================================================================
console.log('[V7-vv] Step 4.8: ANCHOR_BOUNDARY_REVALIDATION...');
const ANCHOR_REVALIDATION_EPS = 0.30; // mesma tolerancia do Step 4.5
let totalAnchorsRemoved = 0;
let totalAnchorsKept = 0;

for (const phase of phases) {
  if (!phase.anchorActions || !Array.isArray(phase.anchorActions)) continue;

  const validAnchors = [];
  for (const anchor of phase.anchorActions) {
    // Anchors que NAO sao show: manter sempre (pause, transition, etc.)
    if (anchor.type !== 'show') {
      validAnchors.push(anchor);
      continue;
    }
    // Show anchors sem keywordTime: manter (serao resolvidos pelo renderer)
    if (anchor.keywordTime == null) {
      validAnchors.push(anchor);
      continue;
    }
    // Validar: keywordTime deve estar dentro de [startTime - EPS, endTime]
    const inRange =
      anchor.keywordTime >= (phase.startTime - ANCHOR_REVALIDATION_EPS) &&
      anchor.keywordTime <= phase.endTime;

    if (inRange) {
      validAnchors.push(anchor);
      totalAnchorsKept++;
    } else {
      totalAnchorsRemoved++;
      console.warn(
        `[ANCHOR_BOUNDARY_REVALIDATION] REMOVED: "${anchor.id}" ` +
        `keywordTime=${anchor.keywordTime.toFixed(3)}s ` +
        `OUTSIDE phase "${phase.id}" [${phase.startTime.toFixed(3)}s, ${phase.endTime.toFixed(3)}s]`
      );
    }
  }
  phase.anchorActions = validAnchors;
}

console.log(
  `[V7-vv] Step 4.8: ANCHOR_BOUNDARY_REVALIDATION complete. ` +
  `Kept=${totalAnchorsKept}, Removed=${totalAnchorsRemoved}`
);
```

### Propriedades do patch

| Propriedade | Valor |
|---|---|
| Arquivo | `supabase/functions/v7-vv/index.ts` |
| Insercao | Apos linha 6079, antes de `} else {` (linha 6080) |
| Afeta pause anchors | NAO (apenas `type === 'show'`) |
| Afeta C10B | NAO |
| Afeta audit gate | NAO (roda apos persist) |
| Afeta contract_version | NAO |
| Determinisitco | SIM |
| Idempotente | SIM |

## Pos-deploy: Validacao obrigatoria

Apos deploy, executar `v7-reprocess` com o run original e entregar:

1. Novo `run_id` completo
2. Query SQL mostrando `anchorActions` de `cena-8-cta` com zero anchors `show` fora do range
3. Log da edge function mostrando `[ANCHOR_BOUNDARY_REVALIDATION] REMOVED` para os anchors invalidos

## Pipeline de execucao no fluxo final

```text
Step 4   : generatePhases()          --> triggerTime calculado (range global)
Step 4.5 : calculateWordBasedTimings --> startTime/endTime recalculados
Step 4.6 : c06NormalizeTriggerContract --> show actions criados (keywordTime = triggerTime antigo)
Step 4.7 : applyBoundaryFixGuard     --> boundaries finais ajustados
Step 4.8 : ANCHOR_BOUNDARY_REVALIDATION --> show anchors fora do range REMOVIDOS  <-- NOVO
Step 5   : Build output
```

