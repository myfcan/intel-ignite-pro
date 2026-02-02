# V7 JSON Template Definitivo

> **Versão**: 1.0.0  
> **Data**: 2026-02-02  
> **Status**: OFICIAL - Contrato de entrada para Pipeline V7-vv

---

## 📋 Sumário

1. [Visão Geral](#visão-geral)
2. [Estrutura Raiz](#estrutura-raiz)
3. [Tipos de Cena Suportados](#tipos-de-cena-suportados)
4. [Tipos de Visual Suportados](#tipos-de-visual-suportados)
5. [Tipos de MicroVisual Suportados](#tipos-de-microvisual-suportados)
6. [Regras Críticas](#regras-críticas)
7. [Template Completo](#template-completo)
8. [Exemplos por Tipo de Cena](#exemplos-por-tipo-de-cena)
9. [Erros Comuns e Como Evitar](#erros-comuns-e-como-evitar)
10. [Checklist de Validação](#checklist-de-validação)

---

## Visão Geral

O JSON de entrada para o Pipeline V7-vv deve seguir estritamente este contrato. O Pipeline:
1. **VALIDA** o JSON de entrada (rejeita se inválido)
2. **GERA** áudio principal via ElevenLabs
3. **GERA** áudios de feedback para quiz (automático)
4. **GERA** `pauseAt` automático para fases interativas (se não fornecido)
5. **CALCULA** timings baseados em word_timestamps
6. **PRODUZ** V7LessonData para o Player

---

## Estrutura Raiz

```typescript
interface V7ScriptInput {
  // ============= METADADOS (OBRIGATÓRIOS) =============
  title: string;                          // Título da aula
  subtitle?: string;                       // Subtítulo opcional
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;                        // Ex: "Prompt Engineering"
  tags: string[];                          // Tags para busca
  learningObjectives: string[];            // Objetivos de aprendizado

  // ============= CONFIGURAÇÃO DE ÁUDIO =============
  voice_id?: string;                       // Default: "Xb7hH8MSUJpSbSDYk0k2" (Alice Brasil)
  generate_audio?: boolean;                // Default: true
  fail_on_audio_error?: boolean;           // Default: true

  // ============= POSICIONAMENTO =============
  trail_id?: string;                       // ID da trilha (opcional)
  order_index?: number;                    // Ordem na trilha (default: 0)

  // ============= CENAS (OBRIGATÓRIO) =============
  scenes: V7SceneInput[];                  // Mínimo: 1 cena
}
```

---

## Tipos de Cena Suportados

| Tipo | Descrição | Interativo? | Requer `pauseAt`? |
|------|-----------|-------------|-------------------|
| `dramatic` | Número/estatística impactante | ❌ | ❌ |
| `narrative` | Texto narrativo com items | ❌ | ❌ |
| `comparison` | Split-screen lado a lado | ❌ | ❌ |
| `interaction` | Quiz de múltipla escolha | ✅ | ✅ (auto-gerado se ausente) |
| `playground` | Comparação prompt amador vs pro | ✅ | ✅ (auto-gerado se ausente) |
| `revelation` | Revelação letra por letra | ❌ | ❌ |
| `secret-reveal` | Revelação com áudio próprio | ✅ | ✅ (auto-gerado se ausente) |
| `cta` | Call-to-action com botão | ✅ | ✅ (auto-gerado se ausente) |
| `gamification` | Resultado final com métricas | ❌ | ❌ |

---

## Tipos de Visual Suportados

| Tipo | Uso | Content Esperado |
|------|-----|------------------|
| `number-reveal` | Números grandes animados | `{ number, subtitle?, mood?, countUp? }` |
| `text-reveal` | Texto progressivo | `{ title?, mainText?, items?, highlightWord? }` |
| `split-screen` | Lado a lado | `{ left: {...}, right: {...} }` |
| `letter-reveal` | Letra por letra (acrônimos) | `{ word, letters: [{letter, meaning}] }` |
| `cards-reveal` | Cards em sequência | `{ title, cards: [{id, text, icon?}] }` |
| `quiz` | Tela de quiz | `{ question, mood? }` |
| `quiz-feedback` | Feedback do quiz | `{ title, subtitle, mood }` |
| `playground` | Comparação de prompts | `{ title, subtitle?, instruction? }` |
| `result` | Resultado/gamificação | `{ emoji?, title, message?, metrics? }` |
| `cta` | Call-to-action | `{ title, buttonText, action }` |

---

## Tipos de MicroVisual Suportados

### ✅ TIPOS VÁLIDOS

| Tipo | Descrição | Exemplo de Content |
|------|-----------|-------------------|
| `icon` | Ícone animado | `{ icon: "🎯", color: "primary" }` |
| `text` | Texto popup | `{ value: "Importante!", color: "warning" }` |
| `number` | Número animado | `{ value: "98%", color: "danger" }` |
| `image` | Imagem estática | `{ src: "/image.png", alt: "desc" }` |
| `badge` | Badge/selo | `{ value: "PRO", color: "success" }` |
| `highlight` | Destaque de texto | `{ color: "accent", duration: 2 }` |
| `letter-reveal` | Revelação de letra | `{ letter: "P", meaning: "Persona" }` |

### ❌ TIPOS INVÁLIDOS (NÃO USAR)

| Tipo Inválido | Usar no lugar |
|---------------|---------------|
| `image-flash` | `image` |
| `text-pop` | `text` |
| `number-count` | `number` |
| `card-reveal` | Use `cards-reveal` como visual.type |
| `text-highlight` | `highlight` |

---

## Regras Críticas

### 1. Narração e MicroVisual na MESMA Cena

**REGRA DE OURO**: A narração que contém a palavra-chave (anchorText) de um microVisual DEVE estar na MESMA cena que define o microVisual.

```json
// ✅ CORRETO: Narração e microVisual na mesma cena
{
  "id": "cena-perfeito",
  "narration": "O método PERFEITO significa: Persona, Estrutura, Resultado...",
  "visual": {
    "type": "letter-reveal",
    "microVisuals": [
      { "id": "mv-p", "anchorText": "Persona", "type": "letter-reveal" },
      { "id": "mv-e", "anchorText": "Estrutura", "type": "letter-reveal" }
    ]
  }
}

// ❌ ERRADO: Narração em cena diferente dos microVisuals
// Cena 8: narration contém "Persona, Estrutura..."
// Cena 9: microVisuals com anchorText "Persona"
// → Pipeline NÃO encontra a keyword no range da cena 9!
```

### 2. IDs Únicos

- Cada `scene.id` deve ser único
- Cada `microVisual.id` deve ser único globalmente
- Cada `option.id` (quiz) deve ser único

### 3. Keywords Únicas

- Cada `anchorText` deve aparecer UMA única vez na narração
- Keywords duplicadas causam ambiguidade de timing

### 4. Fases Interativas

Para cenas do tipo `interaction`, `playground`, `secret-reveal`, `cta`:

- Se `anchorText.pauseAt` não for fornecido, o Pipeline gera automaticamente
- O Pipeline usa a última palavra da narração como pauseAt
- Duração mínima: 5 segundos (aplicado automaticamente)

### 5. Quiz com Feedback

Para quizzes com feedback narrado:

```json
{
  "interaction": {
    "type": "quiz",
    "options": [
      {
        "id": "opt-1",
        "text": "Opção A",
        "isCorrect": false,
        "feedback": {
          "title": "Quase!",
          "subtitle": "Tente novamente",
          "narration": "Essa não é a resposta correta...",  // ← Gera áudio automaticamente
          "mood": "warning"
        }
      }
    ]
  }
}
```

---

## Template Completo

```json
{
  "title": "Título da Aula V7",
  "subtitle": "Subtítulo opcional",
  "difficulty": "beginner",
  "category": "Prompt Engineering",
  "tags": ["IA", "ChatGPT", "Produtividade"],
  "learningObjectives": [
    "Entender o conceito X",
    "Aplicar a técnica Y"
  ],
  "voice_id": "Xb7hH8MSUJpSbSDYk0k2",
  "generate_audio": true,
  "fail_on_audio_error": true,
  "trail_id": "uuid-da-trilha",
  "order_index": 1,
  
  "scenes": [
    {
      "id": "cena-1-impacto",
      "title": "O Impacto",
      "type": "dramatic",
      "narration": "Noventa e oito por cento das pessoas usam a Inteligência Artificial como brinquedo.",
      "visual": {
        "type": "number-reveal",
        "content": {
          "hookQuestion": "Você sabia?",
          "number": "98%",
          "subtitle": "usam IA como brinquedo",
          "mood": "danger",
          "countUp": true
        },
        "effects": {
          "mood": "danger",
          "particles": "ember",
          "glow": true
        },
        "microVisuals": [
          {
            "id": "mv-98",
            "anchorText": "Noventa e oito",
            "type": "number",
            "content": {
              "value": "98%",
              "color": "danger",
              "animation": "pop"
            }
          }
        ]
      }
    },
    
    {
      "id": "cena-2-quiz",
      "title": "Teste seu Conhecimento",
      "type": "interaction",
      "narration": "Agora me responda com honestidade: como você usa a Inteligência Artificial hoje?",
      "anchorText": {
        "pauseAt": "hoje"
      },
      "visual": {
        "type": "quiz",
        "content": {
          "question": "Como você usa a IA hoje?",
          "mood": "neutral"
        }
      },
      "interaction": {
        "type": "quiz",
        "options": [
          {
            "id": "opt-basico",
            "text": "Para tarefas básicas",
            "isCorrect": false,
            "feedback": {
              "title": "Entendi!",
              "subtitle": "Você está no grupo dos 98%",
              "narration": "Você está usando a IA de forma básica. Vamos mudar isso!",
              "mood": "warning"
            }
          },
          {
            "id": "opt-avancado",
            "text": "De forma estratégica",
            "isCorrect": true,
            "feedback": {
              "title": "Excelente!",
              "subtitle": "Você já está no caminho certo",
              "narration": "Parabéns! Você já entende o poder da IA.",
              "mood": "success"
            }
          }
        ]
      }
    },
    
    {
      "id": "cena-3-perfeito",
      "title": "O Método PERFEITO",
      "type": "revelation",
      "narration": "O método PERFEITO significa: Persona, Estrutura, Resultado, Formato, Exemplos, Iteração, Tom e Otimização.",
      "visual": {
        "type": "letter-reveal",
        "content": {
          "word": "PERFEITO",
          "letters": [
            { "letter": "P", "meaning": "Persona" },
            { "letter": "E", "meaning": "Estrutura" },
            { "letter": "R", "meaning": "Resultado" },
            { "letter": "F", "meaning": "Formato" },
            { "letter": "E", "meaning": "Exemplos" },
            { "letter": "I", "meaning": "Iteração" },
            { "letter": "T", "meaning": "Tom" },
            { "letter": "O", "meaning": "Otimização" }
          ],
          "finalStamp": "🏆 MÉTODO COMPLETO"
        },
        "effects": {
          "mood": "success",
          "particles": "confetti",
          "glow": true
        },
        "microVisuals": [
          { "id": "mv-p", "anchorText": "Persona", "type": "letter-reveal", "content": { "letter": "P", "meaning": "Persona" } },
          { "id": "mv-e1", "anchorText": "Estrutura", "type": "letter-reveal", "content": { "letter": "E", "meaning": "Estrutura" } },
          { "id": "mv-r", "anchorText": "Resultado", "type": "letter-reveal", "content": { "letter": "R", "meaning": "Resultado" } },
          { "id": "mv-f", "anchorText": "Formato", "type": "letter-reveal", "content": { "letter": "F", "meaning": "Formato" } },
          { "id": "mv-e2", "anchorText": "Exemplos", "type": "letter-reveal", "content": { "letter": "E", "meaning": "Exemplos" } },
          { "id": "mv-i", "anchorText": "Iteração", "type": "letter-reveal", "content": { "letter": "I", "meaning": "Iteração" } },
          { "id": "mv-t", "anchorText": "Tom", "type": "letter-reveal", "content": { "letter": "T", "meaning": "Tom" } },
          { "id": "mv-o", "anchorText": "Otimização", "type": "letter-reveal", "content": { "letter": "O", "meaning": "Otimização" } }
        ]
      }
    },
    
    {
      "id": "cena-4-playground",
      "title": "Playground de Prática",
      "type": "playground",
      "narration": "Agora é sua vez! Veja a diferença entre um prompt amador e um prompt profissional. Analise o resultado.",
      "anchorText": {
        "pauseAt": "resultado"
      },
      "visual": {
        "type": "playground",
        "content": {
          "title": "Compare os Prompts",
          "instruction": "Observe a diferença de qualidade"
        }
      },
      "interaction": {
        "type": "playground",
        "amateurPrompt": "Me dá dicas de produtividade",
        "professionalPrompt": "Atue como um coach de produtividade especializado em executivos. Liste 5 técnicas específicas de gestão de tempo, com exemplos práticos de implementação e métricas de sucesso esperadas.",
        "amateurScore": 15,
        "professionalScore": 95,
        "amateurResult": {
          "title": "Resultado Amador",
          "content": "1. Faça listas\n2. Durma bem\n3. Organize-se",
          "score": 15,
          "verdict": "Genérico e sem direcionamento"
        },
        "professionalResult": {
          "title": "Resultado Profissional",
          "content": "1. Técnica Pomodoro (25min foco + 5min pausa)\n2. Matriz de Eisenhower para priorização\n3. Time blocking com calendário\n4. Regra dos 2 minutos\n5. Revisão semanal (30min sexta)",
          "score": 95,
          "verdict": "Específico, actionável, com métodos reais"
        }
      }
    },
    
    {
      "id": "cena-5-gamification",
      "title": "Resultado Final",
      "type": "gamification",
      "narration": "Parabéns! Você completou a aula e agora faz parte dos dois por cento que realmente entendem como usar a Inteligência Artificial.",
      "visual": {
        "type": "result",
        "content": {
          "emoji": "🏆",
          "title": "Você é dos 2%!",
          "message": "Agora você sabe o segredo",
          "metrics": [
            { "label": "XP Ganho", "value": "+150", "isHighlight": true },
            { "label": "Moedas", "value": "+50" }
          ],
          "ctaText": "Continuar Jornada"
        },
        "effects": {
          "mood": "success",
          "particles": "confetti"
        }
      }
    }
  ]
}
```

---

## Exemplos por Tipo de Cena

### Cena Dramática (dramatic)

```json
{
  "id": "cena-impacto",
  "title": "O Problema",
  "type": "dramatic",
  "narration": "Apenas dois por cento das pessoas usam a IA de forma estratégica.",
  "visual": {
    "type": "number-reveal",
    "content": {
      "number": "2%",
      "subtitle": "usam IA estrategicamente",
      "mood": "success",
      "countUp": true
    },
    "effects": {
      "mood": "success",
      "particles": "sparks"
    }
  }
}
```

### Cena Narrativa (narrative)

```json
{
  "id": "cena-explicacao",
  "title": "Entendendo o Conceito",
  "type": "narrative",
  "narration": "A Inteligência Artificial é uma ferramenta poderosa. Ela pode automatizar tarefas, criar conteúdo e resolver problemas complexos.",
  "visual": {
    "type": "text-reveal",
    "content": {
      "title": "O Poder da IA",
      "items": [
        { "icon": "⚡", "text": "Automatizar tarefas" },
        { "icon": "✍️", "text": "Criar conteúdo" },
        { "icon": "🧠", "text": "Resolver problemas" }
      ]
    }
  }
}
```

### Cena de Comparação (comparison)

```json
{
  "id": "cena-comparacao",
  "title": "Antes vs Depois",
  "type": "comparison",
  "narration": "Veja a diferença entre quem usa IA como brinquedo e quem usa como ferramenta de transformação.",
  "visual": {
    "type": "split-screen",
    "content": {
      "left": {
        "label": "Amador",
        "mood": "danger",
        "items": ["Prompts vagos", "Resultados genéricos", "Frustração"],
        "emoji": "😕"
      },
      "right": {
        "label": "Profissional",
        "mood": "success",
        "items": ["Prompts estruturados", "Resultados precisos", "Produtividade"],
        "emoji": "🚀"
      }
    }
  }
}
```

---

## Erros Comuns e Como Evitar

### ❌ Erro 1: MicroVisual com tipo inválido

```json
// ERRADO
{ "type": "image-flash" }
{ "type": "text-pop" }
{ "type": "number-count" }

// CORRETO
{ "type": "image" }
{ "type": "text" }
{ "type": "number" }
```

### ❌ Erro 2: Narração em cena diferente do microVisual

```json
// ERRADO: Cena 8 narra "Persona", Cena 9 tem microVisual "Persona"

// CORRETO: Mesma cena
{
  "id": "cena-perfeito",
  "narration": "...Persona, Estrutura...",
  "visual": {
    "microVisuals": [
      { "anchorText": "Persona" }
    ]
  }
}
```

### ❌ Erro 3: IDs duplicados

```json
// ERRADO
{ "id": "mv-destaque" }  // em cena 1
{ "id": "mv-destaque" }  // em cena 2 (DUPLICADO!)

// CORRETO
{ "id": "mv-destaque-1" }
{ "id": "mv-destaque-2" }
```

### ❌ Erro 4: Fase interativa sem pauseAt (antes era erro, agora é auto-gerado)

```json
// ANTES: Causava erro
// AGORA: Pipeline gera automaticamente
{
  "type": "interaction",
  "narration": "Como você usa a IA?"
  // pauseAt será gerado automaticamente como "IA"
}
```

---

## Checklist de Validação

Antes de enviar o JSON para o Pipeline, verifique:

### Estrutura

- [ ] `title` está definido
- [ ] `difficulty` é um de: `beginner`, `intermediate`, `advanced`
- [ ] `scenes` tem pelo menos 1 cena
- [ ] Cada cena tem `id`, `title`, `type`, `narration`, `visual`

### MicroVisuals

- [ ] Todos os tipos são válidos: `icon`, `text`, `number`, `image`, `badge`, `highlight`, `letter-reveal`
- [ ] Cada microVisual está na MESMA cena que sua narração
- [ ] Todos os IDs são únicos

### Quiz/Interação

- [ ] Cada opção tem `id`, `text`, `feedback`
- [ ] Pelo menos uma opção tem `isCorrect: true`
- [ ] Se feedback tem `narration`, será gerado áudio automaticamente

### Playground

- [ ] Tem `amateurPrompt` e `professionalPrompt`
- [ ] Tem `amateurResult` e `professionalResult` com `score` e `verdict`

### Keywords/Anchors

- [ ] Cada `anchorText` existe exatamente na `narration` da cena
- [ ] Keywords não estão duplicadas em cenas diferentes

---

## Changelog

| Versão | Data | Mudanças |
|--------|------|----------|
| 1.0.0 | 2026-02-02 | Versão inicial - Template definitivo oficial |

---

> **⚠️ IMPORTANTE**: Este documento é a especificação oficial. Qualquer JSON que não siga estas regras será rejeitado pelo Pipeline V7-vv.
