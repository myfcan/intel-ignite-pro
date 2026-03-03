## Revisão do Plano — Gaps Identificados

O plano proposto anteriormente está **90% correto**, mas tem **2 gaps reais** que causariam falha silenciosa se implementados como descrito:  
  
Atue como um engenheiro sênior responsável pelo runtime de todo o sistema e banco de dados, atue com obrigação de precisão técnica absoluta.

&nbsp;

REGRA DESTE PROMPT:  
  
Execute todo o plano, mas caso não execute por alguma razão, você é obrigado é dizer:  
Não implementei todo o plano ou não executei todas asa correções. 

&nbsp;

Você NÃO pode mentir.

Você NÃO pode supor.

Você NÃO pode responder com explicações genéricas.

Você NÃO pode omitir dados.

Você deve executar tudo com DADOS REAIS do código atual.

Você deve copiar e colar trechos REAIS do código.

Você deve usar logs reais e timestamps reais.

Se não souber algo, diga explicitamente: “NÃO LOCALIZADO NO CÓDIGO”.  
  
TUDO ISSO É MANDATÓRIO

&nbsp;

---

### Gap 1: Linha 91 — `!q.question` invalida `true-false` e `fill-blank`

**Código atual (linha 91):**

```typescript
if (!q.question) result.errors.push(`Quiz ${i}: falta question`);
```

**Problema:** Quizzes `true-false` usam `q.statement` como campo principal, não `q.question`. Quizzes `fill-blank` usam `q.sentenceWithBlank`. Se o plano só corrige linhas 92-96 mas mantém linha 91, quizzes válidos de `true-false` e `fill-blank` ainda disparariam erro `"falta question"`.

**Correção necessária:** A validação de `question` também precisa ser condicional por tipo.

---

### Gap 2: Convenção "first option = correct" no parser vs admin

O parser (`v8ContentParser.ts`) agora aceita opções plain-text e assume que a **primeira opção é correta**. Mas a tela admin não exibe essa convenção em nenhum lugar — se alguém editar manualmente um quiz na admin, não saberá que a ordem importa. Isso não é um bug de código, mas é um gap de UX que pode gerar dados corrompidos. Não bloqueia a implementação atual, mas merece um `warning` na validação.

---

### Plano Corrigido (versão final)

**Arquivo:** `src/pages/AdminV8Create.tsx`, linhas 90-100

Substituir por:

```typescript
(data.inlineQuizzes as V8InlineQuiz[]).forEach((q, i) => {
  const qType = q.quizType || 'multiple-choice';

  // Validação por tipo
  if (qType === 'multiple-choice') {
    if (!q.question) result.errors.push(`Quiz ${i}: falta question`);
    if (!Array.isArray(q.options) || q.options.length < 2) {
      result.errors.push(`Quiz ${i}: mínimo 2 opções`);
    }
    const correct = q.options?.filter((o) => o.isCorrect);
    if (!correct?.length) result.errors.push(`Quiz ${i}: nenhuma opção correta`);
  } else if (qType === 'true-false') {
    if (!q.statement) result.errors.push(`Quiz ${i}: falta statement`);
    if (typeof q.isTrue !== 'boolean') result.errors.push(`Quiz ${i}: falta isTrue (boolean)`);
  } else if (qType === 'fill-blank') {
    if (!q.sentenceWithBlank) result.errors.push(`Quiz ${i}: falta sentenceWithBlank`);
    if (!q.correctAnswer) result.errors.push(`Quiz ${i}: falta correctAnswer`);
  }

  // Validações comuns a todos os tipos
  if (!q.explanation) result.warnings.push(`Quiz ${i}: falta explanation`);
  if (q.afterSectionIndex < 0 || q.afterSectionIndex >= sectionsLength) {
    result.errors.push(`Quiz ${i}: afterSectionIndex (${q.afterSectionIndex}) fora do range [0, ${sectionsLength - 1}]`);
  }
});
```

**Escopo total:** 1 arquivo, ~15 linhas substituídas. Zero risco de regressão — apenas a lógica de validação muda, nenhum componente de render é tocado.