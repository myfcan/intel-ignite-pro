
# Plano V7-v2 — Contrato Congelado v1.0

## Resumo Executivo

Este plano implementa o **Contrato Congelado v1.0** que encerra definitivamente as discussões sobre tipos e validações do Pipeline V7-vv, renomeando-o para **V7-v2**.

---

## Provas Confirmadas no Código Atual

| Prova | Arquivo | Linha | Problema |
|-------|---------|-------|----------|
| INTERACTIVE_SCENE_TYPES global | v7-vv/index.ts | 1008 | Contém `cta` (inválido) e `secret-reveal` |
| INTERACTIVE_SCENE_TYPES local #1 | v7-vv/index.ts | 1869 | Lista duplicada com gamification |
| INTERACTIVE_SCENE_TYPES local #2 | v7-vv/index.ts | 2108 | Lista com `quiz` (não é scene.type) |
| INTERACTIVE_SCENE_TYPES local #3 | v7-vv/index.ts | 2144 | Lista duplicada |
| VALID_MICROVISUAL_TYPES | v7-vv/index.ts | 987-995 | Aceita `icon`, rejeita legados |
| V7SceneType | V7ScriptInput.ts | 18-27 | Contém `cta` como scene.type |
| phase.type persistência | v7-vv/index.ts | 1980 | Usa `scene.type` sem mapping |
| microVisual.type persistência | v7-vv/index.ts | 1944 | Não converte moderno→legado |

---

## Arquivos a Modificar

| Arquivo | Alterações |
|---------|------------|
| `supabase/functions/v7-vv/index.ts` | Todas as correções técnicas |
| `src/types/V7ScriptInput.ts` | Remover `cta` de V7SceneType |

---

## FASE 1: Unificar INTERACTIVE_SCENE_TYPES

### 1.1 Linha 1008 — Definição Global (ÚNICA)
```text
ANTES:
const INTERACTIVE_SCENE_TYPES = ['interaction', 'playground', 'secret-reveal', 'cta'];

DEPOIS:
// ============================================================================
// CENAS INTERATIVAS (ÚNICA DEFINIÇÃO - NUNCA DUPLICAR)
// ============================================================================
// Somente cenas que ESPERAM INPUT do usuário geram:
// - Auto pauseAt
// - Duração mínima de 5s
// - audioBehavior: { onStart: 'pause', onComplete: 'resume' }
const INTERACTIVE_SCENE_TYPES = ['interaction', 'playground'] as const;
```

### 1.2 Linha 1869 — Remover Lista Local
```text
ANTES:
const INTERACTIVE_SCENE_TYPES = ['interaction', 'playground', 'secret-reveal', 'cta', 'gamification'];
const isInteractiveScene = INTERACTIVE_SCENE_TYPES.includes(scene.type);

DEPOIS:
// Usar constante GLOBAL (linha 1008)
const isInteractiveScene = INTERACTIVE_SCENE_TYPES.includes(scene.type as any);
```

### 1.3 Linha 2108 — Remover Lista Local
```text
ANTES:
const INTERACTIVE_TYPES_CHECK = ['interaction', 'playground', 'quiz', 'secret-reveal', 'cta', 'gamification'];

DEPOIS:
// Usar constante GLOBAL
const INTERACTIVE_TYPES_CHECK = INTERACTIVE_SCENE_TYPES;
```

### 1.4 Linha 2144 — Remover Lista Local
```text
ANTES:
const INTERACTIVE_TYPES = ['interaction', 'playground', 'quiz', 'secret-reveal', 'cta', 'gamification'];

DEPOIS:
// Usar constante GLOBAL
if (INTERACTIVE_SCENE_TYPES.includes(currPhase.type as any)) {
```

---

## FASE 2: Remover `cta` de V7SceneType

### 2.1 src/types/V7ScriptInput.ts (linhas 18-27)
```text
ANTES:
export type V7SceneType = 
  | 'dramatic' | 'narrative' | 'comparison' | 'interaction' 
  | 'playground' | 'revelation' | 'secret-reveal' | 'cta' | 'gamification';

DEPOIS:
/**
 * Tipos de cena suportados no INPUT do Pipeline V7-v2
 * 
 * IMPORTANTE: 'cta' é visual.type, NÃO scene.type
 * Para criar CTA: use scene.type="narrative" + visual.type="cta"
 */
export type V7SceneType = 
  | 'dramatic'      // Número/estatística impactante
  | 'narrative'     // Texto narrativo com items
  | 'comparison'    // Split-screen lado a lado
  | 'interaction'   // Quiz de múltipla escolha
  | 'playground'    // Comparação prompt amador vs pro
  | 'revelation'    // Revelação letra por letra (PERFEITO)
  | 'secret-reveal' // Revelação com áudio próprio
  | 'gamification'; // Resultado final com métricas
```

### 2.2 Rejeitar scene.type='cta' no Pipeline

**Adicionar após linha 1045 (depois de `const sceneId = ...`):**
```typescript
// ============================================================================
// 2.0 REJEITAR scene.type='cta' (É visual.type, NÃO scene.type)
// ============================================================================
if (scene.type === 'cta') {
  errors.push({
    scene: sceneId,
    field: 'type',
    message: '"cta" é visual.type, não scene.type. Use scene.type="narrative" com visual.type="cta".',
    severity: 'error'
  });
}
```

---

## FASE 3: Corrigir microVisual.type

### 3.1 Substituir linhas 987-1003
```text
ANTES:
const VALID_MICROVISUAL_TYPES = [
  'icon', 'text', 'number', 'image', 'badge', 'highlight', 'letter-reveal'
] as const;

const INVALID_MICROVISUAL_TYPES_MAP: Record<string, string> = {
  'image-flash': 'image',
  'text-pop': 'text',
  'number-count': 'number',
  'card-reveal': 'Use visual.type="cards-reveal"...',
  'text-highlight': 'highlight'
};

DEPOIS:
// ============================================================================
// TIPOS DE MICROVISUAL — CONTRATO CONGELADO v1.0
// ============================================================================
// INPUT: aceita modernos + legados
// OUTPUT: SEMPRE legado (banco/renderer são canônicos)
const VALID_MICROVISUAL_TYPES = [
  // Modernos (aliases - serão convertidos antes de salvar)
  'text', 'number', 'image', 'badge', 'highlight', 'letter-reveal',
  // Legados (canônicos - passam direto)
  'image-flash', 'text-pop', 'number-count', 'text-highlight', 'card-reveal'
] as const;

// Mapping OBRIGATÓRIO: moderno → legado (nunca persistir moderno)
const MODERN_TO_LEGACY_MAP: Record<string, string> = {
  'image': 'image-flash',
  'text': 'text-pop',
  'number': 'number-count',
  'badge': 'card-reveal',
  // Passthrough (já são canônicos)
  'highlight': 'highlight',
  'letter-reveal': 'letter-reveal',
  'image-flash': 'image-flash',
  'text-pop': 'text-pop',
  'number-count': 'number-count',
  'text-highlight': 'text-highlight',
  'card-reveal': 'card-reveal'
};

// Tipos REJEITADOS (sem equivalente no renderer)
const INVALID_MICROVISUAL_TYPES_MAP: Record<string, string> = {
  'icon': 'Tipo "icon" não é suportado. Use "image" (imageUrl/emoji) ou "badge" (text/icon).'
};

// Warnings para legados no input (UX - não bloqueia)
const LEGACY_TYPE_WARNINGS: Record<string, string> = {
  'image-flash': 'Prefira usar "image" no input',
  'text-pop': 'Prefira usar "text" no input',
  'number-count': 'Prefira usar "number" no input',
  'card-reveal': 'Prefira usar "badge" no input',
  'text-highlight': 'Prefira usar "highlight" no input'
};
```

---

## FASE 4: Constantes de Visual + Schema

### 4.1 Adicionar após LEGACY_TYPE_WARNINGS
```typescript
// ============================================================================
// TIPOS DE VISUAL — CONTRATO CONGELADO v1.0
// ============================================================================
const VALID_VISUAL_TYPES = [
  'number-reveal', 'text-reveal', 'split-screen', 'letter-reveal',
  'cards-reveal', 'quiz', 'quiz-feedback', 'playground', 'result', 'cta',
  '3d-dual-monitors', '3d-abstract', '3d-number-reveal'
] as const;

// Schema mínimo por visual.type
const VISUAL_CONTENT_SCHEMA: Record<string, { required: string[], optional: string[] }> = {
  'number-reveal': { required: ['number'], optional: ['secondaryNumber', 'subtitle', 'hookQuestion', 'mood', 'countUp'] },
  'text-reveal': { required: [], optional: ['title', 'mainText', 'items', 'highlightWord'] },
  'split-screen': { required: ['left', 'right'], optional: [] },
  'letter-reveal': { required: ['letters'], optional: ['word', 'finalStamp'] },
  'cards-reveal': { required: ['cards'], optional: ['title'] },
  'quiz': { required: [], optional: ['question', 'subtitle'] },
  'quiz-feedback': { required: [], optional: ['title', 'subtitle'] },
  'playground': { required: [], optional: ['title', 'subtitle'] },
  'result': { required: ['title'], optional: ['emoji', 'message', 'metrics'] },
  'cta': { required: ['buttonText'], optional: ['title', 'subtitle'] },
  '3d-dual-monitors': { required: ['leftScreen', 'rightScreen'], optional: [] },
  '3d-abstract': { required: [], optional: ['variant', 'intensity'] },
  '3d-number-reveal': { required: ['number'], optional: ['subtitle'] }
};

// ============================================================================
// MAPEAMENTO scene.type → phase.type PERSISTIDO
// ============================================================================
// secret-reveal e gamification NÃO existem no banco — mapear para tipos válidos
const SCENE_TO_PHASE_MAP: Record<string, string> = {
  'secret-reveal': 'revelation',  // Semanticamente similar
  'gamification': 'narrative',    // Resultado é narrativo
};
```

---

## FASE 5: Validação Visual (Ordem Imutável)

### 5.1 Substituir bloco de validação visual (após linha 1057)
```typescript
// 2.2 Visual obrigatório
if (!scene.visual) {
  errors.push({
    scene: sceneId,
    field: 'visual',
    message: `Cena "${sceneId}" não tem configuração visual.`,
    severity: 'error'
  });
}

// =========================================================================
// 2.2b VALIDAÇÃO DE VISUAL — ORDEM IMUTÁVEL (CONTRATO CONGELADO v1.0)
// =========================================================================
if (scene.visual?.type) {
  const vType = scene.visual.type;
  const content = scene.visual.content;

  // PASSO 1: visual.type válido
  if (!VALID_VISUAL_TYPES.includes(vType as any)) {
    errors.push({
      scene: sceneId,
      field: 'visual.type',
      message: `visual.type "${vType}" inválido. Tipos válidos: ${VALID_VISUAL_TYPES.join(', ')}`,
      severity: 'error'
    });
  } else {
    // PASSO 2: content obrigatório se schema.required.length > 0
    const schema = VISUAL_CONTENT_SCHEMA[vType];
    if (schema?.required?.length) {
      if (!content || typeof content !== 'object') {
        errors.push({
          scene: sceneId,
          field: 'visual.content',
          message: `visual.type "${vType}" requer "content" definido`,
          severity: 'error'
        });
      } else {
        // PASSO 3: validar cada campo required
        for (const field of schema.required) {
          if (!(field in content) || content[field] === undefined || content[field] === null) {
            errors.push({
              scene: sceneId,
              field: `visual.content.${field}`,
              message: `visual.type "${vType}" requer campo "${field}" em content`,
              severity: 'error'
            });
          }
        }
      }
    }

    // PASSO 4: validação profunda por tipo
    if (content) {
      // text-reveal: title OU mainText obrigatório
      if (vType === 'text-reveal') {
        if (!content.title && !content.mainText) {
          errors.push({
            scene: sceneId,
            field: 'visual.content',
            message: 'visual.type "text-reveal" requer "title" OU "mainText" em content',
            severity: 'error'
          });
        }
      }

      // split-screen: estrutura completa
      if (vType === 'split-screen') {
        if (!content.left || typeof content.left !== 'object') {
          errors.push({ scene: sceneId, field: 'visual.content.left', message: '"split-screen" requer objeto "left"', severity: 'error' });
        } else {
          if (!content.left.label) errors.push({ scene: sceneId, field: 'visual.content.left.label', message: '"split-screen" requer "left.label"', severity: 'error' });
          if (!Array.isArray(content.left.items) || content.left.items.length === 0) errors.push({ scene: sceneId, field: 'visual.content.left.items', message: '"split-screen" requer "left.items[]" não vazio', severity: 'error' });
        }
        if (!content.right || typeof content.right !== 'object') {
          errors.push({ scene: sceneId, field: 'visual.content.right', message: '"split-screen" requer objeto "right"', severity: 'error' });
        } else {
          if (!content.right.label) errors.push({ scene: sceneId, field: 'visual.content.right.label', message: '"split-screen" requer "right.label"', severity: 'error' });
          if (!Array.isArray(content.right.items) || content.right.items.length === 0) errors.push({ scene: sceneId, field: 'visual.content.right.items', message: '"split-screen" requer "right.items[]" não vazio', severity: 'error' });
        }
      }

      // cards-reveal: cards[] com id e text
      if (vType === 'cards-reveal') {
        const cards = content.cards;
        if (!Array.isArray(cards) || cards.length === 0) {
          errors.push({ scene: sceneId, field: 'visual.content.cards', message: '"cards-reveal" requer "cards[]" não vazio', severity: 'error' });
        } else {
          cards.forEach((card: any, i: number) => {
            if (!card?.id) errors.push({ scene: sceneId, field: `visual.content.cards[${i}].id`, message: 'card.id é obrigatório', severity: 'error' });
            if (!card?.text) errors.push({ scene: sceneId, field: `visual.content.cards[${i}].text`, message: 'card.text é obrigatório', severity: 'error' });
          });
        }
      }

      // letter-reveal: letters[] com letter e meaning
      if (vType === 'letter-reveal') {
        const letters = content.letters;
        if (!Array.isArray(letters) || letters.length === 0) {
          errors.push({ scene: sceneId, field: 'visual.content.letters', message: '"letter-reveal" requer "letters[]" não vazio', severity: 'error' });
        } else {
          letters.forEach((item: any, i: number) => {
            if (!item?.letter) errors.push({ scene: sceneId, field: `visual.content.letters[${i}].letter`, message: 'letters[].letter é obrigatório', severity: 'error' });
            if (!item?.meaning) errors.push({ scene: sceneId, field: `visual.content.letters[${i}].meaning`, message: 'letters[].meaning é obrigatório', severity: 'error' });
          });
        }
      }

      // cta: buttonText string não vazia
      if (vType === 'cta') {
        if (!content.buttonText || typeof content.buttonText !== 'string' || !content.buttonText.trim()) {
          errors.push({ scene: sceneId, field: 'visual.content.buttonText', message: '"cta" requer "buttonText" string não vazia', severity: 'error' });
        }
      }

      // 3d-dual-monitors: leftScreen e rightScreen
      if (vType === '3d-dual-monitors') {
        if (!content.leftScreen) errors.push({ scene: sceneId, field: 'visual.content.leftScreen', message: '"3d-dual-monitors" requer "leftScreen"', severity: 'error' });
        if (!content.rightScreen) errors.push({ scene: sceneId, field: 'visual.content.rightScreen', message: '"3d-dual-monitors" requer "rightScreen"', severity: 'error' });
      }
    }
  }
}
```

---

## FASE 6: Mapeamento scene.type → phase.type

### 6.1 Alterar linha 1980 (construção de phase)
```text
ANTES:
type: scene.type,

DEPOIS:
// Mapear scene.type para phase.type persistível (CONTRATO CONGELADO v1.0)
// secret-reveal e gamification NÃO existem no banco
type: SCENE_TO_PHASE_MAP[scene.type] || scene.type,
```

---

## FASE 7: Converter microVisual.type + Fallbacks Seguros

### 7.1 Alterar linhas 1942-1949 (processamento de microVisuals)
```text
ANTES:
microVisuals.push({
  id: mv.id || `mv-${scene.id}-${idx}`,
  type: mv.type,
  anchorText: mv.anchorText,
  triggerTime: triggerTime ?? (startTime + (endTime - startTime) * ((idx + 1) / (scene.visual.microVisuals!.length + 1))),
  duration,
  content: mv.content,
});

DEPOIS:
// ✅ CONTRATO CONGELADO v1.0: Converter moderno → legado ANTES de salvar
const canonicalType = MODERN_TO_LEGACY_MAP[mv.type] || mv.type;

// ✅ triggerTime: NUNCA undefined (fallback determinístico)
const fallbackTriggerTime = startTime + (endTime - startTime) * ((idx + 1) / (scene.visual.microVisuals!.length + 1));
const safeTriggerTime = triggerTime ?? fallbackTriggerTime;

// ✅ duration: NUNCA undefined (fallback por tipo canônico)
const safeDuration = (mv.content as any)?.duration || getDefaultDuration(canonicalType);

microVisuals.push({
  id: mv.id || `mv-${scene.id}-${idx}`,
  type: canonicalType,  // ← TIPO CANÔNICO (legado)
  anchorText: mv.anchorText,
  triggerTime: safeTriggerTime,  // ← NUNCA undefined
  duration: safeDuration,         // ← NUNCA undefined
  content: mv.content,
});

console.log(`[MicroVisual] ${mv.id}: ${mv.type} → ${canonicalType} @ ${safeTriggerTime.toFixed(2)}s (${safeDuration}s)`);
```

---

## FASE 8: Atualizar Versão para V7-v2

### 8.1 Linha 14 (header do arquivo)
```text
ANTES:
* @version VV-Definitive + Debug

DEPOIS:
* @version V7-v2 (Contrato Congelado v1.0)
```

---

## Contrato Congelado v1.0 — Resumo Final

### phase.type (PERSISTIDO no banco)
```
comparison | dramatic | interaction | narrative | playground | revelation
```

### scene.type (INPUT permitido)
```
dramatic | narrative | comparison | interaction | playground | revelation | secret-reveal | gamification
```
**PROIBIDO:** `cta` (ERROR com orientação)
**MAPEAMENTO:** secret-reveal → revelation, gamification → narrative

### visual.type
```
number-reveal | text-reveal | split-screen | letter-reveal | cards-reveal | quiz | quiz-feedback | playground | result | cta | 3d-dual-monitors | 3d-abstract | 3d-number-reveal
```

### microVisual.type
```
INPUT aceito: text | number | image | badge | highlight | letter-reveal | image-flash | text-pop | number-count | text-highlight | card-reveal
REJEITADO: icon (ERROR)
PERSISTIDO: SEMPRE legado (image-flash, text-pop, etc.)
```

### INTERACTIVE_SCENE_TYPES
```
interaction | playground
```

---

## Testes de Prova (Gate de Deploy)

| # | Teste | Resultado Esperado |
|---|-------|-------------------|
| 1 | scene.type="cta" | ERROR: "cta é visual.type, não scene.type" |
| 2 | visual.type="cta" + buttonText | PASS |
| 3 | text-reveal sem title/mainText | ERROR: requer title OU mainText |
| 4 | number-reveal sem content | ERROR: requer content definido |
| 5 | cards-reveal com card sem id | ERROR: card.id é obrigatório |
| 6 | microVisual.type="icon" | ERROR: icon não é suportado |
| 7 | microVisual.type="image" | PASS + salva como "image-flash" |
| 8 | scene.type="secret-reveal" | PASS + salva phase.type="revelation" |

---

## Ordem de Execução

1. `src/types/V7ScriptInput.ts`: Remover `cta` de V7SceneType
2. `v7-vv/index.ts` linha 1008: INTERACTIVE_SCENE_TYPES global única
3. `v7-vv/index.ts` linha 1869: Remover lista local
4. `v7-vv/index.ts` linha 2108: Remover lista local
5. `v7-vv/index.ts` linha 2144: Remover lista local
6. `v7-vv/index.ts` após linha 1045: Rejeitar scene.type='cta'
7. `v7-vv/index.ts` linhas 987-1003: Novas constantes de microVisual
8. `v7-vv/index.ts`: Adicionar VALID_VISUAL_TYPES + VISUAL_CONTENT_SCHEMA + SCENE_TO_PHASE_MAP
9. `v7-vv/index.ts` após linha 1057: Validação visual completa
10. `v7-vv/index.ts` linha 1980: Usar SCENE_TO_PHASE_MAP
11. `v7-vv/index.ts` linhas 1942-1949: Conversão + fallbacks seguros
12. `v7-vv/index.ts` linha 14: Atualizar versão para V7-v2
13. Deploy: `supabase--deploy_edge_functions(["v7-vv"])`
14. Executar 8 testes de prova via dry-run
15. Verificar no banco que não existe microVisual moderno persistido
