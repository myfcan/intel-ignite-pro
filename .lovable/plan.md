

# Análise de Gaps: Mover V5 para Trilha V8 Híbrida

## Estado Atual (Fatos)

**Banco de dados:**
- 10 aulas V5 existem, todas vinculadas a `course_id: a1b2c3d4-0001-4000-8000-000000000001` e `trail_id: efa0c22c-...`
- Jornada alvo "Aterrizando nas IAs" tem `id: 2dc8d3e6-0a5a-4884-98d6-83ab07e40ed3`, dentro da trilha V8 `id: 1089a01c-...`

**Roteamento (CourseDetail.tsx, linhas 42-56):**
- `model === 'v8'` → `/v8/:id`
- `model === 'v7' | 'v7-cinematic'` → `/v7/:id`
- Todos os outros (incluindo V5) → `/lessons-interactive/:id` → `InteractiveLesson` → `GuidedLessonV5`
- Funciona sem mudanças para híbrido.

**Query de lessons (useCourseDetailQuery.ts, linha 52):**
- Busca por `course_id` sem filtro de `model` → V5 e V8 aparecerão juntas normalmente.

---

## Gap Identificado (1 único)

**`V8TrailDetail.tsx` linha 69:** `.eq("model", "v8")` na query de contagem de lessons para progresso da trilha.

- **Impacto:** As 10 aulas V5 movidas para a jornada "Aterrizando nas IAs" NÃO serão contadas no progresso geral da trilha V8 (barra de %, certificado). O usuário verá 0% mesmo com V5 completadas.
- **Fix:** Remover `.eq("model", "v8")` dessa query. Todas as lessons ativas nos courses da trilha devem contar.

---

## Verificação: O que NÃO quebra

| Componente | Risco | Status |
|---|---|---|
| `CourseDetail.tsx` handleLessonClick | V5 cai no fallback correto (`/lessons-interactive/:id`) | Seguro |
| `useCourseDetailQuery.ts` fetchCourseDetail | Busca por `course_id`, sem filtro de model | Seguro |
| `InteractiveLesson.tsx` | Já detecta `model === 'v5'` e renderiza `GuidedLessonV5` | Seguro |
| V8 SkillTree / V8LessonCard | Esses componentes são usados dentro de `CourseDetail` V8 layout — V5 lessons serão exibidas nos mesmos cards genéricos | Seguro |
| `handleBack` em CourseDetail | Se `trailType === 'v8'`, navega para `/dashboard` — funciona | Seguro |
| RLS policies | Lessons públicas via `is_active = true` — model é irrelevante | Seguro |
| Gamification | `register_gamification_event` usa `lesson_id`, não filtra model | Seguro |

---

## Plano de Execução

### 1. Database (INSERT tool — data update)
```sql
UPDATE lessons 
SET course_id = '2dc8d3e6-0a5a-4884-98d6-83ab07e40ed3',
    trail_id = '1089a01c-b8b7-4f01-a039-1e3531af141a'
WHERE model = 'v5' AND is_active = true;
```

### 2. Código: `V8TrailDetail.tsx`
Remover `.eq("model", "v8")` da linha 69, mantendo apenas os filtros `is_active` e `course_id`.

### Resultado
- Trilha V8 exibe jornada "Aterrizando nas IAs" com 10 aulas V5
- Click em aula V5 abre player V5 correto
- Progresso contabiliza V5 + V8 juntas
- Zero impacto em aulas V8 existentes

