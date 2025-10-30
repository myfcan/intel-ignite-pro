export const onboardingQuestions = [
  {
    id: 'age',
    question: 'Qual é a sua faixa etária?',
    subtitle: 'Vamos personalizar o conteúdo de acordo com seu perfil',
    type: 'single-choice' as const,
    options: [
      { value: '18-24', label: '18-24 anos', emoji: '👶' },
      { value: '25-34', label: '25-34 anos', emoji: '🧑' },
      { value: '35-44', label: '35-44 anos', emoji: '⭐', highlight: true, badge: 'Nosso foco!' },
      { value: '45+', label: '45+ anos', emoji: '👴' }
    ]
  },
  {
    id: 'goal',
    question: 'O que você mais quer alcançar?',
    type: 'single-choice' as const,
    options: [
      { value: 'income', label: 'Gerar renda extra', emoji: '💰' },
      { value: 'growth', label: 'Crescimento profissional', emoji: '🚀' },
      { value: 'productivity', label: 'Aumentar produtividade', emoji: '⚡' },
      { value: 'future', label: 'Planejar meu futuro', emoji: '🏠' },
      { value: 'learning', label: 'Aprender algo novo', emoji: '🧠' }
    ]
  },
  {
    id: 'intimidated',
    question: 'Você se sente intimidado com IA?',
    type: 'single-choice' as const,
    options: [
      { value: 'always', label: 'Sim, sempre', emoji: '😓' },
      { value: 'sometimes', label: 'Sim, às vezes', emoji: '😰' },
      { value: 'rarely', label: 'Raramente', emoji: '😐' },
      { value: 'never', label: 'Não, me sinto à vontade', emoji: '😎' }
    ]
  },
  {
    id: 'knowledge',
    question: 'Qual seu nível de conhecimento em ferramentas de IA?',
    type: 'single-choice' as const,
    options: [
      { value: 'none', label: 'Nenhum', subtitle: 'Nunca usei', emoji: '😬' },
      { value: 'beginner', label: 'Iniciante', subtitle: 'Já ouvi falar', emoji: '🤔' },
      { value: 'intermediate', label: 'Intermediário', subtitle: 'Uso às vezes', emoji: '😊' },
      { value: 'advanced', label: 'Avançado', subtitle: 'Uso com frequência', emoji: '😎' }
    ]
  },
  {
    id: 'tools',
    question: 'Quais ferramentas de IA você já conhece?',
    subtitle: 'Escolha todas que se aplicam',
    type: 'multiple-choice' as const,
    options: [
      { value: 'chatgpt', label: 'ChatGPT', emoji: '🤖' },
      { value: 'claude', label: 'Claude', emoji: '🔵' },
      { value: 'gemini', label: 'Google Gemini', emoji: '💎' },
      { value: 'midjourney', label: 'Midjourney', emoji: '🎨' },
      { value: 'dalle', label: 'DALL-E', emoji: '🖼️' },
      { value: 'none', label: 'Sou novo em ferramentas de IA', emoji: '🤷' }
    ]
  },
  {
    id: 'fear',
    question: 'Você tem medo de ser substituído pela IA no trabalho?',
    type: 'single-choice' as const,
    options: [
      { value: 'always', label: 'Sim, muito', emoji: '😰' },
      { value: 'sometimes', label: 'Sim, às vezes', emoji: '😟' },
      { value: 'unsure', label: 'Não tenho certeza', emoji: '🤔' },
      { value: 'never', label: 'Não, porque sei usar IA', emoji: '😌' }
    ]
  },
  {
    id: 'interests',
    question: 'Em quais áreas você quer usar IA?',
    subtitle: 'Escolha todas que interessam',
    type: 'multiple-choice' as const,
    options: [
      { value: 'content', label: 'Criação de conteúdo', emoji: '✍️' },
      { value: 'social', label: 'Redes sociais', emoji: '📱' },
      { value: 'business', label: 'Negócios e vendas', emoji: '💼' },
      { value: 'design', label: 'Design gráfico', emoji: '🎨' },
      { value: 'video', label: 'Vídeos e multimídia', emoji: '📹' },
      { value: 'data', label: 'Análise de dados', emoji: '📊' },
      { value: 'support', label: 'Atendimento ao cliente', emoji: '💬' },
      { value: 'email', label: 'E-mail marketing', emoji: '📧' }
    ]
  }
];
