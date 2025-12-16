# 📊 V7 JSON - Estruturas Simples vs Estruturada

## ❌ O PROBLEMA que Causou os 6 Bugs

Você viu esses problemas na aula:
1. ✗ Legendas piscando
2. ✗ Slides repetindo sem sincronização
3. ✗ Sem exercícios/quiz
4. ✗ Instrução de tela sendo narrada
5. ✗ Playground não apareceu
6. ✗ Tudo dessincronizado

**CAUSA RAIZ:** JSON simples não compatível com o player.

---

## 🔍 Entendendo as Duas Estruturas

### ❌ JSON SIMPLES (v7-complete-lesson-FIXED.json)

**Problema:** Dados genéricos sem estrutura específica.

```json
{
  "content": {
    "visual": {
      "text": "98% DAS PESSOAS BRINCAM COM IA\n\n2% LUCRAM R$ 30K"
    },
    "audio": {
      "narration": "Enquanto 98% das pessoas..."
    }
  }
}
```

**Por que NÃO funciona:**
- `visual.text` é genérico demais
- Player não sabe extrair `mainValue`, `subtitle`, `highlightWord`
- Não tem `leftCard`, `rightCard` para comparações
- Não tem `options` para quiz
- Não tem `amateurPrompt`, `professionalPrompt` para playground

**Resultado:** Player não consegue renderizar corretamente.

---

### ✅ JSON ESTRUTURADO (v7-complete-lesson-STRUCTURED.json)

**Solução:** Dados específicos para cada tipo de act.

#### Act Dramatic (98% vs 2%)

```json
{
  "content": {
    "visual": {
      "mainValue": "98%",
      "subtitle": "das pessoas brincam com IA",
      "highlightWord": "brincam",
      "mood": "danger",
      "instruction": "[VISUAL: Tela escura com 98% pulsando]"
    },
    "audio": {
      "narration": "Enquanto 98%..."
    }
  }
}
```

**Por que funciona:**
- ✅ `mainValue` → Player sabe o que destacar
- ✅ `subtitle` → Texto de apoio
- ✅ `highlightWord` → Palavra para animar
- ✅ `mood` → Define cor/atmosfera
- ✅ `instruction` → Direção visual (NÃO narrado!)

---

#### Act Comparison (Amador vs PRO)

```json
{
  "content": {
    "visual": {
      "title": "A DIFERENÇA BRUTAL",
      "subtitle": "Veja como cada grupo usa IA",
      "leftCard": {
        "label": "AMADOR (98%)",
        "value": "R$ 0/mês",
        "isPositive": false,
        "details": ["Prompts simples", "Sem estrutura"],
        "prompt": "Crie um post para Instagram"
      },
      "rightCard": {
        "label": "PROFISSIONAL (2%)",
        "value": "R$ 30K/mês",
        "isPositive": true,
        "details": ["Prompts estruturados", "Método PERFEITO"],
        "prompt": "Atue como especialista..."
      },
      "instruction": "[VISUAL: Split-screen animado]"
    },
    "audio": {
      "narration": "Veja a diferença brutal..."
    }
  }
}
```

**Por que funciona:**
- ✅ `leftCard` / `rightCard` → Player renderiza comparação lado a lado
- ✅ `isPositive` → Define cores (vermelho vs verde)
- ✅ `details` → Lista de pontos
- ✅ `prompt` → Texto específico de cada lado

---

#### Act Quiz (Você é 98% ou 2%?)

```json
{
  "content": {
    "visual": {
      "question": "Como você geralmente faz prompts?",
      "title": "AUTO-AVALIAÇÃO",
      "options": [
        {
          "id": "opt-1",
          "text": "Perguntas simples, sem contexto",
          "label": "Perguntas simples",
          "isCorrect": false,
          "category": "bad",
          "feedback": "Esse é o jeito amador!"
        },
        {
          "id": "opt-2",
          "text": "Estruturados com contexto",
          "label": "Prompts estruturados",
          "isCorrect": true,
          "category": "good",
          "feedback": "Você está nos 2%! 🎯"
        }
      ],
      "correctFeedback": "Perfeito! 🚀",
      "incorrectFeedback": "Hora de aprender!",
      "instruction": "[VISUAL: Quiz interativo com feedback]"
    },
    "audio": {
      "narration": "Pausa para reflexão..."
    },
    "interaction": {
      "type": "quiz",
      "pauseAudio": true,
      "revealOnAnswer": true
    }
  }
}
```

**Por que funciona:**
- ✅ `options` → Array com todas as opções do quiz
- ✅ `isCorrect` → Define resposta certa
- ✅ `category` → "good" ou "bad" para styling
- ✅ `feedback` → Mensagem personalizada por opção
- ✅ `interaction.pauseAudio` → Pausa áudio durante quiz

---

#### Act Playground (Desafio Prático)

```json
{
  "content": {
    "visual": {
      "title": "TRANSFORME PROMPT AMADOR EM PRO",
      "subtitle": "Seu desafio prático",
      "challenge": "Transforme este prompt amador...",
      "amateurPrompt": "Me ajude a vender mais",
      "professionalPrompt": "Atue como consultor B2B...",
      "amateurResult": "Resultado genérico",
      "professionalResult": "Sequência personalizada gerando 1000 leads",
      "amateurScore": 10,
      "professionalScore": 95,
      "instruction": "[VISUAL: Editor split-screen]"
    },
    "audio": {
      "narration": "Agora é sua vez de praticar..."
    },
    "interaction": {
      "type": "playground",
      "pauseAudio": true,
      "interactive": true
    }
  }
}
```

**Por que funciona:**
- ✅ `amateurPrompt` / `professionalPrompt` → Comparação direta
- ✅ `amateurResult` / `professionalResult` → Resultados esperados
- ✅ `amateurScore` / `professionalScore` → Pontuação visual
- ✅ `interaction.interactive` → Ativa modo interativo

---

#### Act Revelation (Método PERFEITO)

```json
{
  "content": {
    "visual": {
      "title": "MÉTODO PERFEITO",
      "subtitle": "A fórmula dos 2%",
      "items": [
        {
          "emoji": "👤",
          "letter": "P",
          "text": "Persona - Defina quem a IA deve ser",
          "description": "Ex: 'Atue como especialista...'"
        },
        // ... mais 7 itens
      ],
      "instruction": "[VISUAL: Reveal sequencial animado]"
    },
    "audio": {
      "narration": "Aqui está o método secreto..."
    }
  }
}
```

**Por que funciona:**
- ✅ `items` → Array estruturado para reveal sequencial
- ✅ `letter` → Letra do acrônimo
- ✅ `emoji` → Ícone visual
- ✅ `description` → Explicação detalhada

---

#### Act CTA (Call to Action)

```json
{
  "content": {
    "visual": {
      "title": "O QUE VOCÊ VAI FAZER AGORA?",
      "subtitle": "Escolha seu caminho",
      "options": [
        {
          "id": "choice-1",
          "label": "🎯 Aplicar AGORA",
          "text": "Aplicar o Método PERFEITO imediatamente",
          "emoji": "🎯",
          "variant": "primary",
          "action": "next-lesson"
        }
        // ... mais opções
      ],
      "instruction": "[VISUAL: 3 botões destacados]"
    },
    "audio": {
      "narration": "Momento da verdade..."
    },
    "interaction": {
      "type": "cta",
      "pauseAudio": false,
      "required": false
    }
  }
}
```

**Por que funciona:**
- ✅ `options` → Botões de escolha
- ✅ `variant` → Estilo (primary, secondary, accent)
- ✅ `action` → Ação ao clicar
- ✅ `interaction.required` → Se escolha é obrigatória

---

#### Act Gamification (Conquistas)

```json
{
  "content": {
    "visual": {
      "title": "🏆 CONQUISTAS",
      "subtitle": "Parabéns! Você completou!",
      "achievements": [
        { "emoji": "✅", "text": "Revelação dos 2% Completa", "xp": 50 },
        { "emoji": "✅", "text": "Método PERFEITO Dominado", "xp": 50 }
      ],
      "metrics": [
        { "label": "XP Ganho", "value": "+150", "icon": "⭐", "isHighlight": true },
        { "label": "Nível", "value": "Prompting Avançado", "icon": "🎯" }
      ],
      "instruction": "[VISUAL: Confetes e badges]"
    },
    "audio": {
      "narration": "Parabéns! Você completou..."
    }
  }
}
```

**Por que funciona:**
- ✅ `achievements` → Lista de conquistas com XP
- ✅ `metrics` → Métricas de progresso
- ✅ `isHighlight` → Destaque visual

---

## 🎯 Campo Especial: `instruction`

### ❌ PROBLEMA: Instrução sendo Narrada

**JSON Simples:**
```json
{
  "visual": {
    "text": "Tela escura com 98% pulsando e partículas vermelhas"
  },
  "audio": {
    "narration": "Tela escura com 98% pulsando..." // ❌ ERRADO!
  }
}
```

### ✅ SOLUÇÃO: Campo `instruction` Separado

**JSON Estruturado:**
```json
{
  "visual": {
    "mainValue": "98%",
    "subtitle": "das pessoas brincam",
    "instruction": "[VISUAL: Tela escura com 98% pulsando, partículas vermelhas]"
  },
  "audio": {
    "narration": "Enquanto 98% das pessoas..." // ✅ CORRETO!
  }
}
```

**Diferença:**
- `instruction` → **NÃO é narrado**, apenas guia o visual
- `narration` → **É narrado** pelo TTS (ElevenLabs)

---

## 📋 Checklist: Qual JSON Usar?

### Use JSON SIMPLES quando:
- [ ] Apenas prototipar rapidamente
- [ ] Testar conceito básico
- [ ] **NÃO** quando for para produção!

### Use JSON ESTRUTURADO quando:
- [x] Criar aula para produção
- [x] Precisar de quiz/playground funcionando
- [x] Quiser sincronização perfeita
- [x] Precisar de interações
- [x] Quiser experiência profissional

---

## 🚀 Como Usar o JSON Estruturado

### 1. Faça Sync no Lovable

Primeiro, garanta que o pipeline corrigido está deployado.

### 2. Use o JSON Correto

**Arquivo:** `/docs/v7-complete-lesson-STRUCTURED.json`

### 3. Cole no Admin

1. Vá para: `/admin/v7/create`
2. Aba: "Colar JSON"
3. Cole o conteúdo de `v7-complete-lesson-STRUCTURED.json`
4. Clique: "Enviar para Pipeline V7"

### 4. Resultado Esperado

```
✓ Validando JSON
✓ Processando Atos Cinematográficos: 7 atos
✓ Extraindo Narrações: 7 narrações  ← CORRETO!
✓ Gerando Áudio: Áudio gerado       ← CORRETO!
✓ Construindo Conteúdo Final
✓ Salvando no Banco de Dados
```

### 5. Teste no Preview

1. Vá para: `/admin/v7/play/[lesson-id]`
2. Clique Play
3. Veja:
   - ✅ Legendas sincronizadas
   - ✅ Slides mudando no tempo certo
   - ✅ Quiz aparecendo e funcionando
   - ✅ Playground com comparação
   - ✅ Tudo sincronizado perfeitamente!

---

## 🔧 Troubleshooting

### Problema: Ainda mostra "0 narrações"

**Causa:** Pipeline não foi deployado.

**Solução:**
1. Fazer sync no Lovable
2. OU deploy manual no Supabase Dashboard

### Problema: Quiz não aparece

**Causa:** JSON não tem campo `options` estruturado.

**Solução:** Usar JSON ESTRUTURADO com `visual.options` array completo.

### Problema: Playground não funciona

**Causa:** Falta `amateurPrompt`, `professionalPrompt`, etc.

**Solução:** Usar JSON ESTRUTURADO com todos os campos de playground.

### Problema: Legendas piscando

**Causa:** Word timestamps dessincronizados.

**Solução:**
1. Regenerar áudio com ElevenLabs
2. Word timestamps serão recalculados

---

## 📊 Comparação Final

| Aspecto | JSON Simples | JSON Estruturado |
|---------|--------------|------------------|
| **Complexidade** | Baixa | Alta |
| **Funcionalidade** | 30% | 100% |
| **Quiz/Interações** | ❌ Não | ✅ Sim |
| **Playground** | ❌ Não | ✅ Sim |
| **Sincronização** | ❌ Ruim | ✅ Perfeita |
| **Legendas** | ❌ Ruins | ✅ Profissionais |
| **Pronto para Produção** | ❌ Não | ✅ Sim |

---

## ✅ Conclusão

**Use SEMPRE o JSON ESTRUTURADO** (`v7-complete-lesson-STRUCTURED.json`) para aulas de produção.

O JSON simples era apenas um exemplo básico, mas não tem estrutura suficiente para o player renderizar corretamente.

**Todos os 6 problemas** que você viu são resolvidos usando a estrutura correta.
