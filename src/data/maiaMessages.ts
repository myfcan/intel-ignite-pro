// src/data/maiaMessages.ts
// Sistema completo de mensagens contextuais da Liv

export type MaiaMessageType = 'welcome' | 'progress' | 'completed' | 'encouragement';

export interface TrailMessages {
  welcome: string;
  progress: string;
  completed: string;
  description: string;
}

// Mensagens por trilha
export const trailMessages: Record<string, TrailMessages> = {
  fundamentos: {
    welcome: "Você está começando sua jornada na IA! 🚀 Nesta trilha, você vai descobrir os fundamentos que vão transformar a forma como você trabalha e vive. Prepare-se para algo incrível!",
    progress: "UAU! Você está indo muito bem! 🌟 Já entendeu os conceitos básicos e está pronto para ir além. Continue assim, a cada aula você está mais próximo de dominar a IA!",
    completed: "PARABÉNS! 🎉 Você concluiu os Fundamentos! Agora você entende como a IA funciona e está pronto para aplicá-la no seu dia a dia. Que orgulho da sua evolução!",
    description: "Os alicerces da IA que vão mudar sua vida"
  },
  
  diaadia: {
    welcome: "Pronto para economizar HORAS do seu dia? ⏰ Nesta trilha, você vai aprender a usar IA nas tarefas do cotidiano. Prepare-se para ter mais tempo para o que realmente importa!",
    progress: "Incrível! 💪 Você já está aplicando IA no seu dia a dia! Vejo que está pegando o jeito. Continue praticando, em breve isso será natural para você!",
    completed: "FANTÁSTICO! ✨ Você dominou o uso de IA no dia a dia! Agora você tem um super-poder: fazer em minutos o que antes levava horas. Sua produtividade nunca mais será a mesma!",
    description: "Transforme suas tarefas diárias com IA"
  },
  
  negocios: {
    welcome: "Vamos impulsionar seus negócios! 📈 Nesta trilha, você vai descobrir como a IA pode aumentar suas vendas, melhorar seu atendimento e fazer seu negócio crescer. Preparado para decolar?",
    progress: "Sensacional! 🚀 Você está evoluindo rápido! Já consegue ver como a IA pode transformar seus resultados? Continue assim, cada aula te aproxima de um negócio mais lucrativo!",
    completed: "VOCÊ É DEMAIS! 🏆 Concluiu IA nos Negócios! Agora você tem ferramentas poderosas para aumentar suas vendas e produtividade. Seu negócio vai para outro nível!",
    description: "Potencialize seus resultados profissionais"
  },
  
  rendaextra: {
    welcome: "Hora de ganhar dinheiro com IA! 💰 Nesta trilha, você vai aprender formas práticas de gerar renda extra oferecendo serviços com IA. Seu primeiro cliente está mais perto do que imagina!",
    progress: "ARRASOU! 🌟 Você está no caminho certo! Já sabe como transformar IA em dinheiro. Continue firme, sua primeira venda está próxima!",
    completed: "INCRÍVEL! 🎊 Você completou Renda Extra com IA! Agora você tem todas as ferramentas para começar a ganhar dinheiro. Sua jornada como prestador de serviços de IA começa AGORA!",
    description: "Transforme IA em fonte de renda"
  },
  
  conteudo: {
    welcome: "Vamos criar conteúdo profissional! ✍️ Nesta trilha, você vai aprender a produzir textos, posts e materiais incríveis em minutos. Prepare-se para impressionar!",
    progress: "MARAVILHOSO! 🎨 Seu conteúdo está cada vez melhor! Você já domina as técnicas e está criando material de qualidade. Continue assim, você é um criador de conteúdo com IA!",
    completed: "BRILHANTE! ⭐ Você é oficialmente um criador de conteúdo com IA! Agora você cria em minutos o que levaria horas. Seu conteúdo vai se destacar!",
    description: "Crie conteúdo profissional em minutos"
  },
  
  automacoes: {
    welcome: "Hora de automatizar! 🤖 Nesta trilha, você vai aprender a fazer a IA trabalhar para você, automatizando tarefas repetitivas. Prepare-se para ter MUITO mais tempo livre!",
    progress: "EXCELENTE! ⚡ Você está dominando as automações! Suas tarefas estão ficando mais rápidas a cada dia. Continue assim, logo você terá horas extras no seu dia!",
    completed: "VOCÊ É UM MESTRE! 🎯 Concluiu Automações Práticas! Agora você sabe fazer a IA trabalhar por você. Seu tempo é precioso e você conquistou isso!",
    description: "Automatize e ganhe tempo"
  },
  
  criativa: {
    welcome: "Solte sua criatividade! 🎨 Nesta trilha, você vai criar imagens, vídeos e arte com IA. Prepare-se para ver suas ideias ganharem vida de formas surpreendentes!",
    progress: "QUE TALENTO! 🌈 Suas criações estão ficando cada vez mais impressionantes! Você está liberando todo seu potencial criativo com IA. Continue criando!",
    completed: "ARTISTA! 🖼️ Você completou IA Criativa! Agora você cria arte, imagens e conteúdo visual profissional com IA. Seu potencial criativo não tem limites!",
    description: "Crie arte e conteúdo visual com IA"
  },
  
  etica: {
    welcome: "Vamos usar IA com responsabilidade! 🛡️ Nesta trilha, você vai entender os limites, cuidados e melhores práticas no uso de IA. Conhecimento é poder, e poder exige responsabilidade!",
    progress: "CONSCIENTE! 🧠 Você está aprendendo a usar IA de forma ética e responsável. Isso te diferencia! Continue, você está se tornando um usuário exemplar de IA!",
    completed: "RESPONSÁVEL! 🏅 Você concluiu Ética e IA! Agora você domina não só a técnica, mas também a responsabilidade no uso de IA. Você é um exemplo!",
    description: "Use IA de forma ética e segura"
  }
};

// Mensagens de encorajamento gerais (aparecem aleatoriamente)
export const encouragementMessages = [
  "Você está evoluindo a cada aula! 💪",
  "Seu progresso é inspirador! Continue assim! 🌟",
  "Que dedicação! Você está arrasando! 🚀",
  "Cada passo te aproxima do seu objetivo! 🎯",
  "Sua jornada está sendo incrível! ✨",
  "Você está no caminho certo! Siga firme! 🔥",
  "Que orgulho da sua evolução! 🎓",
  "Você está fazendo acontecer! 💫"
];

// Mensagens por marco de progresso
export const milestoneMessages = {
  firstLesson: "🎉 Primeira aula concluída! Você deu o primeiro passo de uma jornada incrível!",
  halfwayTrail: "🔥 Você já está na metade desta trilha! Continue assim, você consegue!",
  firstTrail: "🏆 Sua primeira trilha completa! Isso é só o começo, você é capaz de muito mais!",
  threeTrails: "🌟 Três trilhas concluídas! Você está se tornando um expert em IA!",
  allTrails: "👑 TODAS AS TRILHAS CONCLUÍDAS! Você é oficialmente um Mestre da IA! Parabéns pela dedicação e persistência!"
};

// Mensagens de boas-vindas gerais (primeira vez)
export const firstTimeMessages = {
  welcome: "Olá! Eu sou a Liv, sua companheira nesta jornada! 🤖✨ Estou aqui para te guiar, apoiar e comemorar cada conquista sua. Juntos, vamos dominar a Inteligência Artificial!",
  motivation: "Você está prestes a começar algo que vai transformar sua vida. A IA não é complicada quando você tem o guia certo. E eu estarei com você em cada passo! 💙"
};

// Mensagens de retorno (usuário que já começou)
export const returningUserMessages = [
  "Que bom te ver de volta! 😊 Pronto para continuar sua jornada?",
  "Olá novamente! 👋 Vamos continuar de onde paramos?",
  "Bem-vindo de volta! 🌟 Sua jornada te espera!",
  "Você voltou! 🎉 Vamos continuar conquistando novos conhecimentos?"
];

// Função helper para pegar mensagem contextual
export const getMaiaMessage = (
  trailId: string,
  type: MaiaMessageType,
  isFirstTime: boolean = false
): string => {
  if (isFirstTime) {
    return firstTimeMessages.welcome;
  }
  
  const trail = trailMessages[trailId];
  if (!trail) {
    return "Bem-vindo! Vamos aprender algo incrível sobre Inteligência Artificial!";
  }
  
  switch (type) {
    case 'welcome':
      return trail.welcome;
    case 'progress':
      return trail.progress;
    case 'completed':
      return trail.completed;
    case 'encouragement':
      return encouragementMessages[Math.floor(Math.random() * encouragementMessages.length)];
    default:
      return trail.welcome;
  }
};

export const defaultMessage = "Bem-vindo! Vamos aprender algo incrível sobre Inteligência Artificial!";
