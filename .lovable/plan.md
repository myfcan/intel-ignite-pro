

# Redesign das Conexoes da Skill Tree — De Pontos Fracos para Linhas Premium

## Problema

As conexoes entre os nos da skill tree sao apenas 6 pontos minusculos (raio 2-3px) ao longo de um bezier. Na tela real, parecem quase invisiveis e amadoras — nao comunicam progressao nem conexao visual entre as aulas.

## Solucao

Substituir os pontos por **linhas curvas SVG reais** (paths) com estilo premium:

### Conexao visual

- **Linha principal**: Path SVG curvo (quadratic bezier) com `stroke-width: 3px` para segmentos completos, `2.5px` para ativos, `2px` para locked
- **Stroke dasharray** para locked: `8 6` (tracejado elegante, nao pontilhado)
- **Cores**:
  - Completado: `hsl(258, 70%, 58%)` — violeta solido, opacity 0.9
  - Ativo (proximo desbloqueado): `hsl(258, 50%, 70%)` — violeta medio, com animacao de dash
  - Locked: `hsl(220, 10%, 82%)` — cinza claro, opacity 0.5, tracejado

### Animacao no segmento ativo

- `stroke-dashoffset` animado (efeito de "fluxo" ao longo da linha) para o segmento entre a aula atual e a proxima
- Duracao: 2s, loop infinito, ease linear
- Sem pulsacao de escala (evitar layout shift)

### Pontos decorativos (opcional, sutis)

- Manter 3 pontos (nao 6) apenas nos segmentos completados como "checkpoints"
- Raio: 3.5px com borda de 1px branca para destacar
- Remover pontos dos segmentos locked

## Arquivo Modificado

| Arquivo | Acao |
|---------|------|
| `src/components/lessons/v8/V8SkillTree.tsx` | **Editar** — substituir logica de dots por paths SVG curvos |

## Detalhes Tecnicos

- Usar `<motion.path>` do framer-motion para animar `strokeDashoffset`
- Path: `M x1,y1 Q cx,cy x2,y2` (quadratic bezier, mesmo calculo atual)
- `stroke-linecap: round` para acabamento suave
- `fill: none` — apenas stroke
- Manter mesma logica de `getXOffset` e `ROW_HEIGHT`
- Zero mudancas no V8SkillNode ou V8TrailDetail
