
# Contrato Visual V8: Tamanho Padrao e Idioma Obrigatorio

## Problema Atual

1. **Sem contrato de tamanho**: O Gemini gera imagens em tamanho arbitrario. So o GPT cleanup (step 2) forca 512x512 — mas se o GPT falhar e o fallback usar a imagem Gemini original, o tamanho e imprevisivel.
2. **Sem exigencia de idioma**: O prompt atual diz "NEVER include text", mas na pratica algumas imagens TEM texto (como as da screenshot: "o que exatamente voce quer"). Quando texto e necessario, nao ha regra forcando portugues Brasil.

## Solucao

### Arquivo: `supabase/functions/v8-generate-section-image/index.ts`

**1. Contrato de tamanho no prompt Gemini**

Adicionar instrucao explicita de resolucao ao prompt de geracao (tanto `buildAutoPrompt` quanto modo `custom`):

```
- OUTPUT SIZE: Generate the image at exactly 1024x1024 pixels (1:1 square)
- The composition must be centered and fill the frame
```

Isso garante que mesmo sem o GPT cleanup, a imagem ja nasce no tamanho correto. O GPT cleanup continua redimensionando para 512x512 na saida final.

**2. Idioma pt-BR obrigatorio para textos**

Adicionar ao prompt base:

```
- LANGUAGE RULE: If any text, label, word, or phrase appears in the image, 
  it MUST be written in Brazilian Portuguese (pt-BR). 
  Never use English or any other language.
  Examples: "Inteligencia Artificial" (not "Artificial Intelligence"), 
  "Como funciona" (not "How it works")
```

**3. Modo "com texto" explicito**

Adicionar um parametro opcional `allowText` ao endpoint. Quando `allowText: true`:
- Remove a regra "NEVER include text"
- Adiciona regra de idioma pt-BR
- Especifica estilo tipografico (fonte limpa, legivel, integrada ao 3D)

Quando `allowText: false` (padrao atual), mantem a proibicao de texto.

### Mudancas especificas no codigo

**`buildAutoPrompt()` (linha 10-34)**:
- Adicionar `OUTPUT SIZE: 1024x1024 pixels, square format`
- Adicionar regra de idioma pt-BR como invariante

**Modo `custom` (linha 75-77)**:
- Mesmas regras de tamanho e idioma

**Novo parametro `allowText`** no body do request:
- Se `true`: remove "NEVER include text" e adiciona regras de tipografia pt-BR
- Se `false` (default): mantem comportamento atual

**`buildEditFormData()` (linha 211-226)**:
- Manter `size: "1024x1024"` no GPT cleanup (upgrade de 512x512 para consistencia com o Gemini)

### Frontend: `V8ContentSection.tsx`

- Manter `max-w-[300px]` no render (o contrato de tamanho e do pipeline, nao do player)
- O player ja faz downscale via CSS — nenhuma mudanca necessaria

## Resumo do Contrato

```text
CONTRATO VISUAL V8 — IMAGENS DE SECAO
========================================
Resolucao de geracao:  1024x1024 (Gemini)
Resolucao de entrega:  1024x1024 (pos-GPT cleanup)
Resolucao de exibicao: max 300px (CSS no player)
Proporcao:             1:1 (quadrada) ou landscape
Idioma de texto:       pt-BR obrigatorio
Texto na imagem:       Proibido por padrao, permitido via allowText=true
Fundo:                 Branco solido (#FFF) pre-cleanup, transparente pos-cleanup
```

## Arquivos Modificados

1. `supabase/functions/v8-generate-section-image/index.ts` — contrato de tamanho + idioma + allowText
2. Redeploy da edge function

## Sem mudancas de banco ou frontend
