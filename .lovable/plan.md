
# Unificar Design dos Cards V8 com V7

## Objetivo
Substituir o card V8 atual (horizontal, glass-morphism, dark) pelo mesmo layout visual do TrailCard V7 (card vertical com header colorido, icone central, badge, barra de progresso), mantendo a paleta de cores V8 (indigo/violet).

## Alteracoes

### 1. V8TrailCard.tsx - Redesign completo
Reescrever o componente para usar a mesma estrutura visual do TrailCard V7:
- Header colorido grande (h-[120px] / sm:h-[148px]) com gradiente indigo/violet em vez de aurora
- Icone centralizado em container glassmorphism
- Circulos decorativos no header
- Body com badge de categoria ("READ & LISTEN"), titulo, descricao (hidden mobile), barra de progresso com contagem (completedCount/lessonCount)
- Borda aurora animada (usando paleta indigo/violet)
- Hover com scale(1.01)
- Exibir horas estimadas (nova prop `estimatedHours`) conforme regra: V8 trail card mostra horas

### 2. Dashboard.tsx - Secao V8
Substituir o container dark atual por um layout identico ao da secao V7:
- **Mobile**: Snap carousel com mesma logica (scroll-snap, IntersectionObserver, dots, scale/saturate transitions)
- **Desktop/Tablet**: Grid paginado (sm:grid-cols-2 lg:grid-cols-3) com animacao de pagina
- Manter o titulo "Seu Caminho de Maestria" e badge "READ & LISTEN" no header da secao
- Remover o fundo dark (#1e1b4b) e usar o mesmo estilo de container da secao V7

### Detalhes Tecnicos

**V8TrailCard.tsx** - Estrutura do card:
```text
+--[aurora border glow (indigo/violet)]--+
|  +--[inner white card]---------------+ |
|  | [Header: gradient indigo->violet]  | |
|  |   [decorative circles]            | |
|  |   [icon in glass container]       | |
|  |                                   | |
|  | [Body]                            | |
|  |   [READ & LISTEN badge] [~Xh]    | |
|  |   [Title]                         | |
|  |   [Description (desktop only)]    | |
|  |   [progress bar] [X/Y]           | |
|  +-----------------------------------+ |
+-----------------------------------------+
```

**Props**: Adicionar `estimatedHours?: number` (opcional, default 0). Reutilizar `order_index` via nova prop para selecionar tema. Navegar para `/v8-trail/{trailId}`.

**Dashboard.tsx** - Secao V8:
- Adicionar refs para snap carousel V8 (snapScrollerRefV8, snapActiveIndexV8, etc.)
- Reutilizar a mesma logica de IntersectionObserver
- Grid paginado no desktop com paginacao propria (trailPageV8)
- Passar dados como objeto `trail` compativel com a interface do card

### Arquivos modificados
1. `src/components/lessons/v8/V8TrailCard.tsx` - Redesign completo
2. `src/pages/Dashboard.tsx` - Layout da secao V8 (carousel mobile + grid desktop)
