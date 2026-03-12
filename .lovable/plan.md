

# Plano: React Query Cache para CourseDetail (Retorno Instantâneo)

## Situação Atual (evidência forense)

**`CourseDetail.tsx` linhas 36-43**: usa `useState` + `useEffect` para fetching manual. Cada navegação para a página re-executa `fetchCourseData()` do zero — 2 round-trips sequenciais (getSession → course → Promise.all).

**`App.tsx` linha 127**: `const queryClient = new QueryClient()` — sem `defaultOptions`, staleTime padrão é 0 (refetch toda vez).

**Outras páginas já usam React Query**: `V8TrailDetail.tsx`, `AllTrails.tsx`, `V8Lesson.tsx` — todas com `useQuery`. CourseDetail é a única página principal que NÃO usa.

**`V7CinematicPlayer.tsx` linha 19**: já usa `useQueryClient()` para invalidação manual de cache pós-completion.

## Implementação (2 arquivos)

### 1. Criar `src/hooks/useCourseDetailQuery.ts`

Hook dedicado que encapsula todo o data fetching atual do CourseDetail em um `useQuery`:

- **queryKey**: `['course-detail', courseId]` — cache por curso
- **queryFn**: exatamente a mesma lógica de `fetchCourseData()` atual (getSession → course → Promise.all de trail/lessons/progress/roles)
- **staleTime**: `5 * 60 * 1000` (5 min) — dados ficam frescos, remount não refetcha
- **gcTime**: `10 * 60 * 1000` (10 min) — mantém em cache mesmo após unmount
- **refetchOnWindowFocus**: `false` — não refetcha só porque o usuário voltou à aba
- **Retorno tipado**: `{ course, trailType, trailTitle, lessons, completedLessonIds, isAdmin }`
- **Auth error handling**: se `getSession()` retorna null, throw `NOT_AUTHENTICATED`

### 2. Refatorar `src/pages/CourseDetail.tsx`

**Remover**: 7 `useState` (course, trailId, trailType, trailTitle, lessons, loading, completedLessons, isAdmin), o `useEffect`, e a função `fetchCourseData`.

**Adicionar**: 
```ts
const { data, isLoading, error } = useCourseDetailQuery(id);
```

**Desestruturar**: extrair `course`, `trailType`, `trailTitle`, `lessons`, `completedLessonIds`, `isAdmin` de `data`.

**Loading**: `isLoading` substitui o antigo `loading` — skeleton exibido via `<CourseDetailSkeleton />`.

**Error**: se `error?.message === 'NOT_AUTHENTICATED'`, navegar para `/auth`. Outros erros mostram toast.

**Invalidação pós-aula**: quando o usuário retorna de uma aula, React Query verifica `staleTime`. Se > 5 min, refetcha automaticamente. Para invalidação imediata (ex: após completar aula), as páginas V8Lesson/V7CinematicPlayer já podem chamar:
```ts
queryClient.invalidateQueries({ queryKey: ['course-detail'] });
```
Isto já é o padrão usado em V7CinematicPlayer (linha 19).

### 3. Invalidação no V8Lesson (cache bust pós-completion)

**Arquivo:** `src/pages/V8Lesson.tsx`

Adicionar `useQueryClient` e chamar `queryClient.invalidateQueries({ queryKey: ['course-detail'] })` no handler de completion/back para que ao retornar o progresso esteja atualizado.

## Resultado

- **Primeira visita**: dados carregados normalmente (skeleton → conteúdo)
- **Retorno (< 5 min)**: renderização instantânea do cache, zero round-trips
- **Retorno (> 5 min)**: refetch automático em background (stale-while-revalidate)
- **Pós-aula**: cache invalidado, progress atualizado no retorno

## Arquivos editados
1. `src/hooks/useCourseDetailQuery.ts` — criar (hook de cache)
2. `src/pages/CourseDetail.tsx` — refatorar para usar o hook
3. `src/pages/V8Lesson.tsx` — invalidar cache pós-completion

