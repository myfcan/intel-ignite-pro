
# Diagnóstico Sistêmico Completo — Pipeline V7-vv

## O Que a Screenshot Confirma

O dashboard está funcional. O usuário (Fernando Canuto, 26 aulas completas, Power 1100, Nv2) está usando o sistema ativamente. O problema não é o dashboard — é a arquitetura interna do pipeline que ainda tem rachaduras que vão travar a produção em escala.

---

## Os 4 Problemas Sistêmicos Reais (Verificados no Código)

### PROBLEMA 1 — Divergência Estrutural: Dois Pipelines em Paralelo

O sistema tem **duas implementações independentes** do mesmo pipeline:

```text
PIPELINE A (Frontend)          PIPELINE B (Edge Function)
src/lib/lessonPipeline/        supabase/functions/v7-vv/
  step1-validate.ts              validateInput()
  step2-build-narration.ts       buildNarration()
  step3-generate-audio.ts        generateAudio()
  step4-calculate-anchors.ts     calculateAnchors()
  step5-build-content.ts         buildContent()
```

Os dois pipelines têm lógicas **diferentes** e podem produzir outputs **diferentes**. A Edge Function `v7-vv` tem 8019 linhas — é o pipeline **real** que é executado. O pipeline do frontend (`src/lib/lessonPipeline/`) é chamado de onde? Verificando os contratos entre eles, há divergências concretas:

- `V7AnchorAction.timestamp` (frontend) vs `AnchorAction.keywordTime` (edge function) — campo diferente para o mesmo dado
- `actionType: 'show-visual'` (frontend) vs `type: 'show'` (edge function) — enum diferente
- O `step4` do frontend injeta `triggerTime` diretamente no `microVisual` — a edge function usa `anchorActions type='show'`

**Impacto**: O player `V7PhasePlayer.tsx` foi escrito para consumir o output da Edge Function (banco). Se alguém chamar o pipeline do frontend diretamente, o output vai ser incompatível com o que o player espera.

### PROBLEMA 2 — Ruptura de Contrato: C06 vs `anchorActions` do Frontend

A Edge Function implementa **C06 (Single Trigger Contract)**:
- `microVisuals` chegam ao banco **sem** `triggerTime`
- `triggerTime` vive **exclusivamente** em `anchorActions[type='show'].keywordTime`
- O player lê `showActionsByTargetId[mv.id]` (Camada 1)

O pipeline do frontend `step4-calculate-anchors.ts` (linhas 167-170) faz o **oposto**:
- Injeta `microVisual.triggerTime = mvTimestamp` diretamente no objeto
- Cria `anchorAction` com `actionType: 'show-visual'` (não `type: 'show'`)

O `resolvedMicroVisuals` no player (linha 496) busca `aa.type === 'show'` — nunca vai encontrar `aa.actionType === 'show-visual'`. A Camada 1 (C06) **sempre falha** para aulas processadas pelo pipeline frontend.

### PROBLEMA 3 — ScriptScene Interface Desatualizada na Edge Function

A `ScriptScene` interface na Edge Function (linhas 1566-1621) aceita `anchorActions` como:
```typescript
anchorActions?: Array<{
  id: string;
  keyword: string;  // ← mas o JSON do usuário usa "MARCO1", "MARCO2"
  type: string;
  targetId?: string;
  payload?: Record<string, unknown>;
}>
```

Mas o user's JSON usa:
```json
{ "id": "trigger-frame-1", "type": "trigger", "keyword": "MARCO1", "payload": { "frameIndex": 1 } }
```

Isso parece compatível — mas o `findKeywordTimestamp` normaliza com `normalizeWord()` que remove maiúsculas. Palavras 100% maiúsculas como "MARCO1", "VISÃO", "RENDA" **têm alta chance de não serem encontradas** por match insensível, porque o ElevenLabs pode narrá-las com entonação diferente ou como texto corrido.

### PROBLEMA 4 — Auto-Enriquecimento Silencioso Sem Gate de Auditoria

A Edge Function tem `enrichMicroVisualsFromNarration()` (linhas 2797-2999) que injeta `stat` e `step` microVisuals automaticamente. É **NON-BREAKING** — erros são capturados e ignorados. Mas:

- Os microVisuals auto-injetados recebem `id` como `undefined` (não são gerados IDs únicos)
- O `step4 calculateAnchors` tenta resolver `anchor-visual-${microVisual.id}` com `id` undefined → gera `anchor-visual-undefined`
- Duplicatas de `anchor-visual-undefined` não são detectadas
- O Dry-Run **não valida** os microVisuals auto-injetados (ocorrem depois do Dry-Run)

---

## A Raiz Comum dos 4 Problemas

Todos os problemas têm a mesma causa: **falta de um contrato único e verificável entre pipeline e renderer**.

O objetivo mestre (criar aulas com qualidade e perfeição em escala) exige que:
1. Exista **UM único pipeline** como fonte de verdade
2. O output do pipeline seja **verificável automaticamente** antes de chegar ao renderer
3. Os contratos C01-C15 sejam **enforced com testes reais**, não só documentados

---

## Plano de Ação: 5 Fixes Sistêmicos

### Fix 1 — Unificar os Contratos entre Frontend Pipeline e Edge Function

**Arquivo**: `src/lib/lessonPipeline/v7/types.ts`

Mudar `actionType: 'show-visual'` para `type: 'show'` para paridade com a Edge Function. O campo `timestamp` deve ser aliased como `keywordTime` para que o player encontre na Camada 1.

```typescript
// ANTES (quebrado)
export interface V7AnchorAction {
  actionType: 'pause' | 'transition' | 'show-visual' | 'trigger-interaction';
  timestamp: number;
}

// DEPOIS (alinhado com Edge Function)
export interface V7AnchorAction {
  type: 'pause' | 'show' | 'transition' | 'trigger';
  keywordTime: number;
  keyword: string;   // adicionar campo keyword
  targetId?: string; // adicionar campo targetId
}
```

### Fix 2 — Corrigir step4 para Gerar Anchors Compatíveis com C06

**Arquivo**: `src/lib/lessonPipeline/v7/steps/step4-calculate-anchors.ts`

O `mvAction` gerado pelo step4 usa `actionType: 'show-visual'` — trocar para `type: 'show'` e `keywordTime` para alinhar com o que o player lê na Camada 1.

```typescript
// ANTES (incompatível com player Camada 1)
const mvAction: V7AnchorAction = {
  id: `anchor-visual-${microVisual.id}`,
  anchorText: microVisual.anchorText,
  actionType: 'show-visual',  // ← player não lê isso
  timestamp: mvTimestamp,     // ← player não lê isso
  payload: { ... }
};

// DEPOIS (compatível com C06 do player)
const mvAction: V7AnchorAction = {
  id: `anchor-visual-${microVisual.id}`,
  keyword: microVisual.anchorText,  // ← player lê aa.keyword
  type: 'show',                     // ← player filtra aa.type === 'show'
  keywordTime: mvTimestamp,         // ← player lê aa.keywordTime
  targetId: microVisual.id,         // ← player busca showActionsByTargetId[mv.id]
};
```

### Fix 3 — Adicionar ID Automático nos microVisuals Auto-Injetados

**Arquivo**: `supabase/functions/v7-vv/index.ts` (função `enrichMicroVisualsFromNarration`)

Os `toInject` items não recebem `id`. Adicionar geração de ID determinístico.

```typescript
// ANTES (id ausente → anchor-visual-undefined)
toInject.push({
  type: 'step',
  anchorText: extracted.anchorWord,
  duration: 3.5,
  ...
});

// DEPOIS (id único garantido)
toInject.push({
  id: `auto-${sceneType}-step-${extracted.stepNumber}-${Date.now()}`,
  type: 'step',
  anchorText: extracted.anchorWord,
  duration: 3.5,
  ...
});
```

### Fix 4 — Gate de Validação no Step4: MicroVisual sem triggerTime = Erro

**Arquivo**: `src/lib/lessonPipeline/v7/steps/step4-calculate-anchors.ts`

Se um microVisual usar o fallback `triggerTime = sceneStartTime`, ele vai aparecer no início da fase — timing errado. Transformar em warning explícito que aparece nos logs e é registrado no debug report.

```typescript
// DEPOIS DA RESOLUÇÃO: checar e logar como issue rastreável
if (mvTimestamp === null) {
  await logger.warn(4, 'Calculate Anchors',
    `   ⚠️ [GATE] MicroVisual "${microVisual.id}" (anchorText="${microVisual.anchorText}") ` +
    `NÃO ENCONTRADO na narração → triggerTime = sceneStart (${sceneStartTime.toFixed(2)}s). ` +
    `Isso vai aparecer no início da fase, não ancorado à fala.`
  );
}
```

### Fix 5 — Adicionar Validação de `anchorText` no `enrichMicroVisualsFromNarration`

**Arquivo**: `supabase/functions/v7-vv/index.ts`

Os microVisuals auto-injetados usam `anchorWord` como `anchorText`. Mas `anchorWord` pode ser um número (ex: `50000`), que nunca vai ser encontrado no `wordTimestamps` porque o ElevenLabs narra "cinquenta mil". Adicionar lookup reverso: se `anchorWord` é numérico, converter para palavra narrada.

---

## Sequência de Implementação

| Ordem | Arquivo | Fix |
|-------|---------|-----|
| 1 | `src/lib/lessonPipeline/v7/types.ts` | Fix 1: Unificar contrato V7AnchorAction |
| 2 | `src/lib/lessonPipeline/v7/steps/step4-calculate-anchors.ts` | Fix 2: type='show' + keywordTime + targetId |
| 3 | `src/lib/lessonPipeline/v7/steps/step4-calculate-anchors.ts` | Fix 4: Gate de validação no fallback |
| 4 | `supabase/functions/v7-vv/index.ts` | Fix 3: IDs nos auto-injetados |
| 5 | `supabase/functions/v7-vv/index.ts` | Fix 5: Validar anchorWord numérico |

---

## O Que Isso Entrega ao Sistema

Após estes fixes, o pipeline vai:

1. **Produzir output idêntico** independente de ser executado via frontend ou via Edge Function
2. **Garantir que todo microVisual** chegue ao player com `triggerTime` resolvido via C06 (Camada 1)
3. **Nunca gerar `anchor-visual-undefined`** no banco
4. **Logar claramente** quando um anchorText não é encontrado — sem silêncio
5. **Rejeitar anchorWords numéricos** auto-injetados que nunca vão resolver no TTS

Resultado: toda aula gerada pelo pipeline — seja com 3 cenas ou com 30 — vai ter microVisuals aparecendo **no momento exato da fala**, sem depender de fallback runtime no player.
