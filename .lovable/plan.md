# Plano: Variedade nos Quizzes Inline (P6) + Correcao P5  
  
Atue como um engenheiro sênior responsável pelo sistema V8 e de todo o sistema e banco de dados, atue com obrigação de precisão técnica absoluta.

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

## Escopo

Duas entregas pendentes do plano original:

- **P6**: Expandir quizzes inline de "apenas multiple-choice" para 3 tipos: `multiple-choice`, `true-false`, `fill-blank`
- **P5**: Completar merge de conteudo residual curto (< 100 chars) quando a secao tem quiz

---

## PARTE 1: Variedade nos Quizzes Inline (P6)

### 1.1 Expandir o tipo `V8InlineQuiz` (`src/types/v8Lesson.ts`)

Adicionar campo discriminador `quizType` com union type:

```text
V8InlineQuiz {
  ...campos existentes...
  quizType?: 'multiple-choice' | 'true-false' | 'fill-blank';  // default: 'multiple-choice'
  
  // Campos para true-false (apenas quando quizType === 'true-false')
  statement?: string;       // "O ChatGPT gera respostas em tempo real a partir de buscas na internet."
  isTrue?: boolean;         // false
  
  // Campos para fill-blank (apenas quando quizType === 'fill-blank')
  sentenceWithBlank?: string;  // "O ChatGPT e um _______ de linguagem treinado com dados ate 2024."
  correctAnswer?: string;      // "modelo"
  acceptableAnswers?: string[]; // ["modelo", "modelo de linguagem"]
}
```

Usar `quizType` opcional com default `'multiple-choice'` para compatibilidade retroativa com quizzes existentes.

### 1.2 Criar componentes de renderizacao

**Arquivo novo**: `src/components/lessons/v8/V8QuizTrueFalse.tsx`

- Exibe a `statement` em destaque
- Dois botoes grandes: "Verdadeiro" e "Falso"
- Badge "Verdadeiro ou Falso" (verde/vermelho)
- Feedback, explanation, reinforcement reutilizam a mesma logica do V8QuizInline
- Audio support identico

**Arquivo novo**: `src/components/lessons/v8/V8QuizFillBlank.tsx`

- Exibe `sentenceWithBlank` com o blank destacado visualmente (underline animado)
- Input de texto para o usuario digitar a resposta
- Validacao case-insensitive contra `correctAnswer` e `acceptableAnswers`
- Badge "Complete a Frase"
- Feedback, explanation, reinforcement identicos

### 1.3 Atualizar o router de quiz no Player (`V8LessonPlayer.tsx`)

Onde hoje renderiza:

```tsx
{item.type === "quiz" && (
  <V8QuizInline quiz={item.quiz} ... />
)}
```

Substituir por discriminacao:

```tsx
{item.type === "quiz" && (
  item.quiz.quizType === 'true-false' ? (
    <V8QuizTrueFalse quiz={item.quiz} ... />
  ) : item.quiz.quizType === 'fill-blank' ? (
    <V8QuizFillBlank quiz={item.quiz} ... />
  ) : (
    <V8QuizInline quiz={item.quiz} ... />
  )
)}
```

### 1.4 Atualizar `QUIZ_TOOLS` schema (`v8-generate-lesson-content/index.ts`)

Expandir o schema de quiz para incluir os 3 tipos:

```text
quizzes[].quizType: enum ["multiple-choice", "true-false", "fill-blank"]

// Campos condicionais por tipo:
// multiple-choice: options[] (existente)
// true-false: statement (string), isTrue (boolean)
// fill-blank: sentenceWithBlank (string), correctAnswer (string), acceptableAnswers (string[])
```

Todos os 3 tipos compartilham: `afterSectionIndex`, `question`, `explanation`, `reinforcement`.

### 1.5 Atualizar `QUIZ_SYSTEM_PROMPT`

Adicionar instrucoes de variedade:

```text
- VARIE os tipos de quiz. NAO repita o mesmo tipo consecutivamente.
- Use "true-false" quando o conteudo tem afirmacoes que podem ser validadas como verdadeiras ou falsas.
- Use "fill-blank" quando o conteudo tem definicoes ou frases-chave que o aluno deve completar.
- Use "multiple-choice" como padrao para perguntas de compreensao geral.
- Em uma aula com 3+ quizzes, use pelo menos 2 tipos diferentes.
```

### 1.6 Atualizar parser (`v8ContentParser.ts`)

O bloco `[QUIZ]` manual ja suporta apenas multiple-choice. Adicionar suporte para:

```text
[QUIZ]
quizType: true-false
statement: O ChatGPT busca informacoes na internet em tempo real.
isTrue: false
explanation: O ChatGPT nao acessa a internet...
reinforcement: ...
```

```text
[QUIZ]
quizType: fill-blank
sentenceWithBlank: O ChatGPT e um _______ de linguagem.
correctAnswer: modelo
acceptableAnswers: modelo, modelo de linguagem
explanation: ...
reinforcement: ...
```

---

## PARTE 2: Correcao P5 — Merge de Conteudo Residual

### Problema atual

No `v8ContentParser.ts` (linhas 112-114), quando uma secao tem conteudo residual curto (< 100 chars) e um quiz vinculado, o sistema MANTEM a secao normalmente. Isso causa narracao duplicada: o player narra o texto curto da secao E depois narra a pergunta do quiz (que frequentemente e o mesmo conteudo).

### Correcao

Alterar a logica no parser para que, quando detectar conteudo residual curto + quiz vinculado:

1. Extrair o texto residual da secao
2. Se o quiz NAO tem campo `question` preenchido, usar o texto residual como `question` do quiz
3. Se o quiz JA tem `question`, verificar similaridade textual simples (primeiras 30 chars). Se similar, DESCARTAR o texto residual
4. Marcar a secao como "merged" e REMOVER ela da lista final (usando o mesmo mecanismo de ghost sections)
5. Recalcular `indexRemap` incluindo essas secoes removidas

Na pratica, adicionar ao loop de detecao (linha 105-118):

```text
if (isShortResidual && sectionHasQuiz.has(i)) {
  // Merge residual content into quiz or remove section
  removedIndices.push(i);
  // Optionally prepend residual as quiz context
} else if (isEmpty) {
  removedIndices.push(i);
} else {
  keptSections.push(parsedSections[i]);
}
```

---

## Arquivos Modificados

1. `src/types/v8Lesson.ts` — Expandir `V8InlineQuiz` com `quizType`, `statement`, `isTrue`, `sentenceWithBlank`, `correctAnswer`, `acceptableAnswers`
2. **NOVO**: `src/components/lessons/v8/V8QuizTrueFalse.tsx` — Componente true-false
3. **NOVO**: `src/components/lessons/v8/V8QuizFillBlank.tsx` — Componente fill-blank
4. `src/components/lessons/v8/V8LessonPlayer.tsx` — Router de quiz por tipo
5. `supabase/functions/v8-generate-lesson-content/index.ts` — `QUIZ_TOOLS` schema + `QUIZ_SYSTEM_PROMPT`
6. `src/lib/v8ContentParser.ts` — P5 merge + suporte a novos tipos no parser

## Ordem de Implementacao

1. Expandir tipo `V8InlineQuiz` (retrocompativel)
2. Criar `V8QuizTrueFalse.tsx`
3. Criar `V8QuizFillBlank.tsx`
4. Atualizar router no Player
5. Atualizar edge function (schema + prompt)
6. Atualizar parser (P5 merge + novos tipos)
7. Deploy da edge function