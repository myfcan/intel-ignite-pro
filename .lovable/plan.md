

# Correção: Reposicionar LIVFab no mobile

## Problema
Os valores do breakpoint `< 480px` (que é o ativo no viewport 390px do usuário) nunca foram alterados. As edições anteriores ou não tocaram nesse breakpoint ou restauraram os valores originais.

## Mudanças exatas em `src/components/lessons/v10/PartB/LIVFab.tsx`

Linha 26 — breakpoint `< 480` (else final):

**De:**
```
avatarRight: 34, buttonRight: 41, avatarBottom: 165, buttonBottom: 114
```

**Para (10px esquerda = +10 right, 10px cima = +10 bottom, menu 5px mais perto = +5 no buttonBottom):**
```
avatarRight: 44, buttonRight: 51, avatarBottom: 175, buttonBottom: 124
```

Também aplicar nos outros breakpoints para consistência:

| Breakpoint | avatarRight | buttonRight | avatarBottom | buttonBottom |
|------------|-------------|-------------|--------------|--------------|
| ≥1024      | 80          | 87          | 185          | 134          |
| ≥768       | 68          | 75          | 180          | 129          |
| ≥480       | 56          | 63          | 175          | 124          |
| <480       | 44          | 51          | 175          | 124          |

Cada valor original +10 no `right` (mais à esquerda) e +10 no `bottom` (mais acima), com `buttonBottom` mais 5px extra para aproximar do avatar.

