
# Animacoes de Progresso na Arvore de Habilidades

## Objetivo
Adicionar animacoes visuais que celebram a conclusao de aulas: o no completado pulsa com um efeito de "celebracao" e a linha conectora se preenche com cor de forma animada ate o proximo no.

---

## Mudancas Planejadas

### 1. V8SkillNode.tsx - Animacao de Pulso no No Completado

Adicionar um efeito de pulso radiante nos nos com status `completed`:
- Um anel externo que pulsa suavemente (escala 1 a 1.3, opacidade ciclica) com cor violeta
- Um segundo anel mais externo com pulso mais lento e sutil para criar efeito de "ondas"
- Isso complementa o pulso ja existente no estado `in_progress`, mas com estilo diferente (celebratorio vs. indicativo)

### 2. V8SkillTree.tsx - Animacao de Preenchimento nas Linhas

Melhorar as linhas SVG conectoras entre nos completados:
- Adicionar um gradiente animado nas linhas de nos completados (violeta vibrante)
- Usar uma segunda `path` sobreposta com `strokeDashoffset` animado para criar efeito de "preenchimento fluido" da cor ao longo da curva
- A linha completada tera uma animacao de brilho sutil (glow pulsante via filtro SVG ou opacidade ciclica)
- As linhas entre nos nao completados permanecem tracejadas e cinza (sem mudanca)

### 3. Efeito de Brilho (Glow) nas Linhas Completadas

Adicionar um `filter` SVG com `feGaussianBlur` para criar um efeito de glow nas linhas completadas, dando a impressao de energia fluindo pela arvore.

---

## Detalhes Tecnicos

### V8SkillNode.tsx
```
- Adicionar bloco condicional `isCompleted` com dois `motion.div` absolutos:
  - Anel 1: scale [1, 1.25, 1], opacity [0.4, 0, 0.4], duracao 2.5s, repeat infinito
  - Anel 2: scale [1, 1.4, 1], opacity [0.2, 0, 0.2], duracao 3.5s, repeat infinito
  - Ambos com border violeta e rounded-full
```

### V8SkillTree.tsx
```
- No SVG, adicionar <defs> com filtro de glow:
  <filter id="glow"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge>...</feMerge></filter>

- Para linhas completadas, renderizar duas paths sobrepostas:
  1. Path base (cor solida, strokeWidth 3) - ja existe
  2. Path de glow (mesmo path, filter="url(#glow)", opacity animada 0.4-0.8)
  
- A animacao de pathLength nas linhas completadas tera duracao maior (0.8s)
  para parecer que a "energia" flui pela linha
```

### Arquivos Modificados
- `src/components/lessons/v8/V8SkillNode.tsx`
- `src/components/lessons/v8/V8SkillTree.tsx`
