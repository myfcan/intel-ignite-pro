import { PromptCategory } from '../../types/prompt';

export const contentPromptsCategory: PromptCategory = {
  id: 'content',
  name: 'Content Creation',
  description: 'Prompts para criar roteiros, scripts, storytelling e conteúdo criativo',
  icon: 'Video',
  color: 'bg-red-500',
  prompts: [
    {
      id: 'content-youtube-script',
      categoryId: 'content',
      title: 'Roteiro de Vídeo YouTube',
      description: 'Script completo otimizado para retenção',
      template: `Crie roteiro completo para vídeo YouTube:

Tema: {topic}
Duração alvo: {duration} minutos
Público: {audience}
Estilo: {style}

Estrutura otimizada para retenção:

**[00:00-00:15] HOOK (Primeiros 15 segundos críticos)**
- Frase de impacto que prende atenção
- Promise: o que vão aprender
- Elemento visual sugerido

**[00:15-00:30] Introdução**
- Apresentação rápida
- Preview do conteúdo (3 pontos principais)
- CTA de like e subscribe

**[00:30-{duration}-2:00] CONTEÚDO PRINCIPAL**
Dividir em 3-5 seções:
- Cada seção com título claro
- Pattern interrupts a cada 90 segundos
- Exemplos práticos
- B-roll sugerido
- Gráficos/animações recomendados

**[Últimos 2 min] CONCLUSÃO**
- Recap dos pontos principais
- CTA principal (curtir, inscrever, comentar)
- Tease do próximo vídeo
- Endscreen sugerido

Elementos extras:
- 3-5 momentos de humor/história pessoal
- Timestamps para descrição
- Título e thumbnail sugeridos
- Tags SEO

Tom: {style}`,
      variables: [
        {
          name: 'topic',
          label: 'Tema do vídeo',
          placeholder: 'Ex: Como usar Notion para produtividade',
          type: 'text',
          required: true
        },
        {
          name: 'duration',
          label: 'Duração (minutos)',
          placeholder: 'Ex: 10',
          type: 'select',
          options: ['5', '8', '10', '15', '20'],
          required: true
        },
        {
          name: 'audience',
          label: 'Público-alvo',
          placeholder: 'Ex: Estudantes universitários',
          type: 'text',
          required: true
        },
        {
          name: 'style',
          label: 'Estilo do vídeo',
          placeholder: 'Educativo, entretenimento, tutorial',
          type: 'select',
          options: ['Tutorial prático', 'Educativo', 'Entretenimento', 'Review', 'Vlog-style'],
          required: true
        }
      ],
      examples: [],
      tags: ['youtube', 'roteiro', 'script', 'vídeo'],
      difficulty: 'intermediate',
      isPremium: false,
      isFeatured: true,
      usageCount: 2543
    },
    {
      id: 'content-storytelling',
      categoryId: 'content',
      title: 'Estrutura de Storytelling',
      description: 'Conte histórias que conectam e vendem',
      template: `Crie uma história envolvente usando a jornada do herói:

Contexto: {context}
Protagonista: {hero}
Transformação desejada: {transformation}
Mensagem/Moral: {message}

**ESTRUTURA (Jornada do Herói Simplificada):**

1. **Mundo Comum** (Status quo)
   - Situação inicial do protagonista
   - Estabelecer empatia

2. **Chamado à Aventura** (Problema/Oportunidade)
   - O que mudou?
   - Qual o desafio?

3. **Recusa do Chamado** (Obstáculos internos)
   - Medos e dúvidas
   - Por que é difícil?

4. **Mentor** (Ajuda/Solução)
   - Quem ou o que ajudou?
   - Insight principal

5. **Cruzando o Umbral** (Decisão)
   - Momento de coragem
   - Primeiro passo

6. **Testes e Aliados** (Jornada)
   - Desafios enfrentados
   - Aprendizados
   - Pequenas vitórias

7. **Provação** (Momento crítico)
   - Maior desafio
   - Quase desistir

8. **Recompensa** (Transformação)
   - Resultado alcançado
   - Antes vs Depois

9. **Retorno** (Aplicação)
   - Como a vida mudou
   - Mensagem final

Tom: Autêntico, emocional, inspirador`,
      variables: [
        {
          name: 'context',
          label: 'Contexto da história',
          placeholder: 'Ex: Empreendedor falido que reconstruiu',
          type: 'textarea',
          required: true
        },
        {
          name: 'hero',
          label: 'Protagonista',
          placeholder: 'Ex: Você, cliente, fundador',
          type: 'text',
          required: true
        },
        {
          name: 'transformation',
          label: 'Transformação',
          placeholder: 'Ex: De endividado a milionário',
          type: 'text',
          required: true
        },
        {
          name: 'message',
          label: 'Mensagem/Moral',
          placeholder: 'Ex: Persistência vence mediocridade',
          type: 'text',
          required: true
        }
      ],
      examples: [],
      tags: ['storytelling', 'narrativa', 'história', 'jornada'],
      difficulty: 'advanced',
      isPremium: true,
      usageCount: 1234
    },
    {
      id: 'content-podcast-outline',
      categoryId: 'content',
      title: 'Roteiro de Episódio de Podcast',
      description: 'Estrutura de podcast envolvente',
      template: `Crie roteiro para episódio de podcast:

Título do episódio: {title}
Formato: {format}
Duração: {duration} minutos
Convidado (se houver): {guest}

**ESTRUTURA:**

**[0:00-2:00] INTRODUÇÃO**
- Teaser do episódio (30 segundos mais interessantes)
- Vinheta
- Apresentação do host
- Apresentação do tema/convidado
- O que ouvintes vão aprender

**[2:00-{duration}-10:00] CONTEÚDO PRINCIPAL**

Dividir em 3-4 blocos com temas específicos:
- Perguntas-chave para cada bloco
- Storytelling moments
- Momentos de transição
- Pausas para patrocinador (se aplicável)

**[Últimos 10 min] FECHAMENTO**
- Pergunta rápida/favorita
- Recap dos melhores insights
- Onde encontrar convidado/recursos
- Próximo episódio
- CTA (review, compartilhar)

Extras:
- 10 perguntas preparadas
- 3-5 curiosidades sobre o tema
- Timestamps para show notes
- Quote cards (3 frases para redes sociais)`,
      variables: [
        {
          name: 'title',
          label: 'Título do episódio',
          placeholder: 'Ex: Como criar apps sem código',
          type: 'text',
          required: true
        },
        {
          name: 'format',
          label: 'Formato',
          placeholder: 'Solo, entrevista, painel',
          type: 'select',
          options: ['Solo', 'Entrevista', 'Co-hosting', 'Painel'],
          required: true
        },
        {
          name: 'duration',
          label: 'Duração (minutos)',
          placeholder: 'Ex: 45',
          type: 'select',
          options: ['20', '30', '45', '60', '90'],
          required: true
        },
        {
          name: 'guest',
          label: 'Convidado',
          placeholder: 'Nome e expertise',
          type: 'text',
          required: false
        }
      ],
      examples: [],
      tags: ['podcast', 'áudio', 'entrevista', 'roteiro'],
      difficulty: 'intermediate',
      isPremium: false,
      usageCount: 876
    }
  ]
};
