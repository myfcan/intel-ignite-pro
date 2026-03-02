

# Fix: Botão "Continuar Aula" não aparece na fase Done

## Causa raiz

Na correção anterior do scroll, foi adicionada a condição `phase === "done"` para pular o auto-scroll interno:

```typescript
// V8PlaygroundInline.tsx, linha 133 (atual)
if (phase === "intro" || phase === "done") return;
```

O problema: a transição para "done" é **interna** ao Playground (`setPhase("done")`). O rolo externo (`V8LessonPlayer`) NÃO dispara scroll nesse momento porque `state.currentIndex` não muda. Resultado: **nenhum mecanismo** faz scroll até o card "done", e o botão "Continuar Aula" fica abaixo da dobra, invisível.

## Correção

### Arquivo: `src/components/lessons/v8/V8PlaygroundInline.tsx`

Remover `phase === "done"` da condição de skip no useEffect de auto-scroll (linha 133):

**De:**
```typescript
if (phase === "intro" || phase === "done") return;
```

**Para:**
```typescript
if (phase === "intro") return;
```

A guarda `if (!isActive) return;` (linha 132) já é suficiente para evitar que itens inativos sequestrem o scroll. Não há necessidade de bloquear o scroll na fase "done" — é justamente nela que o botão "Continuar Aula" precisa ficar visível.

## Escopo

- 1 linha alterada em 1 arquivo
- 0 mudanças de banco
- 0 risco para o scroll do rolo externo (a guarda `isActive` permanece)

