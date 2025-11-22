import { PromptCategory } from '../../types/prompt';

export const marketingPromptsCategory: PromptCategory = {
  id: 'marketing',
  name: 'Digital Marketing',
  description: 'Prompts para anúncios, landing pages, e-mail marketing e campanhas',
  icon: 'TrendingUp',
  color: 'bg-pink-500',
  isPopular: true,
  prompts: [
    {
      id: 'marketing-ad-copy',
      categoryId: 'marketing',
      title: 'Copy de Anúncio (Facebook/Google)',
      description: 'Crie anúncios que convertem',
      template: `Crie 5 variações de copy para anúncio:

Produto/Serviço: {product}
Público-alvo: {audience}
Plataforma: {platform}
Objetivo: {goal}
Oferta: {offer}

Para cada variação:
- **Headline** (máximo 40 caracteres)
- **Texto principal** (125 caracteres para Facebook, 90 para Google)
- **CTA** (call-to-action)

Fórmulas testadas:
1. Problema + Solução + Prova social
2. Benefício + Urgência + Garantia
3. Antes vs Depois
4. Pergunta + Resposta  + CTA
5. Objeção + Rebate + Oferta

Incluir:
- Gatilhos mentais (escassez, urgência, prova social)
- Números específicos quando possível
- Linguagem do público-alvo`,
      variables: [
        {
          name: 'product',
          label: 'Produto/Serviço',
          placeholder: 'Ex: Curso de Excel avançado',
          type: 'text',
          required: true
        },
        {
          name: 'audience',
          label: 'Público-alvo',
          placeholder: 'Ex: Analistas financeiros',
          type: 'text',
          required: true
        },
        {
          name: 'platform',
          label: 'Plataforma',
          placeholder: 'Facebook, Google, Instagram, LinkedIn',
          type: 'select',
          options: ['Facebook', 'Google Ads', 'Instagram', 'LinkedIn', 'TikTok'],
          required: true
        },
        {
          name: 'goal',
          label: 'Objetivo',
          placeholder: 'Ex: Venda, lead, download',
          type: 'select',
          options: ['Venda direta', 'Geração de leads', 'Download', 'Cadastro', 'Tráfego'],
          required: true
        },
        {
          name: 'offer',
          label: 'Oferta/Desconto',
          placeholder: 'Ex: 50% OFF por 48h',
          type: 'text',
          required: false
        }
      ],
      examples: [],
      tags: ['anúncio', 'copy', 'ads', 'conversão'],
      difficulty: 'intermediate',
      isPremium: false,
      isFeatured: true,
      usageCount: 2156
    },
    {
      id: 'marketing-landing-page',
      categoryId: 'marketing',
      title: 'Copy de Landing Page',
      description: 'Página de vendas completa que converte',
      template: `Crie copy completo para landing page de alta conversão:

Produto/Serviço: {product}
Preço: {price}
Público: {audience}
Principal benefício: {main_benefit}

Estrutura (acima da dobra):
1. **Headline** - Maior benefício em 10 palavras
2. **Subheadline** - Expande a promessa
3. **Hero image** - Descreva a imagem ideal
4. **CTA button** - Texto do botão

Corpo da página:
5. **Problema** - As 3 maiores dores do público
6. **Solução** - Como {product} resolve
7. **Benefícios** - Lista de 5-7 benefícios principais
8. **Como funciona** - 3-4 passos simples
9. **Prova social** - Tipos de depoimentos necessários
10. **Garantia** - Reverse do risco
11. **FAQ** - 5 objeções principais respondidas
12. **CTA final** - Reforço da oferta

Tom: Persuasivo mas não agressivo, focado em benefícios`,
      variables: [
        {
          name: 'product',
          label: 'Produto/Serviço',
          placeholder: 'Ex: Software de gestão financeira',
          type: 'text',
          required: true
        },
        {
          name: 'price',
          label: 'Preço',
          placeholder: 'Ex: R$ 97/mês',
          type: 'text',
          required: true
        },
        {
          name: 'audience',
          label: 'Público-alvo',
          placeholder: 'Ex: Pequenos empresários',
          type: 'text',
          required: true
        },
        {
          name: 'main_benefit',
          label: 'Principal benefício',
          placeholder: 'Ex: Economizar 10h/semana em finanças',
          type: 'textarea',
          required: true
        }
      ],
      examples: [],
      tags: ['landing-page', 'vendas', 'conversão', 'copy'],
      difficulty: 'advanced',
      isPremium: true,
      usageCount: 1432
    },
    {
      id: 'marketing-email-sequence',
      categoryId: 'marketing',
      title: 'Sequência de E-mail Marketing',
      description: 'Série de 5-7 e-mails automatizados',
      template: `Crie sequência de e-mail marketing de {sequence_length} e-mails:

Objetivo: {goal}
Produto: {product}
Público: {audience}
Gatilho inicial: {trigger}

Para CADA e-mail, forneça:
- Dias após trigger (Ex: Dia 0, Dia 2, Dia 5...)
- Assunto
- Preview text
- Corpo do e-mail
- CTA
- Objetivo específico deste e-mail

Estrutura sugerida:
- E-mail 1: Boas-vindas + Estabelecer expectativas
- E-mail 2: Educar + Agregar valor
- E-mail 3: Contar história/caso de uso
- E-mail 4: Apresentar oferta
- E-mail 5: Urgência/Escassez
- E-mail 6: Último chamado
- E-mail 7 (opcional): Recuperação de carrinho

Regras:
- Cada e-mail deve funcionar sozinho
- Tom progressivamente mais vendedor
- Sempre agregar valor, não só vender`,
      variables: [
        {
          name: 'goal',
          label: 'Objetivo da sequência',
          placeholder: 'Ex: Vender curso, nurture leads',
          type: 'select',
          options: ['Vender produto', 'Nurture leads', 'Onboarding', 'Re-engajamento'],
          required: true
        },
        {
          name: 'product',
          label: 'Produto/Serviço',
          placeholder: 'Ex: Curso de Python',
          type: 'text',
          required: true
        },
        {
          name: 'audience',
          label: 'Público-alvo',
          placeholder: 'Ex: Iniciantes em programação',
          type: 'text',
          required: true
        },
        {
          name: 'trigger',
          label: 'Gatilho inicial',
          placeholder: 'Ex: Download de e-book, cadastro',
          type: 'text',
          required: true
        },
        {
          name: 'sequence_length',
          label: 'Número de e-mails',
          placeholder: 'Ex: 5',
          type: 'select',
          options: ['3', '5', '7'],
          required: true
        }
      ],
      examples: [],
      tags: ['email-marketing', 'sequência', 'automação', 'funil'],
      difficulty: 'advanced',
      isPremium: true,
      isFeatured: true,
      usageCount: 987
    }
  ]
};
