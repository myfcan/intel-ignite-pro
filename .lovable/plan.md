

## Correção: Remover `language_code: "pt"` de TODAS as Edge Functions

### Causa Raiz Confirmada
O parâmetro `language_code: "pt"` força o modelo `eleven_v3` a usar fonética PT-PT genérica, sobrescrevendo o sotaque nativo PT-BR da voz Taciana.

### Arquivos Afetados (10 — auditoria completa)

| # | Arquivo | Linha |
|---|---------|-------|
| 1 | `supabase/functions/v8-generate/index.ts` | 358 |
| 2 | `supabase/functions/v8-reprocess-audio/index.ts` | 75 |
| 3 | `supabase/functions/generate-audio-with-timestamps/index.ts` | 90 |
| 4 | `supabase/functions/elevenlabs-tts-contextual/index.ts` | 124 |
| 5 | `supabase/functions/generate-audio-elevenlabs/index.ts` | 59 |
| 6 | `supabase/functions/processar-aula/index.ts` | 214 |
| 7 | `supabase/functions/v7-vv/index.ts` | 3246 |
| 8 | `supabase/functions/generate-lesson-audio/index.ts` | 162 |
| 9 | `supabase/functions/generate-multiple-audios/index.ts` | 48 |
| 10 | `supabase/functions/v7-generate-secret-audio/index.ts` | 47 |

### Ação em cada arquivo
Remover a linha `language_code: "pt"` (ou `language_code: 'pt'`) do body JSON enviado à API ElevenLabs. A voz Taciana é nativamente PT-BR; sem esse parâmetro, o `eleven_v3` respeita o sotaque nativo da voz.

### Mudanças opcionais de voice_settings
Ajustar `stability` de `0.5` para `0.75` nos arquivos que usam `0.5`, para corresponder ao que foi validado com sucesso na UI do ElevenLabs (screenshot do usuário).

### Deploy
Todas as 10 edge functions serão re-deployadas após a remoção.

