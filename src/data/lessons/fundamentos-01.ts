import { GuidedLessonData } from '@/types/guidedLesson';

// 🎯 AULA MODELO V2 - Fundamentos 01
// ⏱️ Duração: ~4 minutos (240s) - 5 sessões de ~48s cada
// 🎵 Áudios: 5 arquivos separados (lesson-audios/aula-01/sessao-{1-5}.mp3)
// 📍 Timestamps: Reais acumulados (não fixos)
export const fundamentos01: GuidedLessonData = {
  id: 'fundamentos-01',
  title: 'O que é a IA e por que nós precisamos dela',
  trackId: 'trilha-1-fundamentos',
  trackName: 'Fundamentos de IA',
  duration: 240, // será atualizado após geração
  contentVersion: 3, // V3: exercícios atualizados
  schemaVersion: 1, // 🆕 Para FASE 4
  
  sections: [
    {
      id: 'sessao-1',
      timestamp: 0,
      type: 'text',
      speechBubbleText: 'Olá! Eu sou a MAIA',
      visualContent: `## 🎯 Introdução e Boas-vindas

Olá! Eu sou a MAIA, sua guia nesta jornada pela Inteligência Artificial.

Antes de começarmos, pense nisso: quantas vezes você já usou IA hoje sem perceber?

Quando pediu uma música por voz, corrigiu um texto ou recebeu uma sugestão de compra — tudo isso foi IA trabalhando por você.

A diferença é que agora você vai entender como usar isso de forma estratégica.

Dominar IA não é sobre programar, é sobre saber aplicar.

E nas próximas aulas, você vai ver como isso pode economizar tempo, gerar oportunidades e até criar novas fontes de renda.`
    },
    {
      id: 'sessao-2',
      timestamp: 48, // será atualizado com duração real
      type: 'text',
      speechBubbleText: 'O que é Inteligência Artificial de verdade',
      visualContent: `## 🧠 O que é Inteligência Artificial de verdade

A Inteligência Artificial é uma tecnologia que aprende observando exemplos, como nós.

Ela analisa milhões de dados, descobre padrões e aprende a tomar decisões ou criar coisas novas.

Não é mágica, é aprendizado em escala.

Pense numa criança que aprende o que é um cachorro vendo várias fotos — a IA faz o mesmo, só que em bilhões de exemplos.

É por isso que o corretor do celular entende o que você quis digitar e o Netflix acerta o filme perfeito.

Você não precisa entender a matemática por trás, só precisa saber como usar a ferramenta a seu favor.`
    },
    {
      id: 'sessao-3',
      timestamp: 96, // será atualizado com duração real
      type: 'text',
      speechBubbleText: 'Onde você já usa IA sem perceber',
      visualContent: `## 📱 Onde você já usa IA sem perceber

A IA está em todo lugar:

**Entretenimento:** Netflix recomenda séries que você adora. Spotify cria playlists com seu gosto.

**Dia a dia:** Waze calcula a rota ideal. O banco detecta fraudes antes que você veja.

**Redes sociais:** Instagram sugere o conteúdo que te prende, WhatsApp oferece respostas automáticas.

Tudo isso acontece porque sistemas de IA aprendem com o seu comportamento.

E agora, pela primeira vez, você pode conversar diretamente com essas IAs — pedir textos, ideias, resumos e soluções.

É como ter um assistente pessoal, disponível 24 horas, e gratuito.`
    },
    {
      id: 'sessao-4',
      timestamp: 144, // será atualizado com duração real
      type: 'text',
      speechBubbleText: 'Por que aprender IA agora',
      visualContent: `## ⚡ Por que aprender IA agora

Existem três motivos práticos.

**1️⃣ Tempo:** tarefas de horas agora levam minutos — e-mails, relatórios e textos ficam prontos em segundos.

**2️⃣ Renda:** pessoas comuns estão ganhando de cinco a vinte mil reais por mês oferecendo serviços com IA, como criação de conteúdo e legendas.

**3️⃣ Futuro:** quem aprende antes, ganha vantagem.

Usar IA hoje é como aprender computador nos anos 2000 — quem resistiu, perdeu oportunidades.

A diferença é que agora o impacto é muito mais rápido.

Dominar IA é dominar o próximo passo do mercado.`
    },
    {
      id: 'sessao-5',
      timestamp: 192, // será atualizado com duração real
      type: 'end-audio',
      speechBubbleText: 'O próximo passo',
      visualContent: `## 🚀 O próximo passo

Agora que você entende o que é IA e onde ela está, é hora de testar.

Você vai conversar com uma IA, fazer perguntas simples e ver respostas em tempo real.

Sem medo, sem complicação.

Essa experiência é o primeiro passo para perceber que a IA é acessível — e poderosa.

A partir da próxima aula, vamos usá-la para criar textos, ideias e automatizar tarefas do dia a dia.

Lembre-se: o mais importante não é saber tudo, é começar.

E você acabou de começar.`
    }
  ],
  
  exercisesConfig: [
    // Exercício 1: Fill-in-the-Blanks
    {
      id: 'ex-final-1-aula-1-trilha-1',
      type: 'fill-in-blanks',
      title: 'A IA já trabalha para você',
      instruction: 'Complete as lacunas descobrindo como a IA te ajuda todos os dias:',
      data: {
        sentences: [
          {
            id: 'sent-1',
            text: 'Quando o _______ me sugere um filme perfeito para assistir, é a IA analisando meu histórico.',
            correctAnswers: ['netflix', 'Netflix', 'Prime Video', 'prime video', 'Disney+', 'disney', 'streaming'],
            hint: 'Pense no serviço de filmes e séries que você assiste!',
            explanation: 'Isso mesmo! A Netflix usa IA para entender seu gosto e recomendar conteúdos que você vai adorar.'
          },
          {
            id: 'sent-2',
            text: 'A pasta de _______ do meu e-mail usa IA para filtrar mensagens indesejadas automaticamente.',
            correctAnswers: ['spam', 'Spam', 'lixo eletrônico', 'lixo', 'lixeira'],
            hint: 'Onde vão aquelas mensagens chatas que você não pediu!',
            explanation: 'Perfeito! Os filtros de spam usam IA para identificar e-mails suspeitos antes de chegarem até você.'
          },
          {
            id: 'sent-3',
            text: 'O _______ mostra primeiro as publicações de pessoas que eu mais interajo, graças à IA.',
            correctAnswers: ['instagram', 'Instagram', 'facebook', 'Facebook', 'feed', 'Feed'],
            hint: 'A rede social onde você vê fotos e vídeos dos amigos!',
            explanation: 'Exato! As redes sociais usam IA para organizar seu feed e mostrar o que mais te interessa.'
          }
        ],
        feedback: {
          allCorrect: '🎯 Perfeito! Agora você sabe como a IA trabalha por você nos bastidores!',
          someCorrect: '👍 Muito bem! A IA está mais presente do que você imaginava!',
          needsReview: '💡 Continue aprendendo! Releia as explicações para entender melhor!'
        }
      }
    },
    
    // Exercício 2: Multiple Choice
    {
      id: 'ex-final-2-aula-1-trilha-1',
      type: 'true-false',
      title: 'O que define melhor a Inteligência Artificial?',
      instruction: 'Marque V para verdadeiro ou F para falso:',
      data: {
        statements: [
          {
            id: 'tf-1',
            text: 'A IA é um robô que pensa como uma pessoa',
            correct: false,
            explanation: '❌ FALSO! IA não precisa ser um robô e não pensa igual a pessoas. É um sistema que aprende com exemplos.'
          },
          {
            id: 'tf-2',
            text: 'A IA aprende observando padrões e exemplos',
            correct: true,
            explanation: '✅ VERDADEIRO! A IA aprende com dados e exemplos, identificando padrões para gerar novas respostas.'
          },
          {
            id: 'tf-3',
            text: 'IA é apenas um programa que executa comandos fixos',
            correct: false,
            explanation: '❌ FALSO! Isso seria um programa tradicional. IA APRENDE e se adapta com o tempo.'
          },
          {
            id: 'tf-4',
            text: 'Você precisa entender matemática avançada para usar IA',
            correct: false,
            explanation: '❌ FALSO! Você só precisa saber como usar a ferramenta. A matemática fica por trás dos panos!'
          }
        ],
        feedback: {
          allCorrect: '🎯 Perfeito! Você dominou os conceitos! Todas corretas!',
          someCorrect: '👍 Muito bem! Você acertou {count}! Excelente compreensão!',
          needsReview: '💡 Quase lá! Você acertou {count}. Leia as explicações!'
        }
      }
    },
    
    // Exercício 3: Antes/Depois
    {
      id: 'ex-final-3-aula-1-trilha-1',
      type: 'scenario-selection',
      title: 'Um bom prompt muda tudo',
      instruction: 'Compare os exemplos e escolha qual prompt é mais eficaz:',
      data: {
        scenarios: [
          {
            id: 'scenario-1',
            title: 'Antes',
            description: 'Escreva algo legal.',
            emoji: '❌',
            isCorrect: false,
            feedback: 'Este prompt é muito vago. A IA não sabe o que você quer!'
          },
          {
            id: 'scenario-2',
            title: 'Depois',
            description: 'Crie um e-mail de 3 parágrafos convidando meus clientes para um novo produto, com tom entusiasmado e linguagem simples.',
            emoji: '✅',
            isCorrect: true,
            feedback: 'Exato! Este prompt tem contexto, objetivo, formato e tom. A IA sabe exatamente o que fazer!'
          }
        ],
        correctExplanation: 'Um bom prompt tem CONTEXTO e OBJETIVO. Isso direciona a IA e transforma o resultado!',
        followUpQuestion: 'O que o segundo prompt tem que o primeiro não tem?',
        followUpAnswer: 'Contexto, objetivo, formato específico e tom de voz definido.'
      }
    }
  ]
};

// ============= TEXTO PARA GERAÇÃO DE ÁUDIO =============
// CRITICAL: Este texto é usado para gerar o áudio com ElevenLabs
// NÃO inclua emojis, markdown ou caracteres especiais - apenas texto limpo!
export const fundamentos01AudioText = `
Olá! Eu sou a Maia, e hoje vou te mostrar algo que vai mudar completamente a forma como você vê a tecnologia.

Você sabia que a Inteligência Artificial já está em tudo? No seu celular quando você desbloqueia com o rosto. No Google quando faz uma busca. No Instagram quando aparece um post que você adorou sem nem ter procurado.

A IA não é mais ficção científica. Ela está aqui, agora, e está moldando o mundo ao nosso redor. Desde como fazemos compras até como trabalhamos.

E aqui está a parte mais incrível: você NÃO precisa ser programador ou ter qualquer formação técnica para usar IA a seu favor.

Pense nisso: há 20 anos, saber usar um computador era um diferencial enorme no mercado. Hoje, é o básico.

Nos próximos anos, saber trabalhar com IA vai ser o novo "saber usar computador". E você está começando no momento perfeito!

A revolução da IA é como a chegada da internet nos anos 90. Quem aprendeu cedo teve uma vantagem gigante. Quem esperou demais ficou para trás.

Você está no momento certo de pegar essa onda! E a boa notícia? É mais fácil do que você imagina.

Ao final desta trilha, você vai saber exatamente como a IA funciona e, mais importante, como usar ela no seu dia a dia para economizar tempo, ganhar dinheiro e até criar coisas incríveis.

Vamos começar essa jornada juntos?
`;
