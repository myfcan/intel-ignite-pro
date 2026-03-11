

# Análise Forense com Análise Preditiva — Plano de Correção V8-C01

## FATO FORENSE #0: A aula `4efc4da3-0571-4b2b-8720-1ea0d8ee9d69` NÃO EXISTE no banco

```sql
SELECT id FROM lessons WHERE id = '4efc4da3-0571-4b2b-8720-1ea0d8ee9d69';
-- Resultado: [] (vazio)
```

A aula foi deletada ou nunca foi salva com sucesso. Portanto, não é possível reprocessá-la — será necessário recriá-la.

## ESTADO REAL DO CÓDIGO (evidências forenses)

### Ponto 1: `V8_C01_MAP` — Seção 5 ausente
**Arquivo**: `supabase/functions/v8-generate-lesson-content/index.ts`, linhas 633-639
```typescript
const V8_C01_MAP: Record<number, string[]> = {
  2: ['multiple-choice', 'flipcard-quiz'],
  3: ['complete-sentence', 'scenario-selection'],
  4: ['true-false'],
  // Section 5 (Sessão 6): no exercise — removed per V8-C01 update
  6: ['timed-quiz', 'fill-in-blanks'],
};
```
**Diagnóstico**: Índice 5 não tem entry. O loop (linha 643-653) usa `if (!pool) continue;` — logo S5 é silenciosamente pulada.

### Ponto 2: `useV8Player.ts` — Bloqueio de renderização no índice 5
**Arquivo**: `src/hooks/useV8Player.ts`, linhas 41-42
```typescript
const DISABLED_EXERCISE_SECTION_INDEXES = new Set([5]);
```
**Diagnóstico**: Mesmo se dados existissem no banco para `afterSectionIndex: 5`, o player descarta quiz/exercise/complete-sentence nesse índice.

### Ponto 3: `INLINE_EXERCISE_SYSTEM_PROMPT` — `multiple-choice` usa schema `true-false`
**Arquivo**: `supabase/functions/v8-generate-lesson-content/index.ts`, linha 414
```typescript
- multiple-choice: Use o formato true-false (statements) para compatibilidade do player. { statements: [{ id, text, correct, explanation }], feedback: { perfect, good, needsReview } }
```
**Diagnóstico**: O prompt instrui a IA a gerar `data.statements` para `multiple-choice`. O renderer (V8InlineExercise.tsx linhas 107-134) tem dois branches: se `data.question && data.options` existe, renderiza MC real; se `data.statements` existe, renderiza TrueFalse. Como o prompt manda gerar `statements`, o usuário sempre vê V/F.

### Ponto 4: `INLINE_REQUIRED_DATA_KEYS` confirma o adapter
**Arquivo**: `supabase/functions/v8-generate-lesson-content/index.ts`, linha 683
```typescript
'multiple-choice': ['statements'],
```
**Diagnóstico**: A validação aceita `statements` como dados válidos para MC. Se mudarmos o prompt para gerar `question`+`options`, essa validação rejeitará exercícios antigos.

### Ponto 5: `manualExercises` — sempre `[]`
**Arquivo**: `src/pages/AdminV8Create.tsx`, linha 635
```typescript
manualExercises: parsed.hasManualExercises ? [] : [],
```
**Diagnóstico**: Ternário que retorna `[]` em ambos os branches. Os markers `[EXERCISE:*]` são detectados mas nunca enviados. Na edge function (linha 1141), `manualExercises.length === 0` é sempre verdade, então gera exercícios finais via IA.

### Ponto 6: `parseExerciseMarkers` — perde `afterSectionIndex`
**Arquivo**: `src/lib/v8ContentParser.ts`, linhas 534-544
```typescript
export function parseExerciseMarkers(rawText: string): string[] {
  const markers: string[] = [];
  const regex = /\[EXERCISE:([a-z-]+)\]/gi;
  // ...
  return markers; // retorna apenas tipos, sem índice
}
```
**Diagnóstico**: Opera sobre `rawText` global, sem saber em qual seção cada marker está.

### Ponto 7: Aula modelo (`0638b200`) — estado real persistido
```text
exercise_map: [
  {idx: 2, type: multiple-choice},
  {idx: 3, type: flipcard-quiz},
  {idx: 4, type: true-false},
  {idx: 5, type: platform-match},  ← EXISTE NO BANCO
  {idx: 6, type: timed-quiz}
]
cs_map: [{idx: 7}]
pg_map: [{idx: 8}]
```
**Diagnóstico**: A aula modelo tem S5 com `platform-match` no banco — mas o player BLOQUEIA renderização via `DISABLED_EXERCISE_SECTION_INDEXES = Set([5])`. O usuário vê 4 exercícios em vez de 5.

---

## ANÁLISE PREDITIVA — Efeitos de cada correção

### Correção 1: Adicionar `5: ['platform-match', 'scenario-selection']` ao `V8_C01_MAP`

**Efeito em aulas novas**: S5 receberá exercício. O HARD FAIL gate (linha 794-801) agora exigirá que a IA gere exercício para S5. Se falhar → aula inteira aborta com HTTP 500.

**Risco preditivo**: `platform-match` exige `data.scenarios` + `data.platforms` (dois arrays). Se a IA devolver apenas `scenarios`, o CONTENT_DEPTH_RULES (linhas 741-742) rejeita, e o HARD FAIL aborta. Taxa de rejeição observada para `platform-match`: desconhecida (sem logs de produção). Mitigação: o pool inclui `scenario-selection` como fallback, que exige apenas `scenarios`.

**Efeito em aulas existentes**: Zero. Aulas persistidas não passam pelo pipeline novamente (per memory `non-retroactive-pipeline-updates`).

### Correção 2: Remover `5` de `DISABLED_EXERCISE_SECTION_INDEXES` no player

**Efeito imediato**: A aula modelo (`0638b200`) que já tem `platform-match` no idx 5 passará a renderizá-la. O usuário verá 5 exercícios inline em vez de 4.

**Risco preditivo**: Se alguma aula existente tem dados corrompidos no idx 5 (improvável — apenas a aula modelo tem), o `ExerciseErrorCard` fará fallback. Risco: baixo.

**Efeito sistêmico**: A lógica de dedup `quiz vs exercise` (linhas 113-121 do useV8Player) se aplica — se existir `inlineExercise` no idx 5, quizzes nesse idx são suprimidos. Sem conflito porque quizzes inline não são gerados para seções que têm exercises no V8-C01.

### Correção 3: Separar schema `multiple-choice` no prompt da IA

**Proposta**: Linha 414 muda para:
```
- multiple-choice: { question: "pergunta", options: [{ id, text, isCorrect }], explanation: "...", feedback: { ... } }
```
E `INLINE_REQUIRED_DATA_KEYS` linha 683 muda para:
```
'multiple-choice': ['question', 'options'],
```

**Efeito em aulas novas**: A IA gerará MC com schema correto. O renderer (linhas 109-121) já suporta `data.question + data.options` — renderiza `MultipleChoiceExercise`.

**Risco preditivo CRÍTICO — Retrocompatibilidade**: Aulas existentes com `type: "multiple-choice"` + `data.statements` continuarão funcionando porque:
1. A validação `INLINE_REQUIRED_DATA_KEYS` só roda na geração (edge function), não na renderização
2. O renderer (linhas 123-134) tem fallback: `if (data.statements)` → TrueFalseExercise

**Sem quebra retroativa confirmada.**

### Correção 4: Parsear markers com `afterSectionIndex`

**Proposta**: Mudar `parseExerciseMarkers(rawText)` para receber seções já splitadas e retornar `Array<{ afterSectionIndex, type }>`.

**Efeito**: O `AdminV8Create.tsx` poderá enviar markers contextualizados para a edge function.

**Risco preditivo**: A mudança na assinatura de `parseExerciseMarkers` pode quebrar qualquer outro caller. Verificação:
```
parseExerciseMarkers é chamado apenas em v8ContentParser.ts (interno ao parseFullContent).
```
Sem callers externos. Risco: nulo.

### Correção 5: Enviar markers reais como `manualExercises` override

**Proposta**: `AdminV8Create.tsx` linha 635 muda para enviar markers parseados. Edge function usa como override do `V8_C01_MAP`.

**Efeito**: Markers do conteúdo bruto prevalecem sobre o pool aleatório.

**Risco preditivo**: Se o conteúdo bruto tem marker `[EXERCISE:platform-match]` na seção 3, mas o contrato V8-C01 define seção 3 como `flipcard-quiz | scenario-selection`, o marker sobrescreve o contrato. Isso é desejável? Se o marker vem do autor humano, sim. Se vem de erro no template, pode gerar exercícios no lugar errado.

**Mitigação**: Validar que markers manuais só sobrescrevem tipos compatíveis com o pool, ou aceitar que o autor sabe o que faz.

### Correção 6: Validação cruzada tipo↔dados pós-IA

**Efeito**: Exercícios com schema incorreto (MC com statements) são rejeitados ou corrigidos automaticamente.

**Risco preditivo**: Se a IA falha em gerar o schema correto para o novo MC (question+options), o exercício é rejeitado. Se S2 ficar sem exercício, o HARD FAIL aborta. Mitigação: o normalizeExerciseData (linhas 691-714) já faz rescue de dados do root level — pode ser estendido para detectar `type: MC` + `data.statements` e corrigir automaticamente.

---

## RESUMO PREDITIVO DE RISCO

```text
CORREÇÃO                               RISCO    RETROATIVO?  EFEITO SISTÊMICO
1. Restaurar S5 no V8_C01_MAP          MÉDIO    Não          Novas aulas exigem S5, HARD FAIL se IA falhar
2. Remover S5 do player disabled set   BAIXO    SIM (positivo) Aula modelo passa a renderizar S5
3. Separar schema MC                   BAIXO    Não (fallback) MC real em vez de V/F para novas aulas
4. Parser com afterSectionIndex         NULO     Não          Sem callers externos
5. manualExercises override             BAIXO    Não          Markers do autor prevalecem
6. Validação cruzada tipo↔dados         MÉDIO    Não          HARD FAIL mais frequente se IA errar
```

## PLANO DE IMPLEMENTAÇÃO (6 arquivos, 6 correções)

### Arquivo 1: `supabase/functions/v8-generate-lesson-content/index.ts`
- **Linha 637**: Adicionar `5: ['platform-match', 'scenario-selection']`
- **Linha 414**: Mudar schema `multiple-choice` para `{ question, options: [{id, text, isCorrect}], explanation }`
- **Linha 683**: Mudar `'multiple-choice': ['statements']` → `'multiple-choice': ['question', 'options']`
- **Linha 696**: Adicionar `'question', 'options'` ao `dataKeysByType['multiple-choice']`
- **Após linha 714**: Adicionar rescue automático: se `type === 'multiple-choice'` e `data.statements` existe mas `data.question` não, converter `statements[0].text` → `question` e gerar `options` a partir dos statements

### Arquivo 2: `src/hooks/useV8Player.ts`
- **Linha 42**: Mudar `new Set([5])` → `new Set([])` (set vazio, sem bloqueios)

### Arquivo 3: `src/lib/v8ContentParser.ts`
- **Linhas 534-544**: Mudar `parseExerciseMarkers` para receber array de seções e retornar `Array<{ afterSectionIndex: number, type: string }>`

### Arquivo 4: `src/pages/AdminV8Create.tsx`
- **Linha 635**: Mudar `manualExercises: parsed.hasManualExercises ? [] : []` → enviar markers parseados como array de `{ afterSectionIndex, type }`

### Arquivo 5: `supabase/functions/v8-generate-lesson-content/index.ts` (continuação)
- **Linhas 641-653**: Se `manualExercises` contém entry para um dado `sectionIndex`, usar o `type` manual em vez do `V8_C01_MAP` pool

### Arquivo 6: `supabase/functions/v8-generate-lesson-content/index.ts` (pós-validação)
- **Após linha 765**: Adicionar validação cruzada: verificar que `data` keys correspondem ao `type` declarado. Se mismatch, logar warning e tentar auto-correção antes de rejeitar

