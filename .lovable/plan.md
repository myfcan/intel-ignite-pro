

# Fix: Hook chamado apos early return no Index.tsx

## Problema

O app crasha com o erro "Rendered more hooks than during the previous render" (React error #310 em producao).

**Causa raiz:** No arquivo `src/pages/Index.tsx`, linha 57, o hook `usePrefetchMainPages()` e chamado **depois** do `if (checkingSession) return ...` na linha 45. Na primeira renderizacao, o React so ve os hooks ate a linha 42 (antes do return). Quando `checkingSession` vira `false`, o React tenta executar `usePrefetchMainPages()` -- um hook a mais que nao existia antes. Isso viola a regra de hooks do React e crasha o app.

## Correcao

Mover `usePrefetchMainPages(!checkingSession)` para **antes** do early return (linha 43), passando `!checkingSession` para que o prefetch so execute apos a verificacao de sessao.

### Arquivo: `src/pages/Index.tsx`

**Linha 57** — remover `usePrefetchMainPages();`

**Linha 43** (antes do `if (checkingSession)`) — adicionar:
```typescript
usePrefetchMainPages(!checkingSession);
```

O hook ja aceita um parametro `enabled`, entao nenhuma outra mudanca e necessaria. Resultado: uma unica linha movida, app volta a funcionar.

