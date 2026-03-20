

## Plano: Refinamento Visual dos Mockups

### Problemas identificados (comparando screenshot atual com spec)

1. **Elemento `text`** no FrameRenderer usa `text-sm` (14px) — deveria ser 11px como o resto do mockup
2. **Elemento `divider`** usa `my-2` (8px cada lado) — deveria ser `my-1` (4px cada lado)
3. **MockupChrome body** não tem layout flex — elementos filhos ficam sem controle de espaçamento
4. **StepContent**: título `text-lg` (18px) pode ser reduzido para `text-base` (16px); badge `px-3 py-1.5` pode ser `px-2 py-1`

### Arquivos e mudanças

**1. `src/components/lessons/v10/PartB/FrameRenderer.tsx`**
- Linha 32: trocar `className="text-sm text-gray-800 leading-relaxed"` por inline style `fontSize: 11, color: '#374151', lineHeight: 1.4`
- Linha 118: trocar `my-2` por `my-1` no divider

**2. `src/components/lessons/v10/PartB/MockupChrome.tsx`**
- Linha 35: adicionar `display: 'flex', flexDirection: 'column', gap: 4` ao body div para espaçamento uniforme entre elementos

**3. `src/components/lessons/v10/PartB/StepContent.tsx`**
- Linha 37: título de `text-lg` para `text-base` (16px)
- Linha 52: badge padding de `px-3 py-1.5` para `px-2 py-1`

### Resultado esperado
Mockups mais compactos e alinhados com a referência SDR. Nenhum passo de 1 frame deveria precisar de scroll em 420×780.

