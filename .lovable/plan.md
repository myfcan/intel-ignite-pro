

# Análise Forense: Plano "Ângulos Pedagógicos" — Gaps e Dados Reais

## O que o plano propõe

Adicionar `PEDAGOGICAL_ANGLES` (3 constantes de texto) e concatenar ao `INLINE_EXERCISE_SYSTEM_PROMPT` na chamada `callAI` (linha 723-728).

---

## DADOS REAIS DO CÓDIGO

### Ponto de injeção real (linhas 723-728):

```typescript
const exResult = await callAI(
  LOVABLE_API_KEY,
  INLINE_EXERCISE_SYSTEM_PROMPT,   // ← system prompt
  `Gere exercícios inline para estas seções...`,  // ← user prompt
  INLINE_EXERCISE_TOOLS,
  "generate_inline_exercises",
);
```

O `INLINE_EXERCISE_SYSTEM_PROMPT` é passado como 1º argumento de conteúdo ao `callAI` (linha 505-541). Dentro de `callAI`, ele vai para `messages[0].content` (role: system).

### O prompt atual (linhas 406-436) — trecho real:

```typescript
const INLINE_EXERCISE_SYSTEM_PROMPT = `Você é um designer instrucional especializado em educação sobre I.A.
Gere exercícios interativos inline para seções intermediárias de uma aula.

REGRAS:
1. Gere EXATAMENTE o tipo solicitado para cada seção — o tipo é obrigatório e definido pelo contrato V8-C01.
...
```

### O `selectedPattern` já existe (linha 672):

```typescript
const selectedPattern = requestedPattern || patternNames[Math.abs(orderIndex) % 3];
```

---

## GAPS IDENTIFICADOS

### Gap 1: O ângulo deve afetar TAMBÉM os quizzes legados?

O código gera quizzes separados via `QUIZ_SYSTEM_PROMPT` (linhas 340-369). Se uma seção não recebe inline exercise, ela pode receber um quiz legado. Esses quizzes NÃO seriam afetados pelo ângulo pedagógico.

**Impacto**: Baixo. No fluxo V8-C01/C02/C03, seções 2-6 recebem inline exercises. Quizzes só são gerados para seções que não têm interação (S0, S1, S7+). Essas são introdutórias e o ângulo não se aplica.

**Veredicto**: NÃO é gap real. Os quizzes restantes são para seções fora do mapa de exercícios.

### Gap 2: O Coursiv e o Playground também deveriam variar por ângulo?

- Coursiv (linhas 948-954): usa `COURSIV_SYSTEM_PROMPT` separado.
- Playground (linhas 1057-1063): usa `PLAYGROUND_SYSTEM_PROMPT` separado.

**Impacto**: Médio. O Coursiv sempre pede "monte o prompt" (formato fixo). O Playground sempre compara amador vs profissional. Esses formatos são estruturais, não variam por ângulo.

**Veredicto**: NÃO é gap. O formato do Coursiv e Playground é fixo por design.

### Gap 3: O `INLINE_EXERCISE_SYSTEM_PROMPT` é uma constante global (linha 406)

Se concatenarmos o ângulo diretamente na constante, ela seria modificada para todas as chamadas. Mas o plano propõe concatenar na CHAMADA, não na constante:

```typescript
INLINE_EXERCISE_SYSTEM_PROMPT + `\n\n${angleInstruction}`
```

**Veredicto**: Correto. A concatenação acontece por invocação, não muta a constante.

### Gap 4: O user prompt (linha 726) já inclui o conteúdo das seções

```typescript
`Gere exercícios inline para estas seções. CADA EXERCÍCIO DEVE SER DO TIPO ESPECIFICADO:\n\n${assignmentPrompt}`
```

Onde `assignmentPrompt` (linhas 718-721) contém:

```typescript
`Seção ${a.sectionIndex} (index ${a.sectionIndex}): "${section.title}"\nConteúdo: ${section.content?.slice(0, 400) || ""}\n→ TIPO OBRIGATÓRIO: ${a.type}`
```

O ângulo pedagógico vai no system prompt. O conteúdo da seção vai no user prompt. Não há conflito — o system prompt define o "como perguntar", o user prompt define o "sobre o quê perguntar".

**Veredicto**: NÃO é gap. A arquitetura system/user prompt está correta para isso.

### Gap 5: O `callAI` usa tool calling com schema fixo

```typescript
tools: INLINE_EXERCISE_TOOLS,
tool_choice: { type: "function", function: { name: "generate_inline_exercises" } },
```

O schema dos tools (linhas 172-256) define a ESTRUTURA de saída (afterSectionIndex, type, data, etc.), não o CONTEÚDO textual das perguntas. O ângulo afeta o conteúdo gerado (textos das perguntas), não a estrutura JSON.

**Veredicto**: NÃO é gap. Tools controlam formato, ângulo controla conteúdo.

### Gap 6: O ângulo precisa ter referência ao `selectedPattern`

O plano usa `PEDAGOGICAL_ANGLES[selectedPattern]`. O `selectedPattern` já está calculado na linha 672 e disponível no escopo.

**Veredicto**: NÃO é gap. Variável já existe e está acessível.

### Gap 7: E se o ângulo fizer a IA ignorar o TIPO OBRIGATÓRIO?

O user prompt diz "CADA EXERCÍCIO DEVE SER DO TIPO ESPECIFICADO" e o Hard Gate (linhas 908-914) rejeita se exercícios de seções esperadas estiverem faltando. O ângulo NÃO muda o tipo, só o conteúdo da pergunta.

Risco: A IA pode confundir e gerar true-false quando deveria gerar multiple-choice porque o ângulo diz "detecte ERROS". Isso seria capturado pelo Hard Gate.

**Veredicto**: Risco BAIXO. O tipo está no user prompt como `→ TIPO OBRIGATÓRIO: ${a.type}`. O ângulo deve ser claro que se aplica ao CONTEÚDO, não ao tipo.

**Mitigação**: Adicionar ao ângulo: "O TIPO do exercício continua sendo definido pelo campo TIPO OBRIGATÓRIO. Você só muda o ÂNGULO DA PERGUNTA."

---

## PLANO DE IMPLEMENTAÇÃO VALIDADO

### Arquivo único: `supabase/functions/v8-generate-lesson-content/index.ts`

**Alteração 1** — Após linha 673, adicionar constante `PEDAGOGICAL_ANGLES`:

```typescript
const PEDAGOGICAL_ANGLES: Record<string, string> = {
  'V8-C01': `ÂNGULO PEDAGÓGICO — IDENTIFICAÇÃO:
Formule perguntas que testem se o aluno IDENTIFICA o conceito correto.
Verbos: identificar, reconhecer, distinguir, apontar.
Ex: "Qual destes é um exemplo de prompt específico?"
IMPORTANTE: O TIPO do exercício é definido pelo campo TIPO OBRIGATÓRIO. Você só muda o ângulo da pergunta, não o tipo.`,

  'V8-C02': `ÂNGULO PEDAGÓGICO — APLICAÇÃO PRÁTICA:
Formule perguntas com CENÁRIO REAL que testem se o aluno sabe APLICAR o conceito.
Comece com: "Você precisa...", "Seu cliente pediu...", "Imagine que...".
Ex: "Você precisa criar um cardápio. Qual prompt gera o melhor resultado?"
IMPORTANTE: O TIPO do exercício é definido pelo campo TIPO OBRIGATÓRIO. Você só muda o ângulo da pergunta, não o tipo.`,

  'V8-C03': `ÂNGULO PEDAGÓGICO — ERRO COMUM:
Formule perguntas que apresentem algo INCORRETO para o aluno detectar o ERRO.
Use: "O que está errado em...", "Qual o problema de...", "Por que este prompt falha?".
Ex: "Este prompt parece bom, mas tem um erro. Qual é?"
IMPORTANTE: O TIPO do exercício é definido pelo campo TIPO OBRIGATÓRIO. Você só muda o ângulo da pergunta, não o tipo.`,
};
```

**Alteração 2** — Linha 724, modificar a chamada `callAI`:

```typescript
const angleInstruction = PEDAGOGICAL_ANGLES[selectedPattern] || PEDAGOGICAL_ANGLES['V8-C01'];

const exResult = await callAI(
  LOVABLE_API_KEY,
  INLINE_EXERCISE_SYSTEM_PROMPT + `\n\n${angleInstruction}`,
  // ... user prompt unchanged
);
```

**Zero alterações em outros arquivos.**

### Resultado esperado por padrão:
- **C01**: "Qual destes prompts é mais específico?" (identifica)
- **C02**: "Seu cliente quer um post. Qual prompt usar?" (aplica)
- **C03**: "Este prompt parece bom. Qual o erro?" (detecta erro)

### Riscos residuais:
1. A IA pode não seguir o ângulo 100% — mitigado pelo texto "IMPORTANTE" em cada ângulo
2. Hard Gate continua validando tipos e contagens — sem risco de regressão estrutural

