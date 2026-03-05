

## Plano: Fix Sistêmico — Eliminar Botões Duplicados em TODOS os Exercícios

### Causa Raiz

O problema não é de um componente — é arquitetural. Cada componente filho de exercício gerencia seus próprios botões de navegação (Tentar Novamente / Continuar Aula) E/OU se auto-destrói com `return null` após completar. Enquanto isso, o pai `V8InlineExercise` TAMBÉM renderiza botões. Resultado: duplicação em todos os tipos.

### Regra Arquitetural

**O pai `V8InlineExercise` é o ÚNICO dono dos botões de navegação.** Componentes filhos devem:
- Mostrar feedback visual (correto/errado, explicação, score)
- Chamar `onComplete(score)` imediatamente quando o resultado é determinado
- NUNCA renderizar botões "Continuar" ou "Tentar Novamente"
- NUNCA usar `setTimeout(() => onComplete(...))` para auto-avançar
- NUNCA usar `if (completed) return null` — o exercício permanece visível no rolo

### Componentes Afetados (6 arquivos)

**1. `TimedQuizExercise.tsx`** — Tela de resultado final (isFinished)
- Remover grid de botões internos (linhas 248-255)
- Chamar `onComplete(finalPercent)` ao entrar em `isFinished` (no `advanceQuestion`)
- Manter o card de resultado visível (Trophy, score, feedback)

**2. `TrueFalseExercise.tsx`** — Acerto e erro
- Remover `if (completed) return null` (linha 87) — exercício some inteiro!
- Remover estado `completed` e `handleContinue`
- Remover botões internos "Tentar Novamente" + "Continuar Aula" (linhas 188-198)
- No acerto: remover `setTimeout` — chamar `onComplete(100)` direto
- No erro: chamar `onComplete(0)` direto

**3. `ScenarioSelectionExercise.tsx`** — Cenários
- Remover `if (completed) return null` (linha 118) — exercício some inteiro!
- Remover estado `completed`, `handleContinue`
- Remover botões internos (linhas 278-306)
- Remover `setTimeout(() => { setCompleted(true); onComplete(...) }, 2000)` nos simple-choice
- Chamar `onComplete(score)` imediatamente ao confirmar

**4. `PlatformMatchExercise.tsx`** — Match de plataformas
- Remover `setTimeout(() => onComplete(score), 1000)` (linha 108)
- Chamar `onComplete(score)` imediatamente quando o último cenário é respondido

**5. `CompleteSentenceExercise.tsx`** — Completar sentença
- Remover `setTimeout(() => onComplete(score), 2000)` (linha 91)
- Chamar `onComplete(score)` imediatamente

**6. `FlipCardQuizExercise.tsx`** — Já parcialmente correto
- Remover botões internos do card de resultado — o pai já renderiza os botões via `onContinue` prop
- Manter o card de score visível (Trophy, X/Y acertos)
- Chamar `onComplete(score)` ao finalizar, mas NÃO renderizar botões

### V8InlineExercise (pai) — Já correto
O pai já tem a lógica certa:
- Badge read-only quando `completed && !onContinue`
- Botões Fluxo A/B quando `completed && onContinue`
- Retry via `exerciseKey` reset

Só precisa ajustar o case `flipcard-quiz` para usar `handleComplete` em vez de bypass direto.

### Resumo Visual

```text
ANTES (bugado):
  Filho: [feedback] [Tentar Novamente] [Continuar Aula]  ← botões internos
  Pai:   [Tentar Novamente] [Continuar Aula]              ← botões do wrapper
  = DUPLICAÇÃO

DEPOIS (correto):
  Filho: [feedback visual / score / explicação]            ← só feedback
  Pai:   [Tentar Novamente] [Continuar Aula]              ← único set de botões
```

