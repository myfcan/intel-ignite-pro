

# Plano: Vincular 3 jornadas órfãs à Renda Extra PRO

## Estado atual verificado

**Renda Extra PRO** — `id: 2df04129-46a2-4c55-a397-25fef2726787`, `order_index: 3`, `is_active: true` ✅

**3 jornadas selecionadas (trail_id = NULL):**

| Course | ID |
|---|---|
| Domando as IAs nos Negócios | `a1b2c3d4-0002-4000-8000-000000000002` |
| Dominando Copyright Com IA | `a1b2c3d4-0003-4000-8000-000000000003` |
| Automações Poderosas | `a1b2c3d4-0004-4000-8000-000000000004` |

**Jornada que permanece órfã:** Fundamentos da IA (`a1b2c3d4-0001-...`)

## Ação

3 UPDATEs via insert tool:

```sql
UPDATE courses SET trail_id = '2df04129-46a2-4c55-a397-25fef2726787' WHERE id = 'a1b2c3d4-0002-4000-8000-000000000002';
UPDATE courses SET trail_id = '2df04129-46a2-4c55-a397-25fef2726787' WHERE id = 'a1b2c3d4-0003-4000-8000-000000000003';
UPDATE courses SET trail_id = '2df04129-46a2-4c55-a397-25fef2726787' WHERE id = 'a1b2c3d4-0004-4000-8000-000000000004';
```

## Resultado esperado

- Dashboard mostrará **3 seções N1**: Seu caminho para Maestria (7 jornadas), IA para Profissionais (1 jornada), Renda Extra PRO (3 jornadas)
- Nenhuma alteração de código necessária — o `trailSections` já inclui `order_index: 3` no `allowedOrderIndexes`
- Fundamentos da IA permanece órfã (trail_id=NULL), visível no Admin para gestão futura

