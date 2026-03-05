

# Diagnóstico Forense Real + Plano de Correção

## O que realmente aconteceu (dados, não hipóteses)

### Fato 1: ZERO aulas V8 JAMAIS tiveram inlineExercises ou inlineCompleteSentences

```text
Aula                     | Seções | Quizzes | InlineEx | CompleteSent | PGs | FinalEx
eec10a74 (hoje)          |   9    |    1    |    0     |      0       |  1  |    0
942223bd (28/fev)        |   4    |    2    |    0     |      0       |  1  |    0
0dfe00ac (27/fev)        |   3    |    1    |    0     |      0       |  0  |    2
```

**Nenhuma aula V8 existente possui `inlineExercises` ou `inlineCompleteSentences` diferentes de zero.** O fluxo de geração nunca conseguiu entregar esses campos ao banco de dados.

### Fato 2: O edge function `v8-generate-lesson-content` GERA esses campos corretamente no response

A edge function retorna o response com (linha 887):
```
inlineExercises: generatedInlineExercises,
inlineCompleteSentences: generatedCoursivSentences,
```

### Fato 3: O `AdminV8Create.tsx` DESCARTA esses campos

Confirmado nas linhas 672-687 — o `finalData` NÃO inclui `result.inlineExercises` nem `result.inlineCompleteSentences`. Campos retornados pela edge function são descartados silenciosamente antes de salvar no banco.

### Fato 4: O áudio PT-PT é causado por falta de `language_code` na chamada ElevenLabs

Confirmado nas linhas 358-362 de `v8-generate/index.ts` — o body do `generateTTS` não inclui `language_code`. O modelo `eleven_multilingual_v2` infere o idioma, oscilando entre PT-BR e PT-PT.

## Plano de Correção (3 edições)

### Edição 1: `AdminV8Create.tsx` linha 686 — Incluir campos descartados no finalData

Adicionar antes do fechamento do objeto `finalData`:
```typescript
inlineExercises: result.inlineExercises || [],
inlineCompleteSentences: result.inlineCompleteSentences || [],
```

### Edição 2: `AdminV8Create.tsx` linha 691 — Gate V8-C01 + log melhorado

Substituir o log de sucesso por:
```typescript
const totalInteractions = (finalData.inlineExercises?.length || 0) 
  + (finalData.inlineCompleteSentences?.length || 0) 
  + finalData.inlineQuizzes.length;

if (totalInteractions < 2 && finalData.sections.length >= 5) {
  addLog('error', `V8-C01 VIOLATION: apenas ${totalInteractions} interações para ${finalData.sections.length} seções`);
}

addLog('success', `JSON montado: ${finalData.sections.length} seções, ${finalData.inlineQuizzes.length} quizzes, ${finalData.inlineExercises?.length || 0} inlineEx, ${finalData.inlineCompleteSentences?.length || 0} completeSent, ${finalData.exercises.length} exercícios`);
```

### Edição 3: `v8-generate/index.ts` linha 362 — Forçar `language_code: "pt"` no ElevenLabs

Adicionar ao body do `generateTTS`:
```typescript
const body: Record<string, unknown> = {
  text,
  model_id: MODEL_ID,
  voice_settings: VOICE_SETTINGS,
  language_code: "pt",
};
```

### Após as edições: Reprocessar aula `eec10a74`

A aula precisa ser reprocessada via AdminV8Create (Converter e Gerar Tudo) para que os exercícios sejam gerados E salvos corretamente.

## Arquivos editados

1. `src/pages/AdminV8Create.tsx` — 2 edições (finalData + gate V8-C01)
2. `supabase/functions/v8-generate/index.ts` — 1 edição (language_code)

