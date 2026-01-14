# V7-vv JSON Schema - Documentação Completa

> **Versão:** 1.0  
> **Última atualização:** Janeiro 2026  
> **Status:** Produção

---

## 📋 Índice

1. [Estrutura Raiz](#estrutura-raiz)
2. [Metadados da Aula](#metadados-da-aula)
3. [Configuração de Áudio](#configuração-de-áudio)
4. [Estrutura de Scenes](#estrutura-de-scenes)
5. [Tipos de Cenas](#tipos-de-cenas)
6. [Sistema Visual](#sistema-visual)
7. [Sistema de Interações](#sistema-de-interações)
8. [AnchorText - Regras Críticas](#anchortext---regras-críticas)
9. [Efeitos Visuais](#efeitos-visuais)
10. [Exemplos Completos](#exemplos-completos)

---

## 🏗️ Estrutura Raiz

```json
{
  "$schema": "V7-vv Pipeline Input Schema",
  "title": "string",
  "subtitle": "string",
  "difficulty": "beginner" | "intermediate" | "advanced",
  "category": "string",
  "tags": ["string"],
  "learningObjectives": ["string"],
  "voice_id": "string",
  "generate_audio": boolean,
  "fail_on_audio_error": boolean,
  "scenes": [Scene]
}
```

---

## 📝 Metadados da Aula

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `$schema` | string | ✅ | Identificador do schema: `"V7-vv Pipeline Input Schema"` |
| `title` | string | ✅ | Título principal da aula (max 60 caracteres) |
| `subtitle` | string | ❌ | Subtítulo descritivo |
| `difficulty` | enum | ✅ | Nível: `beginner`, `intermediate`, `advanced` |
| `category` | string | ✅ | Categoria temática (ex: "Fundamentos de IA") |
| `tags` | string[] | ❌ | Tags para busca e categorização |
| `learningObjectives` | string[] | ✅ | Lista de objetivos de aprendizagem (3-5 itens) |

### Exemplo:
```json
{
  "title": "Dominando Prompts Profissionais",
  "subtitle": "De amador a especialista em 5 minutos",
  "difficulty": "beginner",
  "category": "Fundamentos de IA",
  "tags": ["prompts", "chatgpt", "produtividade"],
  "learningObjectives": [
    "Entender a diferença entre prompts amadores e profissionais",
    "Dominar o método PERFEITO",
    "Aplicar técnicas na prática"
  ]
}
```

---

## 🎙️ Configuração de Áudio

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `voice_id` | string | ✅ | ID da voz ElevenLabs |
| `generate_audio` | boolean | ✅ | Se deve gerar áudio TTS |
| `fail_on_audio_error` | boolean | ❌ | Se falha em erro de áudio (default: false) |

### Vozes Disponíveis:
| ID | Nome | Estilo |
|----|------|--------|
| `Xb7hH8MSUJpSbSDYk0k2` | Mateus | Brasileiro, profissional |
| `pNInz6obpgDQGcFmaJgB` | Adam | Inglês, narrativo |

---

## 🎬 Estrutura de Scenes

Cada cena representa um momento da aula com narração, visual e possível interação.

```json
{
  "id": "string",
  "title": "string", 
  "type": "SceneType",
  "narration": "string",
  "anchorText": { ... },      // OPCIONAL - ver regras abaixo
  "visual": { ... },
  "interaction": { ... }      // APENAS para tipos interativos
}
```

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id` | string | ✅ | ID único (kebab-case: `cena-1-abertura`) |
| `title` | string | ✅ | Título descritivo da cena |
| `type` | SceneType | ✅ | Tipo da cena (ver seção abaixo) |
| `narration` | string | ✅ | Texto completo da narração |
| `anchorText` | object | ⚠️ | **APENAS para cenas interativas** |
| `visual` | object | ✅ | Configuração visual |
| `interaction` | object | ⚠️ | **APENAS para cenas interativas** |

---

## 🎭 Tipos de Cenas

### Categorias

#### 🔴 Cenas NÃO-INTERATIVAS (SEM anchorText.pauseAt)
| Tipo | Propósito | Elementos |
|------|-----------|-----------|
| `dramatic` | Impacto emocional, números chocantes | number-reveal, text-reveal |
| `narrative` | Explicação, contexto, história | text-reveal, split-screen |
| `comparison` | Comparar A vs B | split-screen |
| `revelation` | Revelar conceito/método | letterbox, text-reveal |

#### 🟢 Cenas INTERATIVAS (COM anchorText.pauseAt)
| Tipo | Propósito | Elementos |
|------|-----------|-----------|
| `interaction` | Quiz, escolhas do usuário | quiz |
| `playground` | Teste prático comparativo | playground |
| `cta` | Call-to-action, decisão | result + botão |
| `gamification` | Celebração, recompensas | result + métricas |
| `secret-reveal` | Revelação com suspense | letterbox animado |

---

## ⚓ AnchorText - Regras Críticas

### ⚠️ REGRA DE OURO

> **`anchorText.pauseAt` SÓ pode existir em cenas INTERATIVAS!**

Se você adicionar `pauseAt` em uma cena não-interativa (dramatic, narrative, comparison, revelation), o **Pipeline vai ignorar** e logar um warning.

### Estrutura do anchorText

```json
{
  "anchorText": {
    "pauseAt": "string"  // Palavra-chave que pausa o áudio
  }
}
```

### Como Funciona

1. O áudio toca normalmente
2. Quando a cena interativa começa (por tempo), o componente é renderizado
3. O sistema `useAnchorText` monitora o `currentTime` vs `word_timestamps`
4. Quando a keyword de `pauseAt` é detectada (após terminar de ser falada)
5. O áudio PAUSA automaticamente
6. Usuário interage (responde quiz, clica botão, etc.)
7. Após interação, áudio RETOMA

### Escolhendo a Keyword Correta

| ❌ Errado | ✅ Correto | Motivo |
|-----------|------------|--------|
| "você" | "agora" | "você" é muito comum |
| "IA" | "atual de IA" | Frase é mais precisa |
| "responda" | "testar" | Palavra única no contexto |
| "aqui" | "Prepare-se" | Mais específico |

### Regras para Keywords

1. **Use a ÚLTIMA palavra antes da pausa natural**
2. **Evite palavras comuns** (você, isso, que, para)
3. **Multi-word é mais preciso** ("atual de IA" > "IA")
4. **A palavra DEVE existir exatamente na narração**

### Exemplo Correto

```json
{
  "id": "cena-3-quiz",
  "type": "interaction",  // ✅ Tipo interativo
  "narration": "Escolha sua resposta agora.",
  "anchorText": {
    "pauseAt": "agora"   // ✅ Última palavra antes da pausa
  },
  "interaction": {
    "type": "quiz",
    ...
  }
}
```

### Exemplo INCORRETO

```json
{
  "id": "cena-2-contexto",
  "type": "narrative",    // ❌ NÃO é interativo!
  "narration": "Prepare-se para o que vem.",
  "anchorText": {
    "pauseAt": "Prepare-se"  // ❌ Será IGNORADO pelo pipeline!
  }
}
```

---

## 🎨 Sistema Visual

### Tipos de Visual Disponíveis

#### 1. `number-reveal`
Exibe números com impacto dramático.

```json
{
  "type": "number-reveal",
  "content": {
    "hookQuestion": "string",     // Pergunta opcional
    "mainValue": "98%",           // Valor principal
    "secondaryValue": "string",   // Valor secundário
    "subtitle": "string",         // Legenda
    "highlightWord": "98%"        // Palavra para destacar
  },
  "effects": {
    "mood": "dramatic" | "success" | "danger",
    "particles": "ember" | "confetti" | "sparks",
    "glow": boolean,
    "shake": boolean
  }
}
```

#### 2. `text-reveal`
Revela texto com animação.

```json
{
  "type": "text-reveal",
  "content": {
    "mainText": "TÍTULO",
    "items": ["Item 1", "Item 2"],
    "impactWord": "DESTAQUE"
  },
  "effects": {
    "mood": "success" | "danger" | "energetic",
    "particles": "success-sparkles" | "sparks"
  }
}
```

#### 3. `split-screen`
Comparação lado a lado.

```json
{
  "type": "split-screen",
  "content": {
    "leftCard": {
      "label": "ANTES",
      "value": "Amador",
      "details": ["Ponto 1", "Ponto 2"],
      "isPositive": false
    },
    "rightCard": {
      "label": "DEPOIS", 
      "value": "Profissional",
      "details": ["Ponto 1", "Ponto 2"],
      "isPositive": true
    }
  }
}
```

#### 4. `letterbox`
Lista de itens com ícones (ideal para acrônimos/métodos).

```json
{
  "type": "letterbox",
  "content": {
    "title": "MÉTODO PERFEITO",
    "items": [
      {"icon": "P", "text": "Persona específica"},
      {"icon": "E", "text": "Estrutura clara"},
      ...
    ]
  },
  "effects": {
    "mood": "mysterious",
    "glow": true
  }
}
```

#### 5. `quiz`
Visual para interação de quiz.

```json
{
  "type": "quiz",
  "content": {
    "title": "AUTO-AVALIAÇÃO",
    "subtitle": "Seja honesto"
  }
}
```

#### 6. `playground`
Visual para playground comparativo.

```json
{
  "type": "playground",
  "content": {
    "title": "TESTE PRÁTICO",
    "subtitle": "Compare os resultados"
  }
}
```

#### 7. `result`
Exibe resultado/celebração.

```json
{
  "type": "result",
  "content": {
    "emoji": "🏆",
    "title": "PARABÉNS!",
    "message": "Você completou",
    "ctaText": "Continuar",           // Para CTA
    "metrics": [                       // Para gamification
      {
        "label": "XP Ganho",
        "value": "+50",
        "isHighlight": true
      }
    ]
  }
}
```

### MicroVisuals

Animações sincronizadas com palavras específicas na narração.

```json
{
  "microVisuals": [
    {
      "id": "micro-98",
      "anchorText": "Noventa e oito",
      "type": "number",
      "content": {
        "value": "98%",
        "color": "#ef4444",
        "animation": "scale-bounce"
      }
    }
  ]
}
```

---

## 🎮 Sistema de Interações

### Quiz

```json
{
  "interaction": {
    "type": "quiz",
    "question": "Qual sua escolha?",
    "options": [
      {
        "id": "opt-1",
        "text": "Opção A",
        "isCorrect": true,
        "feedback": "Correto! Explicação..."
      },
      {
        "id": "opt-2", 
        "text": "Opção B",
        "isCorrect": false,
        "feedback": "Incorreto. Porque..."
      }
    ]
  }
}
```

### Playground

```json
{
  "interaction": {
    "type": "playground",
    "amateurPrompt": "Prompt simples",
    "professionalPrompt": "Prompt elaborado com P.E.R.F.E.I.T.O",
    "amateurResult": {
      "title": "Resultado Amador",
      "content": "Resposta genérica...",
      "score": 20,
      "verdict": "Fraco"
    },
    "professionalResult": {
      "title": "Resultado Profissional",
      "content": "Resposta específica e impactante...",
      "score": 95,
      "verdict": "Excelente!"
    }
  }
}
```

### CTA (Call-to-Action)

```json
{
  "interaction": {
    "type": "cta",
    "buttonText": "Quero Continuar",
    "action": "continue"
  }
}
```

---

## ✨ Efeitos Visuais

### Mood (Humor/Tom)

| Valor | Cores | Uso |
|-------|-------|-----|
| `dramatic` | Vermelho/Laranja | Números chocantes, urgência |
| `success` | Verde/Dourado | Vitórias, conquistas |
| `danger` | Vermelho intenso | Alertas, erros |
| `energetic` | Azul/Roxo | Ação, movimento |
| `mysterious` | Roxo/Escuro | Revelações, segredos |

### Particles (Partículas)

| Valor | Efeito |
|-------|--------|
| `ember` | Brasas flutuando |
| `confetti` | Confete colorido |
| `sparks` | Faíscas |
| `success-sparkles` | Brilhos dourados |

### Animações

| Valor | Efeito |
|-------|--------|
| `scale-bounce` | Escala com bounce |
| `fade-in` | Fade gradual |
| `slide-up` | Desliza de baixo |
| `typewriter` | Efeito máquina de escrever |

---

## 📚 Exemplos Completos

### Cena Dramática (SEM pauseAt)

```json
{
  "id": "cena-1-impacto",
  "title": "O Número Chocante",
  "type": "dramatic",
  "narration": "Noventa e oito por cento. Das pessoas tratam IA como brinquedo.",
  "visual": {
    "type": "number-reveal",
    "content": {
      "mainValue": "98%",
      "subtitle": "tratam como brinquedo"
    },
    "effects": {
      "mood": "dramatic",
      "particles": "ember",
      "glow": true
    }
  }
}
```

### Cena Quiz (COM pauseAt)

```json
{
  "id": "cena-3-quiz",
  "title": "Auto-Avaliação",
  "type": "interaction",
  "narration": "Como você usa IA? Escolha agora.",
  "anchorText": {
    "pauseAt": "agora"
  },
  "visual": {
    "type": "quiz",
    "content": {
      "title": "ESCOLHA",
      "subtitle": "Seja honesto"
    }
  },
  "interaction": {
    "type": "quiz",
    "question": "Como você usa IA?",
    "options": [
      {
        "id": "opt-pro",
        "text": "Profissionalmente",
        "isCorrect": true,
        "feedback": "Excelente!"
      },
      {
        "id": "opt-play",
        "text": "Apenas brincadeira",
        "isCorrect": false,
        "feedback": "Hora de evoluir!"
      }
    ]
  }
}
```

### Cena Playground (COM pauseAt)

```json
{
  "id": "cena-7-playground",
  "title": "Teste Prático",
  "type": "playground",
  "narration": "Vamos comparar na prática. Pronto para testar?",
  "anchorText": {
    "pauseAt": "testar"
  },
  "visual": {
    "type": "playground",
    "content": {
      "title": "COMPARATIVO",
      "subtitle": "Amador vs Profissional"
    }
  },
  "interaction": {
    "type": "playground",
    "amateurPrompt": "Escreva uma bio",
    "professionalPrompt": "P: Personal branding expert\nE: Dev 10 anos\n...",
    "amateurResult": {
      "title": "Amador",
      "content": "Sou profissional dedicado...",
      "score": 20,
      "verdict": "Genérico"
    },
    "professionalResult": {
      "title": "Profissional",
      "content": "🚀 Transformei dados em decisões...",
      "score": 95,
      "verdict": "Impactante!"
    }
  }
}
```

---

## ✅ Checklist de Validação

Antes de submeter o JSON ao pipeline, verifique:

- [ ] `$schema` está definido como `"V7-vv Pipeline Input Schema"`
- [ ] Todos os `id` de cenas são únicos e em kebab-case
- [ ] `anchorText.pauseAt` existe APENAS em cenas interativas
- [ ] Cada cena interativa tem `interaction` definido
- [ ] Keywords de `pauseAt` existem exatamente na `narration`
- [ ] `voice_id` é válido
- [ ] `learningObjectives` tem 3-5 itens
- [ ] Cada `visual` tem `type` e `content` definidos
- [ ] Opções de quiz têm `id`, `text`, `isCorrect` e `feedback`

---

## 🚨 Erros Comuns

| Erro | Causa | Solução |
|------|-------|---------|
| Aula congela | `pauseAt` em cena não-interativa | Remover `anchorText` da cena |
| Quiz não aparece | Tipo errado | Usar `type: "interaction"` |
| Áudio não pausa | Keyword não encontrada | Verificar palavra exata na narração |
| Visual quebrado | `content` incompleto | Preencher todos os campos obrigatórios |

---

## 📖 Referências

- [V7-ANCHORTEXT-RULES.md](./V7-ANCHORTEXT-RULES.md) - Regras do sistema AnchorText
- [V7-AULA1-MODELO-PADRAO.json](./V7-AULA1-MODELO-PADRAO.json) - Exemplo completo funcional
- [step4-calculate-anchors.ts](../src/lib/lessonPipeline/v7/steps/step4-calculate-anchors.ts) - Implementação do cálculo de anchors
