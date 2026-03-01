

# Correcao: Scroll automatico no Quiz ao interagir

## Problema Real (Evidencia)

O auto-scroll do `V8LessonPlayer.tsx` (linhas 77-87) so dispara quando `state.currentIndex` muda:

```tsx
useEffect(() => {
  if (state.phase === "content" && state.currentIndex > 0) {
    const timer = setTimeout(() => {
      itemRefs.current[state.currentIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 100);
    return () => clearTimeout(timer);
  }
}, [state.currentIndex, state.phase]);
```

Quando o usuario seleciona uma opcao no quiz e o botao "Confirmar" aparece (via `AnimatePresence`, linha 119-131 de `V8QuizInline.tsx`), **nenhum scroll e disparado**. O mesmo ocorre quando o feedback (correct/wrong) aparece apos confirmar — o card de feedback adiciona altura ao DOM mas nada rola a tela para mostra-lo.

## Correcao

### Arquivo: `src/components/lessons/v8/V8QuizInline.tsx`

Adicionar um `ref` no final do componente e um `useEffect` que dispara `scrollIntoView` sempre que o estado interno do quiz muda (`selected` ou `state`).

1. Importar `useRef` e `useEffect`
2. Criar `bottomRef = useRef<HTMLDivElement>(null)`
3. Adicionar `useEffect` que observa `selected` e `state`:

```tsx
const bottomRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  if (selected || state !== "answering") {
    const timer = setTimeout(() => {
      bottomRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }, 150); // aguarda animacao do AnimatePresence
    return () => clearTimeout(timer);
  }
}, [selected, state]);
```

4. Adicionar `<div ref={bottomRef} />` como ultimo filho do container principal do quiz (antes do `</motion.div>` final, linha 229).

### Por que `block: "nearest"` e nao `block: "center"`

`block: "center"` pode rolar demais para cima, escondendo o conteudo superior. `block: "nearest"` so rola o minimo necessario para tornar o elemento visivel — exatamente o comportamento desejado: se o botao "Confirmar" esta cortado embaixo, rola so o suficiente para mostra-lo inteiro.

## Arquivos alterados

| Arquivo | Mudanca |
|---------|---------|
| `src/components/lessons/v8/V8QuizInline.tsx` | Adicionar bottomRef + useEffect para scroll automatico ao selecionar opcao ou receber feedback |

## O que NAO muda

- Logica de scroll do V8LessonPlayer (continua funcionando para mudanca de currentIndex)
- Logica interna do quiz (estados, onAnswer, onContinue)
- Layout, cores, animacoes do quiz
- Nenhum outro arquivo

