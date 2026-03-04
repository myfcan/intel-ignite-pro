

# AUDITORIA FORENSE — PLANO V8-C01

NÃO HÁ LOGS COM TIMESTAMP DISPONÍVEIS NESTE CONTEXTO.

---

## SUMÁRIO EXECUTIVO (8 linhas)

O plano V8-C01 tem **3 gaps CRÍTICOS**, **2 MÉDIOS** e **1 BAIXO** que impedem implementação segura. O gap mais grave é que `V8InlineExercise.tsx` (L35-95) só renderiza 4 tipos — os 4 novos tipos (`flipcard-quiz`, `scenario-selection`, `platform-match`, `timed-quiz`) cairão no `default` e mostrarão "Tipo de exercício não suportado". O segundo gap crítico é que o `INLINE_EXERCISE_TOOLS` (L142) só lista 4 tipos no enum e o `INLINE_REQUIRED_DATA_KEYS` (L576-581) rejeitará qualquer tipo novo como "Unknown". O terceiro é que existem dois pipelines paralelos (Quiz L492-555 + InlineExercise L557-621) que podem empilhar interações na mesma seção. O Coursiv tem `maxItems: 2` (L321) conflitando com o requisito de 4+ lacunas. O `sanitizeEncoding` (L18) tem bug de regex com acentos. **Veredicto: APROVAR COM AJUSTES** — os 6 gaps têm fixes concretos e isolados.

---

## TABELA DE GAPS

| ID | Severidade | Evidência | Impacto | Fix Recomendado |
|----|-----------|-----------|---------|-----------------|
| G1 | CRÍTICO | `V8InlineExercise.tsx` L35-95: switch só tem cases `true-false`, `fill-in-blanks`, `complete-sentence`, `multiple-choice` | 4 novos tipos renderizam "Tipo não suportado" — aula quebrada | Adicionar 4 cases com adaptadores de props por componente |
| G2 | CRÍTICO | `index.ts` L142: `enum: ["true-false", "multiple-choice", "complete-sentence", "fill-in-blanks"]`; L576-581: `INLINE_REQUIRED_DATA_KEYS` só tem 4 chaves | IA não gera novos tipos; se gerasse, seriam rejeitados na validação L590-603 | Expandir enum + expandir `INLINE_REQUIRED_DATA_KEYS` com schemas dos 4 novos tipos |
| G3 | CRÍTICO | `index.ts` L492-555 (quiz pipeline) + L557-621 (exercise pipeline): `sectionsNeedingInteraction` alimenta AMBOS; L560 faz `i % 2 === 0` para exercise, restante vai para quiz | Mesma seção pode receber quiz + exercise; timeline (useV8Player L70-107) empilha ambos | Unificar em 1 pipeline (`inlineExercises`), eliminar `QUIZ_TOOLS` para seções do contrato V8-C01 |
| G4 | MÉDIO | `index.ts` L320-321: `minItems: 1, maxItems: 2` no COURSIV_BUILDER_TOOLS sentences | Usuário pediu 4+ lacunas; schema limita a 2 | Alterar para `minItems: 4, maxItems: 6` |
| G5 | MÉDIO | `v8Lesson.ts` L133: `type: 'true-false' \| 'multiple-choice' \| 'complete-sentence' \| 'fill-in-blanks'` | TypeScript rejeita novos tipos em compile-time | Expandir union type com 4 novos tipos |
| G6 | BAIXO | `index.ts` L18: `(?<!\w)til(?=\s\|[.,;:!?]\|$)` — em Deno/V8 regex, `ú` pode ou não casar `\w` dependendo do flag unicode | "útil" → match "til" → "úútil" | Alterar lookbehind para `(?<![a-záéíóúâêôãõç])` |

---

## VERIFICAÇÕES OBRIGATÓRIAS

### A) Compatibilidade de Props

**V8InlineExercise.tsx L32-95** — O switch recebe `{ type, data, title, instruction }` do `exercise`.

| Componente | Props exigidas (evidência) | `exercise.data` compatível? | Adaptador necessário |
|------------|---------------------------|----------------------------|---------------------|
| `FlipCardQuizExercise` | `data: FlipCardQuizExerciseData` (L40) | SIM — `data={data}` direto | `<FlipCardQuizExercise title={title} instruction={instruction} data={data} onComplete={handleComplete} />` |
| `TimedQuizExercise` | `data: TimedQuizExerciseData` (L13) | SIM — `data={data}` direto | `<TimedQuizExercise title={title} instruction={instruction} data={data} onComplete={handleComplete} />` |
| `PlatformMatchExercise` | `scenarios: Scenario[], platforms: Platform[]` (L23-28) — **TOP-LEVEL, não em `data`** | NÃO — precisa extrair de `data` | `<PlatformMatchExercise title={title} instruction={instruction} scenarios={data.scenarios \|\| []} platforms={data.platforms \|\| []} onComplete={handleComplete} />` |
| `ScenarioSelectionExercise` | `scenarios?: Scenario[], data?: ScenarioData` (L32-37) — aceita `data` como alternativa | PARCIAL — pode passar via `data` | `<ScenarioSelectionExercise title={title} instruction={instruction} data={data} onComplete={handleComplete} />` |

**Conclusão**: PlatformMatch requer adaptador explícito. ScenarioSelection funciona com `data={data}`. FlipCard e TimedQuiz funcionam com `data={data}`.

### B) Tool Schema e Validação

**`INLINE_EXERCISE_TOOLS` L127-157**: enum em L142 = `["true-false", "multiple-choice", "complete-sentence", "fill-in-blanks"]`. Os 4 novos tipos **NÃO EXISTEM** no enum.

**`INLINE_REQUIRED_DATA_KEYS` L576-581**:
```typescript
const INLINE_REQUIRED_DATA_KEYS: Record<string, string[]> = {
  'true-false': ['statements'],
  'fill-in-blanks': ['sentences'],
  'complete-sentence': ['sentences'],
  'multiple-choice': ['statements'],
};
```
Faltam: `flipcard-quiz: ['cards']`, `scenario-selection: ['scenarios']`, `platform-match: ['scenarios', 'platforms']`, `timed-quiz: ['questions']`.

Nota: O `EXERCISE_TOOLS` (L36-71) e o `REQUIRED_DATA_KEYS` dos exercícios finais (L837-848) **JÁ TÊM** todos os 10 tipos. O gap é exclusivo do `INLINE_EXERCISE_TOOLS`.

O campo `data.description` (L147) só descreve 4 schemas. Os 4 novos tipos precisam de descriptions no mesmo campo.

### C) Arquitetura de Pipeline — Dois Caminhos Paralelos

**Caminho 1** — Quiz (L492-555):
- Input: `sectionsNeedingInteraction` (L486-488)
- Output: `generatedQuizzes` → `inlineQuizzes` (L903)
- Player: `V8QuizInline.tsx`, `V8QuizTrueFalse.tsx`, `V8QuizFillBlank.tsx`

**Caminho 2** — InlineExercise (L557-621):
- Input: `sectionsForInlineExercise = sectionsNeedingInteraction.filter((_, i) => i % 2 === 0)` (L560)
- Output: `generatedInlineExercises` → `inlineExercises` (L912)
- Player: `V8InlineExercise.tsx`

**Problema**: L560 filtra por **índice do array** (pares), não por índice de seção. Se `sectionsNeedingInteraction = [2, 3, 4, 5, 6]`, exercise vai para `[2, 4, 6]` e quiz vai para `[2, 3, 4, 5, 6]` (TODAS as seções). Resultado: seções 2, 4, 6 recebem **quiz + exercise** simultaneamente.

Timeline builder (`useV8Player.ts` L70-107) renderiza na ordem: Section → CompleteSentence → InlineExercise → Playground → Insight → Quiz. Isso **empilha** interações.

**Decisão técnica recomendada**: Para V8-C01, unificar tudo em `inlineExercises`. O contrato define 1 tipo por seção. Eliminar a geração de quiz genérico (L492-555) e rotear todos os tipos (incluindo `multiple-choice`, `true-false`, `fill-blank` que antes eram quizzes) pelo caminho `inlineExercises`. O quiz pipeline (`QUIZ_TOOLS`) fica reservado apenas para `manualQuizzes`.

**Impacto**: O player já renderiza `inline-exercise` (L81-86 de useV8Player). Remover quizzes gerados automaticamente não quebra nada — os componentes de quiz inline continuam existindo para `manualQuizzes`.

### D) Coursiv minItems/maxItems

**Código atual** (`index.ts` L319-321):
```typescript
sentences: {
  type: "array",
  minItems: 1,
  maxItems: 2,
```
**Usuário pediu**: "pelo menos 4 lacunas para preencher".

`minItems: 1, maxItems: 2` é **contradição direta** com o requisito de 4+.

**Fix**: `minItems: 4, maxItems: 6`. Também atualizar `COURSIV_SYSTEM_PROMPT` (L345): trocar "Gere 1-2 frases" por "Gere 4-6 frases".

### E) Fallback para < 9 Seções

O contrato V8-C01 mapeia seções 3-8 (indices 2-7) + playground no último. Se a aula tem 7 seções (indices 0-6):
- Indices 0-1: sem interação (OK)
- Index 2: múltipla escolha | flipcard (OK)
- Index 3: completar sentença | cenário (OK)
- Index 4: V/F (OK)
- Index 5: Coursiv (`lastIdx - 1 = 5`, guarda `lastIdx >= 4` → OK)
- Index 6: Playground (`lastIdx = 6`, OK)
- **Faltam**: platform-match (seção 6 do contrato) e timed-quiz/fill-blanks (seção 7 do contrato) — são cortados.

**Regra determinística proposta**:
1. Playground SEMPRE em `lastIdx`
2. Coursiv SEMPRE em `lastIdx - 1` (se `lastIdx >= 4`)
3. Mapear tipos de **dentro para fora**: os primeiros tipos (seções 3-5) têm prioridade; tipos das seções 6-7 são cortados primeiro
4. Se `sections.length < 5`: sem Coursiv, sem interações intermediárias. Só playground + exercícios finais.

### F) Bug sanitizeEncoding

**Código** (`index.ts` L18):
```typescript
[/(?<!\w)til(?=\s|[.,;:!?]|$)/gi, "útil"],
```

Em Deno (motor V8), o flag `u` (unicode) **não** está ativo nesta regex. Sem flag `u`, `\w` em V8 = `[a-zA-Z0-9_]`. Caracteres acentuados como `ú` **NÃO** são `\w`. Portanto `(?<!\w)` **não protege** contra "útil": o lookbehind vê `ú`, que não é `\w`, passa, casa "til", e gera "úútil".

**Fix**:
```typescript
[/(?<![a-záéíóúâêôãõçà])til(?=\s|[.,;:!?]|$)/gi, "útil"],
```

---

## PATCH PLAN

### Patch 1: Expandir `V8InlineExercise.tsx` (G1)

**Arquivo**: `src/components/lessons/v8/V8InlineExercise.tsx`

**Antes** (L6-7):
```typescript
import { FillInBlanksExercise } from "@/components/lessons/FillInBlanksExercise";
import { CompleteSentenceExercise } from "@/components/lessons/CompleteSentenceExercise";
```

**Depois**:
```typescript
import { FillInBlanksExercise } from "@/components/lessons/FillInBlanksExercise";
import { CompleteSentenceExercise } from "@/components/lessons/CompleteSentenceExercise";
import { FlipCardQuizExercise } from "@/components/lessons/FlipCardQuizExercise";
import { ScenarioSelectionExercise } from "@/components/lessons/ScenarioSelectionExercise";
import { PlatformMatchExercise } from "@/components/lessons/PlatformMatchExercise";
import { TimedQuizExercise } from "@/components/lessons/TimedQuizExercise";
```

**Antes** (L88-95, dentro do switch, antes do `default`):
```typescript
      default:
```

**Depois** (adicionar 4 cases antes do default):
```typescript
      case "flipcard-quiz":
        return (
          <FlipCardQuizExercise
            title={title}
            instruction={instruction}
            data={data}
            onComplete={handleComplete}
          />
        );

      case "scenario-selection":
        return (
          <ScenarioSelectionExercise
            title={title}
            instruction={instruction}
            data={data}
            onComplete={handleComplete}
          />
        );

      case "platform-match":
        return (
          <PlatformMatchExercise
            title={title}
            instruction={instruction}
            scenarios={data.scenarios || []}
            platforms={data.platforms || []}
            onComplete={handleComplete}
          />
        );

      case "timed-quiz":
        return (
          <TimedQuizExercise
            title={title}
            instruction={instruction}
            data={data}
            onComplete={handleComplete}
          />
        );

      default:
```

**Critério de sucesso**: Renderizar uma aula com exercício inline tipo `platform-match` sem cair no fallback "Tipo não suportado".

---

### Patch 2: Expandir type union em `v8Lesson.ts` (G5)

**Arquivo**: `src/types/v8Lesson.ts`

**Antes** (L133):
```typescript
  type: 'true-false' | 'multiple-choice' | 'complete-sentence' | 'fill-in-blanks';
```

**Depois**:
```typescript
  type: 'true-false' | 'multiple-choice' | 'complete-sentence' | 'fill-in-blanks' | 'flipcard-quiz' | 'scenario-selection' | 'platform-match' | 'timed-quiz';
```

**Critério de sucesso**: TypeScript compila sem erros.

---

### Patch 3: Expandir `INLINE_EXERCISE_TOOLS` enum + schema + validação (G2)

**Arquivo**: `supabase/functions/v8-generate-lesson-content/index.ts`

**Antes** (L142):
```typescript
type: { type: "string", enum: ["true-false", "multiple-choice", "complete-sentence", "fill-in-blanks"] },
```

**Depois**:
```typescript
type: { type: "string", enum: ["true-false", "multiple-choice", "complete-sentence", "fill-in-blanks", "flipcard-quiz", "scenario-selection", "platform-match", "timed-quiz"] },
```

**Antes** (L147):
```typescript
description: "Exercise data. true-false: { statements: [...] }. fill-in-blanks: { sentences: [...] }. complete-sentence: { sentences: [...] }. multiple-choice: { statements: [...] }.",
```

**Depois**:
```typescript
description: "Exercise data. true-false: { statements: [{ id, text, correct, explanation }], feedback }. fill-in-blanks: { sentences: [{ id, text (use _______), correctAnswers, hint }], feedback }. complete-sentence: { sentences: [{ id, text (use _______), correctAnswers, options }] }. multiple-choice: { statements: [{ id, text, correct, explanation }], feedback }. flipcard-quiz: { cards: [{ id, front: { label, color }, back: { text }, options: [{ id, text, isCorrect }], explanation }] }. scenario-selection: { scenarios: [{ id, situation, options, correctAnswer, explanation }] }. platform-match: { scenarios: [{ id, text, correctPlatform, emoji }], platforms: [{ id, name, icon, color }] }. timed-quiz: { timePerQuestion: 15, bonusPerSecondLeft: 2, timeoutPenalty: 'skip', visualTheme: 'cyber', questions: [{ id, question, options: [{ id, text, isCorrect }], explanation }] }.",
```

**Antes** (L576-581):
```typescript
const INLINE_REQUIRED_DATA_KEYS: Record<string, string[]> = {
  'true-false': ['statements'],
  'fill-in-blanks': ['sentences'],
  'complete-sentence': ['sentences'],
  'multiple-choice': ['statements'],
};
```

**Depois**:
```typescript
const INLINE_REQUIRED_DATA_KEYS: Record<string, string[]> = {
  'true-false': ['statements'],
  'fill-in-blanks': ['sentences'],
  'complete-sentence': ['sentences'],
  'multiple-choice': ['statements'],
  'flipcard-quiz': ['cards'],
  'scenario-selection': ['scenarios'],
  'platform-match': ['scenarios'],
  'timed-quiz': ['questions'],
};
```

**Critério de sucesso**: Edge function gera exercício tipo `flipcard-quiz` sem ser rejeitado pelo filtro L590-603.

---

### Patch 4: Unificar pipeline — Implementar mapa V8-C01 (G3)

**Arquivo**: `supabase/functions/v8-generate-lesson-content/index.ts`

Substituir a lógica de L486-621 (quiz + inline exercise separados) por um **mapa determinístico** que gera 1 chamada `callAI` com `INLINE_EXERCISE_TOOLS` (expandido) e prompt que especifica exatamente qual tipo gerar por seção.

O mapa V8-C01 (0-indexed):
```text
Index 0-1: nenhum
Index 2: random(['multiple-choice', 'flipcard-quiz'])
Index 3: random(['complete-sentence', 'scenario-selection'])
Index 4: 'true-false'
Index 5: 'platform-match'
Index 6: random(['timed-quiz', 'fill-in-blanks'])
Index 7 (lastIdx-1): Coursiv (já tratado separadamente)
Index 8 (lastIdx): Playground (já tratado separadamente)
```

Para aulas com < 9 seções: mapear de cima para baixo, cortando os tipos das seções mais altas (6, 5) primeiro. Coursiv em `lastIdx - 1` e Playground em `lastIdx` são sempre preservados se `lastIdx >= 4`.

**Critério de sucesso**: `sectionsNeedingInteraction` gera exatamente 1 interação por seção, sem quizzes paralelos.

---

### Patch 5: Coursiv `minItems`/`maxItems` (G4)

**Arquivo**: `supabase/functions/v8-generate-lesson-content/index.ts`

**Antes** (L320-321):
```typescript
minItems: 1,
maxItems: 2,
```

**Depois**:
```typescript
minItems: 4,
maxItems: 6,
```

**Antes** (L345):
```typescript
1. Gere 1-2 frases que representem a ESTRUTURA de um prompt profissional relacionado ao tema da aula.
```

**Depois**:
```typescript
1. Gere 4-6 frases que representem a ESTRUTURA de um prompt profissional relacionado ao tema da aula. Cada frase tem UMA lacuna.
```

**Critério de sucesso**: Coursiv gerado tem >= 4 sentences no output JSON.

---

### Patch 6: Fix `sanitizeEncoding` (G6)

**Arquivo**: `supabase/functions/v8-generate-lesson-content/index.ts`

**Antes** (L18):
```typescript
[/(?<!\w)til(?=\s|[.,;:!?]|$)/gi, "útil"],
```

**Depois**:
```typescript
[/(?<![a-záéíóúâêôãõçà])til(?=\s|[.,;:!?]|$)/gi, "útil"],
```

**Critério de sucesso**: Texto "útil" não se transforma em "úútil".

---

## VEREDICTO

**APROVAR COM AJUSTES** — O plano V8-C01 é conceitualmente sólido e o contrato pedagógico é claro. Porém, 6 gaps impedem execução direta. Todos têm fixes concretos e isolados documentados acima. Nenhum requer mudança arquitetural profunda — são expansões de enums, adições de cases no switch, ajuste de schema e unificação de pipeline. Risco de regressão: baixo, pois os componentes de exercício já existem e são testados nos exercícios finais.

