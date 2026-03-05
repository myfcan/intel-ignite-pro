

## Plano: Padronizar regra de saída de exercícios (Fluxo A / Fluxo B)

### Regra Universal

- **Fluxo A (Acertou):** Mostra apenas `[Continuar Aula]`. Avança somente no clique. Sem auto-advance.
- **Fluxo B (Errou):** Mostra `[Tentar Novamente]` + `[Continuar Aula]`. Reset no retry, avança no continuar.

### Arquivos e mudanças

**1. `V8InlineExercise.tsx`** (8 tipos de exercício)
- Remover `setTimeout(() => onContinue(), 1200)` do `handleComplete`
- O botão "Continuar Aula" já existe (linha 189-201) e aparece quando `completed === true` — manter
- Adicionar estado `passed` (score >= PASS_SCORE) para decidir se mostra só "Continuar" ou "Tentar Novamente" + "Continuar"
- Adicionar botão "Tentar Novamente" quando `completed && !passed`, resetando `completed` para re-renderizar o exercício
- O `timed-quiz` (linha 147-158) chama `onContinue?.()` direto — mudar para usar `handleComplete` como os demais

**2. `V8QuizInline.tsx`** (quiz de múltipla escolha inline)
- Remover `setTimeout(() => onContinue(), 1200)` do `handleConfirm` (acerto)
- No estado `correct`: adicionar botão `[Continuar Aula]` (hoje não tem nenhum, só auto-avança)
- No estado `wrong`: já tem `[Tentar Novamente]` + `[Continuar Aula]` — manter como está
- Ajustar `handleContinueAfterWrong` para ser reutilizado no fluxo de acerto também (renomear para `handleContinue`)

**3. `V8CompleteSentenceInline.tsx`** (Coursiv / Monte o Prompt)
- Remover `setTimeout(() => onContinue(), 1200)` do `handleSubmit`
- Quando acertou tudo (`correctCount === blankCount`): adicionar botão `[Continuar Aula]` (hoje falta)
- Quando errou: já tem `[Tentar Novamente]` + `[Continuar Aula]` — manter

### Resumo visual

```text
Exercício finalizado
  ├─ Acertou → [Continuar Aula]
  └─ Errou   → [Tentar Novamente] [Continuar Aula]
```

Nenhum `setTimeout` de auto-advance. Tudo manual por clique/toque.

