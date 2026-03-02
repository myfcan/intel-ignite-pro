
# Fix: Mensagem do Done Phase + Ortografia nas Imagens

## Problema 1: Mensagem sem contexto no "done" do Playground

Quando o usuario clica "Continuar Aula" apos falhar, a fase "done" (linha 454) mostra o `tryAgainMessage`:

```
"Quase. Coloque 3 detalhes: onde voce esta, quando voce precisa e o formato do retorno."
```

Isso e uma dica de retry, nao uma mensagem de encerramento. O usuario ja decidiu seguir em frente — mostrar "tente de novo" nao faz sentido.

### Correcao

No `V8PlaygroundInline.tsx` (linha 453-455), substituir a logica da mensagem na fase "done":

- Se score >= 70: mostrar `successMessage` (como ja funciona)
- Se score < 70 e usuario escolheu continuar: mostrar uma mensagem neutra de progresso em vez do `tryAgainMessage`

Mensagem neutra: **"Voce completou o desafio. Continue a aula para aprender mais!"** — ou usar um campo opcional `skipMessage` do playground, com fallback para essa mensagem padrao.

### Arquivo
`src/components/lessons/v8/V8PlaygroundInline.tsx` — linhas 450-466

---

## Problema 2: Erros ortograficos nas imagens geradas

A imagem mostra "exaztmente" em vez de "exatamente". O Gemini gera texto com erros de ortografia em portugues.

### Correcao

No `v8-generate-section-image/index.ts`, adicionar regra de ortografia ao prompt (dentro do bloco `allowText = true`):

```
- SPELLING RULE: Double-check ALL Portuguese words for correct spelling.
  Common mistakes to AVOID: "exaztmente" (correct: "exatamente"), 
  "voce" (correct: "voce" with accent), "nao" (correct: "nao" with til).
  Every word must be spelled correctly in standard Brazilian Portuguese.
```

### Arquivo
`supabase/functions/v8-generate-section-image/index.ts` — linhas 18-22 (bloco `allowText`)

---

## Resumo

| Problema | Arquivo | Mudanca |
|----------|---------|---------|
| Mensagem "tryAgain" no done | `V8PlaygroundInline.tsx` | Mensagem neutra quando usuario pula |
| Typos em pt-BR nas imagens | `v8-generate-section-image/index.ts` | Regra de ortografia no prompt |

2 arquivos, 0 mudancas de banco.
