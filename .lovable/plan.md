
# Plano: Atualizar Exemplos JSON no Pipeline V7-vv

## Resumo Executivo

Inserir o novo formato JSON do contrato C01-C08 nos botões **"Carregar Aula 1 Completa"** e **"Exemplo Simples"** da página `AdminV7vv.tsx`, garantindo que os exemplos sigam o contrato validado e evitem bugs de sincronização.

---

## Diagnóstico Atual

| Item | Status | Problema |
|------|--------|----------|
| `EXAMPLE_SCRIPT` (Exemplo Simples) | ⚠️ Básico | Funcional, mas não demonstra todas as features C07/C08 |
| `v7-aula1-input-modelo.json` | ⚠️ Drift | Narração "PERFEITO" dividida entre cenas 8 e 9 |
| Contrato C01-C08 | ✅ Documentado | Em `docs/V7-VV-JSON-CONTRACT-C01-C08.md` |

---

## Ações Planejadas

### 1. Criar Arquivo de Dados Novo: `v7-aula-teste-c08.json`

Novo arquivo seguindo 100% o contrato C01-C08, com a **narração do PERFEITO na mesma cena** (correção do drift):

**Localização:** `src/data/v7-aula-teste-c08.json`

**Conteúdo:** Modelo completo com 4 cenas que demonstram:
- `dramatic` com `number-reveal` e `microVisuals`
- `comparison` com `split-screen`
- `revelation` com `letter-reveal` (PERFEITO - **narração e visual na mesma cena**)
- `interaction` com `quiz` e `anchorText.pauseAt`

### 2. Atualizar `AdminV7vv.tsx`

#### 2.1 Adicionar Novo Botão: "Carregar JSON Novo Aula Teste"

```tsx
// Linha ~40: Novo import
import V7AulaTesteC08 from '@/data/v7-aula-teste-c08.json';

// Linha ~233: Nova função
const loadNewTestModel = () => {
  setScriptJson(JSON.stringify(V7AulaTesteC08, null, 2));
  setJsonError(null);
  setDryRunResult(null);
  toast.success('JSON modelo C08 carregado! (Contrato C01-C08)');
};

// Linha ~395: Novo botão (cor diferenciada - cyan)
<Button
  variant="default"
  onClick={loadNewTestModel}
  className="min-w-[140px] bg-cyan-600 hover:bg-cyan-700"
>
  <FileJson className="w-4 h-4 mr-2" />
  Carregar JSON Novo Aula Teste
</Button>
```

#### 2.2 Atualizar `EXAMPLE_SCRIPT` (Exemplo Simples)

Atualizar o `EXAMPLE_SCRIPT` (linhas 43-90) para incluir exemplos do contrato C01-C08:

```tsx
const EXAMPLE_SCRIPT = `{
  "title": "Exemplo Simples V7-vv (C08)",
  "subtitle": "Demonstração do contrato C01-C08",
  "difficulty": "beginner",
  "category": "Fundamentos de IA",
  "tags": ["exemplo", "teste"],
  "learningObjectives": ["Testar o pipeline V7-vv"],
  "generate_audio": true,
  "scenes": [
    {
      "id": "cena-1-intro",
      "title": "Introdução",
      "type": "dramatic",
      "narration": "Bem-vindo à demonstração do Pipeline V7-vv com contrato C08.",
      "visual": {
        "type": "number-reveal",
        "content": {
          "hookQuestion": "VOCÊ ESTÁ PRONTO?",
          "number": "100%",
          "subtitle": "funcional com C08",
          "mood": "success"
        }
      }
    },
    {
      "id": "cena-2-quiz",
      "title": "Quiz",
      "type": "interaction",
      "narration": "Você entendeu como funciona? Escolha sua resposta.",
      "anchorText": {
        "pauseAt": "resposta"
      },
      "visual": {
        "type": "quiz",
        "content": {
          "question": "O pipeline V7-vv funciona?"
        }
      },
      "interaction": {
        "type": "quiz",
        "options": [
          { "id": "a", "text": "Sim, funciona perfeitamente", "isCorrect": true },
          { "id": "b", "text": "Ainda tenho dúvidas", "isCorrect": true }
        ]
      }
    }
  ]
}`;
```

### 3. Corrigir `v7-aula1-input-modelo.json` (Drift Fix)

Mover a narração do acrônimo PERFEITO para a **mesma cena** (`cena-9-perfeito`), seguindo a regra documentada em `V7-JSON-TEMPLATE-LETTER-REVEAL.md`:

**Antes (ERRADO - Drift):**
- `cena-8-transicao`: narration = "O método que eles usam se chama PERFEITO."
- `cena-9-perfeito`: narration = "Persona específica. Estrutura clara..."

**Depois (CORRETO):**
- `cena-8-transicao`: narration = "O método que eles usam tem um nome."
- `cena-9-perfeito`: narration = "Esse é o método PERFEITO. Persona específica. Estrutura clara. Resultado esperado. Formato definido. Exemplos práticos. Iteração contínua. Tom adequado. Otimização constante. Com esse método, seus prompts serão absolutamente imbatíveis."
- `cena-9-perfeito`: anchorText.pauseAt = "imbatíveis"

---

## Arquivos a Serem Modificados

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `src/data/v7-aula-teste-c08.json` | **CRIAR** | Novo modelo seguindo contrato C01-C08 |
| `src/pages/AdminV7vv.tsx` | **EDITAR** | Adicionar botão + atualizar EXAMPLE_SCRIPT |
| `src/data/v7-aula1-input-modelo.json` | **EDITAR** | Corrigir drift do PERFEITO |

---

## Estrutura do Novo JSON Modelo (C08)

```text
v7-aula-teste-c08.json
├── title: "Dominando Prompts com PERFEITO"
├── subtitle: "O método dos 8 pilares"
├── difficulty: "beginner"
├── scenes: [
│   ├── cena-1-intro (dramatic)
│   │   ├── visual.type: "number-reveal"
│   │   └── visual.content: { number: "90%", hookQuestion: "VOCÊ SABIA?" }
│   │
│   ├── cena-2-comparacao (comparison)
│   │   ├── visual.type: "split-screen"
│   │   └── visual.content: { left: {...}, right: {...} }
│   │
│   ├── cena-3-perfeito (revelation) ← NARRAÇÃO COMPLETA AQUI
│   │   ├── narration: "Esse é o método PERFEITO. Persona específica..."
│   │   ├── anchorText.pauseAt: "imbatíveis"
│   │   ├── visual.type: "letter-reveal"
│   │   └── visual.microVisuals: [8 letter-reveal triggers]
│   │
│   └── cena-4-quiz (interaction)
│       ├── anchorText.pauseAt: "representa"
│       ├── visual.type: "quiz"
│       └── interaction.options: [...]
│
└── generate_audio: true
```

---

## Checklist de Validação

| Regra | Verificação |
|-------|-------------|
| ✅ Narração PERFEITO na mesma cena | microVisuals e narração em `cena-3-perfeito` |
| ✅ anchorText.pauseAt para interações | Quiz tem `pauseAt: "representa"` |
| ✅ visual.type válido | Todos os tipos estão em `VALID_VISUAL_TYPES` |
| ✅ microVisuals com anchorText | Cada letra tem `anchorText` correspondente na narração |
| ✅ scene.type não é "cta" | CTA usa `scene.type: "interaction"` + `visual.type: "cta"` |

---

## Resultado Esperado

Após implementação:

1. **Botão "Exemplo Simples"** → Carrega JSON minimalista válido (2 cenas)
2. **Botão "Carregar Aula 1 Completa"** → Carrega modelo corrigido (10 cenas)
3. **Botão "Carregar JSON Novo Aula Teste"** → Carrega modelo C08 demonstrativo (4 cenas)

Todos os exemplos seguirão o contrato C01-C08 documentado em `docs/V7-VV-JSON-CONTRACT-C01-C08.md`.
