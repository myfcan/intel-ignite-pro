
# Tornar eleven_v3 Mandatório para V7-vv

## Problema

As tags de emoção (`[excited]`, `[pause]`, `[whispers]`) estão sendo **lidas em voz alta** pelo TTS porque:

1. A edge function `v7-vv` hardcoda `model_id: 'eleven_multilingual_v2'` (linha 3164) -- este modelo trata `[tags]` como texto literal
2. O adapter `v7vvPayloadAdapter.ts` não passa `use_emotion_tags` no payload
3. O toggle na UI (`AdminV7Create.tsx`) começa como `false` e não é enviado ao pipeline
4. O pipeline client-side (`step3-generate-audio.ts`) usa condicional `useEmotionTags ? 'eleven_v3' : ...` em vez de forçar v3

## Solução

Forçar `eleven_v3` em **todos** os caminhos de geração de áudio V7-vv.

---

### Alterações

**1. Edge Function `supabase/functions/v7-vv/index.ts`** (principal)
- Trocar `model_id: 'eleven_multilingual_v2'` por `model_id: 'eleven_v3'` na função de geração de áudio (~linha 3164)
- Ajustar `voice_settings.style` para `0.3` (expressividade do v3)
- Adicionar sanitização: antes de enviar ao ElevenLabs, remover SSML `<break/>` (v3 não suporta), preservar `[tags]`

**2. Pipeline client-side `src/lib/lessonPipeline/v7/steps/step3-generate-audio.ts`**
- Remover condicional: sempre enviar `use_emotion_tags: true` e `model_id: 'eleven_v3'`

**3. Adapter `src/services/v7vvPayloadAdapter.ts`**
- Não precisa mudar -- o modelo é decidido na edge function, não no payload

**4. UI `src/pages/AdminV7Create.tsx`**
- Remover o toggle de seleção de modelo (já que v3 é mandatório)
- Substituir por um badge fixo indicando "eleven_v3 - Audio Tags Ativas"
- Setar `useEmotionTags` como `true` por padrão (hardcoded)

**5. Tipos `src/lib/lessonPipeline/v7/types.ts`**
- Marcar `useEmotionTags` como deprecated ou remover (agora é sempre `true`)

**6. Edge function `supabase/functions/generate-audio-with-timestamps/index.ts`**
- Já suporta v3 via flag -- nenhuma mudança necessária (já funciona quando `use_emotion_tags: true`)

---

### Detalhes Tecniicos

Na edge function `v7-vv`, a mudança crítica é:

```text
ANTES:  model_id: 'eleven_multilingual_v2'
DEPOIS: model_id: 'eleven_v3'
```

E adicionar sanitização do texto antes do envio:

```text
- Remover <break time="..."/> (SSML nao funciona no v3)
- Preservar [excited], [pause], [whispers] etc.
- Manter pontuacao natural para pausas
```

### Impacto

- Todas as aulas V7-vv futuras usarao eleven_v3 automaticamente
- Tags de emoção serao interpretadas corretamente (nao lidas em voz alta)
- Aulas existentes nao sao afetadas (ja foram geradas)
- Para regenerar audio de aulas existentes, usar o fluxo de reprocess
