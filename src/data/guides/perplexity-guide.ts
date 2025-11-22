import { GuideV5Data } from '../../types/guide';

export const perplexityGuide: GuideV5Data = {
  id: 'perplexity-essentials',
  title: 'Perplexity Essencial',
  description: 'Domine o Perplexity: a IA de busca que responde perguntas com fontes verificadas em tempo real',
  aiName: 'Perplexity',
  aiLogo: 'https://www.perplexity.ai/favicon.svg',
  category: 'research',
  difficulty: 'beginner',
  duration: 300, // 5 minutos
  tags: ['perplexity', 'search', 'research', 'citations'],
  sections: [
    {
      id: 'intro',
      title: 'O que é o Perplexity?',
      timestamp: 0,
      duration: 60,
      visualContent: `# O que é o Perplexity?

O **Perplexity** é uma IA de busca que combina:

- 🔍 **Busca em tempo real**: Acessa a internet AGORA
- 📚 **Fontes verificadas**: Cita todas as referências
- 💬 **Respostas conversacionais**: Como ChatGPT, mas com fatos
- 🔗 **Links diretos**: Clique nas fontes para verificar
- 🎯 **Foco em precisão**: Menos "alucinações"

## Como funciona

1. Você faz uma pergunta
2. Perplexity busca na web em tempo real
3. Analisa múltiplas fontes confiáveis
4. Gera resposta com **citações numeradas**
5. Lista todas as fontes ao final

## Diferencial principal

| IA | Dados | Fontes | Atualização |
|----|-------|--------|-------------|
| **Perplexity** | Internet em tempo real | ✅ Sempre cita | Agora |
| ChatGPT | Até jan/2025 | ❌ Não cita | Desatualizado |
| Claude | Até jan/2025 | ❌ Não cita | Desatualizado |
| Gemini | Tempo real (limitado) | ⚠️ Às vezes | Tempo real |

**Use Perplexity quando precisar de fatos verificáveis!**`
    },
    {
      id: 'getting-started',
      title: 'Como começar com Perplexity',
      timestamp: 60,
      duration: 60,
      visualContent: `# Como começar com Perplexity

## Acesso gratuito

1. Acesse [perplexity.ai](https://perplexity.ai)
2. Faça uma pergunta (não precisa de login!)
3. Ou crie conta para histórico

**Gratuito inclui:**
- Buscas ilimitadas (com limite diário de ~5 usando modelos avançados)
- Perplexity Standard (modelo próprio)
- Histórico de buscas
- Apps iOS/Android

## Perplexity Pro ($20/mês)

**Inclui:**
- 300+ buscas/dia com modelos premium:
  - GPT-4 Turbo
  - Claude 3 Opus
  - Gemini Pro
- Unlimited file uploads
- API access
- Suporte prioritário

## Interface

### Caixa de busca
Digite sua pergunta naturalmente

### Modos de busca
- **Quick**: Resposta rápida
- **Pro**: Busca profunda (usa múltiplas queries)

### Focus (Foco)
Limite a busca:
- 🌐 **All**: Toda a web
- 📰 **News**: Notícias recentes
- 📚 **Academic**: Papers científicos
- 📺 **YouTube**: Vídeos
- 🔬 **Reddit**: Discussões
- 💻 **Code**: Repositórios de código

💡 **Dica**: Use Focus para resultados mais precisos!`
    },
    {
      id: 'research-techniques',
      title: 'Técnicas de pesquisa',
      timestamp: 120,
      duration: 60,
      visualContent: `# Técnicas de pesquisa eficazes

## 1. Perguntas diretas

### ❌ Busca Google tradicional
"api rest node"

### ✅ Pergunta natural
"Como criar uma API REST com Node.js e Express em 2025?"

## 2. Comparações

\`\`\`
Compare React vs Vue vs Svelte em 2025, focando em performance e curva de aprendizado
\`\`\`

\`\`\`
Quais as diferenças entre ChatGPT Plus e Claude Pro? Qual vale mais a pena?
\`\`\`

## 3. Investigação profunda

Use **Pro Search** (plano Pro) para análises complexas:

\`\`\`
Analise as últimas tendências em IA generativa em 2025, incluindo novos modelos lançados e casos de uso emergentes
\`\`\`

## 4. Pesquisa acadêmica

Ative **Focus: Academic**

\`\`\`
Quais os estudos mais recentes sobre eficácia de jejum intermitente?
\`\`\`

## 5. Notícias atualizadas

Ative **Focus: News**

\`\`\`
Quais as principais notícias sobre inteligência artificial hoje?
\`\`\`

## 6. Verificação de fatos

\`\`\`
É verdade que [alegação]? Cite as fontes.
\`\`\`

## 7. Pesquisa de código

Ative **Focus: Code**

\`\`\`
Mostre exemplos de implementação de autenticação JWT em Python com FastAPI
\`\`\``
    },
    {
      id: 'advanced-features',
      title: 'Features avançadas',
      timestamp: 180,
      duration: 60,
      visualContent: `# Features avançadas

## Collections (Coleções)

Organize pesquisas por tema:

1. Crie uma Collection (ex: "Projeto X")
2. Todas as buscas ficam agrupadas
3. Continue conversas relacionadas
4. Compartilhe com equipe

**Casos de uso:**
- Pesquisa acadêmica sobre tema específico
- Planejamento de viagem
- Pesquisa de mercado
- Due diligence

## Thread (Conversação contínua)

Faça perguntas de acompanhamento:

\`\`\`
Você: Quais os melhores frameworks JavaScript em 2025?
Perplexity: [Responde com Next.js, Remix, etc]

Você: Aprofunde sobre Next.js
Perplexity: [Busca mais info sobre Next.js]

Você: Compare com Remix
Perplexity: [Faz comparação detalhada]
\`\`\`

## Upload de arquivos (Pro)

1. Arraste PDF, DOCX, TXT
2. Faça perguntas sobre o documento
3. Perplexity combina documento + busca web

**Exemplo:**
\`\`\`
[Upload de contrato]
"Este contrato está de acordo com as leis brasileiras atuais? Verifique cláusulas problemáticas."
\`\`\`

## Copilot (Assistente guiado)

Ative "Copilot" para:
- Perplexity fazer perguntas de esclarecimento
- Busca mais precisa e profunda
- Múltiplas iterações automáticas

## Imagens e vídeos

Perplexity mostra:
- Imagens relevantes
- Vídeos do YouTube relacionados
- Gráficos e diagramas

## Compartilhamento

- Gere link público de qualquer busca
- Compartilhe threads completos
- Exporte para Notion, Docs`
    },
    {
      id: 'use-cases',
      title: 'Quando usar Perplexity',
      timestamp: 240,
      duration: 60,
      visualContent: `# Quando usar Perplexity

## 🎯 Use Perplexity para:

### 1. Pesquisa factual
- "Qual a população atual do Brasil?"
- "Quem ganhou o último Oscar de melhor filme?"
- "Preço atual do Bitcoin"

### 2. Pesquisa técnica
- "Como funciona o algoritmo RLHF?"
- "Melhores práticas de segurança em APIs REST 2025"
- "Diferença entre Kubernetes e Docker Swarm"

### 3. Due diligence
- "Histórico da empresa X nos últimos 5 anos"
- "Principais concorrentes de [produto]"
- "Análise SWOT de [empresa]"

### 4. Notícias e atualidades
- "Últimas novidades sobre eleições 2026"
- "Situação atual da guerra na Ucrânia"

### 5. Pesquisa acadêmica
- "Estudos recentes sobre mudanças climáticas"
- "Papers sobre GPT-4 vs Claude 3"

### 6. Comparações de produtos
- "iPhone 15 vs Samsung S24: qual comprar?"
- "Melhores notebooks para programação em 2025"

### 7. Planejamento de viagens
- "Roteiro de 7 dias em Portugal"
- "Melhores épocas para visitar Tailândia"

## ❌ NÃO use Perplexity para:

### Criatividade
→ Use ChatGPT ou Claude
- Escrever histórias
- Brainstorming criativo
- Geração de nomes

### Análise de documentos longos
→ Use Claude
- Revisar contratos
- Analisar código extenso

### Tarefas sem necessidade de fontes
→ Use ChatGPT
- Conversas casuais
- Explicações simples

## Combo poderoso

**Fluxo profissional:**
1. **Perplexity**: Pesquise fatos e dados
2. **ChatGPT**: Crie conteúdo criativo baseado na pesquisa
3. **Claude**: Revise e refine o conteúdo final`
    }
  ]
};
