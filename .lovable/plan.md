

# Fix: Modal do Report quebrado pelo stacking context do Header

## Problema

O `V8ReportButton` renderiza o modal (backdrop + card) como filhos diretos do componente, que esta dentro do `V8Header`. O header usa `backdrop-blur-lg`, que cria um **novo stacking context CSS**. Isso faz com que `position: fixed` e `z-index` do modal fiquem presos dentro do header, resultando no visual quebrado da screenshot.

## Solucao

Usar **React Portal** (`createPortal`) para renderizar o backdrop e o modal diretamente no `document.body`, escapando do stacking context do header.

## Alteracao

**Arquivo:** `src/components/lessons/v8/V8ReportButton.tsx`

- Importar `createPortal` de `react-dom`
- Envolver o bloco `AnimatePresence` (backdrop + modal) com `createPortal(..., document.body)`
- Zero mudancas visuais ou de logica — apenas onde o DOM e montado

Resultado: o modal aparece centralizado na tela, com backdrop cobrindo tudo, independente de onde o botao esta posicionado.

