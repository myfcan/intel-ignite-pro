# Exemplo: Como Criar Aula SEM Títulos no Áudio

## 🎯 Objetivo

Criar aulas onde os títulos das seções aparecem **visualmente** na tela, mas **NÃO são narrados** pela MAIA.

---

## ✅ MÉTODO 1: Processamento Automático (RECOMENDADO)

O sistema JÁ remove automaticamente títulos markdown antes de gerar o áudio!

### Como Funciona

1. Você escreve o `visualContent` COM títulos markdown normalmente
2. O pipeline (`step2-clean-text.ts`) remove automaticamente:
   - Títulos markdown (`## Título`, `### Subtítulo`)
   - Emojis (🎯, 🧠, 🚀, etc.)
   - Formatação markdown (**, *, `, etc.)
3. O áudio é gerado APENAS com o texto limpo

### Exemplo Completo

```typescript
import { GuidedLessonData } from '@/types/guidedLesson';

export const exemploAula: GuidedLessonData = {
  id: 'exemplo-aula-01',
  title: 'Exemplo de Aula Sem Títulos no Áudio',
  trackId: 'trilha-exemplo',
  trackName: 'Trilha de Exemplo',
  duration: 180,
  contentVersion: 1,
  schemaVersion: 1,

  sections: [
    {
      id: 'sessao-1',
      timestamp: 0,
      type: 'text',
      speechBubbleText: 'Olá! Vamos começar',

      // 👇 VISUAL: Aparece na tela COM título
      visualContent: `## 🎯 Introdução

Olá! Bem-vindo à primeira aula.

Hoje vamos aprender sobre IA de forma prática.

Prepare-se para uma jornada incrível!`

      // 👇 ÁUDIO: Sistema gera automaticamente SEM o título
      // Resultado narrado: "Olá! Bem-vindo à primeira aula. Hoje vamos aprender sobre IA..."
      // (O título "## 🎯 Introdução" é removido automaticamente)
    },

    {
      id: 'sessao-2',
      timestamp: 45,
      type: 'text',
      speechBubbleText: 'O que é IA de verdade',

      visualContent: `## 🧠 Conceitos Fundamentais

A Inteligência Artificial é uma tecnologia revolucionária.

**Principais características:**
- Aprende com dados
- Reconhece padrões
- Gera novas respostas

Você não precisa ser programador para usar IA!`

      // ÁUDIO gerado (limpo automaticamente):
      // "A Inteligência Artificial é uma tecnologia revolucionária.
      //  Principais características: Aprende com dados. Reconhece padrões.
      //  Gera novas respostas. Você não precisa ser programador para usar IA!"
    },

    {
      id: 'sessao-3',
      timestamp: 90,
      type: 'text',
      speechBubbleText: 'Exemplos práticos',

      visualContent: `## 📱 IA no Seu Dia a Dia

Você já usa IA sem perceber:

**Entretenimento:**
Netflix recomenda filmes perfeitos. Spotify cria playlists personalizadas.

**Trabalho:**
Gmail sugere respostas. ChatGPT ajuda com textos.

Tudo isso é IA trabalhando para você!`
    },

    {
      id: 'sessao-4',
      timestamp: 135,
      type: 'end-audio',
      speechBubbleText: 'Próximos passos',

      visualContent: `## 🚀 Conclusão

Parabéns! Você completou a primeira aula.

Na próxima, vamos colocar a mão na massa e usar IA na prática.

Nos vemos em breve!`
    }
  ],

  exercisesConfig: [
    {
      id: 'ex-1',
      type: 'fill-in-blanks',
      title: 'Teste seus conhecimentos',
      instruction: 'Complete as lacunas:',
      data: {
        sentences: [
          {
            id: 'sent-1',
            text: 'A IA aprende observando _______ e identificando padrões.',
            correctAnswers: ['dados', 'exemplos'],
            options: ['dados', 'pessoas', 'números'],
            hint: 'O que a IA precisa para aprender?',
            explanation: 'Isso mesmo! IA aprende com dados e exemplos.'
          }
        ],
        feedback: {
          allCorrect: '🎯 Perfeito!',
          someCorrect: '👍 Muito bem!',
          needsReview: '💡 Continue aprendendo!'
        }
      }
    }
  ]
};
```

---

## 🔧 MÉTODO 2: Controle Manual Total

Se você precisa de **controle absoluto** sobre o que é narrado, crie textos de áudio separados manualmente.

### Estrutura

```typescript
export const minhaAula: GuidedLessonData = {
  id: 'minha-aula-manual',
  title: 'Aula com Áudio Manual',
  trackId: 'trilha-1',
  trackName: 'Trilha 1',
  duration: 240,
  contentVersion: 1,
  schemaVersion: 1,

  sections: [
    {
      id: 'sessao-1',
      timestamp: 0,
      type: 'text',
      speechBubbleText: 'Introdução',

      // 👇 VISUAL: Texto completo com títulos e formatação
      visualContent: `## 🎯 Bem-vindo!

Olá! Eu sou a MAIA.

Vamos começar uma jornada incrível.`,

      // 👇 ÁUDIO: Você pode fornecer o áudio já pronto (opcional)
      // audio_url: 'https://sua-url.com/sessao-1.mp3'
    }
  ]
};

// 👇 TEXTO PARA ÁUDIO (exportado separadamente)
// Use este texto ao gerar áudio manualmente via script
export const minhaAulaAudioTexts = [
  // Sessão 1 (SEM título, SEM emojis, SEM markdown)
  `Olá! Eu sou a Maia. Vamos começar uma jornada incrível.`,

  // Sessão 2
  `A Inteligência Artificial está em todo lugar. Você já usa sem perceber.`,

  // Sessão 3
  `Agora você vai aprender a usar IA de forma estratégica.`
];
```

---

## 📊 Comparação dos Métodos

| Aspecto | Método 1 (Automático) | Método 2 (Manual) |
|---------|----------------------|-------------------|
| **Facilidade** | ✅ Muito fácil | ⚠️ Mais trabalhoso |
| **Manutenção** | ✅ Simples | ⚠️ Duplicação de texto |
| **Controle** | ⚠️ Médio | ✅ Total |
| **Recomendado** | ✅ SIM (padrão) | Para casos especiais |

---

## 🎙️ Como Gerar os Áudios

### Usando o Pipeline Automático (Método 1)

```typescript
import { autoGenerateAudio } from '@/lib/autoGenerateAudio';
import { minhaAula } from '@/data/lessons/minha-aula';

// O pipeline automaticamente:
// 1. Limpa o texto (remove títulos, emojis, markdown)
// 2. Gera áudios no ElevenLabs
// 3. Faz upload no Supabase
// 4. Retorna URLs
const resultado = await autoGenerateAudio(minhaAula, 'v2');
```

### Gerando Manualmente (Método 2)

```typescript
import { supabase } from '@/integrations/supabase/client';

// Gere um áudio por seção manualmente
for (const texto of minhaAulaAudioTexts) {
  const { data } = await supabase.functions.invoke('generate-audio-elevenlabs', {
    body: {
      text: texto, // ← Texto JÁ LIMPO (sem títulos)
      voice_id: 'Xb7hH8MSUJpSbSDYk0k2' // Alice (Brasil)
    }
  });

  // Salvar o data.audio_base64 e associar à seção
}
```

---

## ⚠️ Armadilhas Comuns

### ❌ ERRADO: Colocar título fora do markdown

```typescript
visualContent: `Introdução e Boas-vindas

Olá! Bem-vindo...`
```
➡️ **Problema:** "Introdução e Boas-vindas" será narrado!

### ✅ CORRETO: Usar markdown para títulos

```typescript
visualContent: `## Introdução e Boas-vindas

Olá! Bem-vindo...`
```
➡️ **Solução:** O sistema remove "## Introdução..." automaticamente!

---

## 🔍 Como Verificar

### 1. Após gerar o áudio, verifique o console:

```
🧹 [STEP 2] Limpando texto para geração de áudio...
   Limpando seção 1/3...
   ✅ Seção 1 limpa (150 caracteres)
📊 Primeiros 100 chars do audioText: "Olá! Bem-vindo à primeira aula..."
```

Se aparecer o título aqui, significa que ele NÃO foi removido!

### 2. Teste o áudio gerado:

```typescript
// O array sectionTexts deve estar SEM títulos
console.log(resultado.sectionTexts);
// ❌ BAD: ["## Introdução\n\nOlá...", ...]
// ✅ GOOD: ["Olá! Bem-vindo...", ...]
```

---

## 📝 Checklist Final

Ao criar uma aula SEM títulos narrados:

- [ ] Use títulos markdown (`##`) no `visualContent`
- [ ] NÃO coloque títulos como texto normal
- [ ] Confie no pipeline automático (Método 1)
- [ ] Se precisar controle total, use o Método 2
- [ ] Teste o áudio gerado antes de publicar
- [ ] Verifique o console para confirmar a limpeza

---

## 💡 Dica Profissional

**Use o Método 1 (automático) sempre que possível!**

- Menos trabalho
- Menos chance de erro
- Manutenção mais fácil
- Sistema já testado e otimizado

Só use o Método 2 se você precisar de algo muito específico que o processamento automático não consiga fazer.

---

## 🆘 Problemas?

Se os títulos ainda estão sendo narrados:

1. Verifique se está usando `##` antes do título
2. Confirme que o pipeline está usando `step2-clean-text.ts`
3. Veja os logs do console durante a geração
4. Teste com o exemplo desta documentação primeiro
5. Se ainda falhar, gere o áudio manualmente (Método 2)
