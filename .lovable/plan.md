
# Redesign da V8TrailDetail: Arvore Vertical de Aulas

## Problema
A pagina de detalhe da jornada V8 (`/v8-trail/:id`) usa um layout de lista simples (cards empilhados verticalmente), identico aos modelos anteriores (V5, V7). O usuario quer um layout de **arvore vertical com nos conectados** (estilo skill-tree / Duolingo), onde cada aula eh um no visual conectado por linhas, criando um caminho de progressao visual.

## Referencia Visual
A segunda screenshot do usuario mostra o modelo desejado:
- Nos (icones) dispostos em zigzag vertical (esquerda-centro-direita)
- Linhas conectando os nos de cima para baixo
- Ao clicar em um no, aparece um popover/card com titulo, descricao e botao "Iniciar a aula"
- Nos completados com cor diferente dos bloqueados
- Certificado ao final do caminho

## Solucao

### 1. Novo componente: `V8SkillTree`
Substituir a lista de `V8LessonCard` por um componente de arvore vertical:

- Cada aula eh um **no circular** (~60x60px) com icone dentro
- Nos posicionados em padrao **zigzag**: centro, direita, centro, esquerda, centro...
- **Linhas SVG** conectando cada no ao proximo (path curvo ou reto)
- Estados visuais dos nos:
  - **Completado**: fundo indigo/verde solido, icone check branco
  - **Disponivel/Em progresso**: fundo indigo com animacao pulse, icone play
  - **Bloqueado**: fundo cinza, icone cadeado, opacity reduzida
- Ao clicar em um no disponivel, abre um **popover/card flutuante** com:
  - Titulo da aula
  - Descricao breve
  - Botao "Iniciar a aula" (gradiente indigo)
- Nos bloqueados nao respondem a clique

### 2. Manter o header existente
O header com gradiente roxo, titulo da trilha e barra de progresso permanece como esta (esta bem feito).

### 3. Card de Certificado
Ao final da arvore, adicionar um card visual de "Obtenha seu certificado" com icone de cadeado (desbloqueavel ao completar todas as aulas).

## Arquivos Modificados

1. **`src/components/lessons/v8/V8SkillTree.tsx`** (NOVO)
   - Componente principal da arvore
   - Recebe array de aulas com status
   - Renderiza nos em zigzag com SVG paths conectando-os
   - Gerencia estado do popover (qual no esta aberto)

2. **`src/components/lessons/v8/V8SkillNode.tsx`** (NOVO)
   - Componente individual de cada no
   - Recebe status (completed/available/in_progress/locked)
   - Estilizacao condicional baseada no status
   - onClick para abrir popover

3. **`src/pages/V8TrailDetail.tsx`** (MODIFICADO)
   - Substituir a secao `<main>` que usa `V8LessonCard` pelo novo `V8SkillTree`
   - Manter toda a logica de queries e calculo de status

## Detalhes Tecnicos

### Layout Zigzag
Os nos serao posicionados usando `flexbox` com alinhamento variavel:
- Indice par: `items-center` (centro)
- Indice impar alternando: `items-end` (direita) e `items-start` (esquerda)

As linhas de conexao usarao SVG `<path>` com curvas bezier entre os centros dos nos.

### Popover
Usar `framer-motion` para animar a entrada do card flutuante (scale + opacity). Posicionado relativamente ao no clicado. Click fora fecha o popover.

### Responsividade
- Mobile: zigzag mais suave (menos offset lateral)
- Desktop: offset lateral mais pronunciado (~120px)
