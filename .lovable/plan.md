

# Plano: Modo "Conteudo Bruto" no Admin V8

## Problema

A tela `AdminV8Create` so aceita JSON puro colado manualmente. O parser (`v8ContentParser.ts`) so converte blocos `[PLAYGROUND]` e nunca foi integrado na UI. Falta:
1. Parser para secoes (`## Titulo`)
2. Parser para quizzes (`[QUIZ]`)
3. Funcao master `parseFullContent` que gera o JSON completo
4. UI com toggle "Conteudo | JSON" e botao "Converter"

---

## Fluxo do Usuario

```text
+---------------------------+
| Colar conteudo bruto      |
| (textarea grande)         |
+---------------------------+
          |
    [Converter para JSON]
          |
+---------------------------+
| JSON gerado (editavel)    |
| Resumo: 3 secoes, 1 quiz  |
+---------------------------+
          |
    [Validar JSON]  (fluxo existente)
          |
    [Gerar Aula]    (pipeline existente)
          |
    [Salvar]        (existente)
```

---

## Formato do Conteudo Bruto Esperado

```text
# Titulo da Aula

Descricao opcional da aula aqui.

## Secao 1 — Titulo da Secao
Conteudo markdown aqui...
Pode ter **bold**, listas, etc.

## Secao 2 — Outro Titulo
Mais conteudo...

[PLAYGROUND]
title: Teste na Pratica
instruction: Compare os dois prompts...
narration: [animado] Agora voce vai sentir...
amateurPrompt: me fala sobre marketing
professionalPrompt: Crie 3 estrategias...
successMessage: Boa!
tryAgainMessage: Quase.
hints:
- Diga o objetivo
- De contexto
- Peca formato
userChallengeInstruction: Agora e sua vez.
userChallengePrompt: Escreva aqui...
evaluationCriteria:
- Tem objetivo claro
- Tem contexto
- Pede formato
maxAttempts: 3
offlineFallbackMessage: Continue assim...
offlineFallbackExampleAnswer: Exemplo...

## Secao 3 — Continuacao
Conteudo apos o playground...

[QUIZ]
question: Qual a diferenca entre prompt vago e profissional?
options:
- [x] O profissional tem contexto, objetivo e formato
- [ ] O profissional e mais longo
- [ ] Nao tem diferenca
explanation: O prompt profissional especifica...
reinforcement: Lembre que contexto e...
```

---

## Etapas Tecnicas

### 1. Expandir `src/lib/v8ContentParser.ts`

Adicionar 3 funcoes novas:

- **`parseSections(rawText)`**: Extrai secoes delimitadas por `## Titulo`. Tudo entre dois `##` vira o `content` (markdown). Retorna array com `{ title, content, position }`.

- **`parseQuizBlocks(rawText)`**: Extrai blocos `[QUIZ]`. Campos: `question`, `options` (com `[x]` para correta, `[ ]` para errada), `explanation`, `reinforcement`. Retorna array com `{ quiz, position }`.

- **`parseFullContent(rawText)`**: Funcao master que:
  1. Extrai titulo da primeira linha `# Titulo`
  2. Extrai descricao (texto entre `#` e primeiro `##`)
  3. Chama `parseSections` para secoes
  4. Chama `parsePlaygroundBlocks` (ja existe) para playgrounds
  5. Chama `parseQuizBlocks` para quizzes
  6. Calcula `afterSectionIndex` para cada playground/quiz baseado na posicao no texto
  7. Gera IDs automaticos (`section-01`, `quiz-01`, `playground-01`)
  8. Retorna `V8LessonData` completo com `contentVersion: 'v8'` e `audioUrl: ""` em cada secao

### 2. Atualizar `src/pages/AdminV8Create.tsx`

- Novo estado: `editorMode: 'content' | 'json'` (default: `'content'`)
- Novo estado: `contentText: string` (textarea do conteudo bruto)
- Toggle visual entre "Conteudo" e "JSON" no topo do editor
- Modo "Conteudo":
  - Textarea grande para colar texto bruto
  - Botao **"Converter para JSON"** que chama `parseFullContent(contentText)`
  - Se sucesso: preenche `jsonText`, muda para modo JSON, mostra toast com resumo
  - Se erro: mostra toast com o problema
- Modo "JSON": editor atual (inalterado)
- O fluxo pos-conversao (validar, gerar audios, salvar) permanece identico

### Arquivos modificados

| Arquivo | Mudanca |
|---|---|
| `src/lib/v8ContentParser.ts` | Adicionar `parseSections`, `parseQuizBlocks`, `parseFullContent` |
| `src/pages/AdminV8Create.tsx` | Toggle content/json, textarea de conteudo, botao converter |

