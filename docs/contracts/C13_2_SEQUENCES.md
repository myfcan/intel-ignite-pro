# C13.2 — Múltiplos Frames Cinematográficos Estáveis (EPP)

**Status**: ACTIVE  
**Version**: 1.0  
**Created**: 2026-02-18  
**Depends on**: C12.1_HARDENING, C13.1_VISUAL_STANDARDS

---

## Padrão 1: EPP Result (3 Frames)

### Estrutura Narrativa

| Frame | Role | durationMs | Objetivo |
|-------|------|-----------|----------|
| 1 | `tension` | 2500 | Fricção cognitiva antes da clareza |
| 2 | `focus` | 2500 | Momento de execução com IA |
| 3 | `clarity` | 3000 | Resultado premium + copy zone 35% |

### Preset: `epp-result-01@1.0`

### Assets Gerados (T4)

| Run | F1 (tension) | F2 (focus) | F3 (clarity) | Latency |
|-----|-------------|-----------|-------------|---------|
| 1 | `d1724e9d` / `23972383` | `54a40d32` / `2d0f33f7` | `5c4116f6` / `ec9c7c02` | 25.6s / 24.7s / 66.1s |
| 2 | cache_hit | cache_hit | cache_hit | — |
| 3 | cache_hit | cache_hit | cache_hit | — |

### Storage Paths (Run 1)

```
F1: d1724e9d-02fc-4690-875b-f25a65ffe3c2/da02c62f-fcdf-4703-afb4-09c8a4355237/0.png
F2: 54a40d32-0141-4ee7-ae77-4bd4c3e86e00/88a46f88-e5dc-4767-8477-49faf113dc96/0.png
F3: 5c4116f6-34cb-4d40-864e-e6b293563c80/868a0cd1-82bc-48ba-a74e-2155f84bac91/0.png
```

### JSON V7 Reference

```json
{
  "visual": {
    "type": "image-sequence",
    "frames": [
      {
        "id": "result-tension",
        "promptScene": "Adult professional sitting at a modern minimalist desk, slightly tense posture...",
        "durationMs": 2500,
        "storagePath": "d1724e9d-02fc-4690-875b-f25a65ffe3c2/da02c62f-fcdf-4703-afb4-09c8a4355237/0.png",
        "assetId": "23972383-8686-4993-a1e6-a8cbe39e9cea"
      },
      {
        "id": "result-focus",
        "promptScene": "Same adult professional now leaning slightly forward, focused expression...",
        "durationMs": 2500,
        "storagePath": "54a40d32-0141-4ee7-ae77-4bd4c3e86e00/88a46f88-e5dc-4767-8477-49faf113dc96/0.png",
        "assetId": "2d0f33f7-ca8c-4a28-9aa9-2508f59349d6"
      },
      {
        "id": "result-clarity",
        "promptScene": "Adult professional relaxed posture, confident subtle smile...",
        "durationMs": 3000,
        "storagePath": "5c4116f6-34cb-4d40-864e-e6b293563c80/868a0cd1-82bc-48ba-a74e-2155f84bac91/0.png",
        "assetId": "ec9c7c02-1319-417b-bd6f-16cbf74ff350"
      }
    ]
  }
}
```

### Overlay Recomendado (Frame 3)

```json
{
  "microVisuals": [
    { "type": "text", "trigger": "last", "content": { "text": "Clareza gera ação.", "style": "text-pop" } },
    { "type": "badge", "trigger": "last", "content": { "label": "RESULTADO", "variant": "success" } }
  ]
}
```

---

## Padrão 2: EPP Compare (3 Frames)

### Estrutura Narrativa

| Frame | Role | durationMs | Objetivo |
|-------|------|-----------|----------|
| 1 | `before` | 2500 | Monitor genérico/apagado |
| 2 | `transition` | 2500 | Split-screen antes vs depois |
| 3 | `after` | 3000 | Premium + copy zone 30% |

### Preset: `epp-compare-01@1.0`

### Assets Gerados (T5)

| Run | F1 (before) | F2 (transition) | F3 (after) | Latency |
|-----|------------|----------------|-----------|---------|
| 1 | `177ee20e` / `ec95f37d` | `faeaa82c` / `2795ef54` | `8a96c07a` / `dac3cf36` | 51.8s / 52.7s / 23.4s |
| 2 | cache_hit | cache_hit | cache_hit | — |
| 3 | cache_hit | cache_hit | cache_hit | — |

### Storage Paths (Run 1)

```
F1: 177ee20e-42f5-4f1c-8f62-c9b9e75ea29f/75a32ac0-c020-4a9b-b7cc-5a6f2514ce3d/0.png
F2: faeaa82c-8ec9-4499-8c3d-ba35250e94f2/6240cbae-e905-41ec-b981-e09b7bce4d7d/0.png
F3: 8a96c07a-2613-4cd4-a8b6-1746e55c4ab4/a28d646b-d80b-4aa0-82c4-d3acfbfec5b9/0.png
```

### JSON V7 Reference

```json
{
  "visual": {
    "type": "image-sequence",
    "frames": [
      {
        "id": "compare-before",
        "promptScene": "Single computer monitor on clean desk, frontal orthographic perspective...",
        "durationMs": 2500,
        "storagePath": "177ee20e-42f5-4f1c-8f62-c9b9e75ea29f/75a32ac0-c020-4a9b-b7cc-5a6f2514ce3d/0.png",
        "assetId": "ec95f37d-000b-4ec6-af68-82a14b1085ba"
      },
      {
        "id": "compare-transition",
        "promptScene": "Two monitors side by side on modern desk, frontal 85mm orthographic alignment...",
        "durationMs": 2500,
        "storagePath": "faeaa82c-8ec9-4499-8c3d-ba35250e94f2/6240cbae-e905-41ec-b981-e09b7bce4d7d/0.png",
        "assetId": "2795ef54-7f98-4078-b8e8-64cf1dd01a5f"
      },
      {
        "id": "compare-after",
        "promptScene": "Single monitor centered in frame, perfectly frontal orthographic alignment...",
        "durationMs": 3000,
        "storagePath": "8a96c07a-2613-4cd4-a8b6-1746e55c4ab4/a28d646b-d80b-4aa0-82c4-d3acfbfec5b9/0.png",
        "assetId": "dac3cf36-adeb-468f-a92f-d42564e80ad2"
      }
    ]
  }
}
```

### Overlay Recomendado

Frame 1: `badge → "ANTES"`  
Frame 3: `badge → "DEPOIS"` + `text-pop → "Estrutura muda o resultado."`

---

## Invariantes Técnicos

| Regra | Valor |
|-------|-------|
| Máximo frames/sequência | 3 |
| durationMs mínimo/frame | 2000ms |
| Soma total mínima | 6000ms |
| Texto na imagem | ❌ PROIBIDO |
| Copy via overlay | ✅ OBRIGATÓRIO (microVisual) |
| Câmera | 85mm frontal, zero distorção |
| Copy zone | ≥30% em pelo menos 1 frame |
| Compatibilidade DryRun | ✅ C12.1 validation pass |
| Cache determinístico | ✅ Runs 2-3 = cache_hit |

---

## Backward Compatibility

| Aspecto | Impacto |
|---------|---------|
| C01–C12 | ZERO |
| C12.1_HARDENING | ZERO |
| C13.1_VISUAL_STANDARDS | ZERO — aditivo |
| V7ImageSequenceRenderer | ZERO — sem alteração |
| DryRun validation | ZERO — já suporta image-sequence |
| Presets existentes | ZERO — reutiliza epp-result-01 e epp-compare-01 |
