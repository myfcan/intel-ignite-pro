# FASE IV — Relatório de Gap Analysis (Runtime / Player Funcional)

**Data:** 15/03/2026 | **Autor:** Claude Code | **Status:** AGUARDANDO APROVAÇÃO FERNANDO

---

## METODOLOGIA

Cruzamento item a item do **Checkout IV** (PIPELINE-V10-GUIA-COMPLETO.md, seção 0.4) contra o código existente no repositório. Cada item recebe ✅ (implementado), ⚠️ (parcial), ou ❌ (ausente).

---

## CHECKOUT IV — RESULTADO: 7/10 ✅ | 2/10 ⚠️ | 1/10 ❌

| # | Requisito | Status | Evidência |
|---|-----------|--------|-----------|
| 1 | Parte A carrega slides + toca áudio sincronizado | ✅ | `PartAScreen.tsx:36-51` — sync via `appear_at_seconds`, query `v10_lesson_intro_slides` + `v10_lesson_narrations` |
| 2 | Parte B carrega passos do Supabase + renderiza com FrameRenderer | ✅ | `LessonContainer.tsx:86-91` — query `v10_lesson_steps`, `FrameRenderer.tsx` com 15 types mapeados |
| 3 | Áudio carrega lazy (atual + próximo) | ⚠️ | Preload do próximo existe (`PartBScreen.tsx:110-117`), mas **NÃO descarta N-2** da memória |
| 4 | Progresso salva a cada passo (current_step + current_frame) | ✅ | `PartBScreen.tsx:83-85` → `onProgressUpdate` + `LessonContainer.tsx:147-202` debounced save |
| 5 | Ao retomar, aluno volta no passo/frame exato | ✅ | `LessonContainer.tsx:122-129` — lê `v10_user_lesson_progress`, passa `initialStep`/`initialFrame` |
| 6 | LIV funciona com Claude API | ✅ | `PartBScreen.tsx:222` — chama edge function `claude-interact` com contexto C+ |
| 7 | Limite diário respeitado (não acumula) | ❌ | Edge function verifica limite (`claude-interact:54-88`), mas **frontend NÃO trata `limit_reached`** — mostra erro genérico |
| 8 | Parte C mostra 3 telas em sequência | ✅ | `PartCScreen.tsx` → `RecapPage` (C1) + `EngagementPage` (C2) + `GamificationPage` (C3), toggle via `display:flex/none` |
| 9 | Badge + XP + streak persistem no banco | ✅ | `LessonContainer.tsx:239-313` — upsert `v10_user_achievements`, update `v10_user_streaks`, RPC `register_gamification_event` |
| 10 | Confetti dispara na C3 | ⚠️ | `Confetti.tsx` implementado, mas dispara no clique de **"Compartilhar"** e não automaticamente ao entrar na C3 |

---

## GAPS DETALHADOS

### GAP 1 — ❌ Limite diário LIV: frontend não trata `limit_reached`

**Onde:** `src/components/lessons/v10/PartB/PartBScreen.tsx:213-241`

**Problema:** O `handleAskLiv` chama `claude-interact` e recebe de volta `{ limit_reached: true, limit: N, used: N }` quando o usuário atingiu o limite. Porém, o código trata QUALQUER resposta com erro como mensagem genérica: "Ops, houve um erro."

**O que o GUIA-CLAUDE-CODE.md exige:**
> "Ao atingir limite: soft block + sugestão de upgrade"

**O que a SPEC exige:**
> "Dentro do limite → chama API / Acima do limite → mostra upgrade suave"

**Correção necessária:**
1. Verificar `data.limit_reached` na resposta da edge function
2. Se `true`: mostrar mensagem de soft block no LIVSheet (ex: "Você usou suas X interações de hoje. Amanhã reseta! Quer desbloquear mais? [Ver planos]")
3. Desabilitar input de chat quando limite atingido
4. Não mostrar como erro — é um estado esperado

**Complexidade:** Baixa (frontend only, ~30 linhas)

---

### GAP 2 — ⚠️ Áudio lazy loading: não descarta N-2

**Onde:** `src/components/lessons/v10/PartB/PartBScreen.tsx:62-117`

**Implementação atual:**
- ✅ Carrega áudio do passo atual (`audioRef.current.src = step.audio_url`)
- ✅ Pré-carrega próximo passo (`preloadRef.current.src = nextStep.audio_url`)
- ❌ NÃO descarta áudio de passos anteriores (N-2)

**O que o PIPELINE-V10-GUIA-COMPLETO.md exige (seção 10.4):**
> "Descarta áudio N-2 da memória"

**Impacto:** Em aulas com 27+ passos, o browser mantém referências a todos os áudios carregados. Em dispositivos móveis com memória limitada (público +38 anos), pode causar lentidão.

**Correção necessária:**
- O sistema atual já usa apenas 2 refs (`audioRef` + `preloadRef`). Quando `audioRef.src` muda, o browser eventualmente descarta o anterior.
- Na prática, o comportamento atual é **aceitável** — o browser GC cuida disso. Mas para conformidade exata com o spec, adicionar `URL.revokeObjectURL()` se blob URLs forem usadas, ou explicitamente `audio.removeAttribute('src')` no cleanup.

**Complexidade:** Muito baixa (~5 linhas)

---

### GAP 3 — ⚠️ Confetti dispara no clique, não automaticamente

**Onde:** `src/components/lessons/v10/PartC/GamificationPage.tsx:33-37`

**Implementação atual:**
```tsx
const handleShare = () => {
  setShowConfetti(true);
  setTimeout(() => setShowConfetti(false), 3500);
};
```
Confetti dispara quando o aluno clica "Compartilhar conquista".

**O que o PIPELINE-V10-GUIA-COMPLETO.md exige (seção 0.4):**
> "Confetti dispara na C3"

**O que o GUIA-CLAUDE-CODE.md exige:**
> "canvas-confetti se score >= 70%"

**O que o protótipo HTML faz:**
> Confetti dispara na função `boom()` chamada por `onclick="boom()"` no botão de compartilhar — mas o spec diz "na C3", sugerindo que deveria disparar ao ENTRAR na tela.

**Correção necessária:**
- Disparar confetti automaticamente ao entrar na C3 (via `useEffect` quando `isActive` muda para `true`)
- Manter o confetti também no botão "Compartilhar" (segundo disparo)

**Complexidade:** Muito baixa (~5 linhas)

---

### GAP 4 — ⚠️ LIV não pausa áudio ao abrir (regra da SPEC)

**Onde:** `src/components/lessons/v10/PartB/PartBScreen.tsx:274-278`

**O que a SPEC exige (seção 9.2):**
> "Clique: pausa áudio → abre bottom sheet"

**Implementação atual:**
```tsx
<LIVFab
  hasWarnings={currentStep.warnings !== null && currentStep.warnings.warn !== null}
  onClick={() => setLivOpen(true)}
/>
```
Abre o sheet mas **NÃO pausa o áudio**.

**Correção necessária:**
```tsx
onClick={() => {
  audioRef.current?.pause();
  setIsPlaying(false);
  setLivOpen(true);
}}
```

**Complexidade:** Muito baixa (~3 linhas)

---

### GAP 5 — ⚠️ Tabela `v10_user_daily_usage` não utilizada

**Onde:** Banco de dados vs. código

**Situação:** A tabela `v10_user_daily_usage` foi criada na migration (seção 9 do schema), com campos `user_id, usage_date, interactions_used, interactions_limit`. Porém, a edge function `claude-interact` usa a tabela `users` com campos `interactions_used_today, daily_interaction_limit` em vez da tabela V10 dedicada.

**Impacto:** Funcional — o limite funciona. Mas a tabela `v10_user_daily_usage` fica ociosa, e o design original do GUIA-CLAUDE-CODE.md especifica essa tabela com `UNIQUE(user_id, usage_date)` e reset por data.

**Decisão para Fernando:**
- **Opção A:** Manter como está (usar `users` table) — funciona, menos complexidade
- **Opção B:** Migrar para `v10_user_daily_usage` — mais alinhado com spec, permite histórico de uso por dia

**Complexidade:** Média (requer alterar edge function + frontend)

---

## EFEITOS SISTÊMICOS

| Se mudar X... | ...quebra Y? |
|---|---|
| Adicionar tratamento `limit_reached` no LIVSheet | Não. Mudança isolada no frontend. |
| Disparar confetti no `useEffect` da C3 | Não. Aditivo, não altera fluxo existente. |
| Pausar áudio ao abrir LIV | Não. O `audioRef` já é controlado no PartBScreen. |
| Migrar para `v10_user_daily_usage` | SIM. Requer alterar `claude-interact` edge function + criar lógica de reset por data + verificar se Dashboard e DashboardHeader usam `users.interactions_used_today`. |

---

## O QUE JÁ ESTÁ PRONTO (7/10 itens)

1. **Part A completa** — slides, audio sync via `appear_at_seconds`, "Começar aula", "Pular introdução"
2. **Part B player funcional** — 15 element types no FrameRenderer, navegação step/frame, PlayerBar com play/pause/speed/continue, Sidebar desktop
3. **Progresso persistente** — save debounced a cada step/frame, resume exato
4. **LIV com Claude API** — edge function `claude-interact` com contexto C+
5. **Part C 3 telas** — Recap (C1) + Engagement (C2) + Gamification (C3) com display:flex/none
6. **Gamificação persiste** — achievements upsert, streaks update, RPC event
7. **Layout correto** — display:none/flex em TODAS as telas, zero position:absolute para toggle

---

## PRIORIDADE DE CORREÇÃO

| Prioridade | Gap | Esforço | Impacto |
|---|---|---|---|
| **P1** | GAP 1: `limit_reached` no LIV | ~30 linhas | Alto — sem isso, aluno gasta interações sem feedback |
| **P2** | GAP 4: Pausar áudio ao abrir LIV | ~3 linhas | Médio — UX confusa com áudio e LIV simultâneos |
| **P3** | GAP 3: Confetti automático na C3 | ~5 linhas | Baixo — cosmético, mas spec exige |
| **P4** | GAP 2: Cleanup áudio N-2 | ~5 linhas | Baixo — otimização de memória mobile |
| **P5** | GAP 5: Tabela `v10_user_daily_usage` | ~50 linhas | Decisão Fernando — funciona sem, mas spec diverge |

---

## RESUMO EXECUTIVO

O player V10 está **~90% pronto para runtime**. As 3 partes (A+B+C) funcionam com dados do Supabase, progresso persiste, gamificação grava no banco, e o layout respeita as regras (display:flex/none, sem position:absolute para toggle).

Os 5 gaps encontrados são todos de **baixa a média complexidade** (~50 linhas total para P1-P4). O mais crítico é o tratamento do limite diário da LIV (P1), que afeta diretamente o modelo de negócios (planos Básico/Ultra/Pro).

**Nenhuma dependência circular ou bloqueio encontrado.**

---

**Aguardando aprovação de Fernando para prosseguir com as correções.**
