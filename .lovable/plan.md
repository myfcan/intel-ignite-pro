

## Revisao do Plano: Problemas Identificados

O plano atual tem a direcao correta mas precisa de ajustes:

### O que esta certo
- Identificacao correta da duplicidade: `MultipleChoiceExercise` renderiza feedback interno (linhas 145-175) E `V8InlineExercise` renderiza feedback externo (linhas 192-211)
- `TrueFalseExercise` tambem tem feedback interno via `AnimatePresence` (linhas 149-169)
- Principio correto: centralizar feedback no wrapper

### O que precisa melhorar no plano

**1. MultipleChoiceExercise — o feedback interno NAO deve ser totalmente removido**

O plano diz "remover bloco de feedback". Mas o componente tem uma logica importante: apos submit, ele esconde o botao "Confirmar Resposta". Se removermos todo o bloco `feedbackRef`, o botao fica visivel apos responder. A solucao correta e:
- Manter o estado `isSubmitted` controlando a visibilidade do botao
- Apos submit: renderizar **nada** (ou apenas um espacador) no lugar do feedback — nao o bloco verde/vermelho
- Os icones check/x nas opcoes ja existem e devem permanecer

**2. TrueFalseExercise — a explicacao por statement e util**

Diferente do MultipleChoice (que tem UMA explicacao global), o TrueFalse mostra explicacao **por statement individual**. Isso e pedagogicamente valioso e nao duplica com o wrapper (que mostra `successMessage`/`tryAgainMessage` generico). Considerar **manter** o feedback por statement mas com visual mais discreto.

**3. V8InlineExercise — o redesign premium esta vago**

O plano menciona "borda esquerda colorida" mas nao especifica o que acontece quando `successMessage`/`tryAgainMessage` estao ausentes no banco. Precisa de fallback claro.

### Plano Revisado

| Arquivo | Acao |
|---------|------|
| `MultipleChoiceExercise.tsx` | Substituir feedback pos-submit por div vazio (manter logica de esconder botao) |
| `TrueFalseExercise.tsx` | Manter explicacao por statement, reduzir visual para texto discreto sem caixa colorida |
| `V8InlineExercise.tsx` | Redesign premium: card com borda-l-4 colorida, fallback "Muito bem!" / "Tente novamente" quando mensagens ausentes, remover badge "Exercicio concluido" redundante |

### Design Premium do Feedback (V8InlineExercise)

```text
┌─────────────────────────────────────┐
│ ▌ ✓ Muito bem!                      │  <- borda esquerda verde 4px
│ ▌   [successMessage ou fallback]    │  <- bg-emerald-50/80
│ ▌                                   │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ ▌ ↻ Quase la!                       │  <- borda esquerda amber 4px
│ ▌   [tryAgainMessage ou fallback]   │  <- bg-amber-50/80
│ ▌                                   │
└─────────────────────────────────────┘
```

Aprovar este plano revisado para implementacao?

