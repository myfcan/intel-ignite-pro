

# Correção: Cards uniformes na seção Renda Extra PRO

## Problema confirmado no código

Dois locais em `Dashboard.tsx` renderizam orphan trails com `TrailCard` em vez de `V8TrailCard`, causando diferença de tamanho/estilo:

1. **Mobile carousel** (linha 1254): `<TrailCard>` para orphan trails
2. **Desktop grid** (linha 1328): `<TrailCard>` para orphan trails

Os courses já usam `V8TrailCard` corretamente. A mistura dos dois componentes gera cards com alturas e estilos diferentes.

## Correção (2 pontos no mesmo arquivo)

### `Dashboard.tsx` — Mobile carousel (linhas 1254-1262)
Substituir `TrailCard` por `V8TrailCard`:
```tsx
<V8TrailCard
  trailId={trail.id}
  title={trail.title}
  description={trail.description || ''}
  icon={trail.icon || '📘'}
  lessonCount={trailProgress?.totalLessons || 0}
  completedCount={trailProgress?.completedLessons || 0}
  orderIndex={trail.order_index}
/>
```

### `Dashboard.tsx` — Desktop grid (linhas 1326-1338)
Mesma substituição: `TrailCard` → `V8TrailCard` com as mesmas props acima.

## Verificação de gaps

| Possível gap | Status |
|---|---|
| `V8TrailCard` sem `navigateToId` navega para `/v8-trail/:trailId` — correto para trilhas órfãs? | Sim — a rota `/v8-trail/:trailId` já existe e lista aulas da trilha |
| `TrailCard` import fica órfão? | Não — ainda usado na seção "Desafios PRO" (linhas 1063, 1109) |
| Props incompatíveis? | Não — `V8TrailCard` aceita todas as props necessárias; `icon` e `description` são opcionais |
| Altura uniforme garantida? | Sim — mesmo componente = mesma estrutura DOM = mesma altura |

Nenhum gap encontrado. A correção é cirúrgica: 2 blocos de JSX no mesmo arquivo.

