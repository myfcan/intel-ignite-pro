

# Plano Verificado — Layout Desktop + Skip Part A

## Dados reais confirmados

### Bug 1: `max-w-[420px]` — 5 arquivos afetados

Busca exata `max-w-[420px]` em `src/components/lessons/v10/`:

| Arquivo | Linha | Trecho real |
|---|---|---|
| `LessonContainer.tsx` | 423 | `"w-full max-w-[420px] h-dvh flex flex-col overflow-hidden md:rounded-2xl..."` |
| `PartAScreen.tsx` | 104 | `"relative flex flex-col min-h-screen w-full max-w-[420px] mx-auto"` |
| `PartCScreen.tsx` | 60 | `"relative flex flex-col min-h-screen w-full max-w-[420px] mx-auto overflow-y-auto"` |
| `StepContent.tsx` | 24 | `"flex flex-col gap-1.5 max-w-[420px] mx-auto"` |
| `LIVSheet.tsx` | 298 | `"border-t border-indigo-500/30 max-h-[80vh] mx-auto max-w-[420px]"` |

**Nenhum outro arquivo** em `PartB/PlayerHeader`, `PartB/PlayerBar`, `PartC/RecapPage`, `PartC/EngagementPage`, `PartC/GamificationPage`, ou `PartA/IntroSlides` possui `max-w-[420px]`. Confirmado.

**Pipeline:** O pipeline BPA (`Stage7Publish.tsx`) NÃO renderiza componentes de aula — apenas links para `/v10/:slug`. A correção no `LessonContainer` cobre ambos os pontos de entrada (pipeline preview e acesso direto).

### Bug 2: Part A skip — 2 pontos de falha

**Ponto 1 — `LessonContainer.tsx` linha 130:**
```tsx
setCurrentPart(prog.current_part);  // seta 'B' direto se banco tem current_part='B'
```

**Ponto 2 — `LessonContainer.tsx` linha 236:**
```tsx
debouncedSave({ current_part: 'B', current_step: 0, current_frame: 0 });
// current_step: 0 é inconsistente — convenção do sistema é 1-based
```

Referência de consistência — linha 231:
```tsx
debouncedSave({ current_step: step + 1, current_frame: frame });
// handleProgressUpdate já usa 1-based
```

---

## Correções exatas

### 1. `LessonContainer.tsx` — 3 mudanças

**Linha 423:** Container principal responsivo
```
De: max-w-[420px]
Para: max-w-full md:max-w-[680px] lg:max-w-[960px]
```

**Linha 130:** Sempre iniciar em Part A
```tsx
// De:
setCurrentPart(prog.current_part);
// Para:
setCurrentPart('A');
```

**Linha 236:** Fix indexação 0-based
```tsx
// De:
debouncedSave({ current_part: 'B', current_step: 0, current_frame: 0 });
// Para:
debouncedSave({ current_part: 'B', current_step: 1, current_frame: 0 });
```

### 2. `PartAScreen.tsx` linha 104
```
De: max-w-[420px]
Para: max-w-[420px] md:max-w-none
```
Herda largura do container pai no desktop.

### 3. `PartCScreen.tsx` linha 60
```
De: max-w-[420px]
Para: max-w-[420px] md:max-w-none
```

### 4. `StepContent.tsx` linha 24
```
De: max-w-[420px]
Para: max-w-[420px] md:max-w-[680px]
```
Constraint de leitura confortável no desktop.

### 5. `LIVSheet.tsx` linha 298
```
De: max-w-[420px]
Para: max-w-[420px] md:max-w-[680px]
```

---

## Verificação de efeitos colaterais

| Componente | Risco | Status |
|---|---|---|
| **Sidebar desktop** (linha 482): `hidden lg:flex min-w-[260px] max-w-[320px]` | Com `lg:max-w-[960px]` + sidebar 320px = 1280px. Viewport 881px não mostra sidebar (lg=1024px). Sem conflito. | OK |
| **PlayerHeader / PlayerBar** | Sem `max-w-[420px]` — herdam do container. Expandem automaticamente. | OK |
| **FrameRenderer / Mockups** | Possuem constraints internos próprios (`max-w-[340px]`, `max-h-[280px]`). Não afetados. | OK |
| **IntroSlides** | Sem `max-w-[420px]`. Usa `flex-1 flex items-center justify-center w-full`. | OK |
| **RecapPage / EngagementPage / GamificationPage** | Sem `max-w-[420px]`. Herdam do PartCScreen. | OK |
| **ExitButton** | `fixed top-4 right-4` — posição absoluta na viewport. Não afetado por container width. | OK |
| **initialStep com current_step:1** (linha 450) | `Math.max(0, Math.min((1) - 1, steps.length - 1))` = 0. Correto. | OK |
| **Usuários com current_step:0 no banco** | `Math.max(0, (0) - 1)` = `Math.max(0, -1)` = 0. Protegido. | OK |
| **UX ao reabrir aula incompleta** | Vê Part A → pode clicar "Pular introdução" → Part B abre no step/frame salvos. | OK |

## Gap encontrado no plano anterior: NENHUM

O plano cobre todos os 5 arquivos com `max-w-[420px]`, ambos os pontos de falha do skip Part A, e a análise de efeitos colaterais confirma zero risco em componentes adjacentes. Não há banco de dados envolvido nas mudanças de layout. A mudança de `current_step: 0 → 1` é consistente com a convenção 1-based já usada no `handleProgressUpdate`.

**Total: 5 arquivos, ~7 linhas alteradas.**

