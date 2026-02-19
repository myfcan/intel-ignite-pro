

## Plano: Corrigir Renderizacao Image-Sequence (C12.1) — 3 Bugs Criticos

### Diagnostico Forense (provado com dados do DB e codigo)

**Lesson ID**: `55f19954-d198-4008-b9cd-5c50173164c5`

**DB confirmado**:
- `phases[0].visual.type` = `image-sequence`
- `phases[0].visual.displayMode` = `NULL` (deveria ser `mockup`)
- `phases[0].anchorActions`: 7 acoes (5 show + 2 trigger)
- Triggers: `evolucao@50.469s -> frameIndex:1`, `premium@57.481s -> frameIndex:2`
- 3 frames com storagePaths validos (UUIDs reais do Image Lab)

---

### Bug 1: `displayMode` perdido pelo Pipeline

**Causa raiz**: O JSON de input envia `displayMode: "mockup"`, mas o pipeline NAO propaga esse campo para o output. No DB, `visual.displayMode` e `null`.

**Evidencia**: Query SQL retornou `display_mode: <nil>`.

**Consequencia**: O renderer usa o default `fullscreen` (L1443 do V7PhasePlayer: `narrativeVisual.displayMode ?? 'fullscreen'`). A imagem ocupa a tela inteira em vez de usar o layout 65/35 com area de titulo.

**Fix**: Verificar o step de compilacao no pipeline v7-vv que monta o `visual` da phase. Garantir que `displayMode` do input seja copiado para o output. Se o pipeline ja foi corrigido para novas execucoes, a correcao pode ser feita apenas no frontend como fallback: quando `presetKey` contem `epp-`, usar `mockup` como default.

**Arquivo**: `supabase/functions/v7-vv/index.ts` (step de compilacao de phases) + fallback no `V7PhasePlayer.tsx` L1443.

---

### Bug 2: V7CinematicCanvas (particulas) conflitando com Image-Sequence

**Causa raiz**: O `V7CinematicCanvas` renderiza particulas e efeitos em canvas absoluto `(absolute inset-0)` com z-index implicitamente abaixo do conteudo, mas com intensidade `high` quando tocando. Para fases `narrative` com `image-sequence`, as particulas da screenshot final (a imagem do cafe) mostram um excesso massivo de particulas.

**Evidencia**: Screenshot 8 — particulas brancas cobrindo quase toda a tela sobre a imagem.

**Fix**: Quando a fase atual tem `visual.type === 'image-sequence'`, reduzir intensidade do canvas para `low` ou desabilitar particulas/rays. O canvas deve servir como fundo sutil, nao competir com o conteudo visual.

**Arquivo**: `V7PhasePlayer.tsx` L2068-2071 — condicionar `intensity` e props do canvas baseado no tipo visual da fase.

---

### Bug 3: Image-Sequence em Fullscreen com `aspect-video` nao preenche a tela

**Causa raiz**: O `V7ImageSequenceRenderer` em modo fullscreen renderiza um `div` com `w-full aspect-video rounded-lg` (L326). Isso cria um container 16:9 centralizado, mas o layout pai (`absolute inset-0 flex items-center justify-center`) centraliza esse container dentro da tela. O resultado: barras pretas em cima e embaixo.

**Evidencia**: Screenshots 1-6 mostram barras pretas no topo/base da imagem.

**Fix**: Em modo fullscreen, o renderer deve usar `absolute inset-0` com `object-cover` para preencher toda a tela, sem `aspect-video`. A classe `rounded-lg` tambem deve ser removida em fullscreen.

**Arquivo**: `V7ImageSequenceRenderer.tsx` L325-329 — alterar layout para fullscreen real.

---

### Bug 4 (Observacao): Imagens do Image Lab sao de assuntos diferentes

As 3 imagens geradas pelo Image Lab sao de produtos diferentes (garrafas vs cafe). Isso NAO e um bug de codigo — e um problema de geracao de assets. O `promptScene` pede "same product scene" mas o Image Lab gerou cenas completamente diferentes.

**Acao**: Isso nao sera corrigido neste plano. E um problema de conteudo/IA generativa, nao de renderizacao. As imagens precisam ser regeneradas ou vinculadas manualmente via V7SceneLinker.

---

### Implementacao (4 alteracoes)

**1. V7PhasePlayer.tsx — Reduzir canvas para fases image-sequence**

Linha ~2068: Condicionar intensidade do canvas:

```text
// Antes:
intensity={effectiveIsPlaying ? 'high' : 'medium'}

// Depois:
intensity={
  (currentPhase as any)?.visual?.type === 'image-sequence' 
    ? 'low' 
    : effectiveIsPlaying ? 'high' : 'medium'
}
```

Tambem desabilitar rays e reduzir glow quando visual e image-sequence.

**2. V7PhasePlayer.tsx — Fallback displayMode para presets EPP**

Linha ~1443: Adicionar fallback inteligente:

```text
// Antes:
displayMode={narrativeVisual.displayMode ?? 'fullscreen'}

// Depois:
displayMode={
  narrativeVisual.displayMode ?? 
  (narrativeVisual.presetKey?.startsWith('epp-') ? 'mockup' : 'fullscreen')
}
```

**3. V7ImageSequenceRenderer.tsx — Fullscreen real (sem aspect-video)**

Alterar o render fullscreen (L325-329) para preencher toda a tela:

```text
// Antes:
<div className="relative z-0 w-full aspect-video rounded-lg overflow-hidden border ...">

// Depois:
<div className="absolute inset-0 z-0 overflow-hidden">
```

E ajustar o `FrameImage` para usar `object-cover` sem `rounded-lg` em fullscreen.

**4. Pipeline v7-vv — Propagar displayMode**

No step de compilacao de phases da edge function, garantir que `visual.displayMode` do input scene seja copiado para o output phase visual. Localizar onde o `visual` e montado e adicionar:

```text
displayMode: scene.visual?.displayMode || undefined,
```

---

### Resultado esperado apos fix

1. Frame 0 aparece desde o inicio (correto para image-sequence) mas em modo **mockup** (65/35 com titulo ao lado)
2. Canvas de particulas sutil (intensidade `low`) para nao competir com as imagens
3. Triggers de frame funcionam nos tempos corretos (evolucao@50.4s, premium@57.4s) — ja confirmado que o crossing detection funciona
4. Em fullscreen, a imagem preenche toda a tela sem barras pretas

