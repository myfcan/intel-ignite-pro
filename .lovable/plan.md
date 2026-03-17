

# Auditoria Forense do Plano — Dados Reais

## 1. Estado Real do Banco

**Trilhas (trails):**
```
order_index=6  | 439b0b03... | "Renda Extra com IA"     | trail_type=v7
order_index=100| c0000010... | "SDR & Automação com IA" | trail_type=v10
```

**Jornadas (courses):**
```
a1b2c3d4-0004... | "Automações Poderosas" | trail_id=439b0b03... (Renda Extra com IA)
```

**V10 Lessons:**
```
b0000001-0001... | "SDR de Voz com IA" | trail_id=439b0b03... (Renda Extra com IA) | status=published
```

A aula V10 "SDR de Voz com IA" aponta para a trilha "Renda Extra com IA" (N1), mas **nao tem nenhum vínculo com a jornada "Automações Poderosas" (N2)**. A tabela `v10_lessons` nao possui coluna `course_id`.

Existe tambem uma trilha orfã `c0000010... | "SDR & Automação com IA"` que nao tem courses nem lessons. Parece lixo.

---

## 2. GAPs Confirmados com Evidência Real

### GAP A: `v10_lessons` nao tem `course_id` — Quebra N1→N2→N3

**Evidência — tabela `v10_lessons` (schema do banco):**
```
Colunas: id, slug, title, description, trail_id, order_in_trail, total_steps, ...
```
Nao existe `course_id`. Comparar com tabela `lessons`:
```
Colunas: id, title, trail_id, course_id, order_index, ...
```

**Efeito sistêmico:**
- V10 lessons ficam penduradas na trilha sem pertencer a nenhuma jornada
- No Dashboard, a trilha "Renda Extra com IA" aparece via `orphanTrails` (linha 154 Dashboard.tsx) pois ela TEM um course mas o course tem 0 lessons da tabela `lessons` ativas. Mas na verdade ela TEM a jornada "Automações Poderosas" — entao ela NAO aparece como orphan. Ela aparece em `rendaExtraCourses` com `totalLessons: 0`.

### GAP B: Dashboard nao mostra V10 lessons no cálculo de progresso

**Evidência — Dashboard.tsx linha 469:**
```typescript
supabase.from('lessons').select('id, trail_id, course_id').eq('is_active', true),
```
Somente tabela `lessons`. A tabela `v10_lessons` **nao é consultada**. Isso significa:
- A jornada "Automações Poderosas" mostra `0/0 aulas` no Dashboard
- O progresso da trilha "Renda Extra com IA" ignora a aula V10 publicada

### GAP C: handleExit do V10 navega para rota inexistente

**Evidência — LessonContainer.tsx linhas 351-356:**
```typescript
const handleExit = useCallback(() => {
  if (lesson?.trail_id) {
    navigate(`/trilha/${lesson.trail_id}`);
  } else {
    navigate('/dashboard');
  }
}, [lesson, navigate]);
```

**Evidência — App.tsx:**
```
Rotas existentes: /trail/:id, /trails/:id
```
A rota `/trilha/:id` **NAO EXISTE**. O handleExit navega para uma página 404. As rotas corretas sao `/trail/:id` ou `/course/:courseId`.

### GAP D: V10 Move Modal nao tem seletor de jornada

**Evidência — AdminManageLessons.tsx linhas 868-908:**
```typescript
<DialogTitle>Mover Aula V10</DialogTitle>
<DialogDescription>Atribua uma trilha e posição para esta aula V10</DialogDescription>
...
<Select value={v10TargetTrailId} onValueChange={setV10TargetTrailId}>
```
Somente trilha + order_in_trail. Sem seletor de jornada. Comparar com o modal de mover lessons normais (linhas 705-779) que TEM seletor de Trilha → Jornada → Posição.

### GAP E: Stage2Structure cria V10 lesson sem course_id

**Evidência — Stage2Structure.tsx linhas 101-109:**
```typescript
const payload = {
  slug: pipeline.slug,
  title: pipeline.title,
  status: 'draft' as const,
  total_steps: 0,
  estimated_minutes: 0,
  tools: [] as string[],
  xp_reward: 0,
  order_in_trail: 0,
};
```
Sem `trail_id`, sem `course_id`. A lesson nasce totalmente órfã.

### GAP F: CreateBpaModal nao tem seletor de trilha/jornada

**Evidência — CreateBpaModal.tsx:** Campos: title, slug, toolName. Nenhum seletor de trilha ou jornada.

### GAP G: Trilha fantasma no banco

**Evidência — query trails:**
```
order_index=100 | c0000010... | "SDR & Automação com IA" | trail_type=v10
```
Esta trilha nao tem courses nem lessons vinculados. Provavelmente foi criada durante testes. Aparece no Admin como opção no seletor mas nao tem utilidade.

### GAP H: Dashboard "Renda Extra PRO" é hardcoded

**Evidência — Dashboard.tsx linha 1142:**
```typescript
<h2 className="text-base sm:text-lg font-bold text-blue-800 tracking-tight whitespace-nowrap truncate">Renda Extra PRO</h2>
```
O titulo da secao é fixo. Deveria derivar do nome da trilha pai (N1).

---

## 3. Plano Revisado — Mudanças Necessárias

### Prioridade 1: Migração DB
- Adicionar coluna `course_id UUID REFERENCES courses(id)` na tabela `v10_lessons` (nullable)
- UPDATE a aula existente: `UPDATE v10_lessons SET course_id = 'a1b2c3d4-0004-4000-8000-000000000004' WHERE id = 'b0000001-0001-4000-8000-000000000001'`
- Considerar deletar trilha fantasma `c0000010-0001-4000-8000-000000000001` (zero uso)

### Prioridade 2: Corrigir handleExit do V10 (BUG ATIVO)
- Arquivo: `src/components/lessons/v10/LessonContainer.tsx` linhas 351-356
- Trocar `/trilha/` por `/trail/` (rota existente)
- Melhor ainda: se `course_id` existir, navegar para `/course/${lesson.course_id}`

### Prioridade 3: Dashboard — incluir V10 lessons no progresso
- Arquivo: `src/pages/Dashboard.tsx` linha 469
- Adicionar query para `v10_lessons` com `status = 'published'`
- Incluir V10 lessons no cálculo de `totalLessons` e `completedLessons` por course

### Prioridade 4: Admin V10 Move Modal — adicionar seletor de jornada
- Arquivo: `src/pages/AdminManageLessons.tsx` linhas 868-908
- Adicionar seletor Trilha → Jornada (igual ao modal de lessons normais linhas 705-779)
- handleMoveV10Lesson: atualizar `trail_id`, `course_id`, `order_in_trail`

### Prioridade 5: Stage2Structure + CreateBpaModal — seletores N1→N2
- Stage2Structure.tsx: adicionar `course_id` ao payload de criação
- CreateBpaModal.tsx: adicionar seletores de trilha e jornada

### Prioridade 6: Dashboard titulo hardcoded
- Dashboard.tsx linha 1142: substituir "Renda Extra PRO" pelo titulo dinâmico da trilha, ou agrupar por trilha com titulo real

### Prioridade 7: Tipo V10Lesson
- `src/types/v10.types.ts` linha ~162: adicionar `course_id: string | null` ao interface `V10Lesson`

### Arquivos impactados

| Arquivo | Linhas | Mudança |
|---------|--------|---------|
| `v10_lessons` (DB) | schema | ADD COLUMN `course_id` |
| `src/types/v10.types.ts` | ~170 | Adicionar `course_id` |
| `src/components/lessons/v10/LessonContainer.tsx` | 351-356 | Corrigir rota `/trilha/` → `/trail/` + usar `course_id` |
| `src/pages/Dashboard.tsx` | 469, 529-543 | Incluir V10 lessons no progresso |
| `src/pages/AdminManageLessons.tsx` | 131, 157, 282-304, 868-908 | Fetch + hierarchy + move com `course_id` |
| `src/components/admin/v10/stages/Stage2Structure.tsx` | 101-109 | Adicionar `course_id` ao payload |
| `src/components/admin/v10/CreateBpaModal.tsx` | form | Adicionar seletores trilha/jornada |
| `src/pages/Dashboard.tsx` | 1142 | Titulo dinâmico |

### Riscos

| Risco | Severidade | Evidência |
|-------|-----------|-----------|
| V10 handleExit navega para 404 | **CRITICO** | Rota `/trilha/:id` nao existe em App.tsx |
| Dashboard mostra jornada com 0 aulas | Alto | Query nao inclui `v10_lessons` |
| Tipos auto-gerados (types.ts) nao atualizam imediatamente | Médio | Após migração, `(supabase as any)` pode ser necessario |
| Trilha fantasma `SDR & Automação com IA` polui seletores | Baixo | Sem dados vinculados |

