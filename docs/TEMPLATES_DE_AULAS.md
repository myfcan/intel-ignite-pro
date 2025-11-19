# 📚 Templates de Aulas - Intel Ignite Pro

Este documento explica os templates disponíveis para criar novas aulas.

---

## 📋 Templates Disponíveis

### 1️⃣ `TEMPLATE-aula-completa.ts` - **Template Completo**

**Quando usar:** Quando você quer ver TODAS as opções e recursos disponíveis.

**O que contém:**
- ✅ Todos os tipos de seções (texto, playground, end-audio)
- ✅ Todos os tipos de exercícios (4 tipos)
- ✅ Playground interativo
- ✅ Playground final
- ✅ Comentários detalhados explicando cada campo
- ✅ Dicas e boas práticas
- ✅ Guia de uso completo

**Ideal para:**
- Primeira vez criando uma aula
- Aulas complexas com muitos recursos
- Referência completa de todas as opções

**Localização:**
```
/src/data/lessons/TEMPLATE-aula-completa.ts
```

---

### 2️⃣ `TEMPLATE-aula-simples.ts` - **Template Minimalista**

**Quando usar:** Quando você quer começar rápido com o essencial.

**O que contém:**
- ✅ 4 seções básicas (introdução, conceito, aplicação, conclusão)
- ✅ 2 exercícios simples (fill-in-blanks, true-false)
- ✅ Sem playground
- ✅ Estrutura mínima e limpa
- ✅ Comentários concisos

**Ideal para:**
- Criar aulas rapidamente
- Aulas simples e diretas
- Iniciantes em criação de conteúdo

**Localização:**
```
/src/data/lessons/TEMPLATE-aula-simples.ts
```

---

### 3️⃣ `EXEMPLO-aula-pronta.ts` - **Exemplo Real Completo**

**Quando usar:** Quando você quer ver como fica uma aula PRONTA de verdade.

**O que contém:**
- ✅ Aula completa sobre "Produtividade com IA"
- ✅ Conteúdo real e aplicável
- ✅ 6 seções bem estruturadas
- ✅ 4 exercícios variados e práticos
- ✅ Exemplos de storytelling
- ✅ Números e dados concretos
- ✅ Análise da estrutura no final

**Ideal para:**
- Ver um exemplo real de aula de qualidade
- Entender como aplicar técnicas de engajamento
- Inspiração para criar suas próprias aulas
- Referência de tom e linguagem

**Localização:**
```
/src/data/lessons/EXEMPLO-aula-pronta.ts
```

---

## 🚀 Como Usar os Templates

### Passo a Passo

#### 1. Escolha o Template

```bash
# Template completo (todas as opções)
TEMPLATE-aula-completa.ts

# Template simples (começo rápido)
TEMPLATE-aula-simples.ts

# Exemplo real (inspiração)
EXEMPLO-aula-pronta.ts
```

#### 2. Copie o Arquivo

```bash
# Copie o template escolhido
cp src/data/lessons/TEMPLATE-aula-simples.ts src/data/lessons/minha-aula-01.ts
```

#### 3. Edite o Conteúdo

Abra o arquivo e substitua:

```typescript
// Metadados
id: 'minha-aula-01',           // ← Seu ID único
title: 'Título da Minha Aula', // ← Seu título
trackId: 'trilha-1',           // ← ID da trilha
duration: 180,                 // ← Estimativa inicial

// Seções
visualContent: `## Seu Título

Seu conteúdo aqui...`          // ← Seu texto
```

#### 4. Ajuste os Exercícios

```typescript
exercisesConfig: [
  {
    // Preencha com suas perguntas
    text: 'Sua pergunta aqui...',
    correctAnswers: ['sua resposta'],
    // ...
  }
]
```

#### 5. Delete o Que Não Usar

```typescript
// Não precisa de playground? Delete!
// playgroundConfig: { ... }  ← Comente ou delete

// Não precisa de 4 exercícios? Delete os extras!
exercisesConfig: [
  // ... mantenha só os que vai usar
]
```

#### 6. Importe no Index

```typescript
// src/data/lessons/index.ts
export { minhaAula01 } from './minha-aula-01';
```

#### 7. Gere o Áudio

```typescript
import { autoGenerateAudio } from '@/lib/autoGenerateAudio';
import { minhaAula01 } from '@/data/lessons/minha-aula-01';

// Gera áudios automaticamente (V2 = múltiplos áudios)
const resultado = await autoGenerateAudio(minhaAula01, 'v2');
```

---

## 📖 Estrutura Básica de Uma Aula

### Metadados Essenciais

```typescript
{
  id: 'aula-id',              // Único, formato: trilha-numero
  title: 'Título da Aula',    // Exibido no card
  trackId: 'trilha-1',        // ID da trilha
  trackName: 'Nome Trilha',   // Nome da trilha
  duration: 180,              // Segundos (180 = 3 min)
  contentVersion: 1,          // Versão (incrementar em updates)
  schemaVersion: 1            // Sempre 1
}
```

### Seções (Sections)

```typescript
sections: [
  {
    id: 'sessao-1',                    // ID único
    timestamp: 0,                      // Segundo de início
    type: 'text',                      // text | playground | end-audio
    speechBubbleText: 'Frase curta',   // Max 60 chars
    visualContent: `## Título

    Conteúdo que aparece na tela...`   // Markdown OK!
  }
]
```

**⚠️ IMPORTANTE:**
- Primeira seção sempre `timestamp: 0`
- Última seção sempre `type: 'end-audio'`
- Títulos markdown (`##`) são removidos do áudio automaticamente
- Emojis são removidos do áudio automaticamente

### Exercícios (Exercises)

#### Fill-in-Blanks (Preencher Lacunas)

```typescript
{
  type: 'fill-in-blanks',
  data: {
    sentences: [
      {
        text: 'Frase com _______',     // Lacuna
        correctAnswers: ['resposta'],  // Aceita múltiplas
        options: ['opt1', 'opt2'],     // Múltipla escolha
        hint: 'Dica útil',
        explanation: 'Explicação'
      }
    ]
  }
}
```

#### True/False (Verdadeiro ou Falso)

```typescript
{
  type: 'true-false',
  data: {
    statements: [
      {
        text: 'Afirmação...',
        correct: true,                 // ou false
        explanation: '✅ VERDADEIRO!'
      }
    ]
  }
}
```

#### Scenario Selection (Antes/Depois)

```typescript
{
  type: 'scenario-selection',
  data: {
    scenarios: [
      {
        title: 'Abordagem A',
        description: 'Descrição...',
        emoji: '✅',
        isCorrect: true,
        feedback: 'Feedback...'
      }
    ],
    correctExplanation: 'Por que esta é melhor...',
    followUpQuestion: 'Pergunta...',
    followUpAnswer: 'Resposta...'
  }
}
```

#### Multiple Choice (Múltipla Escolha)

```typescript
{
  type: 'multiple-choice',
  data: {
    question: 'Qual é...?',
    options: [
      {
        text: 'Opção A',
        isCorrect: true,
        feedback: '✅ Correto!'
      }
    ],
    explanation: 'Explicação adicional...'
  }
}
```

---

## ✅ Checklist de Criação

Antes de finalizar sua aula, verifique:

### Metadados
- [ ] ID único e descritivo
- [ ] Título claro e atrativo
- [ ] trackId e trackName corretos
- [ ] duration estimado (ajustado após áudio)
- [ ] contentVersion = 1 (primeira versão)

### Seções
- [ ] Primeira seção com `timestamp: 0`
- [ ] Última seção com `type: 'end-audio'`
- [ ] speechBubbleText curto (max 60 chars)
- [ ] visualContent com títulos markdown
- [ ] Conteúdo claro e objetivo
- [ ] 3-6 seções (ideal: 4-5)

### Exercícios
- [ ] 2-4 exercícios variados
- [ ] Perguntas relevantes ao conteúdo
- [ ] Respostas corretas e explicações claras
- [ ] Dicas úteis nos fill-in-blanks
- [ ] Feedback positivo e encorajador

### Qualidade de Conteúdo
- [ ] Linguagem simples e acessível
- [ ] Exemplos práticos e concretos
- [ ] Sem jargões técnicos (ou explicados)
- [ ] Tom amigável e motivador
- [ ] Call-to-action claro no final

### Técnico
- [ ] TypeScript sem erros
- [ ] Importado em index.ts
- [ ] Áudio gerado e testado
- [ ] Timestamps ajustados

---

## 🎨 Dicas de Criação de Conteúdo

### Estrutura Ideal de Seções

**Seção 1: Introdução (hook)**
- Comece com pergunta ou fato impactante
- Apresente o problema ou oportunidade
- Liste o que será aprendido
- Crie expectativa

**Seção 2: Conceito Principal**
- Explique de forma simples
- Use analogia do dia a dia
- Dê exemplo prático
- Conecte com conhecimento prévio

**Seção 3: Aplicação Prática**
- Mostre onde isso aparece no mundo real
- Liste casos de uso concretos
- Use números e dados quando possível
- Exemplos de pessoas reais (se tiver)

**Seção 4: Prática/Playground (opcional)**
- Convite para experimentar
- Explicação clara do que fazer
- Resultado esperado
- Encorajamento

**Seção 5: Benefícios/Impacto**
- Por que isso importa
- Benefícios concretos
- Comparação antes/depois
- Incentivo a ação

**Seção 6: Conclusão**
- Recapitulação breve
- Call-to-action específico
- Preview da próxima aula
- Encorajamento final

### Técnicas de Engajamento

**Use Números Concretos**
```
❌ "Você pode economizar muito tempo"
✅ "Você pode economizar 15 horas por semana"
```

**Use Comparações**
```
❌ "IA é útil"
✅ "Com IA: 10 min. Sem IA: 3 horas. Mesma qualidade."
```

**Use Storytelling**
```
❌ "IA ajuda em e-mails"
✅ "Maria gastava 2h em e-mails. Agora gasta 15 min com IA."
```

**Use Perguntas Reflexivas**
```
"Quantas vezes você já fez isso hoje?"
"E se você pudesse fazer em 10 segundos?"
"Quanto tempo você economizaria?"
```

**Crie Urgência (sutil)**
```
"Cada hora sem usar IA é uma hora perdida"
"Quem aprende antes, sai na frente"
"O melhor momento para começar é agora"
```

### Tom e Linguagem

**✅ FAÇA:**
- Use "você" (não "vocês")
- Seja conversacional
- Use contrações ("não é" ao invés de "não é")
- Seja positivo e encorajador
- Perguntas retóricas
- Exemplos do dia a dia

**❌ EVITE:**
- Jargões técnicos sem explicação
- Frases muito longas
- Tom professoral ou condescendente
- Negatividade excessiva
- Complexidade desnecessária
- Assumir conhecimento prévio

---

## 🔧 Problemas Comuns e Soluções

### "Os títulos estão sendo narrados!"

**Solução:** Use markdown para títulos:
```typescript
visualContent: `## Seu Título  ← Este NÃO será narrado

Este texto SERÁ narrado.`
```

### "A aula ficou muito longa"

**Solução:**
- Ideal: 3-5 minutos (180-300 segundos)
- Máximo: 10 minutos
- Divida em 2 aulas se necessário

### "Os exercícios estão muito difíceis"

**Solução:**
- Use dicas úteis
- Aceite múltiplas respostas corretas
- Foque no essencial, não em detalhes
- Teste com alguém antes

### "Não sei que timestamp usar"

**Solução:**
- Primeira versão: estime (0, 60, 120, 180...)
- Após gerar áudio: use os timestamps reais retornados
- Sistema recalcula automaticamente

---

## 📊 Métricas de Qualidade

### Aula de Alta Qualidade

- ✅ Taxa de conclusão > 80%
- ✅ Exercícios com > 70% acerto
- ✅ Tempo médio ≈ duration estimado
- ✅ Baixa taxa de pulo de seções
- ✅ Alto engajamento em playgrounds

### Indicadores de Melhoria Necessária

- ⚠️ Taxa de conclusão < 60%
- ⚠️ Exercícios com < 50% acerto
- ⚠️ Tempo muito diferente do estimado
- ⚠️ Alta taxa de pulo
- ⚠️ Baixo engajamento

**Se detectar problemas:**
1. Revise o conteúdo (muito complexo?)
2. Simplifique exercícios
3. Reduza duração
4. Adicione mais exemplos práticos
5. Teste com usuários reais

---

## 🎯 Próximos Passos

1. **Escolha um template** (simples para começar rápido)
2. **Copie e renomeie** o arquivo
3. **Preencha com seu conteúdo** (use o exemplo como inspiração)
4. **Delete o que não usar** (mantenha simples)
5. **Importe no index**
6. **Gere o áudio** (pipeline automático)
7. **Teste a aula** (você mesmo primeiro)
8. **Ajuste baseado no feedback**
9. **Publique!**

---

## 📚 Recursos Adicionais

- **Estrutura de Aulas:** `/docs/LESSON_CREATION_STANDARD.md`
- **Geração de Áudio:** `/docs/AUTO_AUDIO_GENERATION.md`
- **Áudio sem Títulos:** `/docs/EXEMPLO_AULA_SEM_TITULOS_NO_AUDIO.md`
- **Guidelines de Texto:** `/docs/AUDIO_TEXT_GUIDELINES.md`

---

## 💡 Dica Final

**Comece simples!**

Use o `TEMPLATE-aula-simples.ts`, preencha com seu conteúdo, gere o áudio e teste.

Depois que dominar o básico, explore recursos avançados do `TEMPLATE-aula-completa.ts`.

**Boas criações! 🚀**
