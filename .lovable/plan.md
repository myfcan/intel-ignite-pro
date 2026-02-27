

# Ajustes de Design nos Cards de Trilha

## Resumo
Tres ajustes cirurgicos no TrailCard conforme solicitado, sem alterar nada mais.

## Alteracoes

### 1. TrailCard.tsx - Dimensoes do card
- **Altura +20px**: O header colorido atual e `h-20` (80px) no mobile. Aumentar para `h-[100px]` (mobile) e `sm:h-[132px]` (desktop, atual 112px + 20px).
- **Largura -10px**: No Dashboard.tsx, o `maxWidth` do snap-item e `340px`. Reduzir para `330px`.

### 2. TrailCard.tsx - Altura do container interno (body)
- O body do card usa `px-2.5 py-2 sm:px-4 sm:py-3`. Aumentar o padding vertical para `py-3 sm:py-4` para preencher o espaco adicional de forma homogenea.

### 3. TrailCard.tsx - Tempo medio de aula
- Adicionar a prop `estimatedTime` (ja existe na interface, default 45) como informacao visivel no card.
- Exibir abaixo do badge de categoria e acima do titulo, com icone de relogio (Clock do lucide-react).
- Formato: `~45 min` em texto discreto (text-[9px] sm:text-[10px], cor cinza).

## Arquivos modificados

1. **`src/components/TrailCard.tsx`**:
   - Header: `h-20` para `h-[100px]`, `sm:h-28` para `sm:h-[132px]`
   - Body padding: `py-2` para `py-3`, `sm:py-3` para `sm:py-4`
   - Adicionar linha com icone Clock + `~{estimatedTime} min` entre o badge e o titulo

2. **`src/pages/Dashboard.tsx`**:
   - Snap-item `maxWidth`: `340` para `330`
   - Passar `estimatedTime` ao TrailCard (valor padrao ja existe como 45)

## O que NAO sera alterado
- Carrossel snap (CSS, IntersectionObserver, dots)
- Cores, gradientes, efeitos aurora
- Layout desktop/grid
- Nenhuma outra secao do Dashboard
