
# Diagnóstico Forense — Bugs Identificados nas Screenshots

## O Que Está Errado (3 Bugs Reais)

### BUG #1 — CRÍTICO: microVisuals nunca chegam ao renderer
O player renderiza em `currentPhase.microVisuals` (linha 2145 de V7PhasePlayer.tsx), mas o pipeline persiste os microVisuals dentro de `phase.visual.microVisuals` (step5, linha 192).

```
Pipeline persiste:   phase.visual.microVisuals = [...]
Player lê:           phase.microVisuals → undefined → NADA RENDERIZA
```

Resultado: Nenhum `image-flash` (slideshow), `stat`, `step` ou `comparison-bar` aparece jamais.

### BUG #2 — CRÍTICO: microVisuals do banco chegam sem `triggerTime`
O `V7MicroVisualOverlay` precisa de `mv.triggerTime` (número em segundos) para saber quando exibir cada micro-visual. Mas o banco salva os microVisuals no formato de input cru com `anchorText` (string), sem o `triggerTime` resolvido.

O pipeline (`step4-calculate-anchors.ts`) calcula o timestamp da keyword e salva em `allAnchorActions`, mas **não injeta esse timestamp de volta nos microVisuals**. Quando o player pega `phase.visual.microVisuals`, os objetos têm `anchorText: "VISÃO"` mas `triggerTime: 0` (undefined/zero).

### BUG #3 — Canvas intensity "dramatic" na fase EPP
As screenshots mostram partículas gigantes e explosivas sobre a imagem mockup. O código já prevê `intensity='low'` para `image-sequence`, mas o V7CinematicCanvas está recebendo `mood='energetic'` derivado do tipo da fase (`narrative`), que por padrão gera partículas de alta intensidade que ignoram o `low`.

---

## Solução por Camada (Princípio de Responsabilidade Correta)

### Fix 1 — V7PhasePlayer.tsx: Ler microVisuals do lugar certo
Mudar a leitura de `currentPhase.microVisuals` para `(currentPhase as any).visual?.microVisuals`.

Mas isso ainda não resolve o `triggerTime` ausente — por isso precisamos do Fix 2.

### Fix 2 — V7PhasePlayer.tsx: Resolver triggerTime dos microVisuals em runtime
Criar um `useMemo` que, para cada microVisual em `phase.visual.microVisuals`, resolve o `triggerTime` cruzando o `anchorText` com os `wordTimestamps` disponíveis no player.

Isso é o que o pipeline deveria fazer, mas já que o player tem os `wordTimestamps`, pode fazê-lo em runtime com segurança.

```typescript
const resolvedMicroVisuals = useMemo(() => {
  const rawMvs = (currentPhase as any)?.visual?.microVisuals || [];
  if (!wordTimestamps.length) return rawMvs;
  
  return rawMvs.map((mv: any) => {
    // Se já tem triggerTime resolvido, usar
    if (mv.triggerTime && mv.triggerTime > 0) return mv;
    
    // Resolver via wordTimestamps
    const phaseStart = currentPhase?.startTime ?? 0;
    const phaseEnd = currentPhase?.endTime ?? Infinity;
    const keyword = mv.anchorText || '';
    
    const triggerTime = findMicroVisualTriggerTime(
      keyword, wordTimestamps, phaseStart, phaseEnd
    );
    
    return {
      ...mv,
      triggerTime: triggerTime ?? phaseStart,
      duration: mv.duration ?? 4, // 4s default
    };
  });
}, [currentPhase, wordTimestamps]);
```

### Fix 3 — V7MicroVisualOverlay.tsx: Suporte ao tipo `image-flash` com `content.images` (slideshow)
O usuário está usando `image-flash` com `content.images: []` (array de objetos com `imageUrl`, `description`, `durationMs`). O `ImageFlashContent` atual só exibe uma única imagem (`content.imageUrl` ou `content.storagePath`). Precisa detectar o modo slideshow e renderizar o `ImageFlashSequence` já existente na memória do projeto.

### Fix 4 — V7PhasePlayer.tsx: Suporte aos novos tipos canônicos no `V7MicroVisualOverlay`
Adicionar ao `renderContent()` os cases: `stat`, `step`, `comparison-bar`, `quote`, `pill-tag`, `alert` — que são os tipos que o Dry-Run agora aceita mas o renderer não renderiza, caindo no `default` (que exibe texto genérico).

### Fix 5 — V7CinematicCanvas: Suprimir partículas em image-sequence
O `getCanvasMood` retorna `'energetic'` para type `'narrative'`, mesmo quando a fase tem `visual.type === 'image-sequence'`. Adicionar uma verificação no `getCanvasMood` que retorna `'calm'` quando o visual type for `image-sequence`, complementando o `intensity='low'` já implementado.

---

## Arquivos a Modificar

| Arquivo | Mudança |
|---|---|
| `src/components/lessons/v7/cinematic/V7PhasePlayer.tsx` | Fix 1: ler de `visual.microVisuals` + Fix 2: resolver triggerTime + Fix 5: getCanvasMood para image-sequence |
| `src/components/lessons/v7/cinematic/effects/V7MicroVisualOverlay.tsx` | Fix 3: slideshow no image-flash + Fix 4: novos tipos canônicos (stat, step, comparison-bar, quote, pill-tag, alert) |

---

## Sequência de Implementação

1. Corrigir leitura de `microVisuals` no V7PhasePlayer (Fix 1)
2. Adicionar `resolvedMicroVisuals` com triggerTime em runtime (Fix 2)
3. Corrigir getCanvasMood para image-sequence (Fix 5)
4. Adicionar slideshow ao `ImageFlashContent` (Fix 3)
5. Adicionar os 6 novos tipos canônicos ao `renderContent()` do MicroVisualOverlay (Fix 4)

---

## O que NÃO está errado

- O Dry-Run já aceita os tipos corretamente (fix anterior)
- Os anchorActions de trigger (MARCO1/MARCO2) para image-sequence estão corretos
- O mockup mode do V7ImageSequenceRenderer está funcionando (screenshot mostra a imagem da TV)
- As legendas sincronizadas estão funcionando
- O EPP image-sequence carregou e mostrou a imagem (screenshot 7)
