

# Plano Completo: Trilhas e Jornadas Agnósticas de Sistema

## Problema
A coluna `trail_type` na tabela `trails` força separação rígida no frontend: trilhas "v8" são exibidas em seção separada do Dashboard, usam layout diferente no `CourseDetail`, e filtram por tipo no `AllTrails`. Na realidade, qualquer trilha/jornada já contém aulas de qualquer modelo (V5, V7, V8, V10). O tipo do sistema é da **aula**, não da trilha.

---

## Dados Reais do Banco (Confirmados por Query)

```text
trails (is_active=true):
┌─────────────────────────────────────────────┬────────────┬─────────────┐
│ title                                       │ trail_type │ order_index │
├─────────────────────────────────────────────┼────────────┼─────────────┤
│ Tudo que voce precisa saber                 │ v7         │ 1           │
│ IA para Profissionais                       │ v7         │ 2           │
│ Dominando as IAs Avançado                   │ v7         │ 3           │
│ Vibe Code: Criando Apps com IA              │ v7         │ 4           │
│ Dominando Copyright Com IA                  │ v7         │ 5           │
│ Renda Extra com IA                          │ v7         │ 6           │
│ Domando as IAs nos Negócios                 │ v7         │ 7           │
│ Expert em vendas com IA                     │ v7         │ 8           │
│ Caminho da Maestria                         │ v8         │ 9           │
│ SDR & Automação com IA                      │ v10        │ 100         │
└─────────────────────────────────────────────┴────────────┴─────────────┘

courses: 5 jornadas em trilhas v7 + 7 jornadas na trilha v8
lessons: Trilha V8 "Caminho da Maestria" contém 10 aulas model=v5 + 1 aula model=v8
3 trilhas V7 possuem APENAS aulas diretas (sem courses/jornadas)
```

---

## Efeito Sistêmico Completo (10 Arquivos)

| Componente | Referências a `trail_type` | Impacto |
|---|---|---|
| `Dashboard.tsx` | linhas 42, 149, 150, 513, 654 | Separação V7/V8 no fetch e render |
| `CourseDetail.tsx` | linhas 31, 62, 90 | Layout bifurcado + handleBack |
| `AllTrails.tsx` | linhas 12, 14, 22, 69, 79, 87, 102 | Filtro query + título + ícone |
| `AdminManageLessons.tsx` | linhas 71, 128, 325-327, 344, 543-544, 895 | Badge, filtro, lógica criação |
| `AdminV8Create.tsx` | linhas 192, 202 | Fetch trilhas com trail_type |
| `useCourseDetailQuery.ts` | linhas 50, 63 | Fetch trail_type para layout |
| `V8TrailCard.tsx` | linha 52 | Navegação para `/v8-trail/` ou `/course/` |
| `OnboardingCTA.tsx` | linhas 14, 17, 23-24 | Navegação hardcoded V8 |
| `MobileQuickStats.tsx` | linhas 17, 34, 126 | Prop v8TrailId |
| `App.tsx` | linhas 197, 284 | Rotas `/all-trails/:type`, `/v8-trail/:trailId` |

---

## 5 Falhas Preditivas Identificadas e Corrigidas

### FALHA 1 (CRÍTICA): Trilhas V7 sem courses ficam invisíveis

**Evidência — `Dashboard.tsx` linhas 512-539:**
```typescript
const v8TrailIds = trailsData.filter(t => t.trail_type === 'v8').map(t => t.id);
if (v8TrailIds.length > 0) {
  const { data: coursesData } = await supabase
    .from('courses')
    .select('*')
    .in('trail_id', v8TrailIds)
    .eq('is_active', true)
    .order('order_index');
```

Se apenas mudarmos para buscar courses de todas as trilhas, 3 trilhas V7 que possuem APENAS aulas diretas (sem courses) desaparecem do Dashboard.

**Correção:** Manter seção fallback para trilhas sem courses, usando `TrailCard`. Filtro: `trails.filter(t => !allCourses.some(c => c.trail_id === t.id))`.

### FALHA 2 (MÉDIA): `TrailCard` vs `V8TrailCard` — navegação diferente

- `TrailCard.tsx` linha 53: `navigate(/trail/${trail.id})`
- `V8TrailCard.tsx` linha 52: destino `/course/${id}` ou `/v8-trail/${trailId}`

**Correção:** Trilhas com courses → `V8TrailCard`. Trilhas sem courses (aulas diretas) → `TrailCard` navegando para `/trail/{id}`.

### FALHA 3 (MÉDIA): `handleBack` em `CourseDetail.tsx`

```typescript
if (trailType === 'v8') {
  navigate('/dashboard');
} else if (trailId) {
  navigate(`/trail/${trailId}`);
}
```

**Correção:** Simplificar para `navigate('/dashboard')` sempre. Seguro e consistente.

### FALHA 4 (BAIXA — FORA DE SCOPE): 12+ componentes hardcodam `/trail/{id}` pós-aula

`GuidedLessonV4.tsx`, `GuidedLessonV5.tsx`, `GuidedLessonV3.tsx`, `V7PostLessonFlow.tsx`, `Lesson.tsx` — todos usam `navigate(/trail/${trail_id})` ignorando `course_id`.

**Decisão:** Bug pré-existente. Tratar em task separada para evitar scope creep.

### FALHA 5 (BAIXA): Rota `/all-trails/:type` — links existentes quebram

Dashboard usa `navigate('/all-trails/v8')` (linha 849) e `navigate('/all-trails/v7')` (linha 1151).

**Correção:** Tornar `:type` opcional → `/all-trails/:type?`. Se presente, filtra (backward compatible). Se ausente, mostra todas.

---

## Alterações por Arquivo

### 1. `Dashboard.tsx` (maior impacto)
- **Linha 513:** Remover filtro `trail_type === 'v8'` — buscar courses de TODAS as trilhas
- **Linhas 149-150:** Remover separação `v7Trails` / `v8Trails`
- **Seção "Seu Caminho de Maestria":** Renomear para "Suas Jornadas" — exibe TODOS os courses com `V8TrailCard`
- **Seção "Renda Extra PRO":** Manter para trilhas órfãs (sem courses, com aulas diretas)
- **Remover prop `v8TrailId`** de `MobileQuickStats` — substituir por primeiro course disponível
- **Linhas 849, 1151:** Atualizar `navigate('/all-trails/v8')` → `navigate('/all-trails')`

### 2. `CourseDetail.tsx`
- **Linha 90:** Remover `const isV8 = trailType === 'v8'`
- **Linhas 94-178:** Remover bifurcação `if (isV8)` / `else` — usar layout V8 (Certificate + SkillTree) para TODAS as jornadas
- **Linhas 61-69:** `handleBack` → sempre `navigate('/dashboard')`

### 3. `AllTrails.tsx`
- **Linha 22:** Remover `.eq("trail_type", type)` — se `type` presente, filtrar; se ausente, mostrar todas
- **Linhas 69-102:** Remover bifurcação visual V8/V7 — layout unificado usando `V8TrailCard` para todas

### 4. `App.tsx`
- **Linha 197:** Rota `/all-trails/:type` → `/all-trails/:type?` (parâmetro opcional)

### 5. `OnboardingCTA.tsx`
- **Linhas 14, 17:** Remover prop `v8TrailId`
- **Linhas 23-24:** Navegar para primeiro course disponível ao invés de hardcodar `/v8-trail/`

### 6. `MobileQuickStats.tsx`
- **Linha 17:** Remover prop `v8TrailId`
- **Linha 34, 126:** Remover lógica que usa `v8TrailId`

### 7. `AdminManageLessons.tsx`
- **Linhas 325-327:** Remover `effectiveIsV8` — toda trilha pode ter courses
- **Linhas 543-544, 895:** Remover badges condicionais V8/V10
- **Linha 344:** Remover condição que exige jornada apenas para não-V8

### 8. `AdminV8Create.tsx`
- **Linhas 192, 202:** Remover filtro `trail_type` no seletor de trilhas

### 9. `useCourseDetailQuery.ts`
- Sem mudança funcional. `trail_type` permanece como metadado inerte (já é fetchado, não causa dano).

---

## Sem Migration SQL
A coluna `trail_type` permanece no banco como metadado legado. Nenhuma alteração de schema necessária.

## Fora de Scope (Task Separada)
- 12 componentes com `/trail/{id}` hardcoded pós-aula (bug pré-existente)
- `V8TrailDetail.tsx` — funciona para qualquer trilha, sem mudança
- `TrailDetail.tsx` — continua necessário para trilhas sem courses

## Critérios de Sucesso (Zero Regressão)

| Critério | Verificação |
|---|---|
| Acessibilidade de conteúdo | Nenhuma trilha/aula fica invisível |
| Integridade de navegação | Todos os links/botões levam a páginas funcionais |
| Paridade admin | Criação de trilhas/jornadas funciona sem restrição de tipo |
| Backward compatibility | URLs existentes (`/all-trails/v8`) não retornam 404 |

## Riscos Residuais

| Risco | Severidade | Mitigação |
|---|---|---|
| Trilhas sem courses ficam em seção secundária | Baixo | Fallback com `TrailCard` mantém acesso |
| V10 trail usa `v10_lessons` separado | Médio | Não impactado — V10 tem lógica própria de fetch |
| `TrailDetail.tsx` fica "órfão" para trilhas com courses | Baixo | Ainda funcional, apenas redundante |

