

# Plano: Aumentar Largura da Grid V8 (~20%)

## Problema Real (dados do codigo)

| Local | Valor atual | Efeito |
|---|---|---|
| `V8TrailDetail.tsx` L138 | `max-w-xl` (576px) | Header estreito |
| `V8TrailDetail.tsx` L154 | `max-w-xl` (576px) | Container principal estreito |
| `V8SkillTree.tsx` L39 | `viewBox="0 0 300 ..."` | SVG com viewport pequeno |
| `V8SkillTree.tsx` L44 | `getXOffset(i) * 50` | Zigzag com amplitude de apenas 50 unidades |
| `V8SkillTree.tsx` L88 | `getXOffset(i) * 16` (%) | Offset horizontal dos nos: 16% |
| `V8SkillTree.tsx` L140 | `w-[190px] sm:w-[250px]` | Labels de texto estreitas |

## Correcoes (+20% largura, alinhado ao Coursiv)

### V8TrailDetail.tsx
- **L138**: `max-w-xl` para `max-w-2xl` (672px — +17%)
- **L154**: `max-w-xl` para `max-w-2xl` (672px)

### V8SkillTree.tsx
- **L39**: viewBox de `0 0 300` para `0 0 400` (+33% de espaco SVG)
- **L44-46**: Centro SVG de `150` para `200`, offset de `* 50` para `* 70` (amplitude do zigzag +40%)
- **L88**: Offset percentual dos nos de `* 16` para `* 20` (mais espalhados)
- **L140**: Labels de `w-[190px] sm:w-[250px]` para `w-[220px] sm:w-[280px]`

## Arquivos Modificados

| Arquivo | Linhas | Mudanca |
|---|---|---|
| `src/pages/V8TrailDetail.tsx` | L138, L154 | `max-w-xl` para `max-w-2xl` |
| `src/components/lessons/v8/V8SkillTree.tsx` | L39, L44-46, L88, L140 | viewBox 400, centro 200, offset 70, labels maiores |

Nenhuma mudanca de logica, apenas escala visual.
