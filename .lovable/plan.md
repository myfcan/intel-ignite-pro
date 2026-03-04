

# Verificacao Final do Plano: 3 Refinamentos

## Veredicto: Plano solido com 1 gap menor e 1 oportunidade de eficiencia

---

## Mudanca 1 (Proibir "Segmento vida real") — PERFEITO
Adicionar regra textual em `QUIZ_SYSTEM_PROMPT` (L242), `PLAYGROUND_SYSTEM_PROMPT` (L262) e `INLINE_EXERCISE_SYSTEM_PROMPT` (L273). Sem risco, sem dependencias.

## Mudanca 3 (Tom analitico do playground) — PERFEITO
Adicionar regras no `PLAYGROUND_SYSTEM_PROMPT` (L262). Sem risco.

## Mudanca 2 (Coursiv Prompt Builder) — 1 gap menor identificado

### O que esta correto no plano:
- Tool schema `COURSIV_BUILDER_TOOLS` com sentences/options/correctAnswers — correto
- Guarda `lastIdx >= 4` — correto
- Excluir `lastIdx - 1` de `sectionsNeedingInteraction` para evitar conflito — correto
- Output para `inlineCompleteSentences` (L803, atualmente `[]`) — correto
- Frontend `V8CompleteSentenceInline.tsx` ja suporta o formato — confirmado

### Gap menor: Conflito com Insights

O plano gera o Coursiv na penultima secao (`lastIdx - 1`). Os Insights sao gerados apenas para secoes com playgrounds (L637: `allPlaygroundsForInsights`). Como o Coursiv nao e um playground, ele NAO gera Insight — isso e correto e nao e um problema.

Porem, se a secao `lastIdx - 1` tambem receber um inline exercise (L489: `sectionsForInlineExercise`), havera **2 interacoes empilhadas** na mesma secao. O plano ja preve excluir `lastIdx - 1` de `sectionsNeedingInteraction`, o que resolve isso. Confirmado sem gap.

### Oportunidade de eficiencia: Reusar callAI existente

O plano propoe um novo `COURSIV_SYSTEM_PROMPT` + `COURSIV_BUILDER_TOOLS` + chamada `callAI()` separada. Isso adiciona **1 chamada extra de API** ao pipeline (total: 6 chamadas em vez de 5). Alternativa mais eficiente:

Embutir a geracao do Coursiv **dentro da chamada de inline exercises** existente (L497-503), adicionando instrucao ao `INLINE_EXERCISE_SYSTEM_PROMPT` para gerar 1 exercicio do tipo `complete-sentence` com tema "montagem de prompt" na penultima secao.

**Porem**: isso mistura responsabilidades e torna o prompt mais complexo, aumentando risco de falha da IA. A chamada separada e **mais segura e previsivel**. O custo de 1 chamada extra e desprezivel (~2s, ~$0.001).

**Veredicto**: Manter chamada separada. A clareza compensa o custo.

---

## Resumo Final

| Item | Status | Acao |
|------|--------|------|
| Proibir "Segmento vida real" | Perfeito | Implementar como planejado |
| Tom analitico playground | Perfeito | Implementar como planejado |
| Coursiv Prompt Builder | Solido | Implementar com chamada separada, guarda `lastIdx >= 4`, exclusao de `lastIdx - 1` |
| Conflito insights | Sem gap | Coursiv nao gera insight (correto) |
| Conflito inline exercises | Resolvido | Plano ja exclui `lastIdx - 1` |

**O plano pode ser implementado como esta. Nenhuma mudanca necessaria.**

