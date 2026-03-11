

# Diagnóstico: Hierarquia V8 no Admin "Gerenciar Lições"

## Estado Real do Banco

```text
NÍVEL 1 — Trail "Caminho da Maestria" (trail_type: v8)
  └── 7 courses (jornadas) existem:
       ├── Aterrizando nas IAs
       ├── ChatGPT no máximo
       ├── Dissecando o Gemini
       ├── Claude O melhor
       ├── Midjourney
       ├── Grok
       └── Manus

  └── 0 lessons vinculadas (nem por trail_id, nem por course_id)

ÚNICA AULA V8 existente:
  "O Cérebro do ChatGPT" → trail_id: NULL, course_id: NULL (órfã)
```

A estrutura de 3 níveis **já existe no banco** (`trails` → `courses` → `lessons`). O problema está em dois pontos:

## Problema 1: O Admin Move trata V8 como "sem jornada"

Em `AdminManageLessons.tsx` linha 238:
```typescript
course_id: isV8Trail ? null : targetCourseId,
```
Quando a trilha é V8, o código **força** `course_id: null`. Isso impede vincular aulas V8 a jornadas. A screenshot confirma: "Trilha V8 — aula será movida diretamente (sem jornada)."

## Problema 2: O V8TrailDetail busca por `trail_id` direto, ignorando `course_id`

```typescript
.eq("trail_id", trailId!)  // busca lessons.trail_id = trilha mestre
```
Isso só funciona se a lesson estiver diretamente na trail (sem intermediário course). Se vincularmos lessons ao course, o V8TrailDetail precisará mudar para buscar via course.

## Problema 3: O Dashboard busca V8 courses mas não encontra lessons

Dashboard (linha 512) filtra `allLessons.filter(l => l.course_id === course.id)` — correto, mas como nenhuma aula tem `course_id` preenchido para V8, retorna 0.

---

## Plano de Correção: Habilitar 3 Níveis para V8

### Mudança 1: `AdminManageLessons.tsx` — Modal "Mover"
- Remover a lógica `isV8Trail ? null : targetCourseId` 
- Para trails V8, **exibir o seletor de Jornada** (courses dentro da trail) da mesma forma que V7
- A aula V8 receberá `trail_id` da trail mestre E `course_id` da jornada

### Mudança 2: `AdminManageLessons.tsx` — Hierarquia visual
- Na listagem, exibir aulas V8 **dentro das jornadas** (courses), não como orphanedLessons diretas na trail
- A hierarquia visual ficará: Trail → Course (Jornada) → Lessons

### Mudança 3: `V8TrailDetail.tsx` — Buscar lessons via courses
- Mudar a query para buscar lessons onde `course_id` está em um dos courses da trail (ou manter fallback por `trail_id` para compatibilidade)
- Agrupar lessons por jornada na skill tree (opcional — pode ser fase 2)

### Mudança 4: `AdminV8Create.tsx` — Ao criar aula V8
- Incluir seletor de Jornada (course) além da trail, para que a aula nova já nasça com `course_id` preenchido

### Mudança 5: `Dashboard.tsx` — Já funciona
- O Dashboard já faz `allLessons.filter(l => l.course_id === course.id)` — só precisa que as aulas tenham `course_id` preenchido.

### Sem migrações de banco
A tabela `courses` já existe com `trail_id` FK, e `lessons` já tem coluna `course_id`. Nenhuma alteração de schema necessária.

### Arquivos a editar
1. `src/pages/AdminManageLessons.tsx` — remover bypass V8 no Move, exibir jornadas V8
2. `src/pages/V8TrailDetail.tsx` — buscar lessons via courses da trail
3. `src/pages/AdminV8Create.tsx` — adicionar seletor de jornada

