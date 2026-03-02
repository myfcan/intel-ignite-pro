

# Ajuste do Prompt para Gerar Imagens Quadradas/Horizontais

## Problema
O Gemini está gerando imagens com composição vertical/portrait, o que ocupa espaço excessivo na tela e faz os elementos internos parecerem pequenos.

## Solucao

Adicionar instrucoes explicitas de aspecto e composicao nos dois prompts (auto e custom) da edge function `v8-generate-section-image`.

### Mudancas no arquivo `supabase/functions/v8-generate-section-image/index.ts`

**Prompt AUTO (funcao `buildAutoPrompt`)** - Adicionar regras de aspecto:

```
- IMPORTANT: Compose the image in a SQUARE (1:1) or HORIZONTAL (landscape) orientation
- NEVER create tall/vertical/portrait compositions
- If the concept involves multiple elements, arrange them SIDE BY SIDE horizontally, not stacked vertically
- The composition width must be EQUAL TO or GREATER than its height
```

**Prompt CUSTOM** (linha 70-72) - Adicionar as mesmas regras de aspecto ao final do prompt custom.

### Detalhes tecnicos

Apenas o arquivo da edge function sera alterado. Nenhuma mudanca no player ou no frontend. As imagens geradas apos o deploy ja virao no formato correto. Imagens existentes nao serao afetadas (seria necessario regera-las).

