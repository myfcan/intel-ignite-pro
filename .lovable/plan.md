
## Plano Corrigido: Auditoria E2E Real do C12.1

### Diagnostico Factual (Provado com Dados)

O pipeline V7-vv gera output CORRETO (confirmado no run `8541bd3c`):
- `phases[0].anchorActions`: 2 triggers (generico@4.272s frameIndex:1, premium@9.067s frameIndex:2)
- `phases[0].visual.type`: "image-sequence" com 3 frames e storagePath validos

POREM: **zero lessons v7 existem na tabela `lessons`**. Os 3 runs completed (`8541bd3c`, `2e52c764`, `49a271fc`) registraram lesson_ids que NAO existem no banco. O INSERT (L7149-7167 do edge function) retorna ID mas a row desaparece.

- Sem trigger na tabela `lessons` que delete rows
- Edge function usa `SUPABASE_SERVICE_ROLE_KEY` (contorna RLS)
- Enum `difficulty_level` aceita os valores enviados

### Causa Raiz Provavel

O INSERT no edge function usa `.insert({...}).select('id').single()`. Se PostgREST retorna um ID, a row DEVERIA existir. Hipoteses restantes:
1. O edge function roda em ambiente diferente do que estamos lendo (improvavel — `pipeline_executions` e `lessons` estao no mesmo schema)
2. Ha um constraint ou policy que faz o INSERT parecer suceder mas nao persiste (ex: RLS com `SECURITY DEFINER` no service role nao se aplica — service_role bypassa RLS por design)
3. Bug no PostgREST: `.select('id').single()` retorna dados do INSERT mas um conflito silencioso reverte

### Plano de Execucao (5 Fases)

**Fase 0 — Resolver Persistencia (BLOCKER)**

1. Chamar a edge function `v7-vv` com o JSON de referencia image-sequence e `generate_audio: true`
2. IMEDIATAMENTE apos o retorno, consultar `SELECT * FROM lessons WHERE id = '<returned_id>'`
3. Se a row NAO existir: adicar log detalhado no edge function ANTES e DEPOIS do INSERT para capturar o erro real
4. Se necessario: usar `INSERT` direto via SQL (service_role) em vez de PostgREST client, como fallback

Patch minimo se INSERT falhar silenciosamente:
- Adicionar log explicitio: `console.log('[V7-vv] INSERT result:', JSON.stringify({data: lesson, error: lessonError}))`
- Se o problema persistir: substituir `.insert().select().single()` por `.insert()` seguido de `.select().eq('id', ...).single()` para confirmar persistencia

**Fase 1 — Confirmar Lesson no Banco**

Apos resolver Fase 0:
1. Consultar `lessons` WHERE id = nova lesson
2. Extrair e mostrar:
   - `content->'phases'->0->'anchorActions'` (2 triggers com keywordTime)
   - `content->'phases'->0->'visual'->'type'` = "image-sequence"
   - `content->'phases'->0->'visual'->'frames'` (3 frames)
   - `audio_url` preenchido
   - `word_timestamps` preenchido

**Fase 2 — Abrir Player e Capturar Logs Runtime**

1. Navegar para `/admin/v7/play/{lessonId}?debug=1`
2. Iniciar playback com audio
3. Capturar logs:
   - `IMAGE_SEQUENCE_START` -> mode
   - `C12.1_IMAGE_SEQUENCE_MODE_INIT` -> mode (DEVE ser "anchor")
   - `C12.1_IMAGE_SEQUENCE_FRAME_TRIGGER` x2 (generico + premium)
   - `C12.1_IMAGE_SEQUENCE_FRAME_RENDER` x3 (frame 0, 1, 2)

**Fase 3 — Validacao Temporal**

1. Ler `keywordTime` do DB para "generico" e "premium"
2. Comparar com `currentTime` nos logs FRAME_TRIGGER
3. Tolerancia: +/- 0.3s
4. Verificar que gap entre triggers >= 2.5s (compativel com narracao)

**Fase 4 — Teste de Seek**

1. Seek para tempo apos "generico" mas antes de "premium"
2. Confirmar frameIndex=1 via log `C12.1_IMAGE_SEQUENCE_SEEK_RESYNC`
3. Seek para tempo apos "premium"
4. Confirmar frameIndex=2
5. Seek para tempo ANTES de "generico"
6. Confirmar frameIndex=0

**Fase 5 — Fallback/Diagnostico (se falhar)**

Se MODE_INIT = "timer":
1. Verificar se `phase.anchorActions` esta no path que o Player le (nao em `phase.scenes[0].anchorActions`)
2. Verificar se audio contem literalmente "generico" e "premium" nos word_timestamps
3. Verificar se normalizacao de tags `[confiante]` remove palavras dos timestamps
4. Apontar patch minimo com arquivo e linha

### Detalhes Tecnicos

**Arquivos envolvidos:**
- `supabase/functions/v7-vv/index.ts` L7149-7177: INSERT na tabela lessons (BLOCKER principal)
- `src/components/lessons/v7/cinematic/V7PhasePlayer.tsx` L603-610: deteccao hasFrameTriggers
- `src/components/lessons/v7/cinematic/V7ImageSequenceRenderer.tsx`: renderer que recebe frameIndex

**Dados ja confirmados no output_data (run 8541bd3c):**

```text
anchorActions: [
  { id: "trigger-frame-1", keyword: "genérico", keywordTime: 4.272, payload: { frameIndex: 1 }, type: "trigger" },
  { id: "trigger-frame-2", keyword: "premium", keywordTime: 9.067, payload: { frameIndex: 2 }, type: "trigger" }
]
visual: {
  type: "image-sequence",
  frames: [
    { id: "frame-0", storagePath: "63154c37-.../0.png" },
    { id: "frame-1", storagePath: "2e32f87f-.../0.png" },
    { id: "frame-2", storagePath: "5b4002f6-.../0.png" }
  ]
}
```

**Criterio final PASS/FAIL:**
- PASS: MODE_INIT=anchor + 2 FRAME_TRIGGER em tempos separados (>=2.5s) + SEEK_RESYNC funcional
- FAIL: qualquer desvio, com causa raiz identificada e patch minimo
