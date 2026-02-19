

## Plano: Adicionar tipo visual `effects-only`

Permitir cenas sem imagem de fundo que usam apenas efeitos visuais (particulas, glow, vignette) e microVisuals como overlay. Isso resolve o erro de Dry-Run para `visual.type: "none"`.

---

### Alteracoes (4 arquivos, 4 pontos)

**1. Pipeline v7-vv — Whitelist + Schema**
Arquivo: `supabase/functions/v7-vv/index.ts`

- Adicionar `'effects-only'` ao array `VALID_VISUAL_TYPES` (L1716)
- Adicionar entrada no `VISUAL_CONTENT_SCHEMA`: `'effects-only': { required: [], optional: ['instruction', 'effects', 'microVisuals'] }`
- Sem campos obrigatorios — a cena so precisa de efeitos e/ou microVisuals

**2. Diagnostic types — Whitelist**
Arquivo: `src/lib/v7Diagnostic/types.ts`

- Adicionar `'effects-only'` ao array `VALID_VISUAL_TYPES` (L276)

**3. V7PhasePlayer.tsx — Rendering branch**
Arquivo: `src/components/lessons/v7/cinematic/V7PhasePlayer.tsx`

No `case 'narrative':` / `case 'comparison':` (L1433-1455), adicionar um branch para `effects-only` ANTES do fallback de split-screen:

```text
if (narrativeVisual?.type === 'effects-only') {
  // Render nothing — background canvas + microVisuals overlay handle everything
  return null;
}
```

O conteudo visual sera fornecido pelo `V7CinematicCanvas` (particulas/glow ja ativo como background) e pelo `V7MicroVisualOverlay` (que ja renderiza microVisuals da fase atual como overlay independente do tipo visual). Nenhum componente novo e necessario.

**4. Pipeline v7-vv — Compilacao de fase**
Garantir que quando `visual.type === 'effects-only'`, o pipeline copie `effects` e `microVisuals` para o output da fase normalmente (ja ocorre no fluxo generico, mas validar que nao ha skip condicional).

---

### Resultado esperado

- Dry-Run aceita `visual.type: "effects-only"` sem erro
- No player, cenas `effects-only` mostram apenas o canvas de fundo (particulas, glow, vignette) + microVisuals como overlay
- Nenhum componente visual de conteudo e renderizado (sem split-screen, sem image-sequence)
- O JSON do usuario passa com score 100/100 no Dry-Run

