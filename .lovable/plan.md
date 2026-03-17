

## Auditoria Completa — Zero Imagens no Pipeline V10

### Dados Reais Coletados

**Pipeline**: `39febcac-2ddf-44b3-a7ac-2be0b0d50c60`
**lesson_id**: `a94d1012-1f49-409d-a905-b72afb07a372`
**Status atual**: `images_needed: 0`, `images_generated: 0`, `images_approved: 0`

**Steps existentes no DB** (5 steps confirmados):
```
step 1: "Introdução ao Calendly MCP" — elements: [text, text]
step 2: "Compatibilidade e Pré-requisitos" — elements: [text, text]
step 3: "Exemplos de Comandos para IA" — elements: [text, text, text]
step 4: "Conectando Calendly ao ChatGPT: Passo 1" — elements: [text, chrome_header, text]
step 5: "Conectando Calendly ao ChatGPT: Passo 2" — elements: [text, text, text]
```

Nenhum step tem `type: "image"` nos elements. Pelo filtro da linha 215-236, **todos os 5 deveriam ser marcados como "needing images"**.

**Logs reais do pipeline_log (5 execuções):**
```
"Batch 0: 0 succeeded, 0 failed out of 0 steps (total needing images: 0)"
```

---

### 3 Bugs Confirmados com Evidência

#### BUG 1 — Bucket `lesson-images` NÃO EXISTE

Código real — `v10-generate-images/index.ts` linhas 321-323:
```typescript
const { error: uploadError } = await supabase.storage
  .from("lesson-images")
  .upload(storagePath, bytes, {
```

Buckets existentes no Storage (query real):
```
lesson-audios, avatars, tts-cache, image-lab
```

**NÃO EXISTE `lesson-images`**. Mesmo que uma imagem fosse gerada, o upload falharia com erro de bucket não encontrado.

O V8 usa `lesson-audios` com path `v8-images/...` (confirmado em `v8-generate-section-image/index.ts` linha 135).

#### BUG 2 — Usa `dall-e-2` via OpenAI em vez do Lovable AI Gateway

Código real — linhas 29-41:
```typescript
const response = await fetch("https://api.openai.com/v1/images/generations", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "dall-e-2",
    prompt,
    n: 1,
    size: "1024x1024",
    response_format: "b64_json",
  }),
});
```

O V8 já migrou para Gemini via `https://ai.gateway.lovable.dev/v1/chat/completions` com modelo `google/gemini-2.5-flash-image`. O V10 ainda usa a API legada.

#### BUG 3 — Sem Logging Diagnóstico

A função não loga `steps.length` nem `stepsNeedingImages.length` antes de aplicar o filtro. Os logs de edge function mostram APENAS boot/shutdown — nenhum log de execução. Isso impede diagnóstico de por que o filtro retornou 0 quando 5 steps existem no DB.

---

### Plano de Correção (3 frentes)

**1. Trocar bucket para `lesson-audios` (existente e público)**

Alterar linhas 320-335 para usar `lesson-audios` com path `v10-images/...`, igual ao padrão V8.

**2. Migrar geração de imagens para Lovable AI Gateway (Gemini)**

Substituir `generateImageOpenAI` (dall-e-2) por função que usa `https://ai.gateway.lovable.dev/v1/chat/completions` com modelo `google/gemini-2.5-flash-image`, idêntico ao padrão já implementado em `v8-generate-section-image`. Remover dependência de `OPENAI_API_KEY` e `LEONARDO_API_KEY`.

**3. Adicionar logging diagnóstico**

Após a query de steps (linha 203) e após o filtro (linha 237), adicionar `console.log` com contagens reais para que futuros problemas sejam visíveis nos logs de edge function.

### Arquivos a editar

| Arquivo | Alteração |
|---|---|
| `supabase/functions/v10-generate-images/index.ts` | Migrar para Gemini, trocar bucket, adicionar logs |

