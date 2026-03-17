

# Plano Completo: 3 Correções Pendentes

O plano anterior foi resumido incorretamente. As 3 divergências reais continuam abertas. Aqui está o plano completo para corrigir todas.

---

## Correção 1: `order_index` da Renda Extra PRO → 3

**Estado atual no banco:** `order_index = 10`
**Esperado:** `order_index = 3`

A trilha "Dominando as IAs Avançado" ocupa `order_index = 3` atualmente. Ela será desativada na Correção 2, liberando o índice.

**SQL (via insert tool):**
```sql
UPDATE trails SET order_index = 3 WHERE id = '2df04129-46a2-4c55-a397-25fef2726787';
```

---

## Correção 2: Desativar 7 trilhas obsoletas

Todas as trilhas que NÃO são Maestria (order_index=9), IA para Profissionais (order_index=2), nem Renda Extra PRO ficam `is_active = false`. Os dados permanecem no banco.

**SQL (via insert tool):**
```sql
UPDATE trails SET is_active = false
WHERE order_index IN (1, 3, 4, 5, 6, 7, 8);
```

Isso desativa: "Tudo que voce precisa saber" (1), "Dominando as IAs Avançado" (3), "Vibe Code" (4), "Copyright" (5), "Renda Extra com IA" (6), "Negócios" (7), "Vendas" (8).

**Ordem de execução:** Correção 2 ANTES da Correção 1 — porque a Correção 2 desativa a trilha em `order_index=3`, e depois a Correção 1 move Renda Extra PRO para `order_index=3`.

---

## Correção 3: Dashboard filtra APENAS as 3 trilhas N1 + título correto

**Arquivo:** `src/pages/Dashboard.tsx`

**3a — Filtro explícito no `trailSections` (linhas 124-155):**

Atualmente o código aceita qualquer trail com courses. Precisa filtrar para apenas as 3 trilhas válidas (order_index 9, 2, 3):

```typescript
const allowedOrderIndexes = new Set([9, 2, 3]);

const trailSections = useMemo(() => {
    const grouped = new Map<string, V8Course[]>();
    for (const course of v8Courses) {
      if (!grouped.has(course.trail_id)) {
        grouped.set(course.trail_id, []);
      }
      grouped.get(course.trail_id)!.push(course);
    }

    const sections: { trail: Trail; courses: V8Course[] }[] = [];
    
    // Maestria first
    if (maestriaTrailId && grouped.has(maestriaTrailId)) {
      const maestriaTrail = trails.find(t => t.id === maestriaTrailId);
      if (maestriaTrail) {
        sections.push({ trail: maestriaTrail, courses: grouped.get(maestriaTrailId)! });
      }
    }

    // Then other ALLOWED trails sorted by order_index
    const otherTrails = trails
      .filter(t => t.id !== maestriaTrailId && grouped.has(t.id) && allowedOrderIndexes.has(t.order_index))
      .sort((a, b) => a.order_index - b.order_index);

    for (const trail of otherTrails) {
      sections.push({ trail, courses: grouped.get(trail.id)! });
    }

    return sections;
}, [v8Courses, trails, maestriaTrailId]);
```

**3b — Título da Maestria (linha 685):**

```typescript
// DE:
trailTitle={section.trail.id === maestriaTrailId ? 'Suas Jornadas' : section.trail.title}
// PARA:
trailTitle={section.trail.id === maestriaTrailId ? 'Seu caminho para Maestria' : section.trail.title}
```

---

## Ordem de Execução

1. `UPDATE trails SET is_active = false WHERE order_index IN (1,3,4,5,6,7,8)` — desativa obsoletas
2. `UPDATE trails SET order_index = 3 WHERE id = '2df04129-...'` — Renda Extra PRO → 3
3. Editar `Dashboard.tsx` — filtro `allowedOrderIndexes` + título "Seu caminho para Maestria"

## Arquivos Impactados

| Arquivo | Ação |
|---|---|
| Banco (trails) | 2 UPDATEs via insert tool |
| `src/pages/Dashboard.tsx` | Filtro + título |

