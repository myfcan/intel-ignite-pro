

# Análise de Gaps no Plano de Performance — Dashboard → Jornada V8

## O que o plano acerta

1. **getSession() duplicado** — linha 47 e linha 65 de `CourseDetail.tsx`. Confirmado: são 2 round-trips desnecessários ao auth.
2. **Queries sequenciais** — course → trail → lessons → progress são 4 queries em waterfall (~400-1200ms em 4G).
3. **adminLoading bloqueia render** — linha 147: `if (loading || adminLoading)` impede qualquer pixel até o admin check retornar.

## Gaps identificados (3 problemas reais não cobertos)

### Gap 1: `useIsAdmin` é um 3º waterfall separado
O plano fala em "eliminar useIsAdmin como blocker de render" mas não propõe **eliminá-lo como query separada**. Atualmente:
- `initializeUser()` → `setUserId` → dispara `useIsAdmin(userId)` → query a `user_roles`
- `fetchCourseData()` → 4 queries sequenciais

São **dois waterfalls paralelos**, mas `useIsAdmin` adiciona latência própria. O Dashboard já resolveu isso (linha 349-352: busca roles junto com user via `Promise.all`). O CourseDetail deveria fazer o mesmo: buscar `user_roles` **dentro** de `fetchCourseData` junto com trail/lessons/progress, eliminando o hook `useIsAdmin` completamente nesta página.

### Gap 2: `usePrefetch.ts` não inclui `CourseDetail`
O hook de prefetch (usado no Auth e Index) carrega Dashboard, TrailDetail e Onboarding, mas **não** carrega CourseDetail. Como o fluxo V8 principal é Dashboard → CourseDetail, o chunk JS do CourseDetail não está em cache quando o usuário clica. O plano menciona "prefetch do chunk no Dashboard" mas precisa também atualizar `usePrefetch.ts`.

### Gap 3: `select('*')` traz dados desnecessários
Linha 70: `select('*')` na tabela `courses` e linha 88: `select('*')` na tabela `lessons` transferem todas as colunas (incluindo `content`, `exercises`, `word_timestamps` — campos JSONB potencialmente grandes). Para a listagem de aulas, só precisamos de `id, title, description, order_index, estimated_time, difficulty_level, is_active, lesson_type, model`. Isso pode economizar centenas de KB no mobile.

## Plano corrigido (4 otimizações)

### 1. Prefetch do chunk CourseDetail
**Arquivos:** `src/hooks/usePrefetch.ts` + `src/pages/Dashboard.tsx`
- Adicionar `CourseDetail` ao prefetch em `usePrefetch.ts`
- No Dashboard, chamar prefetch do CourseDetail com delay de 2s após mount

### 2. Unificar session + eliminar useIsAdmin + paralelizar queries
**Arquivo:** `src/pages/CourseDetail.tsx`
- Remover `useIsAdmin` hook
- Manter um único `getSession()` no mount
- Após obter o `courseData` (necessário para `trail_id`), disparar em `Promise.all`:
  - query `trails` (trail_type, title)
  - query `lessons` (campos específicos, não `*`)
  - query `user_progress`
  - query `user_roles` (substitui useIsAdmin)

```text
ANTES (5 waterfalls):
  getSession ─► setUserId ─► useIsAdmin(query) 
                           ─► getSession(2) ─► course ─► trail ─► lessons ─► progress
  Total: ~6 round-trips sequenciais

DEPOIS (2 steps):
  getSession ─► course ─► [trail | lessons | progress | roles] em Promise.all
  Total: 2 round-trips sequenciais
```

### 3. Select apenas colunas necessárias
**Arquivo:** `src/pages/CourseDetail.tsx`
- `courses`: `select('id, trail_id, title, description, icon, order_index')`
- `lessons`: `select('id, title, description, order_index, estimated_time, difficulty_level, is_active, lesson_type, model')`

### 4. Render não-bloqueante para admin
**Arquivo:** `src/pages/CourseDetail.tsx`
- Remover `adminLoading` do guard de loading (linha 147)
- Tratar `isAdmin` como `false` enquanto a query de roles roda — aulas ficam locked temporariamente
- Quando roles chega, re-render atualiza o status das aulas

## Resultado esperado
- De ~6 round-trips sequenciais para 2 (getSession + course, depois tudo em paralelo)
- Redução de payload (select específico vs `*`)
- Chunk JS já em cache via prefetch
- Tempo percebido: de ~1.5-2.5s para ~0.4-0.7s no 4G

## Arquivos editados
1. `src/hooks/usePrefetch.ts` — adicionar CourseDetail
2. `src/pages/CourseDetail.tsx` — refactor completo do data fetching

