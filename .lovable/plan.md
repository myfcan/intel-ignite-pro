

# Auditoria Forense do Plano — Com Dados Reais do Código

---

## 1. CONFIRMADO: A raiz do problema está no template e no refine

**Evidência real — `.lovable/v8-raw-content-model.md` linhas 76-82:**
```markdown
### Seção 3 (índice 2) — Ponte para primeiro exercício
**Objetivo:** Frase curta de transição para o primeiro exercício.

```markdown
Qual tipo de resposta tem mais chance de aparecer quando você pergunta "Onde pedir uma pizza?"
```
```

E o exercício associado (linha 89):
```json
"title": "Teste rápido: respostas genéricas",
```

Toda aula que usa esse template herda literalmente "Teste rápido" + a mesma ponte de 1 linha.

**Evidência real — `v8-refine-content/index.ts` linhas 40-44:**
```
11. **Transições explícitas**: Cada seção deve começar com uma frase que conecte ao que veio antes ("Agora que você entendeu X, vamos ver Y...").

13. **Detecção de texto pré-quiz/playground**: Se a seção termina com uma frase que é literalmente a pergunta do quiz seguinte (...), REMOVA essa frase redundante da seção, pois o quiz já vai narrá-la.
```

A Regra 11 **incentiva** transições genéricas. A Regra 13 pede remoção mas **não proíbe criação** de novas. Não existe Regra 16 ou 17 anti-pergunta. CONFIRMADO: gap real.

---

## 2. CONFIRMADO: Não existe validação pós-refine contra perguntas

**Evidência real — `AdminV8Create.tsx` linhas 608-634:**
```typescript
if (refineResponse.ok) {
  const refineResult = await refineResponse.json();
  if (refineResult.sections && Array.isArray(refineResult.sections)) {
    // Replace section content with refined versions — protect Section 0 (Abertura)
    for (let i = startIdx; i < parsed.sections.length && (i - offset) < refineResult.sections.length; i++) {
      parsed.sections[i].content = refineResult.sections[refIdx].content;
    }
  }
}
```

O merge aceita **qualquer conteúdo** do refine sem nenhuma verificação de trailing questions. CONFIRMADO.

---

## 3. CONFIRMADO: `contractPattern` não é salvo no JSON

**Evidência real — `AdminV8Create.tsx` linhas 791-809:**
```typescript
const finalData: V8LessonData = {
  contentVersion: "v8",
  title: parsed.title,
  // ...
};
```

O tipo `V8LessonData` (em `v8Lesson.ts` linha 136) tem campo `contractPattern?: 'V8-C01' | 'V8-C02' | 'V8-C03'` mas o `finalData` em AdminV8Create **nunca o popula**. O `selectedPattern` (linha 654) é logado mas não salvo. CONFIRMADO: gap real.

---

## 4. CONFIRMADO: `v8-generate-raw-content` não existe

```
code--search_files: No matches found for pattern 'v8-generate-raw-content'
```

A função precisa ser criada do zero. Precisa de entry no `supabase/config.toml`.

---

## 5. CONFIRMADO: Seções-ponte de 1 linha existem no template

**Evidência — `.lovable/v8-raw-content-model.md` linha 81:**
```markdown
Qual tipo de resposta tem mais chance de aparecer quando você pergunta "Onde pedir uma pizza?"
```

Essa é a seção INTEIRA. Uma linha. O áudio gerado para isso tem ~5 segundos (confirmado pelos logs: `section 2: only 0 speakable chars` — a seção 2 nem gerou áudio).

---

## 6. GAPS NO PLANO PROPOSTO

### Gap A: O plano NÃO endereça o `contractPattern` não salvo
O `V8LessonData` já tem o campo mas o pipeline nunca o popula. Sem isso, é impossível auditar depois qual combinação (narrativa + ângulo) foi usada.

**Correção necessária:** Adicionar `contractPattern: selectedPattern` na construção do `finalData` (linha 791 de AdminV8Create).

### Gap B: O plano NÃO menciona salvar `narrativeVariation` no JSON
Se criarmos 3 variações narrativas, precisamos de um campo novo em `V8LessonData` para registrar qual foi usada. Sem isso, o admin não sabe qual variação gerou qual aula.

**Correção necessária:** Adicionar `narrativeVariation?: 'everyday' | 'professional' | 'curiosity'` ao tipo `V8LessonData` e populá-lo no `finalData`.

### Gap C: Parser compatibility com output da IA
O `v8ContentParser.ts` (linha 41) espera `^#\s+(.+)$` para título e `^##\s` para seções. Se a IA gerar `### Subseção` ou `## 1. Título`, o parser cria menos de 9 seções e o Hard Gate (linha 782-784) aborta o pipeline.

**Mitigação necessária:** A nova function deve usar tool calling com schema `sections[]` (como já feito no `v8-refine-content`), retornando um array estruturado que o frontend converte para markdown antes de popular o textarea. Isso elimina o risco de formato incompatível.

### Gap D: O plano propõe "Preview Texto" mas não especifica como converter tool-call output → markdown
A function retornaria `{ sections: [{title, content}] }`. Mas o textarea espera markdown com `# Título\n\n## Seção 1 — X\ncontent...`. Precisa de uma função de conversão `sectionsToMarkdown()`.

---

## 7. PLANO REVISADO FINAL

### Arquivos a criar/modificar

| Arquivo | Ação | O que muda |
|---------|------|------------|
| `supabase/functions/v8-generate-raw-content/index.ts` | **NOVO** | Edge function de geração de conteúdo bruto |
| `supabase/config.toml` | **EDITAR** | Adicionar entry `[functions.v8-generate-raw-content]` |
| `supabase/functions/v8-refine-content/index.ts` | **EDITAR** | Adicionar Regras 16-17 ao prompt (linhas 44-67) |
| `src/pages/AdminV8Create.tsx` | **EDITAR** | Bloco UI de geração IA + salvar `contractPattern` + `narrativeVariation` no finalData |
| `src/types/v8Lesson.ts` | **EDITAR** | Adicionar `narrativeVariation` ao tipo `V8LessonData` |

### Detalhes por arquivo

**1. `v8-generate-raw-content/index.ts` (NOVO)**
- Input: `{ title, objectives: string[], variationStyle: 'everyday' | 'professional' | 'curiosity' }`
- System prompt com 3 sub-prompts por variação (arcos narrativos, exemplos de abertura, transições proibidas)
- Regra hard: mínimo 100 palavras por seção, proibido seções que são apenas 1 pergunta
- Regra hard: marcadores `[EXERCISE:tipo]` e `[PLAYGROUND]` nas posições corretas
- Tool calling retornando `{ title, description, sections: [{title, content}] }` — o frontend monta o markdown
- Modelo: `google/gemini-2.5-flash`

**2. `v8-refine-content/index.ts` (EDITAR linhas 44-67)**
- Adicionar após Regra 13:
  - Regra 16: "NUNCA termine uma seção com uma pergunta interrogativa."
  - Regra 17: "PROIBIDO criar frases que funcionem como enunciado de exercício (ex: 'Teste rápido:', 'Vamos testar:', 'Qual dos seguintes...')."

**3. `AdminV8Create.tsx` (EDITAR)**
- Novo state: `generationTitle`, `generationObjectives`, `generationVariation`
- Bloco UI acima do textarea no modo `content`: 3 inputs + botão "Gerar com IA"
- Função `sectionsToMarkdown()` para converter output da function em markdown
- Linha 791: adicionar `contractPattern: selectedPattern` e `narrativeVariation` ao `finalData`

**4. `v8Lesson.ts` (EDITAR linha ~136)**
- Adicionar: `narrativeVariation?: 'everyday' | 'professional' | 'curiosity';`

### Riscos residuais

| Risco | Severidade | Mitigação |
|-------|-----------|-----------|
| IA gera <9 seções | Médio | Validação na function + Hard Gate existente |
| Timeout (>60s) | Baixo | Gemini 2.5 Flash com tool calling é rápido (~10-20s) |
| IA ignora regras de variação | Médio | Sub-prompts com exemplos literais + few-shot |

