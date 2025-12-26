# Analise de Erros: Lovable vs Sistema V7

Este documento analisa por que o JSON gerado pelo Lovable nao funciona com o pipeline V7.

## Resumo Executivo

O Lovable criou uma estrutura completamente inventada que nao corresponde ao schema V7.1 do sistema. Ele ignorou a estrutura existente e criou um modelo proprio.

---

## Erros Criticos

### 1. Versao Incorreta
```json
// LOVABLE (ERRADO)
"version": "3.0"

// SISTEMA (CORRETO)
"version": "7.1"
```

### 2. Nome do Container Principal
```json
// LOVABLE (ERRADO) - camelCase
"cinematicFlow": { "phases": [...] }

// SISTEMA (CORRETO) - snake_case
"cinematic_flow": { "acts": [...] }
```

### 3. Elementos: phases vs acts
O Lovable usa `phases`, mas o sistema espera `acts`.

### 4. Estrutura de Cada Fase

**LOVABLE (inventado):**
```json
{
  "id": "phase-1-dramatic",
  "type": "dramatic",
  "trigger": { "type": "auto-start" },
  "anchorText": { "endPhrase": "Brinquedo" },
  "narration": { "text": "...", "estimatedDuration": 10.3 },
  "cinematography": { "opening": {...}, "scenes": [...] },
  "visualContent": { "mainValue": "98%", ... },
  "soundEffects": {...},
  "transitions": {...}
}
```

**SISTEMA (correto):**
```json
{
  "id": "act-1-dramatic",
  "type": "dramatic",
  "title": "...",
  "startTime": 0,
  "endTime": 22,
  "narration": "...",
  "visual": {
    "mainValue": "98%",
    "subtitle": "...",
    "mood": "danger"
  },
  "transitions": {
    "enter": "letterbox",
    "exit": "fade"
  }
}
```

### 5. Tipos de Fase Invalidos

| Lovable (ERRADO) | Sistema (CORRETO) |
|------------------|-------------------|
| `"secret-reveal"` | `"revelation"` |
| `"interaction"` (tipo quiz embutido) | `"interaction"` com `interaction.type: "quiz"` |

### 6. Narracao

**LOVABLE:**
```json
"narration": {
  "text": "...",
  "estimatedDuration": 10.3
}
```

**SISTEMA:**
```json
"narration": "..." // String direta no nivel do act
// OU
"content": {
  "audio": {
    "narration": "..."
  }
}
```

### 7. Sistema de Pausa para Interacoes

**LOVABLE (super complexo):**
```json
"anchorText": {
  "pausePhrase": "inteligente",
  "notes": "PAUSA quando detectado..."
}
```

**SISTEMA (simples):**
```json
"pauseKeyword": "uso atual",
"anchorActions": [
  { "id": "pause-quiz", "keyword": "uso atual", "type": "pause" }
]
```

### 8. AudioBehavior

**LOVABLE:**
```json
"audioBehavior": {
  "onStart": "pause",
  "duringInteraction": {
    "mainVolume": 0,
    "ambientVolume": 0.3,
    "contextualLoops": [
      {
        "triggerAfter": 8,
        "text": "...",
        "voice": "whisper",
        "volume": 0.25,
        "audioUrl": null  // <-- Campo inventado
      }
    ]
  },
  "onComplete": "resume"
}
```

**SISTEMA:**
```json
"audioBehavior": {
  "onStart": "pause",
  "duringInteraction": {
    "mainVolume": 0,
    "ambientVolume": 0.3,
    "contextualLoops": [
      {
        "triggerAfter": 6,
        "text": "...",
        "volume": 0.25,
        "voice": "whisper"  // Sem audioUrl
      }
    ]
  },
  "onComplete": "resume"
}
```

---

## Campos Inventados pelo Lovable (Nao Existem no Sistema)

1. `trigger` - Sistema nao usa triggers explicitos
2. `anchorText.pausePhrase` - Sistema usa `pauseKeyword` direto no act
3. `anchorText.endPhrase` - Nao existe
4. `cinematography` - Todo esse bloco foi inventado
5. `cinematography.scenes` com `trigger: "word:X"` - Nao existe
6. `narration.estimatedDuration` - Nao e usado
7. `soundEffects` - Nao existe como bloco separado
8. `processingNotes` - Metadata inventado

---

## Tabela de Conversao

| Campo Lovable | Campo Correto V7.1 |
|---------------|-------------------|
| `cinematicFlow` | `cinematic_flow` |
| `phases` | `acts` |
| `narration.text` | `narration` (string) |
| `visualContent` | `visual` |
| `anchorText.pausePhrase` | `pauseKeyword` |
| `secret-reveal` (type) | `revelation` |
| `trigger.type` | (remover - nao existe) |
| `cinematography` | (remover - nao existe) |

---

## Solucao

Usar o arquivo `v7-aula-98percent-CORRECTED.json` que contem a estrutura correta seguindo o schema definido em:
- `/src/types/v7-schema.ts`
- `/docs/v7-lesson-IMPROVED-2025.json`
- `/docs/v7-complete-lesson-example.json`

---

## Recomendacoes para Evitar Esse Problema

1. **Sempre consultar o schema** em `src/types/v7-schema.ts` antes de criar JSONs
2. **Usar exemplos existentes** como base (`v7-complete-lesson-example.json`)
3. **Validar contra o schema** usando `validateV7CinematicLesson()`
4. **Nao inventar campos** - se nao existe no schema, nao usar
5. **Testar incrementalmente** - nao criar 9 fases de uma vez sem testar

---

## Arquivos de Referencia

- Schema: `/src/types/v7-schema.ts`
- Exemplo completo: `/docs/v7-complete-lesson-example.json`
- Exemplo melhorado: `/docs/v7-lesson-IMPROVED-2025.json`
- **JSON Corrigido**: `/docs/v7-aula-98percent-CORRECTED.json`
