# Análise Completa da Aula 1 Funcionando

## O QUE O PIPELINE DEVERIA GERAR

Este documento mostra a estrutura EXATA da Aula 1 que está funcionando.
Se o Pipeline não gerar algo igual, o problema está no Pipeline.

---

## 1. ESTRUTURA DO CONTENT (O que está no banco)

### 1.1 Metadata
```json
{
  "model": "v7-cinematic",
  "title": "O Fim da Brincadeira com IA",
  "subtitle": "Como os 2% usam a IA para faturar R$30.000/mês",
  "category": "fundamentos",
  "difficulty": "beginner",
  "phaseCount": 10,
  "totalDuration": 87.037,
  "generatedBy": "V7-vv",
  "tags": ["IA", "produtividade", "método PERFEITO", "prompts"],
  "learningObjectives": [
    "Entender a diferença entre usar IA como brinquedo vs ferramenta",
    "Conhecer o método PERFEITO para prompts profissionais",
    "Aplicar técnicas dos 2% que lucram com IA"
  ]
}
```

### 1.2 Audio Structure
```json
{
  "audio": {
    "mainAudio": {
      "id": "main",
      "url": "https://..../v7-main-XXXXX.mp3",
      "duration": 86.737,
      "wordTimestamps": [
        { "word": "Noventa", "start": 0, "end": 0.615 },
        { "word": "e", "start": 0.639, "end": 0.755 },
        // ... todos os word timestamps
      ]
    },
    "feedbackAudios": {
      "feedback-opt-98-simples": {
        "id": "feedback-opt-98-simples",
        "url": "https://..../v7-feedback-opt-98-simples-XXXXX.mp3",
        "duration": 7.117,
        "wordTimestamps": [...]
      },
      "feedback-opt-2-contexto": {
        "id": "feedback-opt-2-contexto",
        "url": "https://..../v7-feedback-opt-2-contexto-XXXXX.mp3",
        "duration": 6.954,
        "wordTimestamps": [...]
      },
      "feedback-opt-98-copia": {
        "id": "feedback-opt-98-copia",
        "url": "https://..../v7-feedback-opt-98-copia-XXXXX.mp3",
        "duration": 6.722,
        "wordTimestamps": [...]
      }
    }
  }
}
```

---

## 2. PHASES (10 phases no total)

### Phase 1: cena-1-impacto (dramatic)
```json
{
  "id": "cena-1-impacto",
  "type": "dramatic",
  "title": "98% - O Impacto",
  "startTime": 0,
  "endTime": 14.58,
  
  "visual": {
    "type": "number-reveal",
    "content": {
      "hookQuestion": "VOCÊ SABIA?",
      "number": "98%",
      "subtitle": "tratam a Inteligência Artificial como brinquedo",
      "mood": "danger",
      "effect": "zoom-in"
    }
  },
  
  "effects": {
    "mood": "danger",
    "particles": "none",
    "glow": true,
    "grain": true,
    "vignette": true
  },
  
  "anchorActions": [
    {
      "id": "mv-multidao",
      "keyword": "brinquedo",
      "keywordTime": 7.709,
      "type": "show",
      "targetId": "mv-multidao"
    },
    {
      "id": "mv-celular",
      "keyword": "Isso mesmo",
      "keywordTime": 9.056,
      "type": "show",
      "targetId": "mv-celular"
    },
    {
      "id": "mv-tempo",
      "keyword": "passar o tempo",
      "keywordTime": 14.28,
      "type": "show",
      "targetId": "mv-tempo"
    }
  ],
  
  "microVisuals": [
    {
      "id": "mv-multidao",
      "type": "image-flash",
      "anchorText": "brinquedo",
      "triggerTime": 7.709,
      "duration": 2,
      "content": {
        "description": "Multidão rindo em slow motion",
        "duration": 0.8,
        "animation": "fade"
      }
    },
    {
      "id": "mv-celular",
      "type": "image-flash",
      "anchorText": "Isso mesmo",
      "triggerTime": 9.056,
      "duration": 2,
      "content": {
        "description": "Pessoas olhando celular e rindo",
        "duration": 0.8,
        "animation": "fade"
      }
    },
    {
      "id": "mv-tempo",
      "type": "text-pop",
      "anchorText": "passar o tempo",
      "triggerTime": 14.28,
      "duration": 2,
      "content": {
        "words": ["piada", "banana", "pirata", "poema", "meu gato"],
        "animation": "pop-fade"
      }
    }
  ]
}
```

**NARRAÇÃO EXATA (do audio):**
> "Noventa e oito por cento das pessoas que usam Inteligência Artificial hoje tratam ela como brinquedo. Isso mesmo. Elas fazem da Inteligência Artificial um brinquedo para passar o tempo."

---

### Phase 2: cena-2-brincadeira (narrative)
```json
{
  "id": "cena-2-brincadeira",
  "type": "narrative",
  "title": "Brincadeira vs Resultado",
  "startTime": 14.605,
  "endTime": 23,
  
  "visual": {
    "type": "text-reveal",
    "content": {
      "title": "98%",
      "mood": "warning",
      "items": [
        { "icon": "laugh", "text": "Conta uma piada sobre banana" },
        { "icon": "skull", "text": "Escreve como pirata" },
        { "icon": "cat", "text": "Faz um poema sobre meu gato" }
      ]
    }
  },
  
  "effects": {
    "mood": "warning",
    "particles": "confetti-light"
  },
  
  "anchorActions": [
    { "id": "mv-banana", "keyword": "banana", "keywordTime": 18.065, "type": "show", "targetId": "mv-banana" },
    { "id": "mv-pirata", "keyword": "pirata", "keywordTime": 19.899, "type": "show", "targetId": "mv-pirata" },
    { "id": "mv-gato", "keyword": "gato", "keywordTime": 22.036, "type": "show", "targetId": "mv-gato" }
  ],
  
  "microVisuals": [
    {
      "id": "mv-banana",
      "type": "text-pop",
      "anchorText": "banana",
      "triggerTime": 18.065,
      "duration": 2,
      "content": { "text": "piada sobre banana", "emoji": "🍌", "animation": "pop-fade" }
    },
    {
      "id": "mv-pirata",
      "type": "text-pop",
      "anchorText": "pirata",
      "triggerTime": 19.899,
      "duration": 2,
      "content": { "text": "como pirata", "emoji": "🏴‍☠️", "animation": "pop-fade" }
    },
    {
      "id": "mv-gato",
      "type": "text-pop",
      "anchorText": "gato",
      "triggerTime": 22.036,
      "duration": 2,
      "content": { "text": "sobre meu gato", "emoji": "🐱", "animation": "pop-fade" }
    }
  ]
}
```

**NARRAÇÃO EXATA:**
> "Elas pedem: conta uma piada sobre banana. Escreve como pirata. Faz um poema sobre meu gato."

---

### Phase 3: cena-3-virada (dramatic)
```json
{
  "id": "cena-3-virada",
  "type": "dramatic",
  "title": "Os 2% e o Dinheiro",
  "startTime": 23,
  "endTime": 28.292,
  
  "visual": {
    "type": "number-reveal",
    "content": {
      "number": "2%",
      "secondaryNumber": "+ R$ 30.000/mês",
      "showSecondaryAsMain": true,
      "subtitle": "estão faturando",
      "mood": "success",
      "countUp": true
    }
  },
  
  "effects": {
    "mood": "success",
    "particles": "sparks",
    "glow": true,
    "transitionSound": "impact"
  },
  
  "anchorActions": [
    { "id": "mv-dinheiro", "keyword": "trinta mil", "keywordTime": 26.761, "type": "show", "targetId": "mv-dinheiro" }
  ],
  
  "microVisuals": [
    {
      "id": "mv-dinheiro",
      "type": "number-count",
      "anchorText": "trinta mil",
      "triggerTime": 26.761,
      "duration": 2,
      "content": { "from": 0, "to": 30000, "prefix": "R$ ", "duration": 1.5 }
    }
  ]
}
```

**NARRAÇÃO EXATA:**
> "Enquanto isso, outros dois por cento estão faturando mais de trinta mil reais por mês."

---

### Phase 4: cena-4-comparacao (comparison)
```json
{
  "id": "cena-4-comparacao",
  "type": "comparison",
  "title": "Comparação 98% vs 2%",
  "startTime": 28.292,
  "endTime": 37.986,
  
  "visual": {
    "type": "split-screen",
    "content": {
      "left": {
        "label": "98% — BRINCANDO",
        "mood": "danger",
        "emoji": "😂",
        "items": ["sem contexto", "prompt curto", "resposta genérica"]
      },
      "right": {
        "label": "2% — LUCRANDO",
        "mood": "success",
        "emoji": "💰",
        "items": ["estrutura", "contexto", "objetivo", "resultado"]
      },
      "centerEmoji": "🍌",
      "centerPrompt": "piada sobre banana"
    }
  },
  
  "effects": {
    "convergence": true,
    "particles": "none"
  },
  
  "anchorActions": [
    { "id": "mv-brinca", "keyword": "brinca", "keywordTime": 29.327, "type": "show", "targetId": "mv-brinca" },
    { "id": "mv-ferramenta", "keyword": "ferramenta", "keywordTime": 31.892, "type": "show", "targetId": "mv-ferramenta" },
    { "id": "mv-genericas", "keyword": "genéricas", "keywordTime": 34.737, "type": "show", "targetId": "mv-genericas" },
    { "id": "mv-aplicaveis", "keyword": "aplicáveis", "keywordTime": 37.686, "type": "show", "targetId": "mv-aplicaveis" }
  ],
  
  "microVisuals": [
    { "id": "mv-brinca", "type": "highlight", "anchorText": "brinca", "triggerTime": 29.327, "content": { "side": "left", "pulse": true } },
    { "id": "mv-ferramenta", "type": "highlight", "anchorText": "ferramenta", "triggerTime": 31.892, "content": { "side": "right", "pulse": true } },
    { "id": "mv-genericas", "type": "highlight", "anchorText": "genéricas", "triggerTime": 34.737, "content": { "side": "left", "shake": true } },
    { "id": "mv-aplicaveis", "type": "highlight", "anchorText": "aplicáveis", "triggerTime": 37.686, "content": { "side": "right", "glow": true } }
  ]
}
```

**NARRAÇÃO EXATA:**
> "Um lado brinca. O outro usa como ferramenta. Um lado recebe respostas genéricas. O outro recebe entregas aplicáveis."

---

### Phase 5: cena-5-espelho (dramatic)
```json
{
  "id": "cena-5-espelho",
  "type": "dramatic",
  "title": "Espelho - A Reflexão",
  "startTime": 37.986,
  "endTime": 44.801,
  
  "visual": {
    "type": "text-reveal",
    "content": {
      "mainText": "SEJA HONESTO.",
      "subtitle": "Você é 98%... ou 2%?",
      "mood": "dramatic",
      "effect": "pulse"
    }
  },
  
  "effects": {
    "mood": "dramatic",
    "vignette": true,
    "slowZoom": true
  },
  
  "anchorActions": [
    { "id": "mv-honesto", "keyword": "honesto", "keywordTime": 38.754, "type": "show", "targetId": "mv-honesto" }
  ],
  
  "microVisuals": [
    {
      "id": "mv-honesto",
      "type": "text-highlight",
      "anchorText": "honesto",
      "triggerTime": 38.754,
      "content": { "highlight": "SEJA HONESTO", "animation": "glow" }
    }
  ]
}
```

**NARRAÇÃO EXATA:**
> "Seja honesto consigo mesmo. Você faz parte dos noventa e oito por cento, ou dos dois por cento?"

---

### Phase 6: cena-6-quiz (interaction)
```json
{
  "id": "cena-6-quiz",
  "type": "interaction",
  "title": "Quiz - Como Você Usa a IA?",
  "startTime": 44.801,
  "endTime": 51.546,
  
  "audioBehavior": {
    "onStart": "pause",
    "onComplete": "resume"
  },
  
  "visual": {
    "type": "quiz",
    "content": {
      "question": "Como você usa a I.A. hoje?",
      "mood": "neutral"
    }
  },
  
  "anchorActions": [
    {
      "id": "pause-cena-6-quiz",
      "keyword": "representa você",
      "keywordTime": 51.246,
      "type": "pause"
    }
  ],
  
  "interaction": {
    "type": "quiz",
    "question": "Como você usa a I.A. hoje?",
    "options": [
      {
        "id": "opt-98-simples",
        "text": "Perguntas simples e diretas, sem contexto.",
        "isCorrect": false,
        "feedback": {
          "title": "Você está nos 98%.",
          "subtitle": "Sem problema. Agora você vai virar a chave.",
          "mood": "warning",
          "audioId": "feedback-opt-98-simples"
        }
      },
      {
        "id": "opt-2-contexto",
        "text": "Com contexto, persona e objetivo claro.",
        "isCorrect": true,
        "feedback": {
          "title": "Você está nos 2%.",
          "subtitle": "Excelente. Agora você vai formalizar o método.",
          "mood": "success",
          "audioId": "feedback-opt-2-contexto"
        }
      },
      {
        "id": "opt-98-copia",
        "text": "Copio prompts da internet e adapto por cima.",
        "isCorrect": false,
        "feedback": {
          "title": "Você está nos 98%.",
          "subtitle": "Sem problema. Agora você vai virar a chave.",
          "mood": "warning",
          "audioId": "feedback-opt-98-copia"
        }
      }
    ],
    "timeout": {
      "soft": 5,
      "medium": 12,
      "hard": 25,
      "hints": ["Você tem que tomar a decisão.", "Escolhe aí.", "Responda com honestidade."],
      "autoSelect": "opt-98-simples"
    }
  }
}
```

**NARRAÇÃO EXATA:**
> "Como você usa a Inteligência Artificial hoje? Escolha a opção que mais representa você."

**FEEDBACK AUDIOS:**
- opt-98-simples: "Sem problemas. Você está no ponto exato em que a maioria está. E agora eu vou te mostrar como sair disso."
- opt-2-contexto: "Excelente. Você já está pensando como profissional. Agora eu vou te mostrar o método que deixa isso consistente."
- opt-98-copia: "Sem problemas. Você está no ponto exato em que a maioria está. E agora eu vou te mostrar como sair disso."

---

### Phase 7: cena-7-promessa (interaction)
```json
{
  "id": "cena-7-promessa",
  "type": "interaction",
  "title": "Promessa do Segredo dos 2%",
  "startTime": 51.546,
  "endTime": 63.725,
  
  "audioBehavior": {
    "onStart": "pause",
    "onComplete": "resume"
  },
  
  "visual": {
    "type": "cards-reveal",
    "content": {
      "title": "Vou te mostrar o segredo dos 2%",
      "subtitle": "Para projetos. Renda extra. E para se tornar 10x mais claro.",
      "cards": [
        { "id": "card-projetos", "text": "PROJETOS", "icon": "clipboard" },
        { "id": "card-renda", "text": "RENDA EXTRA", "icon": "dollar" },
        { "id": "card-clareza", "text": "10X MAIS CLAREZA", "icon": "brain" }
      ],
      "cta": {
        "text": "QUERO DESCOBRIR AGORA",
        "action": "next-phase"
      }
    }
  },
  
  "effects": {
    "mood": "success",
    "glow": true,
    "particles": "sparks"
  },
  
  "anchorActions": [
    { "id": "pause-cena-7-promessa", "keyword": "você faz", "keywordTime": 63.425, "type": "pause" },
    { "id": "mv-projetos", "keyword": "projetos", "keywordTime": 57.864, "type": "show", "targetId": "mv-projetos" },
    { "id": "mv-renda", "keyword": "renda extra", "keywordTime": 59.164, "type": "show", "targetId": "mv-renda" },
    { "id": "mv-dez-vezes", "keyword": "dez vezes", "keywordTime": 61.149, "type": "show", "targetId": "mv-dez-vezes" }
  ],
  
  "microVisuals": [
    { "id": "mv-projetos", "type": "card-reveal", "anchorText": "projetos", "triggerTime": 57.864, "content": { "cardId": "card-projetos", "animation": "slide-up" } },
    { "id": "mv-renda", "type": "card-reveal", "anchorText": "renda extra", "triggerTime": 59.164, "content": { "cardId": "card-renda", "animation": "slide-up" } },
    { "id": "mv-dez-vezes", "type": "card-reveal", "anchorText": "dez vezes", "triggerTime": 61.149, "content": { "cardId": "card-clareza", "animation": "slide-up" } }
  ],
  
  "interaction": {
    "type": "cta-button",
    "buttonText": "QUERO DESCOBRIR AGORA",
    "action": "next-phase",
    "userChallenge": {
      "instruction": "Agora é sua vez! Reescreva este prompt amador usando o método que você aprendeu:",
      "challengePrompt": "Me dá ideias de negócio",
      "hints": [
        "Defina seu objetivo específico (ex: renda extra, startup, freelance)",
        "Adicione contexto pessoal (suas habilidades, tempo disponível)",
        "Especifique o formato desejado (lista, plano de ação, análise)",
        "Inclua critérios de sucesso (faturamento, investimento inicial)"
      ]
    }
  }
}
```

**NARRAÇÃO EXATA:**
> "Agora eu vou te mostrar o segredo desses dois por cento. O método que eles usam para projetos, para renda extra, e para se tornar dez vezes mais inteligente no que você faz."

---

### Phase 8: cena-8-transicao (dramatic)
```json
{
  "id": "cena-8-transicao",
  "type": "dramatic",
  "title": "Transição para Revelação",
  "startTime": 63.725,
  "endTime": 67.87,
  
  "visual": {
    "type": "text-reveal",
    "content": {
      "mainText": "O MÉTODO",
      "highlightWord": "PERFEITO",
      "effect": "flash-reveal"
    }
  },
  
  "effects": {
    "flash": true,
    "particles": "burst",
    "sound": "revelation"
  }
}
```

**NARRAÇÃO EXATA:**
> "Eles conhecem o segredo. O método PERFEITO."

---

### Phase 9: cena-9-perfeito (revelation)
```json
{
  "id": "cena-9-perfeito",
  "type": "revelation",
  "title": "Revelação do Método PERFEITO",
  "startTime": 67.87,
  "endTime": 87,
  
  "visual": {
    "type": "letter-reveal",
    "content": {
      "word": "PERFEITO",
      "letters": [
        { "letter": "P", "meaning": "Persona", "subtitle": "específica" },
        { "letter": "E", "meaning": "Estrutura", "subtitle": "clara" },
        { "letter": "R", "meaning": "Resultado", "subtitle": "esperado" },
        { "letter": "F", "meaning": "Formato", "subtitle": "definido" },
        { "letter": "E", "meaning": "Exemplos", "subtitle": "práticos" },
        { "letter": "I", "meaning": "Iteração", "subtitle": "contínua" },
        { "letter": "T", "meaning": "Tom", "subtitle": "adequado" },
        { "letter": "O", "meaning": "Otimização", "subtitle": "constante" }
      ],
      "finalStamp": "MÉTODO PERFEITO"
    }
  },
  
  "effects": {
    "mood": "success",
    "glow": true,
    "particles": "sparks"
  },
  
  "anchorActions": [
    { "id": "mv-p", "keyword": "Persona", "keywordTime": 69.009, "type": "show", "targetId": "mv-p" },
    { "id": "mv-e1", "keyword": "Estrutura", "keywordTime": 70.541, "type": "show", "targetId": "mv-e1" },
    { "id": "mv-r", "keyword": "Resultado", "keywordTime": 72.178, "type": "show", "targetId": "mv-r" },
    { "id": "mv-f", "keyword": "Formato", "keywordTime": 73.595, "type": "show", "targetId": "mv-f" },
    { "id": "mv-e2", "keyword": "Exemplos", "keywordTime": 74.976, "type": "show", "targetId": "mv-e2" },
    { "id": "mv-i", "keyword": "Iteração", "keywordTime": 76.532, "type": "show", "targetId": "mv-i" },
    { "id": "mv-t", "keyword": "Tom", "keywordTime": 77.565, "type": "show", "targetId": "mv-t" },
    { "id": "mv-o", "keyword": "Otimização", "keywordTime": 79.435, "type": "show", "targetId": "mv-o" }
  ],
  
  "microVisuals": [
    { "id": "mv-p", "type": "letter-reveal", "anchorText": "Persona", "triggerTime": 69.009, "content": { "index": 0 } },
    { "id": "mv-e1", "type": "letter-reveal", "anchorText": "Estrutura", "triggerTime": 70.541, "content": { "index": 1 } },
    { "id": "mv-r", "type": "letter-reveal", "anchorText": "Resultado", "triggerTime": 72.178, "content": { "index": 2 } },
    { "id": "mv-f", "type": "letter-reveal", "anchorText": "Formato", "triggerTime": 73.595, "content": { "index": 3 } },
    { "id": "mv-e2", "type": "letter-reveal", "anchorText": "Exemplos", "triggerTime": 74.976, "content": { "index": 4 } },
    { "id": "mv-i", "type": "letter-reveal", "anchorText": "Iteração", "triggerTime": 76.532, "content": { "index": 5 } },
    { "id": "mv-t", "type": "letter-reveal", "anchorText": "Tom", "triggerTime": 77.565, "content": { "index": 6 } },
    { "id": "mv-o", "type": "letter-reveal", "anchorText": "Otimização", "triggerTime": 79.435, "content": { "index": 7 } }
  ]
}
```

**NARRAÇÃO EXATA:**
> "Método PERFEITO. P de Persona. E de Estrutura. R de Resultado. F de Formato. E de Exemplos. I de Iteração. T de Tom. O de Otimização."

---

### Phase 10: cena-10-playground (playground)
```json
{
  "id": "cena-10-playground",
  "type": "playground",
  "title": "Playground - A Diferença na Prática",
  "startTime": 79.435,
  "endTime": 87,
  
  "audioBehavior": {
    "onStart": "pause",
    "onComplete": "resume"
  },
  
  "visual": {
    "type": "playground",
    "content": {
      "title": "A DIFERENÇA NA PRÁTICA",
      "subtitle": "Prompt amador vs prompt profissional",
      "instruction": "Faça o teste agora"
    }
  },
  
  "anchorActions": [
    { "id": "pause-playground", "keyword": "teste agora", "keywordTime": 86.737, "type": "pause" }
  ],
  
  "interaction": {
    "type": "playground",
    "amateurPrompt": "Me dá ideias de negócio",
    "professionalPrompt": "Atue como um consultor de negócios com 20 anos de experiência em startups brasileiras. Preciso de 5 ideias de negócio para um profissional de 45 anos que trabalha com contabilidade e quer usar IA para criar uma renda extra de R$5.000/mês. Liste cada ideia com: nome do negócio, investimento inicial, tempo para primeiro faturamento, e potencial de escala.",
    "comparison": {
      "amateur": {
        "label": "PROMPT AMADOR",
        "response": "Aqui estão algumas ideias: loja virtual, dropshipping, afiliados, freelancer, consultoria.",
        "mood": "danger"
      },
      "professional": {
        "label": "PROMPT PROFISSIONAL (PERFEITO)",
        "response": "Baseado no seu perfil de contador com expertise em números e processos, aqui estão 5 ideias específicas para gerar R$5.000/mês com IA...",
        "mood": "success"
      }
    },
    "userChallenge": {
      "instruction": "Agora é sua vez! Reescreva este prompt amador usando o método PERFEITO:",
      "challengePrompt": "Me ajuda a escrever um email",
      "hints": [
        "Defina a PERSONA: Quem você quer que a IA seja?",
        "Especifique o RESULTADO: O que você espera receber?",
        "Determine o FORMATO: Como quer a resposta estruturada?",
        "Dê EXEMPLOS: Mostre o tom ou estilo desejado"
      ]
    }
  }
}
```

**NARRAÇÃO EXATA:**
> "Agora observe a diferença entre um prompt amador e um prompt profissional. Faça o teste agora."

---

## 3. TIMELINE COMPLETA DAS NARRAÇÕES

| Tempo | Texto |
|-------|-------|
| 0.00 - 14.28 | "Noventa e oito por cento das pessoas que usam Inteligência Artificial hoje tratam ela como brinquedo. Isso mesmo. Elas fazem da Inteligência Artificial um brinquedo para passar o tempo." |
| 14.60 - 22.04 | "Elas pedem: conta uma piada sobre banana. Escreve como pirata. Faz um poema sobre meu gato." |
| 22.31 - 27.99 | "Enquanto isso, outros dois por cento estão faturando mais de trinta mil reais por mês." |
| 28.20 - 37.69 | "Um lado brinca. O outro usa como ferramenta. Um lado recebe respostas genéricas. O outro recebe entregas aplicáveis." |
| 37.90 - 44.50 | "Seja honesto consigo mesmo. Você faz parte dos noventa e oito por cento, ou dos dois por cento?" |
| 45.01 - 51.25 | "Como você usa a Inteligência Artificial hoje? Escolha a opção que mais representa você." |
| 52.06 - 63.43 | "Agora eu vou te mostrar o segredo desses dois por cento. O método que eles usam para projetos, para renda extra, e para se tornar dez vezes mais inteligente no que você faz." |
| 63.63 - 67.57 | "Eles conhecem o segredo. O método PERFEITO." |
| 67.74 - 79.44 | "Método PERFEITO. P de Persona. E de Estrutura. R de Resultado. F de Formato. E de Exemplos. I de Iteração. T de Tom. O de Otimização." |
| 80.05 - 86.74 | "Agora observe a diferença entre um prompt amador e um prompt profissional. Faça o teste agora." |

---

## 4. CHECKLIST: O QUE O PIPELINE DEVE GERAR

### ✅ Metadata
- [ ] `model: "v7-cinematic"`
- [ ] `totalDuration` calculado dos word timestamps
- [ ] `phaseCount` igual ao número de scenes
- [ ] `generatedBy: "V7-vv"`

### ✅ Audio
- [ ] `mainAudio` com URL, duration, e wordTimestamps
- [ ] `feedbackAudios` para cada opção do quiz (se houver quiz)
- [ ] Cada feedback audio com seus próprios wordTimestamps

### ✅ Phases (convertidas de scenes)
- [ ] `id` mantido do scene original
- [ ] `type` convertido corretamente (dramatic, narrative, interaction, revelation, playground, comparison)
- [ ] `startTime` e `endTime` calculados dos word timestamps
- [ ] `visual` com estrutura correta para cada tipo
- [ ] `effects` mapeados do input

### ✅ Anchor Actions (CRÍTICO!)
- [ ] Criados a partir de `anchorText.pauseAt` e `anchorText.transitionAt`
- [ ] `keywordTime` calculado buscando a palavra nos word timestamps
- [ ] `type: "pause"` para pauseAt
- [ ] `type: "show"` para microVisuals

### ✅ MicroVisuals (CRÍTICO!)
- [ ] `triggerTime` calculado buscando `anchorText` nos word timestamps
- [ ] `duration` padrão de 2 segundos
- [ ] Estrutura de `content` mantida do input

### ✅ Interactions
- [ ] `audioBehavior: { onStart: "pause", onComplete: "resume" }` para quiz/playground
- [ ] `timeout` para quiz
- [ ] `feedback.audioId` referenciando feedbackAudios

---

## 5. ONDE ESTÁ O PROBLEMA?

Se a aula gerada pelo Pipeline não fica igual à Aula 1, verificar:

1. **O Pipeline não está calculando `keywordTime` corretamente** - Não está buscando as palavras âncora nos word timestamps
2. **O Pipeline não está gerando `anchorActions`** - Não está convertendo `anchorText.pauseAt` em actions
3. **O Pipeline não está gerando `microVisuals` com `triggerTime`** - Não está calculando quando mostrar cada visual
4. **O Pipeline está ignorando `audioBehavior`** - Quiz e Playground não pausam o áudio
5. **O Pipeline não está gerando feedbackAudios** - Cada opção do quiz precisa de áudio separado
