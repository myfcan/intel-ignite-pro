import { GuidedLessonData } from '@/types/guidedLesson';

// 🎯 AULA MODELO V2 - Fundamentos 01
// ⏱️ Duração: ~4 minutos (240s) - 5 sessões de ~48s cada
// 🎵 Áudios: 5 arquivos separados (lesson-audios/aula-01/sessao-{1-5}.mp3)
// 📍 Timestamps: Reais acumulados (não fixos)
export const fundamentos01: GuidedLessonData = {
  id: 'fundamentos-01',
  title: 'O que é a IA e por que nós precisamos dela',
  trackId: 'trilha-1-fundamentos',
  trackName: 'Fundamentos da IA',
  duration: 240, // será atualizado após geração
  contentVersion: 2, // V2: áudios separados + timestamps reais
  
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
      title: 'Você já usou IA hoje?',
      instruction: 'Complete as lacunas para descobrir onde a IA já faz parte da sua rotina:',
      data: {
        sentences: [
          {
            id: 'sent-1',
            text: 'Quando eu uso o _______ para achar o melhor caminho, eu estou usando IA.',
            correctAnswers: ['waze', 'Waze', 'GPS', 'gps', 'maps', 'Maps', 'Google Maps'],
            hint: 'Pense no app de navegação que você usa!',
            explanation: 'Exato! O Waze usa IA para prever trânsito e encontrar a melhor rota.'
          },
          {
            id: 'sent-2',
            text: 'Quando eu uso o _______ para ouvir músicas que combinam com meu gosto, eu estou usando IA.',
            correctAnswers: ['spotify', 'Spotify', 'YouTube Music', 'youtube music', 'Deezer', 'deezer', 'Apple Music'],
            hint: 'Pense no app de streaming de música!',
            explanation: 'Isso! O Spotify usa IA para aprender suas preferências musicais.'
          },
          {
            id: 'sent-3',
            text: 'Quando eu uso o _______ do celular para corrigir meus erros de digitação, eu estou usando IA.',
            correctAnswers: ['corretor', 'Corretor', 'corretor automático', 'autocorretor', 'auto-corretor'],
            hint: 'Aquele recurso que corrige suas palavras enquanto você digita!',
            explanation: 'Perfeito! O corretor automático usa IA para prever e corrigir o que você quis escrever.'
          }
        ],
        feedback: {
          allCorrect: '🎯 Perfeito! Você identificou corretamente onde a IA está no seu dia a dia!',
          someCorrect: '👍 Muito bem! Você está começando a perceber a IA ao seu redor!',
          needsReview: '💡 Quase lá! Leia a explicação para entender melhor!'
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
