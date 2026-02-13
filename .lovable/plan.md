

# AI Image Lab v0 -- Plano de Execucao Completo (Fase 0 + Fase 1)

## Estado Atual Verificado (dados reais do codigo)

- **Tabelas existentes**: NENHUMA relacionada a image lab (`image_jobs`, `image_assets`, `image_presets`, `image_attempts` -- NAO EXISTEM)
- **Bucket existente**: `lesson-audios`, `avatars`, `tts-cache` -- NAO EXISTE `image-lab`
- **Edge function existente**: `generate-slide-images/index.ts` usa `dall-e-2` e retorna base64 inline (viola politica de storage). Este arquivo NAO sera modificado.
- **Secrets confirmados**: `OPENAI_API_KEY` (configurada), `LOVABLE_API_KEY` (configurada)
- **Rota admin existente**: `/admin/test-images` (pagina antiga). Nova rota `/admin/image-lab` NAO EXISTE.
- **App.tsx**: 237 linhas, lazy imports em linhas 41-85, rotas admin em linhas 164-215

---

## Entregaveis (5 blocos)

### Bloco 1 -- Migracao SQL (4 tabelas + 1 bucket + 1 view + seed)

**1.1 Tabela `image_presets`**

| Coluna | Tipo | Default | Nota |
|---|---|---|---|
| id | uuid PK | gen_random_uuid() | |
| key | text NOT NULL | | ex: cinematic-01 |
| version | text NOT NULL | | ex: 1.0 |
| title | text NOT NULL | | |
| prompt_template | text NOT NULL | | com {{SCENE}} e {{STYLE_HINTS}} |
| default_size | text | '1024x1024' | |
| is_active | boolean | true | |
| created_at | timestamptz | now() | |

Constraint: UNIQUE(key, version)

**1.2 Tabela `image_jobs`**

| Coluna | Tipo | Default | Nota |
|---|---|---|---|
| id | uuid PK | gen_random_uuid() | |
| created_by | uuid nullable | | user_id do admin |
| status | text NOT NULL | 'queued' | queued/processing/completed/failed/approved/rejected |
| preset_id | uuid FK | | -> image_presets.id |
| preset_key | text | | redundancia para auditoria |
| preset_version | text | | redundancia para auditoria |
| provider | text | 'openai' | |
| model | text | 'gpt-image-1' | |
| size | text | '1024x1024' | |
| n | int | 1 | |
| prompt_base | text nullable | | |
| prompt_scene | text NOT NULL | | descricao da cena |
| prompt_final | text nullable | | montado pela edge function |
| hash | text nullable | | SHA256 para cache |
| cache_hit | boolean | false | |
| approved_asset_id | uuid nullable | | FK -> image_assets.id |
| latency_ms | int nullable | | |
| error_code | text nullable | | |
| error_message | text nullable | | |
| metadata | jsonb | '{}' | style_hints etc |
| created_at | timestamptz | now() | |
| updated_at | timestamptz | now() | |

Indices: (status, created_at DESC)

**1.3 Tabela `image_attempts`**

| Coluna | Tipo | Default | Nota |
|---|---|---|---|
| id | uuid PK | gen_random_uuid() | |
| job_id | uuid FK NOT NULL | | -> image_jobs.id |
| provider | text NOT NULL | | openai ou gemini |
| model | text NOT NULL | | ex: gpt-image-1 |
| status | text NOT NULL | 'processing' | processing/completed/failed |
| prompt_final | text NOT NULL | | prompt exato enviado |
| latency_ms | int nullable | | |
| cost_estimate | numeric nullable | | estimativa em USD |
| error_code | text nullable | | |
| error_message | text nullable | | |
| created_at | timestamptz | now() | |

Indice: (job_id, created_at DESC)

**1.4 Tabela `image_assets`**

| Coluna | Tipo | Default | Nota |
|---|---|---|---|
| id | uuid PK | gen_random_uuid() | |
| job_id | uuid FK NOT NULL | | -> image_jobs.id |
| attempt_id | uuid FK NOT NULL | | -> image_attempts.id |
| status | text NOT NULL | 'completed' | completed/approved/rejected |
| variation_index | int | 0 | |
| storage_bucket | text | 'image-lab' | |
| storage_path | text NOT NULL | | |
| public_url | text nullable | | |
| mime_type | text | 'image/png' | |
| width | int | | |
| height | int | | |
| sha256_bytes | text nullable | | hash do arquivo |
| hash | text nullable | | mesmo hash do job (cache) |
| created_at | timestamptz | now() | |

Indices: (hash), (status, created_at DESC)

**1.5 Storage Bucket**

- Nome: `image-lab`
- Public: true (para URLs diretas na UI admin)
- RLS: admin-only upload e read

**1.6 View `image_lab_kpis_last_7d`**

Calcula:
- `total_jobs`: total de jobs nos ultimos 7 dias
- `total_attempts`: total de attempts
- `first_pass_accept_rate`: % de jobs aprovados na primeira tentativa
- `avg_attempts_per_approved`: media de attempts por job aprovado
- `fail_rate_openai`: taxa de falha OpenAI
- `fail_rate_gemini`: taxa de falha Gemini
- `avg_latency_openai`: latencia media OpenAI
- `avg_latency_gemini`: latencia media Gemini

**1.7 Seed: Preset `cinematic-01@1.0`**

```text
Cinematic still frame, high realism, natural lighting, shallow depth of field, 35mm lens look, clean composition, no text, no watermarks. Scene: {{SCENE}}. {{STYLE_HINTS}}
```

**1.8 RLS**

Todas as 4 tabelas:
- Admin: ALL (via `has_role(auth.uid(), 'admin')`)
- Supervisor: SELECT + INSERT em `image_jobs` e `image_attempts` (pode gerar e visualizar, NAO pode aprovar)
- Storage: admin-only para upload; public read via signed URL

---

### Bloco 2 -- Edge Function `image-lab-generate`

Arquivo: `supabase/functions/image-lab-generate/index.ts`

**Input:**
```json
{
  "job_id": "uuid",
  "provider": "openai",
  "n": 1,
  "size": "1024x1024"
}
```

**Logica sequencial:**
1. Validar JWT e role admin/supervisor
2. Buscar `image_jobs` por `job_id`, validar status in (queued, failed, rejected)
3. Buscar preset associado via `preset_id`
4. Montar `prompt_final` = substituir `{{SCENE}}` e `{{STYLE_HINTS}}` no template
5. Calcular `hash = SHA256(provider + model + size + preset_key + preset_version + prompt_final)`
6. **Cache check**: buscar `image_assets` com `hash` igual e status in (approved, completed)
   - Se encontrar: marcar job `cache_hit=true`, `status=completed`, retornar asset existente
7. Criar registro em `image_attempts` com status=processing
8. Atualizar job status=processing
9. Chamar OpenAI Images API:
   - Endpoint: `https://api.openai.com/v1/images/generations`
   - Model: `gpt-image-1`
   - Size conforme parametro
   - response_format: `b64_json`
10. Upload do resultado para bucket `image-lab/{job_id}/{attempt_id}/0.png`
11. Obter URL publica do storage
12. Criar registro em `image_assets`
13. Atualizar `image_attempts` com status=completed, latency_ms
14. Atualizar `image_jobs` com status=completed, latency_ms, prompt_final, hash
15. Retornar `{ ok: true, job, assets, cache_hit: false }`

**Tratamento de erro:**
- Se API falhar: attempt status=failed, job status=failed, com error_code e error_message
- Timeout: 55s (edge function limit)

**Mapeamento de sizes (OpenAI gpt-image-1):**
- `1536x1024` (16:9 landscape)
- `1024x1024` (1:1 square)
- `1024x1536` (9:16 portrait)

**config.toml**: adicionar `[functions.image-lab-generate]` com `verify_jwt = false` (validacao manual no codigo)

---

### Bloco 3 -- Edge Function `image-lab-generate-batch`

Arquivo: `supabase/functions/image-lab-generate-batch/index.ts`

**Input:**
```json
{
  "job_id": "uuid",
  "plan": [
    { "provider": "openai", "n": 2 },
    { "provider": "gemini", "n": 2 }
  ],
  "size": "1024x1024"
}
```

**Logica:**
1. Validar JWT e role
2. Para cada item no plan, chamar a logica de geracao (reutilizando a mesma logica do `image-lab-generate`, mas internamente)
3. Para Gemini: usar Lovable AI Gateway (`https://ai.gateway.lovable.dev/v1/chat/completions`) com modelo `google/gemini-3-pro-image-preview` e `LOVABLE_API_KEY`
4. Executar em sequencia (nao paralelo, para evitar rate limit)
5. Retornar grid de todos os assets gerados

**config.toml**: adicionar `[functions.image-lab-generate-batch]` com `verify_jwt = false`

---

### Bloco 4 -- Pagina Admin `/admin/image-lab`

Arquivo: `src/pages/AdminImageLab.tsx`

**Layout:**

```text
+------------------------------------------+
| <- Back   AI Image Lab                    |
+------------------------------------------+
| [Form Panel]           | [KPIs Panel]    |
| Preset: [cinematic-01] | Jobs: 42        |
| Size: [16:9 v]         | Accept: 78%     |
| Brief: [textarea]      | Avg Lat: 2.1s   |
| Style Hints: [input]   | Fail OAI: 3%    |
| [Generate 1] [Gen 4]   | Fail Gem: 5%    |
+------------------------------------------+
| [Results Grid]                            |
| +------+ +------+ +------+ +------+     |
| | img1 | | img2 | | img3 | | img4 |     |
| | OAI  | | OAI  | | GEM  | | GEM  |     |
| | 1.8s | | 2.1s | | 1.5s | | 1.9s |     |
| |[Appr]| |[Rej] | |[Appr]| |[Rej] |     |
| +------+ +------+ +------+ +------+     |
+------------------------------------------+
| [Job History - Last 50]                   |
| Status | Preset | Provider | Lat | Thumb  |
| completed | cinematic-01 | openai | 1.8s |
| failed    | cinematic-01 | gemini | -    |
| approved  | cinematic-01 | openai | 2.3s |
+------------------------------------------+
```

**Componentes:**
- **Form**: Select de preset (carregado do DB), Select de size (16:9/1:1/9:16), Textarea para `prompt_scene`, Input para `style_hints`, Botao "Generate 1" e "Generate 4 (2+2)"
- **KPIs**: Dados da view `image_lab_kpis_last_7d`
- **Result Grid**: Imagens do job atual com provider, model, latency, botoes Approve/Reject
- **Job History**: Lista dos ultimos 50 jobs com status, thumbnail, metricas
- **Acoes**: Approve (UPDATE image_assets SET status='approved'), Reject, Retry (cria novo job copiando o anterior)

**Fluxo UI:**
1. Admin preenche form
2. Clica "Generate 1": INSERT em image_jobs com status=queued, chama edge function `image-lab-generate`
3. Clica "Generate 4": INSERT em image_jobs, chama `image-lab-generate-batch` com plan `[{openai:2},{gemini:2}]`
4. Aguarda resposta (loading state)
5. Exibe grid de resultados
6. Admin clica Approve em 1 asset -> UPDATE image_assets, UPDATE image_jobs.approved_asset_id
7. Demais assets do job marcados como rejected

---

### Bloco 5 -- Rota no App.tsx

Adicionar em App.tsx:
- Linha ~83: `const AdminImageLab = lazy(() => import("./pages/AdminImageLab"));`
- Linha ~215: `<Route path="/admin/image-lab" element={<AdminRoute><AdminImageLab /></AdminRoute>} />`

---

## Secao Tecnica

### Dependencias de Secrets
- `OPENAI_API_KEY`: ja configurada -- usada para gpt-image-1
- `LOVABLE_API_KEY`: ja configurada -- usada para Gemini via Lovable AI Gateway

### Gemini Image Generation (via Lovable AI Gateway)
- Endpoint: `https://ai.gateway.lovable.dev/v1/chat/completions`
- Model: `google/gemini-3-pro-image-preview`
- Auth: `Bearer ${LOVABLE_API_KEY}`
- Retorna imagem inline no response content

### Seguranca
- Edge functions validam JWT manualmente e verificam role admin/supervisor via `supabase.auth.getUser()` + query em `user_roles`
- Todas as tabelas com RLS: admin ALL, supervisor SELECT+INSERT (sem UPDATE em status para approved)
- Bucket `image-lab`: admin-only upload, public read

### O que NAO sera feito
- Nenhuma integracao com Pipeline V7
- Nenhum contrato C12 formal (apenas estrutura preparada)
- Nenhum retry automatico (apenas retry manual via UI)
- Nenhum auto-suggest de prompts
- Nenhuma modificacao no `generate-slide-images` existente

