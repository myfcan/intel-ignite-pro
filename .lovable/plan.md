

# Plano: Injetar Diversidade Mid-Lesson na Aula `5a8d4dbb`

## Abordagem: Injeção Manual via SQL (rápida, controlada, sem risco de reprocessamento)

Reprocessar pelo pipeline inteiro arriscaria sobrescrever o playground e insight já funcionais. A injeção manual é cirúrgica.

---

## Correção 1 — Injetar 3 Inline Quizzes

Usar `jsonb_set` para popular `content->'inlineQuizzes'` com 3 quizzes contextuais (baseados no conteúdo real das seções):

- **Após Seção 1** (`afterSectionIndex: 1`): `multiple-choice` — "Por que o GPT responde de forma genérica?"
- **Após Seção 2** (`afterSectionIndex: 2`): `true-false` — "O GPT pesquisa no Google antes de responder." (false)
- **Após Seção 3** (`afterSectionIndex: 3`): `fill-blank` — "Um pedido útil tem: objetivo, _____ e formato." (contexto)

Cada quiz terá: `id` (UUID), `question`, `quizType`, `options`/`statement`/`sentenceWithBlank`, `explanation`, `reinforcement`, `narration`.

## Correção 2 — Reposicionar Insight

Atualizar `content->'inlineInsights'->[0]->'afterSectionIndex'` de `1` para `3`.

Resultado: insight aparece APÓS o playground (momento de conquista), não no começo.

## Correção 3 — Limpar Seção 4

Ler o conteúdo da seção 4. Se contiver apenas a tag `[EXERCISE:timed-quiz]` sem conteúdo pedagógico real, remover a seção do array `sections` e ajustar os `afterSectionIndex` das interações.

---

## Timeline Final Esperada

```text
Section 0 (intro) → Section 1 → [Quiz: multiple-choice] → [Insight moved here? No]
→ Section 2 → [Quiz: true-false] 
→ Section 3 → [Quiz: fill-blank] → [Playground] → [Insight] → Section 4* → FIM
                                                                            ↓
                                                        Exercícios finais (4 tipos)
```
*Section 4 removida se vazia

## Riscos

- **ZERO risco sistêmico**: apenas UPDATE no campo `content` (JSONB) de uma única row
- **Backward compatible**: `useV8Player.ts` já consome `inlineQuizzes` do mesmo formato
- **Idempotente**: UUIDs únicos, sem conflito com dados existentes

## Implementação

1. Um único `UPDATE` SQL via insert tool com o JSONB completo dos 3 quizzes + insight reposicionado
2. Verificar seção 4 antes de decidir remoção
3. Testar no preview após injeção

