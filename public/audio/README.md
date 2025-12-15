# V7 Cinematic Audio Files

Este diretório contém os arquivos de áudio para as lições V7 Cinematicque solicitam o upload do arquivo de áudio completo (narração + música de fundo se houver)

## Estrutura de Arquivos

Os arquivos de áudio devem seguir a convenção de nomenclatura:

```
v7-[lesson-id]-narration.mp3    # Narração completa da lição
v7-[lesson-id]-music.mp3        # Música de fundo (opcional)
v7-[lesson-id]-effects/         # Efeitos sonoros específicos (opcional)
```

## Formato Recomendado

- **Formato**: MP3 (para compatibilidade universal)
- **Taxa de bits**: 128-192 kbps (balanço entre qualidade e tamanho)
- **Sample rate**: 44.1 kHz
- **Canais**: Stereo

## Como Adicionar Áudios Reais

### Opção 1: Geração via TTS (Text-to-Speech)

Use serviços de TTS de qualidade como:

1. **Google Cloud Text-to-Speech**: Vozes naturais, suporta SSML
2. **Amazon Polly**: Boa variedade de vozes em português
3. **ElevenLabs**: Vozes extremamente naturais e personalizáveis
4. **Azure Speech**: Microsoft, boa qualidade

### Opção 2: Gravação Profissional

Para qualidade máxima:

1. Contratar locutor profissional
2. Gravar em estúdio com equipamento adequado
3. Editar e masterizar o áudio
4. Sincronizar com o script da lição

### Opção 3: Pipeline Automático

O sistema V7 pode ser integrado com serviços de TTS para geração automática:

```typescript
// Exemplo de integração (src/services/v7-audio-generator.ts)
async function generateV7Audio(lesson: V7CinematicLesson) {
  const narrationText = lesson.cinematicFlow.acts
    .map(act => act.content.audio.narrationSegment?.text)
    .join('\n\n');

  // Chamar serviço de TTS
  const audioBuffer = await ttsService.synthesize(narrationText, {
    voice: 'pt-BR-Neural2-A',
    speed: 1.0,
    pitch: 0,
  });

  // Salvar arquivo
  const filename = `v7-${lesson.id}-narration.mp3`;
  await saveAudioFile(filename, audioBuffer);

  return filename;
}
```

## Arquivos Placeholder

Os seguintes arquivos são placeholders para desenvolvimento:

- `v7-async-await-narration.mp3` - Silêncio de 7 minutos (420s)
- `v7-background-music.mp3` - Música ambiente suave de loop

**IMPORTANTE**: Substitua estes placeholders por áudios reais antes de publicar a lição!

## Sincronização de Áudio

O sistema V7 usa `SyncPoints` para sincronizar o áudio com os atos visuais:

```typescript
{
  id: 'sync-1',
  timestamp: 60,  // 1 minuto no áudio
  actId: 'act-2-problem',
  type: 'act-start',
  action: {
    type: 'highlight',
    target: 'code-block',
  }
}
```

Certifique-se de que os timestamps nos SyncPoints correspondem exatamente aos momentos no áudio!

## Ferramentas Úteis

- **Audacity**: Editor de áudio gratuito e open-source
- **Adobe Audition**: Editor profissional
- **FFmpeg**: Conversão e processamento de áudio via linha de comando
- **Sonic Visualiser**: Análise de áudio para verificar timestamps

## Exemplo de Geração com FFmpeg

Criar silêncio de teste:

```bash
ffmpeg -f lavfi -i anullsrc=r=44100:cl=stereo -t 420 -q:a 9 -acodec libmp3lame v7-async-await-narration.mp3
```

Converter para MP3:

```bash
ffmpeg -i input.wav -codec:a libmp3lame -qscale:a 2 output.mp3
```

## Checklist de Qualidade

Antes de usar um áudio em produção:

- [ ] Áudio está sincronizado com os atos (testar SyncPoints)
- [ ] Volume normalizado (não muito alto nem muito baixo)
- [ ] Sem ruídos ou cliques
- [ ] Transições suaves entre seções
- [ ] Música de fundo (se houver) não interfere com narração
- [ ] Duração total corresponde a `lesson.duration`
- [ ] Formato correto (MP3, 128-192 kbps, 44.1 kHz)

## Suporte

Para questões sobre áudio no sistema V7, consulte:

- Documentação V7: `/docs/v7-cinematic-system.md`
- Issue Tracker: GitHub Issues
- Slack: #v7-development
