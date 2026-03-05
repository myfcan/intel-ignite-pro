

## Plano: Regra V8-C01 — Coursiv Prompt Builder com 14 palavras e exatamente 4 lacunas

### Regra Nova

O exercício Coursiv (Sessão 8) deve seguir estas restrições estritas:
1. **Exatamente 4 lacunas** (não 4-6 como hoje)
2. **Máximo 14 palavras** por sentença (incluindo os placeholders como "palavras")
3. **Chips = exatamente as 4 respostas corretas** (sem distratores), exibidos em ordem embaralhada

### Mudanças

**1. `supabase/functions/v8-generate-lesson-content/index.ts` — COURSIV_BUILDER_TOOLS**
- `correctAnswers`: mudar `minItems: 4, maxItems: 6` → `minItems: 4, maxItems: 4`
- `options`: remover — o campo deixa de ser gerado pela IA (chips = correctAnswers embaralhados)
- `text` description: "...com exatamente 4 _______ e no máximo 14 palavras no total"

**2. `supabase/functions/v8-generate-lesson-content/index.ts` — COURSIV_SYSTEM_PROMPT**
- Atualizar regras:
  - "O campo text deve conter EXATAMENTE 4 placeholders" (não 4-6)
  - "A frase deve ter no máximo 14 palavras (incluindo os placeholders como palavras)"
  - "NÃO gere distratores. O campo options deve conter APENAS as 4 respostas corretas"
- Atualizar exemplo para refletir 14 palavras e 4 blanks sem distratores

**3. `supabase/functions/v8-generate-lesson-content/index.ts` — Quality Gate (linhas 799-847)**
- Blank count: `blankCount < 4 || blankCount > 6` → `blankCount !== 4`
- Adicionar validação de word count: contar palavras do texto (split por espaço), rejeitar se > 14
- Options: garantir que `options` contém exatamente as correctAnswers (sem extras)

**4. `src/components/lessons/v8/V8CompleteSentenceInline.tsx` — Frontend**
- No `useMemo`, quando `sentences.length === 1`: usar `correctAnswers` como `wordBank` (ignorar `options` se vier com distratores por backward compat)
- Isso já é parcialmente o caso (`allChips = sentences[0].options?.length ? options : correct`), mas forçar: `wordBank = shuffle([...correct])` sempre

**5. `src/types/v8Lesson.ts` — V8InlineCompleteSentence**
- Atualizar o comentário do tipo para refletir: "exatamente 4 lacunas, máx 14 palavras, chips = correctAnswers only"

### Resumo

```text
ANTES:
  text: "Crie um _______ de _______ para _______ no formato de _______ com tom _______" (5 blanks, 20+ palavras)
  options: ["roteiro", "vendas", "empresas", "lista", "persuasivo", "acadêmico", "relatório", "estudantes"]  (8 chips)

DEPOIS:
  text: "Crie um _______ para _______ no formato _______ com tom _______" (4 blanks, ≤14 palavras)
  options: ["roteiro", "empresas", "lista", "persuasivo"]  (4 chips, embaralhados)
```

