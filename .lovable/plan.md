
Objetivo: corrigir definitivamente o Skill Tree para que nenhuma aula fique “fora da trilha” e todos os passos tenham conectores visíveis, no layout atual (768px de largura) e em mobile.

1) Diagnóstico (causa raiz)
- O desalinhamento vem de coordenadas em sistemas diferentes:
  - Nodes: posicionados em `%` da largura real do container.
  - SVG: desenhado com `viewBox` fixo (`400`) + `preserveAspectRatio="xMidYMin meet"`, que centraliza e “encolhe” o trilho em telas mais largas.
- Resultado: os conectores ficam numa coluna mais estreita que os nodes, parecendo aula fora da trilha ou sem conexão.

2) Correção estrutural no `V8SkillTree.tsx`
- Unificar fonte de verdade de posição X:
  - Criar helper único `getNodeXPercent(index)` e usar esse helper tanto para node quanto para path.
- Sincronizar SVG com largura real:
  - Medir largura do container (ResizeObserver + ref).
  - Trocar `viewBox` para largura dinâmica (`0 0 ${treeWidth} ${totalHeight}`) e recalcular `x` dos paths com base em `treeWidth`.
  - Remover dependência do `viewBox=400` fixo (principal causa do erro).
- Garantir conector em 100% dos trechos:
  - Desenhar uma “base rail” suave para todos os segmentos (inclusive bloqueados).
  - Sobrepor trilho de progresso (cor primária) apenas onde aplicável.
  - Assim nunca existe segmento “sem conector”.

3) Ajuste fino de geometria (para parecer trilha contínua)
- Revisar âncoras Y do path para sair da parte inferior do node atual e entrar na parte superior do próximo (sem quebrar visual).
- Ajustar curva cúbica (`C`) para S-curve consistente entre todos os pares de aulas.
- Manter amplitude segura para não sair da área visível em tablet/mobile.

4) Validação visual obrigatória
- Validar nos breakpoints principais:
  - mobile estreito, 768px (seu caso), desktop.
- Conferir 3 cenários:
  - lista toda completed,
  - mistura de available/completed,
  - vários locked.
- Critério de aceite:
  - todos os nodes alinhados ao trilho,
  - nenhum trecho sem conexão visível,
  - sem clipping lateral.

5) Escopo de arquivos
- Apenas `src/components/lessons/v8/V8SkillTree.tsx` (hotfix principal).
- Se necessário, microajuste em `V8SkillNode.tsx` apenas para âncora visual (sem mudar regra de status).
