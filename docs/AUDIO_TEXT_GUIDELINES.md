# Diretrizes para Criação de AudioText

Este documento define as melhores práticas para criar conteúdo de áudio (`audioText`) para lições.

## ✅ O Que Fazer

### 1. Use Texto Puro e Limpo
```typescript
// ✅ CORRETO
export const lessonAudioText = lesson.sections
  .map(section => section.visualContent)
  .join('\n\n');  // Apenas quebras de linha duplas
```

### 2. Mantenha o Conteúdo Natural
- Use linguagem conversacional e clara
- Escreva como você falaria naturalmente
- Evite frases muito longas ou complexas

### 3. Estruture com Quebras de Linha
```typescript
// ✅ CORRETO - Quebras de linha duplas entre seções
const audioText = `
Olá! Bem-vindo à aula de hoje.

Vamos aprender sobre inteligência artificial.

É um assunto muito interessante!
`.trim();
```

## ❌ O Que Evitar

### 1. Emojis
```typescript
// ❌ ERRADO
const text = "Olá! 👋 Vamos começar! 🚀";

// ✅ CORRETO
const text = "Olá! Vamos começar!";
```

**Por quê?** Emojis causam pausas estranhas ou sons "Ma-Ma-Maya" na narração.

### 2. Formatação Markdown
```typescript
// ❌ ERRADO
const text = `
# Título da Seção
**Texto em negrito** e *itálico*
- Item da lista
`;

// ✅ CORRETO
const text = `
Título da Seção

Texto em negrito e itálico

Item da lista
`;
```

**Por quê?** A API de TTS não entende markdown e pode pronunciar os caracteres especiais.

### 3. Separadores Decorativos
```typescript
// ❌ ERRADO
export const audioText = sections
  .map(section => section.visualContent)
  .join('\n\n---\n\n');  // Separador "---"

// ✅ CORRETO
export const audioText = sections
  .map(section => section.visualContent)
  .join('\n\n');  // Apenas quebras de linha
```

**Por quê?** Separadores como `---` causam sons estranhos e atrasos entre seções.

### 4. Caracteres Especiais Desnecessários
```typescript
// ❌ ERRADO
const text = ">>> Atenção!!! <<<";

// ✅ CORRETO
const text = "Atenção!";
```

### 5. Links e URLs
```typescript
// ❌ ERRADO
const text = "Acesse [nosso site](https://exemplo.com)";

// ✅ CORRETO
const text = "Acesse nosso site";
```

### 6. Imagens e Código
```typescript
// ❌ ERRADO
const text = `
![Imagem](url)
\`\`\`javascript
const x = 10;
\`\`\`
`;

// ✅ CORRETO
const text = "Veja o exemplo de código abaixo.";
```

## 🔄 Processo Automático

O sistema agora **valida e limpa automaticamente** o texto antes de gerar áudio:

```typescript
import { validateAndCleanAudioText } from '@/lib/audioTextValidator';

// Validação automática
const validation = validateAndCleanAudioText(rawText);

if (!validation.isValid) {
  console.error('Erros:', validation.errors);
}

if (validation.warnings.length > 0) {
  console.warn('Avisos:', validation.warnings);
}

// Usar texto limpo
const cleanText = validation.cleanText;
```

### O que é removido automaticamente:
- ✂️ Emojis (🎯, 👋, etc.)
- ✂️ Formatação markdown (`#`, `**`, `*`, etc.)
- ✂️ Links `[texto](url)` → mantém apenas "texto"
- ✂️ Imagens `![alt](url)` → remove completamente
- ✂️ Código `` `código` `` e ` ```blocos``` `
- ✂️ Separadores `---`
- ✂️ Espaços e quebras de linha excessivos
- ✂️ Caracteres de controle

## 📋 Checklist de Revisão

Antes de criar/modificar audioText:

- [ ] Texto está em linguagem natural?
- [ ] Não contém emojis?
- [ ] Não contém formatação markdown?
- [ ] Não contém separadores decorativos (`---`)?
- [ ] Não contém links ou URLs?
- [ ] Usa apenas quebras de linha duplas (`\n\n`) entre seções?
- [ ] O texto faz sentido quando lido em voz alta?

## 🎯 Exemplo Completo

```typescript
// lesson.ts
import { GuidedLessonData } from '@/types/guidedLesson';

export const myLesson: GuidedLessonData = {
  sections: [
    {
      id: '1',
      timestamp: 0,
      type: 'text',
      speechBubbleText: 'Olá! 👋',
      // visualContent SEM emojis/formatação para áudio
      visualContent: 'Olá! Bem-vindo à aula de hoje.'
    },
    {
      id: '2',
      timestamp: 5,
      type: 'text',
      speechBubbleText: '🎯 Tópico importante',
      // Texto limpo para narração
      visualContent: 'Vamos falar sobre um tópico muito importante.'
    }
  ],
  // ... outros campos
};

// AudioText limpo, sem emojis nem formatação
export const myLessonAudioText = myLesson.sections
  .map(section => section.visualContent)
  .join('\n\n');  // ✅ Apenas quebras de linha duplas
```

## 🚨 Erros Comuns

### Erro: "Ma-Ma-Maya" no áudio
**Causa:** Emojis ou caracteres especiais no texto  
**Solução:** Remover todos os emojis do audioText

### Erro: Atrasos entre seções
**Causa:** Separadores `---` sendo narrados  
**Solução:** Usar apenas `\n\n` para separar seções

### Erro: Timestamps descoordenados
**Causa:** Texto enviado diferente do texto usado nos markers  
**Solução:** Garantir que o mesmo texto limpo seja usado em ambos

### Erro: Sons estranhos ou pausas longas
**Causa:** Formatação markdown sendo interpretada como texto  
**Solução:** Remover toda formatação antes de gerar áudio

## 📚 Referências

- [Audio Generation Best Practices](./AUDIO_GENERATION_BEST_PRACTICES.md)
- [Audio Sync Guide](./AUDIO_SYNC_GUIDE.md)
- Código: `src/lib/audioTextValidator.ts`
- Código: `src/lib/autoGenerateAudio.ts`
