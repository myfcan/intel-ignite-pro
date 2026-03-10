## Plano: Corrigir drift PT-PT removendo prefixo de idioma misto  
  
  
  
Atue como um engenheiro sênior responsável pelo runtime de todo o sistema e banco de dados, atue com obrigação de precisão técnica absoluta.

&nbsp;

REGRA DESTE PROMPT:  
  
Execute todo o plano, mas caso não execute por alguma razão, você é obrigado é dizer:  
Não implementei todo o plano ou não executei todas asa correções. 

&nbsp;

Você NÃO pode mentir.

Você NÃO pode supor.

Você NÃO pode responder com explicações genéricas.

Você NÃO pode omitir dados.

Você deve executar tudo com DADOS REAIS do código atual.

Você deve copiar e colar trechos REAIS do código.

Você deve usar logs reais e timestamps reais.

Se não souber algo, diga explicitamente: “NÃO LOCALIZADO NO CÓDIGO”.  
  
TUDO ISSO É MANDATÓRIO

### Problema confirmado

O texto enviado ao ElevenLabs começa com uma frase em inglês (`[Brazilian Portuguese accent]`) seguida de conteúdo em português. A documentação oficial diz explicitamente para não misturar idiomas num mesmo prompt. A voz Taciana já é PT-BR nativa — o sotaque vem dela, não de uma tag.

### Evidências da documentação oficial

1. **Help Center** ([https://help.elevenlabs.io/hc/en-us/articles/19581255545873](https://help.elevenlabs.io/hc/en-us/articles/19581255545873)):
  - "The accent comes from the voice you're using"
  - "avoid using multiple languages in a single prompt, as this can cause confusion"
2. **Blog accent emulation** ([https://elevenlabs.io/blog/eleven-v3-audio-tags-emulating-accents-with-precision](https://elevenlabs.io/blog/eleven-v3-audio-tags-emulating-accents-with-precision)):
  - Tags de sotaque são para MUDAR sotaque, não reforçar
  - "Accent emulation is the ability to shift a voice's pronunciation"
3. **API Reference** ([https://elevenlabs.io/docs/api-reference/text-to-speech/convert](https://elevenlabs.io/docs/api-reference/text-to-speech/convert)):
  - `language_code` (ISO 639-1): "used to enforce a language for the model and text normalization"

### O que mudar

**Em todas as 11 edge functions:**

1. **Remover** `AUDIO_PREFIX_TAG` / `[Brazilian Portuguese accent]` — elimina a mistura de idiomas
2. **Adicionar** `language_code: "pt"` no body da request — força normalização em português (números, datas, abreviações) sem interferir no sotaque

### Arquivos afetados


| Função                                    | Mudança                                                                             |
| ----------------------------------------- | ----------------------------------------------------------------------------------- |
| `v8-generate-section-audio/index.ts`      | Remover linha 12 (`AUDIO_PREFIX_TAG`), ajustar linha 107, adicionar `language_code` |
| `v8-generate/index.ts`                    | Remover linha 349, ajustar chamada TTS, adicionar `language_code`                   |
| `v8-reprocess-audio/index.ts`             | Remover `AUDIO_PREFIX_TAG`, adicionar `language_code`                               |
| `processar-aula/index.ts`                 | Remover linha 201, ajustar `chamarElevenLabs()`, adicionar `language_code`          |
| `elevenlabs-tts-contextual/index.ts`      | Remover prefixo linha 122, adicionar `language_code`                                |
| `generate-audio-with-timestamps/index.ts` | Remover linhas 87-88, adicionar `language_code`                                     |
| `generate-audio-elevenlabs/index.ts`      | Remover prefixo linha 57, adicionar `language_code`                                 |
| `generate-lesson-audio/index.ts`          | Remover prefixo linha 160, adicionar `language_code`                                |
| `generate-multiple-audios/index.ts`       | Remover prefixo linha 46, adicionar `language_code`                                 |
| `v7-vv/index.ts`                          | Remover prefixo linha 3244, adicionar `language_code`                               |
| `v7-generate-secret-audio/index.ts`       | Remover prefixo linha 45, adicionar `language_code`                                 |


### Mudança técnica padrão (em cada função)

Antes:

```typescript
const AUDIO_PREFIX_TAG = '[Brazilian Portuguese accent] ';
// ...
body: JSON.stringify({
  text: `${AUDIO_PREFIX_TAG}${cleanText}`,
  model_id: 'eleven_v3',
  voice_settings: { ... },
})
```

Depois:

```typescript
body: JSON.stringify({
  text: cleanText,
  model_id: 'eleven_v3',
  language_code: 'pt',
  voice_settings: { ... },
})
```

### Por que desta vez é diferente

- Antes: a proposta foi feita mas **nunca executada** — o código atual ainda tem o prefixo em todas as 11 funções
- Agora: baseado em 3 fontes oficiais da ElevenLabs que confirmam que misturar idiomas causa confusão e que o sotaque vem da voz

### Risco

O `language_code: "pt"` controla apenas normalização de texto (como pronunciar "R$1.500" ou "15/03"). ISO 639-1 não distingue PT-BR de PT-PT — essa distinção vem da voz Taciana. Se por algum motivo `language_code: "pt"` causar drift, basta removê-lo (a normalização auto-detect do ElevenLabs funciona bem com texto puramente em português).