
# TrailCards Mobile: Carrossel Vertical Estilo Stories

## Objetivo
Transformar os TrailCards no mobile em cards **verticais e estreitos** dentro de um carrossel horizontal com scroll-snap -- o mesmo padrao visual usado por Duolingo, Spotify e Instagram Stories.

## Resultado Visual Esperado

### Mobile (abaixo de 640px)
```text
  [Card1] [Card2] [Card3] [Card4] ...
  | icon | | icon | | icon | | icon |
  |titulo| |titulo| |titulo| |titulo|
  | ===  | | ===  | | ===  | | lock |
  | 2/5  | | 0/5  | | 3/5  | |      |
  
           o o o . . . .    <-- dots opcionais
```
- 2-3 cards visiveis por vez
- Swipe horizontal com snap suave
- Sem botoes de paginacao

### Tablet e Desktop (640px+)
- Manter o grid atual `sm:grid-cols-2 lg:grid-cols-3` sem mudancas

## Mudancas Tecnicas

### 1. `src/pages/Dashboard.tsx` -- Layout condicional

**No mobile**: substituir o `grid grid-cols-1` por um container flex horizontal:
- `flex overflow-x-auto scroll-snap-type-x-mandatory`
- Esconder scrollbar com CSS (`scrollbar-width: none`, `-webkit-scrollbar`)
- Cada card com largura fixa (~140-150px) e `scroll-snap-align: start`
- Esconder os botoes de paginacao (setas) no mobile
- Adicionar indicadores de dots abaixo do carrossel

**No desktop/tablet**: manter grid `sm:grid-cols-2 lg:grid-cols-3` como esta hoje.

### 2. `src/components/TrailCard.tsx` -- Modo vertical mobile

Usar classes responsivas para alternar entre layout vertical (mobile) e horizontal (desktop):

**Mobile (padrao)**:
- Largura fixa: `w-[140px]` com `flex-shrink-0`
- Header colorido mais quadrado: `h-20`
- Titulo: `text-xs line-clamp-2` (maximo 2 linhas)
- Sem descricao (ocultar para economizar espaco)
- Badge de categoria menor
- Barra de progresso fina na base

**Desktop (`sm:` e acima)**:
- Manter layout atual: largura auto, header `h-28`, descricao visivel, etc.

### 3. CSS scroll-snap nativo

Implementar scroll horizontal usando CSS puro (sem Embla ou outra lib):
- `scroll-snap-type: x mandatory` no container
- `scroll-snap-align: start` em cada card
- `-webkit-overflow-scrolling: touch` para suavidade no iOS
- Padding lateral para que o primeiro e ultimo card nao colem na borda

### Arquivos modificados
1. `src/components/TrailCard.tsx` -- classes responsivas para modo vertical no mobile
2. `src/pages/Dashboard.tsx` -- container flex com scroll-snap no mobile, grid no desktop
