

# Benchmark UX + Plano de Compactação — V10 Part B

## Benchmark: Como os grandes apps de educação tratam telas de tutorial step-by-step

### Dados reais coletados

**Duolingo** (blog.duolingo.com, Mobbin screens):
- Tela de exercício: **zero scroll**. Progress bar no topo, conteúdo centralizado, botão "Check" fixo no bottom. Todo o conteúdo cabe em 1 viewport.
- Máximo de elementos visíveis: 1 pergunta + 4 opções + 1 botão. Nunca mais que isso.
- Padding interno dos cards: 12px (não 16px).

**Brilliant** (LinkedIn post de Justin Volz, análise pública):
- Cada "step" é 1 card que ocupa a viewport inteira. Sem scroll vertical. Transição horizontal entre steps.
- Conteúdo: 1 título curto + 1 visual interativo + 1 botão "Continue" fixo no bottom.

**Mimo** (app público, análise de UX):
- Tutorial de código: progress bar top, 1 bloco de código central, 1 instrução curta, botão fixo bottom. **Zero scroll.**

### Padrão universal identificado
```text
┌─ Progress bar (fixo top) ──────┐
│                                │
│     1 título curto             │
│     1 visual principal         │
│     (mockup/card/quiz)         │
│                                │
│                                │
└─ Botão ação (fixo bottom) ────┘
```
Regra: **tudo cabe em 1 viewport sem scroll.**

---

## Diagnóstico do código atual — Orçamento de pixels (390×696)

Elementos fixos que NÃO scrollam:
- `PlayerHeader`: `pt-3 pb-2` + back button (36px) + progress bar (6px) + phase dots (20px) = **~80px**
- `PlayerBar`: `pt-3 pb-4` + progress row + buttons = **~105px**
- **Disponível para StepContent: ~511px**

Conteúdo atual no StepContent (medição real dos componentes):

| Componente | Código real (padding/gap) | Altura estimada |
|---|---|---|
| Step label `text-xs` | linha 29-34 | ~18px |
| Title `text-lg font-bold` | linha 37-39 | ~26px |
| Description button `min-h-[36px]` | linha 44-58 | ~36px |
| Tool badge `px-3 py-1.5` | linha 62-74 | ~32px |
| Warning chip `min-h-[36px]` | linha 78-93 | ~36px |
| **gap-3 × 5 items** | linha 27 `gap-3` | **~60px** |
| MockupChrome title bar `px-4 py-3` | MockupChrome.tsx:20 | ~70px |
| MockupChrome body `p-4` + elements `gap-3` | MockupChrome.tsx:54 | ~150-300px |
| Tip card `px-4 py-3` | FrameRenderer.tsx:144 | ~50px |
| ActionCard `p-4` | ActionCard.tsx:11 | ~75px |
| ValidationCard `p-4` | ValidationCard.tsx:9 | ~70px |
| Frame dots `min-h-[44px]` | StepContent.tsx:108 | ~44px |
| **gap-4 entre cards** | FrameRenderer.tsx:130 | ~48px |
| **Total** | | **~665-815px** |

**Resultado: 665-815px de conteúdo em 511px de espaço = 30-60% de overflow = scroll pesado.**

---

## Plano de correção — 7 mudanças cirúrgicas

### 1. `StepContent.tsx` — Remover description da UI
**Linha 41-58**: Remover bloco inteiro do "Collapsible description". A description fica no banco para TTS futuro mas não renderiza. Economia: **~36px**.

### 2. `StepContent.tsx` — Combinar badge + warning em 1 linha
**Linhas 61-93**: Envolver tool badge e warning chip num único `<div className="flex items-center gap-2 flex-wrap">`. Economia: **~36px** (elimina 1 item + 1 gap).

### 3. `StepContent.tsx` — Reduzir gap do container
**Linha 27**: `gap-3` → `gap-1.5`. Economia: **~24px** (4 items × 6px savings).

### 4. `MockupChrome.tsx` — Compactar padding
**Linha 20**: `px-4 py-3` → `px-3 py-2` (title bar)
**Linha 54**: `p-4` → `p-3` (body)
**Linha 23**: `mb-2` → `mb-1` (traffic lights margin)
Economia: **~20px**.

### 5. `FrameRenderer.tsx` — Compactar gaps e tip
**Linha 130**: `gap-4` → `gap-2` (entre mockup/tip/action/check)
**Linha 137**: `gap-3` → `gap-2.5` (entre elements internos)
**Linha 144**: `px-4 py-3` → `px-3 py-2` (tip card)
Economia: **~24px**.

### 6. `ActionCard.tsx` — Compactar
**Linha 11**: `p-4` → `px-3 py-2`
**Linha 20**: `mt-2` → `mt-1`
Economia: **~16px**.

### 7. `ValidationCard.tsx` — Compactar
**Linha 9**: `p-4` → `px-3 py-2`
Economia: **~12px**.

### Economia total: ~168px

**Novo total**: ~497-647px em 511px de espaço. Os steps com poucos elements (maioria) cabem sem scroll. Steps com muitos elements terão scroll mínimo (~1 card length).

---

### Arquivos alterados

| Arquivo | Mudança |
|---|---|
| `StepContent.tsx` | Remove description, combina badge+warning, reduz gap |
| `MockupChrome.tsx` | Reduz padding title bar e body |
| `FrameRenderer.tsx` | Reduz gaps e tip padding |
| `ActionCard.tsx` | Compacta padding |
| `ValidationCard.tsx` | Compacta padding |

Nenhuma alteração no banco de dados.

