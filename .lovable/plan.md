
# Narração de Momentos Interativos via Pipeline

## Diagnóstico

O pipeline `v8-generate` já gera áudio para:
- Seções (conteúdo markdown)
- Quiz (pergunta + reforço ao errar)
- Playground (instrução/narração)

Mas **não gera** áudio para os momentos de resultado/feedback:
- `successMessage` do Playground (ex: "Você completou o desafio...")
- `explanation` do Quiz (feedback após resposta)
- `tryAgainMessage` do Playground

Esses textos aparecem apenas como texto na tela, sem narração — quebrando a humanização.

## Solução: Estender o Pipeline

### Passo 1 — Adicionar campos de áudio nos tipos

**Arquivo:** `src/types/v8Lesson.ts`

Adicionar campos opcionais ao tipo existente:

- `V8InlineQuiz`: adicionar `explanationAudioUrl?: string` (áudio do feedback)
- `V8InlinePlayground`: adicionar `successAudioUrl?: string` e `tryAgainAudioUrl?: string`

### Passo 2 — Gerar os áudios no pipeline

**Arquivo:** `supabase/functions/v8-generate/index.ts`

Estender a interface `GenerateRequest` para receber os textos extras dos quizzes e playgrounds. Adicionar 3 novos blocos de geração TTS:

1. **Quiz explanation**: Para cada quiz, gerar áudio de `explanation` e salvar como `quiz-{i}-explanation.mp3`
2. **Playground successMessage**: Gerar áudio de `successMessage` e salvar como `playground-{i}-success.mp3`
3. **Playground tryAgainMessage**: Gerar áudio de `tryAgainMessage` e salvar como `playground-{i}-tryagain.mp3`

Retornar os novos tipos: `quiz-explanation`, `playground-success`, `playground-tryagain` no array de results.

### Passo 3 — Tocar os áudios no player

**Arquivo:** `src/components/lessons/v8/V8QuizInline.tsx`

- Quando o usuário responde, tocar `explanationAudioUrl` (se disponível) junto com a exibição do feedback visual.

**Arquivo:** `src/components/lessons/v8/V8PlaygroundInline.tsx`

- Na fase "done", tocar `successAudioUrl` ou `tryAgainAudioUrl` conforme o score (>= 70 ou não).

## Resumo Tecnico

| Item | Detalhe |
|------|---------|
| Tipos | `v8Lesson.ts` - 3 novos campos opcionais |
| Pipeline | `v8-generate/index.ts` - 3 novos blocos TTS |
| Players | `V8QuizInline.tsx` + `V8PlaygroundInline.tsx` - tocar áudios de feedback |
| Banco de dados | 0 mudancas (campos ficam no JSONB existente) |
| Risco | Baixo - campos opcionais, backward compatible |
