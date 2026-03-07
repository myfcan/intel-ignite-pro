

## Adjusting Coursiv Prompt Builder Sentence Density

### Problem
The current Coursiv exercise generates sentences that are too short and simplistic (e.g., "Crie um _______ para _______ no _______ com _______."). The max 14-word constraint is too restrictive, resulting in low pedagogical density and weak variable context.

### Solution
Increase the word limit from 14 to 20 words. This allows the AI to generate richer sentences with more contextual connectors between the blanks, making the exercise feel more like a real prompt without becoming overwhelming. The 4-blank requirement stays the same.

### Changes — Single file: `supabase/functions/v8-generate-lesson-content/index.ts`

1. **Tool schema** (line ~389): Update description from "max 14 words" to "max 20 words"
2. **Tool text property** (line ~404): Update description from "NO MORE than 14 words" to "NO MORE than 20 words"
3. **COURSIV_SYSTEM_PROMPT** (lines ~429-440): Update all references from "14 palavras" to "20 palavras" and update the example to a longer, richer sentence like:
   ```
   "Crie um _______ para um _______ que precisa de resultados no formato _______ com tom _______"
   ```
4. **Quality Gate** (lines ~828-831): Change the hard validation from `wordCount > 14` to `wordCount > 20`

### Why 20 words?
- 14 words with 4 blanks = only ~10 connecting words, resulting in bare-bones structure
- 20 words with 4 blanks = ~16 connecting words, allowing prepositions, relative clauses, and contextual phrases that make the prompt feel realistic
- Still fits comfortably on mobile screens (2-3 lines max)

