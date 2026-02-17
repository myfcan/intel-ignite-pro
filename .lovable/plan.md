
# Plano: Integracao do Image Lab (C12) com Pipeline V7 e V5

## Status da Auditoria C12

O Image Lab esta **100% compliant** com o contrato C12. Todas as 11 verificacoes passaram:

- Bucket privado, auth in-code, concurrency lock, state machine, cache hash, zero orphans, `public_url` nunca armazenado, hash binario seguro, timeout 120s, cron cleanup ativo, testes unitarios existentes.

Nenhuma correcao adicional e necessaria. O sistema esta pronto para integracao.

---

## Contexto da Integracao

Hoje existem **3 sistemas de geracao de imagem isolados**:

1. **Image Lab (C12)** -- Sandbox admin para geracao cinematografica. Robusto, auditavel, com presets, cache, KPIs.
2. **generate-slide-images** -- Edge function legada (V3/V5) que usa Leonardo.ai + OpenAI DALL-E diretamente. Sem cache, sem auditoria, sem presets.
3. **V7 microVisuals tipo `image`** -- Aceita `imageUrl` no JSON de input, mas **nao gera imagens**. O admin precisa fornecer URLs manualmente.

O objetivo e unificar a geracao de imagens sob o Image Lab, eliminando duplicacao e trazendo cache + auditoria para todos os pipelines.

---

## Arquitetura Proposta

```text
+------------------+       +------------------+       +------------------+
|   Admin UI       |       |  Pipeline V7-vv  |       |  Pipeline V5/V3  |
|  (Image Lab)     |       |  (Edge Function) |       |  (Frontend)      |
+--------+---------+       +--------+---------+       +--------+---------+
         |                          |                          |
         |   POST /image-lab-      |   POST /image-lab-       |
         |   generate-batch        |   generate-batch         |
         +--------+---------+------+--------+---------+-------+
                  |                         |
         +--------v-------------------------v--------+
         |        image-lab-generate-batch            |
         |  (Idempotency + Cache + Audit + Presets)   |
         +--------------------------------------------+
                  |
         +--------v--------+
         |  image_jobs      |
         |  image_attempts  |
         |  image_assets    |
         +--------+--------+
                  |
         +--------v--------+
         |  Supabase Storage|
         |  (image-lab)     |
         +-----------------+
```

---

## Fase 1: Nova Edge Function `image-lab-pipeline-bridge`

**Objetivo**: Criar um endpoint dedicado que o Pipeline V7 e V5 chamam internamente para gerar imagens, sem precisar de sessao admin no browser.

### Especificacao

| Campo | Detalhe |
|-------|---------|
| Nome | `image-lab-pipeline-bridge` |
| Auth | `service_role_key` (chamado server-to-server, nao do browser) |
| Input | `{ scenes: [{ scene_id, prompt_scene, style_hints? }], preset_key?, size?, provider? }` |
| Output | `{ results: [{ scene_id, asset_id, storage_path, status }] }` |
| Idempotency | Reutiliza hash do Image Lab (cache hit se prompt identico) |

### Fluxo Interno

1. Recebe array de cenas com prompts
2. Para cada cena: cria `image_job` + chama `generateFromProvider()` internamente
3. Verifica cache hash antes de gerar
4. Retorna `storage_path` de cada asset gerado/cacheado
5. Pipeline usa `storage_path` para montar signed URLs no renderer

### Decisao de Design

A bridge usa `service_role_key` porque e chamada server-to-server (V7-vv edge function -> bridge). Isso elimina a necessidade de propagar JWT do admin.

---

## Fase 2: Integracao com Pipeline V7-vv

### O que muda no V7

Hoje o JSON de input V7 aceita `microVisuals` do tipo `image` com `imageUrl` manual. A integracao adiciona uma etapa **pos-TTS / pre-persist** no pipeline:

1. Pipeline V7-vv recebe o JSON de roteiro normalmente
2. Apos gerar audio e calcular timestamps, identifica todos os `microVisuals` do tipo `image` que tem campo `promptScene` (novo campo opcional) mas **nao** tem `imageUrl`
3. Chama `image-lab-pipeline-bridge` com os prompts de todas as cenas pendentes (batch)
4. Recebe `storage_path` de volta e injeta no `content` do microVisual antes de persistir
5. O renderer ja sabe exibir `image-flash` -- basta o `storage_path` ser resolvido via signed URL

### Campos novos no JSON de input V7

```json
{
  "microVisuals": [
    {
      "id": "mv-cena-01-img",
      "type": "image",
      "anchorWord": "inteligencia",
      "content": {
        "promptScene": "Adult writing in notebook with laptop showing AI chat",
        "presetKey": "cinematic-01",
        "size": "1536x1024"
      }
    }
  ]
}
```

Se `promptScene` estiver presente e `imageUrl`/`url` ausente, o pipeline gera automaticamente via Image Lab.

### Fallback

Se a bridge falhar ou timeout, o pipeline **continua sem imagem** (nao bloqueia). O microVisual e emitido com um warning no debug report e sem asset. O admin pode gerar manualmente depois.

---

## Fase 3: Integracao com Pipeline V5/V3

### O que muda no V5

Hoje o V3/V5 usa a edge function `generate-slide-images` (Leonardo.ai + DALL-E, sem cache, sem auditoria). A integracao **substitui** essa funcao pela bridge do Image Lab.

### Mudanca no `step3-generate-audio.ts`

A funcao `generateImagesForSlides()` (que chama `generate-slide-images`) sera refatorada para:

1. Montar array de `{ scene_id: slide.id, prompt_scene: slide.contentIdea }`
2. Chamar `image-lab-pipeline-bridge` via `supabase.functions.invoke()`
3. Receber `storage_path` e mapear para `slide.imageUrl` (signed URL ou public URL)
4. Manter fallback: se bridge falhar, slide fica sem imagem (nao bloqueia pipeline)

### Deprecacao

Apos integracao confirmada, a edge function `generate-slide-images` pode ser marcada como deprecated e removida.

---

## Fase 4: Renderer V7 -- Signed URL para MicroVisuals tipo Image

### O que muda

O renderer V7 (`V7PhasePlayer`) precisa resolver `storage_path` -> signed URL para microVisuals do tipo `image-flash` que vem do Image Lab.

Hoje microVisuals do tipo image usam URLs diretas. Com a integracao, o conteudo tera `storagePath` em vez de `url`. O renderer deve:

1. Detectar se `content.storagePath` existe (campo do Image Lab)
2. Gerar signed URL via `supabase.storage.from("image-lab").createSignedUrl()`
3. Usar o componente `SignedImage` ja existente no `AdminImageLab.tsx` (reutilizar hook `useSignedUrl`)

---

## Fase 5: Admin UI -- Vinculacao de Cenas V7 a Assets Aprovados

### Nova funcionalidade no Admin Image Lab

Adicionar uma secao "Vincular a Cena V7" que permite:

1. Selecionar uma licao V7 existente
2. Ver as cenas da licao com seus microVisuals `image`
3. Arrastar/selecionar um asset aprovado para vincular a uma cena
4. Salvar a vinculacao (update no `content` da licao)

Isso permite fluxo manual (curadoria humana) alem do automatico (pipeline bridge).

---

## Sequencia de Implementacao

| Ordem | Fase | Dependencia | Estimativa |
|-------|------|-------------|------------|
| 1 | Edge Function `image-lab-pipeline-bridge` | Nenhuma | Nova edge function |
| 2 | Integracao V7-vv (pos-TTS image gen) | Fase 1 | Modificar `v7-vv/index.ts` |
| 3 | Integracao V5/V3 (substituir `generate-slide-images`) | Fase 1 | Modificar `step3-generate-audio.ts` |
| 4 | Renderer V7 signed URL | Fase 2 | Modificar renderer + hook |
| 5 | Admin UI vinculacao manual | Fase 4 | Nova secao no Image Lab |

---

## Arquivos Impactados

| Arquivo | Acao |
|---------|------|
| `supabase/functions/image-lab-pipeline-bridge/index.ts` | **NOVO** -- bridge server-to-server |
| `supabase/functions/v7-vv/index.ts` | Adicionar etapa de geracao de imagens pos-TTS |
| `src/lib/lessonPipeline/step3-generate-audio.ts` | Refatorar para usar bridge em vez de `generate-slide-images` |
| `src/lib/lessonPipeline/types.ts` | Adicionar `promptScene` ao V3Slide |
| `src/components/v7/V7PhasePlayer.tsx` (ou similar) | Resolver `storagePath` -> signed URL |
| `src/pages/AdminImageLab.tsx` | Adicionar secao de vinculacao manual V7 |
| `supabase/config.toml` | Registrar nova function `image-lab-pipeline-bridge` |

---

## Riscos e Mitigacoes

| Risco | Mitigacao |
|-------|----------|
| Bridge timeout aumenta tempo do pipeline V7 | Fallback nao-bloqueante: pipeline continua sem imagem |
| Custo de geracao duplicado se prompts nao forem identicos | Cache hash do Image Lab elimina duplicatas identicas |
| `generate-slide-images` (legada) em uso por flows antigos | Manter ativa ate confirmar que bridge cobre todos os casos |
| Signed URLs expiram (1h) durante reproducao longa | Renderer pode renovar signed URL se expirado (lazy refresh) |
