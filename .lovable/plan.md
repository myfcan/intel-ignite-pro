

# Pipeline V8 Automatizado — Imagens + Exercicios Completos (10 tipos)

## Visao Geral

Automatizar o pipeline de criacao de aulas V8 em 3 frentes:

1. **Imagens**: geracao automatica por secao (sem wizard manual)
2. **Interacoes mid-lesson**: quizzes inline e playgrounds inline gerados por IA quando ausentes
3. **Exercicios finais**: IA escolhe entre os 10 tipos de exercicio disponveis baseado no contexto do conteudo

## Como a IA escolhe o tipo de exercicio

A Edge Function recebe o conteudo de todas as secoes e usa um prompt estruturado que mapeia contexto para tipo:

| Contexto detectado | Tipo de exercicio |
|---|---|
| Categorias, classificacoes | drag-drop |
| Plataformas, ferramentas para combinar | platform-match |
| Afirmacoes para validar | true-false |
| Conceitos-chave para memorizar | flipcard-quiz |
| Definicoes com lacunas | fill-in-blanks ou complete-sentence |
| Cenarios de decisao | scenario-selection |
| Dados para analisar | data-collection |
| Perguntas diretas | multiple-choice |
| Revisao rapida com pressao | timed-quiz |

A IA retorna JSON estruturado via tool calling (sem parsing manual), seguindo exatamente os schemas de `exerciseSchemas.ts`.

## Arquitetura

```text
Conteudo Bruto
    |
    v
v8ContentParser.ts  (extrair secoes, detectar [QUIZ], [PLAYGROUND])
    |
    v
Edge Function: v8-generate-lesson-content  (NOVA)
    |
    +---> Gera imagens por secao (chama v8-generate-section-image)
    +---> Gera quizzes inline onde faltam
    +---> Gera playgrounds inline onde faltam  
    +---> Gera exercicios finais (escolhe entre 10 tipos)
    |
    v
JSON V8 completo pronto para validacao
```

## Alteracoes

### 1. Nova Edge Function: `v8-generate-lesson-content`

Orquestra a geracao automatica de todo conteudo complementar:

- Recebe: array de secoes (titulo + conteudo markdown)
- Recebe: quizzes/playgrounds ja extraidos do bruto (se houver)
- Chama Lovable AI (Gemini Flash) com tool calling para gerar:
  - Quizzes inline para secoes sem interacao
  - Playgrounds inline onde o conteudo pede pratica
  - 2-4 exercicios finais escolhidos entre os 10 tipos
- Chama `v8-generate-section-image` para cada secao (imagens)
- Retorna JSON completo com tudo preenchido

### 2. Atualizar `AdminV8Create.tsx`

- Remover etapa manual de "Setup Visual" (V8SectionSetup)
- Fluxo simplificado: Conteudo Bruto -> Converter -> Gerar Tudo -> Validar -> Salvar
- Botao "Converter e Gerar" faz tudo em um passo
- Progress bar mostrando: "Gerando imagens... Gerando exercicios... Gerando quizzes..."

### 3. Atualizar `v8ContentParser.ts`

- Manter extracao de marcadores manuais `[QUIZ]`, `[PLAYGROUND]`, `[EXERCISE:tipo]`
- Novo marcador opcional: `[EXERCISE:drag-drop]`, `[EXERCISE:timed-quiz]`, etc.
- Parser retorna flag `hasManualExercises` para a Edge Function saber se precisa gerar

### 4. Remover/simplificar `V8SectionSetup.tsx`

- Componente deixa de ser obrigatorio no fluxo
- Pode ser mantido como visualizador opcional (readonly) do que foi gerado

## Contrato da Edge Function

```text
POST /v8-generate-lesson-content

Request:
{
  sections: [{ title, content }],
  manualQuizzes: [...],        // extraidos do bruto (pode ser vazio)
  manualPlaygrounds: [...],    // extraidos do bruto (pode ser vazio)  
  manualExercises: [...],      // extraidos do bruto (pode ser vazio)
  generateImages: true,
  lessonTitle: "..."
}

Response:
{
  sections: [{ ...section, imageUrl }],
  inlineQuizzes: [...],
  inlinePlaygrounds: [...],
  exercises: [...]             // 2-4 exercicios dos 10 tipos
}
```

## Prompt de selecao de exercicios (resumo)

A IA recebe os schemas dos 10 tipos via tool calling e instrucoes como:

- "Analise o conteudo e escolha 2-4 tipos de exercicio que melhor testam o conhecimento"
- "Varie os tipos — nao repita o mesmo tipo"
- "Priorize exercicios interativos (drag-drop, flipcard, platform-match) sobre texto puro"
- "Siga EXATAMENTE o schema de cada tipo"

## Custo estimado por aula

| Item | Custo |
|---|---|
| Imagens (14 secoes x DALL-E 3) | ~R$ 2.80 |
| Exercicios + Quizzes (Gemini Flash) | ~R$ 0.01 |
| Audio (ElevenLabs, sem mudanca) | custo existente |
| **Total adicional** | **~R$ 2.81** |

## Fluxo do admin apos implementacao

1. Admin cola conteudo bruto (pode incluir `[QUIZ]`, `[PLAYGROUND]`, `[EXERCISE:tipo]` ou nao)
2. Clica "Converter e Gerar"
3. Pipeline automatico: parse -> imagens -> quizzes -> playgrounds -> exercicios
4. Admin ve JSON completo para revisar
5. Valida e salva

