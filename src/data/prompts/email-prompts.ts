import { PromptCategory } from '../../types/prompt';

export const emailPromptsCategory: PromptCategory = {
  id: 'email',
  name: 'Escrita de E-mail',
  description: 'Prompts profissionais para e-mails de negócios, networking e comunicação',
  icon: 'Mail',
  color: 'bg-blue-500',
  isPopular: true,
  prompts: [
    {
      id: 'email-cold-outreach',
      categoryId: 'email',
      title: 'Cold Email Profissional',
      description: 'Template para primeiros contatos profissionais que geram resposta',
      template: `Escreva um e-mail de primeiro contato profissional com as seguintes características:

Destinatário: {recipient}
Empresa/Cargo: {company}
Objetivo: {objective}
Tom: {tone}

Estrutura:
- Assunto chamativo (máximo 50 caracteres)
- Introdução breve (quem sou e por que estou entrando em contato)
- Proposta de valor clara
- Call-to-action específico
- Fechamento profissional

Regras:
- Máximo 150 palavras
- Personalizado (mencione algo específico sobre {recipient} ou {company})
- Sem buzzwords genéricos
- Foco no valor para o destinatário, não em mim`,
      variables: [
        {
          name: 'recipient',
          label: 'Nome do destinatário',
          placeholder: 'Ex: João Silva',
          type: 'text',
          required: true
        },
        {
          name: 'company',
          label: 'Empresa ou cargo do destinatário',
          placeholder: 'Ex: CEO da TechCorp',
          type: 'text',
          required: true
        },
        {
          name: 'objective',
          label: 'Objetivo do e-mail',
          placeholder: 'Ex: Agendar reunião, propor parceria, pedir feedback',
          type: 'text',
          required: true
        },
        {
          name: 'tone',
          label: 'Tom de voz',
          placeholder: 'Ex: Formal, casual-profissional, direto',
          type: 'select',
          options: ['Formal', 'Casual-profissional', 'Direto', 'Amigável'],
          required: true
        }
      ],
      examples: [
        {
          title: 'Parceria com influenciador',
          input: {
            recipient: 'Marina Costa',
            company: 'Criadora de conteúdo tech com 100k seguidores',
            objective: 'Propor parceria para review de produto',
            tone: 'Casual-profissional'
          },
          output: `**Assunto:** Parceria TechFlow x Marina - review autêntico?

Oi Marina!

Acompanho seu conteúdo há meses e adorei seu último vídeo sobre produtividade. Sou da TechFlow e criamos um app de gestão de tempo que combina perfeitamente com seu público.

Gostaria de enviar uma licença premium gratuita para você testar sem compromisso. Se gostar, podemos conversar sobre uma parceria autêntica - sem roteiros forçados, só sua opinião honesta.

Topa receber o acesso e darmos uma call de 15min?

Abraço,
[Seu nome]`
        }
      ],
      tags: ['cold-email', 'networking', 'business', 'outreach'],
      difficulty: 'intermediate',
      isPremium: false,
      isFeatured: true,
      usageCount: 1247
    },
    {
      id: 'email-follow-up',
      categoryId: 'email',
      title: 'E-mail de Follow-up',
      description: 'Reforce seu contato sem ser insistente',
      template: `Escreva um e-mail de follow-up profissional:

Contexto: {context}
Tempo desde último contato: {days}
Objetivo do follow-up: {goal}

Estrutura:
- Assunto que referencia conversa anterior
- Relembrar brevemente o contexto
- Adicionar novo valor (insight, artigo, informação útil)
- Pergunta ou próximo passo claro
- Dar "saída educada" caso não tenha interesse

Tom: Respeitoso, não pressiona, adiciona valor`,
      variables: [
        {
          name: 'context',
          label: 'Contexto do contato anterior',
          placeholder: 'Ex: Enviei proposta de parceria há 2 semanas',
          type: 'textarea',
          required: true
        },
        {
          name: 'days',
          label: 'Dias desde o último contato',
          placeholder: 'Ex: 7 dias',
          type: 'text',
          required: true
        },
        {
          name: 'goal',
          label: 'Objetivo deste follow-up',
          placeholder: 'Ex: Agendar reunião, obter feedback',
          type: 'text',
          required: true
        }
      ],
      examples: [],
      tags: ['follow-up', 'networking', 'persistence'],
      difficulty: 'beginner',
      isPremium: false,
      usageCount: 892
    },
    {
      id: 'email-resignation',
      categoryId: 'email',
      title: 'E-mail de Demissão Profissional',
      description: 'Comunique sua saída mantendo boas relações',
      template: `Escreva um e-mail de demissão profissional:

Nome do gestor: {manager}
Cargo atual: {position}
Data de aviso: {notice_period}
Motivo (opcional): {reason}

Incluir:
- Agradecimento pela oportunidade
- Comunicação clara da decisão
- Período de aviso prévio
- Oferta de transição suave
- Despedida positiva

Tom: Grato, profissional, positivo (mesmo se experiência foi negativa)`,
      variables: [
        {
          name: 'manager',
          label: 'Nome do gestor',
          placeholder: 'Ex: Carlos Mendes',
          type: 'text',
          required: true
        },
        {
          name: 'position',
          label: 'Seu cargo atual',
          placeholder: 'Ex: Desenvolvedor Frontend',
          type: 'text',
          required: true
        },
        {
          name: 'notice_period',
          label: 'Período de aviso prévio',
          placeholder: 'Ex: 30 dias',
          type: 'text',
          required: true
        },
        {
          name: 'reason',
          label: 'Motivo da saída (opcional)',
          placeholder: 'Ex: Nova oportunidade, crescimento pessoal',
          type: 'textarea',
          required: false
        }
      ],
      examples: [],
      tags: ['demissão', 'carreira', 'profissional'],
      difficulty: 'intermediate',
      isPremium: false,
      usageCount: 531
    },
    {
      id: 'email-complaint',
      categoryId: 'email',
      title: 'Reclamação Profissional',
      description: 'Expresse insatisfação de forma construtiva e eficaz',
      template: `Escreva um e-mail de reclamação profissional sobre:

Empresa/Serviço: {company}
Problema: {issue}
Impacto: {impact}
Solução desejada: {solution}

Estrutura:
- Assunto claro e objetivo
- Descrição factual do problema (sem emoção)
- Evidências (datas, números de protocolo)
- Impacto do problema
- Solução específica que você espera
- Prazo razoável para resposta

Tom: Firme mas profissional, focado em resolver`,
      variables: [
        {
          name: 'company',
          label: 'Empresa/Serviço',
          placeholder: 'Ex: Banco XYZ',
          type: 'text',
          required: true
        },
        {
          name: 'issue',
          label: 'Descrição do problema',
          placeholder: 'Ex: Cobrança indevida de R$ 500',
          type: 'textarea',
          required: true
        },
        {
          name: 'impact',
          label: 'Impacto do problema',
          placeholder: 'Ex: Impossibilitou pagamento de contas essenciais',
          type: 'textarea',
          required: true
        },
        {
          name: 'solution',
          label: 'Solução desejada',
          placeholder: 'Ex: Estorno imediato + compensação',
          type: 'text',
          required: true
        }
      ],
      examples: [],
      tags: ['reclamação', 'consumidor', 'profissional'],
      difficulty: 'intermediate',
      isPremium: true,
      usageCount: 324
    },
    {
      id: 'email-thank-you',
      categoryId: 'email',
      title: 'E-mail de Agradecimento Pós-Reunião',
      description: 'Reforce conexão após reunião ou entrevista',
      template: `Escreva um e-mail de agradecimento após:

Tipo de reunião: {meeting_type}
Nome(s) do(s) participante(s): {participants}
Principais pontos discutidos: {key_points}
Próximos passos: {next_steps}

Incluir:
- Agradecimento pelo tempo
- Resumo de 1-2 pontos principais
- Reforço de interesse/entusiasmo
- Clarificação de próximos passos
- Oferta de informação adicional se necessário

Enviar em até 24h após a reunião.`,
      variables: [
        {
          name: 'meeting_type',
          label: 'Tipo de reunião',
          placeholder: 'Ex: Entrevista de emprego, reunião de vendas',
          type: 'select',
          options: ['Entrevista de emprego', 'Reunião de negócios', 'Networking', 'Consultoria'],
          required: true
        },
        {
          name: 'participants',
          label: 'Nome dos participantes',
          placeholder: 'Ex: Ana Silva e Pedro Costa',
          type: 'text',
          required: true
        },
        {
          name: 'key_points',
          label: 'Pontos principais discutidos',
          placeholder: 'Ex: Requisitos do projeto, prazos, orçamento',
          type: 'textarea',
          required: true
        },
        {
          name: 'next_steps',
          label: 'Próximos passos acordados',
          placeholder: 'Ex: Enviar proposta até sexta-feira',
          type: 'text',
          required: false
        }
      ],
      examples: [],
      tags: ['agradecimento', 'networking', 'reunião'],
      difficulty: 'beginner',
      isPremium: false,
      isFeatured: true,
      usageCount: 1089
    }
  ]
};
