
# Plano de Implementacao C12.1 — Hardening de Confiabilidade + Image Sequence

## Estado Atual Real (Dados do Banco e Codigo)

### Violacoes Encontradas ANTES da Implementacao

| Invariante | Status Atual | Evidencia |
|---|---|---|
| C12.1_RETRY_POLICY (max 3 attempts) | **VIOLADO** | Job `00d7eeb6` tem **5 attempts**, job `82317431` tem **4 attempts** |
| C12.1_CIRCUIT_BREAKER | **NAO EXISTE** | Zero codigo ou tabela para rastrear circuit state |
| C12.1_NO_STUCK_JOBS | **PARCIAL** | pg_cron ativo (`*/5 * * * *`), mas threshold eh 10min, nao 120s |
| C12.1_SLO_GUARD | **NAO EXISTE** | pipeline-bridge nao verifica fail_rate nem latencia antes de gerar |
| C12.1_CACHE_GUARD | **OK** | Hash SHA-256 + cache check funciona (0 cache_hits registrados, mas logica existe) |
| image-sequence | **NAO EXISTE** | Zero referencias no codebase |

### Codigo Atual Real

**Fallback (image-lab-generate/index.ts linhas 323-371)**: Existe fallback Gemini->OpenAI apenas para TIMEOUT, mas SEM limite de attempts. Um job pode acumular attempts indefinidamente.

**Cron (pg_cron)**: 2 jobs ativos rodando a cada 5 minutos chamando `cleanup_stale_image_attempts()` que limpa processing > 10min e queued > 30min.

**Pipeline Bridge (image-lab-pipeline-bridge/index.ts)**: Nao tem retry, nao tem fallback, nao tem SLO check. Falha unica = failed definitivo.

---

## Parte 1 — Tabela `image_lab_circuit_state`

Nova tabela para rastrear circuit breaker por provider.

```sql
CREATE TABLE public.image_lab_circuit_state (
  provider TEXT PRIMARY KEY,
  state TEXT NOT NULL DEFAULT 'CLOSED' CHECK (state IN ('CLOSED','OPEN','HALF_OPEN')),
  fail_count INTEGER NOT NULL DEFAULT 0,
  total_count INTEGER NOT NULL DEFAULT 0,
  last_failure_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  cooldown_until TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO image_lab_circuit_state (provider) VALUES ('openai'), ('gemini');
```

RLS: admin-only (mesmo padrao das tabelas image_*).

---

## Parte 2 — Edge Function `image-lab-generate/index.ts`

### 2.1 C12.1_RETRY_POLICY

Antes de criar um novo attempt, contar attempts existentes:

```typescript
const { count } = await supabase
  .from("image_attempts")
  .select("id", { count: "exact", head: true })
  .eq("job_id", job_id);

if (count >= 3) {
  return Response({ error_code: "MAX_ATTEMPTS_EXCEEDED" }, 429);
}
```

Fluxo completo:
1. Tentativa 1: provider original
2. Se TIMEOUT -> Tentativa 2: retry no MESMO provider
3. Se falhar novamente -> Tentativa 3: fallback para OUTRO provider
4. Se falhar -> `status = 'failed'` definitivo

### 2.2 C12.1_CIRCUIT_BREAKER

Antes de gerar, consultar `image_lab_circuit_state`:

```typescript
const { data: circuit } = await supabase
  .from("image_lab_circuit_state")
  .select("*")
  .eq("provider", actualProvider)
  .single();

if (circuit.state === "OPEN" && new Date() < new Date(circuit.cooldown_until)) {
  // Provider bloqueado — forcar fallback
  actualProvider = actualProvider === "openai" ? "gemini" : "openai";
}
```

Apos cada attempt (sucesso ou falha), atualizar contadores e avaliar transicao de estado:
- `fail_count / total_count > 0.4` nos ultimos 20 -> OPEN (cooldown 10min)
- Apos cooldown -> HALF_OPEN (1 request teste)
- Se teste OK -> CLOSED
- Se teste falha -> OPEN novamente

### 2.3 Metadata expandido na resposta

Adicionar ao response JSON:
```json
{
  "retry_count": 2,
  "fallback_used": true,
  "circuit_state": "CLOSED"
}
```

---

## Parte 3 — Edge Function `image-lab-pipeline-bridge/index.ts`

### 3.1 C12.1_SLO_GUARD

No inicio da bridge, antes de processar scenes[], consultar KPIs:

```typescript
const { data: kpis } = await supabase
  .from("image_lab_kpis_last_7d")
  .select("*")
  .single();

const { data: stuckJobs } = await supabase
  .from("image_jobs")
  .select("id", { count: "exact", head: true })
  .eq("status", "processing");

if (
  kpis.first_pass_accept_rate < 75 || // fail_rate > 25%
  (kpis.avg_latency_openai > 60000 && kpis.avg_latency_gemini > 60000) ||
  stuckJobs > 0
) {
  return Response({ ok: false, reason: "SLO_VIOLATION", kpis }, 503);
}
```

### 3.2 Retry + Fallback na Bridge

Aplicar a mesma logica de retry (max 3 attempts) e circuit breaker que a funcao principal.

---

## Parte 4 — Cleanup Function Update

Alterar `cleanup_stale_image_attempts()` para usar threshold de **120s** (2min) em vez de 10min:

```sql
WHERE status = 'processing'
  AND created_at < now() - interval '2 minutes';
```

---

## Parte 5 — Contrato C12.1_PIPELINE_IMAGE_SEQUENCE

### 5.1 Schema Update (`src/types/V7ScriptInput.ts`)

Adicionar `'image-sequence'` ao tipo `V7VisualType`:

```typescript
export type V7VisualType =
  | 'number-reveal'
  // ... existentes ...
  | 'image-sequence';  // NOVO C12.1

export interface V7ImageSequenceFrame {
  id: string;
  promptScene: string;
  durationMs: number; // >= 1000
  presetKey?: string;  // default "cinematic-01"
}

export interface V7ImageSequenceContent {
  frames: V7ImageSequenceFrame[];
}
```

### 5.2 Validacao no Input (`validateV7ScriptInput`)

Adicionar regras:
- `image-sequence` so permitido em `scene.type === "narrative"`
- `frames[]` deve existir e ter 1-3 elementos
- Cada frame: `promptScene` nao-vazio, `durationMs >= 1000`
- Soma total `durationMs >= 2000`
- Proibido coexistir com `microVisual.type === "image"` na mesma cena

### 5.3 DryRun Update (`v7-vv/index.ts`)

Na funcao `executeDryRun`, adicionar validacao de `image-sequence`:

```typescript
if (scene.visual?.type === "image-sequence") {
  if (!["narrative"].includes(scene.type)) {
    errors.push({ code: "VALIDATION_ERROR", message: "image-sequence only allowed in narrative scenes" });
  }
  const frames = scene.visual.frames || [];
  if (frames.length === 0 || frames.length > 3) {
    errors.push({ code: "VALIDATION_ERROR", message: "image-sequence requires 1-3 frames" });
  }
  // ... validar cada frame
}
```

### 5.4 Novo Componente `ImageSequenceRenderer`

Arquivo: `src/components/lessons/v7/cinematic/phases/V7ImageSequenceRenderer.tsx`

Comportamento:
- Recebe `frames[]` com `storagePath` (preenchido pelo Step 4.9 ou V7SceneLinker)
- Usa `useSignedUrl` para resolver cada frame
- Crossfade entre frames usando `framer-motion` (AnimatePresence)
- Preload do proximo frame via `new Image().src`
- Respeita `durationMs` por frame
- Fallback: se imagem falhar, exibe placeholder neutro com gradiente
- Debug logs: `IMAGE_SEQUENCE_START`, `IMAGE_SEQUENCE_FRAME_RENDER`, `IMAGE_SEQUENCE_END`

### 5.5 Integracao no Renderer (`V7PhasePlayer.tsx`)

Dentro do switch de `visual.type`, adicionar case para `image-sequence`:

```typescript
case 'image-sequence':
  return <V7ImageSequenceRenderer
    frames={visual.content.frames}
    effects={visual.effects}
    phaseId={phase.id}
    currentTime={currentTime}
  />;
```

---

## Parte 6 — Contrato Doc Update

Criar `docs/contracts/C12_1_HARDENING.md` com todas as invariantes formais, error codes novos, e metricas.

Error codes novos:
- `MAX_ATTEMPTS_EXCEEDED` — job ja tem 3 attempts
- `SLO_VIOLATION` — KPIs fora do threshold
- `CIRCUIT_OPEN` — provider temporariamente bloqueado

---

## Parte 7 — Debug Logs (v7DebugLogger)

Adicionar tags ao `v7DebugLogger.ts`:

```typescript
pushV7DebugLog('IMAGE_SEQUENCE_START', { phaseId, frameCount, currentTime });
pushV7DebugLog('IMAGE_SEQUENCE_FRAME_RENDER', { phaseId, frameId, frameIndex, currentTime });
pushV7DebugLog('IMAGE_SEQUENCE_END', { phaseId, currentTime });
```

---

## Parte 8 — Backward Compatibility

| Aspecto | Impacto |
|---|---|
| Cenas existentes (image-flash, icon, etc.) | **ZERO** — nenhuma alteracao |
| V7SceneType | **ZERO** — image-sequence eh V7VisualType, nao SceneType |
| Contratos C01-C11 | **ZERO** — nenhuma alteracao |
| C12_AUTH_GATE | **ZERO** — mantido |
| C12_STORAGE_PRIVACY | **ZERO** — mantido |
| DryRun existente | **ADITIVO** — novas validacoes, nao remove nenhuma |

---

## Sequencia de Implementacao

1. Criar tabela `image_lab_circuit_state` (migration)
2. Atualizar `cleanup_stale_image_attempts` (migration — threshold 120s)
3. Atualizar `image-lab-generate/index.ts` (retry policy + circuit breaker)
4. Atualizar `image-lab-pipeline-bridge/index.ts` (SLO guard + retry)
5. Atualizar `src/types/V7ScriptInput.ts` (image-sequence types)
6. Atualizar `supabase/functions/v7-vv/index.ts` (dry-run validation)
7. Criar `V7ImageSequenceRenderer.tsx`
8. Integrar no renderer (`V7PhasePlayer.tsx`)
9. Atualizar `v7DebugLogger.ts` (novas tags)
10. Criar `docs/contracts/C12_1_HARDENING.md`

---

## Limites da Fase 1

- Maximo 3 frames por cena
- Sem geracao paralela de frames
- Apenas preset `cinematic-01` ativo
- Circuit breaker baseado em contagem simples (sem sliding window sofisticado)
- image-sequence apenas em `scene.type="narrative"`
