# 🎯 FORMATO JSON 100% VALIDADO - AUDITORIA COMPLETA

> **Status**: ✅ Validado contra código real (componentes React + validadores)
> **Data**: 2025-11-24
> **Fonte**: Auditoria completa de componentes, validadores e exemplos funcionais

---

## 📊 TIPOS DE EXERCÍCIO VÁLIDOS

Baseado em `/src/lib/exerciseValidator.ts` (linhas 48-75):

1. ✅ `multiple-choice`
2. ✅ `true-false`
3. ✅ `fill-in-blanks` (COM hífens!)
4. ✅ `scenario-selection`
5. ✅ `data-collection`
6. ✅ `complete-sentence`
7. ✅ `drag-drop`
8. ✅ `platform-match`

---

## 🔥 EXERCÍCIO 1: MULTIPLE-CHOICE

### ✅ Componente: `/src/components/lesson/MultipleChoiceExercise.tsx`

**Props esperadas (linhas 8-14):**
```typescript
{
  question: string;
  options: string[];
  correctAnswer: string;  // Texto completo da opção
  explanation: string;
  onComplete: (isCorrect: boolean) => void;
}
```

### ✅ Validador: `/src/lib/exerciseValidator.ts` (linhas 240-265)

**Regras:**
- `question` é string obrigatória
- `options` é array com mínimo 2 itens
- `correctAnswer` DEVE estar em `options`

### ✅ JSON VALIDADO:

```json
{
  "id": "ex-1",
  "type": "multiple-choice",
  "title": "Múltipla Escolha",
  "instruction": "Escolha a resposta correta:",
  "data": {
    "question": "O que é Inteligência Artificial?",
    "options": [
      "Um robô físico",
      "Um sistema que aprende com exemplos",
      "Um programa que só executa comandos",
      "Uma pessoa muito inteligente"
    ],
    "correctAnswer": "Um sistema que aprende com exemplos",
    "explanation": "✅ Correto! IA aprende observando padrões em dados."
  }
}
```

---

## 🔥 EXERCÍCIO 2: TRUE-FALSE

### ✅ Componente: `/src/components/lessons/TrueFalseExercise.tsx`

**Props esperadas (linhas 8-25):**
```typescript
interface Statement {
  id: string;
  text: string;
  correct: boolean;
  explanation: string;
}

{
  title: string;
  instruction: string;
  statements: Statement[];
  feedback: {
    perfect: string;
    good: string;
    needsReview: string;
  };
}
```

### ✅ Validador: `/src/lib/exerciseValidator.ts` (linhas 130-149)

**Regras CRÍTICAS:**
- ❌ **NÃO aceita** `question` como string
- ❌ **NÃO aceita** `correctAnswer` (true/false) direto
- ✅ **EXIGE** `statements` array
- ✅ Cada statement tem `correct` (boolean)

### ✅ JSON VALIDADO:

```json
{
  "id": "ex-2",
  "type": "true-false",
  "title": "Verdadeiro ou Falso",
  "instruction": "Marque V ou F para cada afirmação:",
  "data": {
    "statements": [
      {
        "id": "stmt-1",
        "text": "A IA aprende observando padrões",
        "correct": true,
        "explanation": "✅ VERDADEIRO! IA aprende com exemplos e identifica padrões."
      },
      {
        "id": "stmt-2",
        "text": "Você precisa saber programar para usar IA",
        "correct": false,
        "explanation": "❌ FALSO! Você só precisa saber usar as ferramentas."
      },
      {
        "id": "stmt-3",
        "text": "IA é apenas um robô físico",
        "correct": false,
        "explanation": "❌ FALSO! IA é software que pode ou não estar em um robô."
      }
    ],
    "feedback": {
      "perfect": "🎯 Perfeito! Você acertou todas!",
      "good": "👍 Muito bem! Continue assim!",
      "needsReview": "💡 Revise o conteúdo e tente novamente!"
    }
  }
}
```

---

## 🔥 EXERCÍCIO 3: FILL-IN-BLANKS

### ✅ Componente: `/src/components/lessons/FillInBlanksExercise.tsx`

**Props esperadas (linhas 10-30):**
```typescript
interface Sentence {
  id: string;
  text: string;  // DEVE conter "_______"
  correctAnswers: string[];
  hints?: string[];  // Array (padrão)
  hint?: string;     // String (fallback)
  explanation?: string;
  options?: string[];  // Se presente, vira múltipla escolha
}

{
  title: string;
  instruction: string;
  sentences: Sentence[];
  feedback: {
    allCorrect: string;
    someCorrect: string;
    needsReview: string;
  };
}
```

### ✅ Validador: `/src/lib/exerciseValidator.ts` (linhas 98-120)

**Regras:**
- `text` DEVE ter "_______"
- `correctAnswers` é array não-vazio
- Se `options` existe, `correctAnswers` devem estar em `options`

### ✅ JSON VALIDADO:

```json
{
  "id": "ex-3",
  "type": "fill-in-blanks",
  "title": "Preencher Lacunas",
  "instruction": "Complete as frases com as palavras corretas:",
  "data": {
    "sentences": [
      {
        "id": "sent-1",
        "text": "O _______ usa IA para recomendar filmes.",
        "correctAnswers": ["Netflix"],
        "options": ["Netflix", "YouTube", "Disney+"],
        "hints": ["Pense no serviço de streaming vermelho!"],
        "explanation": "Netflix usa IA para entender seu gosto e sugerir conteúdo."
      },
      {
        "id": "sent-2",
        "text": "A IA aprende observando _______.",
        "correctAnswers": ["padrões", "exemplos", "dados"],
        "hints": ["O que a IA identifica em grandes volumes de dados?"],
        "explanation": "IA identifica padrões em milhões de exemplos."
      }
    ],
    "feedback": {
      "allCorrect": "🎯 Perfeito! Você acertou todas!",
      "someCorrect": "👍 Muito bem! Você acertou {count}!",
      "needsReview": "💡 Continue praticando!"
    }
  }
}
```

---

## 🔥 EXERCÍCIO 4: SCENARIO-SELECTION

### ✅ Componente: `/src/components/lessons/ScenarioSelectionExercise.tsx`

**Aceita DOIS formatos (linhas 10-29):**

**Formato 1: Multi-option**
```typescript
{
  id: string;
  situation: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}
```

**Formato 2: Simple-choice**
```typescript
{
  id: string;
  title: string;
  description: string;
  emoji: string;
  isCorrect: boolean;
  feedback: string;
}
```

### ✅ JSON VALIDADO (Formato 1 - Multi-option):

```json
{
  "id": "ex-4a",
  "type": "scenario-selection",
  "title": "Escolha o Melhor Prompt",
  "instruction": "Qual prompt é mais eficaz?",
  "data": {
    "scenarios": [
      {
        "id": "sc-1",
        "situation": "Você precisa escrever um e-mail profissional. Qual prompt é melhor?",
        "options": [
          "Escreva um e-mail",
          "Escreva um e-mail profissional de 3 parágrafos convidando clientes para um evento, com tom formal e objetivo",
          "Escreva algo legal",
          "Faça um texto"
        ],
        "correctAnswer": "Escreva um e-mail profissional de 3 parágrafos convidando clientes para um evento, com tom formal e objetivo",
        "explanation": "✅ Um bom prompt tem CONTEXTO, OBJETIVO, FORMATO e TOM!"
      }
    ]
  }
}
```

### ✅ JSON VALIDADO (Formato 2 - Simple-choice):

```json
{
  "id": "ex-4b",
  "type": "scenario-selection",
  "title": "Antes vs Depois",
  "instruction": "Escolha o prompt mais eficaz:",
  "data": {
    "scenarios": [
      {
        "id": "before",
        "title": "❌ Antes",
        "description": "Escreva algo legal.",
        "emoji": "❌",
        "isCorrect": false,
        "feedback": "Este prompt é vago demais! A IA não sabe o que fazer."
      },
      {
        "id": "after",
        "title": "✅ Depois",
        "description": "Crie um e-mail de 3 parágrafos convidando meus clientes para um novo produto, com tom entusiasmado e linguagem simples.",
        "emoji": "✅",
        "isCorrect": true,
        "feedback": "Perfeito! Tem contexto, objetivo, formato e tom!"
      }
    ],
    "correctExplanation": "Um bom prompt tem CONTEXTO e OBJETIVO claro!"
  }
}
```

---

## 🔥 EXERCÍCIO 5: DATA-COLLECTION

### ✅ Componente: `/src/components/lessons/DataCollectionExercise.tsx`

**Props esperadas (linhas 8-29):**
```typescript
interface DataPoint {
  id: string;
  label: string;
  isCorrect: boolean;
  explanation?: string;
}

interface Scenario {
  id: string;
  emoji: string;
  platform: string;
  situation: string;
  dataPoints: DataPoint[];
  context: string;
}

{
  title: string;
  instruction: string;
  scenario: Scenario;  // SINGULAR!
}
```

### ✅ Validador: `/src/lib/exerciseValidator.ts` (linhas 164-188)

**CRÍTICO:**
```typescript
if (!data.scenario) {  // SINGULAR
  result.errors.push('❌ CRÍTICO: data-collection PRECISA de "scenario" (objeto)');
}
```

**Regras:**
- ❌ Não aceita `scenarios` (plural)
- ✅ EXIGE `scenario` (SINGULAR)
- ✅ `scenario` tem `id`, `emoji`, `platform`, `situation`, `dataPoints`

### ✅ JSON VALIDADO:

```json
{
  "id": "ex-5",
  "type": "data-collection",
  "title": "O que a IA está Coletando?",
  "instruction": "Selecione TODOS os dados que a IA coleta nessa situação:",
  "data": {
    "scenario": {
      "id": "netflix-scenario",
      "emoji": "🎬",
      "platform": "Netflix",
      "situation": "Você está assistindo séries no Netflix. O que a IA está aprendendo sobre você?",
      "context": "Streaming de vídeo",
      "dataPoints": [
        {
          "id": "dp-1",
          "label": "Gêneros que você mais assiste",
          "isCorrect": true,
          "explanation": "✅ Sim! A IA registra seus gêneros favoritos."
        },
        {
          "id": "dp-2",
          "label": "Horário em que você assiste",
          "isCorrect": true,
          "explanation": "✅ Sim! A IA identifica seus padrões de horário."
        },
        {
          "id": "dp-3",
          "label": "Quanto tempo você assiste cada episódio",
          "isCorrect": true,
          "explanation": "✅ Sim! A IA sabe se você pulou, pausou ou assistiu até o fim."
        },
        {
          "id": "dp-4",
          "label": "Seus pensamentos sobre o filme",
          "isCorrect": false,
          "explanation": "❌ Não! A IA não lê pensamentos, só comportamentos."
        },
        {
          "id": "dp-5",
          "label": "Seu nome completo e CPF",
          "isCorrect": false,
          "explanation": "❌ Não! Esses dados não são usados pela IA de recomendação."
        }
      ]
    }
  }
}
```

---

## 🔥 EXERCÍCIO 6: COMPLETE-SENTENCE

### ✅ Componente: Usa o mesmo de `fill-in-blanks`

**Regra (linhas 169-184 de `/src/types/exerciseSchemas.ts`):**
- Se `options` existe → Múltipla escolha (RadioGroup)
- Se `options` NÃO existe → Texto livre (Input)

### ✅ JSON VALIDADO:

```json
{
  "id": "ex-6",
  "type": "complete-sentence",
  "title": "Completar Sentenças",
  "instruction": "Complete as frases corretamente:",
  "data": {
    "sentences": [
      {
        "id": "cs-1",
        "text": "A IA aprende observando _______.",
        "correctAnswers": ["padrões"],
        "options": ["padrões", "pessoas", "robôs"],
        "hints": ["O que a IA identifica nos dados?"]
      },
      {
        "id": "cs-2",
        "text": "Você _______ precisa saber programar para usar IA.",
        "correctAnswers": ["não", "nao"],
        "options": ["não", "sempre", "obrigatoriamente"]
      }
    ]
  }
}
```

---

## 📋 ESTRUTURA BASE MODELO V1

```json
{
  "model": "v1",
  "title": "Nome da Aula",
  "trackId": "efa0c22c-26fb-44d2-b1dc-721724ca5c5b",
  "trackName": "Fundamentos de IA",
  "orderIndex": 1,
  "estimatedTimeMinutes": 15,

  "sections": [
    {
      "id": "section-1",
      "index": 1,
      "markdown": "## 🎯 Título\n\nConteúdo em Markdown...",
      "speechBubble": "Texto que a MAIA fala"
    }
  ],

  "exercises": [
    {
      "type": "multiple-choice",
      "data": { /* estrutura acima */ }
    },
    {
      "type": "true-false",
      "data": { /* estrutura acima */ }
    },
    {
      "type": "fill-in-blanks",
      "data": { /* estrutura acima */ }
    },
    {
      "type": "scenario-selection",
      "data": { /* estrutura acima */ }
    },
    {
      "type": "data-collection",
      "data": { /* estrutura acima */ }
    }
  ]
}
```

---

## 📋 ESTRUTURA BASE MODELO V2

```json
{
  "model": "v2",
  "title": "Nome da Aula",
  "trackId": "efa0c22c-26fb-44d2-b1dc-721724ca5c5b",
  "trackName": "Fundamentos de IA",
  "orderIndex": 2,
  "estimatedTimeMinutes": 12,

  "sections": [
    {
      "id": "section-1",
      "index": 1,
      "markdown": "## Título\n\nConteúdo...",
      "speechBubble": "Texto falado"
    },
    {
      "id": "section-2",
      "index": 2,
      "markdown": "## Título 2\n\nConteúdo...",
      "speechBubble": "Texto falado 2"
    }
  ],

  "exercises": [
    /* Mesmos tipos de V1 */
  ]
}
```

---

## ❌ ERROS COMUNS

### 1. True-False com estrutura errada
```json
// ❌ ERRADO
{
  "type": "true-false",
  "data": {
    "question": "A IA aprende com exemplos?",
    "correctAnswer": true
  }
}

// ✅ CORRETO
{
  "type": "true-false",
  "data": {
    "statements": [
      {
        "id": "stmt-1",
        "text": "A IA aprende com exemplos",
        "correct": true,
        "explanation": "✅ VERDADEIRO!"
      }
    ],
    "feedback": { ... }
  }
}
```

### 2. Fill-blanks vs Fill-in-blanks
```json
// ❌ ERRADO
{ "type": "fill-blanks" }

// ✅ CORRETO
{ "type": "fill-in-blanks" }
```

### 3. Data-collection com scenarios (plural)
```json
// ❌ ERRADO
{
  "type": "data-collection",
  "data": {
    "scenarios": [ ... ]  // ❌ Plural
  }
}

// ✅ CORRETO
{
  "type": "data-collection",
  "data": {
    "scenario": { ... }  // ✅ Singular
  }
}
```

### 4. Multiple-choice com correctAnswer fora de options
```json
// ❌ ERRADO
{
  "type": "multiple-choice",
  "data": {
    "question": "...",
    "options": ["A", "B", "C"],
    "correctAnswer": "D"  // ❌ Não está em options
  }
}

// ✅ CORRETO
{
  "type": "multiple-choice",
  "data": {
    "question": "...",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": "D"  // ✅ Está em options
  }
}
```

---

## ✅ CHECKLIST FINAL

Antes de enviar JSON para o Pipeline:

- [ ] `model` é "v1" ou "v2"
- [ ] `type` de exercício está na lista de 8 tipos válidos
- [ ] `fill-in-blanks` tem hífens (não `fill-blanks`)
- [ ] `true-false` usa `statements` (não `question` + `correctAnswer`)
- [ ] `data-collection` usa `scenario` singular (não `scenarios`)
- [ ] `multiple-choice` tem `correctAnswer` dentro de `options`
- [ ] Todos os exercícios têm `id`, `type`, `title`, `instruction`, `data`
- [ ] Seções têm `id`, `index`, `markdown`, `speechBubble`

---

## 📚 ARQUIVOS AUDITADOS

### Componentes React:
- `/src/components/lesson/MultipleChoiceExercise.tsx`
- `/src/components/lessons/TrueFalseExercise.tsx`
- `/src/components/lessons/FillInBlanksExercise.tsx`
- `/src/components/lessons/ScenarioSelectionExercise.tsx`
- `/src/components/lessons/DataCollectionExercise.tsx`
- `/src/components/lessons/CompleteSentenceExercise.tsx`

### Validadores:
- `/src/lib/exerciseValidator.ts`
- `/src/types/exerciseSchemas.ts`

### Exemplos Reais:
- `/src/data/lessons/fundamentos-01.ts` (V2 funcionando)
- `/exemplo-aula-v1.json`
- `/exemplo-aula-v2.json`

---

**✅ DOCUMENTO VALIDADO CONTRA CÓDIGO REAL**
**Data**: 2025-11-24
**Status**: AUDITORIA COMPLETA SEM ACHISMOS
