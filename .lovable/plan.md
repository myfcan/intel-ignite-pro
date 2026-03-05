

## Plano: Preservar estado visual de exercícios completados no rolo

### Problema

Quando o usuário avança para o próximo item (clicando "Continuar Aula"), os exercícios anteriores perdem o feedback visual (score, resultado) porque:

1. **FlipCardQuizExercise**: `handleContinue` chama `setShowResult(false)` — esconde o resumo de resultado
2. **V8InlineExercise**: Os botões CTA (Continuar/Tentar) somem porque `onContinue` vira `undefined` quando `isLast=false` — aceitável para botões, mas o score/badge também some
3. **V8QuizInline**: Feedback de "Correto"/"Errado" fica visível (OK), mas botões CTA somem — sem problema
4. **V8CompleteSentenceInline**: Mesma lógica — botões somem mas estado visual some junto

### Regra UX

Tudo permanece no rolo. O usuário pode rolar para cima e ver toda a jornada: seções lidas, exercícios completados com seus resultados. Somente os botões de ação (Continuar/Tentar) devem sumir quando o item não é mais o ativo.

### Mudanças

**1. `FlipCardQuizExercise.tsx`**
- Remover `setShowResult(false)` do `handleContinue` — o resumo de resultado deve permanecer visível
- Os botões CTA internos já são guardados por `{onContinue && ...}`, então somem naturalmente quando o item deixa de ser ativo

**2. `V8InlineExercise.tsx`**
- Separar o badge de resultado dos botões CTA
- Quando `completed=true` e `onContinue=undefined` (item passado): mostrar um badge read-only com o score (ex: "Exercício concluído ✓") sem botões de ação
- Quando `completed=true` e `onContinue` existe (item ativo): mostrar Fluxo A/B com botões como hoje

**3. `V8QuizInline.tsx`**
- Já funciona bem — feedback de "Correto" e "Errado" persiste mesmo sem `onContinue`
- Apenas garantir que o bloco de feedback não depende de `onContinue` para renderizar (já é o caso — os botões dentro do feedback é que dependem, correto)

**4. `V8CompleteSentenceInline.tsx`**
- Mesmo padrão do V8InlineExercise: separar badge de resultado dos botões
- Manter o estado visual de blanks preenchidos (corretos em verde, errados em vermelho) visível após completar

### Resumo visual

```text
Item completado (não-ativo):
  ├─ Exercício visível (read-only, sem interação)
  ├─ Score badge: "✓ Exercício concluído" ou "X/Y acertos"
  └─ SEM botões de ação

Item ativo:
  ├─ Exercício interativo
  ├─ Score badge após completar
  └─ Botões Fluxo A/B
```

