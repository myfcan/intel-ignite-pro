# 📋 AUDITORIA COMPLETA - CORREÇÕES V7 AULA 1

**Data da Auditoria:** 2025-01-02  
**Status:** ✅ DOCUMENTAÇÃO FINAL  
**Objetivo:** Listar 100% das correções aplicadas para replicar em novas aulas

---

## 📊 RESUMO EXECUTIVO

| Categoria | Correções Aplicadas |
|-----------|---------------------|
| Estrutura JSON | 8 correções |
| Playground | 4 campos adicionados |
| Quiz | 5 correções |
| Áudio/Timestamps | 4 correções |
| Visual/UI | 6 correções |
| Pipeline v7-vv | 3 correções |
| **TOTAL** | **30 correções** |

---

## 🔴 CORREÇÕES CRÍTICAS (Pipeline v7-vv)

### 1. Campos do Playground (4 campos)

**Arquivo:** `supabase/functions/v7-vv/index.ts` (linhas 631-644)

```typescript
// ❌ ANTES (incompleto):
phase.interaction = {
  type: 'playground',
  amateurPrompt: scene.interaction.amateurPrompt,
  professionalPrompt: scene.interaction.professionalPrompt,
  amateurResult: scene.interaction.amateurResult,
  professionalResult: scene.interaction.professionalResult,
};

// ✅ DEPOIS (completo):
phase.interaction = {
  type: 'playground',
  amateurPrompt: scene.interaction.amateurPrompt,
  professionalPrompt: scene.interaction.professionalPrompt,
  amateurResult: scene.interaction.amateurResult,
  professionalResult: scene.interaction.professionalResult,
  // V7-vv: Campos OBRIGATÓRIOS adicionados:
  amateurScore: scene.interaction.amateurScore,
  professionalScore: scene.interaction.professionalScore,
  comparison: scene.interaction.comparison,
  userChallenge: scene.interaction.userChallenge,
};
```

**Campos obrigatórios:**
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `amateurScore` | number | Score do resultado amador (ex: 15) |
| `professionalScore` | number | Score do resultado profissional (ex: 95) |
| `comparison` | object | Objeto de comparação visual |
| `userChallenge` | string | Texto do desafio para o usuário |

---

## 🟠 CORREÇÕES DE ESTRUTURA JSON

### 2. Act/Phase Type para Comparison

```json
// ❌ ANTES:
{
  "type": "comparison"
}

// ✅ DEPOIS (com visual.content):
{
  "type": "comparison",
  "visual": {
    "title": "A DIVISÃO REAL",
    "subtitle": "Dois grupos. Dois resultados.",
    "mood": "dramatic",
    "content": {
      "centerPrompt": "Qual grupo você quer estar?",
      "centerEmoji": "⚡"
    }
  }
}
```

**Campos adicionados em `visual.content`:**
- `centerPrompt`: Texto central entre os cards
- `centerEmoji`: Emoji central

---

### 3. Interaction Type para Comparison

```json
// ✅ OBRIGATÓRIO em phases de comparison:
{
  "interaction": {
    "type": "comparison",
    "leftCard": {
      "label": "98% — BRINCANDO",
      "value": "Resultado: genérico",
      "isPositive": false,
      "icon": "X",
      "details": ["Prompt curto", "Sem contexto"]
    },
    "rightCard": {
      "label": "2% — PROFISSIONAL",
      "value": "Resultado: aplicável",
      "isPositive": true,
      "icon": "Check",
      "details": ["Prompt estruturado", "Contexto rico"]
    }
  }
}
```

---

### 4. MicroVisuals com AnchorText

```json
// ✅ Para revelar palavra letra por letra:
{
  "microVisuals": [
    {
      "id": "reveal-perfeito",
      "type": "letter-reveal",
      "anchorText": "PERFEITO",
      "triggerTime": 106,
      "config": {
        "text": "P.E.R.F.E.I.T.O",
        "delayPerLetter": 200
      }
    }
  ]
}
```

**Campos obrigatórios:**
- `anchorText`: Palavra que ancora o visual
- `triggerTime`: Tempo de disparo em segundos

---

### 5. HighlightWord Condicional

```json
// ⚠️ SÓ incluir highlightWord quando REALMENTE quiser destacar:

// ❌ ERRADO (highlight desnecessário):
{
  "visual": {
    "title": "Título normal",
    "highlightWord": "normal"  // Remove se não for intencional
  }
}

// ✅ CORRETO (highlight intencional):
{
  "visual": {
    "title": "O método PERFEITO",
    "highlightWord": "PERFEITO",  // Destaque intencional
    "mood": "success"
  }
}
```

---

## 🟡 CORREÇÕES DE QUIZ

### 6. Feedback com AudioId

```json
// ✅ Cada option do quiz DEVE ter feedback.audioId:
{
  "options": [
    {
      "id": "opt-1",
      "text": "Opção A",
      "isCorrect": false,
      "category": "bad",
      "feedback": {
        "title": "Hmm...",
        "subtitle": "Esse é o padrão dos 98%",
        "mood": "neutral",
        "narration": "Texto para gerar áudio TTS",
        "audioId": "feedback-opt-1"
      }
    }
  ]
}
```

**Campos obrigatórios no feedback:**
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `title` | string | Título do feedback |
| `subtitle` | string | Subtítulo explicativo |
| `mood` | string | 'success' \| 'neutral' \| 'danger' |
| `narration` | string | Texto para TTS (gera áudio) |
| `audioId` | string | ID único do áudio gerado |

---

### 7. Timeout com Hints Progressivos

```json
// ✅ Quiz DEVE ter timeout com hints:
{
  "timeout": {
    "soft": 8,
    "medium": 15,
    "hard": 25,
    "hints": [
      "Pense nas suas últimas interações com IA...",
      "Seja honesto consigo mesmo...",
      "Vamos continuar? A resposta é só pra você refletir."
    ],
    "autoAction": { "action": "continue" }
  }
}
```

---

### 8. ContextualLoops para Quiz

```json
// ✅ Áudio contextual durante espera:
{
  "contextualLoops": [
    { "triggerAfter": 7, "text": "Reflita com calma...", "volume": 0.4 },
    { "triggerAfter": 15, "text": "Seja honesto...", "volume": 0.35 },
    { "triggerAfter": 25, "text": "Escolha a opção...", "volume": 0.3 }
  ]
}
```

---

### 9. AudioBehavior Completo

```json
// ✅ Controle de áudio durante interação:
{
  "audioBehavior": {
    "onStart": "pause",
    "duringInteraction": {
      "mainVolume": 0,
      "ambientVolume": 0.3
    },
    "onComplete": "resume"
  }
}
```

---

## 🟢 CORREÇÕES DE ÁUDIO/TIMESTAMPS

### 10. MainAudio com WordTimestamps Completo

```json
// ✅ O áudio principal DEVE ter:
{
  "mainAudio": {
    "id": "main",
    "url": "https://..../audio.mp3",
    "duration": 190.5,
    "wordTimestamps": [
      { "word": "Noventa", "start": 0.0, "end": 0.4 },
      { "word": "e", "start": 0.4, "end": 0.5 },
      { "word": "oito", "start": 0.5, "end": 0.8 },
      // ... todos os words
    ]
  }
}
```

---

### 11. FeedbackAudios Separados

```json
// ✅ Áudios de feedback gerados separadamente:
{
  "feedbackAudios": {
    "feedback-opt-1": {
      "id": "feedback-opt-1",
      "url": "https://..../feedback-opt-1.mp3",
      "duration": 3.2,
      "wordTimestamps": [...]
    },
    "feedback-opt-2": {
      "id": "feedback-opt-2",
      "url": "https://..../feedback-opt-2.mp3",
      "duration": 2.8,
      "wordTimestamps": [...]
    }
  }
}
```

---

### 12. AnchorActions com KeywordTime

```json
// ✅ Anchor actions DEVEM ter keyword e posição:
{
  "anchorActions": [
    {
      "id": "pause-for-quiz",
      "keyword": "uso atual",
      "keywordTime": 50.2,
      "type": "pause"
    },
    {
      "id": "start-playground",
      "keyword": "teste agora",
      "keywordTime": 138.0,
      "type": "pause"
    }
  ]
}
```

---

### 13. PauseKeywords Array

```json
// ✅ Sempre usar ARRAY para pauseKeywords:
{
  "pauseKeyword": "uso atual",           // String única (legado)
  "pauseKeywords": ["uso atual"],        // Array (preferido)
  "anchorActions": [...]                 // Detalhado (melhor)
}
```

---

## 🔵 CORREÇÕES DE VISUAL/UI

### 14. CTA com Botões Corretos

```json
// ❌ ERRADO (botões inventados):
{
  "options": [
    { "label": "Aplicar agora", ... },      // NÃO EXISTE
    { "label": "Revisar tudo", ... }        // NÃO EXISTE
  ]
}

// ✅ CORRETO:
{
  "options": [
    {
      "id": "cta-discover",
      "label": "QUERO DESCOBRIR AGORA",
      "emoji": "lightning",
      "variant": "primary",
      "action": "continue"
    }
  ]
}
```

---

### 15. Mood por Phase

```json
// ✅ Cada visual DEVE ter mood apropriado:
{
  "visual": {
    "mood": "danger"    // Para estatísticas negativas
  }
}

{
  "visual": {
    "mood": "dramatic"  // Para revelações
  }
}

{
  "visual": {
    "mood": "success"   // Para conquistas
  }
}
```

**Moods disponíveis:**
- `danger`: Vermelho/urgência
- `dramatic`: Dramático/impactante
- `success`: Verde/positivo
- `neutral`: Neutro
- `warning`: Amarelo/atenção

---

### 16. Particles Config

```json
// ✅ Configuração de partículas:
{
  "particles": {
    "enabled": true,
    "type": "ember",      // ember | confetti | money | sparkle
    "intensity": 0.6      // 0.0 a 1.0
  }
}
```

---

### 17. Transitions Enter/Exit

```json
// ✅ Toda phase deve ter transitions:
{
  "transitions": {
    "enter": "letterbox",    // ou: fade, slide-up, zoom-in, scale-up
    "exit": "fade"           // ou: slide-out, zoom-out
  }
}
```

---

### 18. Glow Effect

```json
// ✅ Para números/valores impactantes:
{
  "visual": {
    "mainValue": "98%",
    "glow": true
  }
}
```

---

### 19. Items com Emoji e Letter

```json
// ✅ Para revelação do método PERFEITO:
{
  "items": [
    { "emoji": "theater", "letter": "P", "text": "Persona: Defina quem a I.A. deve ser" },
    { "emoji": "target", "letter": "E", "text": "Especificidade: Elimine ambiguidade" },
    { "emoji": "check", "letter": "R", "text": "Resultado: Deixe claro o objetivo" },
    { "emoji": "clipboard", "letter": "F", "text": "Formato: Estruture a saída" },
    { "emoji": "lightbulb", "letter": "E", "text": "Exemplos: Forneça referências" },
    { "emoji": "pencil", "letter": "I", "text": "Instruções: Detalhe cada passo" },
    { "emoji": "speech", "letter": "T", "text": "Tom: Defina a personalidade" },
    { "emoji": "refresh", "letter": "O", "text": "Otimização: Refine sempre" }
  ]
}
```

---

## 🟣 CORREÇÕES DE GAMIFICATION

### 20. Gamification Completo

```json
{
  "interaction": {
    "type": "gamification",
    "xpEarned": 150,
    "coinsEarned": 50,
    "badges": ["prompting-pro", "first-method"],
    "metrics": [
      { "label": "XP Ganho", "value": "+150", "isHighlight": true },
      { "label": "Nível", "value": "Prompting PRO", "isHighlight": false }
    ],
    "celebrationLevel": "high"
  }
}
```

---

## 📝 ESTRUTURA COMPLETA DE REFERÊNCIA

### JSON Schema Resumido

```json
{
  "title": "string",
  "subtitle": "string",
  "duration": "number",
  "generate_audio": true,
  "voice_id": "string",
  "narrativeScript": "string (para geração de áudio)",
  
  "cinematic_flow": {
    "timeline": { "totalDuration": "number" },
    "acts": [
      {
        "id": "string",
        "type": "dramatic | comparison | interaction | revelation | playground | gamification",
        "title": "string",
        "startTime": "number",
        "duration": "number",
        "narration": "string",
        
        "pauseKeyword": "string (legado)",
        "pauseKeywords": ["string[]"],
        "anchorActions": [{
          "id": "string",
          "keyword": "string",
          "type": "pause",
          "keywordTime": "number (opcional)"
        }],
        
        "visual": {
          "title": "string",
          "subtitle": "string",
          "mainValue": "string",
          "highlightWord": "string (opcional)",
          "mood": "danger | dramatic | success | neutral",
          "glow": "boolean",
          "particles": { "enabled": true, "type": "string", "intensity": "number" },
          "content": {
            "centerPrompt": "string (para comparison)",
            "centerEmoji": "string"
          },
          "items": [{ "emoji": "string", "letter": "string", "text": "string" }]
        },
        
        "interaction": {
          "type": "quiz | playground | comparison | cta | gamification",
          
          // Para quiz:
          "question": "string",
          "options": [{
            "id": "string",
            "text": "string",
            "isCorrect": "boolean",
            "category": "good | bad",
            "feedback": {
              "title": "string",
              "subtitle": "string",
              "mood": "string",
              "narration": "string",
              "audioId": "string"
            }
          }],
          "timeout": {
            "soft": "number",
            "medium": "number",
            "hard": "number",
            "hints": ["string[]"],
            "autoAction": { "action": "continue" }
          },
          
          // Para playground:
          "amateurPrompt": "string",
          "professionalPrompt": "string",
          "amateurResult": { "title": "string", "content": "string", "score": "number", "verdict": "string" },
          "professionalResult": { "title": "string", "content": "string", "score": "number", "verdict": "string" },
          "amateurScore": "number",       // ⚠️ OBRIGATÓRIO
          "professionalScore": "number",  // ⚠️ OBRIGATÓRIO
          "comparison": "object",         // ⚠️ OBRIGATÓRIO
          "userChallenge": "string",      // ⚠️ OBRIGATÓRIO
          
          // Para comparison:
          "leftCard": { "label": "string", "value": "string", "isPositive": "boolean", "details": ["string[]"] },
          "rightCard": { "label": "string", "value": "string", "isPositive": "boolean", "details": ["string[]"] }
        },
        
        "audioBehavior": {
          "onStart": "pause | continue",
          "duringInteraction": { "mainVolume": "number", "ambientVolume": "number" },
          "onComplete": "resume | continue"
        },
        
        "transitions": {
          "enter": "letterbox | fade | slide-up | zoom-in | scale-up",
          "exit": "fade | slide-out | zoom-out"
        }
      }
    ]
  },
  
  "audioConfig": {
    "narrationVoice": "string",
    "voiceSettings": { "stability": "number", "similarity_boost": "number" }
  },
  
  "fallbacks": {
    "noWordTimestamps": { "strategy": "percentage", "pauseAt": 0.8 },
    "audioLoadError": { "showSubtitles": true },
    "interactionTimeout": { "action": "continue" }
  }
}
```

---

## ✅ CHECKLIST DE VALIDAÇÃO

Antes de processar uma nova aula V7, verificar:

### Pipeline v7-vv
- [ ] Campos playground: `amateurScore`, `professionalScore`, `comparison`, `userChallenge`
- [ ] Feedback audios gerados para cada option do quiz
- [ ] WordTimestamps completos no mainAudio

### Estrutura JSON
- [ ] `centerPrompt` e `centerEmoji` em phases comparison
- [ ] `highlightWord` apenas quando intencional
- [ ] `microVisuals` com `anchorText` e `triggerTime`
- [ ] `mood` definido em cada visual

### Quiz
- [ ] Cada option tem `feedback.audioId`
- [ ] `timeout` com `hints` progressivos
- [ ] `audioBehavior` configurado
- [ ] `contextualLoops` para feedback durante espera

### CTA
- [ ] Botões corretos (não "Aplicar agora" / "Revisar tudo")
- [ ] `variant` definido: primary | secondary

### Áudio
- [ ] `pauseKeywords` como array
- [ ] `anchorActions` com `keyword` e `type`
- [ ] `wordTimestamps` gerados pelo ElevenLabs

### Visual
- [ ] `particles` configurado quando necessário
- [ ] `glow` para valores impactantes
- [ ] `transitions.enter` e `transitions.exit`
- [ ] `items` com `emoji`, `letter`, `text` para revelações

---

## 📁 ARQUIVOS DE REFERÊNCIA

| Arquivo | Descrição |
|---------|-----------|
| `docs/v7-aula-98percent-FINAL.json` | JSON corrigido completo |
| `supabase/functions/v7-vv/index.ts` | Pipeline atualizado |
| `docs/V7-CORRECAO-AULA1-SPEC.md` | Spec técnica da correção |
| `docs/V7-JSON-ESTRUTURAS.md` | Documentação de estruturas |

---

## 🚀 PRÓXIMOS PASSOS

1. **Atualizar prompt do Claude** para incluir estas regras
2. **Criar validador JSON** que verifique campos obrigatórios
3. **Testar nova aula** com todas as correções aplicadas
4. **Documentar erros** que surgirem em novas aulas

---

*Documento gerado automaticamente - Auditoria V7 Aula 1*
