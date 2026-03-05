

## Diagnóstico

O problema é claro: a lógica de deduplicação no `useV8Player.ts` está **invertida**.

Quando um `inlineQuiz` (V8InlineQuiz) e um `inlineExercise` (V8InlineExercise) existem no mesmo `afterSectionIndex`, o código atual **prioriza o Quiz e descarta o Exercise**. Mas pelo contrato V8-C01:

- **Sessão 4 (índice 3)** deve ser **Complete-Sentence ou Scenario-Selection** — tipos que vêm dos `inlineExercises`
- O `inlineQuiz` nesse índice é um multiple-choice genérico redundante

O resultado: o exercício correto do contrato é descartado, e um quiz genérico de múltipla escolha aparece no lugar.

## Plano

### 1. Inverter a prioridade de deduplicação em `useV8Player.ts`

Alterar a lógica para: **se um `inlineExercise` existe num índice, pular o `inlineQuiz` nesse mesmo índice** (não o contrário).

```text
Antes:  Se quiz existe → pula exercise (ERRADO)
Depois: Se exercise existe → pula quiz (CORRETO)
```

Isso garante que os tipos definidos pelo contrato V8-C01 (complete-sentence, scenario-selection, platform-match, etc.) sempre tenham prioridade sobre quizzes genéricos de múltipla escolha.

### Impacto

- Sessões que só têm `inlineQuiz` (sem `inlineExercise`) continuam funcionando normalmente
- Sessões com ambos passam a mostrar o `inlineExercise` (tipo correto do contrato)
- Nenhum outro arquivo precisa ser alterado

