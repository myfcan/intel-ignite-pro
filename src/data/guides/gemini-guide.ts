import { GuideV5Data } from '../../types/guide';

export const geminiGuide: GuideV5Data = {
  id: 'gemini-essentials',
  title: 'Google Gemini Essencial',
  description: 'Domine o Gemini: a IA do Google integrada ao ecossistema completo (Gmail, Docs, YouTube e mais)',
  aiName: 'Gemini',
  aiLogo: 'https://www.gstatic.com/lamda/images/gemini_sparkle_v002_d4735304ff6292a690345.svg',
  category: 'text',
  difficulty: 'beginner',
  duration: 360, // 6 minutos
  tags: ['gemini', 'google', 'multimodal', 'integration'],
  sections: [
    {
      id: 'intro',
      title: 'O que é o Gemini?',
      timestamp: 0,
      duration: 60,
      visualContent: `# O que é o Google Gemini?

O **Gemini** é a IA mais recente do Google, projetada para ser:

- 🔗 **Integrada**: Funciona com Gmail, Docs, Sheets, Drive, YouTube
- 🎨 **Multimodal**: Entende texto, imagem, áudio e vídeo
- 🌍 **Conectada**: Acessa informações em tempo real via Google Search
- 📱 **Multiplataforma**: Web, app Android/iOS, extensions no Chrome
- 🆓 **Acessível**: Versão gratuita robusta

## Versões do Gemini

- **Gemini 1.5 Flash**: Ultra-rápido, ideal para tarefas simples
- **Gemini 1.5 Pro**: Balanceado, contexto de 1 milhão de tokens
- **Gemini 2.0**: Versão experimental mais avançada

## Principal diferencial

O Gemini não é só um chatbot - é um **assistente integrado ao seu dia a dia no Google**.

Exemplos:
- Resumir e-mails longos no Gmail
- Criar apresentações no Google Slides
- Analisar planilhas complexas
- Buscar informações atualizadas na web`
    },
    {
      id: 'getting-started',
      title: 'Como começar com Gemini',
      timestamp: 60,
      duration: 60,
      visualContent: `# Como começar com Gemini

## Acesso básico

1. Acesse [gemini.google.com](https://gemini.google.com)
2. Faça login com conta Google
3. Comece a conversar

## Planos disponíveis

### Gratuito
- Gemini 1.5 Flash
- Gemini 1.5 Pro (limitado)
- Acesso via web e app

### Google One AI Premium ($19.99/mês)
- Gemini Advanced (versão mais inteligente)
- 2TB de armazenamento Google One
- Integração com Gmail, Docs, Sheets
- Suporte prioritário

## Primeiros passos

### Interface web
- Digite perguntas na caixa de texto
- Use @ para acessar ferramentas Google
- Ative extensões para integrações

### App mobile
- Disponível na Play Store e App Store
- Substituir Google Assistant (opcional)
- Usar por voz ou texto

💡 **Dica**: Conecte com suas ferramentas Google para máximo poder!`
    },
    {
      id: 'google-workspace',
      title: 'Integração com Google Workspace',
      timestamp: 120,
      duration: 90,
      visualContent: `# Integração com Google Workspace

## Como ativar extensões

1. No Gemini, clique no ícone de extensões
2. Ative: Gmail, Drive, Docs, YouTube, Maps, Flights, Hotels
3. Dê permissões necessárias

## Casos de uso poderosos

### Gmail
\`\`\`
@Gmail resuma os e-mails não lidos de hoje e destaque os urgentes
\`\`\`

\`\`\`
@Gmail encontre aquele e-mail sobre "proposta de orçamento" da semana passada
\`\`\`

### Google Docs
\`\`\`
@Docs crie um relatório baseado nas anotações do documento "Reunião Q1 2025"
\`\`\`

### Google Drive
\`\`\`
@Drive liste todos os PDFs relacionados a "marketing" criados em janeiro
\`\`\`

### YouTube
\`\`\`
@YouTube resuma os principais pontos do vídeo [URL]
\`\`\`

### Google Maps
\`\`\`
@Maps planeje uma rota de São Paulo a Campinas evitando pedágios
\`\`\`

## Produtividade máxima

Combine múltiplas ferramentas:

\`\`\`
Use @Gmail para encontrar a conversa com João sobre o projeto X, depois use @Docs para criar um resumo executivo
\`\`\``
    },
    {
      id: 'multimodal',
      title: 'Recursos multimodais',
      timestamp: 210,
      duration: 90,
      visualContent: `# Recursos multimodais do Gemini

## 1. Análise de imagens

### Upload de foto
- Arraste imagem para o chat
- Gemini identifica objetos, texto, contexto

**Exemplos:**
\`\`\`
[Upload de foto de receita escrita à mão]
"Transcreva esta receita e converta as medidas para gramas"
\`\`\`

\`\`\`
[Upload de gráfico]
"Explique as tendências deste gráfico e sugira insights"
\`\`\`

\`\`\`
[Upload de código em screenshot]
"Identifique bugs neste código e sugira correções"
\`\`\`

## 2. Vídeos do YouTube

Gemini pode analisar vídeos:

\`\`\`
Resuma este vídeo de 2 horas em 10 bullet points: [URL]
\`\`\`

\`\`\`
Extraia o código mostrado neste tutorial: [URL]
\`\`\`

## 3. Áudio (experimental)

Em versões mais recentes:
- Conversas por voz
- Transcrição de áudios

## 4. Geração de imagens (Gemini Advanced)

Com plano pago:
\`\`\`
Gere uma imagem de um gato astronauta flutuando no espaço, estilo cartoon
\`\`\`

## Contexto gigante

Gemini 1.5 Pro aceita:
- **1 milhão de tokens** = ~700 mil palavras
- Análise de vídeos de até 1 hora
- PDFs de centenas de páginas`
    },
    {
      id: 'advanced-tips',
      title: 'Dicas avançadas',
      timestamp: 300,
      duration: 60,
      visualContent: `# Dicas avançadas para Gemini

## 1. Busca em tempo real

Gemini acessa Google Search automaticamente:

\`\`\`
Quais as notícias mais importantes sobre IA hoje?
\`\`\`

\`\`\`
Compare preços de iPhone 15 nas principais lojas brasileiras
\`\`\`

## 2. Automação de tarefas

Use para automatizar fluxos:

\`\`\`
Todos os dias às 9h, resuma meus e-mails não lidos e crie uma lista de tarefas
\`\`\`

## 3. Aprendizado personalizado

\`\`\`
Você é meu tutor de Python. Explique conceitos usando exemplos práticos do meu projeto [descrever]
\`\`\`

## 4. Extensão Chrome

Instale a extensão "Gemini for Google Workspace":
- Resuma páginas web
- Gere e-mails diretamente no Gmail
- Analise dados no Sheets

## 5. Compartilhamento

- Compartilhe conversas via link
- Exporte para Google Docs
- Colabore com equipe

## Limitações

⚠️ **Cuidado:**
- Não use para informações sensíveis (o Google pode ver)
- Verifique fatos importantes
- Respostas podem variar com atualizações`
    }
  ]
};
