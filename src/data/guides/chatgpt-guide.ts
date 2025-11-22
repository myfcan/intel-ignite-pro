import { GuideV5Data } from '../../types/guide';

export const chatgptGuide: GuideV5Data = {
  id: 'chatgpt-essentials',
  title: 'ChatGPT Essencial',
  description: 'Domine o ChatGPT: da criação de conta até prompts avançados para maximizar seus resultados',
  aiName: 'ChatGPT',
  aiLogo: 'https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg',
  category: 'text',
  difficulty: 'beginner',
  duration: 420, // 7 minutos
  tags: ['chatgpt', 'openai', 'conversational-ai', 'text-generation'],
  sections: [
    {
      id: 'intro',
      title: 'O que é o ChatGPT?',
      timestamp: 0,
      duration: 60,
      visualContent: `# O que é o ChatGPT?

O **ChatGPT** é um chatbot de inteligência artificial desenvolvido pela OpenAI, capaz de:

- 💬 Conversar naturalmente em português
- ✍️ Escrever textos, e-mails e artigos
- 💡 Gerar ideias criativas
- 🔍 Responder perguntas complexas
- 📝 Resumir documentos longos
- 💻 Escrever e debugar código

## Principais versões

- **GPT-3.5**: Versão gratuita, rápida e eficiente
- **GPT-4**: Versão premium, mais precisa e criativa
- **GPT-4o**: Mais recente, com visão e áudio

O ChatGPT foi lançado em novembro de 2022 e já ultrapassou 100 milhões de usuários.`
    },
    {
      id: 'getting-started',
      title: 'Como começar a usar',
      timestamp: 60,
      duration: 60,
      visualContent: `# Como começar a usar

## Passo 1: Criar conta

1. Acesse [chat.openai.com](https://chat.openai.com)
2. Clique em "Sign up"
3. Use e-mail, Google ou Microsoft

## Passo 2: Interface

A interface é simples:
- **Caixa de texto**: Digite sua pergunta
- **Histórico**: Conversas anteriores na lateral
- **New chat**: Inicie nova conversa

## Passo 3: Primeira pergunta

Exemplos para começar:
- "Me explique o que é inteligência artificial em termos simples"
- "Crie um roteiro de estudos para aprender Python em 30 dias"
- "Resuma este artigo: [colar texto]"

💡 **Dica**: Seja específico! Quanto mais detalhes, melhor a resposta.`
    },
    {
      id: 'basic-prompts',
      title: 'Prompts básicos eficazes',
      timestamp: 120,
      duration: 90,
      visualContent: `# Prompts básicos eficazes

## Estrutura de um bom prompt

\`\`\`
[CONTEXTO] + [TAREFA] + [FORMATO] + [RESTRIÇÕES]
\`\`\`

## Exemplos práticos

### ❌ Prompt fraco
"Escreva sobre marketing"

### ✅ Prompt forte
"Atue como especialista em marketing digital. Crie um plano de 30 dias para lançar um curso online de culinária, focando em Instagram e TikTok. Formato: checklist semanal com ações específicas."

## Templates úteis

### Para e-mails
"Escreva um e-mail profissional para [destinatário] sobre [assunto], tom [formal/casual], com no máximo 3 parágrafos."

### Para conteúdo
"Crie 10 títulos chamativos para um post sobre [tema] no LinkedIn, que gerem curiosidade mas sem clickbait."

### Para resumos
"Resuma este texto em 3 bullet points principais: [colar texto]"`
    },
    {
      id: 'advanced-techniques',
      title: 'Técnicas avançadas',
      timestamp: 210,
      duration: 90,
      visualContent: `# Técnicas avançadas

## 1. Personas (Role-playing)

Faça o ChatGPT assumir um papel:

- "Atue como um advogado especializado em contratos..."
- "Você é um professor de física explicando para uma criança de 10 anos..."
- "Como um chef com 20 anos de experiência, sugira..."

## 2. Chain of Thought (Passo a passo)

Peça para o ChatGPT pensar em etapas:

"Resolva este problema mostrando seu raciocínio passo a passo: [problema]"

## 3. Few-shot Learning (Exemplos)

Forneça exemplos do que você quer:

\`\`\`
Converta frases para tom profissional:

Entrada: "vc pode me ajudar com isso?"
Saída: "Poderia me auxiliar com esta questão?"

Entrada: "preciso disso pra ontem"
Saída: [ChatGPT completa]
\`\`\`

## 4. Iteração

Refine as respostas:
- "Torne mais formal"
- "Reduza para 50 palavras"
- "Adicione emojis"`
    },
    {
      id: 'use-cases',
      title: 'Casos de uso práticos',
      timestamp: 300,
      duration: 60,
      visualContent: `# Casos de uso práticos

## 📧 Produtividade
- Redigir e-mails profissionais
- Criar agendas de reuniões
- Gerar templates de documentos
- Traduzir textos

## 🎨 Criatividade
- Brainstorming de ideias
- Roteiros para vídeos
- Legendas para redes sociais
- Histórias e narrativas

## 💼 Negócios
- Análise SWOT
- Planos de negócios
- Descrições de produtos
- Scripts de vendas

## 📚 Educação
- Explicar conceitos complexos
- Criar flashcards
- Gerar questões de estudo
- Revisar textos acadêmicos

## 💻 Programação
- Escrever código
- Debugar erros
- Explicar funções
- Converter entre linguagens`
    },
    {
      id: 'limitations',
      title: 'Limitações e boas práticas',
      timestamp: 360,
      duration: 60,
      visualContent: `# Limitações e boas práticas

## ⚠️ Limitações do ChatGPT

### Conhecimento limitado
- Dados de treinamento até **janeiro de 2025** (GPT-4)
- Não acessa internet em tempo real (versão base)
- Pode estar desatualizado sobre eventos recentes

### Pode "alucinar"
- Às vezes inventa fatos que parecem verdadeiros
- **Sempre verifique** informações importantes
- Peça fontes quando possível

### Sem emoções reais
- Simula empatia, mas não tem sentimentos
- Não substitui terapia ou aconselhamento profissional

## ✅ Boas práticas

1. **Verifique fatos críticos** (médicos, jurídicos, financeiros)
2. **Seja ético**: Não use para desinformação
3. **Proteja privacidade**: Não compartilhe dados sensíveis
4. **Itere**: Refine prompts até obter o resultado desejado
5. **Combine com sua expertise**: Use como assistente, não substituto

## 💰 Versão gratuita vs paga

**Gratuita (GPT-3.5)**
- Ilimitada
- Mais rápida
- Boa para tarefas simples

**Plus - $20/mês (GPT-4)**
- Respostas mais precisas
- Acesso prioritário
- Plugins e navegação web
- Análise de imagens`
    }
  ]
};
