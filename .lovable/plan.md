

# JSON Golden Template V8 — Modelo Completo em AdminModelos

## Problema Atual

A secao V8 em `src/pages/AdminModelos.tsx` (linhas 316-325) exibe um JSON minimo incorreto:
- Usa `"text"` em vez de `"content"` (campo real no tipo `V8Section`)
- Falta `contentVersion: "v8"` (discriminador obrigatorio em `V8LessonData`)
- Falta `description`
- Falta `inlineQuizzes` (campo obrigatorio em `V8LessonData`)
- Falta `exercises` (campo obrigatorio em `V8LessonData`)
- Falta `audioDurationSeconds` e `imageUrl` nas secoes
- Nenhum exemplo de quiz inline ou exercicio final

## Plano

### Arquivo: `src/pages/AdminModelos.tsx`

Substituir o bloco do JSON minimo (linhas 316-326) por um JSON Golden completo que inclui:

1. **Header**: `contentVersion: "v8"`, `title`, `description`
2. **3 secoes completas** com todos os campos (`id`, `title`, `content` com markdown real, `imageUrl`, `audioUrl`, `audioDurationSeconds`)
3. **1 inline quiz** entre secoes (com `afterSectionIndex`, `question`, 3 opcoes, `explanation`, `reinforcement`, `audioUrl`)
4. **2 exercicios finais** (um `true-false` e um `multiple-choice`) demonstrando o reuso do tipo `ExerciseConfig`

O JSON sera formatado e legivel, com comentarios inline para orientar o uso.

Adicionalmente, trocar o label de "Exemplo minimo" para "JSON Golden Template V8 — Referencia Completa" e adicionar um botao "Copiar JSON V8" funcional (similar ao que ja existe para V7).

### Estrutura do JSON Golden

```text
V8LessonData
  contentVersion: "v8"
  title: string
  description: string
  sections: [
    { id, title, content (markdown), imageUrl?, audioUrl, audioDurationSeconds }
    x3 secoes
  ]
  inlineQuizzes: [
    { id, afterSectionIndex, question, options[3], explanation, reinforcement?, audioUrl? }
    x1 quiz
  ]
  exercises: [
    { id, type: "true-false", title, instruction, data: { correctAnswer, explanation } }
    { id, type: "multiple-choice", title, instruction, data: { options[], correctOptionId } }
  ]
```

### Funcionalidade adicional

- Adicionar funcao `copyV8JsonToClipboard` (espelhando o padrao do V7 com `copyJsonToClipboard`)
- Adicionar estado `copiedV8` para feedback visual do botao
- Botao "Copiar JSON V8 Golden" com icone Copy/CheckCircle

### Resultado esperado

Na pagina `/admin/modelos`, o card V8 exibira o JSON Golden completo, copiavel com um clique, servindo como template de referencia para criacao de aulas V8.
