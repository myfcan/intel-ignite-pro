

# Auditoria Forense: Gaps Sistêmicos do Plano Revisado

## Dados Reais Verificados

---

## GAP CRÍTICO 1: `id="suas-trilhas"` — posicionamento incorreto no plano

**Estado atual real — Dashboard.tsx linha 1146:**
```typescript
id="suas-trilhas"
```
Está no wrapper da seção "Renda Extra PRO" (linha 1145-1146). Esse wrapper é um `<motion.div>` **condicionado** a `rendaExtraTotal > 0`.

**Plano anterior dizia:** "Mover `id="suas-trilhas"` para o wrapper 'Trilhas' (linha 842-845)."

**Verificação — Dashboard.tsx linhas 842-845:**
```typescript
{/* ===== SECTION TITLE: TRILHAS ===== */}
{(maestriaCourses.length > 0 || rendaExtraCourses.length > 0 || orphanTrails.length > 0) && (
  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 tracking-tight">Trilhas</h2>
)}
```

**Problema:** Linhas 843-845 são um `<h2>` tag, **não um `<div>` wrapper**. Não tem container `div` para receber o `id`. Se colocarmos `id="suas-trilhas"` no `<h2>`, o `scrollIntoView` vai posicionar o scroll **no título**, não na área dos cards. Aceitável visualmente, mas precisa ser um `<div>` wrapper para o scroll funcionar bem.

**Correção real:** Criar um `<div id="suas-trilhas">` que englobe o `<h2>` "Trilhas" + todos os `<TrailSection>` abaixo. Assim o scroll vai para o topo da área de trilhas.

**Referências afetadas (4 pontos, 3 arquivos):**
- Dashboard.tsx linha 743: `document.getElementById('suas-trilhas')`
- Dashboard.tsx linha 805: `document.getElementById('suas-trilhas')`
- MobileQuickStats.tsx linha 159: `document.getElementById('suas-trilhas')`
- DashboardSidebar.tsx linha 115: `document.getElementById('suas-trilhas')`

**Severidade: ALTA** — sem wrapper div, scroll fica subótimo.

---

## GAP CRÍTICO 2: `TRAIL_CATEGORY_MAP` não cobre `order_index=9` (Maestria)

**Estado real — Dashboard.tsx linhas 108-115:**
```typescript
const TRAIL_CATEGORY_MAP: Record<number, string> = {
  1: 'Fundamentos',
  2: 'Profissionais',
  3: 'Negócios',
  4: 'Copyright',
  5: 'Renda Extra',
  6: 'Vendas',
};
```

**Uso real — Dashboard.tsx linha 826:**
```typescript
{TRAIL_CATEGORY_MAP[activeTrail.order_index] || 'Curso'}
```

A Maestria tem `order_index=9`. O map **não tem chave 9**. Se a `activeTrail` for Maestria, o badge mostra `'Curso'` (fallback). Isso **já é o comportamento atual** — não é uma regressão do plano. Mas o plano disse "manter TRAIL_CATEGORY_MAP" sem corrigir essa lacuna.

**Impacto:** Nenhuma regressão. O plano não piora isso. Mas é um bug pré-existente que o plano deveria mencionar como "não corrigido".

---

## GAP 3: V10 Move Modal permite `course_id` vazio

**Estado real — AdminManageLessons.tsx linha 930:**
```typescript
<Button onClick={handleMoveV10Lesson} disabled={movingV10 || !v10TargetTrailId}>
```

**E a função handleMoveV10Lesson — linhas 293-297:**
```typescript
const updatePayload: Record<string, unknown> = {
  trail_id: v10TargetTrailId,
  order_in_trail: v10TargetOrder,
  course_id: v10TargetCourseId || null,
};
```

O botão só exige `v10TargetTrailId`. O `v10TargetCourseId` pode ser vazio, resultando em `course_id: null`. Isso viola a hierarquia N1→N2→N3 e cria V10 orphan dentro de trilha (sem jornada).

O texto na UI diz "Obrigatório para respeitar N1→N2→N3" (linha 919) mas **o código NÃO valida**.

**Correção:** Alterar linha 930 de `!v10TargetTrailId` para `!v10TargetTrailId || !v10TargetCourseId`.

**Severidade: MÉDIA** — permite violação arquitetural.

---

## GAP 4: `trail_type` selector no Create Trail ainda mostra V7/V8/V10

**Estado real — AdminManageLessons.tsx linhas 842-850:**
```typescript
<Select value={newTrailType} onValueChange={(v) => setNewTrailType(v as 'v7' | 'v8' | 'v10')}>
  <SelectTrigger><SelectValue /></SelectTrigger>
  <SelectContent>
    <SelectItem value="v7">V7 (Trilha → Jornada → Aula)</SelectItem>
    <SelectItem value="v8">V8 (Trilha → Jornada → Aula)</SelectItem>
    <SelectItem value="v10">V10 (BPA Step-by-Step)</SelectItem>
  </SelectContent>
</Select>
```

**E o default — linha 120:**
```typescript
const [newTrailType, setNewTrailType] = useState<'v7' | 'v8' | 'v10'>('v7');
```

Conforme a arquitetura N1→N2→N3 é **agnóstica de sistema**, o `trail_type` não determina mais o tipo de aulas que podem ser inseridas. V7, V8 e V10 podem coexistir na mesma trilha. O selector confunde o admin.

**Impacto:** Baixo (funcional). O campo é gravado mas **não filtra nada** no Dashboard (o `fetchTrailsWithProgress` busca `supabase.from('trails').select('*').eq('is_active', true)` sem filtrar por `trail_type`). No entanto, o default `'v7'` é gravado na nova trilha, o que é inconsistente com o modelo.

**Correção:** Remover o selector, hardcoded `trail_type: 'v8'` (ou null). Ou simplificar para apenas um checkbox "V10 Step-by-Step" vs "Padrão".

---

## GAP 5: CSS `.snap-carousel` — **NÃO EXISTE** em nenhum CSS global

**Verificação:**
```
code--search_files: No matches found for pattern 'snap-carousel' in *.css files
```

O CSS é injetado **exclusivamente** na Dashboard.tsx linha 1197-1203 como `<style>` inline, dentro da seção "Renda Extra PRO". Se essa seção for removida e nenhum CSS global for adicionado, **todas as seções que usam `className="snap-carousel"`** perdem o `scrollbar-width: none`.

**Seções que usam `snap-carousel`:**
- Maestria carousel (linha 904): `className="snap-carousel"`
- Pro carousel (linha 1051): `className="snap-carousel"`
- Renda Extra carousel (linha 1206): `className="snap-carousel"`

**Predição pós-execução sem correção:** Todos os carousels mobile mostram scrollbar visível no Firefox/Edge. No Chrome/Safari, `-webkit-scrollbar` não será aplicado.

**Correção:** Adicionar ao `src/index.css`:
```css
.snap-carousel { scrollbar-width: none; -ms-overflow-style: none; }
.snap-carousel::-webkit-scrollbar { display: none; }
```

**Severidade: MÉDIA** — regressão visual em mobile.

---

## GAP 6: Imports orphaned pós-remoção

**Será necessário remover:**
- `TrailCard` (linha 8) — usado APENAS nas linhas 1082, 1128 (seção Pro)
- `Briefcase` (linha 5) — usado APENAS nas linhas 1013, 1084 (seção Pro)
- `Building2` (linha 5) — usado APENAS em `PRO_ICONS` linha 74
- `Scale` (linha 5) — usado APENAS em `PRO_ICONS` linha 75
- `Stethoscope` (linha 5) — usado APENAS em `PRO_ICONS` linha 77
- `Calendar` (linha 5) — usado APENAS em `PRO_ICONS` linha 76
- `Lightbulb` (linha 5) — **CUIDADO**: verificar se usado em outro lugar

**Verificação `Lightbulb`:**
```typescript
// linha 79: 'pro-6': Lightbulb,
```
E no `TRAIL_ICONS` (linha 84-95)? NÃO LOCALIZADO. `Lightbulb` só aparece em `PRO_ICONS`. **Pode ser removido.**

**Severidade: BAIXA** — warning do bundler, sem crash.

---

## GAP 7: `TRAIL_GRADIENTS` — usado ou dead code?

**Estado real — Dashboard.tsx linhas 97-106:**
```typescript
const TRAIL_GRADIENTS: { [key: string]: string } = {
  'Fundamentos IA': 'from-indigo-500 to-indigo-600',
  'Domando as IAs nos Negócios': 'from-violet-500 to-violet-600',
  'Dominando Copyright Com IA': 'from-purple-500 to-purple-600',
  'Renda Extra com IA': 'from-yellow-500 to-yellow-600',
  'IA para Profissionais': 'from-blue-500 to-blue-600',
  'Expert em vendas com IA': 'from-pink-500 to-pink-600',
  'Dominando as IAs Avançado': 'from-amber-500 to-orange-600',
  'Vibe Code: Criando Apps com IA': 'from-emerald-500 to-teal-600',
};
```

**Busca por uso no Dashboard.tsx:** `TRAIL_GRADIENTS` aparece na declaração (linha 97) mas NÃO LOCALIZADO em nenhum outro ponto do arquivo. Nenhum `TRAIL_GRADIENTS[` ou `TRAIL_GRADIENTS.` no resto do código.

**Veredicto:** Dead code. Pode ser removido com segurança.

---

## GAP 8: Admin não tem botão "Nova Trilha" isolado no header

**Estado real — AdminManageLessons.tsx linhas 510-518:**
```typescript
<Button variant="outline" size="sm" className="border-green-500 text-green-600 hover:bg-green-50" onClick={() => setShowCreateCourseModal(true)}>
  <Plus className="w-4 h-4 mr-1" />
  Nova Jornada
</Button>
```

Para criar uma trilha, o admin precisa: clicar "Nova Jornada" → clicar "+ Criar trilha nova" (linha 821) → preencher nome → clicar "Criar Jornada" (que pode ser com título vazio, criando só a trilha).

O fluxo funciona mas é **contra-intuitivo**. O user pediu: "ter opções de criar trilha ou nova jornada > isso é mandatório."

**Correção:** Adicionar botão "Nova Trilha" ao lado de "Nova Jornada" no header, abrindo um modal simplificado (nome + ícone, sem exigir jornada).

**Severidade: MÉDIA** — requisito explícito do user.

---

## RESUMO: Plano Revisado com Correções

### Banco de dados (via insert tool, NÃO migração)
1. Criar trilha "Renda Extra PRO" (`order_index=3, trail_type='v8', is_active=true`)
2. Desvincular 4 courses (`trail_id = NULL`)
3. Orphanar 3 lessons (`trail_id=NULL, course_id=NULL`)

### Arquivos a modificar

| Arquivo | Ação | Gaps corrigidos |
|---|---|---|
| `src/components/dashboard/TrailSection.tsx` | **NOVO** | Encapsula carousel+paginação+observer |
| `src/pages/Dashboard.tsx` | **REFATORAR** | GAPs 1, 5, 6, 7 — wrapper div com IDs, remover dead code, remover inline CSS |
| `src/index.css` | **EDITAR** | GAP 5 — CSS `.snap-carousel` global |
| `src/pages/AdminManageLessons.tsx` | **EDITAR** | GAPs 3, 4, 8 — validar V10 course_id, remover trail_type selector, botão Nova Trilha |

### Checklist 100% pós-execução

| Critério | Status |
|---|---|
| `id="suas-trilhas"` acessível em 3 arquivos | ✅ wrapper div criado |
| `id="tour-trilhas"` na Maestria (DashboardTour + OnboardingCTA) | ✅ via `sectionId` prop |
| `TRAIL_CATEGORY_MAP` funciona em "Continue Sua Lição" | ✅ mantido |
| CSS `.snap-carousel` funcional em mobile | ✅ movido para global |
| Imports limpos (sem warnings) | ✅ removidos |
| V10 Move exige `course_id` | ✅ disabled corrigido |
| Admin pode criar trilha isolada | ✅ botão dedicado |
| `TRAIL_GRADIENTS` removido (dead code) | ✅ |
| Trilhas com 0 courses não aparecem no Dashboard | ✅ filtro no loop |
| Maestria renderizada primeiro | ✅ separada do loop |
| Dados do banco não deletados | ✅ apenas UPDATE/INSERT |

