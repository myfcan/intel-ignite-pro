
## Novos Tipos de Micro-Visuais — Expansão Cinematográfica

### Contexto atual

O sistema atual tem 7 tipos funcionais (`text/text-pop`, `badge/card-reveal`, `image-flash`, `number-count`, `text-highlight`, `highlight`) e 1 bugado (`letter-reveal` retorna `null`). Todos usam Framer Motion com física de mola e glassmorphism.

O problema é que esses tipos são genéricos demais para as situações pedagógicas do AIliv: revelar métricas de renda, mostrar passos numerados de um método, citar frases de impacto, comparar itens lado a lado, etc.

---

### Novos Tipos Propostos (6 novos + 1 fix)

**1. `stat` — Métrica de Impacto com Label**
- Uso: revelar `R$ 50.000/mês`, `98% de taxa`, `3h por dia`
- Visual: número enorme com gradiente verde/ciano, label pequeno embaixo, glow pulsante
- Animação: spring explode do centro, count-up automático se `content.from` e `content.to` presentes
- Som: `count-up`

**2. `step` — Passo Numerado Sequencial**
- Uso: revelar etapas de método (ex: "Passo 1 — Defina o output")
- Visual: pill horizontal com número circulado à esquerda (accent colorido), texto à direita, borda esquerda colorida tipo "timeline"
- Animação: slide-right staggered com `delay = index * 0.15s`
- Som: `click-soft`

**3. `quote` — Citação Editorial de Impacto**
- Uso: revelar frases poderosas, promessas de transformação
- Visual: aspas grandes (decorativas, 120px, cor accent), fonte maior, fundo translúcido com borda esquerda vertical colorida (4px), sem borda top/right/bottom
- Animação: fade + slide-up com efeito de "typewriter" nas palavras (stagger de 0.04s por palavra)
- Som: `reveal`

**4. `pill-tag` — Tag/Etiqueta Contextual**
- Uso: identificar conceitos, categorias, palavras-chave durante narração ("Prompt Engineering", "ChatGPT", "IA Generativa")
- Visual: pill pequeno e compacto com dot colorido à esquerda, background semitransparente, borda sutil
- Animação: pop com bounce spring (stiffness: 500, damping: 20)
- Som: `click-soft`

**5. `comparison-bar` — Barra de Comparação Visual**
- Uso: mostrar diferença entre amador vs profissional, antes vs depois
- Visual: duas barras horizontais sobrepostas com labels e porcentagens, a barra cresce animada da esquerda para direita
- Animação: `scaleX` de 0 a valor-alvo com ease dramatic, segunda barra com delay de 0.3s
- Som: `progress-tick`

**6. `alert` — Alerta/Aviso Urgente**
- Uso: pontuar erros comuns, armadilhas, avisos críticos durante narração
- Visual: fundo vermelho escuro com borda vermelha brilhante, ícone de exclamação à esquerda, texto em branco, shake animation na entrada
- Animação: entrada com `x: [-8, 8, -6, 6, 0]` (shake físico) + glow vermelho pulsante
- Som: `error` ou `transition-whoosh`

**7. `letter-reveal` FIX**
- Atualmente retorna `null` — corrigir para renderizar a letra do acrônimo com rotateY 3D flip
- Visual: letra única grande (8xl) com cor accent, fundo escuro com borda, efeito flip cinematográfico
- Animação: `rotateY: -90 → 0` com spring

---

### Mudanças no Contrato de Tipos (`V7Contract.ts`)

Adicionar os novos tipos ao union `V7MicroVisualType`:
```
| 'stat'           // Métrica grande com label
| 'step'           // Passo numerado  
| 'quote'          // Citação editorial
| 'pill-tag'       // Tag contextual
| 'comparison-bar' // Barra de comparação
| 'alert'          // Alerta urgente
```

E expandir `V7MicroVisual.content` com os campos necessários:
- `stat`: `value`, `label`, `from`, `to`, `prefix`, `suffix`, `color`
- `step`: `stepNumber`, `text`, `color`, `totalSteps`
- `quote`: `quote`, `author`, `color`
- `pill-tag`: `tag`, `color`, `dot`
- `comparison-bar`: `leftLabel`, `leftValue`, `rightLabel`, `rightValue`, `leftColor`, `rightColor`
- `alert`: `text`, `icon`

---

### Mudanças no `V7MicroVisualOverlay.tsx`

**A. `getAnimationVariants`** — adicionar variants para:
- `stat`: scale explode idêntico ao `number-count` mas com spring mais agressivo
- `step`: slide-right com delay via `content.stepNumber`
- `quote`: fade + y suave (não spring — mais editorial)
- `pill-tag`: pop bounce com spring 500/20
- `comparison-bar`: fade simples (as barras animam internamente via `scaleX`)
- `alert`: shake físico `x: [-8,8,-6,6,0]` no animate

**B. `getMicroVisualSound`** — adicionar mapeamentos

**C. `getPosition`** — posições default:
- `stat` → `center`
- `step` → `center` (ou respeita `content.position`)
- `quote` → `center`
- `pill-tag` → `top`
- `comparison-bar` → `center`
- `alert` → `top`

**D. `renderContent` switch** — adicionar 6 novos cases + fix do `letter-reveal`

**E. Novo sub-componente `AnimatedBar`** (interno) para `comparison-bar`:
- Recebe `label`, `value` (0-100), `color`, `delay`
- Usa `motion.div` com `scaleX` animado via `useEffect` + `animate`

---

### Arquivos Alterados

| Arquivo | Operação |
|---|---|
| `src/types/V7Contract.ts` | Expandir `V7MicroVisualType` union + campos de `content` |
| `src/components/lessons/v7/cinematic/effects/V7MicroVisualOverlay.tsx` | Adicionar 6 novos renderers + fix letter-reveal + variants + sounds + positions |

---

### Sem mudanças no banco de dados
Os micro-visuais são definidos no JSON EPP da aula e consumidos pelo player — nenhuma migração necessária.
