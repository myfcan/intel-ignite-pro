/**
 * PACK 3 - PROMPTS PREMIUM
 * 30 prompts: 15 Email Marketing + 15 Blog/Conteúdo
 */

import { Prompt } from './promptTypes';

// ==========================================
// EMAIL MARKETING - 15 Prompts Premium
// ==========================================

export const emailMarketingPremiumPrompts: Prompt[] = [
  {
    id: 'email-welcome-sequence',
    title: 'Sequência de Boas-Vindas Completa',
    description: 'Crie uma sequência de 5 emails para novos assinantes que constrói relacionamento e converte.',
    fullPrompt: `Você é um especialista em email marketing e automação. Crie uma sequência completa de 5 emails de boas-vindas para novos assinantes.

CONTEXTO DO NEGÓCIO:
- Nicho: [seu nicho/mercado]
- Produto/Serviço principal: [o que você vende]
- Avatar do cliente: [descreva seu cliente ideal]
- Promessa principal: [benefício central que você entrega]

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
    category: 'email-marketing',
    isPremium: true,
    copyCount: 0,
    tags: ['welcome', 'automação', 'sequência', 'conversão']
  },
  {
    id: 'email-launch-campaign',
    title: 'Campanha de Lançamento 7 Dias',
    description: 'Sequência de emails para lançamento de produto com gatilhos mentais e urgência.',
    fullPrompt: `Você é um copywriter especialista em lançamentos digitais. Crie uma campanha completa de 7 emails para lançamento.

INFORMAÇÕES DO LANÇAMENTO:
- Produto: [nome e descrição]
- Preço: [valor e condições especiais]
- Duração do carrinho aberto: [ex: 7 dias]
- Bônus exclusivos: [liste os bônus]
- Garantia: [tipo e prazo]

ESTRUTURA DA CAMPANHA:

📧 DIA 1 - ABERTURA DO CARRINHO
- Assunto: alta urgência + novidade
- Anuncie oficialmente a abertura
- Destaque a oferta especial de lançamento
- Liste os bônus para primeiros compradores
- CTA: garantir vaga agora

📧 DIA 2 - PROVA SOCIAL
- Assunto: resultados de alunos/clientes
- Compartilhe 3-5 depoimentos poderosos
- Mostre transformações reais
- Conecte resultados com o produto
- CTA: fazer parte do grupo de sucesso

📧 DIA 3 - CONTEÚDO + OBJEÇÕES
- Assunto: responda dúvida comum
- Entregue valor genuíno (mini-aula)
- Quebre objeção principal
- Mostre que o produto resolve isso
- CTA: eliminar essa dor agora

📧 DIA 4 - BÔNUS EXTRA (Meio do lançamento)
- Assunto: surpresa/presente
- Anuncie bônus adicional inesperado
- Crie senso de valor crescente
- Atualize contagem de vagas/vendas
- CTA: aproveitar pacote completo

📧 DIA 5 - STORYTELLING
- Assunto: história pessoal/de cliente
- Conte jornada de transformação
- Conecte emocionalmente
- Mostre o "antes e depois"
- CTA: começar sua transformação

📧 DIA 6 - ÚLTIMA CHANCE
- Assunto: aviso final
- Destaque que faltam 24 horas
- Recapitule tudo que está incluído
- Reforce garantia (risco zero)
- CTA: última oportunidade

📧 DIA 7 - ENCERRAMENTO
- Assunto: últimas horas (urgência máxima)
- Email curto e direto
- Countdown final
- Lembre da remoção dos bônus
- CTA: garantir antes do fechamento

Para cada email, forneça:
- Linha de assunto principal + 2 alternativas
- Preview text
- Corpo completo formatado
- PS com gatilho extra`,
    category: 'email-marketing',
    isPremium: true,
    copyCount: 0,
    tags: ['lançamento', 'campanha', 'vendas', 'urgência']
  },
  {
    id: 'email-reengagement',
    title: 'Campanha de Reativação de Lista',
    description: 'Sequência para reativar assinantes inativos e limpar sua lista.',
    fullPrompt: `Você é especialista em email marketing e reativação de listas. Crie uma campanha de 4 emails para reengajar assinantes inativos.

CONTEXTO:
- Período de inatividade: [ex: 90+ dias sem abrir]
- Tamanho do segmento inativo: [número aproximado]
- Último conteúdo/oferta enviado: [descreva]
- Incentivo para reativação: [desconto, bônus, etc.]

SEQUÊNCIA DE REATIVAÇÃO:

📧 EMAIL 1 - "SENTIMOS SUA FALTA"
- Assunto: personalizado e curioso
- Tom: amigável, não desesperado
- Reconheça que não interagiram
- Pergunte se ainda querem receber
- Ofereça algo de valor gratuito
- CTA: "Sim, quero continuar"

📧 EMAIL 2 - "MUDAMOS POR VOCÊ" (3 dias depois)
- Assunto: novidade/mudança
- Mostre o que melhorou na newsletter
- Destaque conteúdos recentes populares
- Ofereça escolher preferências
- CTA: atualizar preferências

📧 EMAIL 3 - "PRESENTE ESPECIAL" (5 dias depois)
- Assunto: oferta exclusiva
- Ofereça desconto/bônus de reativação
- Prazo limitado para a oferta
- Mostre o que estão perdendo
- CTA: resgatar presente

📧 EMAIL 4 - "ÚLTIMA MENSAGEM" (7 dias depois)
- Assunto: despedida respeitosa
- Avise que vai remover da lista
- Dê última chance de ficar
- Botão claro para permanecer
- Botão para cancelar inscrição
- CTA: "Quero continuar" vs "Pode me remover"

MÉTRICAS DE SUCESSO:
- Taxa de reativação esperada: 5-15%
- Limpeza de lista: remover não-respondentes
- Melhoria na entregabilidade

Para cada email, inclua:
- 2 opções de linha de assunto
- Preview text
- Corpo completo
- Configuração de automação sugerida`,
    category: 'email-marketing',
    isPremium: true,
    copyCount: 0,
    tags: ['reativação', 'lista', 'engajamento', 'limpeza']
  },
  {
    id: 'email-abandoned-cart',
    title: 'Sequência de Carrinho Abandonado',
    description: 'Recupere vendas perdidas com emails estratégicos para carrinhos abandonados.',
    fullPrompt: `Você é especialista em recuperação de vendas e email marketing. Crie uma sequência de 4 emails para carrinho abandonado.

INFORMAÇÕES DO E-COMMERCE:
- Tipo de produto: [físico/digital/serviço]
- Ticket médio: [valor]
- Motivos comuns de abandono: [frete, preço, dúvidas]
- Incentivo disponível: [desconto, frete grátis, bônus]

SEQUÊNCIA DE RECUPERAÇÃO:

📧 EMAIL 1 - LEMBRETE (1 hora após abandono)
- Assunto: simples e direto
- Tom: prestativo, não vendedor
- Lembre dos itens no carrinho
- Pergunte se houve problema técnico
- Mostre imagem do produto
- CTA: finalizar compra

📧 EMAIL 2 - VALOR (24 horas após)
- Assunto: destaque benefício
- Reforce os benefícios do produto
- Inclua depoimento relevante
- Responda dúvida frequente
- Mostre avaliações/estrelas
- CTA: garantir o seu

📧 EMAIL 3 - INCENTIVO (48 horas após)
- Assunto: oferta especial
- Ofereça desconto ou frete grátis
- Prazo limitado para a oferta
- Destaque economia
- Adicione urgência leve
- CTA: usar cupom agora

📧 EMAIL 4 - ÚLTIMA CHANCE (72 horas após)
- Assunto: expiração do carrinho/oferta
- Avise que itens podem esgotar
- Última chamada para o desconto
- Crie urgência real
- CTA: finalizar antes que expire

ELEMENTOS TÉCNICOS:
- Personalização com nome do produto
- Imagem dinâmica do item
- Link direto para checkout
- Cupom aplicado automaticamente

Para cada email, forneça:
- Linha de assunto + emoji strategy
- Preview text otimizado
- Corpo do email formatado
- Timing exato de envio`,
    category: 'email-marketing',
    isPremium: true,
    copyCount: 0,
    tags: ['carrinho', 'recuperação', 'e-commerce', 'vendas']
  },
  {
    id: 'email-newsletter-weekly',
    title: 'Template de Newsletter Semanal',
    description: 'Estrutura completa para criar newsletters engajantes toda semana.',
    fullPrompt: `Você é especialista em newsletters e criação de conteúdo. Crie um template de newsletter semanal que mantém engajamento alto.

INFORMAÇÕES DA NEWSLETTER:
- Nome/Marca: [sua newsletter]
- Nicho: [seu mercado]
- Tom de voz: [formal/casual/inspirador/provocativo]
- Frequência: semanal
- Objetivo principal: [educar/entreter/vender/inspirar]

ESTRUTURA DO TEMPLATE:

📰 SEÇÃO 1 - GANCHO DE ABERTURA
- Pergunta provocativa OU
- Estatística surpreendente OU
- História pessoal breve OU
- Observação do momento atual
[Objetivo: capturar atenção nos primeiros 3 segundos]

📰 SEÇÃO 2 - INSIGHT PRINCIPAL
- Um conceito/ideia central da semana
- Explicação clara e prática
- Exemplo ou analogia
- Por que isso importa agora
[Formato: 150-250 palavras]

📰 SEÇÃO 3 - AÇÃO PRÁTICA
- Uma dica implementável hoje
- Passo a passo simples (3-5 passos)
- Resultado esperado
[Formato: lista ou bullets]

📰 SEÇÃO 4 - CURADORIA DE VALOR
- 3 recursos úteis da semana:
  • 📖 Artigo/Thread recomendado
  • 🎧 Podcast/Vídeo interessante
  • 🛠️ Ferramenta/Recurso útil
[Com descrição de 1 linha cada]

📰 SEÇÃO 5 - CONEXÃO PESSOAL
- Bastidores ou reflexão pessoal
- Pergunta para o leitor
- Convite para responder
[Humaniza a marca]

📰 SEÇÃO 6 - CTA SEMANAL
- Rotativo entre:
  • Produto/Serviço
  • Conteúdo gratuito
  • Engajamento (responder, compartilhar)
  • Indicação (member get member)

📰 ASSINATURA
- Despedida consistente
- Nome + cargo/título
- Links sociais
- PS estratégico (opcional)

DICAS DE FORMATAÇÃO:
- Use emojis com moderação
- Parágrafos curtos (2-3 linhas)
- Negrito para pontos-chave
- Bullets para listas
- Espaçamento generoso

Crie um exemplo completo usando este template para o nicho especificado.`,
    category: 'email-marketing',
    isPremium: true,
    copyCount: 0,
    tags: ['newsletter', 'semanal', 'engajamento', 'conteúdo']
  },
  {
    id: 'email-flash-sale',
    title: 'Campanha de Venda Relâmpago 24h',
    description: 'Emails de alta conversão para promoções de tempo limitado.',
    fullPrompt: `Você é copywriter especialista em campanhas de urgência. Crie uma campanha de venda relâmpago de 24 horas.

DETALHES DA PROMOÇÃO:
- Produto/Oferta: [o que está em promoção]
- Desconto: [percentual ou valor]
- Duração: 24 horas
- Quantidade limitada: [se aplicável]
- Motivo da promoção: [aniversário, Black Friday, queima, etc.]

SEQUÊNCIA DE 4 EMAILS EM 24H:

⚡ EMAIL 1 - LANÇAMENTO (Hora 0)
Horário: [ex: 8h da manhã]

- Assunto: URGÊNCIA + NOVIDADE
- Anuncie a venda relâmpago
- Destaque o desconto de forma impactante
- Mostre economia em reais
- Countdown visual (texto)
- Lista rápida do que está incluído
- CTA: Garantir agora com X% OFF

⚡ EMAIL 2 - MEIO-DIA (Hora 4-6)
Horário: [ex: 12h-14h]

- Assunto: Atualização + Prova social
- "Já vendemos X unidades"
- Depoimento rápido de cliente
- Lembre do prazo (restam X horas)
- Destaque bônus ou diferencial
- CTA: Aproveitar antes que acabe

⚡ EMAIL 3 - AVISO (Hora 18-20)
Horário: [ex: tarde/noite]

- Assunto: Últimas horas - AVISO
- Urgência máxima no tom
- Recapitule a oferta completa
- "Depois de meia-noite, volta ao preço normal"
- Quebre última objeção
- CTA: Última chance

⚡ EMAIL 4 - ENCERRAMENTO (Hora 23)
Horário: [ex: 23h]

- Assunto: 1 HORA - Fechando
- Email curtíssimo e direto
- Countdown: "59 minutos"
- Apenas o essencial
- Link direto para checkout
- CTA: Comprar agora

ELEMENTOS DE CONVERSÃO:
- Timer visual em cada email
- Preço riscado vs preço promocional
- Selos de garantia
- Botões grandes e coloridos

Para cada email, forneça:
- 3 opções de linha de assunto
- Preview text
- Corpo formatado
- Horário ideal de envio`,
    category: 'email-marketing',
    isPremium: true,
    copyCount: 0,
    tags: ['flash-sale', 'urgência', 'promoção', '24h']
  },
  {
    id: 'email-testimonial-request',
    title: 'Sequência de Pedido de Depoimento',
    description: 'Emails para coletar depoimentos e avaliações de clientes satisfeitos.',
    fullPrompt: `Você é especialista em customer success e prova social. Crie uma sequência de emails para coletar depoimentos de clientes.

CONTEXTO:
- Produto/Serviço: [o que foi comprado]
- Tempo desde a compra: [quando enviar]
- Formato desejado: [texto, vídeo, áudio, avaliação]
- Incentivo oferecido: [desconto, bônus, sorteio]

SEQUÊNCIA DE 3 EMAILS:

📝 EMAIL 1 - PEDIDO INICIAL
Timing: [ex: 7 dias após compra/resultado]

- Assunto: amigável e pessoal
- Celebre o progresso/resultado do cliente
- Explique a importância de depoimentos
- Faça o pedido de forma simples
- Ofereça opções de formato
- Perguntas guia para facilitar:
  1. Como era sua situação antes?
  2. O que mudou após usar [produto]?
  3. Qual resultado específico você teve?
  4. O que diria para quem está em dúvida?
- Mencione o incentivo (se houver)
- CTA: link para formulário simples

📝 EMAIL 2 - LEMBRETE
Timing: 3-5 dias depois

- Assunto: lembrete gentil
- "Sei que está ocupado(a), mas..."
- Reforce o quanto a opinião importa
- Simplifique ainda mais (1 pergunta só)
- Mostre como será usado (com permissão)
- Lembre do incentivo
- CTA: responder este email mesmo

📝 EMAIL 3 - ÚLTIMA TENTATIVA
Timing: 5-7 dias depois

- Assunto: última chance + incentivo
- Tom: respeitoso mas direto
- Aumente o incentivo ou crie urgência
- Ofereça alternativas:
  • Responder 1 pergunta por email
  • Gravar áudio de 30 segundos
  • Dar nota de 1-5 estrelas
- Agradeça independente da resposta
- CTA: escolher a forma mais fácil

MODELOS DE PERGUNTAS POR FORMATO:

Para TEXTO (100 palavras):
- Qual era seu maior desafio antes?
- Como [produto] te ajudou?
- Qual resultado você alcançou?

Para VÍDEO (60 segundos):
- Se apresente brevemente
- Conte sua transformação
- Recomende para quem?

Para AVALIAÇÃO RÁPIDA:
- Nota de 1-5
- Uma frase sobre o produto
- Recomendaria? Sim/Não

Forneça cada email completo com assunto, preview e corpo.`,
    category: 'email-marketing',
    isPremium: true,
    copyCount: 0,
    tags: ['depoimento', 'prova-social', 'avaliação', 'cliente']
  },
  {
    id: 'email-upsell-cross-sell',
    title: 'Emails de Upsell e Cross-sell',
    description: 'Aumente o ticket médio com emails estratégicos pós-compra.',
    fullPrompt: `Você é especialista em maximização de receita e email marketing. Crie uma sequência de upsell e cross-sell pós-compra.

INFORMAÇÕES:
- Produto comprado: [produto inicial]
- Preço do produto inicial: [valor]
- Upsell disponível: [versão superior/complemento]
- Cross-sell disponível: [produto relacionado]
- Desconto para upgrade: [se houver]

SEQUÊNCIA ESTRATÉGICA:

💎 EMAIL 1 - CONFIRMAÇÃO + SEMENTE (Imediato)
- Agradeça pela compra
- Confirme detalhes do pedido
- Mostre como usar/acessar
- Plante a semente do upgrade:
  "PS: Sabia que existe uma versão [premium/completa]?"
- Link discreto para saber mais

💎 EMAIL 2 - CROSS-SELL (3-5 dias depois)
- Assunto: "Pessoas que compraram X também adoram Y"
- Mostre produto complementar
- Explique como potencializa o produto inicial
- Oferta especial por ser cliente
- Depoimentos de quem comprou os dois
- CTA: Adicionar Y ao seu arsenal

💎 EMAIL 3 - UPSELL (7-10 dias depois)
- Assunto: Proposta de upgrade
- Reconheça que está usando o produto
- Apresente a versão superior
- Destaque o que está "perdendo":
  • Feature exclusiva 1
  • Feature exclusiva 2
  • Feature exclusiva 3
- Oferta de upgrade com desconto
- Tabela comparativa: Básico vs Premium
- CTA: Fazer upgrade agora

💎 EMAIL 4 - BUNDLE/PACOTE (14 dias depois)
- Assunto: Oferta especial de cliente VIP
- Crie um pacote exclusivo
- Desconto maior por ser bundle
- "Tudo que você precisa em um só lugar"
- Economia destacada em reais
- Prazo limitado
- CTA: Garantir pacote completo

TÁTICAS DE CONVERSÃO:
- Use o nome do produto comprado
- Reforce a decisão inicial
- Mostre valor, não desconto
- Crie ofertas exclusivas para clientes
- Use escassez real

Para cada email, inclua:
- Linha de assunto
- Preview text
- Corpo completo
- Timing exato
- Segmentação recomendada`,
    category: 'email-marketing',
    isPremium: true,
    copyCount: 0,
    tags: ['upsell', 'cross-sell', 'pós-venda', 'ticket-médio']
  },
  {
    id: 'email-webinar-sequence',
    title: 'Sequência de Webinar Completa',
    description: 'Emails para promover, lembrar e converter após um webinar.',
    fullPrompt: `Você é especialista em webinars e funis de vendas. Crie a sequência completa de emails para um webinar.

INFORMAÇÕES DO WEBINAR:
- Título: [nome do webinar]
- Data e hora: [quando acontece]
- Duração: [ex: 60 minutos]
- Tema principal: [o que será ensinado]
- Oferta no final: [produto que será vendido]

FASE 1 - PRÉ-WEBINAR (Inscrição)

📧 EMAIL 1 - CONVITE INICIAL (7 dias antes)
- Assunto: convite irresistível
- Apresente o tema e benefícios
- O que vai aprender (3-5 bullets)
- Para quem é (e para quem NÃO é)
- Data, hora, duração
- CTA: Reservar minha vaga grátis

📧 EMAIL 2 - LEMBRETE 1 (3 dias antes)
- Assunto: "Você se inscreveu?"
- Reforce os benefícios
- Compartilhe credenciais do apresentador
- Crie expectativa com teaser
- CTA: Confirmar presença

📧 EMAIL 3 - LEMBRETE 2 (1 dia antes)
- Assunto: Amanhã às [hora]
- Checklist de preparação
- Link de acesso
- Instruções técnicas
- O que ter em mãos
- CTA: Adicionar ao calendário

📧 EMAIL 4 - DIA DO WEBINAR (2h antes)
- Assunto: Estamos quase começando
- Link de acesso em destaque
- "Entra agora para garantir lugar"
- Última dica de preparação
- CTA: Acessar sala

FASE 2 - PÓS-WEBINAR

📧 EMAIL 5 - PARA QUEM ASSISTIU (Imediato)
- Assunto: Replay + Oferta especial
- Agradeça a participação
- Link do replay (se houver)
- Recapitule a oferta apresentada
- Bônus exclusivo para participantes ao vivo
- Prazo para aproveitar
- CTA: Garantir oferta especial

📧 EMAIL 6 - PARA QUEM NÃO ASSISTIU (Imediato)
- Assunto: Você perdeu... mas tem solução
- Reconheça que não pôde participar
- Ofereça o replay
- Resuma os principais insights
- Mantenha a oferta disponível
- CTA: Assistir replay agora

📧 EMAIL 7 - FOLLOW-UP (24h depois)
- Assunto: Dúvidas sobre [oferta]?
- Responda objeções comuns
- Mais depoimentos
- Lembre do prazo
- CTA: Tirar dúvidas ou comprar

📧 EMAIL 8 - ENCERRAMENTO (48h depois)
- Assunto: Última chamada
- Prazo final
- Recapitule tudo incluído
- Último lembrete de bônus
- CTA: Garantir antes do fechamento

Forneça cada email com assunto, preview e corpo completo.`,
    category: 'email-marketing',
    isPremium: true,
    copyCount: 0,
    tags: ['webinar', 'evento', 'funil', 'conversão']
  },
  {
    id: 'email-seasonal-campaign',
    title: 'Campanhas Sazonais (Datas Comemorativas)',
    description: 'Templates para Black Friday, Natal, Dia das Mães e outras datas.',
    fullPrompt: `Você é especialista em marketing sazonal e email marketing. Crie templates de campanha para datas comemorativas.

DATA ESCOLHIDA: [Black Friday / Natal / Dia das Mães / Dia dos Namorados / Ano Novo / Páscoa / Outro]

INFORMAÇÕES:
- Produto/Serviço: [o que vende]
- Desconto/Oferta: [promoção especial]
- Período da campanha: [datas]
- Diferencial da marca: [por que comprar de você]

ESTRUTURA DA CAMPANHA SAZONAL:

🎄 EMAIL 1 - AQUECIMENTO (7 dias antes)
- Assunto: Algo especial está chegando...
- Teaser da promoção
- Crie expectativa e curiosidade
- Convide para lista VIP/early access
- CTA: Quero ser avisado primeiro

🎄 EMAIL 2 - LANÇAMENTO (Dia 1)
- Assunto: [DATA] começou! [Desconto]% OFF
- Anuncie a promoção oficialmente
- Destaque os melhores produtos/ofertas
- Mostre economia em reais
- Diferenciais da compra com você
- CTA: Comprar com desconto

🎄 EMAIL 3 - CURADORIA (Dia 2-3)
- Assunto: Top [X] mais vendidos nessa [data]
- Curadoria dos produtos mais populares
- Facilite a escolha do cliente
- Categorize: "Para ele", "Para ela", etc.
- Sugestões por faixa de preço
- CTA: Ver toda a seleção

🎄 EMAIL 4 - PROVA SOCIAL (Dia 4)
- Assunto: O que estão dizendo sobre nós
- Depoimentos de clientes
- Avaliações e estrelas
- Números (vendas, satisfação)
- CTA: Fazer parte dos satisfeitos

🎄 EMAIL 5 - URGÊNCIA (Penúltimo dia)
- Assunto: ⚠️ Últimas [X] horas de [DATA]
- Aviso de fim de promoção
- Produtos quase esgotando
- Últimas unidades de best-sellers
- CTA: Aproveitar antes de acabar

🎄 EMAIL 6 - ÚLTIMO DIA
- Assunto: HOJE é o último dia!
- Email curto e urgente
- Countdown
- Entrega garantida (se físico)
- CTA: Garantir agora

ADAPTAÇÕES POR DATA:
- Black Friday: foco em descontos agressivos
- Natal: foco em presentes e entrega
- Dia das Mães: foco emocional
- Dia dos Namorados: foco em experiência
- Ano Novo: foco em renovação/metas

Forneça cada email adaptado para a data escolhida.`,
    category: 'email-marketing',
    isPremium: true,
    copyCount: 0,
    tags: ['sazonal', 'datas', 'black-friday', 'natal']
  },
  {
    id: 'email-referral-program',
    title: 'Programa de Indicação por Email',
    description: 'Sequência para lançar e promover programa de indicação.',
    fullPrompt: `Você é especialista em growth e programas de referral. Crie uma sequência de emails para programa de indicação.

ESTRUTURA DO PROGRAMA:
- Recompensa para quem indica: [ex: R$50 de crédito]
- Recompensa para indicado: [ex: 20% de desconto]
- Mecânica: [link único, código, etc.]
- Limite: [quantas indicações por pessoa]

SEQUÊNCIA DE EMAILS:

🎁 EMAIL 1 - LANÇAMENTO DO PROGRAMA
- Assunto: Ganhe [recompensa] indicando amigos
- Apresente o programa oficialmente
- Explique como funciona (3 passos simples):
  1. Compartilhe seu link
  2. Amigo compra com desconto
  3. Você ganha [recompensa]
- Benefício duplo: você ganha, amigo ganha
- CTA: Pegar meu link de indicação

🎁 EMAIL 2 - COMO INDICAR (3 dias depois)
- Assunto: Dicas para ganhar mais indicando
- Ensine a compartilhar efetivamente:
  • WhatsApp (modelo de mensagem pronto)
  • Instagram Stories (como postar)
  • Email (template para copiar)
- Mostre quem já está ganhando
- CTA: Começar a indicar agora

🎁 EMAIL 3 - PROVA SOCIAL (7 dias depois)
- Assunto: [Nome] já ganhou R$[X] indicando
- Cases de sucesso do programa
- Ranking de maiores indicadores
- Quanto já foi distribuído
- CTA: Quero fazer parte

🎁 EMAIL 4 - BOOST TEMPORÁRIO (Ocasional)
- Assunto: DOBRO de recompensa só hoje!
- Anuncie promoção especial do programa
- Período limitado para ganhar mais
- Urgência para indicar agora
- CTA: Indicar com recompensa dobrada

🎁 EMAIL 5 - LEMBRETE MENSAL
- Assunto: Seu saldo de indicações
- Mostre quantas indicações fez
- Quanto já ganhou
- Quantas indicações faltam para próximo nível
- Facilite com links prontos
- CTA: Indicar mais amigos

MATERIAIS COMPLEMENTARES:
- Template de mensagem WhatsApp
- Sugestão de post para Stories
- Email modelo para enviar a amigos
- Banner/imagem para compartilhar

Forneça cada email completo com todos os elementos.`,
    category: 'email-marketing',
    isPremium: true,
    copyCount: 0,
    tags: ['indicação', 'referral', 'growth', 'viral']
  },
  {
    id: 'email-onboarding-saas',
    title: 'Onboarding SaaS (Software)',
    description: 'Sequência para ativar novos usuários de software/plataforma.',
    fullPrompt: `Você é especialista em customer success e onboarding. Crie uma sequência de emails para ativar novos usuários de SaaS.

INFORMAÇÕES DO PRODUTO:
- Nome da plataforma: [seu SaaS]
- Ação de ativação principal: [o que define um usuário ativo]
- Período de trial: [se houver]
- Features principais: [3-5 funcionalidades-chave]

SEQUÊNCIA DE ONBOARDING (14 dias):

🚀 EMAIL 1 - BEM-VINDO (Imediato)
- Assunto: Bem-vindo ao [Nome]! 🎉
- Celebre a decisão
- Link de acesso em destaque
- 1 próximo passo claro (quick win)
- Vídeo de boas-vindas (se houver)
- Suporte disponível
- CTA: Acessar [Plataforma]

🚀 EMAIL 2 - QUICK WIN (Dia 1)
- Assunto: Conquiste seu primeiro [resultado] em 5 min
- Guie para a primeira vitória
- Passo a passo simples (3-5 etapas)
- Screenshot ou GIF demonstrando
- Resultado esperado
- CTA: Fazer isso agora

🚀 EMAIL 3 - FEATURE PRINCIPAL (Dia 3)
- Assunto: Você já experimentou [Feature Principal]?
- Apresente a funcionalidade mais valiosa
- Caso de uso prático
- Como outras empresas usam
- Tutorial rápido
- CTA: Experimentar [Feature]

🚀 EMAIL 4 - DICA PRO (Dia 5)
- Assunto: Dica que nossos power users adoram
- Compartilhe hack/atalho avançado
- Mostre ganho de produtividade
- "A maioria não sabe disso"
- CTA: Testar dica pro

🚀 EMAIL 5 - PROGRESSO (Dia 7)
- Assunto: Seu progresso na primeira semana
- Recapitule o que já configurou
- Mostre o que falta explorar
- Checklist visual de ativação
- Incentive próximos passos
- CTA: Completar configuração

🚀 EMAIL 6 - CASE DE SUCESSO (Dia 10)
- Assunto: Como [Cliente] alcançou [Resultado]
- História de cliente similar
- Resultados específicos
- O que ele fez diferente
- CTA: Replicar a estratégia

🚀 EMAIL 7 - SUPORTE (Dia 12)
- Assunto: Alguma dúvida? Estamos aqui
- Convide para call/demo
- Links para recursos de ajuda
- FAQ rápido
- Comunidade/grupo de usuários
- CTA: Falar com nosso time

🚀 EMAIL 8 - FIM DO TRIAL (Dia 14, se aplicável)
- Assunto: Seu trial termina em 24h
- Recapitule o valor gerado
- Mostre o que perderá
- Oferta de conversão
- CTA: Assinar agora

Para cada email, inclua métricas de sucesso e segmentação.`,
    category: 'email-marketing',
    isPremium: true,
    copyCount: 0,
    tags: ['onboarding', 'saas', 'ativação', 'trial']
  },
  {
    id: 'email-win-back',
    title: 'Campanha Win-Back (Ex-Clientes)',
    description: 'Reconquiste clientes que cancelaram ou pararam de comprar.',
    fullPrompt: `Você é especialista em retenção e win-back campaigns. Crie uma sequência para reconquistar ex-clientes.

CONTEXTO:
- Produto/Serviço: [o que vendia]
- Tempo desde última compra/cancelamento: [período]
- Motivos comuns de saída: [preço, concorrência, etc.]
- Oferta de retorno: [desconto especial, upgrade]

SEQUÊNCIA WIN-BACK:

💔 EMAIL 1 - "SENTIMOS SUA FALTA"
- Assunto: Faz tempo que não nos vemos, [Nome]
- Tom: genuíno, não desesperado
- Reconheça a ausência
- Pergunte o que aconteceu (feedback)
- Mostre o que há de novo
- Sem venda direta
- CTA: Contar o que aconteceu

💔 EMAIL 2 - "O QUE MUDOU" (5 dias depois)
- Assunto: [X] novidades que você perdeu
- Liste melhorias/novidades desde a saída
- Responda objeções comuns
- Mostre evolução do produto/serviço
- Cases de quem voltou
- CTA: Ver as novidades

💔 EMAIL 3 - "OFERTA ESPECIAL" (10 dias depois)
- Assunto: Um presente para ex-clientes especiais
- Oferta exclusiva de retorno
- Desconto significativo ou upgrade grátis
- Prazo limitado
- Sem compromisso longo (se aplicável)
- CTA: Aceitar oferta de volta

💔 EMAIL 4 - "ÚLTIMA TENTATIVA" (15 dias depois)
- Assunto: Antes de seguirmos caminhos diferentes...
- Tom: respeitoso e definitivo
- Última oferta/condição especial
- Pergunte: "O que precisaria para voltar?"
- Opção de apenas manter contato
- CTA: Responder ou aceitar oferta

SEGMENTAÇÃO POR MOTIVO DE SAÍDA:
- Preço alto → Email focado em valor/ROI
- Concorrência → Email comparativo (diplomático)
- Não usava → Email sobre novos recursos/simplicidade
- Suporte ruim → Email sobre melhorias no atendimento

MÉTRICAS ESPERADAS:
- Taxa de retorno: 5-15%
- Melhor período para win-back: 30-90 dias
- LTV recuperado vs CAC de reativação

Forneça cada email com personalizações por motivo de saída.`,
    category: 'email-marketing',
    isPremium: true,
    copyCount: 0,
    tags: ['win-back', 'retenção', 'ex-cliente', 'reconquistar']
  },
  {
    id: 'email-event-invitation',
    title: 'Convite para Evento Presencial/Online',
    description: 'Sequência completa para promover eventos e garantir presença.',
    fullPrompt: `Você é especialista em marketing de eventos. Crie uma sequência de emails para promover um evento.

INFORMAÇÕES DO EVENTO:
- Nome: [título do evento]
- Tipo: [presencial/online/híbrido]
- Data e horário: [quando]
- Local/Plataforma: [onde]
- Capacidade: [número de vagas]
- Investimento: [gratuito/pago - valor]
- Palestrantes: [quem vai falar]
- Público-alvo: [para quem é]

SEQUÊNCIA DE PROMOÇÃO:

🎫 EMAIL 1 - SAVE THE DATE (30 dias antes)
- Assunto: 📅 Marque na agenda: [Nome do Evento]
- Anuncie o evento
- Data, hora, local
- Palestrantes confirmados
- Por que não pode perder
- Early bird (se houver)
- CTA: Garantir minha vaga

🎫 EMAIL 2 - PROGRAMAÇÃO (20 dias antes)
- Assunto: Veja o que você vai aprender
- Programação completa
- Destaques de cada palestra
- Networking/benefícios extras
- Fotos de edições anteriores
- CTA: Inscrever agora

🎫 EMAIL 3 - PALESTRANTES (14 dias antes)
- Assunto: Conheça quem vai te ensinar
- Bio dos palestrantes
- Credenciais e conquistas
- Por que foram escolhidos
- Teaser do conteúdo
- CTA: Aprender com eles

🎫 EMAIL 4 - URGÊNCIA (7 dias antes)
- Assunto: ⚠️ Últimas [X] vagas para [Evento]
- Vagas se esgotando
- O que outros inscritos estão dizendo
- Benefícios de quem já confirmou
- CTA: Garantir antes de lotar

🎫 EMAIL 5 - LEMBRETE FINAL (3 dias antes)
- Assunto: [Evento] é em 3 dias!
- Para inscritos: confirmação + instruções
- Para não-inscritos: última chance
- O que levar/preparar
- CTA: Confirmar presença

🎫 EMAIL 6 - DIA ANTERIOR
- Assunto: Amanhã! Tudo pronto?
- Checklist final
- Horário, local, estacionamento
- Link de acesso (se online)
- Dicas para aproveitar melhor
- CTA: Pronto para amanhã!

🎫 EMAIL 7 - PÓS-EVENTO
- Assunto: Obrigado por participar! 🙏
- Agradeça a presença
- Peça feedback (pesquisa rápida)
- Materiais para download
- Fotos do evento
- Próximo evento (save the date)
- CTA: Deixar avaliação

Forneça cada email com todos os elementos.`,
    category: 'email-marketing',
    isPremium: true,
    copyCount: 0,
    tags: ['evento', 'convite', 'presencial', 'online']
  },
  {
    id: 'email-educational-drip',
    title: 'Sequência Educacional (Drip Campaign)',
    description: 'Série de emails educativos que nutrem leads até a conversão.',
    fullPrompt: `Você é especialista em nurturing e educação de leads. Crie uma sequência drip educacional de 7 emails.

CONTEXTO:
- Nicho: [seu mercado]
- Tema central: [assunto da sequência]
- Objetivo final: [ação desejada após a sequência]
- Lead magnet inicial: [o que capturou o email]

SEQUÊNCIA EDUCACIONAL DE 7 DIAS:

📚 EMAIL 1 - ENTREGA + FUNDAMENTOS (Dia 0)
- Assunto: Seu [lead magnet] + um bônus
- Entregue o prometido
- Apresente-se brevemente
- Introduza o tema central
- Teaser do que vem pela frente
- Defina expectativas da série
- CTA: Acessar o material

📚 EMAIL 2 - O PROBLEMA (Dia 1)
- Assunto: Por que [problema] acontece?
- Aprofunde no problema/dor
- Estatísticas e dados
- Consequências de não resolver
- Gere identificação
- CTA: Refletir sobre isso

📚 EMAIL 3 - A MUDANÇA DE PARADIGMA (Dia 2)
- Assunto: O que ninguém te contou sobre [tema]
- Quebre um mito ou crença limitante
- Apresente nova perspectiva
- Por que a abordagem tradicional falha
- CTA: Pensar diferente

📚 EMAIL 4 - A SOLUÇÃO (FRAMEWORK) (Dia 3)
- Assunto: Meu método de [X] passos
- Apresente seu framework/método
- Visão geral do sistema
- Por que funciona
- Resultados possíveis
- CTA: Entender o método

📚 EMAIL 5 - PASSO 1 DETALHADO (Dia 4)
- Assunto: Passo 1: [Nome do passo]
- Deep dive no primeiro passo
- Como implementar
- Erros comuns a evitar
- Mini exercício prático
- CTA: Aplicar hoje

📚 EMAIL 6 - CASES E PROVA (Dia 5)
- Assunto: [Nome] fez isso e conseguiu [resultado]
- 2-3 histórias de transformação
- Diferentes perfis de pessoas
- Resultados específicos
- O que fizeram
- CTA: Ver mais histórias

📚 EMAIL 7 - PRÓXIMO PASSO (Dia 6)
- Assunto: O que separa quem consegue de quem desiste
- Recapitule a jornada
- Desafio de implementação
- Apresente sua solução (produto/serviço)
- Oferta especial para a série
- CTA: Dar o próximo passo

PRINCÍPIOS DA SEQUÊNCIA:
- Cada email entrega valor independente
- Progressão lógica de conhecimento
- Soft sells nos primeiros, hard sell no final
- Storytelling em todos os emails

Forneça cada email com assunto, preview e corpo completo.`,
    category: 'email-marketing',
    isPremium: true,
    copyCount: 0,
    tags: ['educacional', 'drip', 'nurturing', 'leads']
  }
];

// ==========================================
// BLOG/CONTEÚDO - 15 Prompts Premium
// ==========================================

export const blogContentPremiumPrompts: Prompt[] = [
  {
    id: 'blog-pillar-content',
    title: 'Artigo Pilar Completo (3000+ palavras)',
    description: 'Crie um artigo pilar otimizado para SEO que domina o tópico.',
    fullPrompt: `Você é um especialista em SEO e marketing de conteúdo. Crie um artigo pilar completo e otimizado.

INFORMAÇÕES:
- Palavra-chave principal: [keyword alvo]
- Palavras-chave secundárias: [3-5 termos relacionados]
- Público-alvo: [quem vai ler]
- Objetivo: [ranquear, converter, educar]
- Tom de voz: [profissional/casual/técnico]

ESTRUTURA DO ARTIGO PILAR:

📝 META INFORMAÇÕES
- Title tag (máx. 60 caracteres)
- Meta description (máx. 160 caracteres)
- URL sugerida (slug)
- Categoria do blog

📝 TÍTULO PRINCIPAL (H1)
- Inclua palavra-chave
- Promessa clara de valor
- Ano atual (se relevante)
- Número (se aplicável)

📝 INTRODUÇÃO (150-200 palavras)
- Hook que prende atenção
- Apresente o problema/tema
- O que o leitor vai aprender
- Por que confiar neste conteúdo
- Preview dos tópicos

📝 ÍNDICE/SUMÁRIO
- Todos os H2s linkáveis
- Navegação fácil
- Featured snippet friendly

📝 DESENVOLVIMENTO (2500+ palavras)
Divida em 6-8 seções (H2) com:
- Explicação clara do tópico
- Dados e estatísticas recentes
- Exemplos práticos
- Citações de especialistas
- Imagens/infográficos sugeridos
- Sub-seções (H3) quando necessário

📝 SEÇÕES OBRIGATÓRIAS:
1. O que é [tema]? (definição)
2. Por que [tema] é importante?
3. Como fazer [tema] (passo a passo)
4. [X] melhores práticas/dicas
5. Erros comuns a evitar
6. Ferramentas/recursos recomendados
7. FAQ (5-7 perguntas)

📝 CONCLUSÃO (150-200 palavras)
- Recapitule os pontos principais
- Call-to-action claro
- Próximos passos para o leitor

📝 ELEMENTOS DE SEO:
- Densidade de keyword: 1-2%
- LSI keywords naturalmente inseridas
- Links internos sugeridos (3-5)
- Links externos para fontes confiáveis
- Alt text para imagens

📝 SCHEMA MARKUP SUGERIDO:
- Article
- FAQPage
- HowTo (se aplicável)

Crie o artigo completo seguindo esta estrutura.`,
    category: 'blog-content',
    isPremium: true,
    copyCount: 0,
    tags: ['pilar', 'seo', 'long-form', 'autoridade']
  },
  {
    id: 'blog-listicle-viral',
    title: 'Listicle Viral (Lista que Engaja)',
    description: 'Artigos em formato de lista que viralizam e geram tráfego.',
    fullPrompt: `Você é especialista em conteúdo viral e listicles. Crie um artigo em formato de lista altamente compartilhável.

INFORMAÇÕES:
- Tema: [assunto do listicle]
- Número de itens: [ex: 15, 21, 37]
- Público: [quem vai ler]
- Objetivo: [tráfego, leads, shares]

ESTRUTURA DO LISTICLE:

📋 TÍTULO VIRAL
- Número ímpar ou específico (não use 10, 20)
- Promessa de benefício
- Gatilho de curiosidade
Exemplos:
- "37 [Coisas] Que [Benefício] em [Prazo]"
- "[X] Segredos de [Autoridade] Para [Resultado]"
- "[X] Erros Que [Público] Comete (E Como Evitar)"

📋 INTRODUÇÃO (100-150 palavras)
- Estatística surpreendente OU
- Pergunta provocativa OU
- História breve
- O que o leitor vai ganhar
- Promessa de facilidade

📋 LISTA (Desenvolva cada item)
Para cada item, inclua:
- Título chamativo (H2 ou H3)
- Explicação (50-150 palavras)
- Exemplo prático ou dado
- Dica de implementação
- Imagem/visual sugerido

📋 FORMATOS DE ITEM VARIADOS:
1. Dica direta + exemplo
2. Mito vs Realidade
3. Antes vs Depois
4. Ferramenta + caso de uso
5. Erro + solução
6. Citação de expert + contexto

📋 ELEMENTOS DE ENGAJAMENTO:
- Boxes de destaque
- Checklists printáveis
- Infográfico resumo
- Tweet/quote pronto para compartilhar
- CTA entre seções

📋 CONCLUSÃO
- Quick recap (lista resumida)
- Pergunta para comentários
- CTA para ação ou compartilhamento
- Conteúdo relacionado

📋 OTIMIZAÇÃO PARA VIRAL:
- Shareability score alto
- Títulos tweetáveis
- Imagens Pinterest-friendly
- Open graph otimizado

Crie o listicle completo com todos os itens desenvolvidos.`,
    category: 'blog-content',
    isPremium: true,
    copyCount: 0,
    tags: ['listicle', 'viral', 'lista', 'compartilhável']
  },
  {
    id: 'blog-how-to-guide',
    title: 'Guia How-To Definitivo',
    description: 'Tutorial passo a passo que ranqueia para "como fazer".',
    fullPrompt: `Você é especialista em tutoriais e conteúdo educacional. Crie um guia how-to completo e prático.

INFORMAÇÕES:
- Tema: Como [ação/resultado desejado]
- Nível: [iniciante/intermediário/avançado]
- Tempo estimado: [quanto tempo leva]
- Ferramentas necessárias: [se houver]

ESTRUTURA DO GUIA HOW-TO:

🔧 META E TÍTULO
- "Como [Ação] em [Prazo/Passos]: Guia Completo [Ano]"
- Meta description com benefício claro
- Featured snippet otimizado

🔧 OVERVIEW BOX
- Tempo necessário: X minutos/horas
- Dificuldade: Fácil/Médio/Difícil
- Custo estimado: Grátis/R$X
- Materiais: Lista rápida
- Resultado: O que vai conseguir

🔧 INTRODUÇÃO
- Por que fazer isso é importante
- Resultados esperados
- Erros comuns que vamos evitar
- Pré-requisitos (se houver)

🔧 PASSO A PASSO DETALHADO
Para cada passo, inclua:

PASSO [N]: [Nome do Passo]
- O que fazer (instrução clara)
- Por que fazer (contexto)
- Como fazer (detalhamento)
- Screenshot/imagem sugerida
- Dica extra ou atalho
- Erro comum a evitar
- Checkpoint: como saber se fez certo

🔧 SEÇÕES COMPLEMENTARES:

Dicas de Expert:
- 3-5 dicas avançadas
- Atalhos de produtividade
- Best practices

Troubleshooting:
- Problema 1 → Solução
- Problema 2 → Solução
- Problema 3 → Solução

Variações:
- Como fazer com [alternativa A]
- Como fazer com [alternativa B]
- Versão rápida vs completa

🔧 RECURSOS ADICIONAIS
- Ferramentas recomendadas
- Templates/downloads
- Vídeo complementar (se houver)
- Artigos relacionados

🔧 CONCLUSÃO
- Recapitule os passos
- Próximo nível (o que fazer depois)
- CTA para aplicar
- Convite para compartilhar resultado

🔧 SCHEMA MARKUP: HowTo
- name
- totalTime
- tool[]
- supply[]
- step[]

Crie o guia completo com todos os passos detalhados.`,
    category: 'blog-content',
    isPremium: true,
    copyCount: 0,
    tags: ['how-to', 'tutorial', 'guia', 'passo-a-passo']
  },
  {
    id: 'blog-case-study',
    title: 'Case Study Detalhado',
    description: 'Estudo de caso que demonstra resultados e constrói autoridade.',
    fullPrompt: `Você é especialista em storytelling de negócios. Crie um case study completo e persuasivo.

INFORMAÇÕES:
- Cliente/Empresa: [nome ou pseudônimo]
- Setor/Nicho: [área de atuação]
- Problema inicial: [desafio enfrentado]
- Solução aplicada: [o que foi feito]
- Resultados: [métricas e conquistas]

ESTRUTURA DO CASE STUDY:

📊 TÍTULO
- "[Empresa] Aumentou [Métrica] em [X]% Com [Solução]"
- Foco no resultado, não no processo

📊 RESUMO EXECUTIVO (Box destacado)
- Cliente: [nome]
- Setor: [área]
- Desafio: [1 linha]
- Solução: [1 linha]
- Resultado: [métrica principal]
- Tempo: [quanto levou]

📊 SEÇÃO 1: O DESAFIO
- Contexto da empresa/pessoa
- Situação antes (dados específicos)
- Dores e problemas enfrentados
- Tentativas anteriores que falharam
- Por que era crítico resolver
- O que estava em jogo

📊 SEÇÃO 2: A DESCOBERTA
- Como nos encontraram
- Por que escolheram nossa solução
- Dúvidas e objeções iniciais
- Momento de decisão

📊 SEÇÃO 3: A SOLUÇÃO
- Diagnóstico inicial
- Estratégia desenvolvida
- Implementação fase a fase
- Desafios durante o processo
- Ajustes realizados
- Timeline do projeto

📊 SEÇÃO 4: OS RESULTADOS
Métricas antes vs depois:
- Métrica 1: [antes] → [depois] (+X%)
- Métrica 2: [antes] → [depois] (+X%)
- Métrica 3: [antes] → [depois] (+X%)

Resultados qualitativos:
- Mudança de mindset
- Impacto na equipe
- Benefícios inesperados

📊 SEÇÃO 5: DEPOIMENTO
- Quote direta do cliente
- Em primeira pessoa
- Emocional + racional
- Recomendação

📊 SEÇÃO 6: LIÇÕES APRENDIDAS
- O que funcionou melhor
- O que faríamos diferente
- Dicas para quem está começando

📊 CTA
- "Quer resultados similares?"
- Próximo passo claro
- Formulário de contato

📊 ELEMENTOS VISUAIS:
- Foto do cliente (se permitido)
- Gráficos de evolução
- Timeline visual
- Antes/depois side-by-side

Crie o case study completo.`,
    category: 'blog-content',
    isPremium: true,
    copyCount: 0,
    tags: ['case-study', 'resultados', 'prova-social', 'B2B']
  },
  {
    id: 'blog-comparison-post',
    title: 'Post Comparativo (X vs Y)',
    description: 'Artigo de comparação que ranqueia e ajuda na decisão.',
    fullPrompt: `Você é especialista em conteúdo de decisão de compra. Crie um post comparativo completo e imparcial.

INFORMAÇÕES:
- Opção A: [primeiro item/ferramenta/produto]
- Opção B: [segundo item]
- Critérios importantes: [o que o público considera]
- Público: [quem está decidindo]

ESTRUTURA DO POST COMPARATIVO:

⚖️ TÍTULO
- "[A] vs [B]: Qual Escolher em [Ano]?"
- "[A] ou [B]? Comparação Completa + Veredicto"

⚖️ INTRODUÇÃO
- Por que essa comparação importa
- Promessa de clareza na decisão
- Preview do que será comparado
- Sua experiência com ambos

⚖️ QUICK ANSWER BOX (Featured Snippet)
- Resumo em 2-3 linhas
- Quando escolher A
- Quando escolher B

⚖️ OVERVIEW DE CADA OPÇÃO

[Opção A]:
- O que é
- Para quem é ideal
- Principais características
- Preço
- Prós rápidos
- Contras rápidos

[Opção B]:
- O que é
- Para quem é ideal
- Principais características
- Preço
- Prós rápidos
- Contras rápidos

⚖️ COMPARAÇÃO DETALHADA

TABELA COMPARATIVA:
| Critério | [A] | [B] | Vencedor |
|----------|-----|-----|----------|
| Preço | | | |
| Facilidade | | | |
| Features | | | |
| Suporte | | | |
| etc. | | | |

Para cada critério (5-8):
- Análise da Opção A
- Análise da Opção B
- Veredicto do critério
- Para quem cada um é melhor

⚖️ PRÓS E CONTRAS DETALHADOS

Opção A:
✅ Prós:
- Pro 1 (explicação)
- Pro 2 (explicação)
- Pro 3 (explicação)

❌ Contras:
- Contra 1 (explicação)
- Contra 2 (explicação)

[Repetir para Opção B]

⚖️ CASOS DE USO
- Escolha A se: [cenários]
- Escolha B se: [cenários]
- Considere ambos se: [cenário]

⚖️ PREÇOS E PLANOS
- Comparativo de preços
- Custo-benefício
- Plano recomendado de cada

⚖️ VEREDICTO FINAL
- Sua recomendação
- Justificativa
- Situações específicas

⚖️ FAQ
- [A] ou [B] para iniciantes?
- Qual tem melhor suporte?
- Posso migrar de um para outro?

Crie a comparação completa e objetiva.`,
    category: 'blog-content',
    isPremium: true,
    copyCount: 0,
    tags: ['comparação', 'versus', 'decisão', 'review']
  },
  {
    id: 'blog-ultimate-resource',
    title: 'Recurso Definitivo (Link Building)',
    description: 'Página de recursos que atrai backlinks naturalmente.',
    fullPrompt: `Você é especialista em link building e conteúdo de referência. Crie uma página de recursos definitiva.

INFORMAÇÕES:
- Tema: [área/nicho]
- Tipos de recursos: [ferramentas, cursos, livros, etc.]
- Público-alvo: [quem vai usar]

ESTRUTURA DA PÁGINA DE RECURSOS:

📚 TÍTULO
- "Os [X] Melhores Recursos de [Tema] em [Ano]"
- "[Tema]: Guia Definitivo de Recursos (Atualizado)"
- "Tudo Sobre [Tema]: [X]+ Recursos Curados"

📚 INTRODUÇÃO
- O que torna esta lista especial
- Como foi curada
- Como usar melhor
- Última atualização

📚 ÍNDICE POR CATEGORIA
- [Categoria 1] - X recursos
- [Categoria 2] - X recursos
- [Categoria 3] - X recursos
...

📚 CATEGORIA 1: [Nome]
Breve introdução da categoria

Recurso 1:
- Nome (com link)
- Descrição (2-3 linhas)
- Preço: Grátis/Pago
- Destaque: Por que é bom
- Ideal para: [perfil]

[Repetir para cada recurso]

📚 SEÇÕES DE RECURSOS:

🛠️ FERRAMENTAS
- Ferramentas gratuitas
- Ferramentas pagas
- Ferramentas freemium

📖 CONTEÚDO EDUCACIONAL
- Cursos online
- Certificações
- Tutoriais gratuitos
- Canais YouTube

📚 LIVROS E LEITURAS
- Livros essenciais
- Ebooks gratuitos
- Blogs de referência
- Newsletters

👥 COMUNIDADES
- Grupos Facebook
- Comunidades Discord
- Fóruns
- Eventos

🎧 PODCASTS E VÍDEOS
- Podcasts top
- Canais YouTube
- Webinars gravados

📊 TEMPLATES E DOWNLOADS
- Planilhas
- Checklists
- Templates

📚 COMO CONTRIBUIR
- Sugira um recurso
- Formulário de submissão
- Critérios de aceitação

📚 CHANGELOG
- Data: recurso adicionado/removido
- Mantém atualizado e relevante

📚 ELEMENTOS DE SEO:
- Links internos estratégicos
- Outbound links de qualidade
- Schema markup: ItemList
- Atualização regular (mostrar data)

Crie a página de recursos completa.`,
    category: 'blog-content',
    isPremium: true,
    copyCount: 0,
    tags: ['recursos', 'link-building', 'curadoria', 'referência']
  },
  {
    id: 'blog-trend-analysis',
    title: 'Análise de Tendências do Setor',
    description: 'Artigo de tendências que posiciona como thought leader.',
    fullPrompt: `Você é analista de tendências e thought leader. Crie um artigo de análise de tendências do setor.

INFORMAÇÕES:
- Setor/Nicho: [área de análise]
- Período: [ano/trimestre]
- Fontes de dados: [pesquisas, relatórios, observações]
- Público: [quem vai ler]

ESTRUTURA DA ANÁLISE DE TENDÊNCIAS:

📈 TÍTULO
- "[X] Tendências de [Setor] Para [Ano/Período]"
- "O Futuro de [Setor]: [X] Tendências Que Vão Dominar"
- "Estado de [Setor] em [Ano]: Análise Completa"

📈 RESUMO EXECUTIVO
- 3-5 tendências principais em bullets
- Implicação geral para o mercado
- Por que isso importa agora

📈 INTRODUÇÃO
- Contexto do mercado atual
- Mudanças recentes significativas
- Metodologia da análise
- O que você vai aprender

📈 PANORAMA ATUAL
- Estado do mercado hoje
- Números e estatísticas-chave
- Players principais
- Desafios atuais

📈 TENDÊNCIA 1: [Nome]
- O que é
- Por que está emergindo
- Dados que comprovam
- Exemplos reais
- Impacto esperado
- Como se preparar
- Previsão: [curto/médio/longo prazo]

[Repetir estrutura para cada tendência - 5 a 10]

📈 TENDÊNCIAS EM DECLÍNIO
- O que está perdendo força
- Por que está acabando
- O que substitui

📈 WILDCARDS / INCERTEZAS
- Fatores que podem mudar tudo
- Cenários alternativos
- O que observar

📈 IMPLICAÇÕES PRÁTICAS

Para empresas:
- O que fazer agora
- O que parar de fazer
- Onde investir

Para profissionais:
- Skills em alta
- Skills obsoletas
- Como se reposicionar

📈 PREVISÕES
- Curto prazo (6 meses)
- Médio prazo (1-2 anos)
- Longo prazo (3-5 anos)

📈 CONCLUSÃO
- Síntese das tendências
- Chamada para ação
- Como acompanhar atualizações

📈 METODOLOGIA
- Fontes utilizadas
- Período de análise
- Limitações

📈 SOBRE O AUTOR
- Credenciais
- Por que confiar nesta análise

Crie a análise de tendências completa.`,
    category: 'blog-content',
    isPremium: true,
    copyCount: 0,
    tags: ['tendências', 'análise', 'thought-leadership', 'previsões']
  },
  {
    id: 'blog-interview-format',
    title: 'Entrevista com Expert',
    description: 'Formato de entrevista que gera autoridade e tráfego.',
    fullPrompt: `Você é especialista em content marketing e jornalismo. Crie uma entrevista envolvente com um expert.

INFORMAÇÕES:
- Entrevistado: [nome e cargo]
- Área de expertise: [especialidade]
- Tema da entrevista: [foco principal]
- Formato: [texto/áudio/vídeo transcrito]

ESTRUTURA DA ENTREVISTA:

🎤 TÍTULO
- "Entrevista: [Nome] Revela [Insight Principal]"
- "[Nome] Sobre [Tema]: 'Quote Impactante'"
- "Conversando com [Nome]: [X] Lições Sobre [Tema]"

🎤 INTRODUÇÃO DO ENTREVISTADO
- Quem é [Nome]
- Principais conquistas
- Por que essa pessoa é relevante
- Contexto da entrevista
- Foto profissional

🎤 DESTAQUES (Box)
- 3-5 quotes ou insights principais
- Para quem quer ler rápido

🎤 PERGUNTAS E RESPOSTAS

Categoria 1: Trajetória
P: Como você começou em [área]?
R: [Resposta desenvolvida]

P: Qual foi o momento decisivo da sua carreira?
R: [Resposta]

Categoria 2: Expertise
P: Qual é o maior erro que você vê [público] cometendo?
R: [Resposta]

P: Se pudesse dar apenas um conselho sobre [tema], qual seria?
R: [Resposta]

Categoria 3: Mercado/Futuro
P: Como você vê [área] evoluindo nos próximos anos?
R: [Resposta]

P: O que você está animado para explorar/fazer?
R: [Resposta]

Categoria 4: Práticas
P: Como é sua rotina de [atividade]?
R: [Resposta]

P: Quais ferramentas/recursos você mais usa?
R: [Resposta]

🎤 LIGHTNING ROUND (Respostas rápidas)
- Livro favorito:
- Pessoa que inspira:
- Melhor conselho que recebeu:
- Hábito que mudou sua vida:
- Previsão ousada:

🎤 ONDE ENCONTRAR
- Redes sociais
- Site/Newsletter
- Projetos atuais

🎤 NOTA DO EDITOR
- Insights pessoais
- Agradecimento
- Próximas entrevistas

🎤 PERGUNTAS BÔNUS (Para série):
10-15 perguntas adicionais para diferentes contextos:
- Para iniciantes
- Para avançados
- Sobre fracassos
- Sobre sucesso
- Controversas (com tato)

Crie o roteiro completo de perguntas e estrutura.`,
    category: 'blog-content',
    isPremium: true,
    copyCount: 0,
    tags: ['entrevista', 'expert', 'autoridade', 'Q&A']
  },
  {
    id: 'blog-data-driven-post',
    title: 'Artigo Baseado em Dados',
    description: 'Post com pesquisa original que atrai links e mídia.',
    fullPrompt: `Você é especialista em data journalism e pesquisa. Crie um artigo baseado em dados originais.

INFORMAÇÕES:
- Tema da pesquisa: [o que foi investigado]
- Fonte dos dados: [como coletou]
- Tamanho da amostra: [quantos respondentes/dados]
- Descoberta principal: [finding mais importante]

ESTRUTURA DO ARTIGO DATA-DRIVEN:

📊 TÍTULO
- "Pesquisa: [X]% dos [Grupo] [Fazem/Acreditam] [Algo]"
- "Novo Estudo Revela [Descoberta Surpreendente] Sobre [Tema]"
- "Analisamos [X] [Coisas] e Descobrimos [Insight]"

📊 KEY FINDINGS BOX
- Finding 1: [estatística] - [implicação]
- Finding 2: [estatística] - [implicação]
- Finding 3: [estatística] - [implicação]
(Fácil de citar e compartilhar)

📊 INTRODUÇÃO
- Por que essa pesquisa foi feita
- Pergunta que queríamos responder
- Metodologia resumida
- O que encontramos (preview)

📊 METODOLOGIA
- Período da coleta
- Método (survey, análise, scraping)
- Tamanho e perfil da amostra
- Margem de erro
- Limitações
(Transparência = credibilidade)

📊 DESCOBERTAS PRINCIPAIS

Finding 1: [Título da Descoberta]
- A estatística: X%
- O que isso significa
- Gráfico/visualização
- Comparação com expectativa ou benchmarks
- Quote de expert comentando

[Repetir para cada finding - 5 a 10]

📊 ANÁLISE E INSIGHTS
- O que os dados dizem juntos
- Correlações interessantes
- O que surpreendeu
- O que confirmou hipóteses

📊 COMPARAÇÃO COM OUTROS ESTUDOS
- Como se compara com pesquisas similares
- O que há de novo
- Onde diverge

📊 IMPLICAÇÕES PRÁTICAS
Para [Público 1]:
- O que fazer com esses dados

Para [Público 2]:
- Como aplicar os insights

📊 CONCLUSÃO
- Síntese dos principais achados
- Perguntas que ficaram abertas
- Próximos passos de pesquisa

📊 DADOS PARA DOWNLOAD
- Infográfico resumo (embed code)
- PDF do relatório completo
- Dados brutos (se apropriado)

📊 CITAÇÃO SUGERIDA
"Segundo pesquisa do [Seu Site], X% dos [grupo] [dado]."

📊 METODOLOGIA DETALHADA (Apêndice)
- Perguntas do survey
- Segmentação
- Tratamento estatístico

Crie o artigo com dados simulados realistas.`,
    category: 'blog-content',
    isPremium: true,
    copyCount: 0,
    tags: ['dados', 'pesquisa', 'estatísticas', 'link-bait']
  },
  {
    id: 'blog-roundup-expert',
    title: 'Expert Roundup Post',
    description: 'Compilação de opiniões de experts que gera autoridade.',
    fullPrompt: `Você é especialista em outreach e conteúdo colaborativo. Crie um expert roundup post.

INFORMAÇÕES:
- Tema/Pergunta central: [a pergunta feita aos experts]
- Nicho: [área de expertise]
- Número de experts: [quantos participantes]

ESTRUTURA DO EXPERT ROUNDUP:

👥 TÍTULO
- "[X] Experts Respondem: [Pergunta]"
- "O Que [X] Líderes de [Área] Pensam Sobre [Tema]"
- "[X] Especialistas Revelam Seus Segredos de [Tema]"

👥 INTRODUÇÃO
- Por que essa pergunta é importante
- Como selecionamos os experts
- O que você vai aprender
- Índice de participantes

👥 KEY INSIGHTS (Resumo)
- 5-7 insights principais consolidados
- Padrões que emergiram
- Pontos de concordância
- Divergências interessantes

👥 RESPOSTA DOS EXPERTS

Expert 1: [Nome Completo]
📸 [Foto]
🏢 [Cargo, Empresa]
🔗 [Links: Twitter, LinkedIn, Site]

"[Resposta do expert - 100-300 palavras]"

💡 Takeaway: [resumo em 1 linha]

---

[Repetir formato para cada expert]

👥 ANÁLISE DAS RESPOSTAS
- Tema 1: O que a maioria concorda
- Tema 2: Perspectivas divergentes
- Tema 3: Insights únicos
- Tema 4: Surpresas

👥 COMO ENTRAR EM CONTATO
- Liste todos os experts com links
- Facilitador para networking

👥 CONCLUSÃO
- Síntese geral
- Próximo passo para o leitor
- Agradecimento aos participantes

👥 BÔNUS: PERGUNTAS QUE NÃO ENTRARAM
- Teasers para próximos roundups

👥 TEMPLATE DE OUTREACH (Para você replicar):

Assunto: [Tema] - Contribuição para artigo com [outros experts]

Olá [Nome],

Estou criando um expert roundup sobre [tema] e adoraria incluir sua perspectiva junto com [mencione 2-3 nomes conhecidos].

A pergunta é: "[Sua pergunta]"

Precisaria apenas de 2-3 parágrafos com sua opinião. Incluirei seu nome, foto, bio e links.

Deadline: [data]

Interessado?

[Seu nome]

👥 CHECKLIST DE OUTREACH:
- Personalize cada email
- Mencione outros experts já confirmados
- Faça follow-up educadamente
- Ofereça ver a resposta antes de publicar
- Avise quando publicar

Crie o template completo do roundup.`,
    category: 'blog-content',
    isPremium: true,
    copyCount: 0,
    tags: ['roundup', 'experts', 'colaborativo', 'outreach']
  },
  {
    id: 'blog-controversy-opinion',
    title: 'Post de Opinião Controversa',
    description: 'Artigo de opinião que gera debate e viraliza.',
    fullPrompt: `Você é especialista em thought leadership e conteúdo viral. Crie um post de opinião que gera debate saudável.

INFORMAÇÕES:
- Opinião/Tese: [sua posição controversa]
- Por que é controversa: [o que a maioria pensa]
- Sua experiência: [o que te qualifica a opinar]
- Tom desejado: [provocativo/respeitoso/humor]

ESTRUTURA DO POST DE OPINIÃO:

🔥 TÍTULO PROVOCATIVO
- "[Crença Comum] Está Errado. Aqui Está o Porquê."
- "Por Que Eu [Faço Algo Incomum] (E Você Deveria Também)"
- "Unpopular Opinion: [Sua Opinião]"
- "Chega de [Prática Comum]. Funciona Melhor [Alternativa]."

🔥 HOOK DE ABERTURA
- Declaração forte e direta
- Reconheça a controvérsia
- Por que você está "arriscando" escrever isso
- O que está em jogo

🔥 O ARGUMENTO CONVENCIONAL
- O que a maioria acredita
- Por que essa crença existe
- Onde você discorda
- Seja justo com o outro lado

🔥 SUA TESE
- Declare claramente sua posição
- Em 1-2 frases impactantes

🔥 EVIDÊNCIAS E ARGUMENTOS

Argumento 1:
- Apresente o ponto
- Dados ou exemplos
- Por que isso importa
- Antecipe a contra-argumentação

Argumento 2:
- [mesma estrutura]

Argumento 3:
- [mesma estrutura]

🔥 EXPERIÊNCIA PESSOAL
- Sua história com o tema
- O que você tentou
- O que funcionou/não funcionou
- Por que mudou de opinião

🔥 RECONHEÇA AS EXCEÇÕES
- Quando sua opinião não se aplica
- Casos onde o convencional funciona
- Nuance é sinal de inteligência

🔥 ANTECIPE AS CRÍTICAS
Crítica 1: [O que vão dizer]
Resposta: [Sua defesa]

Crítica 2: [O que vão dizer]
Resposta: [Sua defesa]

🔥 CALL TO REFLECTION
- Perguntas para o leitor considerar
- Convite para testar a ideia
- Sem forçar concordância

🔥 CONCLUSÃO
- Reafirme sua posição
- Convide ao debate respeitoso
- Esteja aberto a mudar de ideia

🔥 NOTA SOBRE TOM:
- Seja confiante, não arrogante
- Ataque ideias, não pessoas
- Use dados quando possível
- Adicione humor quando apropriado
- Mostre que você pensou no assunto

Crie o post de opinião completo.`,
    category: 'blog-content',
    isPremium: true,
    copyCount: 0,
    tags: ['opinião', 'controverso', 'debate', 'thought-leadership']
  },
  {
    id: 'blog-story-driven',
    title: 'Post Story-Driven (Narrativo)',
    description: 'Artigo narrativo que ensina através de história.',
    fullPrompt: `Você é especialista em storytelling e marketing de conteúdo. Crie um artigo narrativo que educa através de história.

INFORMAÇÕES:
- Lição principal: [o que quer ensinar]
- Protagonista: [quem é o personagem - você, cliente, personagem]
- Conflito: [qual era o desafio]
- Transformação: [o que mudou]
- Público: [quem vai ler]

ESTRUTURA STORY-DRIVEN:

📖 TÍTULO
- Fórmula: [Situação Ruim] → [Transformação] → [Resultado]
- Ou: "Como [Eu/Nome] [Superou Desafio] e [Alcançou Resultado]"

📖 GANCHO (Primeiras 3 linhas)
- Comece no momento de tensão
- In media res (no meio da ação)
- Crie urgência de continuar lendo

Exemplo: "Era 3h da manhã. Eu estava sentado no chão do escritório, laptop na frente, prestes a enviar o email que destruiria minha carreira. Ou salvaria."

📖 ATO 1: O MUNDO COMUM
- Quem era o protagonista antes
- Rotina, crenças, situação
- O problema que ignorava
- Sinais de que algo precisava mudar

📖 ATO 2A: O CHAMADO
- O momento de crise/oportunidade
- O que forçou a mudança
- A decisão de agir
- Medos e dúvidas

📖 ATO 2B: A JORNADA
- Os desafios enfrentados
- As tentativas e erros
- O mentor ou insight
- O momento mais difícil
- A virada

📖 ATO 3: A TRANSFORMAÇÃO
- O breakthrough
- A nova realidade
- Os resultados alcançados
- Como é a vida agora

📖 A LIÇÃO (Transição para ensino)
- O que essa história ensina
- Princípios universais
- Como aplicar no contexto do leitor

📖 FRAMEWORK/MÉTODO
- Estruture o aprendizado
- Passos práticos extraídos da história
- Ferramentas e recursos

📖 REFLEXÃO PARA O LEITOR
- Perguntas para autoaplicação
- Onde você está na jornada?
- Qual é o seu próximo passo?

📖 CONCLUSÃO EMOCIONAL
- Volte à história
- Mostre o protagonista hoje
- Mensagem de esperança/empoderamento
- CTA emocional

📖 TÉCNICAS NARRATIVAS A USAR:
- Diálogos diretos
- Descrições sensoriais
- Detalhes específicos (números, datas, lugares)
- Vulnerabilidade
- Humor nos momentos certos
- Cliffhangers entre seções

Crie o artigo narrativo completo.`,
    category: 'blog-content',
    isPremium: true,
    copyCount: 0,
    tags: ['storytelling', 'narrativo', 'história', 'emocional']
  },
  {
    id: 'blog-faq-page',
    title: 'Página de FAQ Otimizada',
    description: 'FAQ que ranqueia para featured snippets e voice search.',
    fullPrompt: `Você é especialista em SEO e experiência do usuário. Crie uma página de FAQ otimizada.

INFORMAÇÕES:
- Produto/Serviço/Tema: [o que você oferece]
- Público: [quem pergunta]
- Dúvidas mais comuns: [liste 5-10]
- Tom: [formal/casual/técnico]

ESTRUTURA DA PÁGINA FAQ:

❓ TÍTULO
- "FAQ: Tudo Sobre [Tema/Produto]"
- "[X] Perguntas Frequentes Sobre [Tema] Respondidas"
- "[Tema]: Suas Dúvidas Respondidas"

❓ INTRODUÇÃO
- O que esta página contém
- Como usar (índice, busca)
- Convite para perguntar se não encontrar

❓ CATEGORIAS DE PERGUNTAS

Categoria 1: [Nome - ex: "Sobre o Produto"]
- Pergunta 1
- Pergunta 2
- Pergunta 3

Categoria 2: [Nome - ex: "Preços e Pagamento"]
- Pergunta 1
- Pergunta 2

[Continue com 4-6 categorias]

❓ FORMATO DE CADA PERGUNTA

Q: [Pergunta exatamente como o usuário perguntaria]

A: [Resposta estruturada]

Parágrafo 1: Resposta direta (primeiras 40-60 palavras - featured snippet)

Parágrafo 2: Detalhamento/contexto

- Bullet 1 se necessário
- Bullet 2

Link relacionado: [se houver página com mais info]

---

❓ 15-20 PERGUNTAS ESSENCIAIS

Sobre o Básico:
1. O que é [produto/serviço]?
2. Para quem é [produto]?
3. Como funciona [produto]?
4. Preciso de [pré-requisito]?
5. Quanto tempo leva para [resultado]?

Sobre Preço:
6. Quanto custa [produto]?
7. Tem versão gratuita?
8. Quais formas de pagamento?
9. Posso parcelar?
10. Tem garantia de devolução?

Sobre Uso:
11. Como começo a usar?
12. Preciso instalar algo?
13. Funciona no celular?
14. Posso cancelar quando quiser?
15. Consigo exportar meus dados?

Sobre Suporte:
16. Como entro em contato?
17. Qual o horário de atendimento?
18. Tem suporte em português?
19. Onde encontro tutoriais?
20. Vocês fazem implementação?

❓ ELEMENTOS DE OTIMIZAÇÃO

Schema Markup FAQPage:
- @type: FAQPage
- mainEntity: [array de Questions]

Voice Search Optimization:
- Perguntas em linguagem natural
- "Como", "O que", "Por que", "Quando"
- Respostas diretas no início

UX Elements:
- Accordion/expansível
- Busca interna
- Anchor links
- "Isso respondeu sua dúvida?" (feedback)

❓ CTA FINAL
- Não encontrou sua resposta?
- Formulário de contato
- Chat/WhatsApp

Crie a página FAQ completa com todas as perguntas.`,
    category: 'blog-content',
    isPremium: true,
    copyCount: 0,
    tags: ['faq', 'featured-snippet', 'voice-search', 'suporte']
  },
  {
    id: 'blog-content-upgrade',
    title: 'Post com Content Upgrade',
    description: 'Artigo com material bônus para capturar leads.',
    fullPrompt: `Você é especialista em lead generation e content marketing. Crie um post com content upgrade estratégico.

INFORMAÇÕES:
- Tema do post: [assunto principal]
- Content upgrade: [material bônus - checklist, template, ebook]
- CTA desejado: [download, inscrição, trial]
- Persona: [quem vai baixar]

ESTRUTURA DO POST COM UPGRADE:

🎁 TÍTULO DO POST
- Promessa clara de valor
- Hint do bônus no título (opcional)

🎁 TEASER DO UPGRADE (Início do post)
[Box de destaque]
📥 BÔNUS EXCLUSIVO: [Nome do Material]
[Descrição em 1 linha do que contém]
[Botão: Baixar Grátis]

🎁 CONTEÚDO DO POST
- Artigo completo e valioso
- O upgrade complementa, não substitui
- Mencione o upgrade 2-3x naturalmente

🎁 MOMENTOS PARA MENCIONAR O UPGRADE:

Menção 1 (após primeiro H2):
"A propósito, criei um [template/checklist] com [benefício]. Baixe grátis aqui [link inline]."

Menção 2 (no meio do post):
[Box visual]
💡 Dica: Use o [Nome do Upgrade] para implementar isso mais rápido. [CTA]

Menção 3 (conclusão):
[Box maior com preview do material]

🎁 ESTRUTURA DO UPGRADE

Se for CHECKLIST:
- Título chamativo
- 10-20 itens acionáveis
- Boxes para marcar
- Design profissional
- Logo + contato

Se for TEMPLATE:
- Pronto para usar
- Editável (Google Docs, Notion, etc.)
- Instruções de uso
- Exemplos preenchidos

Se for EBOOK/GUIA:
- 10-20 páginas
- Complementa o post
- Conteúdo exclusivo
- Design atrativo

Se for PLANILHA:
- Fórmulas automáticas
- Instruções nas abas
- Exemplo preenchido
- Versão limpa para usar

🎁 PÁGINA DE CAPTURA (Para o upgrade)

Headline: [Benefício do Material]
Subheadline: [O que contém + formato]

Preview visual do material

3-4 bullets do que vai receber:
✅ [Benefício 1]
✅ [Benefício 2]
✅ [Benefício 3]

Formulário:
- Nome
- Email
- [Botão: Quero Meu [Material]]

Nota: Você também receberá [frequência] emails com [tipo de conteúdo]. Cancele quando quiser.

🎁 EMAIL DE ENTREGA

Assunto: Aqui está seu [Material] 🎁

Olá [Nome],

Muito obrigado por baixar o [Nome do Material]!

👇 Clique aqui para acessar:
[BOTÃO: Baixar [Material]]

Dicas para aproveitar melhor:
1. [Dica 1]
2. [Dica 2]
3. [Dica 3]

Nos próximos dias, vou compartilhar [preview do que vem].

Qualquer dúvida, responda este email.

[Assinatura]

PS: [Próximo passo ou oferta relacionada]

🎁 SEQUÊNCIA PÓS-DOWNLOAD
- Email 1: Entrega (imediato)
- Email 2: Implementação (dia 2)
- Email 3: Conteúdo relacionado (dia 4)
- Email 4: Case/prova social (dia 6)
- Email 5: Oferta (dia 7)

Crie o post completo + estrutura do upgrade.`,
    category: 'blog-content',
    isPremium: true,
    copyCount: 0,
    tags: ['lead-magnet', 'content-upgrade', 'captura', 'bônus']
  },
  {
    id: 'blog-update-refresh',
    title: 'Atualização de Conteúdo Antigo',
    description: 'Framework para atualizar posts antigos e recuperar tráfego.',
    fullPrompt: `Você é especialista em SEO e atualização de conteúdo. Crie um framework para atualizar posts antigos.

INFORMAÇÕES DO POST ORIGINAL:
- URL: [link do post]
- Data de publicação: [quando foi publicado]
- Tráfego atual: [visitas/mês]
- Posição atual: [ranking para keyword principal]
- Problema: [por que precisa atualizar]

FRAMEWORK DE ATUALIZAÇÃO:

🔄 AUDITORIA DO POST ATUAL

Checklist de Análise:
□ Informações desatualizadas
□ Links quebrados
□ Estatísticas antigas
□ Screenshots/imagens obsoletas
□ Ferramentas que não existem mais
□ Preços incorretos
□ Referências a anos passados
□ Concorrentes superaram no ranking
□ Featured snippet perdido
□ CTR baixo (título fraco)

🔄 PESQUISA DE ATUALIZAÇÃO

Keyword Research Refresh:
- Keyword principal ainda relevante?
- Novas keywords relacionadas?
- Intenção de busca mudou?
- Novos concorrentes?
- O que os top 3 têm que você não tem?

Content Gap Analysis:
- Seções que faltam
- Perguntas não respondidas
- Formatos não explorados (vídeo, infográfico)

🔄 PLANO DE ATUALIZAÇÃO

NÍVEL 1 - Quick Wins (1-2 horas):
- Atualizar ano no título e H1
- Corrigir estatísticas
- Atualizar links quebrados
- Adicionar data de atualização
- Melhorar meta description

NÍVEL 2 - Melhorias Médias (3-5 horas):
- Adicionar nova seção
- Atualizar screenshots
- Incluir FAQ schema
- Adicionar mais exemplos
- Melhorar formatação

NÍVEL 3 - Reescrita Parcial (1-2 dias):
- Expandir significativamente
- Novo título/angle
- Adicionar mídia (vídeo, infográfico)
- Content upgrade
- Redesign da página

🔄 TEMPLATE DE MUDANÇAS

Título:
- Original: [título antigo]
- Novo: [título atualizado + ano]
- Razão: [por que mudou]

Meta Description:
- Original: [descrição antiga]
- Nova: [descrição otimizada]

Seções Adicionadas:
1. [Nova seção]: [conteúdo resumido]
2. [Nova seção]: [conteúdo resumido]

Seções Removidas/Consolidadas:
1. [Seção]: [razão]

Dados Atualizados:
- [Dado antigo] → [Dado novo]
- [Dado antigo] → [Dado novo]

Links Corrigidos:
- [Link quebrado] → [Novo destino]

🔄 OTIMIZAÇÕES TÉCNICAS

On-Page:
- Verificar heading hierarchy
- Adicionar internal links novos
- Otimizar imagens (alt, compressão)
- Schema markup adequado

UX:
- Tempo de leitura
- Índice/navegação
- Mobile-friendly
- Core Web Vitals

🔄 PLANO DE PROMOÇÃO PÓS-UPDATE

- [ ] Atualizar data de publicação
- [ ] Compartilhar nas redes (como novo)
- [ ] Email para lista (conteúdo atualizado)
- [ ] Pedir novos backlinks
- [ ] Submeter no Search Console

🔄 TRACKING

Métricas a monitorar (30/60/90 dias):
- Posição no ranking
- Tráfego orgânico
- CTR (Search Console)
- Tempo na página
- Conversões

Crie o plano de atualização completo para o post.`,
    category: 'blog-content',
    isPremium: true,
    copyCount: 0,
    tags: ['atualização', 'refresh', 'seo', 'recuperar-tráfego']
  }
];
