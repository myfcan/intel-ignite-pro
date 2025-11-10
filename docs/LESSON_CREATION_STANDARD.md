# 📚 Padrão de Criação de Lições

Este documento define o padrão **oficial e obrigatório** para criação de lições na plataforma.

## 🎯 Regras de Ouro

### 1. **SEMPRE use o processador centralizado**

```typescript
import { processLessonData } from '@/lib/lessonDataProcessor';

// ✅ CORRETO
const processed = processLessonData({
  lessonData: myLesson,
  audioText: myAudioText,
  trailId: 'trail-id',
  orderIndex: 1
});

// ❌ ERRADO - Não montar dados manualmente
const lessonData = {
  title: myLesson.title,
  content: { /* ... */ },
  // ...
};
```

### 2. **NUNCA manipule audioText manualmente**

```typescript
// ✅ CORRETO - cleanAudioText na origem
export const myAudioText = cleanAudioText(
  myLesson.sections
    .map(s => s.visualContent)
    .join('\n\n')
);

// ❌ ERRADO - Limpar durante sync/create
const audioText = cleanAudioText(myAudioText); // Tarde demais!
```

### 3. **SEMPRE valide antes de salvar**

```typescript
// ✅ CORRETO
const processed = processLessonData({...});
logValidation(processed, 'Nome da Lição');

if (!processed.validation.allPassed) {
  console.warn('⚠️ Lição tem problemas');
  // Decidir se continua ou não
}

// ❌ ERRADO - Salvar sem validar
await supabase.from('lessons').insert(lessonData);
```

---

## 🔄 Fluxo Correto

### Para Criar Nova Lição

```typescript
import { createLessonWithAudio } from '@/lib/createLessonWithAudio';
import { myLesson, myAudioText } from '@/data/lessons/my-lesson';

const result = await createLessonWithAudio({
  title: myLesson.title,
  description: 'Descrição da lição',
  trail_id: 'trail-id',
  order_index: 1,
  lesson_type: 'guided',
  lessonData: myLesson,      // ✅ Dados estruturados
  audioText: myAudioText,    // ✅ Já limpo na origem
  autoGenerateAudio: true
});

if (result.success) {
  console.log('✅ Lição criada:', result.lesson?.id);
} else {
  console.error('❌ Erro:', result.error);
}
```

### Para Sincronizar Lição Existente

```typescript
import { processLessonData, logValidation } from '@/lib/lessonDataProcessor';
import { myLesson, myAudioText } from '@/data/lessons/my-lesson';

// 1. Buscar trail
const { data: trail } = await supabase
  .from('trails')
  .select('id')
  .eq('title', 'Nome da Trilha')
  .single();

// 2. Processar dados
const processed = processLessonData({
  lessonData: myLesson,
  audioText: myAudioText,
  trailId: trail.id,
  orderIndex: 1,
  title: myLesson.title,
  description: 'Descrição'
});

// 3. Validar
logValidation(processed, myLesson.title);

// 4. Salvar no banco
const { data: lesson } = await supabase
  .from('lessons')
  .insert(processed.databaseData)
  .select()
  .single();

// 5. Gerar áudio
await autoGenerateAudioWithToast(
  lesson.id,
  processed.audioData.cleanAudioText, // ✅ Texto limpo
  processed.databaseData.content
);
```

---

## 📁 Estrutura de Arquivos de Lição

```typescript
// src/data/lessons/my-lesson.ts

import { cleanAudioText } from '@/lib/audioTextValidator';
import type { GuidedLessonData } from '@/types/guidedLesson';

export const myLesson: GuidedLessonData = {
  title: 'Título da Lição',
  contentVersion: '1.0.0',
  duration: 180.5, // Valor preciso em segundos
  sections: [
    {
      id: 'intro',
      type: 'text',
      visualContent: 'Olá! 👋 Bem-vindo à aula', // ✅ Pode ter emojis aqui
      timestamp: 0
    },
    // ...
  ],
  exercisesConfig: [
    // ...
  ]
};

// ✅ CRÍTICO: Limpar na origem
export const myLessonAudioText = cleanAudioText(
  myLesson.sections
    .map(section => section.visualContent)
    .join('\n\n')
);
```

---

## ✅ Checklist de Validação

Antes de considerar uma lição pronta, verifique:

- [ ] `audioText` é limpo na **origem** (no arquivo da lição)
- [ ] `duration` é um número preciso em segundos
- [ ] `estimated_time` será INTEGER no banco (processador faz isso)
- [ ] Todas as `sections` têm `visualContent`
- [ ] `exercisesConfig` está completo e válido
- [ ] Usou `processLessonData()` para montar dados
- [ ] Validou com `logValidation()` antes de salvar
- [ ] Usou `audioData.cleanAudioText` para gerar áudio

---

## ❌ O Que NÃO Fazer

### 1. Não limpar audioText durante sync/create

```typescript
// ❌ ERRADO
const audioSuccess = await autoGenerateAudioWithToast(
  lessonId,
  cleanAudioText(myAudioText), // Tarde demais!
  content
);

// ✅ CORRETO
const processed = processLessonData({...});
const audioSuccess = await autoGenerateAudioWithToast(
  lessonId,
  processed.audioData.cleanAudioText, // Já vem limpo
  content
);
```

### 2. Não montar `lessonData` manualmente

```typescript
// ❌ ERRADO
const lessonData = {
  title: myLesson.title,
  content: {
    duration: myLesson.duration,
    audioText: myAudioText,
    sections: myLesson.sections
  },
  estimated_time: Math.round(myLesson.duration)
};

// ✅ CORRETO
const processed = processLessonData({...});
const lessonData = processed.databaseData; // Pronto e validado
```

### 3. Não usar decimais em `estimated_time`

```typescript
// ❌ ERRADO
estimated_time: 180.5 // Postgres espera INTEGER

// ✅ CORRETO
const processed = processLessonData({...});
// processed.databaseData.estimated_time já é INTEGER (181)
```

### 4. Não salvar sem validar

```typescript
// ❌ ERRADO
await supabase.from('lessons').insert(lessonData);

// ✅ CORRETO
const processed = processLessonData({...});
logValidation(processed, 'Minha Lição');

if (processed.validation.allPassed) {
  await supabase.from('lessons').insert(processed.databaseData);
}
```

---

## 🧪 Como Testar

### 1. Teste no Console do Navegador

```javascript
// Abra DevTools (F12) e cole:
testLessonProcessor()

// Verifique se:
// ✅ Todos os checks passaram
// ✅ Fundamentos 02 e 03 estão OK
// ✅ audioText está limpo
// ✅ estimated_time é INTEGER
```

### 2. Teste Antes de Salvar no Banco

```typescript
import { processLessonData, logValidation } from '@/lib/lessonDataProcessor';

const processed = processLessonData({...});
logValidation(processed, 'Teste Lição');

// Examine o console:
// 🔍 Validação: Teste Lição
// ✅ estimated_time é INTEGER: 181 (original: 180.5)
// ✅ audioText está limpo: OK
// ✅ content tem duration preciso: 180.5s
// ✅ sem emojis no audioText: Verified
// ✅ sem markdown no audioText: Verified
```

---

## 📦 Criação em Lote (Batch)

```typescript
import { createLessonsInBatch } from '@/lib/createLessonWithAudio';

const lessons = [
  {
    title: 'Lição 1',
    lessonData: lesson1,
    audioText: lesson1AudioText,
    trail_id: 'trail-id',
    order_index: 1
  },
  {
    title: 'Lição 2',
    lessonData: lesson2,
    audioText: lesson2AudioText,
    trail_id: 'trail-id',
    order_index: 2
  }
];

const results = await createLessonsInBatch(lessons);

console.log(`✅ ${results.filter(r => r.success).length} lições criadas`);
console.log(`🎙️ ${results.filter(r => r.audioGenerated).length} áudios gerados`);
```

---

## 🎓 Exemplos Práticos

### Exemplo 1: Criar Fundamentos 04

```typescript
// 1. Criar arquivo src/data/lessons/fundamentos-04.ts
import { cleanAudioText } from '@/lib/audioTextValidator';

export const fundamentos04: GuidedLessonData = {
  title: 'Nova Lição',
  contentVersion: '1.0.0',
  duration: 200.0,
  sections: [/* ... */],
  exercisesConfig: [/* ... */]
};

export const fundamentos04AudioText = cleanAudioText(
  fundamentos04.sections
    .map(s => s.visualContent)
    .join('\n\n')
);

// 2. Criar função de sync em syncLessonToDatabase.ts
export async function syncFundamentos04(): Promise<SyncResult> {
  // Buscar trail
  const { data: trail } = await supabase
    .from('trails')
    .select('id')
    .eq('title', 'Fundamentos de IA')
    .single();

  // Processar com processador centralizado
  const processed = processLessonData({
    lessonData: fundamentos04,
    audioText: fundamentos04AudioText,
    trailId: trail.id,
    orderIndex: 4,
    title: fundamentos04.title,
    description: 'Descrição da lição'
  });

  logValidation(processed, 'Fundamentos 04');

  // Inserir/atualizar no banco
  const { data: lesson } = await supabase
    .from('lessons')
    .insert(processed.databaseData)
    .select()
    .single();

  // Gerar áudio
  await autoGenerateAudioWithToast(
    lesson.id,
    processed.audioData.cleanAudioText,
    processed.databaseData.content
  );

  return { success: true, lessonId: lesson.id };
}

// 3. Adicionar no AdminSyncLessons.tsx
const SYNC_FUNCTIONS = {
  // ...
  fundamentos04: syncFundamentos04
};
```

---

## 🚨 Problemas Comuns e Soluções

### Problema: Áudio com emojis/markdown

**Causa:** `audioText` não foi limpo na origem

**Solução:**
```typescript
// ❌ Antes
export const myAudioText = myLesson.sections
  .map(s => s.visualContent)
  .join('\n\n');

// ✅ Depois
export const myAudioText = cleanAudioText(
  myLesson.sections
    .map(s => s.visualContent)
    .join('\n\n')
);
```

### Problema: `estimated_time` com decimais

**Causa:** Não usou `processLessonData()`

**Solução:**
```typescript
// ❌ Antes
const lessonData = {
  estimated_time: myLesson.duration // 180.5
};

// ✅ Depois
const processed = processLessonData({...});
const lessonData = processed.databaseData; // estimated_time: 181
```

### Problema: Dados inconsistentes no banco

**Causa:** Múltiplos lugares montando dados de forma diferente

**Solução:**
```typescript
// ✅ SEMPRE usar processLessonData()
const processed = processLessonData({...});
// Garante consistência total
```

---

## 📊 Benefícios Deste Padrão

✅ **Consistência Total**: Todos os dados seguem o mesmo formato  
✅ **Prevenção de Erros**: Validação antes de salvar  
✅ **Testabilidade**: Pode testar sem tocar no banco  
✅ **Escalabilidade**: Pronto para criação em lote  
✅ **Manutenibilidade**: Mudanças em um lugar só  
✅ **Rastreabilidade**: Logs detalhados de validação  

---

## 🔗 Arquivos Relacionados

- **Processador**: `src/lib/lessonDataProcessor.ts`
- **Testes**: `src/lib/lessonDataProcessor.test.ts`
- **Criação**: `src/lib/createLessonWithAudio.ts`
- **Sincronização**: `src/lib/syncLessonToDatabase.ts`
- **Validação**: `src/lib/audioTextValidator.ts`
- **Tipos**: `src/types/guidedLesson.ts`

---

## 📝 Última Atualização

**Data**: 2025-01-10  
**Versão**: 1.0.0  
**Status**: ✅ Padrão Oficial Ativo
