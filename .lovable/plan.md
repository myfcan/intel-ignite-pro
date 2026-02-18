

# C13.1 — Capacidade Visual Avancada: Presets EPP + Quick Templates

## Resumo

Implementar 2 novos presets cinematograficos (EPP Result e EPP Compare) com prompt templates ultra-detalhados, adicionar Quick Templates no Admin UI para acesso rapido, e documentar a estrutura JSON de cena V7 com microVisuals overlay (sem texto na imagem).

---

## PARTE 1 — Seed dos 2 Novos Presets (DB Insert)

Inserir 2 registros em `image_presets` via migration/insert:

**A) epp-result-01@1.0**
- key: `epp-result-01`
- version: `1.0`
- title: `EPP Result — Prompt Eficiente`
- default_size: `1536x1024`
- prompt_template:

```
Ultra realistic editorial still frame. Adult professional (38-48 years old) at a modern minimalist desk, warm lateral window light casting soft shadows, natural skin texture with visible pores, subtle film grain, shallow depth of field with bokeh background. Minimalist laptop showing clean AI chat interface on screen (absolutely no readable text on any surface). A second object signaling premium result placed naturally on desk (luxury watch, premium leather notebook, or clean white mockup card). Composition must reserve a clean copy zone occupying approximately 35 percent of the frame — an empty uncluttered area with smooth soft-focus background suitable for text overlay placement. Camera: 85mm prime lens, sensor perfectly parallel to subject plane, frontal angle, zero keystone distortion, perfectly straight vertical and horizontal lines. Lighting: warm golden-hour key light from left side, soft fill from right, no harsh shadows. No text anywhere in image, no watermark, no logo, no neon, no hologram, no sci-fi elements. Scene context: {{SCENE}}. Style hints: {{STYLE_HINTS}}.
```

**B) epp-compare-01@1.0**
- key: `epp-compare-01`
- version: `1.0`
- title: `EPP Compare — Antes vs Depois (Frontal)`
- default_size: `1536x1024`
- prompt_template:

```
Two computer displays side by side on a modern clean desk, perfectly frontal orthographic view. Left display shows a generic uninspiring result with flat gray tones, minimal shapes, dull layout, and washed out colors. Right display shows a premium professional result with vibrant high-contrast layout, rich dark tones with gold accents, luxurious aesthetic, and polished composition. A subtle hand gesture from the side naturally pointing toward the right display. Include a clean copy zone above or below the displays occupying approximately 30 percent of the frame area for overlay labels. Camera: 85mm prime lens, sensor perfectly parallel to the plane of the screens, straight-on orthographic feel, zero keystone distortion, perfectly aligned monitor edges with straight vertical and horizontal lines. Warm studio key light from upper left, soft ambient fill, editorial realism, subtle film grain, realistic skin texture on the hand. Absolutely no readable text on screens or anywhere in image, no watermark, no logos, no neon, no hologram. Scene context: {{SCENE}}. Style hints: {{STYLE_HINTS}}.
```

---

## PARTE 2 — Admin UI: Quick Templates

Adicionar uma secao "Quick Templates (EPP)" no `AdminImageLab.tsx`, posicionada entre o formulario de geracao e o painel de KPIs.

### Comportamento
- 2 botoes/cards clicaveis:
  - **"EPP Result (Overlay Copy Safe)"** — seleciona preset `epp-result-01`, preenche `styleHints` com `warm editorial, 85mm, clean copy zone, no text`
  - **"EPP Compare (Frontal)"** — seleciona preset `epp-compare-01`, preenche `styleHints` com `frontal orthographic, 85mm, split screen, no text`
- O campo `promptScene` permanece editavel para o admin descrever a cena especifica
- Toast informando qual template foi selecionado

---

## PARTE 3 — Exemplo de Cena JSON V7 (Documentacao/Referencia)

Exemplo de cena V7 usando `epp-compare-01` com microVisuals overlay (NAO faz parte do codigo, serve como referencia para criacao de JSONs):

```json
{
  "id": "scene-compare-prompt",
  "type": "comparison",
  "visual": {
    "type": "image-sequence",
    "instruction": "Split screen frontal: generico vs profissional",
    "frames": [
      {
        "promptScene": "Comparacao de landing page: lado esquerdo generico sem CTA, lado direito profissional com prova social",
        "durationMs": 4000,
        "storagePath": null
      }
    ]
  },
  "audio": {
    "narration": "Olha a diferenca entre um prompt amador e um prompt profissional."
  },
  "microVisuals": [
    {
      "id": "mv-badge-antes",
      "type": "badge",
      "triggerWord": "amador",
      "content": {
        "cardId": "ANTES",
        "position": "left"
      }
    },
    {
      "id": "mv-badge-depois",
      "type": "badge",
      "triggerWord": "profissional",
      "content": {
        "cardId": "DEPOIS",
        "position": "right"
      }
    },
    {
      "id": "mv-headline",
      "type": "text",
      "triggerWord": "diferenca",
      "content": {
        "text": "Prompt muda tudo.",
        "color": "#F59E0B",
        "position": "top"
      }
    }
  ]
}
```

Principios aplicados:
- Texto NAO esta na imagem gerada
- Badges "ANTES"/"DEPOIS" sao overlays via `card-reveal` (tipo canonico `badge`)
- Headline e overlay via `text-pop` (tipo canonico `text`)
- Maximo 1 microVisual por frase/triggerWord
- anchorText literal na narracao

---

## PARTE 4 — Testes Reais (T1-T3)

Os testes serao executados manualmente via Admin UI apos deploy:

| Teste | Descricao | Criterio PASS |
|-------|-----------|---------------|
| T1 | `epp-compare-01` gera frontal sem keystone em 3 execucoes | Linhas retas nos monitores, sem distorcao visivel |
| T2 | `epp-result-01` gera clean copy zone em 3 execucoes | Area limpa (~35%) identificavel para overlay |
| T3 | Overlay text-pop + badge aparece legivel e consistente | microVisuals renderizam corretamente sobre a imagem |

- Resultados serao registrados nos `metadata` do job (`test_id: "T1"/"T2"/"T3"`, `pass: true/false`)
- Evidencia: job IDs retornados apos execucao

---

## Secao Tecnica — Arquivos Modificados

| # | Arquivo | Acao | Descricao |
|---|---------|------|-----------|
| 1 | DB (image_presets) | INSERT 2 rows | Presets epp-result-01 e epp-compare-01 |
| 2 | `src/pages/AdminImageLab.tsx` | MODIFICAR | Adicionar secao Quick Templates EPP com 2 botoes |

### Nenhuma mudanca em edge functions
Os presets usam o mesmo fluxo `{{SCENE}}`/`{{STYLE_HINTS}}` ja suportado por `image-lab-generate`. Nenhuma alteracao no pipeline e necessaria.

### Nenhuma mudanca no renderer V7
Os tipos `text-pop` e `card-reveal` (badge) ja estao implementados em `V7MicroVisualOverlay.tsx`. O renderer ja suporta `image-sequence` com `storagePath`.

---

## Ordem de Execucao

1. Inserir 2 presets no banco (DB insert)
2. Modificar `AdminImageLab.tsx` com Quick Templates
3. Executar T1, T2, T3 via Admin UI
4. Retornar IDs dos presets + job IDs dos testes

