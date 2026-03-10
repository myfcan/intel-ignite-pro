

## Plano: Otimizar geração de áudio ElevenLabs

### Problema atual
- Dual generation descarta Gen1 cegamente — dobra custo sem critério de qualidade
- Tags emocionais inline (`[excited]`, `[thoughtful]`) não são usadas no texto da narração
- Prefix tag genérica `[warm, engaging tone]` não substitui emoção contextual

### Mudanças propostas

#### 1. Remover dual generation — usar chamada única
Em todas as edge functions (`v8-generate`, `v8-reprocess-audio`, `processar-aula`, e demais), remover a Gen1 descartada. Uma chamada = um áudio. Reduz custo de créditos pela metade.

**Justificativa**: Sem critério de seleção automática (análise de qualidade, comparação de pitch, etc.), descartar Gen1 é puramente aleatório — não há evidência de que Gen2 seja melhor.

#### 2. Manter prefix tag de sotaque
Manter `[Brazilian Portuguese accent]` como prefix — isso é válido e documentado para forçar fonética PT-BR no eleven_v3.

#### 3. Tags emocionais inline no pipeline de narração (V8)
No step de geração de narração (onde a IA cria o texto da aula), instruir o modelo a incluir tags emocionais inline no próprio texto, como:

```
[excited] Oi, pessoal! Eu sou a Liv.
[thoughtful] Em poucos minutos você vai entender...
[energetic] Você vai aprender o que é um prompt...
```

Isso é o que a UI da ElevenLabs faz (conforme seu screenshot). As tags seriam geradas pelo LLM no step de narração e passadas diretamente ao TTS.

**Arquivos afetados:**
- `supabase/functions/v8-generate/index.ts` — remover dual gen, manter single call
- `supabase/functions/v8-reprocess-audio/index.ts` — idem
- `supabase/functions/processar-aula/index.ts` — idem
- `supabase/functions/generate-audio-with-timestamps/index.ts` — idem
- `supabase/functions/elevenlabs-tts-contextual/index.ts` — idem
- `supabase/functions/generate-audio-elevenlabs/index.ts` — idem
- `supabase/functions/v7-vv/index.ts` — idem
- `supabase/functions/generate-lesson-audio/index.ts` — idem
- `supabase/functions/generate-multiple-audios/index.ts` — idem
- `supabase/functions/v7-generate-secret-audio/index.ts` — idem
- Prompt de narração no pipeline V8 (para incluir tags emocionais inline no texto gerado pela IA)

### Resultado
- **50% menos créditos** gastos por aula
- **Tags emocionais reais** no texto (como na UI do ElevenLabs)
- **Sotaque PT-BR forçado** via prefix tag
- Sem desperdício de recursos em geração descartada

