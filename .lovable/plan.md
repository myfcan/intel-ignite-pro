

# Plano: Upgrade Visual da Skill Tree V8 (Inspirado no Coursiv)

Comparando as screenshots do Coursiv com o estado atual do nosso codigo, existem 5 melhorias especificas a implementar.

---

## O Que Muda (5 Pontos)

### 1. Conexoes mais perceptiveis e grossas

**Atual** (`V8SkillTree.tsx` L59-60):
- `strokeWidth`: 2.5 (completed) ou 1.5 (outros)
- Cores fracas: `hsl(258, 50%, 78%)` para available, `hsl(220, 14%, 88%)` para locked

**Coursiv**: Linhas visivelmente mais grossas (~3-4px), com cor solida violeta para ativas e cinza claro para locked.

**Correcao**:
- `strokeWidth`: 3.5 para completed, 2.5 para available, 2 para locked
- Cores mais fortes: violeta-500 solido para completed, violeta-300 para available, gray-300 para locked
- Remover `strokeDasharray` (tracejado) -- linhas solidas como no Coursiv

### 2. Icones maiores (mantendo nosso estilo moderno)

**Atual** (`V8SkillNode.tsx` L62):
- Container: `w-14 h-14` (56px)
- Icone interno: `w-6 h-6` (24px)

**Coursiv**: Icones visivelmente maiores (~64-72px container)

**Correcao**:
- Container: `w-16 h-16` (64px) -- maior mas ainda arredondado `rounded-2xl`
- Icone interno: `w-7 h-7` (28px)
- Manter nosso gradiente violeta premium (mais moderno que o Coursiv)

### 3. Licoes nao iniciadas ficam desativadas visualmente

**Atual** (`V8SkillNode.tsx` L62-63):
- Locked: `opacity-50` -- muito sutil
- Available (nao iniciado): mesma intensidade visual que in_progress -- NAO diferencia

**Coursiv**: Licoes bloqueadas aparecem com cor palida/lavanda, claramente diferentes das ativas.

**Correcao**:
- Locked: `opacity-40` + background `hsl(250, 20%, 92%)` (lavanda palido) + border mais clara
- Available (nao iniciado ainda): background lavanda medio `hsl(258, 40%, 85%)` -- mais suave que o in_progress/completed que usa violeta forte
- Apenas `in_progress` e `completed` usam o gradiente violeta intenso

### 4. Card de certificado mais realista (mockup visual)

**Atual** (`V8TrailDetail.tsx` L172-208):
- Card simples com icone Lock/Trophy + texto + barra de progresso
- Visual basico, sem impacto

**Coursiv (screenshot 1)**: Card aberto com mockup visual de certificado -- moldura com icone de medalha, texto "Obtenha seu certificado", linhas decorativas simulando o documento.

**Correcao**:
- Redesenhar o card de certificado com um mockup visual inline:
  - Container com borda tracejada fina (simula moldura de certificado)
  - Icone de medalha/award centralizado no topo
  - Texto "Obtenha seu certificado" em bold
  - 2-3 linhas horizontais cinza simulando texto do certificado
  - Abaixo do mockup: texto motivacional + barra de progresso
  - Quando completo: moldura dourada, icone trophy, visual celebratorio

### 5. Efeito de pulso nas linhas de conexao (caminho a seguir)

**Atual**: Linhas estaticas apos animacao inicial de `pathLength`.

**Coursiv**: Sugere visualmente que as linhas sao um caminho ativo.

**Correcao**:
- Adicionar SVG `<animate>` nos segmentos entre o ultimo no concluido e o proximo disponivel
- Efeito: `strokeDashoffset` animado continuamente (dash moving effect) -- simula "energia fluindo" pelo caminho
- Apenas no segmento ATIVO (entre completed e available/in_progress)
- Segmentos ja concluidos: linha solida sem animacao
- Segmentos bloqueados: linha fina estatica

---

## Arquivos Modificados

| Arquivo | Mudancas |
|---|---|
| `src/components/lessons/v8/V8SkillTree.tsx` | Linhas mais grossas, cores mais fortes, efeito pulse no segmento ativo |
| `src/components/lessons/v8/V8SkillNode.tsx` | Icones maiores (64px), estados visuais diferenciados (locked vs available vs active) |
| `src/pages/V8TrailDetail.tsx` | Card de certificado com mockup visual realista |

## Detalhes Tecnicos

### V8SkillTree.tsx - Linhas e Pulse

```text
Segmento COMPLETED:  stroke violet-500, width 3.5, solido
Segmento ATIVO:      stroke violet-400, width 3, dasharray "8 4", dashoffset animado (pulse)
Segmento LOCKED:     stroke gray-300, width 2, solido, opacity 0.6
```

O efeito pulse sera implementado com SVG `strokeDasharray` + `strokeDashoffset` animado via framer-motion `animate={{ strokeDashoffset: [0, -24] }}` em loop infinito -- cria a ilusao de fluxo no caminho.

### V8SkillNode.tsx - Estados Visuais

```text
completed:   bg violeta forte + check icon + sombra violeta
in_progress: bg violeta forte + play icon + pulse ring (ja existe)
available:   bg lavanda medio (hsl 258, 40%, 85%) + icon contextual + sombra leve
locked:      bg cinza palido (hsl 250, 15%, 92%) + lock icon + opacity 40%
```

### V8TrailDetail.tsx - Certificado Mockup

Novo layout do card de certificado com visual de documento:
- Borda `border-dashed border-gray-200` (nao completo) ou `border-amber-300` (completo)
- Interior com icone Award centralizado, linhas decorativas, e barra de progresso no rodape

