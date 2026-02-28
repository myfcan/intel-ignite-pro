

# Playground Mid-Lesson V8 — Plano Revisado com os 8 Pontos

Plano atualizado incorporando todas as correcoes criticas levantadas na revisao.

---

## 1. Modelo de Dados (`src/types/v8Lesson.ts`)

Novo tipo `V8InlinePlayground` com todos os campos corrigidos:

```text
V8InlinePlayground {
  id: string                          // 'playground-01'
  afterSectionIndex: number           // 0-based, validado: 0 <= x < sections.length
  
  // UI (exibido na tela)
  title: string                       // "Teste na Pratica"
  subtitle?: string
  instruction: string                 // Texto curto de UI (>= 40 chars)
  
  // Narracao (separada da UI — ponto 6)
  narration?: string                  // Texto narrado com tags de emocao
  audioUrl?: string                   // Audio gerado a partir de narration
  
  // Prompts comparativos
  amateurPrompt: string               // != professionalPrompt (validado)
  professionalPrompt: string
  amateurResult?: string              // Se preenchido: usa direto (ponto 1.2)
  professionalResult?: string         // Se vazio: chama IA na hora
  
  // Desafio do usuario
  userChallenge?: {
    instruction: string
    challengePrompt: string
    hints: string[]                   // max 3 (validado)
    evaluationCriteria: string[]      // ex: "tem objetivo claro", "pede formato"
    scoring?: {
      maxScore: number
      rubric: { criterion: string; points: number }[]
    }
    maxAttempts?: number              // default 3 (ponto 8)
  }
  
  // Feedback explicito (ponto 4)
  successMessage: string              // Acao, nao motivacao vazia
  tryAgainMessage: string
  hintOnFail?: string[]
  
  // Fallback offline (ponto 1.4)
  offlineFallback?: {
    message: string
    exampleAnswer: string
  }
}
```

Adicionar ao `V8LessonData`:
```typescript
inlinePlaygrounds: V8InlinePlayground[];  // default: []
```

---

## 2. Timeline — Ordenacao Deterministica (`src/hooks/useV8Player.ts`)

Expandir `TimelineItem`:
```typescript
type TimelineItem =
  | { type: "section"; index: number }
  | { type: "playground"; playground: V8InlinePlayground }
  | { type: "quiz"; quiz: V8InlineQuiz };
```

Regra fixa quando `afterSectionIndex` conflita: **playground antes de quiz** (pratica antes de teste).

No builder da timeline, apos cada secao:
1. Inserir playgrounds com esse `afterSectionIndex`
2. Depois inserir quizzes com esse `afterSectionIndex`

---

## 3. Componente `V8PlaygroundInline.tsx` (novo)

Estrutura UX seguindo o ritmo recomendado:

```text
[1] Micro-contexto narrado (~10s)     -> narration com tags de emocao
[2] Prompt amador + resultado (~20s)  -> amateurPrompt + amateurResult (ou IA)
[3] Prompt profissional + resultado   -> professionalPrompt + professionalResult (ou IA)
[4] Comparacao com descobertas        -> 2-3 bullets gerados ou fixos
[5] Desafio do usuario (se houver)    -> textarea + hints + avaliacao
[6] Fechamento + "Continuar"          -> successMessage ou tryAgainMessage
```

Logica de resultado (hibrida — ponto 1.2):
- Se `amateurResult`/`professionalResult` preenchidos: exibe direto
- Se vazios: chama IA via edge function para gerar na hora
- Se IA falhar: exibe `offlineFallback` e permite continuar

Logica de avaliacao do desafio:
- Envia prompt do usuario + `evaluationCriteria` para IA
- IA retorna score baseado na rubrica
- Feedback usa `successMessage` / `tryAgainMessage` / `hintOnFail`
- Maximo de `maxAttempts` tentativas (default 3)

---

## 4. Player (`src/components/lessons/v8/V8LessonPlayer.tsx`)

Adicionar case para playground na fase "content":
```tsx
{currentItem.type === "playground" && (
  <V8PlaygroundInline
    playground={currentItem.playground}
    onContinue={next}
    onScore={addScore}
  />
)}
```

---

## 5. Validacao no Admin (`src/pages/AdminV8Create.tsx`)

Adicionar na funcao `validateV8Json`:

- `afterSectionIndex`: 0-based, `0 <= x < sections.length`
- `instruction.length >= 40`
- `amateurPrompt !== professionalPrompt`
- `hints.length <= 3` (se houver challenge)
- `successMessage` e `tryAgainMessage` obrigatorios
- Limite de tamanho dos prompts (ex: max 2000 chars cada)
- Contar playgrounds no resumo: "X secoes, Y quizzes, Z playgrounds"

---

## 6. Pipeline de Audio (`supabase/functions/v8-generate`)

Mudancas:
- Processar campo `narration` dos playgrounds (nao `instruction`)
- Se `narration` estiver vazio, pular geracao de audio para esse playground
- Storage path: `v8/{lessonId}/playground-{i}.mp3`
- Resultado: `type: 'playground'` no array de results
- No `AdminV8Create`, mapear resultado de volta para `playground.audioUrl`

---

## 7. Content-to-JSON Parser (`src/lib/v8ContentParser.ts`)

Suportar bloco `[PLAYGROUND]` inline no texto:

```text
[PLAYGROUND]
title: Teste na Pratica
instruction: Compare os dois prompts e sinta a diferenca.
narration: [excited] Agora voce vai sentir na pele a diferenca...
amateurPrompt: me fala sobre marketing
professionalPrompt: Crie 3 estrategias de marketing digital...
successMessage: Boa! Voce acabou de destravar a habilidade de prompts.
tryAgainMessage: Quase la. Tente adicionar o formato de saida.
hints:
- Diga o objetivo em 1 linha
- De 2 detalhes de contexto
- Peca o formato do retorno
```

Parser extrai campos linha a linha, atribui `afterSectionIndex` baseado na secao anterior, gera ID automatico.

---

## 8. Edge Function para Avaliacao de Prompt (nova)

Nova edge function `v8-evaluate-prompt` para avaliar o desafio do usuario em tempo real:
- Recebe: prompt do usuario + evaluationCriteria + rubrica
- Usa modelo Lovable AI (gemini-2.5-flash para custo baixo)
- Retorna: score + feedback textual
- Rate limit: max 3 chamadas por bloco por sessao
- Timeout: 10s, se falhar usa `offlineFallback`

---

## Resumo de Arquivos

| Arquivo | Acao |
|---------|------|
| `src/types/v8Lesson.ts` | Adicionar V8InlinePlayground + campo em V8LessonData |
| `src/hooks/useV8Player.ts` | Timeline com playground + ordenacao deterministica |
| `src/components/lessons/v8/V8PlaygroundInline.tsx` | Novo componente |
| `src/components/lessons/v8/V8LessonPlayer.tsx` | Renderizar playground |
| `src/pages/AdminV8Create.tsx` | Validacao expandida + audio mapping |
| `supabase/functions/v8-generate/index.ts` | Audio para narration dos playgrounds |
| `supabase/functions/v8-evaluate-prompt/index.ts` | Nova — avaliacao IA do desafio |
| `src/lib/v8ContentParser.ts` | Novo — suporte a bloco [PLAYGROUND] |

