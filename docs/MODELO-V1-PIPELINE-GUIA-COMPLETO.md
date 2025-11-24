# 📘 Guia Completo: Modelo V1 Pipeline

## 🎯 O que é o Modelo V1?

O Modelo V1 é o formato de entrada JSON para criar lições no pipeline de processamento. Este formato é usado ANTES do processamento - depois o sistema converte para o formato final do banco de dados.

---

## ⚠️ ERROS COMUNS QUE VOCÊ DEVE EVITAR

### ❌ ERRO 1: Duplicate "sections"
**NUNCA faça isso:**
```json
{
  "sections": [...],
  "playgroundMidLesson": {...},
  "sections": [...]  // ❌ ERRO! Chave duplicada!
}
```

**✅ Correto:**
```json
{
  "sections": [...],
  "playgroundMidLesson": {...},
  "exercises": [...]  // ✅ Use "exercises" aqui!
}
```

### ❌ ERRO 2: Exercícios sem campo "data"
**NUNCA faça isso:**
```json
{
  "index": 1,
  "type": "true-false",
  "statements": [...],  // ❌ ERRO! Direto no root
  "feedback": {...}
}
```

**✅ Correto:**
```json
{
  "index": 1,
  "type": "true-false",
  "data": {              // ✅ TUDO dentro de "data"!
    "statement": "...",
    "answer": true,
    "feedback": "..."
  }
}
```

### ❌ ERRO 3: True-false com "statements" (plural)
**NUNCA faça isso:**
```json
{
  "type": "true-false",
  "data": {
    "statements": [...]  // ❌ ERRO! Plural não funciona no V1 simples
  }
}
```

**✅ Correto (opção 1 - V1 simples):**
```json
{
  "type": "true-false",
  "data": {
    "statement": "Afirmação aqui",  // ✅ Singular
    "answer": true,
    "feedback": "Explicação"
  }
}
```

**✅ Correto (opção 2 - V1 com statements múltiplos - REQUER validação especial):**
```json
{
  "type": "true-false",
  "data": {
    "statements": [
      {
        "text": "Afirmação 1",
        "correct": true,  // ✅ Use "correct", não "answer"!
        "explanation": "Explicação"
      }
    ],
    "feedback": {...}
  }
}
```

---

## 📋 Estrutura Completa do Modelo V1

```json
[
  {
    "model": "v1",
    "title": "Título da Aula",
    "trackId": "UUID-da-trilha",
    "trackName": "Nome da Trilha",
    "orderIndex": 1,
    "estimatedTimeMinutes": 10,

    "sections": [
      {
        "index": 1,
        "markdown": "## Título\n\nConteúdo...",
        "speechBubble": "Frase curta"
      }
    ],

    "playgroundMidLesson": {
      "instruction": "Instrução para o playground"
    },

    "exercises": [...]
  }
]
```

### Campos Obrigatórios

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `model` | string | **SEMPRE** "v1" (minúsculo) |
| `title` | string | Título da aula |
| `trackId` | string | UUID da trilha |
| `trackName` | string | Nome da trilha |
| `orderIndex` | number | Ordem na trilha (começa em 1) |
| `estimatedTimeMinutes` | number | Duração estimada |
| `sections` | array | Array de seções |
| `exercises` | array | Array de exercícios |

### Campos Opcionais

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `playgroundMidLesson` | object | Playground no meio da aula |

---

## 📝 Estrutura das Seções

```json
{
  "index": 1,
  "markdown": "## Título da Seção\n\nConteúdo em markdown aqui...",
  "speechBubble": "Frase curta de até 60 caracteres"
}
```

### Regras para Seções:

✅ Use `index` sequencial (1, 2, 3, ...)
✅ Use markdown para formatar o texto
✅ `speechBubble` deve ser curto (máx 60 chars)
✅ Títulos com `##` serão removidos do áudio automaticamente

---

## 🎮 Estrutura do Playground (Opcional)

```json
"playgroundMidLesson": {
  "instruction": "Teste agora! Peça à IA para criar um e-mail profissional."
}
```

Ou versão mais complexa:

```json
"playgroundMidLesson": {
  "type": "interactive-simulation",
  "title": "Título do Playground",
  "intro": {
    "icon": "🎯",
    "title": "Título",
    "description": "Descrição",
    "visual": "Linha do tempo..."
  },
  "scenario": {
    "icon": "🎬",
    "text": "Descrição do cenário"
  },
  "steps": [...]
}
```

---

## 🎯 Tipos de Exercícios

### 1. Multiple Choice (Múltipla Escolha)

```json
{
  "index": 1,
  "type": "multiple-choice",
  "question": "Qual é a pergunta?",
  "data": {
    "question": "Repita a pergunta",
    "options": [
      "Opção A",
      "Opção B",
      "Opção C"
    ],
    "correctOptionIndex": 1,
    "feedback": "Explicação da resposta correta"
  }
}
```

**Campos obrigatórios em data:**
- `question` (string)
- `options` (array de strings)
- `correctOptionIndex` (number, zero-based)
- `feedback` (string)

---

### 2. True/False (Verdadeiro ou Falso) - Versão Simples

```json
{
  "index": 2,
  "type": "true-false",
  "question": "Afirmação aqui",
  "data": {
    "statement": "A mesma afirmação",
    "answer": true,
    "feedback": "✅ VERDADEIRO! Explicação..."
  }
}
```

**Campos obrigatórios em data:**
- `statement` (string)
- `answer` (boolean)
- `feedback` (string)

---

### 3. True/False - Versão com Múltiplas Afirmações

**⚠️ ATENÇÃO:** Use `correct` (não `answer`) para cada statement!

```json
{
  "index": 2,
  "type": "true-false",
  "question": "Marque V ou F:",
  "data": {
    "statements": [
      {
        "id": "tf-1",
        "text": "Afirmação 1",
        "correct": true,
        "explanation": "✅ VERDADEIRO! ..."
      },
      {
        "id": "tf-2",
        "text": "Afirmação 2",
        "correct": false,
        "explanation": "❌ FALSO! ..."
      }
    ],
    "feedback": {
      "allCorrect": "🎯 Perfeito!",
      "someCorrect": "👍 Muito bem!",
      "needsReview": "💡 Quase lá!"
    }
  }
}
```

**Campos obrigatórios em cada statement:**
- `text` (string)
- `correct` (boolean) ← **NÃO use "answer"!**
- `explanation` (string)

**Campos obrigatórios em data:**
- `statements` (array)
- `feedback` (object com allCorrect, someCorrect, needsReview)

---

### 4. Complete Sentence (Completar Frases)

**⚠️ FORMATO ATUALIZADO (2025-11-24):**

```json
{
  "index": 3,
  "type": "complete-sentence",
  "question": "Complete as frases:",
  "data": {
    "sentences": [
      {
        "id": "sentence-1",
        "text": "A IA aprende com _______.",
        "correctAnswers": ["exemplos", "dados"]
      },
      {
        "id": "sentence-2",
        "text": "Quanto _______ dados, melhor.",
        "correctAnswers": ["mais", "maiores"]
      },
      {
        "id": "sentence-3",
        "text": "A IA é _______ inteligente.",
        "correctAnswers": ["muito", "super"]
      }
    ]
  }
}
```

**Campos obrigatórios em cada sentence:**
- `id` (string) - Identificador único da sentença
- `text` (string) - Texto com `_______` (7 underscores) para preencher
  - ✅ PADRÃO: 7 underscores `_______`
  - ⚠️ Retrocompatível: 11 underscores `___________` também funciona
- `correctAnswers` (array de strings) - Múltiplas respostas aceitas

**Campos opcionais em cada sentence:**
- `options` (array de strings) - Se presente, exibe como múltipla escolha (RadioGroup)
- `hints` (array de strings) - Dicas exibidas antes do input

**📝 Nota:** O formato antigo (sentences como array de strings + correctAnswers separado) NÃO É MAIS SUPORTADO.

---

### 5. Data Collection (Coleta de Dados)

```json
{
  "index": 4,
  "type": "data-collection",
  "question": "Identifique os dados coletados:",
  "data": {
    "scenario": {
      "id": "scenario-1",
      "emoji": "🎬",
      "platform": "Netflix",
      "situation": "Você assistiu 3 episódios...",
      "dataPoints": [
        {
          "id": "dp-1",
          "text": "Gênero preferido",
          "isCorrect": true,
          "explanation": "Correto! A IA registra o gênero."
        },
        {
          "id": "dp-2",
          "text": "Sua senha",
          "isCorrect": false,
          "explanation": "Incorreto! Senhas não são coletadas."
        }
      ]
    }
  }
}
```

**Campos obrigatórios em scenario:**
- `id` (string)
- `platform` (string)
- `situation` (string)
- `dataPoints` (array)

**Campos obrigatórios em cada dataPoint:**
- `id` (string)
- `text` (string)
- `isCorrect` (boolean)
- `explanation` (string)

**Campos opcionais:**
- `emoji` (string)

---

## ✅ Checklist de Validação

Antes de enviar seu JSON, verifique:

### Estrutura Geral
- [ ] JSON é um array `[...]`
- [ ] Cada lição é um objeto dentro do array
- [ ] Campo `model` = "v1" (minúsculo)
- [ ] Todos os campos obrigatórios presentes
- [ ] **NÃO há chaves duplicadas** (ex: duas "sections")

### Seções
- [ ] Cada seção tem `index`, `markdown`, `speechBubble`
- [ ] Índices são sequenciais (1, 2, 3...)
- [ ] Markdown está formatado corretamente
- [ ] SpeechBubble é curto (< 60 chars)

### Exercícios
- [ ] Cada exercício tem `index`, `type`, `question`, `data`
- [ ] **TODOS os campos específicos estão dentro de `data`**
- [ ] True-false simples usa `statement` + `answer`
- [ ] True-false múltiplo usa `statements` + `correct` (não `answer`)
- [ ] Multiple choice tem `correctOptionIndex` (zero-based)
- [ ] Complete sentence tem arrays dentro de `correctAnswers`
- [ ] Data collection tem `scenario` completo

### Playground
- [ ] Se presente, tem `instruction` OU estrutura completa
- [ ] Instrução é clara e acionável

---

## 🔧 Testando seu JSON

### Método 1: Validador Online
Use https://jsonlint.com/ para validar sintaxe JSON

### Método 2: No Pipeline
Envie para: `/admin/pipeline/test`

### Método 3: Comando Node
```bash
node -e "console.log(JSON.parse(require('fs').readFileSync('seu-arquivo.json')))"
```

---

## 📚 Exemplos Completos

### Exemplo Mínimo (Funcional)
Veja: `TEMPLATE-V1-PIPELINE.json`

### Exemplo Completo (Com todos os tipos)
Veja: `fundamentos-02-pipeline.json`

### Exemplo da Aula dos 7 Prompts (Corrigido)
Veja: `EXEMPLO-V1-7-PROMPTS-CORRIGIDO.json`

---

## 🐛 Troubleshooting

### Erro: "Falha na validação do exercício X: Statement Y precisa ter 'correct' (boolean)"

**Causa:** No exercício true-false com múltiplas statements, você usou `answer` ao invés de `correct`.

**Solução:**
```json
// ❌ ERRADO
{"text": "...", "answer": true}

// ✅ CORRETO
{"text": "...", "correct": true}
```

---

### Erro: "Campo 'data' é obrigatório"

**Causa:** Você colocou os campos diretamente no exercício, sem envolver em `data`.

**Solução:**
```json
// ❌ ERRADO
{
  "type": "multiple-choice",
  "options": [...]
}

// ✅ CORRETO
{
  "type": "multiple-choice",
  "data": {
    "options": [...]
  }
}
```

---

### Erro: "JSON inválido" ou "Unexpected token"

**Causa:** Sintaxe JSON incorreta (chave duplicada, vírgula extra, etc.)

**Solução:**
1. Valide em https://jsonlint.com/
2. Procure por chaves duplicadas
3. Verifique vírgulas no final de arrays/objetos
4. Certifique-se que strings usam aspas duplas `"`

---

### Erro: "Sentença X precisa ter correctAnswers" ou "sentences deve ser array"

**Causa:** Você está usando o formato antigo do `complete-sentence` que não é mais suportado.

**Solução - Migre para o novo formato:**
```json
// ❌ FORMATO ANTIGO (NÃO FUNCIONA MAIS)
{
  "type": "complete-sentence",
  "data": {
    "sentences": ["Frase com _______"],
    "correctAnswers": [["resposta1"]],
    "feedback": "..."
  }
}

// ✅ FORMATO NOVO (CORRETO)
{
  "type": "complete-sentence",
  "data": {
    "sentences": [
      {
        "id": "sentence-1",
        "text": "Frase com _______",
        "correctAnswers": ["resposta1"]
      }
    ]
  }
}
```

---

## 💡 Dicas Finais

1. **Sempre use um editor JSON** (VSCode, Sublime) para ter syntax highlighting
2. **Valide antes de enviar** com JSONLint ou similar
3. **Use o template** como base - não comece do zero
4. **Teste um exercício por vez** para identificar problemas mais rápido
5. **Copie estruturas dos exemplos** que já funcionam
6. **Leia os logs de erro** - eles dizem exatamente o que está errado
7. **⚠️ IMPORTANTE:** O formato `complete-sentence` foi atualizado em Nov/2024 - use o novo formato!

---

## 📞 Suporte

Se encontrar erros não documentados aqui, verifique:
1. `/src/lib/exerciseValidator.ts` - Validador de exercícios
2. `/src/lib/lessonPipeline/step5-generate-exercises.ts` - Processamento
3. `/src/lib/lessonPipeline/step6-validate.ts` - Validação final

---

**Última atualização:** 2025-11-24
**Versão:** 1.0
