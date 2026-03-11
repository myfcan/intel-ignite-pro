

# Correções Mobile V8 — 5 Bugs Identificados

## Diagnóstico Forense

### Bug 1: Som ausente nos exercícios inline (`V8InlineExercise.tsx`)
**Causa raiz**: O componente `V8InlineExercise.tsx` NÃO importa nem usa `useV7SoundEffects`. Zero chamadas a `playSound` no arquivo. Os sub-componentes delegados (TrueFalseExercise, FillInBlanksExercise, etc.) também não tocam sons — eles apenas chamam `onComplete(score)`.
**Correção**: Adicionar `useV7SoundEffects` ao `V8InlineExercise.tsx` e tocar `playSound("quiz-correct")` / `playSound("quiz-wrong")` no `handleComplete` baseado no score.

### Bug 2: Exercício "Poder do Formato" muito grande no mobile
**Causa raiz**: O `V8InlineExercise.tsx` usa `space-y-3` no container e os sub-componentes (ex: FlipCardQuiz, ScenarioSelection) não têm otimização mobile específica.
**Correção**: Reduzir espaçamento e tipografia no wrapper do exercício para mobile. Usar `gap-2` e fontes menores em telas pequenas.

### Bug 3: Scroll não desce até o botão "Continuar Aula" após exercício
**Causa raiz**: O `scheduleCTAScroll` no `V8InlineExercise.tsx` (linha 67-68) chama scroll com delay de 300ms+600ms, mas o `V8_SAFE_BOTTOM = 120px` pode não ser suficiente no iPhone onde a barra de URL ocupa espaço adicional. Além disso, o padding `pb-36` do container pode não cobrir o safe area do iPhone.
**Correção**: Aumentar `V8_SAFE_BOTTOM` para considerar a barra de URL do iPhone (~180px) e usar `env(safe-area-inset-bottom)` no padding inferior do container.

### Bug 4: Botão "Continuar sem XP" fica atrás da barra de URL do iPhone
**Causa raiz**: O `V8InsightReward.tsx` tem `pb-8` e `mb-6` no container, mas sem margem de segurança para `safe-area-inset-bottom`. O container pai usa `pb-36` fixo que não considera o safe area do iOS.
**Correção**: Adicionar `pb-[env(safe-area-inset-bottom)]` ou margem inferior extra no V8InsightReward quando é o último item visível. Aumentar o `pb-36` do container para `pb-44` e adicionar safe area.

### Bug 5: Tela "Exercício não disponível" ao final (deveria ser modal de avaliação)
**Causa raiz REAL**: A coluna `exercises` da aula `f69c5d51-6a32-4451-83aa-64a9fe8319ca` contém 6 objetos com apenas `{afterSectionIndex, type}` — SEM campo `data`, `title`, ou `instruction`. São referências de exercícios inline, já processadas pelo timeline como `inlineExercises`. Porém o `useV8Player` vê `lessonData.exercises.length > 0` (6 itens) → define `hasExercises = true` → após o timeline, transiciona para phase `"exercises"` → `ExercisesSection` renderiza → `currentExercise.data` é `undefined` → fallback "Exercício não disponível".

**Correção**: No `V8Lesson.tsx` (ou `useV8Player`), filtrar `exercises` para conter apenas exercícios com `data` válido. Se nenhum exercício tiver `data`, `hasExercises` será `false` e o player pula direto para `completion` (tela de conclusão + modal de avaliação).

---

## Arquivos a Editar

1. **`src/components/lessons/v8/V8InlineExercise.tsx`**
   - Importar e usar `useV7SoundEffects`
   - Tocar `quiz-correct` ou `quiz-wrong` no `handleComplete`

2. **`src/components/lessons/v8/V8InlineExercise.tsx`** (mesmo arquivo)
   - Compactar layout mobile: reduzir `space-y-3` → `space-y-2`, adicionar classes responsivas

3. **`src/components/lessons/v8/v8ScrollUtils.ts`**
   - Aumentar `V8_SAFE_BOTTOM` de 120 para 180 para cobrir barra de URL do iPhone

4. **`src/components/lessons/v8/V8LessonPlayer.tsx`**
   - Alterar `pb-36` para `pb-44` com suporte a safe-area-inset-bottom
   - Garantir que o container de conteúdo tenha margem suficiente no iOS

5. **`src/pages/V8Lesson.tsx`**
   - Filtrar `exercises` para incluir apenas itens com `data` válido antes de passar ao player
   - Isso faz `hasExercises = false` → skip exercises phase → direto para completion

6. **`src/components/lessons/v8/V8InsightReward.tsx`**
   - Aumentar `pb-8` para `pb-12` e adicionar margem inferior para safe area iOS

