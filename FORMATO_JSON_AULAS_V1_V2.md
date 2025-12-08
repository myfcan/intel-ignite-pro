# 📚 Formato JSON Correto para Aulas V1 e V2

> **Documentação oficial** baseada no código do Pipeline e banco de dados
> **Data**: 2025-11-24
> **Localização**: `/src/lib/lessonPipeline/`

---

## 🎯 Diferenças entre V1 e V2

| Característica | V1 | V2 |
|---|---|---|
| **Áudio** | 1 áudio único com word timestamps | Múltiplos áudios (1 por seção) |
| **Playgrounds** | ✅ Suporta mid-lesson (automático na seção 4) | ❌ Não suporta playgrounds |
| **Uso** | Aulas interativas com prática | Consumo linear de conteúdo |
| **Timestamps** | Sincronização palavra-por-palavra | Timestamps por seção |

---

## 📋 Estrutura Base (Comum para V1 e V2)

```json
{
  "model": "v1",  // ou "v2"
  "title": "Título da Lição",
  "trackId": "efa0c22c-26fb-44d2-b1dc-721724ca5c5b",
  "trackName": "Fundamentos de IA",
  "orderIndex": 2,
  "estimatedTimeMinutes": 15,

  "sections": [
    // Array de seções (detalhes abaixo)
  ],

  "exercises": [
    // Array de exercícios (detalhes abaixo)
  ]
}
```

---

## 📝 Formato das Seções

### Estrutura Básica de uma Seção

```json
{
  "id": "section-1",  // ID único, use pattern "section-N"
  "index": 1,         // Número da seção (começa em 1)
  "markdown": "## 🎯 Título da Seção\n\nConteúdo em **Markdown**...",
  "speechBubble": "Texto que a MAIA vai falar"
}
```

### ⚠️ IMPORTANTE: Campos Alternativos

O Pipeline aceita **dois formatos** para os campos:

**Formato 1** (usado no exemplo `fundamentos-02-pipeline.json`):
- `markdown` → conteúdo visual
- `speechBubble` → texto do áudio

**Formato 2** (usado no Admin UI):
- `visualContent` → conteúdo visual
- `speechBubbleText` → texto do áudio

**✅ Ambos funcionam!** O Pipeline normaliza automaticamente.

---

## 🎮 Playgrounds (V1 e V5)

### Playground Automático (Recomendado)

Se você **não especificar** playground na seção 4, o Pipeline adiciona automaticamente:

```json
{
  "id": "section-4",
  "index": 4,
  "markdown": "## Conteúdo...",
  "speechBubble": "Texto..."
  // Playground será adicionado automaticamente pelo Step 5.5
}
```

### Playground Customizado com PlaygroundBridgeV2 (V5)

Para usar o novo fluxo interativo com flip cards:

```json
{
  "id": "section-4",
  "index": 4,
  "markdown": "## Hora da Prática...",
  "speechBubble": "Vamos praticar!",
  "showPlaygroundCall": true,
  "playgroundConfig": {
    "type": "real-playground",
    "instruction": "Vamos criar um post!",
    "playgroundExampleV2": {
      "title": "Post simples para Instagram",
      "context": "João tem uma padaria de bairro e quer divulgar um novo pão.",
      "requirements": [
        "Produto: [pão de fermentação natural]",
        "Público: [clientes da padaria do bairro]",
        "Objetivo: [convidar para experimentar o pão]",
        "Tom: [simples, próximo, nada técnico]"
      ],
      "examplePrompt": "Crie um post curto para Instagram sobre [produto principal], falando com [público] em tom [tom de voz]. Objetivo: [objetivo do post]."
    },
    "realConfig": {
      "title": "Hora da Prática! 🚀",
      "maiaMessage": "Agora é sua vez!",
      "scenario": {
        "title": "Desafio Prático",
        "description": "Use o que aprendeu..."
      },
      "prefilledText": "",
      "userPlaceholder": "Cole ou digite seu prompt... 💭",
      "validation": {
        "minLength": 20,
        "requiredKeywords": [],
        "feedback": {
          "tooShort": "⚠️ Seu prompt precisa ter pelo menos 20 caracteres.",
          "good": "✅ Bom trabalho!",
          "excellent": "🎉 Excelente!"
        }
      }
    }
  }
}
```

### 🎯 Estrutura do playgroundExampleV2

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `title` | string | Título curto do modal (ex: "Post para Instagram") |
| `context` | string | Situação do caso em 1-2 frases |
| `requirements` | string[] | **4 itens** com formato `"Label: [valor exemplo]"` |
| `examplePrompt` | string | Template do prompt com `[placeholders]` |

**Ordem fixa dos requirements:**
1. Produto
2. Público
3. Objetivo
4. Tom

### Tipos de Playground

1. **real-playground**: Integração com IA real (Lovable AI Gateway)
2. **interactive-simulation**: Simulação interativa (exemplo: Netflix)

---

## 📝 Exercícios

### Formato Simplificado (Recomendado)

O Pipeline agora suporta **descrição em texto livre**. A IA processará e criará o exercício automaticamente:

```json
{
  "type": "prompt",
  "prompt": "Crie um exercício de múltipla escolha sobre IA.\n\nPergunta: Qual o principal benefício da IA?\nOpções:\n- Redução de custos\n- Automação (CORRETO)\n- Substituir humanos\n- Burocracia",
  "question": "Crie um exercício de múltipla escolha sobre IA."  // Compatibilidade
}
```

### Tipos de Exercícios Suportados

1. **multiple-choice** - Múltipla escolha
2. **true-false** - Verdadeiro ou Falso
3. **fill-blanks** - Preencher lacunas
4. **complete-sentence** - Completar frases
5. **drag-drop** - Arrastar e soltar
6. **scenario-selection** - Escolher cenário
7. **platform-match** - Combinar plataformas
8. **data-collection** - Categorizar dados

### Formato Estruturado (Opcional)

Se preferir especificar a estrutura completa:

```json
{
  "index": 1,
  "type": "multiple-choice",
  "question": "Por que o Netflix sugere filmes que você vai gostar?",
  "options": [
    "Programação manual",
    "IA aprendeu seus padrões",
    "Todos veem o mesmo",
    "Adivinhação aleatória"
  ],
  "correctOptionIndex": 1,
  "feedback": "Correto! A IA aprende com SEUS dados."
}
```

---

## 📚 Exemplo Completo V1

```json
{
  "model": "v1",
  "title": "Como a IA Aprende com Você",
  "trackId": "efa0c22c-26fb-44d2-b1dc-721724ca5c5b",
  "trackName": "Fundamentos de IA",
  "orderIndex": 2,
  "estimatedTimeMinutes": 15,

  "sections": [
    {
      "id": "section-1",
      "index": 1,
      "markdown": "## 🎯 O segredo das sugestões perfeitas\n\nVocê já parou pra pensar como o **Netflix** sempre sabe o que você quer assistir?\n\nO segredo está em como a IA **aprende** com você! 💡",
      "speechBubble": "Já reparou como o Netflix sempre sabe o que você quer ver?"
    },
    {
      "id": "section-2",
      "index": 2,
      "markdown": "## 🎬 Netflix - A escola da IA\n\nToda vez que você assiste algo, a IA registra:\n- 📊 Qual gênero\n- 👥 Quais atores\n- ⏱️ Quanto tempo assistiu",
      "speechBubble": "A IA registra cada detalhe do que você assiste"
    },
    {
      "id": "section-3",
      "index": 3,
      "markdown": "## 🎵 Spotify e a mágica da música\n\nO Spotify vai além - ele aprende seus **humores** e **rotinas**! ✨",
      "speechBubble": "O Spotify conhece seus humores melhor que ninguém"
    },
    {
      "id": "section-4",
      "index": 4,
      "markdown": "## 🎮 Hora de praticar\n\nVamos fazer um teste prático! 🚀",
      "speechBubble": "Vamos ver a IA aprendendo em tempo real!"
      // Playground será adicionado automaticamente aqui (V1)
    }
  ],

  "exercises": [
    {
      "type": "prompt",
      "prompt": "Crie um exercício de múltipla escolha:\n\nPergunta: Por que o Netflix sugere filmes que você vai gostar?\nOpções:\n- Programação manual\n- IA aprendeu seus padrões (CORRETO)\n- Todos veem o mesmo\n- Adivinhação aleatória\n\nFeedback: A IA aprende com SEUS dados!",
      "question": "Pergunta sobre Netflix e IA"
    },
    {
      "type": "prompt",
      "prompt": "Verdadeiro ou Falso: A IA precisa que você ensine manualmente o que gosta.\n\nResposta: FALSO - A IA aprende sozinha observando!",
      "question": "V/F sobre aprendizado de IA"
    }
  ]
}
```

---

## 📚 Exemplo Completo V2

```json
{
  "model": "v2",
  "title": "IA no Dia a Dia",
  "trackId": "efa0c22c-26fb-44d2-b1dc-721724ca5c5b",
  "trackName": "Fundamentos de IA",
  "orderIndex": 3,
  "estimatedTimeMinutes": 12,

  "sections": [
    {
      "id": "section-1",
      "index": 1,
      "markdown": "## 🏠 IA em Casa\n\nA IA está mais presente na sua casa do que você imagina!",
      "speechBubble": "Vamos descobrir onde a IA está na sua rotina"
    },
    {
      "id": "section-2",
      "index": 2,
      "markdown": "## 📱 Assistentes Virtuais\n\nSiri, Alexa, Google Assistant - todos usam IA!",
      "speechBubble": "Esses assistentes entendem linguagem natural"
    },
    {
      "id": "section-3",
      "index": 3,
      "markdown": "## 🚗 Carros Inteligentes\n\nTestla e outros carros usam IA para direção autônoma.",
      "speechBubble": "A IA está revolucionando o transporte"
    }
  ],

  "exercises": [
    {
      "type": "prompt",
      "prompt": "Crie exercício sobre assistentes virtuais com 4 opções",
      "question": "Sobre assistentes de voz"
    },
    {
      "type": "prompt",
      "prompt": "Verdadeiro ou Falso sobre carros autônomos",
      "question": "V/F sobre direção autônoma"
    }
  ]
}
```

---

## ✅ Checklist de Validação

Antes de enviar para o Pipeline, verifique:

- [ ] `model` é "v1" ou "v2"
- [ ] `title` está preenchido
- [ ] `trackId` é um UUID válido
- [ ] `orderIndex` é um número >= 0
- [ ] `sections` tem pelo menos 1 item
- [ ] Cada seção tem `id`, `markdown`/`visualContent`, `speechBubble`/`speechBubbleText`
- [ ] `exercises` tem pelo menos 1 item
- [ ] Cada exercício tem `type` e `prompt` ou estrutura completa

---

## 🔍 Validações do Pipeline

### Step 1: Intake

```typescript
// V1 e V2 validam:
- Modelo válido: 'v1' ou 'v2'
- Título não vazio
- Pelo menos 1 seção
- Cada seção tem id + visualContent
- Pelo menos 1 exercício
- trackId é UUID válido
- orderIndex >= 0
```

### Step 3: Geração de Áudio

**V1**: Gera 1 áudio único com word timestamps
**V2**: Gera N áudios (1 por seção) com durações

### Step 5.5: Processamento de Playground

**V1 apenas**: Adiciona playground automático na seção 4 se não existir

### Step 6: Validação Completa

```typescript
// V1 valida:
- audioUrl presente
- wordTimestamps presente
- structuredContent com timestamps

// V2 valida:
- audioUrls array presente
- durations array presente
- structuredContent com timestamps
```

---

## 🚀 Como Usar no Admin

### Via Interface (AdminPipelineCreateSingle)

1. Acesse `/admin/pipeline/create-single`
2. Selecione modelo: V1 ou V2
3. Preencha título e seções
4. Adicione exercícios em texto livre
5. (Opcional V1) Configure playground customizado
6. Clique em "Criar e Executar Pipeline"

### Via JSON Direto (AdminPipelineCreateBatch)

1. Acesse `/admin/pipeline/create-batch`
2. Cole JSON no formato acima
3. Clique em "Validar JSON"
4. Se válido, clique em "Criar Lotes"

---

## 📞 Suporte

**Arquivos de Referência**:
- Types: `/src/lib/lessonPipeline/types.ts`
- Validação: `/src/lib/lessonPipeline/step1-intake.ts`
- Áudio: `/src/lib/lessonPipeline/step3-generate-audio.ts`
- Playground: `/src/lib/lessonPipeline/step5-5-process-playground.ts`
- Admin UI: `/src/pages/AdminPipelineCreateSingle.tsx`

**Exemplo Real**: `/fundamentos-02-pipeline.json`

---

## 🎓 Boas Práticas

1. **Use markdown rico**: Emojis, listas, negrito
2. **Speech bubbles curtos**: 1-2 frases (naturalidade)
3. **Seções de 3-6**: Ideal para V1 e V2
4. **Exercícios variados**: Mix de tipos
5. **Playgrounds V1**: Deixe automático ou customize com cuidado
6. **Tempo estimado**: 2-3 min por seção + 1 min por exercício

---

**✅ Documento validado contra código do Pipeline (2025-11-24)**
