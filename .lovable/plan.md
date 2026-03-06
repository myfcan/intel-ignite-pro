

## Plano: Corrigir Sessão 8 + Pipeline de Geração Completo

### Diagnóstico

Analisei o banco de dados e o código. Os problemas são:

1. **Sessão 8 (Coursiv)**: A aula `0638b200` foi gerada com o formato antigo (4 sentenças com 1 lacuna cada). A regra V8-C01 (1 sentença, 4 lacunas, 14 palavras) já está no pipeline mas não foi aplicada retroativamente.

2. **learnAndGrow**: O campo **não existe no banco** para esta aula (`has_learn_and_grow: false`). O pipeline (`v8-generate-lesson-content`) **nunca gera** esse campo — ele foi adicionado apenas ao tipo TypeScript e ao player, mas o pipeline não tem lógica de geração.

3. **successMessage / tryAgainMessage**: O pipeline **não gera** esses campos nos exercícios inline. Foram adicionados ao tipo mas não ao prompt de geração.

### Mudanças Necessárias

**1. Pipeline: Gerar `learnAndGrow` no edge function** (`supabase/functions/v8-generate-lesson-content/index.ts`)
- Adicionar uma nova chamada AI após insights para gerar o bloco `learnAndGrow`
- Tool schema com `whatChanged`, `beforeAfter`, `practicalExample`
- Incluir no response final como `learnAndGrow`

**2. Pipeline: Gerar `successMessage` / `tryAgainMessage` nos exercícios inline**
- Atualizar `INLINE_EXERCISE_TOOLS` schema para incluir esses campos
- Atualizar `INLINE_EXERCISE_SYSTEM_PROMPT` para instruir a IA a gerar feedback contextual
- Mapear os campos no post-processing dos exercícios

**3. AdminV8Create: Persistir `learnAndGrow` no `finalData`**
- Adicionar `learnAndGrow: result.learnAndGrow || undefined` ao objeto `finalData` em `AdminV8Create.tsx`

**4. Player: Fallback seguro para dados legados**
- `V8CompleteSentenceInline.tsx`: Se `sentences.length > 1` e cada uma tem 1 blank, manter o comportamento "legacy join" que já existe — verificar que não quebra
- `V8InlineExercise.tsx`: Já tem fallback para `!successMessage` (badge genérico) — OK

**5. Corrigir esta aula específica** (via `patch-lesson-content` edge function)
- Injetar `learnAndGrow` manualmente com conteúdo baseado no playground existente
- Substituir `inlineCompleteSentences` pelo formato V8-C01 correto (1 sentença, 4 blanks)

### Arquivos

1. **`supabase/functions/v8-generate-lesson-content/index.ts`**
   - Adicionar `LEARN_AND_GROW_TOOLS` + `LEARN_AND_GROW_SYSTEM_PROMPT`
   - Adicionar step de geração após insights
   - Adicionar `successMessage`/`tryAgainMessage` ao `INLINE_EXERCISE_TOOLS`
   - Incluir `learnAndGrow` no response final

2. **`src/pages/AdminV8Create.tsx`**
   - Adicionar `learnAndGrow: result.learnAndGrow || undefined` ao `finalData`

3. **`src/components/lessons/v8/V8CompleteSentenceInline.tsx`**
   - Verificar e reforçar fallback para formato legado (já existe, validar)

