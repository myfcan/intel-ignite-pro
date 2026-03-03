
# Auditoria de Performance: Dashboard + Admin

## Metodologia

Analise completa dos arquivos reais do projeto com foco em: chamadas de rede redundantes, imports pesados, re-renders desnecessarios, waterfalls sequenciais e bloqueios no caminho critico de renderizacao.

---

## DASHBOARD (`src/pages/Dashboard.tsx` - 1363 linhas)

### PROBLEMA CRITICO 1: Waterfall sequencial de queries no mount

**Arquivo**: `src/pages/Dashboard.tsx`, linhas 286-458

O `checkAuth` executa queries em CASCATA (uma apos a outra):

```text
1. supabase.auth.getSession()          -- await
2. supabase.from('users').select(...)  -- await
3. fetchTrailsWithProgress(userId)     -- await
   3a. supabase.from('trails').select(...)       -- await
   3b. supabase.from('lessons').select(...)      -- await
   3c. supabase.from('user_progress').select(...)-- await
   3d. supabase.from('courses').select(...)      -- await (condicional)
   3e. supabase.from('lessons').select(...)      -- await (por course_id)
```

**Total**: 5-7 queries sequenciais. Cada uma espera a anterior terminar.

**Impacto**: Se cada query leva ~100-200ms, o Dashboard leva 500-1400ms so em queries, ANTES de renderizar qualquer conteudo.

**Correcao**: Paralelizar queries 3a, 3b, 3c com `Promise.all()`. Queries de trails, lessons e user_progress sao independentes.

### PROBLEMA CRITICO 2: `useUserGamification` duplica `getSession()` + query `users`

**Arquivo**: `src/hooks/useUserGamification.ts`, linhas 27-101

Este hook faz INDEPENDENTEMENTE:
- `supabase.auth.getSession()` (retry ate 3x com delay de 300ms)
- `supabase.from('users').select('power_score, coins, patent_level, streak_days, total_lessons_completed')`

O Dashboard JA faz `getSession()` no `checkAuth` (linha 288) e JA busca `users.*` (linha 295-299). Ou seja: **a mesma sessao e buscada 2 vezes e a mesma tabela `users` e consultada 2 vezes**.

**Impacto**: +200-600ms desperdicados (getSession com retry + query duplicada).

**Correcao**: Eliminar a duplicacao. O Dashboard deve buscar os campos de gamificacao na mesma query `users.*` que ja faz, e passar os dados via props/context ao `GamificationHeader`, eliminando o hook `useUserGamification` do Dashboard.

### PROBLEMA CRITICO 3: `DashboardHeader` instancia OUTRO `useUserGamification`

**Arquivo**: `src/components/DashboardHeader.tsx`, linha 27

```tsx
const { showPatentCelebration } = useUserGamification();
```

Isso cria uma TERCEIRA instancia do hook, que faz mais uma chamada `getSession()` + query `users`. Total: **3 chamadas getSession e 3 queries na tabela users no mount do Dashboard**.

**Correcao**: Passar `showPatentCelebration` como prop do Dashboard para o DashboardHeader.

### PROBLEMA CRITICO 4: `useDailyMissions` faz 3-4 queries + possivel edge function call

**Arquivo**: `src/hooks/useDailyMissions.ts`, linhas 51-128

O hook `useDailyMissions` e chamado em DOIS lugares:
1. `DashboardSidebar` -> `MissoesDiarias` (desktop)
2. `MobileQuickStats` -> `MissoesDiarias` (mobile, dentro de collapsible)

Cada instancia faz:
1. `supabase.auth.getSession()` -- mais uma vez
2. `supabase.from('user_daily_missions').select(...)` com join
3. Possivelmente `supabase.functions.invoke('generate-daily-missions')` se nao existirem missoes
4. `supabase.from('user_rewards').select(...)` -- TODAS as rewards, sem filtro de data
5. `supabase.from('user_streaks').select(...)`

E alem disso, cada instancia cria um canal Realtime (linhas 180-204):
```tsx
const channel = supabase.channel('daily-missions-updates')
```

**Impacto**: 2 instancias = 2 canais Realtime + 6-10 queries extras. Rewards sem filtro de data pode retornar centenas de rows.

**Correcao**: 
- Extrair para um contexto compartilhado ou levantar o estado
- Filtrar rewards por data: `.eq('collected', false)` ou `.gte('created_at', today)`
- Renderizar `MissoesDiarias` apenas UMA vez (compartilhada entre mobile/desktop via CSS)

### PROBLEMA CRITICO 5: `useIsAdmin` espera `userId` que depende de `checkAuth`

**Arquivo**: `src/hooks/useIsAdmin.ts` + `src/pages/Dashboard.tsx` linha 89

```tsx
const { isAdmin, canAccessAdmin, loading: adminLoading } = useIsAdmin(user?.id);
```

`user?.id` e `undefined` ate `checkAuth` terminar. O hook mantem `loading=true` ate receber userId. Isso BLOQUEIA o render do Dashboard (linha 466-475):

```tsx
if (loading || adminLoading) { return <LoadingSpinner />; }
```

O Dashboard so renderiza APOS: checkAuth completo + useIsAdmin completo. Sao waterfalls encadeados.

**Correcao**: Buscar roles na mesma chamada inicial (dentro de `checkAuth` ou via `Promise.all` com a query de `user_roles`).

### PROBLEMA 6: 3 IntersectionObservers com 6 thresholds cada

**Arquivo**: `src/pages/Dashboard.tsx`, linhas 131-227

Tres IntersectionObservers identicos (V7, V8, Pro), cada um com `threshold: [0.35, 0.45, 0.55, 0.6, 0.7, 0.85]`. Isso gera callbacks frequentes durante scroll.

**Impacto**: Menor (mas mensuravel em dispositivos low-end). Reduzir thresholds para `[0.5, 0.8]` seria suficiente.

### PROBLEMA 7: `TRAIL_ICONS` e `TRAIL_GRADIENTS` recriados a cada render

**Arquivo**: `src/pages/Dashboard.tsx`, linhas 477-500

Estes objetos estao definidos DENTRO do corpo do componente (apos o `if (loading)`), portanto sao recriados a cada render. Deveriam ser constantes no escopo do modulo.

---

## Resumo de Queries do Dashboard (MOUNT COMPLETO)

| Fonte | Queries | getSession() |
|---|---|---|
| `checkAuth` | 2-3 (users, trails, lessons, progress) | 1 |
| `fetchTrailsWithProgress` | 2-4 (lessons, progress, courses, course-lessons) | 0 |
| `useUserGamification` (#1 Dashboard) | 1 (users) | 1-3 (retry) |
| `useUserGamification` (#2 DashboardHeader) | 1 (users) | 1-3 (retry) |
| `useIsAdmin` | 1 (user_roles) | 0 |
| `useDailyMissions` (#1 Sidebar) | 3-5 (missions, rewards, streaks + edge fn) | 1 |
| `useDailyMissions` (#2 Mobile) | 3-5 (missions, rewards, streaks + edge fn) | 1 |

**TOTAL: 13-22 queries + 4-8 chamadas getSession() + 2 canais Realtime**

### Performance ideal apos correcoes:

| Fonte | Queries | getSession() |
|---|---|---|
| `checkAuth` unificado | 1 (users + gamification) | 1 |
| `fetchData` paralelo | 4 em Promise.all (trails, lessons, progress, roles) | 0 |
| `courses` (condicional) | 2 (courses + course-lessons) | 0 |
| `dailyMissions` (unico) | 3 (missions, rewards filtradas, streaks) | 0 |

**TOTAL: 8-10 queries + 1 getSession() + 1 canal Realtime**

Reducao: **~60% menos queries, ~80% menos chamadas getSession()**

---

## ADMIN (`src/pages/Admin.tsx` - 465 linhas)

### PROBLEMA 1: Import estatico de JSON de 420 linhas

**Arquivo**: `src/pages/Admin.tsx`, linha 31

```tsx
import V7Aula1InputModelo from '@/data/v7-aula1-input-modelo.json';
```

Este JSON (420 linhas, ~15-20KB) e importado ESTATICAMENTE e incluido no bundle do Admin. E usado APENAS para copiar para clipboard (linha 54).

O mesmo JSON e importado em MAIS 3 arquivos: `AdminModelos.tsx`, `AdminV7Pipeline.tsx`, `AdminV7vv.tsx`.

**Impacto**: ~20KB adicionado ao bundle do Admin sem necessidade.

**Correcao**: Usar `import()` dinamico no `copyJsonToClipboard`:
```tsx
const copyJsonToClipboard = async () => {
  const { default: json } = await import('@/data/v7-aula1-input-modelo.json');
  await navigator.clipboard.writeText(JSON.stringify(json, null, 2));
};
```

### PROBLEMA 2: Query de roles sem cache

**Arquivo**: `src/pages/Admin.tsx`, linhas 39-50

```tsx
useEffect(() => {
  const checkRole = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { data: roles } = await supabase
      .from('user_roles').select('role').eq('user_id', session.user.id);
    setIsAdminRole((roles || []).some(r => r.role === 'admin'));
  };
  checkRole();
}, []);
```

O `AdminRoute` wrapper JA verificou roles antes de renderizar o Admin. Esta query e REDUNDANTE.

**Correcao**: Receber `isAdmin` do `AdminRoute` via contexto ou props, eliminando a query duplicada.

### PROBLEMA 3: Icones Lucide pesados

**Arquivo**: `src/pages/Admin.tsx`, linhas 3-24

O Admin importa **21 icones Lucide**. Com tree-shaking do Vite isso e aceitavel, mas combinado com os icones do Dashboard (30+ icones), o bundle total de icones pode ser significativo.

**Impacto**: Menor (~5-10KB gzipped). Nao e prioritario.

### Veredicto Admin

O Admin e leve comparado ao Dashboard. O unico problema real e o JSON importado estaticamente (PROBLEMA 1) e a query de roles redundante (PROBLEMA 2).

---

## PLANO DE CORRECOES (Ordem de Impacto)

### Fase 1 - Eliminar duplicacao de queries (maior impacto)
1. Remover `useUserGamification()` do `DashboardHeader.tsx` — passar `showPatentCelebration` como prop
2. No Dashboard, unificar a query `users` do `checkAuth` com os campos de gamificacao, eliminando uma instancia de `useUserGamification`
3. Integrar `user_roles` na mesma fase de fetch do `checkAuth`, eliminando o waterfall com `useIsAdmin`

### Fase 2 - Paralelizar queries
4. Converter o waterfall de `fetchTrailsWithProgress` para `Promise.all([trails, lessons, progress])`

### Fase 3 - Unificar MissoesDiarias
5. Renderizar `MissoesDiarias` uma unica vez e controlar visibilidade via CSS (hidden/block), eliminando a segunda instancia do hook e o segundo canal Realtime
6. Filtrar `user_rewards` com `.eq('collected', false)` em vez de buscar todas

### Fase 4 - Admin
7. Converter import do JSON para dinamico no `Admin.tsx`
8. Remover query de roles redundante no `Admin.tsx` (ja verificada pelo `AdminRoute`)

### Fase 5 - Micro-otimizacoes
9. Mover `TRAIL_ICONS`, `TRAIL_GRADIENTS`, `TRAIL_CATEGORY_MAP` para fora do componente
10. Reduzir thresholds dos IntersectionObservers de 6 para 2

### Resultado Esperado
- De **13-22 queries** para **8-10 queries** no mount
- De **4-8 chamadas getSession()** para **1**
- De **2 canais Realtime** para **1**
- Reducao estimada de **400-800ms** no tempo de carregamento do Dashboard
- Reducao de **~20KB** no bundle do Admin
