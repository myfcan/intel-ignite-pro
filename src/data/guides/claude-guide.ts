import { GuideV5Data } from '../../types/guide';

export const claudeGuide: GuideV5Data = {
  id: 'claude-essentials',
  title: 'Claude Essencial',
  description: 'Aprenda a usar o Claude da Anthropic: a IA focada em conversas longas, análise de documentos e segurança',
  aiName: 'Claude',
  aiLogo: 'https://www.anthropic.com/images/icons/claude-avatar.svg',
  category: 'text',
  difficulty: 'beginner',
  duration: 360, // 6 minutos
  tags: ['claude', 'anthropic', 'ai-assistant', 'document-analysis'],
  sections: [
    {
      id: 'intro',
      title: 'O que é o Claude?',
      timestamp: 0,
      duration: 60,
      visualContent: `# O que é o Claude?

O **Claude** é um assistente de IA desenvolvido pela Anthropic, conhecido por:

- 📄 **Contexto gigante**: Analisa até 200 mil tokens (~150 mil palavras)
- 🔒 **Segurança**: Foco em respostas éticas e confiáveis
- 💬 **Conversas longas**: Mantém contexto em discussões extensas
- 📊 **Análise profunda**: Excelente para documentos e pesquisas
- 💻 **Código limpo**: Escreve código bem estruturado

## Versões disponíveis

- **Claude 3 Haiku**: Mais rápido e econômico
- **Claude 3 Sonnet**: Balanceado (velocidade + qualidade)
- **Claude 3 Opus**: Mais inteligente, para tarefas complexas
- **Claude 3.5 Sonnet**: Versão mais recente e poderosa

## Diferencial do Claude

Enquanto o ChatGPT é generalista, o Claude se destaca em:
- Análise de documentos longos
- Raciocínio complexo
- Tarefas que exigem precisão ética`
    },
    {
      id: 'getting-started',
      title: 'Como acessar o Claude',
      timestamp: 60,
      duration: 60,
      visualContent: `# Como acessar o Claude

## Opção 1: Claude.ai (Web)

1. Acesse [claude.ai](https://claude.ai)
2. Faça login com Google ou e-mail
3. Comece a conversar

**Planos:**
- **Gratuito**: Acesso ao Claude 3.5 Sonnet (com limites)
- **Pro ($20/mês)**: 5x mais uso + acesso prioritário

## Opção 2: API (Desenvolvedores)

Para integrar em aplicações:
1. Acesse [console.anthropic.com](https://console.anthropic.com)
2. Gere API key
3. Use na sua aplicação

## Interface

- **Projetos**: Organize conversas por tema
- **Upload de arquivos**: Até 5 PDFs, imagens ou documentos por vez
- **Modo de conversa**: Similar ao ChatGPT, mas com mais contexto

💡 **Dica**: Use a versão web gratuita para testar antes de pagar!`
    },
    {
      id: 'document-analysis',
      title: 'Análise de documentos',
      timestamp: 120,
      duration: 90,
      visualContent: `# Análise de documentos (superpoder do Claude)

## Por que o Claude é melhor para documentos?

- **Contexto gigante**: Aceita textos MUITO longos
- **Precisão**: Cita trechos específicos
- **Organização**: Estrutura respostas complexas

## Como usar

### 1. Upload direto
- Arraste PDF, DOCX, TXT, CSV
- Claude lê e entende o conteúdo
- Faça perguntas sobre o documento

### 2. Colar texto
\`\`\`
Analise este contrato e identifique:
1. Cláusulas de rescisão
2. Penalidades
3. Pontos de atenção

[COLAR CONTRATO COMPLETO]
\`\`\`

## Exemplos práticos

### Análise jurídica
"Resuma este contrato de 50 páginas em bullet points principais, destacando obrigações e riscos."

### Pesquisa acadêmica
"Extraia as 10 principais conclusões deste paper científico e explique em linguagem simples."

### Relatórios
"Compare estes 3 relatórios financeiros e identifique tendências e discrepâncias."

### Código
"Revise este código de 2000 linhas e sugira melhorias de performance e segurança."`
    },
    {
      id: 'advanced-prompts',
      title: 'Prompts avançados',
      timestamp: 210,
      duration: 90,
      visualContent: `# Prompts avançados para Claude

## 1. Projetos (Projects)

Crie contexto permanente para um projeto:

\`\`\`
Projeto: Blog de Tecnologia

Contexto:
- Público: Desenvolvedores júnior
- Tom: Didático, sem jargões
- Formato: Artigos de 800-1200 palavras
- Foco: JavaScript e React

Tarefa: Gere ideias de artigos para março
\`\`\`

## 2. Análise em etapas

Para raciocínio complexo:

\`\`\`
Use o seguinte processo:
1. Analise o problema
2. Liste possíveis soluções
3. Avalie prós e contras de cada
4. Recomende a melhor opção
5. Explique o raciocínio

Problema: [descrever]
\`\`\`

## 3. Extração de dados

Claude é excelente para estruturar informações:

\`\`\`
Extraia desta conversa de suporte:
- Nome do cliente
- Problema relatado
- Data do incidente
- Status de resolução
- Próximos passos

Formato: JSON

[COLAR CONVERSA]
\`\`\`

## 4. Revisão crítica

\`\`\`
Atue como revisor técnico sênior.
Analise este artigo e forneça:
1. Erros factuais
2. Imprecisões técnicas
3. Melhorias de clareza
4. Sugestões de estrutura

[COLAR ARTIGO]
\`\`\``
    },
    {
      id: 'use-cases',
      title: 'Quando usar Claude vs ChatGPT',
      timestamp: 300,
      duration: 60,
      visualContent: `# Quando usar Claude vs ChatGPT

## 🎯 Use Claude quando precisar:

### Análise profunda
- Contratos, relatórios, pesquisas
- Documentos técnicos longos
- Comparação de múltiplos arquivos

### Raciocínio complexo
- Problemas que exigem lógica em múltiplas etapas
- Análise ética ou filosófica
- Tomada de decisão estruturada

### Código de qualidade
- Projetos que exigem código limpo
- Revisão de arquitetura
- Documentação técnica

### Conversas longas
- Discussões que exigem muito contexto
- Brainstorming extenso
- Aprendizado iterativo

## 💬 Use ChatGPT quando precisar:

- Respostas rápidas e criativas
- Geração de imagens (DALL-E)
- Plugins e integrações
- Navegação web em tempo real
- Tarefas mais casuais

## 💡 Pode usar ambos!

Muitos profissionais usam:
- **ChatGPT**: Criatividade, velocidade, rascunhos
- **Claude**: Análise, revisão, refinamento`
    }
  ]
};
