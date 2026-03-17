

## Alinhar Voz do V10 com o Padrão V8 (Alice)

O V10 usa a voz **Taciana** (`oqUwsXKac3MSo4E51ySV`) com modelo `eleven_v3`, enquanto o V8 usa **Alice** (`Xb7hH8MSUJpSbSDYk0k2`) com modelo `eleven_multilingual_v2` e voice settings otimizadas. Dois arquivos precisam ser ajustados.

---

### Alterações

**1. `supabase/functions/v10-generate-audio/index.ts`**
- Voice ID: `oqUwsXKac3MSo4E51ySV` → `Xb7hH8MSUJpSbSDYk0k2` (Alice)
- Model: `eleven_v3` → `eleven_multilingual_v2`
- Style: `0.5` → `0.3`
- (stability 0.5, similarity_boost 0.75, use_speaker_boost true — já iguais)

**2. `supabase/functions/v10-process-anchors/index.ts`**
- Voice ID default: `oqUwsXKac3MSo4E51ySV` → `Xb7hH8MSUJpSbSDYk0k2` (Alice)
- Model: `eleven_multilingual_v2` — já correto, manter
- Voice settings: `stability 0.6, similarity_boost 0.8, speed 0.9` → `stability 0.5, similarity_boost 0.75, style 0.3, use_speaker_boost true` (padrão V8)
- Remover `speed` e `language_code` (V8 não usa)

Nenhuma alteração em banco ou frontend — apenas configuração de voz nas duas edge functions.

