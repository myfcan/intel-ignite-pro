# 📚 Template Padrão Liv - Guia Completo

Este documento descreve o **template oficial** para criação de aulas baseado na **Aula 1** fornecida.

**IMPORTANTE:** Use este padrão para manter consistência em todas as aulas do curso.

---

## 🎯 Visão Geral

### Características do Template

- **Guia:** Liv (tom de mentoria pessoal)
- **Estrutura:** 5 seções fixas
- **Exercícios:** 3 exercícios focados
- **Playground:** Integrado na Sessão 4 (quando relevante)
- **Duração:** ~5 minutos (300 segundos)
- **Tom:** Assertivo, motivacional, com senso de urgência sutil

---

## 📋 Arquivos Criados

### 1. `aula-01-o-que-e-ia.ts`

**Localização:** `/src/data/lessons/aula-01-o-que-e-ia.ts`

A Aula 1 completa e pronta baseada no conteúdo fornecido:
- ✅ Conteúdo completo sobre "O que é I.A."
- ✅ Estrutura de 5 seções
- ✅ Playground integrado
- ✅ 3 exercícios (múltipla escolha, V/F, lacuna)
- ✅ Tom e linguagem da Liv

**Use como referência** para ver o padrão aplicado.

### 2. `TEMPLATE-padrao-liv.ts`

**Localização:** `/src/data/lessons/TEMPLATE-padrao-liv.ts`

Template genérico com placeholders para criar novas aulas:
- ✅ Estrutura completa comentada
- ✅ Instruções em cada seção
- ✅ Checklist de qualidade
- ✅ Padrões de linguagem da Liv
- ✅ Guia de uso passo a passo

**Use para criar as próximas aulas** copiando e preenchendo.

---

## 🏗️ Estrutura das Aulas

### Anatomia de Uma Aula Padrão Liv

```
METADADOS
├─ id, title, trackId, trackName
├─ duration, contentVersion, schemaVersion

SEÇÕES (5 fixas)
├─ SESSÃO 1: Introdução + Hook
├─ SESSÃO 2: Fundamento/Conceito
├─ SESSÃO 3: Exemplos do Dia a Dia
├─ SESSÃO 4: Oportunidades + Playground
└─ SESSÃO 5: Conclusão

EXERCÍCIOS (3 fixos)
├─ EXERCÍCIO 1: Múltipla Escolha
├─ EXERCÍCIO 2: Verdadeiro ou Falso
└─ EXERCÍCIO 3: Preencher Lacuna
```

---

## 📖 Detalhamento das Seções

### Sessão 1: Introdução e Hook (timestamp: 0)

**Objetivo:** Engajar o aluno e criar expectativa

**Estrutura:**
1. Abertura impactante (pergunta ou fato surpreendente)
2. Contexto do problema ou oportunidade
3. Apresentação do que será aprendido
4. Destaque importante ou revelação
5. Criação de expectativa
6. Conexão com a realidade do aluno

**Exemplo:**
```
Olá! Eu sou a Liv, sua guia nesta jornada...

Antes de qualquer coisa, quero te dizer algo importante:
você não está entrando em um universo complicado.

[Conceito principal explicado]

Mas existe um detalhe que quase ninguém te conta:
[Revelação]

E o mais incrível:
[Benefício ou oportunidade]
```

**speechBubbleText:** "Olá! Eu sou a Liv" (ou variação curta de apresentação)

---

### Sessão 2: Fundamento/Conceito (timestamp: ~60)

**Objetivo:** Explicar o conceito principal de forma simples

**Estrutura:**
1. Analogia simples (comparar com algo do dia a dia)
2. Explicação técnica simplificada
3. Lista de capacidades ou características
4. Destaque de pontos importantes
5. Conexão com benefício prático
6. Diferenciação do aluno

**Exemplo:**
```
Imagine uma criança aprendendo o que é um cachorro...

A I.A. faz exatamente a mesma coisa — só que em outro nível.

Ela analisa milhões de exemplos e aprende a:
- [Capacidade 1]
- [Capacidade 2]
- [Capacidade 3]

É como ter um supercérebro trabalhando a seu favor.

E é aqui que você começa a se diferenciar...
```

**speechBubbleText:** Resumo do conceito (ex: "Como a I.A. realmente aprende")

---

### Sessão 3: Exemplos do Dia a Dia (timestamp: ~120)

**Objetivo:** Mostrar onde o conceito aparece na prática

**Estrutura:**
1. Frase de preparação ("Prepare-se, porque...")
2. Lista de 4-5 exemplos concretos e reconhecíveis
3. Revelação ou insight importante
4. Divisão clara (quem faz vs quem não faz)
5. Pergunta direta ao aluno

**Exemplo:**
```
Prepare-se, porque isso costuma surpreender.

Você já usa I.A. todos os dias sem perceber:
- Netflix recomenda exatamente o filme...
- WhatsApp sugere respostas prontas...
- Waze recalcula rotas...
- Seu banco detecta fraude...

Mas aqui vem a verdadeira revelação:
[Insight]

E isso cria uma divisão clara:
Os que aprendem agora vs os que ficam para trás.

Qual dos dois você quer ser?
```

**speechBubbleText:** Resumo dos exemplos (ex: "Onde você já usa I.A. sem perceber")

---

### Sessão 4: Oportunidades + Playground (timestamp: ~180)

**Objetivo:** Mostrar oportunidades reais e permitir prática

**Estrutura:**
1. Tom de mentoria ("Agora quero falar com você como mentora")
2. Casos reais com números concretos
3. O que essas pessoas fazem
4. Revelação do "segredo"
5. Anúncio de que vai aprender isso
6. Chamada para o playground
7. Exemplos práticos de prompts

**Exemplo:**
```
Agora quero falar com você como mentora.

Eu vejo isso todos os dias — literalmente.
Pessoas comuns estão ganhando de R$ 5 mil a R$ 20 mil por mês...

Elas criam conteúdos, resolvem problemas, fazem automações...

E sabe qual é o segredo?
Saber pedir. Saber orientar. Saber guiar a I.A. com clareza.

Você está prestes a aprender exatamente isso.

E antes de avançarmos, vamos começar pela prática.

Tente algo simples e útil:
- "Liv, organize meu dia..."
- "Liv, escreva uma mensagem..."

Experimente. É aqui que você começa a dominar de verdade.
```

**speechBubbleText:** "Oportunidades reais para você" (ou variação)

**⚠️ Playground:** Incluir quando a aula tiver componente prático

---

### Sessão 5: Conclusão (timestamp: ~240, type: 'end-audio')

**Objetivo:** Recapitular e empoderar o aluno

**Estrutura:**
1. Reconhecimento do progresso
2. Lista de 5 aprendizados
3. Destaque do principal aprendizado
4. Mensagem de empoderamento
5. Chamada para exercícios

**Exemplo:**
```
Hoje você deu um passo enorme.

Agora você sabe:
- O que é I.A.
- Como ela aprende
- Onde ela está
- Por que ela importa
- Como usar a seu favor

E principalmente:
Você está aprendendo como protagonista — não como espectador.

Agora vamos consolidar tudo isso com os exercícios.
```

**speechBubbleText:** "Conclusão: você deu um passo enorme" (ou variação)

**⚠️ OBRIGATÓRIO:** `type: 'end-audio'` na última seção

---

## ✏️ Estrutura dos Exercícios

### Exercício 1: Múltipla Escolha (SEMPRE)

**Objetivo:** Testar compreensão do conceito principal

**Estrutura:**
- Pergunta sobre o conceito-chave da aula
- 3 opções (1 correta, 2 incorretas plausíveis)
- Feedback específico para cada opção
- Explicação adicional reforçando o conceito

**Exemplo:**
```typescript
{
  type: 'multiple-choice',
  question: 'O que melhor descreve a I.A.?',
  options: [
    {
      text: 'Um aplicativo comum...',
      isCorrect: false,
      feedback: 'I.A. vai muito além...'
    },
    {
      text: 'Um sistema capaz de aprender...',
      isCorrect: true,
      feedback: '✅ Correto! I.A. é...'
    },
    {
      text: 'Um robô físico...',
      isCorrect: false,
      feedback: 'I.A. não precisa ser...'
    }
  ]
}
```

---

### Exercício 2: Verdadeiro ou Falso (SEMPRE)

**Objetivo:** Corrigir mal-entendido comum

**Estrutura:**
- 1 afirmação sobre o tema
- Resposta: true ou false
- Explicação detalhada da resposta

**Exemplo:**
```typescript
{
  type: 'true-false',
  statements: [
    {
      text: 'I.A. está presente apenas em tecnologias avançadas e raras.',
      correct: false,
      explanation: '❌ FALSO! I.A. está na Netflix, Waze, bancos...'
    }
  ]
}
```

---

### Exercício 3: Preencher Lacuna (SEMPRE)

**Objetivo:** Testar conhecimento de termo-chave

**Estrutura:**
- 1 frase com lacuna (_______)
- Múltiplas respostas corretas aceitas
- 3 opções de múltipla escolha
- Dica útil
- Explicação aprofundada

**Exemplo:**
```typescript
{
  type: 'fill-in-blanks',
  sentences: [
    {
      text: 'A I.A. aprende analisando grandes quantidades de _______.',
      correctAnswers: ['dados', 'data', 'informações', 'exemplos'],
      options: ['dados', 'pessoas', 'computadores'],
      hint: 'Pense no que a I.A. precisa para aprender!',
      explanation: 'Correto! O aprendizado da I.A. depende de...'
    }
  ]
}
```

---

## 🎨 Tom e Linguagem da Liv

### Características do Tom

- **Pessoal:** Fala direto com "você" (nunca "vocês")
- **Mentora:** "Agora quero falar com você como mentora"
- **Assertiva:** Afirmações diretas, sem rodeios
- **Motivacional:** Empoderamento constante
- **Urgência sutil:** Sem ser agressiva

### Padrões de Abertura

```
✅ "Prepare-se, porque..."
✅ "Agora quero falar com você como mentora"
✅ "Eu vejo isso todos os dias — literalmente"
✅ "Antes de qualquer coisa, quero te dizer algo importante"
```

### Padrões de Revelação

```
✅ "Mas aqui vem a verdadeira revelação:"
✅ "E sabe qual é o segredo?"
✅ "Existe um detalhe que quase ninguém te conta:"
✅ "E o mais incrível:"
```

### Padrões de Empoderamento

```
✅ "Você está prestes a aprender exatamente isso"
✅ "É aqui que você começa a se diferenciar"
✅ "Você está aprendendo como protagonista"
✅ "Hoje você deu um passo enorme"
```

### Padrões de Engajamento

```
✅ "Qual dos dois você quer ser?"
✅ "E você? Quanto tempo vai economizar?"
✅ "Prepare-se para descobrir..."
✅ "Experimente. É aqui que você começa a dominar"
```

### Padrões de Urgência

```
✅ "Pela primeira vez na história..."
✅ "Os que aprendem agora vs os que ficam para trás"
✅ "E isso cria uma divisão clara no mercado:"
```

---

## 🚀 Como Usar Este Template

### Passo a Passo Detalhado

#### 1. Copiar o Template

```bash
cp src/data/lessons/TEMPLATE-padrao-liv.ts src/data/lessons/aula-02-seu-tema.ts
```

#### 2. Editar Metadados

```typescript
id: 'aula-02-prompts-eficazes',
title: 'Como Criar Prompts que Funcionam',
trackId: 'trilha-1-fundamentos',
trackName: 'Fundamentos de IA',
duration: 300,
```

#### 3. Preencher Sessão 1 (Introdução)

**Perguntas guia:**
- Qual é o hook? (pergunta ou fato surpreendente)
- Qual é o problema/oportunidade?
- O que o aluno vai aprender?
- Qual é a revelação importante?

**Exemplo:**
```
Você sabia que 90% das pessoas não sabem pedir o que querem para I.A.?

E isso faz TODA a diferença entre resultados medíocres e resultados incríveis.

Hoje você vai aprender a criar prompts que funcionam de verdade.

Mas existe um detalhe que quase ninguém te conta:
um bom prompt não é complexo — é específico.

E o mais incrível:
você pode dominar isso em minutos.
```

#### 4. Preencher Sessão 2 (Conceito)

**Perguntas guia:**
- Qual analogia simples usar?
- Como explicar tecnicamente de forma simples?
- Quais são as 3-5 características principais?
- Qual é o benefício prático?

**Exemplo:**
```
Imagine que você está pedindo um favor para alguém.

Quanto mais claro você for, melhor será o resultado.

A I.A. funciona EXATAMENTE assim.

Um prompt eficaz tem:
- Contexto claro
- Objetivo específico
- Formato definido
- Tom de voz especificado

É como dar um mapa completo ao invés de "vá para lá".
```

#### 5. Preencher Sessão 3 (Exemplos)

**Perguntas guia:**
- Quais 4-5 exemplos do dia a dia?
- Qual é a revelação/insight?
- Qual é a divisão clara?
- Qual pergunta engaja o aluno?

**Exemplo:**
```
Prepare-se para ver a diferença:

PROMPT VAGO: "Escreva algo legal"
PROMPT BOM: "Escreva um e-mail de 3 parágrafos..."

PROMPT VAGO: "Faça um post"
PROMPT BOM: "Crie um post de Instagram com 4 linhas..."

Mas aqui vem a verdadeira revelação:
pessoas que dominam prompts economizam 15 horas por semana.

E isso cria uma divisão clara:
quem sabe pedir vs quem perde tempo tentando.

Qual dos dois você quer ser?
```

#### 6. Preencher Sessão 4 (Oportunidades + Playground)

**Perguntas guia:**
- Quais números concretos de oportunidades?
- O que as pessoas estão fazendo?
- Qual é o segredo?
- Quais 3 exemplos práticos de prompts?

**Exemplo:**
```
Agora quero falar com você como mentora.

Pessoas comuns estão ganhando R$ 10 mil por mês criando conteúdo com I.A.

Elas criam posts, e-mails, textos de venda — tudo em minutos.

E sabe qual é o segredo?
Prompts bem estruturados.

Vamos praticar:

- "Liv, crie 3 headlines para um anúncio de curso online sobre X"
- "Liv, escreva um e-mail de vendas com tom urgente para Y"
- "Liv, transforme este texto técnico em linguagem simples"

Experimente agora.
```

#### 7. Preencher Sessão 5 (Conclusão)

**Perguntas guia:**
- Quais 5 aprendizados principais?
- Qual é o principal aprendizado?
- Qual mensagem de empoderamento?

**Exemplo:**
```
Hoje você deu um passo enorme.

Agora você sabe:
- O que é um prompt eficaz
- Como estruturar pedidos claros
- A diferença entre vago e específico
- Exemplos práticos aplicáveis
- Como economizar horas de trabalho

E principalmente:
Você está aprendendo a extrair o máximo da I.A.

Agora vamos consolidar com os exercícios.
```

#### 8. Criar os 3 Exercícios

**Ex 1 - Múltipla Escolha:**
Pergunta sobre o conceito principal (ex: "O que torna um prompt eficaz?")

**Ex 2 - V/F:**
Afirmação sobre mal-entendido comum (ex: "Prompts longos são sempre melhores")

**Ex 3 - Lacuna:**
Termo-chave (ex: "Um bom prompt deve ser _______" → "específico")

#### 9. Revisar e Finalizar

**Checklist:**
- [ ] Todas as 5 seções preenchidas
- [ ] Última seção com `type: 'end-audio'`
- [ ] speechBubbleText curtos (max 60 chars)
- [ ] 3 exercícios completos
- [ ] Tom da Liv consistente
- [ ] Números concretos incluídos
- [ ] Perguntas de engajamento

#### 10. Gerar Áudio

```typescript
import { autoGenerateAudio } from '@/lib/autoGenerateAudio';
import { aula02SeuTema } from '@/data/lessons/aula-02-seu-tema';

await autoGenerateAudio(aula02SeuTema, 'v2');
```

---

## ✅ Checklist de Qualidade

### Antes de Finalizar uma Aula

#### Estrutura Geral
- [ ] 5 seções completas
- [ ] Primeira seção: `timestamp: 0`
- [ ] Última seção: `type: 'end-audio'`
- [ ] speechBubbleText todos com max 60 chars
- [ ] 3 exercícios (múltipla, V/F, lacuna)

#### Sessão 1 (Introdução)
- [ ] Hook impactante
- [ ] Problema/oportunidade apresentado
- [ ] Lista do que será aprendido
- [ ] Revelação importante
- [ ] Expectativa criada

#### Sessão 2 (Conceito)
- [ ] Analogia simples incluída
- [ ] Explicação técnica simplificada
- [ ] 3-5 características listadas
- [ ] Benefício prático conectado
- [ ] Diferenciação do aluno

#### Sessão 3 (Exemplos)
- [ ] 4-5 exemplos concretos
- [ ] Exemplos reconhecíveis
- [ ] Insight/revelação incluído
- [ ] Divisão clara apresentada
- [ ] Pergunta de engajamento

#### Sessão 4 (Oportunidades)
- [ ] Tom de mentoria
- [ ] Números concretos (R$, tempo)
- [ ] Casos reais ou dados
- [ ] Revelação do "segredo"
- [ ] 3 exemplos de prompts práticos
- [ ] Playground configurado (se aplicável)

#### Sessão 5 (Conclusão)
- [ ] 5 aprendizados listados
- [ ] Principal aprendizado destacado
- [ ] Mensagem de empoderamento
- [ ] Chamada para exercícios

#### Exercícios
- [ ] Ex 1: Múltipla escolha sobre conceito-chave
- [ ] Ex 2: V/F sobre mal-entendido comum
- [ ] Ex 3: Lacuna com termo principal
- [ ] Feedbacks motivadores
- [ ] Explicações detalhadas

#### Tom e Linguagem
- [ ] Usa "você" consistentemente
- [ ] Tom de mentora (Liv)
- [ ] Linguagem simples e direta
- [ ] Perguntas ao aluno incluídas
- [ ] Números concretos usados
- [ ] Senso de urgência presente (sutil)
- [ ] Padrões da Liv aplicados

---

## 📊 Métricas de Sucesso

### Como Avaliar a Qualidade da Aula

**Estrutura:**
- ✅ Todas as 5 seções seguem o padrão
- ✅ Fluxo lógico entre seções
- ✅ Transições naturais

**Conteúdo:**
- ✅ Conceito explicado de forma clara
- ✅ Exemplos reconhecíveis e relevantes
- ✅ Oportunidades com números concretos
- ✅ Exercícios testam conceitos-chave

**Engajamento:**
- ✅ Hook forte na abertura
- ✅ Perguntas diretas ao aluno
- ✅ Revelações impactantes
- ✅ Mensagens de empoderamento

**Aplicabilidade:**
- ✅ Playground com exemplos práticos
- ✅ Prompts utilizáveis imediatamente
- ✅ Conexão com vida real do aluno

---

## 🎯 Próximos Passos

### Para Criar a Próxima Aula

1. **Copie** o `TEMPLATE-padrao-liv.ts`
2. **Estude** a `aula-01-o-que-e-ia.ts` como referência
3. **Preencha** seguindo a estrutura de 5 seções
4. **Revise** com o checklist de qualidade
5. **Gere** o áudio usando V2
6. **Teste** você mesmo antes de publicar

### Recursos Disponíveis

- **Template completo:** `/src/data/lessons/TEMPLATE-padrao-liv.ts`
- **Exemplo real:** `/src/data/lessons/aula-01-o-que-e-ia.ts`
- **Este guia:** `/docs/TEMPLATE_PADRAO_LIV.md`
- **Geração de áudio:** `/docs/AUTO_AUDIO_GENERATION.md`
- **Áudio sem títulos:** `/docs/EXEMPLO_AULA_SEM_TITULOS_NO_AUDIO.md`

---

## 💡 Dica Final

**A consistência é fundamental!**

Use SEMPRE este template para manter:
- Estrutura uniforme entre aulas
- Tom da Liv consistente
- Experiência previsível para o aluno
- Qualidade padronizada

**Cada aula deve parecer parte da mesma jornada guiada pela Liv.**

---

Boas criações! 🚀
