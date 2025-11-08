import { GuidedLessonData } from '@/types/guidedLesson';

export const fundamentos01: GuidedLessonData = {
  id: 'fundamentos-01',
  title: 'O que é IA e por que você precisa dela',
  trackId: '1',
  trackName: 'Fundamentos da IA',
  duration: 300,
  contentVersion: 1, // Versão do conteúdo (incrementar ao fazer alterações)
  sections: [
    {
      id: 'gancho',
      timestamp: 7,
      speechBubbleText: 'Olá! Eu sou a MAIA, e vou te guiar nesta jornada pela Inteligência Artificial.',
      visualContent: `# Bem-vindo à sua jornada em IA! 👋

Você sabia que **já usa Inteligência Artificial várias vezes por dia**?

Quando você:
- 🎵 Pede uma música por voz no celular
- ✍️ Corrige um texto automaticamente  
- 🛒 Recebe sugestões de produtos para comprar

**Tudo isso é IA trabalhando para você, nos bastidores.**

> Mas aqui está a verdade: enquanto você usa IA sem entender, **outras pessoas já estão usando de forma estratégica** para ganhar mais dinheiro, economizar tempo e criar oportunidades.

**A boa notícia?** Você está no lugar certo para mudar isso agora mesmo.`
    },
    {
      id: 'conceito',
      timestamp: 55,
      speechBubbleText: 'Então, o que é Inteligência Artificial de verdade?',
      visualContent: `## O que é IA de verdade? 🤖

**Inteligência Artificial** são sistemas de computador que **aprendem padrões** observando milhões de exemplos, e depois usam esse aprendizado para tomar decisões ou criar coisas novas.

❌ Não é mágica  
❌ Não é um robô pensante como nos filmes  
✅ É matemática muito bem aplicada

### Exemplo simples:

Você ensina seu filho a reconhecer um cachorro mostrando várias fotos diferentes. Depois de ver muitos exemplos, ele consegue identificar um cachorro novo que nunca viu antes.

**A IA funciona exatamente assim, só que em escala gigantesca:**
- Vê milhões de exemplos
- Aprende os padrões
- Reconhece coisas novas

Por isso:
- 📸 Google Fotos reconhece seu rosto em fotos antigas
- ⌨️ Corretor do celular sabe qual palavra você quis escrever
- 🎬 Netflix recomenda o filme perfeito que você nem sabia que queria

> 💡 **O mais importante:** Você **NÃO precisa** entender a matemática por trás. Você só precisa saber **USAR** essa ferramenta a seu favor.`
    },
    {
      id: 'onde-esta',
      timestamp: 136,
      speechBubbleText: 'Deixa eu te mostrar onde você já usa IA todos os dias sem perceber.',
      visualContent: `## Onde você já usa IA sem perceber 📱

### Entretenimento:
- 🎬 **Netflix** sugere filmes perfeitos para você
- 🎵 **Spotify** cria playlists personalizadas
- 📺 **YouTube** recomenda vídeos

### Dia a dia:
- 🚗 **Waze** calcula a rota mais rápida em tempo real
- 💳 **Banco** detecta compras suspeitas instantaneamente
- 📧 **Email** filtra spam automaticamente

### Redes sociais:
- 📸 **Instagram** sugere conteúdo que você curte
- 💬 **WhatsApp** oferece respostas automáticas
- 🎯 **Facebook** mostra anúncios relevantes

---

**A grande diferença de agora?**

Você pode **conversar DIRETAMENTE** com a IA:
- ✍️ Criar textos profissionais
- 📊 Fazer planilhas complexas
- 💡 Gerar ideias criativas
- 🔧 Resolver problemas difíceis

É como ter um **assistente pessoal disponível 24/7** que sabe sobre praticamente qualquer assunto. **E de graça!**`
    },
    {
      id: 'porque-voce-precisa',
      timestamp: 206,
      speechBubbleText: 'Agora a pergunta de ouro: por que VOCÊ, especificamente, precisa aprender isso agora?',
      visualContent: `## Por que você precisa aprender IA? 💰

### Três motivos muito práticos:

#### 1️⃣ Economia brutal de tempo

Tarefas que levavam **horas** agora levam **minutos**:
- ✉️ Email profissional: **2 minutos**
- 📄 Relatório completo: **5 minutos**
- 📱 Post para redes sociais: **1 minuto**
- 🌍 Traduzir documento: **30 segundos**

**Imagina o que você faz com essas horas extras todo dia.**

#### 2️⃣ Renda extra real

Pessoas comuns, sem formação em tecnologia, estão ganhando **de 5 mil a 20 mil reais extras por mês** oferecendo:
- Criação de conteúdo para empresas
- Legendas para vídeos
- Transcrições de áudio
- Textos para sites e blogs
- Posts profissionais para redes sociais

**A demanda é gigantesca e só está crescendo.** Você pode começar amanhã.

#### 3️⃣ Não ficar para trás

- ✅ Empresas já estão usando IA para tudo
- ✅ Seus concorrentes e colegas já estão usando
- ❌ Quem não souber vai ficar em desvantagem

É como não saber usar computador nos anos 2000. **Quem resistiu perdeu oportunidades enormes.**

> 🎯 A questão não é **SE** você vai usar IA, mas **QUANDO** você vai começar.`
    },
    {
      id: 'proximos-passos',
      timestamp: 297,
      speechBubbleText: 'Então, qual é o seu próximo passo concreto?',
      visualContent: `## Próximos passos 🚀

### O que vem agora?

**Simples:** Daqui a pouquinho, você vai ter sua **primeira conversa real** com uma Inteligência Artificial.

❌ Sem medo  
❌ Sem complicação  
❌ Sem pressão  
✅ Passo a passo guiado

Você vai ver que é **muito mais fácil e natural do que parece.**

É literalmente como mandar mensagem no WhatsApp. **Se você consegue fazer isso, você consegue usar IA perfeitamente.**

---

### Seu primeiro exercício:

Você vai:
1. ✅ Abrir uma conversa com IA
2. ✅ Fazer uma pergunta simples
3. ✅ Ver a resposta aparecer
4. ✅ Entender como funciona na prática

**Preparado para dar o primeiro passo?**

Clique no botão **"Continuar para Exercício"** abaixo!

---

*💡 Lembre-se: Não existe pergunta boba. A IA está aqui para te ajudar. Quanto mais você praticar, melhor vai ficar!* 😊`
    }
  ]
};

// Texto completo para geração de áudio (speechBubbleText + visualContent de cada seção)
export const fundamentos01AudioText = fundamentos01.sections
  .map(section => {
    const parts = [];
    if (section.speechBubbleText) parts.push(section.speechBubbleText);
    if (section.visualContent) parts.push(section.visualContent);
    return parts.join('\n\n');
  })
  .join('\n\n---\n\n');
