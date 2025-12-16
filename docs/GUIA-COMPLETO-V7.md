# 🎬 GUIA COMPLETO - Sistema V7 Cinematic

## 📋 Índice
1. [Como Funciona o V7](#como-funciona)
2. [Tipos de Acts (Fases)](#tipos-de-acts)
3. [Estrutura do JSON](#estrutura-json)
4. [Como Criar uma Lição](#como-criar)
5. [Troubleshooting](#troubleshooting)

---

## 🎯 Como Funciona o V7

O V7 transforma lições em **experiências cinematográficas** de 8 minutos com:
- ✅ Autoplay automático
- ✅ Fullscreen
- ✅ Cursor oculto (experiência imersiva)
- ✅ Transições suaves
- ✅ Interações integradas (Quiz, Playground, CTA)
- ✅ Gamificação (XP, conquistas)

---

## 🎭 Tipos de Acts (Fases)

### 1. **DRAMATIC** - Entrada Impactante
Usado para: Abertura dramática, estatísticas chocantes, hook inicial

```json
{
  "id": "act-1-dramatic",
  "type": "dramatic",
  "title": "98% vs 2%: A Diferença Brutal",
  "duration": 60,
  "content": {
    "visual": {
      "text": "98% BRINCAM\n2% LUCRAM R$ 30K/MÊS",
      "effects": ["dramatic-zoom", "particles"]
    },
    "audio": {
      "narration": "Enquanto 98% brincam, 2% faturam 30 mil por mês..."
    }
  }
}
```

**✅ Funciona:** Texto grande, efeitos visuais, música dramática
**❌ NÃO tem:** Interações (é só impacto visual)

---

### 2. **NARRATIVE / COMPARISON** - Narrativa ou Comparação
Usado para: Explicar conceitos, mostrar antes/depois, comparar abordagens

```json
{
  "id": "act-2-narrative",
  "type": "comparison",
  "title": "Amador vs Profissional",
  "duration": 90,
  "content": {
    "visual": {
      "text": "AMADOR:\n'Crie um post'\n\nVS\n\nPROFISSIONAL:\n'Atue como especialista...'",
      "layout": "split-screen"
    },
    "audio": {
      "narration": "Veja a diferença brutal entre amador e profissional..."
    }
  }
}
```

**✅ Funciona:** Split-screen, comparações lado a lado
**❌ NÃO tem:** Interações (é narrativa pura)

---

### 3. **QUIZ / INTERACTION** - Quiz Interativo ⚠️ IMPORTANTE
Usado para: Auto-avaliação, reflexão, engajamento

```json
{
  "id": "act-3-interaction",
  "type": "quiz",
  "title": "Quiz: Você é 98% ou 2%?",
  "duration": 45,
  "content": {
    "visual": {
      "question": "Como você geralmente faz prompts?",
      "options": [
        {
          "id": "opt-1",
          "text": "Perguntas simples",
          "correct": false,
          "feedback": "Esse é o jeito amador!"
        },
        {
          "id": "opt-2",
          "text": "Estruturados com contexto",
          "correct": true,
          "feedback": "Excelente! Você está no caminho! 🎯"
        }
      ],
      "hint": "Profissionais estruturam, amadores improvisam",
      "points": 50,
      "successMessage": "Isso mesmo! Você está evoluindo! 🚀",
      "errorMessage": "Sem problemas, você vai aprender!"
    },
    "audio": {
      "narration": "Pausa para reflexão. Como VOCÊ está usando IA?"
    }
  }
}
```

**⚠️ ESTRUTURA OBRIGATÓRIA PARA FUNCIONAR:**
- ✅ `visual.question` - A pergunta
- ✅ `visual.options[]` - Array de opções
  - `id` - ID único (opt-1, opt-2...)
  - `text` - Texto da opção
  - `correct` - true/false
  - `feedback` (opcional) - Feedback específico
- ✅ `visual.points` - Pontos que vale (50, 100...)
- ✅ `visual.successMessage` - Mensagem de acerto
- ✅ `visual.errorMessage` - Mensagem de erro

**🔴 SE FALTA ALGO AQUI, O QUIZ NÃO FUNCIONA!**

---

### 4. **PLAYGROUND** - Desafio Prático ⚠️ IMPORTANTE
Usado para: Prática hands-on, desafios de código/texto

```json
{
  "id": "act-4-playground",
  "type": "playground",
  "title": "Desafio: Prompt Amador → PRO",
  "duration": 120,
  "content": {
    "visual": {
      "question": "Transforme este prompt amador em profissional",
      "challenge": "Prompt Amador: 'Me ajude a vender mais'",
      "initialCode": "// Seu Prompt PRO:\n",
      "solution": "Atue como consultor de vendas B2B...",
      "language": "text",
      "points": 100
    },
    "audio": {
      "narration": "Agora é sua vez! Transforme amador em PRO..."
    }
  }
}
```

**⚠️ ESTRUTURA OBRIGATÓRIA PARA FUNCIONAR:**
- ✅ `visual.question` - O desafio
- ✅ `visual.challenge` - Contexto do desafio
- ✅ `visual.initialCode` - Código/texto inicial
- ✅ `visual.solution` - Solução esperada
- ✅ `visual.language` - Linguagem (text, javascript, python...)
- ✅ `visual.points` - Pontos (geralmente 100)

**🔴 SE FALTA ALGO AQUI, O PLAYGROUND NÃO FUNCIONA!**

---

### 5. **REVELATION** - Revelação / Método
Usado para: Revelar fórmulas, métodos, segredos

```json
{
  "id": "act-5-revelation",
  "type": "revelation",
  "title": "Método PERFEITO: A Fórmula dos 2%",
  "duration": 90,
  "content": {
    "visual": {
      "text": "MÉTODO PERFEITO\n\nP - Persona\nE - Especificidade\nR - Resultado\nF - Formato\nE - Exemplos\nI - Instruções\nT - Tom\nO - Otimização"
    },
    "audio": {
      "narration": "Aqui está o método que os 2% usam..."
    }
  }
}
```

**✅ Funciona:** Revelação gradual, efeitos de zoom
**❌ NÃO tem:** Interações (é revelação pura)

---

### 6. **CTA** - Call-to-Action ⚠️ IMPORTANTE
Usado para: Escolhas finais, próximos passos

```json
{
  "id": "act-6-cta",
  "type": "cta",
  "title": "Sua Escolha: Qual Caminho?",
  "duration": 45,
  "content": {
    "visual": {
      "question": "O que você vai fazer agora?",
      "prompt": "Escolha com sabedoria:",
      "choices": [
        {
          "id": "choice-1",
          "text": "🎯 Aplicar o Método PERFEITO hoje",
          "action": "next-lesson",
          "highlight": true
        },
        {
          "id": "choice-2",
          "text": "📚 Revisar os exemplos",
          "action": "review"
        }
      ]
    },
    "audio": {
      "narration": "Momento da verdade. O que você escolhe?"
    }
  }
}
```

**⚠️ ESTRUTURA OBRIGATÓRIA PARA FUNCIONAR:**
- ✅ `visual.question` - A pergunta/decisão
- ✅ `visual.prompt` (opcional) - Texto adicional
- ✅ `visual.choices[]` - Array de escolhas
  - `id` - ID único (choice-1, choice-2...)
  - `text` - Texto do botão
  - `action` (opcional) - Ação ao clicar
  - `highlight` (opcional) - Destacar opção

**🔴 SE FALTA ALGO AQUI, O CTA NÃO FUNCIONA!**

---

### 7. **GAMIFICATION** - Gamificação Final
Usado para: Resumo de conquistas, XP, achievements

```json
{
  "id": "act-7-gamification",
  "type": "gamification",
  "title": "Conquistas Desbloqueadas!",
  "duration": 30,
  "content": {
    "visual": {
      "text": "🏆 CONQUISTAS\n\n✅ Método Dominado\n✅ Primeiro Prompt PRO\n\n+150 XP"
    },
    "audio": {
      "narration": "Parabéns! Você dominou o método dos 2%!"
    }
  }
}
```

**✅ Funciona:** Animações de conquistas, XP counter
**❌ NÃO tem:** Interações (é gamificação automática)

---

## 📝 Como Criar uma Lição V7

### PASSO 1: Acesse o Admin
```
/admin/v7/create
```

### PASSO 2: Preencha Metadados
```json
{
  "title": "O Fim da Brincadeira com IA",
  "subtitle": "98% brinca. 2% lucra.",
  "category": "prompts",
  "difficulty": "intermediate",
  "estimatedTime": 8
}
```

### PASSO 3: Cole o JSON Completo
Use o exemplo em `/docs/v7-complete-lesson-example.json`

### PASSO 4: Clique "Gerar Lição V7"
O sistema vai:
1. ✅ Validar o JSON
2. ✅ Usar o adapter se formato correto
3. ✅ Criar lição no Supabase
4. ✅ Redirecionar para preview

### PASSO 5: Visualize no Preview
```
/admin/v7/preview/{lessonId}
```

---

## 🔧 Troubleshooting

### ❌ "Quiz não funciona"
**Causa:** Falta `visual.question` ou `visual.options`

**Solução:**
```json
"visual": {
  "question": "Sua pergunta aqui",
  "options": [
    {
      "id": "opt-1",
      "text": "Opção 1",
      "correct": false
    }
  ],
  "points": 50
}
```

---

### ❌ "Playground não funciona"
**Causa:** Falta `visual.initialCode` ou `visual.solution`

**Solução:**
```json
"visual": {
  "question": "Desafio",
  "initialCode": "// Código inicial\n",
  "solution": "Solução esperada",
  "language": "text",
  "points": 100
}
```

---

### ❌ "CTA não funciona"
**Causa:** Falta `visual.choices` array

**Solução:**
```json
"visual": {
  "question": "O que fazer?",
  "choices": [
    {
      "id": "choice-1",
      "text": "Opção 1"
    }
  ]
}
```

---

### ❌ "Tela preta no preview"
**Causas possíveis:**
1. JSON inválido
2. Falta `content.visual.text` ou `content.visual.question`
3. Acts sem `duration`

**Solução:**
Sempre ter:
```json
{
  "id": "act-1",
  "type": "dramatic",
  "duration": 60,
  "content": {
    "visual": {
      "text": "ALGO AQUI"
    },
    "audio": {
      "narration": "Texto da narração"
    }
  }
}
```

---

## ✅ Checklist Final

Antes de publicar, verifique:

- [ ] Todos os acts têm `id` único
- [ ] Todos os acts têm `type` correto
- [ ] Todos os acts têm `duration` (segundos)
- [ ] Quiz tem `question` + `options` + `points`
- [ ] Playground tem `initialCode` + `solution` + `language`
- [ ] CTA tem `choices` array
- [ ] Todos os acts têm `audio.narration`
- [ ] Duração total ≈ 8 minutos (480 segundos)
- [ ] Metadata completo (title, category, etc.)

---

## 🚀 Exemplo Completo Testado

Veja: `/docs/v7-complete-lesson-example.json`

Esse JSON tem TODOS os 7 tipos de acts configurados corretamente e vai funcionar 100%!

---

## 📞 Suporte

- Build falhou? Rode `npm run build`
- Preview com erro? Verifique console (F12)
- JSON inválido? Use validador JSON online
- Interações não aparecem? Confira estrutura `visual.*`

**Lembre-se:** O adapter procura `visual.question`, `visual.options`, `visual.choices` etc. Se não tiver, não cria interação!
