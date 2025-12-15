import { Prompt } from '../../types/prompt';

/**
 * PACK 3: PROMPTS PREMIUM
 * 30 prompts: 15 Email Marketing + 15 Blog/Conteúdo
 */

// =====================================================
// EMAIL MARKETING - PROMPTS PREMIUM (15)
// =====================================================

export const emailMarketingPremiumPrompts: Prompt[] = [
  {
    id: 'email-welcome-sequence',
    categoryId: 'email-marketing',
    title: 'Sequência de Boas-Vindas Completa',
    description: 'Crie uma sequência de 5 emails para novos assinantes que constrói relacionamento e converte.',
    template: `Você é um especialista em email marketing e automação. Crie uma sequência completa de 5 emails de boas-vindas para novos assinantes.

CONTEXTO DO NEGÓCIO:
- Nicho: {nicho}
- Produto/Serviço principal: {produto}
- Avatar do cliente: {avatar}
- Promessa principal: {promessa}

ESTRUTURA DA SEQUÊNCIA:

📧 EMAIL 1 - BOAS-VINDAS (Imediato)
- Assunto chamativo com taxa de abertura alta
- Agradeça pela inscrição
- Entregue o prometido (lead magnet, bônus)
- Apresente quem você é (storytelling rápido)
- Defina expectativas da newsletter
- CTA: consumir o conteúdo entregue

📧 EMAIL 2 - CONEXÃO (Dia 2)
- Assunto que gera curiosidade
- Compartilhe sua história de transformação
- Mostre que você entende as dores do leitor
- Construa autoridade com prova social
- CTA: responder ao email (engajamento)

📧 EMAIL 3 - VALOR PURO (Dia 4)
- Assunto com benefício claro
- Entregue uma dica/estratégia poderosa
- Formato: problema → solução → resultado
- Case de sucesso ou exemplo prático
- CTA: implementar a dica

📧 EMAIL 4 - OBJEÇÕES (Dia 6)
- Assunto que aborda uma dor comum
- Antecipe e quebre objeções principais
- Use perguntas e respostas (FAQ)
- Mostre transformações de clientes
- CTA: agendar conversa ou ver página de vendas

📧 EMAIL 5 - OFERTA (Dia 7)
- Assunto urgente mas não clickbait
- Apresente sua oferta principal
- Destaque os benefícios (não features)
- Inclua garantia e escassez real
- CTA direto para compra

Para cada email, inclua:
- 3 opções de linha de assunto
- Preview text otimizado
- Corpo completo do email
- PS estratégico`,
    variables: [
      { name: 'nicho', label: 'Nicho/Mercado', placeholder: 'Ex: Finanças pessoais', type: 'text', required: true },
      { name: 'produto', label: 'Produto/Serviço', placeholder: 'Ex: Curso de investimentos', type: 'text', required: true },
      { name: 'avatar', label: 'Cliente ideal', placeholder: 'Ex: Jovens de 25-35 anos querendo investir', type: 'textarea', required: true },
      { name: 'promessa', label: 'Promessa principal', placeholder: 'Ex: Aprender a investir do zero', type: 'text', required: true }
    ],
    examples: [],
    tags: ['welcome', 'automação', 'sequência', 'conversão'],
    difficulty: 'advanced',
    isPremium: true,
    isFeatured: true,
    usageCount: 0
  },
  {
    id: 'email-launch-campaign',
    categoryId: 'email-marketing',
    title: 'Campanha de Lançamento 7 Dias',
    description: 'Sequência de emails para lançamento de produto com gatilhos mentais e urgência.',
    template: `Você é um copywriter especialista em lançamentos digitais. Crie uma campanha completa de 7 emails para lançamento.

INFORMAÇÕES DO LANÇAMENTO:
- Produto: {produto}
- Preço: {preco}
- Benefício principal: {beneficio}
- Data de abertura: {data_abertura}
- Data de fechamento: {data_fechamento}

ESTRUTURA DOS 7 DIAS:

📧 DIA 1 - ABERTURA DO CARRINHO
- Assunto: máxima urgência/novidade
- Anuncie a abertura
- Resuma a oferta e benefícios
- Inclua bônus de early bird
- CTA forte para página de vendas

📧 DIA 2 - PROVA SOCIAL
- Assunto: resultados de alunos
- Depoimentos poderosos
- Casos de transformação
- Screenshot de resultados

📧 DIA 3 - CONTEÚDO DE VALOR
- Entregue uma aula/dica gratuita
- Mostre uma prévia do método
- Construa autoridade

📧 DIA 4 - FAQ E OBJEÇÕES
- Responda dúvidas frequentes
- Quebre as principais objeções
- Reforce a garantia

📧 DIA 5 - BÔNUS SURPRESA
- Anuncie um bônus extra
- Crie mais valor percebido
- Reforce a urgência

📧 DIA 6 - ÚLTIMAS 24 HORAS
- Contagem regressiva
- Escassez real
- Depoimento impactante

📧 DIA 7 - ÚLTIMA CHANCE
- Fechamento do carrinho
- Último email antes do fim
- Resumo de tudo incluído
- CTA final urgente`,
    variables: [
      { name: 'produto', label: 'Nome do Produto', placeholder: 'Ex: Mentoria Elite', type: 'text', required: true },
      { name: 'preco', label: 'Preço', placeholder: 'Ex: R$ 1.997', type: 'text', required: true },
      { name: 'beneficio', label: 'Benefício Principal', placeholder: 'Ex: Dobrar seu faturamento em 90 dias', type: 'text', required: true },
      { name: 'data_abertura', label: 'Data de Abertura', placeholder: 'Ex: 15/03', type: 'text', required: true },
      { name: 'data_fechamento', label: 'Data de Fechamento', placeholder: 'Ex: 22/03', type: 'text', required: true }
    ],
    examples: [],
    tags: ['lançamento', 'campanha', 'urgência', 'conversão'],
    difficulty: 'advanced',
    isPremium: true,
    usageCount: 0
  },
  {
    id: 'email-reengagement',
    categoryId: 'email-marketing',
    title: 'Sequência de Reengajamento',
    description: 'Recupere assinantes inativos com uma sequência estratégica de reativação.',
    template: `Crie uma sequência de 5 emails para reengajar assinantes inativos.

CONTEXTO:
- Negócio: {negocio}
- Tempo de inatividade: {tempo_inatividade}
- Oferta especial para retorno: {oferta_especial}

SEQUÊNCIA DE REENGAJAMENTO:

📧 EMAIL 1 - "SENTIMOS SUA FALTA"
- Assunto emocional/pessoal
- Reconheça a ausência
- Pergunte o que houve
- Ofereça ajuda

📧 EMAIL 2 - "NOVIDADES QUE VOCÊ PERDEU"
- Mostre o que mudou
- Destaque novos conteúdos/produtos
- Crie FOMO (medo de perder)

📧 EMAIL 3 - "PRESENTE ESPECIAL"
- Ofereça algo exclusivo
- Desconto ou bônus gratuito
- Prazo limitado

📧 EMAIL 4 - "ÚLTIMA TENTATIVA"
- Tom sincero e direto
- Pergunte se ainda quer receber
- Dê opção de atualizar preferências

📧 EMAIL 5 - "DESPEDIDA"
- Avise sobre remoção da lista
- Última chance de ficar
- Link claro para continuar`,
    variables: [
      { name: 'negocio', label: 'Tipo de Negócio', placeholder: 'Ex: Escola de inglês online', type: 'text', required: true },
      { name: 'tempo_inatividade', label: 'Tempo de Inatividade', placeholder: 'Ex: 90 dias sem abrir emails', type: 'text', required: true },
      { name: 'oferta_especial', label: 'Oferta Especial', placeholder: 'Ex: 30% de desconto no próximo curso', type: 'text', required: true }
    ],
    examples: [],
    tags: ['reengajamento', 'inativos', 'recuperação', 'lista'],
    difficulty: 'intermediate',
    isPremium: true,
    usageCount: 0
  },
  {
    id: 'email-cart-abandonment',
    categoryId: 'email-marketing',
    title: 'Sequência de Carrinho Abandonado',
    description: 'Recupere vendas perdidas com emails estratégicos de abandono de carrinho.',
    template: `Crie uma sequência de 4 emails para recuperar carrinhos abandonados.

PRODUTO ABANDONADO:
- Nome: {produto}
- Preço: {preco}
- Benefício principal: {beneficio}
- Garantia: {garantia}

SEQUÊNCIA DE RECUPERAÇÃO:

📧 EMAIL 1 - 1 HORA APÓS ABANDONO
"Você esqueceu algo..."
- Tom amigável, não vendedor
- Lembre do produto
- Botão direto para finalizar
- Ofereça ajuda (dúvidas?)

📧 EMAIL 2 - 24 HORAS APÓS
"Ainda está pensando?"
- Reforce os benefícios
- Adicione depoimento
- Quebre uma objeção comum
- CTA para voltar ao checkout

📧 EMAIL 3 - 48 HORAS APÓS
"Oferta especial para você"
- Ofereça um incentivo (desconto/bônus)
- Crie urgência (expira em 24h)
- Destaque a garantia
- Simplifique a decisão

📧 EMAIL 4 - 72 HORAS APÓS
"Última chance"
- Último lembrete
- Resuma tudo incluído
- Reforce o incentivo
- CTA urgente final`,
    variables: [
      { name: 'produto', label: 'Nome do Produto', placeholder: 'Ex: Curso de Marketing Digital', type: 'text', required: true },
      { name: 'preco', label: 'Preço', placeholder: 'Ex: R$ 497', type: 'text', required: true },
      { name: 'beneficio', label: 'Benefício Principal', placeholder: 'Ex: Aprender a vender online', type: 'text', required: true },
      { name: 'garantia', label: 'Garantia', placeholder: 'Ex: 7 dias de garantia incondicional', type: 'text', required: true }
    ],
    examples: [],
    tags: ['carrinho', 'abandono', 'recuperação', 'vendas'],
    difficulty: 'intermediate',
    isPremium: true,
    usageCount: 0
  },
  {
    id: 'email-newsletter-weekly',
    categoryId: 'email-marketing',
    title: 'Template de Newsletter Semanal',
    description: 'Estrutura completa para newsletter semanal que engaja e converte.',
    template: `Crie uma newsletter semanal envolvente e estratégica.

INFORMAÇÕES:
- Tema da semana: {tema}
- Nicho: {nicho}
- Tom de voz: {tom}
- CTA principal: {cta}

ESTRUTURA DA NEWSLETTER:

📰 ABERTURA (Hook)
- Frase de abertura impactante
- Conexão com algo atual
- Preview do que vem pela frente

📰 SEÇÃO 1: CONTEÚDO PRINCIPAL
- Insight ou dica da semana
- Formato: problema → solução
- Exemplo prático aplicável

📰 SEÇÃO 2: BASTIDORES/PESSOAL
- Algo que aconteceu na semana
- Lição aprendida
- Humanização da marca

📰 SEÇÃO 3: CURADORIA
- 3 links/recursos úteis
- Ferramenta recomendada
- Conteúdo de terceiros relevante

📰 SEÇÃO 4: CTA/OFERTA
- Chamada para ação principal
- Produto/serviço em destaque
- Próximos eventos

📰 FECHAMENTO
- Despedida pessoal
- PS com gancho para próxima edição
- Links de redes sociais`,
    variables: [
      { name: 'tema', label: 'Tema da Semana', placeholder: 'Ex: Produtividade no home office', type: 'text', required: true },
      { name: 'nicho', label: 'Nicho', placeholder: 'Ex: Empreendedorismo digital', type: 'text', required: true },
      { name: 'tom', label: 'Tom de Voz', placeholder: 'Ex: Descontraído e direto', type: 'text', required: true },
      { name: 'cta', label: 'CTA Principal', placeholder: 'Ex: Inscrever-se no webinar', type: 'text', required: true }
    ],
    examples: [],
    tags: ['newsletter', 'semanal', 'engajamento', 'conteúdo'],
    difficulty: 'intermediate',
    isPremium: true,
    usageCount: 0
  },
  {
    id: 'email-upsell-sequence',
    categoryId: 'email-marketing',
    title: 'Sequência de Upsell Pós-Compra',
    description: 'Maximize o valor do cliente com uma sequência estratégica de upsell.',
    template: `Crie uma sequência de upsell para clientes que acabaram de comprar.

CONTEXTO:
- Produto comprado: {produto_comprado}
- Produto de upsell: {produto_upsell}
- Preço do upsell: {preco_upsell}
- Complementaridade: {complementaridade}

SEQUÊNCIA DE UPSELL (5 EMAILS):

📧 EMAIL 1 - IMEDIATO (Thank You Page)
- Parabenize pela compra
- Oferta especial exclusiva
- Desconto válido por 24h
- Mostre a complementaridade

📧 EMAIL 2 - 24 HORAS
- Lembrete da oferta especial
- Depoimento de quem comprou ambos
- Resultados potencializados

📧 EMAIL 3 - 48 HORAS
- Última chance do desconto
- FAQ sobre o upsell
- Garantia reforçada

📧 EMAIL 4 - 1 SEMANA
- Como está indo com o produto?
- Apresente o upsell como upgrade
- Novo ângulo de benefícios

📧 EMAIL 5 - 2 SEMANAS
- Oferta especial de aniversário de compra
- Preço intermediário
- Prazo limitado`,
    variables: [
      { name: 'produto_comprado', label: 'Produto Comprado', placeholder: 'Ex: Curso Básico de Design', type: 'text', required: true },
      { name: 'produto_upsell', label: 'Produto de Upsell', placeholder: 'Ex: Pacote de Templates Premium', type: 'text', required: true },
      { name: 'preco_upsell', label: 'Preço do Upsell', placeholder: 'Ex: R$ 297', type: 'text', required: true },
      { name: 'complementaridade', label: 'Como se complementam', placeholder: 'Ex: Templates prontos para aplicar o que aprendeu', type: 'textarea', required: true }
    ],
    examples: [],
    tags: ['upsell', 'pós-compra', 'LTV', 'vendas'],
    difficulty: 'advanced',
    isPremium: true,
    usageCount: 0
  },
  {
    id: 'email-webinar-sequence',
    categoryId: 'email-marketing',
    title: 'Sequência para Webinar',
    description: 'Emails para promover webinar, lembrar inscritos e converter após o evento.',
    template: `Crie uma sequência completa de emails para webinar.

DADOS DO WEBINAR:
- Tema: {tema}
- Data e horário: {data_horario}
- Benefício principal: {beneficio}
- Oferta no final: {oferta}

SEQUÊNCIA COMPLETA:

📧 PRÉ-WEBINAR (5 emails)

1. CONVITE INICIAL
- Anuncie o webinar
- Destaque o benefício principal
- Crie urgência (vagas limitadas)

2. LEMBRETE -3 DIAS
- Reforce os aprendizados
- Adicione bônus para quem assistir ao vivo

3. LEMBRETE -1 DIA
- Preview do conteúdo
- Instruções técnicas

4. NO DIA - MANHÃ
- Lembrete animado
- Horário e link

5. NO DIA - 1H ANTES
- Último lembrete
- Link direto

📧 PÓS-WEBINAR (4 emails)

1. IMEDIATO - REPLAY
- Link do replay
- Resumo dos pontos principais
- Oferta especial

2. DIA SEGUINTE
- Destaques do webinar
- Perguntas respondidas
- CTA para oferta

3. 2 DIAS DEPOIS
- Depoimentos de quem comprou
- FAQ da oferta
- Urgência

4. ÚLTIMO DIA
- Replay expira
- Oferta fecha
- Última chance`,
    variables: [
      { name: 'tema', label: 'Tema do Webinar', placeholder: 'Ex: Como criar seu primeiro curso online', type: 'text', required: true },
      { name: 'data_horario', label: 'Data e Horário', placeholder: 'Ex: 20/03 às 20h', type: 'text', required: true },
      { name: 'beneficio', label: 'Benefício Principal', placeholder: 'Ex: Aprender o passo a passo para lançar', type: 'text', required: true },
      { name: 'oferta', label: 'Oferta no Final', placeholder: 'Ex: Mentoria de lançamentos', type: 'text', required: true }
    ],
    examples: [],
    tags: ['webinar', 'evento', 'lançamento', 'leads'],
    difficulty: 'advanced',
    isPremium: true,
    usageCount: 0
  },
  {
    id: 'email-testimonial-request',
    categoryId: 'email-marketing',
    title: 'Sequência para Pedir Depoimentos',
    description: 'Emails estratégicos para coletar depoimentos poderosos de clientes.',
    template: `Crie uma sequência para coletar depoimentos de clientes satisfeitos.

CONTEXTO:
- Produto/Serviço: {produto}
- Momento ideal para pedir: {momento}
- Formato desejado: {formato}

SEQUÊNCIA DE COLETA:

📧 EMAIL 1 - PEDIDO INICIAL
- Agradeça pelo feedback positivo
- Explique a importância do depoimento
- Facilite o processo (perguntas guiadas)
- Ofereça recompensa (opcional)

PERGUNTAS GUIA:
1. Qual era sua situação antes?
2. O que te fez escolher [produto]?
3. Quais resultados você obteve?
4. O que você diria para quem está em dúvida?

📧 EMAIL 2 - LEMBRETE GENTIL (3 dias)
- Reforce o pedido
- Simplifique ainda mais
- Ofereça alternativas (áudio, vídeo)

📧 EMAIL 3 - FACILITADOR (7 dias)
- Envie exemplos de bons depoimentos
- Ofereça template para preencher
- Deadline suave

📧 EMAIL 4 - AGRADECIMENTO
- Agradeça pelo depoimento
- Mostre como será usado
- Ofereça benefício de gratidão`,
    variables: [
      { name: 'produto', label: 'Produto/Serviço', placeholder: 'Ex: Curso de Inglês Online', type: 'text', required: true },
      { name: 'momento', label: 'Momento para Pedir', placeholder: 'Ex: 30 dias após a compra', type: 'text', required: true },
      { name: 'formato', label: 'Formato Desejado', placeholder: 'Ex: Vídeo curto ou texto', type: 'text', required: true }
    ],
    examples: [],
    tags: ['depoimento', 'prova social', 'cliente', 'feedback'],
    difficulty: 'beginner',
    isPremium: true,
    usageCount: 0
  },
  {
    id: 'email-seasonal-campaign',
    categoryId: 'email-marketing',
    title: 'Campanha Sazonal Completa',
    description: 'Sequência de emails para datas comemorativas e campanhas sazonais.',
    template: `Crie uma campanha de email marketing para data comemorativa.

DADOS DA CAMPANHA:
- Data comemorativa: {data_comemorativa}
- Oferta especial: {oferta}
- Período da campanha: {periodo}
- Desconto/Benefício: {desconto}

ESTRUTURA DA CAMPANHA:

📧 FASE 1 - AQUECIMENTO (1 semana antes)

1. TEASER
- Antecipe algo especial
- Crie curiosidade
- Peça para marcar na agenda

2. REVELAÇÃO
- Anuncie a promoção
- Destaque o desconto
- Data de início

📧 FASE 2 - CAMPANHA ATIVA

3. ABERTURA
- Promoção começou!
- Todos os detalhes
- CTA principal

4. MEIO DA CAMPANHA
- Lembrete
- Produtos mais vendidos
- Depoimentos

5. PENÚLTIMO DIA
- Urgência
- O que ainda está disponível
- Bônus de última hora

📧 FASE 3 - ENCERRAMENTO

6. ÚLTIMO DIA
- Últimas horas
- Contagem regressiva
- CTA urgente

7. EXTENDED (opcional)
- "Voltamos por mais 24h"
- Pedidos especiais atendidos`,
    variables: [
      { name: 'data_comemorativa', label: 'Data Comemorativa', placeholder: 'Ex: Black Friday, Natal, Dia das Mães', type: 'text', required: true },
      { name: 'oferta', label: 'Oferta Especial', placeholder: 'Ex: Todos os cursos com 50% OFF', type: 'text', required: true },
      { name: 'periodo', label: 'Período da Campanha', placeholder: 'Ex: 20 a 27 de novembro', type: 'text', required: true },
      { name: 'desconto', label: 'Desconto/Benefício', placeholder: 'Ex: 50% de desconto + bônus', type: 'text', required: true }
    ],
    examples: [],
    tags: ['sazonal', 'promoção', 'datas', 'campanha'],
    difficulty: 'intermediate',
    isPremium: true,
    usageCount: 0
  },
  {
    id: 'email-referral-program',
    categoryId: 'email-marketing',
    title: 'Programa de Indicação por Email',
    description: 'Sequência para lançar e promover programa de indicação de clientes.',
    template: `Crie uma sequência de emails para programa de indicação.

PROGRAMA:
- Recompensa para quem indica: {recompensa_indicador}
- Benefício para indicado: {beneficio_indicado}
- Mecânica: {mecanica}

SEQUÊNCIA DO PROGRAMA:

📧 EMAIL 1 - LANÇAMENTO DO PROGRAMA
- Anuncie o programa
- Explique as recompensas
- Mostre como é fácil participar
- Link para área de indicação

📧 EMAIL 2 - COMO FUNCIONA
- Passo a passo detalhado
- Exemplos de indicações
- FAQ
- Templates para compartilhar

📧 EMAIL 3 - PRIMEIRAS INDICAÇÕES
- Celebre os primeiros resultados
- Ranking de indicadores
- Aumente a recompensa temporariamente

📧 EMAIL 4 - LEMBRETE MENSAL
- Resgate pendente?
- Novos benefícios
- Histórias de sucesso

📧 EMAIL 5 - SUPER AÇÃO
- Período de bônus duplo
- Urgência limitada
- Competição entre indicadores`,
    variables: [
      { name: 'recompensa_indicador', label: 'Recompensa do Indicador', placeholder: 'Ex: R$ 50 de crédito por indicação', type: 'text', required: true },
      { name: 'beneficio_indicado', label: 'Benefício do Indicado', placeholder: 'Ex: 20% de desconto na primeira compra', type: 'text', required: true },
      { name: 'mecanica', label: 'Mecânica do Programa', placeholder: 'Ex: Link personalizado + código de desconto', type: 'text', required: true }
    ],
    examples: [],
    tags: ['indicação', 'referral', 'programa', 'crescimento'],
    difficulty: 'intermediate',
    isPremium: true,
    usageCount: 0
  },
  {
    id: 'email-onboarding-saas',
    categoryId: 'email-marketing',
    title: 'Onboarding de SaaS/Produto',
    description: 'Sequência de ativação para novos usuários de software ou produto digital.',
    template: `Crie uma sequência de onboarding para novos usuários.

PRODUTO:
- Nome: {produto}
- Ação principal de valor: {acao_valor}
- Tempo ideal para ativação: {tempo_ativacao}
- Obstáculos comuns: {obstaculos}

SEQUÊNCIA DE ONBOARDING:

📧 EMAIL 1 - BEM-VINDO (Imediato)
- Celebre a chegada
- Primeiro passo simples
- Link direto para começar
- Suporte disponível

📧 EMAIL 2 - PRIMEIRO MARCO (Dia 1)
- Guia do primeiro uso
- Video tutorial curto
- Dica rápida de sucesso

📧 EMAIL 3 - CHECKLIST (Dia 3)
- Progresso até agora
- Próximos passos
- Funcionalidades ainda não usadas

📧 EMAIL 4 - CASO DE SUCESSO (Dia 5)
- Como outros usuários usam
- Resultados alcançados
- Dicas avançadas

📧 EMAIL 5 - SUPORTE PROATIVO (Dia 7)
- Tudo certo?
- FAQ
- Contato direto com suporte

📧 EMAIL 6 - UPGRADE (Dia 14)
- Funcionalidades premium
- Trial do plano superior
- Benefícios do upgrade`,
    variables: [
      { name: 'produto', label: 'Nome do Produto', placeholder: 'Ex: TaskFlow Pro', type: 'text', required: true },
      { name: 'acao_valor', label: 'Ação Principal de Valor', placeholder: 'Ex: Criar a primeira tarefa', type: 'text', required: true },
      { name: 'tempo_ativacao', label: 'Tempo para Ativação', placeholder: 'Ex: 7 dias', type: 'text', required: true },
      { name: 'obstaculos', label: 'Obstáculos Comuns', placeholder: 'Ex: Configuração inicial complexa', type: 'textarea', required: true }
    ],
    examples: [],
    tags: ['onboarding', 'SaaS', 'ativação', 'retenção'],
    difficulty: 'advanced',
    isPremium: true,
    usageCount: 0
  },
  {
    id: 'email-win-back',
    categoryId: 'email-marketing',
    title: 'Campanha Win-Back de Clientes',
    description: 'Reconquiste clientes que pararam de comprar com ofertas irresistíveis.',
    template: `Crie uma campanha para reconquistar clientes inativos.

CONTEXTO:
- Última compra há: {tempo_inativo}
- Produto mais comprado: {produto_frequente}
- Oferta de retorno: {oferta_retorno}
- Motivos comuns de churn: {motivos_churn}

SEQUÊNCIA WIN-BACK:

📧 EMAIL 1 - "SENTIMOS SUA FALTA"
- Tom pessoal e genuíno
- Reconheça a ausência
- Pergunte o que aconteceu
- Ofereça ajuda

📧 EMAIL 2 - "MUITO MUDOU"
- Novidades desde a última compra
- Melhorias feitas
- Novos produtos/serviços

📧 EMAIL 3 - "OFERTA EXCLUSIVA"
- Desconto especial de retorno
- Prazo limitado
- Sem compromisso

📧 EMAIL 4 - "ÚLTIMA CHANCE"
- Oferta expira
- Resumo dos benefícios
- CTA urgente

📧 EMAIL 5 - "ADEUS?"
- Vai remover da lista
- Última oportunidade
- Link para ficar`,
    variables: [
      { name: 'tempo_inativo', label: 'Tempo Inativo', placeholder: 'Ex: 6 meses', type: 'text', required: true },
      { name: 'produto_frequente', label: 'Produto Mais Comprado', placeholder: 'Ex: Suplementos mensais', type: 'text', required: true },
      { name: 'oferta_retorno', label: 'Oferta de Retorno', placeholder: 'Ex: 40% OFF na próxima compra', type: 'text', required: true },
      { name: 'motivos_churn', label: 'Motivos de Saída', placeholder: 'Ex: Preço, falta de tempo, esquecimento', type: 'textarea', required: true }
    ],
    examples: [],
    tags: ['win-back', 'churn', 'reativação', 'clientes'],
    difficulty: 'intermediate',
    isPremium: true,
    usageCount: 0
  },
  {
    id: 'email-survey-feedback',
    categoryId: 'email-marketing',
    title: 'Pesquisa e Coleta de Feedback',
    description: 'Sequência para coletar feedback valioso e insights dos clientes.',
    template: `Crie uma sequência de emails para pesquisa de satisfação.

CONTEXTO:
- Tipo de pesquisa: {tipo_pesquisa}
- Objetivo principal: {objetivo}
- Incentivo para responder: {incentivo}

SEQUÊNCIA DE PESQUISA:

📧 EMAIL 1 - CONVITE PARA PESQUISA
- Valorize a opinião do cliente
- Tempo estimado (curto!)
- Benefício de responder
- Link direto para pesquisa

📧 EMAIL 2 - LEMBRETE (3 dias)
- "Ainda queremos ouvir você"
- Reforce o incentivo
- Simplifique ainda mais

📧 EMAIL 3 - ÚLTIMO LEMBRETE (7 dias)
- Pesquisa fecha em breve
- Impacto das respostas
- Agradecimento antecipado

📧 EMAIL 4 - AGRADECIMENTO
- Obrigado por responder
- Entrega do incentivo
- Próximos passos

📧 EMAIL 5 - RESULTADOS
- Compartilhe insights gerais
- Ações que serão tomadas
- Valorize a participação`,
    variables: [
      { name: 'tipo_pesquisa', label: 'Tipo de Pesquisa', placeholder: 'Ex: NPS, satisfação, produto', type: 'text', required: true },
      { name: 'objetivo', label: 'Objetivo Principal', placeholder: 'Ex: Melhorar o atendimento', type: 'text', required: true },
      { name: 'incentivo', label: 'Incentivo', placeholder: 'Ex: Cupom de 10% para quem responder', type: 'text', required: true }
    ],
    examples: [],
    tags: ['pesquisa', 'feedback', 'NPS', 'satisfação'],
    difficulty: 'beginner',
    isPremium: true,
    usageCount: 0
  },
  {
    id: 'email-flash-sale',
    categoryId: 'email-marketing',
    title: 'Flash Sale - Venda Relâmpago',
    description: 'Sequência de emails para promoção relâmpago com máxima urgência.',
    template: `Crie uma sequência de emails para flash sale.

DADOS DA PROMOÇÃO:
- Produto em promoção: {produto}
- Desconto: {desconto}
- Duração: {duracao}
- Limite de estoque: {limite}

SEQUÊNCIA FLASH SALE:

📧 EMAIL 1 - TEASER (1 dia antes)
- Algo grande vem aí
- Marque na agenda
- Exclusivo para lista

📧 EMAIL 2 - ABERTURA (Início)
- FLASH SALE COMEÇOU!
- Desconto + tempo limitado
- CTA urgente
- Contador

📧 EMAIL 3 - MEIO DO CAMINHO
- X% já vendido
- Últimas unidades
- Depoimentos rápidos
- CTA

📧 EMAIL 4 - ÚLTIMAS HORAS
- Estoque acabando
- Últimas X horas
- Última chance
- CTA final

📧 EMAIL 5 - ENCERRAMENTO
- Flash sale encerrada
- Obrigado a quem comprou
- Lista de espera para próxima`,
    variables: [
      { name: 'produto', label: 'Produto', placeholder: 'Ex: Curso Completo de Excel', type: 'text', required: true },
      { name: 'desconto', label: 'Desconto', placeholder: 'Ex: 70% OFF', type: 'text', required: true },
      { name: 'duracao', label: 'Duração', placeholder: 'Ex: 24 horas', type: 'text', required: true },
      { name: 'limite', label: 'Limite de Estoque', placeholder: 'Ex: 100 unidades', type: 'text', required: true }
    ],
    examples: [],
    tags: ['flash sale', 'promoção', 'urgência', 'desconto'],
    difficulty: 'intermediate',
    isPremium: true,
    usageCount: 0
  },
  {
    id: 'email-event-invitation',
    categoryId: 'email-marketing',
    title: 'Convite para Evento Presencial/Online',
    description: 'Sequência completa para promover e lotar seu evento.',
    template: `Crie uma sequência de emails para promover evento.

DADOS DO EVENTO:
- Nome: {nome_evento}
- Data e local: {data_local}
- Público-alvo: {publico}
- Investimento: {investimento}
- Benefício principal: {beneficio}

SEQUÊNCIA DO EVENTO:

📧 FASE 1 - ANÚNCIO (4 semanas antes)

1. SAVE THE DATE
- Anuncie o evento
- Data e local
- Early bird

2. PROGRAMAÇÃO
- O que vai acontecer
- Palestrantes/atrações
- Resultados anteriores

📧 FASE 2 - VENDAS (2-3 semanas)

3. LOTE PROMOCIONAL
- Desconto por tempo limitado
- Depoimentos de edições anteriores
- Bônus para quem comprar agora

4. PROGRAMAÇÃO COMPLETA
- Agenda detalhada
- Networking
- Materiais inclusos

5. LOTE NORMAL
- Preço cheio
- Últimas vagas
- FAQ

📧 FASE 3 - FINAL (1 semana)

6. ÚLTIMAS VAGAS
- Contagem regressiva
- FOMO
- Quem vai estar lá

7. ENCERRAMENTO
- Última chance
- Ver você lá!`,
    variables: [
      { name: 'nome_evento', label: 'Nome do Evento', placeholder: 'Ex: Summit de Marketing Digital 2024', type: 'text', required: true },
      { name: 'data_local', label: 'Data e Local', placeholder: 'Ex: 15/03 em São Paulo', type: 'text', required: true },
      { name: 'publico', label: 'Público-alvo', placeholder: 'Ex: Empreendedores digitais', type: 'text', required: true },
      { name: 'investimento', label: 'Investimento', placeholder: 'Ex: R$ 497', type: 'text', required: true },
      { name: 'beneficio', label: 'Benefício Principal', placeholder: 'Ex: Networking + Estratégias práticas', type: 'text', required: true }
    ],
    examples: [],
    tags: ['evento', 'convite', 'presencial', 'online'],
    difficulty: 'advanced',
    isPremium: true,
    usageCount: 0
  }
];

// =====================================================
// BLOG/CONTEÚDO - PROMPTS PREMIUM (15)
// =====================================================

export const blogContentPremiumPrompts: Prompt[] = [
  {
    id: 'blog-pillar-content',
    categoryId: 'blog-conteudo',
    title: 'Artigo Pilar Completo (+3000 palavras)',
    description: 'Crie um artigo pilar completo e otimizado para SEO que domina o tópico.',
    template: `Crie um artigo pilar completo e abrangente sobre o tema.

TEMA DO ARTIGO:
- Palavra-chave principal: {keyword}
- Palavras-chave secundárias: {keywords_sec}
- Público-alvo: {publico}
- Objetivo: {objetivo}

ESTRUTURA DO ARTIGO PILAR:

📝 INTRODUÇÃO (300 palavras)
- Hook poderoso
- Promessa do artigo
- Por que isso importa
- Preview dos tópicos

📝 SEÇÃO 1: FUNDAMENTOS (500 palavras)
- O que é [tema]
- História/contexto
- Por que é importante agora
- Estatísticas relevantes

📝 SEÇÃO 2: COMO FUNCIONA (600 palavras)
- Explicação detalhada
- Componentes principais
- Exemplos práticos
- Diagrama/infográfico sugerido

📝 SEÇÃO 3: PASSO A PASSO (800 palavras)
- Guia completo de implementação
- Cada passo detalhado
- Dicas práticas
- Erros comuns a evitar

📝 SEÇÃO 4: CASOS E EXEMPLOS (500 palavras)
- Cases de sucesso
- Antes e depois
- Resultados mensuráveis
- Lições aprendidas

📝 SEÇÃO 5: FERRAMENTAS E RECURSOS (400 palavras)
- Melhores ferramentas
- Recursos gratuitos
- Templates e checklists
- Links úteis

📝 SEÇÃO 6: FAQ (300 palavras)
- 5-7 perguntas frequentes
- Respostas objetivas
- Schema markup sugerido

📝 CONCLUSÃO (200 palavras)
- Resumo dos pontos principais
- Próximos passos
- CTA final

ELEMENTOS SEO:
- Meta title (60 caracteres)
- Meta description (155 caracteres)
- URL sugerida
- Alt text para imagens
- Links internos sugeridos`,
    variables: [
      { name: 'keyword', label: 'Palavra-chave Principal', placeholder: 'Ex: marketing de conteúdo', type: 'text', required: true },
      { name: 'keywords_sec', label: 'Palavras-chave Secundárias', placeholder: 'Ex: estratégia de conteúdo, blog corporativo', type: 'textarea', required: true },
      { name: 'publico', label: 'Público-alvo', placeholder: 'Ex: Profissionais de marketing', type: 'text', required: true },
      { name: 'objetivo', label: 'Objetivo do Artigo', placeholder: 'Ex: Educar e gerar leads', type: 'text', required: true }
    ],
    examples: [],
    tags: ['artigo pilar', 'SEO', 'conteúdo longo', 'autoridade'],
    difficulty: 'advanced',
    isPremium: true,
    isFeatured: true,
    usageCount: 0
  },
  {
    id: 'blog-how-to-guide',
    categoryId: 'blog-conteudo',
    title: 'Guia "Como Fazer" Completo',
    description: 'Tutorial passo a passo detalhado que resolve um problema específico.',
    template: `Crie um guia "Como Fazer" completo e prático.

TEMA DO GUIA:
- Problema a resolver: {problema}
- Resultado esperado: {resultado}
- Nível do leitor: {nivel}
- Tempo de execução: {tempo}

ESTRUTURA DO GUIA:

📝 INTRODUÇÃO
- O problema que você vai resolver
- Por que este guia é diferente
- O que você vai aprender
- Pré-requisitos (se houver)

📝 VISÃO GERAL DO PROCESSO
- Resumo dos passos
- Materiais necessários
- Tempo estimado
- Dificuldade

📝 PASSO 1: [Primeiro passo]
- Explicação detalhada
- Por que é importante
- Dica prática
- Erro comum a evitar
- Screenshot/imagem sugerida

📝 PASSO 2: [Segundo passo]
[mesma estrutura]

📝 PASSO 3: [Terceiro passo]
[mesma estrutura]

[Continue para todos os passos necessários]

📝 TROUBLESHOOTING
- Problemas comuns
- Como resolver cada um
- Quando pedir ajuda

📝 PRÓXIMOS PASSOS
- O que fazer depois
- Como aprofundar
- Recursos adicionais

📝 FAQ
- 5 perguntas frequentes
- Respostas práticas

📝 CONCLUSÃO
- Resumo do que foi aprendido
- Encorajamento
- CTA`,
    variables: [
      { name: 'problema', label: 'Problema a Resolver', placeholder: 'Ex: Como criar um blog do zero', type: 'text', required: true },
      { name: 'resultado', label: 'Resultado Esperado', placeholder: 'Ex: Blog funcionando e publicando', type: 'text', required: true },
      { name: 'nivel', label: 'Nível do Leitor', placeholder: 'Ex: Iniciante', type: 'text', required: true },
      { name: 'tempo', label: 'Tempo de Execução', placeholder: 'Ex: 2 horas', type: 'text', required: true }
    ],
    examples: [],
    tags: ['tutorial', 'how-to', 'guia', 'passo a passo'],
    difficulty: 'intermediate',
    isPremium: true,
    usageCount: 0
  },
  {
    id: 'blog-listicle-ultimate',
    categoryId: 'blog-conteudo',
    title: 'Listicle Ultimate (X Maneiras/Dicas)',
    description: 'Artigo em lista completo e detalhado com valor máximo.',
    template: `Crie um listicle ultimate sobre o tema.

DADOS DO LISTICLE:
- Tema: {tema}
- Número de itens: {num_itens}
- Objetivo: {objetivo}
- Diferencial: {diferencial}

ESTRUTURA DO LISTICLE:

📝 TÍTULO CHAMATIVO
- Número específico
- Benefício claro
- Urgência ou curiosidade
- 3 opções de título

📝 INTRODUÇÃO
- Hook com estatística ou pergunta
- Por que essa lista é diferente
- O que o leitor vai ganhar
- Preview dos melhores itens

📝 ITEM 1 (O MELHOR/MAIS IMPORTANTE)
- Título do item
- Por que é #1
- Como aplicar
- Exemplo real
- Dica bônus

📝 ITEM 2
[estrutura similar, adaptada]

📝 ITEM 3
[estrutura similar, adaptada]

[Continue para todos os itens]

📝 ITEM BÔNUS
- Surpresa extra
- Alto valor
- Exclusivo

📝 COMPARATIVO
- Tabela resumo dos itens
- Quando usar cada um
- Recomendações por perfil

📝 CONCLUSÃO
- Top 3 para começar
- Qual aplicar primeiro
- CTA

📝 ELEMENTOS SEO
- Meta tags
- URLs amigáveis
- Schema de lista`,
    variables: [
      { name: 'tema', label: 'Tema do Listicle', placeholder: 'Ex: Ferramentas de produtividade', type: 'text', required: true },
      { name: 'num_itens', label: 'Número de Itens', placeholder: 'Ex: 15', type: 'text', required: true },
      { name: 'objetivo', label: 'Objetivo', placeholder: 'Ex: Ajudar a escolher a melhor ferramenta', type: 'text', required: true },
      { name: 'diferencial', label: 'Diferencial', placeholder: 'Ex: Testei todas pessoalmente', type: 'text', required: true }
    ],
    examples: [],
    tags: ['listicle', 'lista', 'dicas', 'ferramentas'],
    difficulty: 'intermediate',
    isPremium: true,
    usageCount: 0
  },
  {
    id: 'blog-case-study',
    categoryId: 'blog-conteudo',
    title: 'Case Study Detalhado',
    description: 'Estudo de caso completo que mostra resultados e metodologia.',
    template: `Crie um case study detalhado e convincente.

DADOS DO CASE:
- Cliente/Projeto: {cliente}
- Desafio inicial: {desafio}
- Solução aplicada: {solucao}
- Resultados obtidos: {resultados}
- Período: {periodo}

ESTRUTURA DO CASE STUDY:

📝 RESUMO EXECUTIVO
- Resultado principal em destaque
- Métricas-chave
- Tempo para resultado

📝 O CLIENTE
- Quem é
- Contexto do mercado
- Tamanho/características
- Por que nos procurou

📝 O DESAFIO
- Situação inicial
- Problemas enfrentados
- Tentativas anteriores
- O que estava em jogo

📝 A SOLUÇÃO
- Estratégia proposta
- Por que essa abordagem
- Fases de implementação
- Recursos utilizados

📝 O PROCESSO
- Cronograma
- Etapas detalhadas
- Obstáculos superados
- Ajustes no caminho

📝 OS RESULTADOS
- Métricas antes x depois
- Resultados quantitativos
- Benefícios qualitativos
- ROI calculado

📝 DEPOIMENTO DO CLIENTE
- Quote impactante
- Vídeo (se disponível)
- Avaliação

📝 LIÇÕES APRENDIDAS
- O que funcionou melhor
- O que faria diferente
- Dicas para replicar

📝 PRÓXIMOS PASSOS
- CTA para consultoria
- Diagnóstico gratuito
- Materiais relacionados`,
    variables: [
      { name: 'cliente', label: 'Cliente/Projeto', placeholder: 'Ex: Loja de e-commerce de moda', type: 'text', required: true },
      { name: 'desafio', label: 'Desafio Inicial', placeholder: 'Ex: Baixa taxa de conversão (1.2%)', type: 'text', required: true },
      { name: 'solucao', label: 'Solução Aplicada', placeholder: 'Ex: Redesign de checkout + email marketing', type: 'text', required: true },
      { name: 'resultados', label: 'Resultados', placeholder: 'Ex: Aumento de 150% nas vendas', type: 'text', required: true },
      { name: 'periodo', label: 'Período', placeholder: 'Ex: 3 meses', type: 'text', required: true }
    ],
    examples: [],
    tags: ['case study', 'resultados', 'prova social', 'portfolio'],
    difficulty: 'advanced',
    isPremium: true,
    usageCount: 0
  },
  {
    id: 'blog-comparison-post',
    categoryId: 'blog-conteudo',
    title: 'Post de Comparação (X vs Y)',
    description: 'Artigo comparativo completo entre duas ou mais opções.',
    template: `Crie um artigo comparativo detalhado e imparcial.

COMPARAÇÃO:
- Opção A: {opcao_a}
- Opção B: {opcao_b}
- Critérios principais: {criterios}
- Público-alvo: {publico}

ESTRUTURA DO COMPARATIVO:

📝 INTRODUÇÃO
- O dilema do leitor
- Por que essa comparação importa
- O que você vai descobrir

📝 VISÃO GERAL RÁPIDA
- Tabela resumo
- Vencedor por categoria
- Para quem cada um é melhor

📝 O QUE É [OPÇÃO A]
- Descrição
- História/background
- Proposta de valor
- Público ideal

📝 O QUE É [OPÇÃO B]
[mesma estrutura]

📝 COMPARAÇÃO DETALHADA

Critério 1: [Nome]
- Opção A: análise
- Opção B: análise
- Vencedor: X
- Por quê

Critério 2: [Nome]
[mesma estrutura]

[Continue para todos os critérios]

📝 PRÓS E CONTRAS

Opção A:
✅ Prós (5)
❌ Contras (3)

Opção B:
✅ Prós (5)
❌ Contras (3)

📝 PREÇOS E PLANOS
- Comparativo de valores
- Custo-benefício
- Ofertas especiais

📝 VEREDICTO FINAL
- Para quem escolher A
- Para quem escolher B
- Minha recomendação pessoal

📝 FAQ
- Perguntas frequentes sobre ambos

📝 CONCLUSÃO E CTA`,
    variables: [
      { name: 'opcao_a', label: 'Opção A', placeholder: 'Ex: WordPress', type: 'text', required: true },
      { name: 'opcao_b', label: 'Opção B', placeholder: 'Ex: Wix', type: 'text', required: true },
      { name: 'criterios', label: 'Critérios de Comparação', placeholder: 'Ex: Preço, facilidade, recursos, SEO', type: 'textarea', required: true },
      { name: 'publico', label: 'Público-alvo', placeholder: 'Ex: Iniciantes que querem criar um site', type: 'text', required: true }
    ],
    examples: [],
    tags: ['comparação', 'versus', 'review', 'análise'],
    difficulty: 'intermediate',
    isPremium: true,
    usageCount: 0
  },
  {
    id: 'blog-expert-roundup',
    categoryId: 'blog-conteudo',
    title: 'Expert Roundup (Opinião de Especialistas)',
    description: 'Artigo compilando insights de vários especialistas sobre um tema.',
    template: `Crie um artigo de expert roundup sobre o tema.

TEMA DO ROUNDUP:
- Pergunta central: {pergunta}
- Número de especialistas: {num_experts}
- Objetivo: {objetivo}
- Nicho: {nicho}

ESTRUTURA DO ROUNDUP:

📝 INTRODUÇÃO
- Por que essa pergunta importa
- Quem são os especialistas
- O que você vai aprender

📝 RESUMO DAS RESPOSTAS
- Principais tendências
- Pontos de concordância
- Insights únicos

📝 ESPECIALISTA 1
- Nome e credenciais
- Foto sugerida
- Resposta completa
- Insight principal em destaque
- Link/contato

📝 ESPECIALISTA 2
[mesma estrutura]

[Continue para todos os especialistas]

📝 ANÁLISE DAS RESPOSTAS
- Padrões identificados
- Divergências interessantes
- Conclusões práticas

📝 PLANO DE AÇÃO
- Como aplicar os insights
- Primeiro passo recomendado
- Recursos mencionados

📝 CONCLUSÃO
- Resumo dos melhores insights
- Agradecimento aos especialistas
- CTA

📝 BÔNUS: INFOGRÁFICO
- Sugestão de design
- Principais quotes visuais`,
    variables: [
      { name: 'pergunta', label: 'Pergunta Central', placeholder: 'Ex: Qual a tendência mais importante para 2024?', type: 'text', required: true },
      { name: 'num_experts', label: 'Número de Especialistas', placeholder: 'Ex: 10', type: 'text', required: true },
      { name: 'objetivo', label: 'Objetivo', placeholder: 'Ex: Identificar tendências de mercado', type: 'text', required: true },
      { name: 'nicho', label: 'Nicho', placeholder: 'Ex: Marketing Digital', type: 'text', required: true }
    ],
    examples: [],
    tags: ['roundup', 'especialistas', 'autoridade', 'tendências'],
    difficulty: 'intermediate',
    isPremium: true,
    usageCount: 0
  },
  {
    id: 'blog-ultimate-guide',
    categoryId: 'blog-conteudo',
    title: 'Guia Definitivo (Ultimate Guide)',
    description: 'O guia mais completo da internet sobre um tema específico.',
    template: `Crie o guia definitivo sobre o tema.

DADOS DO GUIA:
- Tema: {tema}
- Objetivo: {objetivo}
- Público: {publico}
- Diferencial: {diferencial}

ESTRUTURA DO GUIA DEFINITIVO:

📝 CAPA/HEADER
- Título épico
- Subtítulo explicativo
- Estimativa de leitura
- Índice clicável

📝 INTRODUÇÃO (500 palavras)
- Por que este guia existe
- O que você vai dominar
- Por que confiar neste guia
- Como usar o guia

📝 CAPÍTULO 1: FUNDAMENTOS
- Conceitos básicos
- Glossário de termos
- História e contexto
- Por que é importante

📝 CAPÍTULO 2: ESTRATÉGIA
- Planejamento
- Definição de objetivos
- Métricas de sucesso
- Roadmap sugerido

📝 CAPÍTULO 3: IMPLEMENTAÇÃO
- Passo a passo detalhado
- Ferramentas necessárias
- Templates prontos
- Checklist de execução

📝 CAPÍTULO 4: TÁTICAS AVANÇADAS
- Técnicas de experts
- Hacks e atalhos
- Otimizações
- A/B tests sugeridos

📝 CAPÍTULO 5: ESTUDOS DE CASO
- 3-5 cases reais
- Resultados documentados
- Lições aprendidas

📝 CAPÍTULO 6: ERROS COMUNS
- Os maiores erros
- Como evitá-los
- Como corrigir

📝 CAPÍTULO 7: FUTURO E TENDÊNCIAS
- Para onde está indo
- O que esperar
- Como se preparar

📝 RECURSOS E FERRAMENTAS
- Lista completa de ferramentas
- Templates gratuitos
- Cursos recomendados
- Livros essenciais

📝 CONCLUSÃO
- Resumo dos pontos-chave
- Plano de ação de 30 dias
- CTA principal

📝 FAQ EXTENSO
- 15-20 perguntas
- Schema markup`,
    variables: [
      { name: 'tema', label: 'Tema do Guia', placeholder: 'Ex: SEO para iniciantes', type: 'text', required: true },
      { name: 'objetivo', label: 'Objetivo', placeholder: 'Ex: Ranquear na primeira página do Google', type: 'text', required: true },
      { name: 'publico', label: 'Público-alvo', placeholder: 'Ex: Donos de pequenos negócios', type: 'text', required: true },
      { name: 'diferencial', label: 'Diferencial do Guia', placeholder: 'Ex: Atualizado para 2024 com IA', type: 'text', required: true }
    ],
    examples: [],
    tags: ['guia definitivo', 'completo', 'autoridade', 'SEO'],
    difficulty: 'advanced',
    isPremium: true,
    isFeatured: true,
    usageCount: 0
  },
  {
    id: 'blog-news-analysis',
    categoryId: 'blog-conteudo',
    title: 'Análise de Notícia/Tendência',
    description: 'Artigo de análise profunda sobre notícia ou tendência do mercado.',
    template: `Crie uma análise profunda sobre a notícia/tendência.

DADOS DA ANÁLISE:
- Notícia/Tendência: {noticia}
- Fonte original: {fonte}
- Impacto no mercado: {impacto}
- Seu posicionamento: {posicionamento}

ESTRUTURA DA ANÁLISE:

📝 MANCHETE DE IMPACTO
- Título que gera clique
- Subtítulo contextualizador

📝 O QUE ACONTECEU
- Resumo factual
- Dados principais
- Timeline
- Quem está envolvido

📝 POR QUE ISSO IMPORTA
- Impacto no mercado
- Quem é afetado
- Consequências imediatas
- Efeitos de longo prazo

📝 ANÁLISE PROFUNDA
- Causas por trás
- Contexto histórico
- Comparações relevantes
- Dados de suporte

📝 DIFERENTES PERSPECTIVAS
- Otimistas dizem...
- Críticos argumentam...
- Especialistas opinam...

📝 MINHA ANÁLISE
- O que eu penso
- Por que penso assim
- Experiência relevante
- Previsões

📝 O QUE FAZER AGORA
- Ações recomendadas
- O que evitar
- Como se preparar
- Oportunidades

📝 CONCLUSÃO
- Resumo da posição
- Visão de futuro
- CTA para discussão`,
    variables: [
      { name: 'noticia', label: 'Notícia/Tendência', placeholder: 'Ex: Google lança nova atualização de algoritmo', type: 'text', required: true },
      { name: 'fonte', label: 'Fonte Original', placeholder: 'Ex: Blog oficial do Google', type: 'text', required: true },
      { name: 'impacto', label: 'Impacto Esperado', placeholder: 'Ex: Mudança no ranqueamento de sites', type: 'text', required: true },
      { name: 'posicionamento', label: 'Seu Posicionamento', placeholder: 'Ex: Especialista em SEO', type: 'text', required: true }
    ],
    examples: [],
    tags: ['análise', 'notícia', 'tendência', 'opinião'],
    difficulty: 'intermediate',
    isPremium: true,
    usageCount: 0
  },
  {
    id: 'blog-interview-format',
    categoryId: 'blog-conteudo',
    title: 'Entrevista Formatada para Blog',
    description: 'Transforme uma entrevista em um artigo de blog envolvente.',
    template: `Formate a entrevista como artigo de blog envolvente.

DADOS DA ENTREVISTA:
- Entrevistado: {entrevistado}
- Cargo/expertise: {expertise}
- Tema principal: {tema}
- Principais insights: {insights}

ESTRUTURA DO ARTIGO:

📝 INTRODUÇÃO
- Quem é o entrevistado
- Por que essa conversa importa
- O que o leitor vai descobrir
- Contexto da entrevista

📝 HIGHLIGHT PRINCIPAL
- Quote mais impactante
- Em destaque visual
- Contexto breve

📝 SOBRE O ENTREVISTADO
- Bio completa
- Conquistas relevantes
- Por que ouvir essa pessoa
- Links e contatos

📝 A ENTREVISTA
[Formato conversacional ou Q&A]

Pergunta 1: [Pergunta]
Resposta: [Resposta editada e formatada]
💡 Insight-chave: [destaque]

Pergunta 2: [Pergunta]
[mesma estrutura]

[Continue para todas as perguntas]

📝 PRINCIPAIS TAKEAWAYS
- Lista dos 5-7 insights
- Formato de bullets
- Actionable

📝 RECURSOS MENCIONADOS
- Links citados
- Ferramentas
- Livros/cursos

📝 CONCLUSÃO
- Agradecimento
- Como se conectar com o entrevistado
- CTA`,
    variables: [
      { name: 'entrevistado', label: 'Nome do Entrevistado', placeholder: 'Ex: João Silva', type: 'text', required: true },
      { name: 'expertise', label: 'Cargo/Expertise', placeholder: 'Ex: CEO da StartupX', type: 'text', required: true },
      { name: 'tema', label: 'Tema Principal', placeholder: 'Ex: Crescimento de startups', type: 'text', required: true },
      { name: 'insights', label: 'Principais Insights', placeholder: 'Ex: Cultura, produto, vendas', type: 'textarea', required: true }
    ],
    examples: [],
    tags: ['entrevista', 'especialista', 'insights', 'autoridade'],
    difficulty: 'intermediate',
    isPremium: true,
    usageCount: 0
  },
  {
    id: 'blog-resource-page',
    categoryId: 'blog-conteudo',
    title: 'Página de Recursos Completa',
    description: 'Crie uma página de recursos definitiva sobre um tema.',
    template: `Crie uma página de recursos completa e útil.

TEMA DOS RECURSOS:
- Nicho: {nicho}
- Objetivo: {objetivo}
- Público-alvo: {publico}
- Categorias: {categorias}

ESTRUTURA DA PÁGINA:

📝 INTRODUÇÃO
- O que você vai encontrar
- Como usar esta página
- Como foi curada
- Última atualização

📝 ÍNDICE NAVEGÁVEL
- Todas as categorias
- Links âncora
- Número de itens por categoria

📝 CATEGORIA 1: [Nome]

Recurso 1:
- Nome e link
- Descrição (2-3 linhas)
- Preço (grátis/pago)
- Para quem é ideal
- Avaliação (★★★★☆)

Recurso 2:
[mesma estrutura]

[5-10 recursos por categoria]

📝 CATEGORIA 2: [Nome]
[mesma estrutura]

📝 CATEGORIA 3: [Nome]
[mesma estrutura]

📝 BÔNUS: MEUS FAVORITOS
- Top 5 recursos pessoais
- Por que uso cada um
- Dicas de uso

📝 COMO CONTRIBUIR
- Sugerir novo recurso
- Reportar link quebrado
- Feedback

📝 ATUALIZAÇÕES
- Changelog de adições
- Recursos removidos e por quê

📝 DOWNLOAD
- Versão PDF
- Planilha com todos os links
- Newsletter de atualizações`,
    variables: [
      { name: 'nicho', label: 'Nicho', placeholder: 'Ex: Marketing Digital', type: 'text', required: true },
      { name: 'objetivo', label: 'Objetivo da Página', placeholder: 'Ex: Reunir melhores ferramentas', type: 'text', required: true },
      { name: 'publico', label: 'Público-alvo', placeholder: 'Ex: Profissionais de marketing', type: 'text', required: true },
      { name: 'categorias', label: 'Categorias', placeholder: 'Ex: Ferramentas, cursos, livros, podcasts', type: 'textarea', required: true }
    ],
    examples: [],
    tags: ['recursos', 'ferramentas', 'curadoria', 'links'],
    difficulty: 'intermediate',
    isPremium: true,
    usageCount: 0
  },
  {
    id: 'blog-myth-busting',
    categoryId: 'blog-conteudo',
    title: 'Artigo de Desconstrução de Mitos',
    description: 'Desminta mitos comuns do seu nicho com fatos e dados.',
    template: `Crie um artigo que desminta mitos comuns.

DADOS DO ARTIGO:
- Tema geral: {tema}
- Número de mitos: {num_mitos}
- Fonte de dados: {fonte_dados}
- Seu posicionamento: {posicionamento}

ESTRUTURA DO ARTIGO:

📝 INTRODUÇÃO IMPACTANTE
- Estatística surpreendente
- Por que tantos acreditam nos mitos
- O perigo de seguir maus conselhos
- O que você vai descobrir

📝 MITO #1: "[Afirmação comum]"
❌ O que dizem
✅ A verdade
📊 Dados que comprovam
💡 O que fazer em vez disso
🔗 Fonte

📝 MITO #2: "[Afirmação comum]"
[mesma estrutura]

📝 MITO #3: "[Afirmação comum]"
[mesma estrutura]

[Continue para todos os mitos]

📝 POR QUE ESSES MITOS PERSISTEM
- Origens históricas
- Quem se beneficia
- Viés de confirmação
- Fontes ruins

📝 COMO IDENTIFICAR MITOS
- Sinais de alerta
- Perguntas a fazer
- Fontes confiáveis
- Pensamento crítico

📝 O QUE REALMENTE FUNCIONA
- Práticas comprovadas
- Baseado em dados
- Casos de sucesso

📝 CONCLUSÃO
- Resumo das verdades
- Encorajamento
- CTA para compartilhar`,
    variables: [
      { name: 'tema', label: 'Tema Geral', placeholder: 'Ex: Emagrecimento', type: 'text', required: true },
      { name: 'num_mitos', label: 'Número de Mitos', placeholder: 'Ex: 7', type: 'text', required: true },
      { name: 'fonte_dados', label: 'Fonte de Dados', placeholder: 'Ex: Estudos científicos, experiência', type: 'text', required: true },
      { name: 'posicionamento', label: 'Seu Posicionamento', placeholder: 'Ex: Nutricionista especializado', type: 'text', required: true }
    ],
    examples: [],
    tags: ['mitos', 'verdade', 'fatos', 'educativo'],
    difficulty: 'intermediate',
    isPremium: true,
    usageCount: 0
  },
  {
    id: 'blog-year-in-review',
    categoryId: 'blog-conteudo',
    title: 'Retrospectiva do Ano/Período',
    description: 'Artigo de retrospectiva com lições, números e planos.',
    template: `Crie uma retrospectiva completa do período.

DADOS DA RETROSPECTIVA:
- Período: {periodo}
- Área/Negócio: {area}
- Principais conquistas: {conquistas}
- Maiores desafios: {desafios}

ESTRUTURA DA RETROSPECTIVA:

📝 INTRODUÇÃO
- O que esse período significou
- Preview das seções
- Tom geral (celebração/aprendizado)

📝 NÚMEROS DO PERÍODO
- Métricas principais
- Comparativo com período anterior
- Crescimento percentual
- Infográfico sugerido

📝 MAIORES CONQUISTAS
- Top 5-7 vitórias
- Contexto de cada uma
- O que possibilitou
- Impacto nos resultados

📝 MAIORES DESAFIOS
- Principais dificuldades
- Como foram enfrentadas
- O que aprendeu
- O que faria diferente

📝 LIÇÕES APRENDIDAS
- Top 10 lições
- Explicação de cada
- Como aplicar

📝 BASTIDORES
- O que poucos sabem
- Momentos difíceis
- Decisões importantes
- Humanização

📝 AGRADECIMENTOS
- Pessoas chave
- Clientes/parceiros
- Equipe
- Comunidade

📝 PRÓXIMO PERÍODO
- Planos e metas
- O que esperar
- Novidades
- Pedido de feedback

📝 CONCLUSÃO
- Resumo emocional
- Gratidão
- CTA para comentários`,
    variables: [
      { name: 'periodo', label: 'Período', placeholder: 'Ex: 2024', type: 'text', required: true },
      { name: 'area', label: 'Área/Negócio', placeholder: 'Ex: Minha agência de marketing', type: 'text', required: true },
      { name: 'conquistas', label: 'Principais Conquistas', placeholder: 'Ex: 100 clientes, 1M faturamento', type: 'textarea', required: true },
      { name: 'desafios', label: 'Maiores Desafios', placeholder: 'Ex: Equipe, processos, crise', type: 'textarea', required: true }
    ],
    examples: [],
    tags: ['retrospectiva', 'review', 'lições', 'planejamento'],
    difficulty: 'intermediate',
    isPremium: true,
    usageCount: 0
  },
  {
    id: 'blog-beginner-guide',
    categoryId: 'blog-conteudo',
    title: 'Guia para Iniciantes Completo',
    description: 'Guia introdutório perfeito para quem está começando.',
    template: `Crie um guia completo para iniciantes.

DADOS DO GUIA:
- Tema: {tema}
- Público: {publico}
- Resultado esperado: {resultado}
- Pré-requisitos: {prerequisitos}

ESTRUTURA DO GUIA:

📝 INTRODUÇÃO ACOLHEDORA
- "Bem-vindo ao mundo de [tema]"
- Não precisa ter medo
- O que você vai aprender
- Jornada esperada

📝 O QUE É [TEMA]?
- Definição simples
- Analogias do dia a dia
- Por que existe
- Por que importa para você

📝 GLOSSÁRIO BÁSICO
- 15-20 termos essenciais
- Definições simples
- Exemplos de uso

📝 PRIMEIROS PASSOS
- O que fazer primeiro
- O que NÃO fazer
- Ferramentas necessárias
- Investimento inicial

📝 PASSO A PASSO PARA INICIANTES

Passo 1: [Nome]
- O que fazer
- Por que é importante
- Como fazer (detalhado)
- Erro comum
- Dica

Passo 2: [Nome]
[mesma estrutura]

[Continue até completar o básico]

📝 ERROS DE INICIANTE
- Top 10 erros
- Por que cometem
- Como evitar

📝 RECURSOS PARA INICIANTES
- Cursos gratuitos
- Canais recomendados
- Comunidades
- Livros introdutórios

📝 PRÓXIMOS PASSOS
- Quando você não é mais iniciante
- O que estudar depois
- Como se aprofundar

📝 FAQ PARA INICIANTES
- 10 perguntas mais comuns
- Respostas diretas

📝 CONCLUSÃO ENCORAJADORA
- Você consegue!
- Primeiro passo
- Comunidade de apoio
- CTA`,
    variables: [
      { name: 'tema', label: 'Tema', placeholder: 'Ex: Investimentos', type: 'text', required: true },
      { name: 'publico', label: 'Público Específico', placeholder: 'Ex: Jovens de 20-30 anos', type: 'text', required: true },
      { name: 'resultado', label: 'Resultado Esperado', placeholder: 'Ex: Fazer primeiro investimento', type: 'text', required: true },
      { name: 'prerequisitos', label: 'Pré-requisitos', placeholder: 'Ex: Nenhum, zero experiência', type: 'text', required: true }
    ],
    examples: [],
    tags: ['iniciantes', 'guia', 'básico', 'introdução'],
    difficulty: 'beginner',
    isPremium: true,
    usageCount: 0
  },
  {
    id: 'blog-data-driven',
    categoryId: 'blog-conteudo',
    title: 'Artigo Baseado em Dados',
    description: 'Artigo com estatísticas, pesquisas e análise de dados.',
    template: `Crie um artigo baseado em dados e pesquisas.

DADOS DO ARTIGO:
- Tema da pesquisa: {tema}
- Fontes de dados: {fontes}
- Hipótese principal: {hipotese}
- Conclusão esperada: {conclusao}

ESTRUTURA DO ARTIGO:

📝 TÍTULO COM NÚMERO
- Estatística impactante no título
- Gera curiosidade
- Promete insights

📝 RESUMO EXECUTIVO
- Principais descobertas
- Números-chave
- Implicações práticas

📝 METODOLOGIA
- Como os dados foram coletados
- Tamanho da amostra
- Período analisado
- Limitações

📝 CONTEXTO
- Por que essa pesquisa
- Estado atual do tema
- Gap de conhecimento

📝 DESCOBERTAS PRINCIPAIS

Descoberta 1:
📊 Dado: [estatística]
📈 Gráfico sugerido
💡 O que significa
🎯 Implicação prática

Descoberta 2:
[mesma estrutura]

[Continue para todas as descobertas]

📝 ANÁLISE CRUZADA
- Correlações encontradas
- Padrões identificados
- Surpresas

📝 COMPARATIVO
- Com pesquisas anteriores
- Com outros mercados
- Evolução no tempo

📝 IMPLICAÇÕES PRÁTICAS
- O que fazer com esses dados
- Recomendações
- Próximos passos

📝 MATERIAIS PARA DOWNLOAD
- Infográfico resumo
- Planilha de dados
- Apresentação pronta

📝 CONCLUSÃO
- Resumo das descobertas
- Chamada para ação
- Próxima pesquisa

📝 REFERÊNCIAS
- Todas as fontes citadas
- Links verificados`,
    variables: [
      { name: 'tema', label: 'Tema da Pesquisa', placeholder: 'Ex: Uso de IA no marketing', type: 'text', required: true },
      { name: 'fontes', label: 'Fontes de Dados', placeholder: 'Ex: Pesquisa própria + dados públicos', type: 'textarea', required: true },
      { name: 'hipotese', label: 'Hipótese Principal', placeholder: 'Ex: 70% das empresas usarão IA até 2025', type: 'text', required: true },
      { name: 'conclusao', label: 'Conclusão Esperada', placeholder: 'Ex: Adoção de IA é inevitável', type: 'text', required: true }
    ],
    examples: [],
    tags: ['dados', 'pesquisa', 'estatísticas', 'análise'],
    difficulty: 'advanced',
    isPremium: true,
    usageCount: 0
  },
  {
    id: 'blog-content-upgrade',
    categoryId: 'blog-conteudo',
    title: 'Atualização de Conteúdo Antigo',
    description: 'Roteiro para atualizar e melhorar artigos antigos.',
    template: `Crie um plano para atualizar conteúdo existente.

ARTIGO ORIGINAL:
- URL: {url}
- Data de publicação: {data_pub}
- Performance atual: {performance}
- Objetivo da atualização: {objetivo}

ANÁLISE E PLANO:

📝 AUDITORIA DO CONTEÚDO ATUAL

SEO:
- Palavra-chave atual
- Posição no Google
- CTR
- Backlinks

Conteúdo:
- Extensão atual
- Estrutura
- Qualidade das informações
- Links quebrados

📝 O QUE ATUALIZAR

Informações desatualizadas:
- [item 1]
- [item 2]
- [item 3]

Seções a adicionar:
- [nova seção 1]
- [nova seção 2]

Seções a remover/condensar:
- [seção]

📝 MELHORIAS DE SEO

- Nova keyword principal
- Keywords secundárias
- Meta title otimizado
- Meta description nova
- URLs de imagens

📝 MELHORIAS DE CONTEÚDO

- Dados atualizados para [ano]
- Novas ferramentas/recursos
- Cases mais recentes
- FAQ expandido

📝 MELHORIAS VISUAIS

- Imagens novas
- Infográficos
- Tabelas comparativas
- Screenshots atualizados

📝 CHECKLIST DE ATUALIZAÇÃO

□ Título atualizado
□ Meta tags revisadas
□ Introdução reescrita
□ Dados atualizados
□ Links verificados
□ Novas seções adicionadas
□ Imagens atualizadas
□ CTA atualizado
□ Data de atualização visível

📝 PROMOÇÃO PÓS-ATUALIZAÇÃO

- Re-compartilhar em redes
- Email para lista
- Responder comentários antigos
- Buscar novos backlinks`,
    variables: [
      { name: 'url', label: 'URL do Artigo', placeholder: 'Ex: /blog/guia-seo-2023', type: 'text', required: true },
      { name: 'data_pub', label: 'Data de Publicação', placeholder: 'Ex: Janeiro 2023', type: 'text', required: true },
      { name: 'performance', label: 'Performance Atual', placeholder: 'Ex: 500 visitas/mês, posição 15', type: 'text', required: true },
      { name: 'objetivo', label: 'Objetivo da Atualização', placeholder: 'Ex: Chegar no top 5 do Google', type: 'text', required: true }
    ],
    examples: [],
    tags: ['atualização', 'refresh', 'SEO', 'otimização'],
    difficulty: 'intermediate',
    isPremium: true,
    usageCount: 0
  }
];

// Exporta todos os prompts do Pack 3
export const premiumPromptsPack3 = [
  ...emailMarketingPremiumPrompts,
  ...blogContentPremiumPrompts
];
