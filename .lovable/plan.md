

# Plano: Migrar para eleven_multilingual_v2 + Alice + Request Stitching

## Resumo

Trocar o modelo de `eleven_v3` (Taciana) para `eleven_multilingual_v2` (Alice) em todas as funções de áudio, implementando **request stitching** via `previous_text`/`next_text` para manter sotaque PT-BR consistente entre segmentos.

## Mudanças

### 1. `supabase/functions/v8-generate-section-audio/index.ts`
- `VOICE_ID` → `Xb7hH8MSUJpSbSDYk0k2` (Alice)
- `MODEL_ID` → `eleven_multilingual_v2`
- `VOICE_SETTINGS` → `{ stability: 0.5, similarity_boost: 0.75, style: 0.3, use_speaker_boost: true }`
- Aceitar `previousText` e `nextText` opcionais no body da request
- Passar `previous_text` e `next_text` para a API ElevenLabs
- Strip ALL `[...]` tags do texto (v2 ignora audio tags)
- Remover `language_code: 'pt'` (v2 detecta pelo texto; Alice não tem metadata PT)

### 2. `supabase/functions/v8-reprocess-audio/index.ts`
- Mesmas mudanças de modelo/voz/settings
- No loop de seções, passar texto da seção anterior como `previous_text` e da próxima como `next_text`
- Strip ALL `[...]` tags

### 3. `src/pages/AdminV8Create.tsx` (duas instâncias de `generateOneAudio`)
- Alterar `generateOneAudio` para aceitar `previousText` e `nextText`
- No loop de seções, capturar texto da seção anterior/próxima e passar junto
- Aplicar nas duas instâncias (~linha 306 e ~linha 838)

### 4. `supabase/functions/generate-audio-with-timestamps/index.ts`
- Modelo padrão → `eleven_multilingual_v2`
- Voice padrão → Alice
- Já tem lógica v2/v3 — inverter o flag `useV3 = false`

### 5. `supabase/functions/v8-refine-content/index.ts`
- Regra 6 do prompt: remover instrução de preservar tags de prosódia `[excited]`, `[pause]` etc. (v2 não as usa)
- Manter preservação de `[QUIZ]`, `[PLAYGROUND]`, `[EXERCISE:*]`

### 6. `src/lib/v8TextSanitizer.ts`
- Nenhuma mudança necessária — `stripProsodyTagsForDisplay` já existe e funciona

## Detalhes Técnicos

**Request Stitching** — a documentação oficial confirma que `previous_text`/`next_text` fornecem contexto fonético para o modelo v2, mantendo prosódia e sotaque consistentes entre segmentos sem gerar áudio para o texto de contexto. Usa-se ~últimas 3 frases da seção anterior e ~primeiras 3 frases da próxima.

**Strip de tags** — como v2 ignora `[excited]`, `[pause]` etc., todas as bracket tags serão removidas antes do envio para evitar que apareçam como texto falado.

**Voice Settings** — stability 0.5 (mais expressivo que 0.75) + style 0.3 + speaker_boost para aproveitar a "amplitude emocional" que a documentação do v2 promete.

