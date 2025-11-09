# Geração Automática de Áudio

## Visão Geral

O sistema de geração automática de áudio permite que lições tenham seus áudios gerados e salvos automaticamente quando são inseridas no banco de dados.

## Função Principal

### `autoGenerateAudio(lessonId, audioText?, content?)`

Gera e salva automaticamente o áudio para uma lição.

**Parâmetros:**
- `lessonId` (string): ID da lição no banco de dados
- `audioText` (string, opcional): Texto completo para narração. Se não fornecido, busca do banco
- `content` (LessonContent, opcional): Conteúdo da lição. Se não fornecido, busca do banco

**Retorno:**
```typescript
{
  success: boolean;
  audioUrl?: string;
  error?: string;
}
```

## Uso Básico

### Exemplo 1: Após inserir lição no banco

```typescript
import { supabase } from '@/integrations/supabase/client';
import { autoGenerateAudio } from '@/lib/autoGenerateAudio';

// 1. Inserir a lição
const { data: lesson, error } = await supabase
  .from('lessons')
  .insert({
    title: 'Minha Nova Lição',
    lesson_type: 'interactive',
    content: {
      audioText: 'Este é o texto que será narrado...',
      sections: [
        {
          id: 'intro',
          speechBubbleText: 'Olá! Bem-vindo à aula.',
          visualContent: 'Texto adicional para contexto.'
        }
      ]
    }
  })
  .select()
  .single();

if (lesson) {
  // 2. Gerar áudio automaticamente
  const result = await autoGenerateAudio(lesson.id);
  
  if (result.success) {
    console.log('✅ Áudio gerado:', result.audioUrl);
  } else {
    console.error('❌ Erro:', result.error);
  }
}
```

### Exemplo 2: Com dados fornecidos diretamente

```typescript
import { autoGenerateAudio } from '@/lib/autoGenerateAudio';

const audioText = 'Texto completo da narração...';
const content = {
  sections: [
    { id: 'intro', speechBubbleText: 'Olá!', visualContent: 'Contexto' }
  ]
};

const result = await autoGenerateAudio(
  'lesson-id-123',
  audioText,
  content
);
```

### Exemplo 3: Com Toast Notifications

```typescript
import { autoGenerateAudioWithToast } from '@/lib/autoGenerateAudio';

// Mostra loading toast, depois success/error automaticamente
const success = await autoGenerateAudioWithToast('lesson-id-123');
```

## Fluxo de Execução

```
1. Validar dados de entrada
   ├─ Se não tiver audioText/content, buscar do banco
   └─ Validar que audioText existe
   
2. Gerar section markers
   ├─ Extrair seções do content
   └─ Criar markers com primeiros 50 chars de cada seção
   
3. Chamar Edge Function
   ├─ generate-audio-with-timestamps
   ├─ Voice: Alice (Xb7hH8MSUJpSbSDYk0k2)
   └─ Model: eleven_multilingual_v2
   
4. Processar resposta
   ├─ Converter base64 → Blob
   └─ Preparar para upload
   
5. Upload no Storage
   ├─ Deletar áudio anterior (se existir)
   └─ Upload do novo áudio
   
6. Atualizar banco de dados
   ├─ Salvar audio_url
   └─ Salvar word_timestamps
```

## Estrutura Esperada do Content

```typescript
interface LessonContent {
  audioText: string;  // Texto completo da narração
  sections: Array<{
    id: string;
    speechBubbleText?: string;  // Texto da fala
    visualContent?: string;      // Contexto adicional
  }>;
}
```

## Tratamento de Erros

A função retorna um objeto com `success: false` e `error: string` nos seguintes casos:

- ❌ Lição não encontrada no banco
- ❌ audioText vazio ou undefined
- ❌ Nenhuma seção válida para gerar markers
- ❌ Erro ao chamar edge function
- ❌ Erro no upload do áudio
- ❌ Erro ao atualizar banco de dados

## Logs

A função gera logs detalhados no console:

```
🎙️ Auto-gerando áudio para lição: lesson-id
📝 Texto: 1250 caracteres
📌 Marcadores: 5 seções
✅ Áudio gerado com sucesso
📦 Blob criado: 245678 bytes
🗑️ Áudio anterior deletado
📤 Upload concluído: lesson-xxx-timestamp.mp3
🔗 URL pública: https://...
✅ Lição atualizada no banco de dados
```

## Requisitos

1. **ELEVENLABS_API_KEY** deve estar configurada no Supabase
2. Bucket **lesson-audios** deve existir e ser público
3. Edge function **generate-audio-with-timestamps** deve estar deployada
4. Lição deve ter `content.audioText` definido

## Performance

- Geração de áudio: ~5-15 segundos (depende do tamanho do texto)
- Upload: ~1-3 segundos
- Total: ~10-20 segundos por lição

## Uso Recomendado

✅ **Use quando:**
- Criar lições via código/script
- Migrar lições antigas
- Regenerar áudios em batch

❌ **Não use quando:**
- Usuário está testando/aprovando manualmente (use AdminAudioGenerator)
- Precisa de controle de qualidade antes de salvar
