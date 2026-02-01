# V7 JSON Template: Letter-Reveal (Acrônimo PERFEITO)

## ⚠️ Regra Crítica

**A narração do acrônimo DEVE estar DENTRO da mesma cena que define os microVisuals.**

O Pipeline calcula os timestamps dos microVisuals **apenas dentro do range da cena**. Se a narração estiver em uma cena anterior, os microVisuals não encontrarão as palavras-âncora e usarão fallback incorreto.

---

## ❌ Estrutura ERRADA

```json
{
  "scenes": [
    {
      "id": "cena-8-transicao",
      "type": "transition",
      "narration": "Esse é o método PERFEITO. Persona específica. Estrutura clara. Resultado esperado..."
    },
    {
      "id": "cena-9-perfeito",
      "type": "revelation",
      "narration": "Agora veja a diferença na prática.",
      "visual": {
        "type": "letter-reveal",
        "content": { "word": "PERFEITO", "letters": [...] }
      },
      "microVisuals": [
        { "anchorText": "Persona", "type": "letter-reveal", "content": { "index": 0 } }
      ]
    }
  ]
}
```

**Problema:** A narração "Persona específica..." está na `cena-8`, mas os microVisuals estão na `cena-9`. O Pipeline busca "Persona" apenas no range da `cena-9` e não encontra.

---

## ✅ Estrutura CORRETA

```json
{
  "scenes": [
    {
      "id": "cena-8-transicao",
      "type": "transition",
      "narration": "Agora vou te ensinar um método que vai transformar seus prompts."
    },
    {
      "id": "cena-9-perfeito",
      "type": "revelation",
      "narration": "Esse é o método PERFEITO. Persona específica. Estrutura clara. Resultado esperado. Formato definido. Exemplos práticos. Iteração contínua. Tom adequado. Otimização constante. Com esse método, seus prompts serão imbatíveis.",
      "visual": {
        "type": "letter-reveal",
        "content": {
          "word": "PERFEITO",
          "finalStamp": "PERFEITO",
          "letters": [
            { "letter": "P", "meaning": "Persona Específica" },
            { "letter": "E", "meaning": "Estrutura Clara" },
            { "letter": "R", "meaning": "Resultado Esperado" },
            { "letter": "F", "meaning": "Formato Definido" },
            { "letter": "E", "meaning": "Exemplos Práticos" },
            { "letter": "I", "meaning": "Iteração Contínua" },
            { "letter": "T", "meaning": "Tom Adequado" },
            { "letter": "O", "meaning": "Otimização Constante" }
          ]
        }
      },
      "microVisuals": [
        { "anchorText": "Persona", "type": "letter-reveal", "content": { "index": 0 } },
        { "anchorText": "Estrutura", "type": "letter-reveal", "content": { "index": 1 } },
        { "anchorText": "Resultado", "type": "letter-reveal", "content": { "index": 2 } },
        { "anchorText": "Formato", "type": "letter-reveal", "content": { "index": 3 } },
        { "anchorText": "Exemplos", "type": "letter-reveal", "content": { "index": 4 } },
        { "anchorText": "Iteração", "type": "letter-reveal", "content": { "index": 5 } },
        { "anchorText": "Tom", "type": "letter-reveal", "content": { "index": 6 } },
        { "anchorText": "Otimização", "type": "letter-reveal", "content": { "index": 7 } }
      ],
      "anchorText": {
        "pauseAt": "imbatíveis"
      }
    }
  ]
}
```

**Por que funciona:**
1. A narração "Persona específica. Estrutura clara..." está **dentro** da `cena-9`
2. O Pipeline calcula o range da `cena-9` baseado nessa narração
3. Cada microVisual encontra sua palavra-âncora dentro do range correto
4. Os triggers são calculados com timestamps precisos

---

## 📋 Checklist para Letter-Reveal

| Item | Verificação |
|------|-------------|
| ✅ Narração do acrônimo | Deve estar na **mesma cena** que `visual.type: "letter-reveal"` |
| ✅ Palavras-âncora | Cada `microVisual.anchorText` deve aparecer **literalmente** na narração |
| ✅ Ordem dos microVisuals | Deve corresponder à ordem das letras no array `letters` |
| ✅ Índices corretos | `content.index` deve corresponder à posição no array (0, 1, 2...) |
| ✅ finalStamp | Palavra final que encerra a animação (ex: "PERFEITO") |
| ✅ pauseAt | Palavra para pausar após a revelação completa |

---

## 🔧 Fluxo do Pipeline

```
┌─────────────────────────────────────────────────────────────────────┐
│ JSON de Entrada (estrutura CORRETA)                                  │
├──────────────────────────────────────────────────────────────────────┤
│ cena-9-perfeito:                                                     │
│   narration: "PERFEITO. Persona... Estrutura... Resultado..."       │
│   visual.type: "letter-reveal"                                       │
│   microVisuals: [{ anchorText: "Persona" }, { anchorText: "..." }]  │
└──────────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│ Pipeline v7-vv                                                       │
├──────────────────────────────────────────────────────────────────────┤
│ 1. Gera áudio via ElevenLabs com word-level timestamps              │
│ 2. Calcula range da cena-9: ~60s → ~82s                             │
│ 3. Para cada microVisual:                                            │
│    - Busca "Persona" em [60s, 82s] → ENCONTRA @ 61.417s ✅          │
│    - Busca "Estrutura" em [60s, 82s] → ENCONTRA @ 63.065s ✅        │
│    - ... (todos os 8)                                                │
│ 4. Gera triggerTimes precisos para cada letra                       │
└──────────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│ Resultado no Banco de Dados                                          │
│ microVisuals: [                                                      │
│   { anchorText: "Persona", triggerTime: 61.417, content: {index:0} }│
│   { anchorText: "Estrutura", triggerTime: 63.065, content: {index:1}}│
│   ...                                                                │
│ ]                                                                    │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 📝 Template Completo para Acrônimos

```json
{
  "id": "cena-X-acronimo",
  "type": "revelation",
  "narration": "[PALAVRA]. [Significado letra 1]. [Significado letra 2]. ... [Frase de conclusão].",
  "visual": {
    "type": "letter-reveal",
    "content": {
      "word": "[PALAVRA]",
      "finalStamp": "[PALAVRA]",
      "letters": [
        { "letter": "[L1]", "meaning": "[Significado 1]" },
        { "letter": "[L2]", "meaning": "[Significado 2]" }
      ]
    }
  },
  "microVisuals": [
    { "anchorText": "[Palavra-chave 1]", "type": "letter-reveal", "content": { "index": 0 } },
    { "anchorText": "[Palavra-chave 2]", "type": "letter-reveal", "content": { "index": 1 } }
  ],
  "anchorText": {
    "pauseAt": "[última palavra antes de pausar]"
  }
}
```

**Regras para `anchorText`:**
- Deve ser uma palavra **única e distintiva** na narração
- Preferencialmente a **primeira palavra** de cada significado
- Deve aparecer **exatamente** como escrito (case-insensitive)

---

## 🚫 Erros Comuns

| Erro | Consequência | Solução |
|------|--------------|---------|
| Narração em cena anterior | microVisuals usam fallback | Mover narração para mesma cena |
| anchorText não existe na narração | triggerTime incorreto | Verificar texto exato |
| Índices fora de ordem | Letras aparecem na ordem errada | Sincronizar índices com array |
| Falta finalStamp | Animação não conclui corretamente | Adicionar palavra final |

---

## ⏱️ Timing e Duração Recomendada

### Velocidade de Narração

O ElevenLabs processa narração a aproximadamente **150 palavras por minuto** (2.5 palavras/segundo). Considere isso ao escrever a narração do acrônimo.

### Estrutura Temporal Recomendada

| Elemento | Duração Recomendada | Observação |
|----------|---------------------|------------|
| Introdução do acrônimo | 1-2s | "Esse é o método PERFEITO." |
| Intervalo entre letras | 1.5-2.5s | Tempo para cada significado ser falado |
| Revelação de cada letra | 0.7s | Animação interna do componente |
| Pausa final (finalStamp) | 2-3s | Momento de absorção visual |
| Duração total da cena | 20-35s | Depende do número de letras |

### Cálculo de Duração por Acrônimo

```
Duração estimada = (N × 2s) + 5s

Onde:
- N = número de letras
- 2s = tempo médio por letra + significado
- 5s = introdução + pausa final
```

| Acrônimo | Letras | Duração Estimada |
|----------|--------|------------------|
| FOCO | 4 | ~13 segundos |
| PERFEITO | 8 | ~21 segundos |
| METODOLOGIA | 10 | ~25 segundos |

### Exemplo de Narração com Timing Ideal

```
"Esse é o método PERFEITO."          → 2s (introdução)
"Persona específica."                 → 1.5s (letra P)
"Estrutura clara."                    → 1.5s (letra E)
"Resultado esperado."                 → 1.5s (letra R)
"Formato definido."                   → 1.5s (letra F)
"Exemplos práticos."                  → 1.5s (letra E)
"Iteração contínua."                  → 1.5s (letra I)
"Tom adequado."                       → 1.5s (letra T)
"Otimização constante."               → 1.5s (letra O)
"Com esse método, seus prompts..."    → 3s (conclusão)
─────────────────────────────────────────────────
TOTAL                                 → ~18s
```

### Configuração de Duration nos MicroVisuals

O campo `duration` em cada microVisual define quanto tempo o efeito visual permanece ativo **após** ser disparado:

```json
{
  "id": "mv-p",
  "anchorText": "Persona",
  "type": "letter-reveal",
  "content": { "index": 0 },
  "duration": 2  // ← Letra fica destacada por 2 segundos
}
```

| Valor | Uso Recomendado |
|-------|-----------------|
| 1.5s | Acrônimos longos (10+ letras) |
| 2s | Padrão para maioria dos casos |
| 2.5s | Acrônimos curtos (4-5 letras) |
| 3s | Quando há pausa dramática |

### Ritmo da Animação Interna

O componente `V7PhasePERFEITOSynced` usa um intervalo interno de **700ms** para construção progressiva das letras. Isso é independente dos timestamps de narração e garante ritmo consistente mesmo com pequenas variações de áudio.

```typescript
// Lógica interna do componente
const LETTER_REVEAL_INTERVAL = 700; // ms entre cada letra
```

### Boas Práticas de Timing

1. **Mantenha significados curtos** (2-3 palavras): "Persona Específica" ✅, não "Persona Específica e Detalhada" ❌

2. **Pause após a última letra**: Adicione uma frase de conclusão antes do `pauseAt` para dar tempo de absorção

3. **Evite narrações muito rápidas**: Se o significado tem mais de 3 palavras, considere simplificar

4. **Teste o ritmo**: Use o Debug Panel para verificar se os triggers estão espaçados uniformemente

---

## 📖 Exemplos Completos

### Exemplo 1: Aula Completa com Acrônimo PERFEITO

```json
{
  "title": "Dominando Prompts com o Método PERFEITO",
  "subtitle": "Aprenda a criar prompts profissionais",
  "difficulty": "beginner",
  "category": "Fundamentos de IA",
  "tags": ["prompts", "método", "iniciante"],
  "learningObjectives": [
    "Entender os 8 elementos do método PERFEITO",
    "Aplicar cada elemento em prompts reais"
  ],
  "scenes": [
    {
      "id": "cena-1-intro",
      "title": "Introdução",
      "type": "dramatic",
      "narration": "Você sabia que 90% das pessoas usam a IA de forma errada? Hoje isso vai mudar.",
      "visual": {
        "type": "number-reveal",
        "content": {
          "hookQuestion": "Quantas pessoas usam IA errado?",
          "number": "90%",
          "subtitle": "das pessoas desperdiçam o potencial da IA",
          "mood": "danger",
          "countUp": true
        }
      }
    },
    {
      "id": "cena-2-problema",
      "title": "O Problema",
      "type": "comparison",
      "narration": "Veja a diferença entre um prompt amador e um profissional. O amador escreve qualquer coisa. O profissional segue um método.",
      "visual": {
        "type": "split-screen",
        "content": {
          "left": {
            "label": "Prompt Amador",
            "mood": "danger",
            "items": ["Vago", "Sem contexto", "Sem formato"],
            "emoji": "❌"
          },
          "right": {
            "label": "Prompt Profissional",
            "mood": "success",
            "items": ["Específico", "Contextualizado", "Formatado"],
            "emoji": "✅"
          }
        }
      }
    },
    {
      "id": "cena-3-transicao",
      "title": "Transição para o Método",
      "type": "narrative",
      "narration": "Agora vou te ensinar um método que vai transformar completamente seus prompts. Preste atenção.",
      "visual": {
        "type": "text-reveal",
        "content": {
          "title": "O Método Secreto",
          "mainText": "Uma técnica usada pelos melhores profissionais de IA"
        }
      }
    },
    {
      "id": "cena-4-perfeito",
      "title": "Revelação PERFEITO",
      "type": "revelation",
      "narration": "Esse é o método PERFEITO. Persona específica. Estrutura clara. Resultado esperado. Formato definido. Exemplos práticos. Iteração contínua. Tom adequado. Otimização constante. Com esse método, seus prompts serão absolutamente imbatíveis.",
      "anchorText": {
        "pauseAt": "imbatíveis"
      },
      "visual": {
        "type": "letter-reveal",
        "content": {
          "word": "PERFEITO",
          "finalStamp": "PERFEITO",
          "letters": [
            { "letter": "P", "meaning": "Persona Específica" },
            { "letter": "E", "meaning": "Estrutura Clara" },
            { "letter": "R", "meaning": "Resultado Esperado" },
            { "letter": "F", "meaning": "Formato Definido" },
            { "letter": "E", "meaning": "Exemplos Práticos" },
            { "letter": "I", "meaning": "Iteração Contínua" },
            { "letter": "T", "meaning": "Tom Adequado" },
            { "letter": "O", "meaning": "Otimização Constante" }
          ]
        },
        "microVisuals": [
          { "id": "mv-p", "anchorText": "Persona", "type": "letter-reveal", "content": { "index": 0 }, "duration": 2 },
          { "id": "mv-e1", "anchorText": "Estrutura", "type": "letter-reveal", "content": { "index": 1 }, "duration": 2 },
          { "id": "mv-r", "anchorText": "Resultado", "type": "letter-reveal", "content": { "index": 2 }, "duration": 2 },
          { "id": "mv-f", "anchorText": "Formato", "type": "letter-reveal", "content": { "index": 3 }, "duration": 2 },
          { "id": "mv-e2", "anchorText": "Exemplos", "type": "letter-reveal", "content": { "index": 4 }, "duration": 2 },
          { "id": "mv-i", "anchorText": "Iteração", "type": "letter-reveal", "content": { "index": 5 }, "duration": 2 },
          { "id": "mv-t", "anchorText": "Tom", "type": "letter-reveal", "content": { "index": 6 }, "duration": 2 },
          { "id": "mv-o", "anchorText": "Otimização", "type": "letter-reveal", "content": { "index": 7 }, "duration": 2 }
        ]
      }
    },
    {
      "id": "cena-5-quiz",
      "title": "Quiz de Fixação",
      "type": "interaction",
      "narration": "Agora me diga, qual é a primeira letra do método e o que ela representa?",
      "anchorText": {
        "pauseAt": "representa"
      },
      "visual": {
        "type": "quiz",
        "content": {
          "question": "O que significa o 'P' do método PERFEITO?",
          "mood": "neutral"
        }
      },
      "interaction": {
        "type": "quiz",
        "options": [
          {
            "id": "opt-a",
            "text": "Persona Específica",
            "category": "good",
            "feedback": {
              "title": "Excelente!",
              "subtitle": "Você prestou atenção!",
              "mood": "success",
              "narration": "Isso mesmo! A Persona é fundamental para direcionar a IA."
            }
          },
          {
            "id": "opt-b",
            "text": "Prompt Perfeito",
            "category": "bad",
            "feedback": {
              "title": "Quase!",
              "subtitle": "Revise o método",
              "mood": "warning",
              "narration": "Não é isso. O P significa Persona Específica."
            }
          }
        ]
      }
    },
    {
      "id": "cena-6-cta",
      "title": "Chamada para Ação",
      "type": "cta",
      "narration": "Parabéns! Você aprendeu o método PERFEITO. Continue praticando!",
      "anchorText": {
        "pauseAt": "praticando"
      },
      "visual": {
        "type": "result",
        "content": {
          "emoji": "🏆",
          "title": "Método Dominado!",
          "message": "Você agora conhece os 8 elementos do PERFEITO",
          "ctaText": "Próxima Aula"
        }
      },
      "interaction": {
        "type": "cta-button",
        "buttonText": "Continuar",
        "action": "next-phase"
      }
    }
  ]
}
```

### Exemplo 2: Acrônimo Curto (5 letras) - FOCO

```json
{
  "id": "cena-foco",
  "title": "Método FOCO",
  "type": "revelation",
  "narration": "Apresento o método FOCO. Frequência diária. Objetivos claros. Consistência sempre. Organização total. Com FOCO, você alcança resultados.",
  "anchorText": {
    "pauseAt": "resultados"
  },
  "visual": {
    "type": "letter-reveal",
    "content": {
      "word": "FOCO",
      "finalStamp": "FOCO",
      "letters": [
        { "letter": "F", "meaning": "Frequência Diária" },
        { "letter": "O", "meaning": "Objetivos Claros" },
        { "letter": "C", "meaning": "Consistência Sempre" },
        { "letter": "O", "meaning": "Organização Total" }
      ]
    },
    "microVisuals": [
      { "id": "mv-f", "anchorText": "Frequência", "type": "letter-reveal", "content": { "index": 0 }, "duration": 2 },
      { "id": "mv-o1", "anchorText": "Objetivos", "type": "letter-reveal", "content": { "index": 1 }, "duration": 2 },
      { "id": "mv-c", "anchorText": "Consistência", "type": "letter-reveal", "content": { "index": 2 }, "duration": 2 },
      { "id": "mv-o2", "anchorText": "Organização", "type": "letter-reveal", "content": { "index": 3 }, "duration": 2 }
    ]
  }
}
```

---

## 📚 Referência

Este template foi criado para garantir processamento automatizado e consistente de aulas V7 com animação de acrônimo (letter-reveal). Seguir esta estrutura garante que o Pipeline calcule timestamps corretos sem necessidade de busca global ou fallbacks.
