

## Auditoria Sistêmica V10 Pipeline — Resultado com Dados Reais

---

### MELHORIAS JÁ APLICADAS (CONFIRMADAS NO CÓDIGO)

| Melhoria | Status | Evidência |
|---|---|---|
| Voice ID Alice no `v10-generate-audio` | APLICADA | Linha 10: `const VOICE_ID = 'Xb7hH8MSUJpSbSDYk0k2'` |
| Voice ID Alice no `v10-process-anchors` | APLICADA | Linha 28: `const VOICE_ID_DEFAULT = 'Xb7hH8MSUJpSbSDYk0k2'` |
| Model `eleven_multilingual_v2` no V10 | APLICADA | Linha 11 de ambas funções |
| Voice settings padrão Alice no V10 | APLICADA | Linhas 12-17: `stability: 0.5, similarity_boost: 0.75, style: 0.3, use_speaker_boost: true` |
| Invalidação de áudio ao salvar script (Stage5) | APLICADA | Linha 222: `audio_url: null, duration_seconds: 0` |
| Invalidação de áudio ao salvar Part A/C (Stage5) | APLICADA | Linha 398: `audio_url: null, duration_seconds: 0` |
| Invalidação de áudio no ImportFullScriptModal | APLICADA | Linhas 225, 243, 261: `audio_url: null, duration_seconds: 0` |
| Fix `reprocessExisting` no dependency array | APLICADA | Linha 362: `}, [steps, editingScripts, pipeline.id, pipeline.lesson_id, reprocessExisting]);` |

---

### GAPS AINDA EXISTENTES (DADOS REAIS)

#### GAP 1 — Prompts AI em `v10-generate-audio` referenciam "Taciana" (3 ocorrências)

**Arquivo:** `supabase/functions/v10-generate-audio/index.ts`

```typescript
// Linha 316:
systemPrompt = `Você é uma narradora brasileira chamada Taciana, com voz amigável e envolvente. Gere um script...

// Linha 325:
systemPrompt = `Você é uma narradora brasileira chamada Taciana, com voz amigável e envolvente. Gere um script...

// Linha 345:
const systemPrompt = `Você é uma narradora brasileira chamada Taciana, com voz amigável e envolvente. Gere um script...
```

**Impacto:** Scripts gerados pela IA terão persona "Taciana" mas a voz TTS é Alice. Inconsistência de persona.
**Correção:** Substituir "Taciana" por "Alice" nas 3 linhas.

---

#### GAP 2 — `v8-generate/index.ts` usa Taciana + modelo + settings divergentes

**Arquivo:** `supabase/functions/v8-generate/index.ts`, linhas 12-17

```typescript
const VOICE_ID = 'oqUwsXKac3MSo4E51ySV'; // Taciana PT-BR nativa (professional)
const MODEL_ID = 'eleven_v3';
const VOICE_SETTINGS = {
  stability: 0.75,
  similarity_boost: 0.75,
};
```

**Divergência vs padrão Alice:** Voice ID errado, modelo errado (`eleven_v3` vs `eleven_multilingual_v2`), settings incompletos (falta `style: 0.3` e `use_speaker_boost: true`), `stability` errado (0.75 vs 0.5).

---

#### GAP 3 — 8 outros arquivos ainda com Voice ID Taciana (`oqUwsXKac3MSo4E51ySV`)

| Arquivo | Linha |
|---|---|
| `supabase/functions/v7-regenerate-audio/index.ts` | 190 |
| `supabase/functions/v7-vv/index.ts` | 6873 |
| `supabase/functions/processar-aula/index.ts` | 15 |
| `supabase/functions/generate-multiple-audios/index.ts` | 28 |
| `supabase/functions/elevenlabs-tts-contextual/index.ts` | 95 |
| `supabase/functions/generate-lesson-audio/index.ts` | 151 |
| `src/lib/autoGenerateAudio.ts` | 147 |
| `src/lib/lessonPipeline/step3-generate-audio.ts` | 50, 263 |
| `src/lib/lessonPipeline/v7/index.ts` | 58 |
| `src/lib/lessonPipeline/v7/steps/step1-validate.ts` | 94 |

---

#### GAP 4 — `generate-audio-elevenlabs/index.ts` usa Alice mas modelo errado

**Arquivo:** `supabase/functions/generate-audio-elevenlabs/index.ts`, linhas 35-38

```typescript
const voiceId = voice_id || 'Xb7hH8MSUJpSbSDYk0k2';
const modelId = model_id || 'eleven_v3';
```

Voice ID está correto (Alice), mas o modelo default é `eleven_v3` em vez de `eleven_multilingual_v2`.

---

#### GAP 5 — `processar-aula/index.ts` variável nomeada "ALICE" mas com ID de Taciana

```typescript
// Linha 15:
const ALICE_VOICE_ID = 'oqUwsXKac3MSo4E51ySV'; // Taciana PT-BR nativa (professional)
```

Variável diz "ALICE" mas o valor é o ID da Taciana. Bug de naming + valor incorreto.

---

### PLANO DE CORREÇÃO (11 arquivos)

**1. `v10-generate-audio/index.ts`** — Substituir "Taciana" por "Alice" nos prompts AI (linhas 316, 325, 345).

**2. `v8-generate/index.ts`** — Atualizar para: Voice ID `Xb7hH8MSUJpSbSDYk0k2`, Model `eleven_multilingual_v2`, Settings `{ stability: 0.5, similarity_boost: 0.75, style: 0.3, use_speaker_boost: true }`.

**3-11. Funções legacy** — Atualizar default voice ID para `Xb7hH8MSUJpSbSDYk0k2` (Alice) em:
- `v7-regenerate-audio/index.ts`
- `v7-vv/index.ts`
- `processar-aula/index.ts`
- `generate-multiple-audios/index.ts`
- `elevenlabs-tts-contextual/index.ts`
- `generate-lesson-audio/index.ts`
- `generate-audio-elevenlabs/index.ts` (fix modelo para `eleven_multilingual_v2`)
- `src/lib/autoGenerateAudio.ts`
- `src/lib/lessonPipeline/step3-generate-audio.ts`
- `src/lib/lessonPipeline/v7/index.ts`
- `src/lib/lessonPipeline/v7/steps/step1-validate.ts`

Nenhuma alteração de banco de dados ou frontend necessária. Todas as correções são substituições de constantes em edge functions e libs client-side.

