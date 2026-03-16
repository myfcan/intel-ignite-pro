

# Para chegar a 100%: 6 correções concretas no plano

Verifiquei todo o código real dos 9 arquivos. O plano do usuário está correto em design e intenção. Os 6 gaps são todos de **implementação** — detalhes que o plano não especificou mas que precisam ser resolvidos durante a execução para compilar e funcionar.

---

## Gap 1 (CRÍTICO) — LIVSheet: props de chat omitidas da interface

**Problema**: A interface proposta no plano lista `open`, `onClose`, `frameTip`, `frameAction`, `frameCheck`, `liv`, `warnings`, `stepTitle` — mas **omite** 4 props obrigatórias para o chat funcionar:
- `onAskLiv: (question: string) => void`
- `chatMessages: LivChatMessage[]`
- `chatLoading: boolean`
- `chatLimitReached?: boolean`

**Fix**: A interface final DEVE incluir essas 4 props **além** das novas. São 12 props no total.

---

## Gap 2 (CRÍTICO) — LIVSheet: `open` vs `isOpen`

**Problema**: O plano propõe `open: boolean` na interface do LIVSheet. O código real usa `isOpen` (linha 10). O PartBScreen passa `isOpen={livOpen}` (linha 341).

**Fix**: Manter `isOpen: boolean` (nome atual). Não renomear.

---

## Gap 3 (CRÍTICO) — LIVSheet: OPTIONS fora de escopo

**Problema**: O plano define `const OPTIONS` como constante de módulo (fora do componente), mas cada item tem `hasContent` que referencia props (`warnings`, `frameAction`, etc.). Props não existem fora do componente.

**Fix**: Gerar o array OPTIONS **dentro** do componente como variável local ou `useMemo`, onde as props estão em escopo.

---

## Gap 4 (MÉDIA) — PartBScreen: chamada ao LIVSheet incompleta

**Problema**: O plano mostra a chamada ao LIVSheet com as novas props mas omite `onAskLiv`, `chatMessages`, `chatLoading`, `chatLimitReached`.

**Fix**: A chamada ao LIVSheet deve manter as 4 props de chat existentes (linhas 345-348 do código real) **mais** as 3 novas (`frameTip`, `frameAction`, `frameCheck`).

---

## Gap 5 (BAIXA) — StepContent: condição do wrapper do badge

**Problema**: Linha 40 do StepContent tem `(step.app_name || (step.warnings && step.warnings.warn))`. Ao remover o warning chip (linhas 54-69), a condição `step.warnings.warn` fica órfã — verifica algo que já não renderiza.

**Fix**: Simplificar condição para apenas `step.app_name`.

---

## Gap 6 (BAIXA) — LIVSheet: `stepTitle` sem uso

**Problema**: O plano adiciona `stepTitle: string` à interface mas nenhum JSX a usa.

**Fix**: Remover da interface (prop fantasma). Ou, se desejado, usar no header do sheet ("LIV — [stepTitle]"). Mas o plano original não especifica uso, então remover é o correto.

---

## Resumo: o que preciso para executar a 100%

| # | Gap | Fix |
|---|-----|-----|
| 1 | Props de chat omitidas | Adicionar `onAskLiv`, `chatMessages`, `chatLoading`, `chatLimitReached` à interface |
| 2 | `open` vs `isOpen` | Manter `isOpen` |
| 3 | OPTIONS fora de escopo | Mover para dentro do componente |
| 4 | Chamada LIVSheet incompleta | Manter props de chat existentes na chamada |
| 5 | Condição wrapper badge | Simplificar para `step.app_name` |
| 6 | `stepTitle` sem uso | Remover da interface |

Todos os 6 são ajustes mecânicos. O design do plano (4 correções pedagógicas, 5 itens, ordem ⚠️→👆→💡→✅→💬, fusão analogy/sos, itens desabilitados, green dot só warnings) está 100% correto e não precisa de alteração.

Se você aprovar esses 6 fixes, executo o plano inteiro de uma vez.

