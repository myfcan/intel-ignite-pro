

## Diagnóstico: O que aconteceu

O código **sempre teve** `previous_text` / `next_text` nas sections. O que mudou foi o **modelo da ElevenLabs**: quando migramos de `eleven_multilingual_v2` para `eleven_v3` (para evitar accent drift PT-PT), o request stitching parou de funcionar porque `eleven_v3` **não suporta** esses parâmetros.

O comentário na linha 367 diz `// Request stitching — supported by eleven_v3` — isso é **falso**. O erro da API confirma:

```
"Providing previous_text or next_text is not yet supported with the 'eleven_v3' model."
```

Antes funcionava porque usávamos `eleven_multilingual_v2`. A troca de modelo quebrou o stitching silenciosamente.

## Correção

Remover `previous_text` / `next_text` do `v8-generate/index.ts`:

1. **Linhas 142-144**: Remover construção de `prevText` / `nextText`
2. **Linha 147**: Chamar `generateTTS(elevenLabsKey, plainText)` sem os dois últimos args
3. **Linhas 354-369**: Simplificar a função `generateTTS` — remover parâmetros `previousText`/`nextText` e o bloco condicional que os adiciona ao body

Impacto: zero risco. O stitching já estava falhando (todas as 9 sections davam 400). Removê-lo faz as sections gerarem normalmente, como os quizzes e playgrounds já fazem.

