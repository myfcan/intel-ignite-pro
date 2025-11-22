import { PromptCategory } from '../../types/prompt';

export const socialPromptsCategory: PromptCategory = {
  id: 'social',
  name: 'Social Media',
  description: 'Prompts para criar posts virais, captions e conteúdo para redes sociais',
  icon: 'Share2',
  color: 'bg-cyan-500',
  isPopular: true,
  prompts: [
    {
      id: 'social-viral-hooks',
      categoryId: 'social',
      title: 'Hooks Virais para Reels/TikTok',
      description: 'Primeiras frases que param o scroll',
      template: `Crie 20 hooks virais sobre: {topic}

Plataforma: {platform}
Nicho: {niche}
Público: {audience}

**Fórmulas de hook comprovadas:**

1. **Controvérsia/Hot take**
   "Vou ser cancelado por isso mas..."
   "Unpopular opinion: ..."

2. **Problema urgente**
   "Se você {problema}, pare tudo..."
   "Você está fazendo {X} errado..."

3. **Curiosidade/Segredo**
   "Ninguém te conta isso sobre {tema}..."
   "O que descobri depois de {experiência}..."

4. **Transformação**
   "Como fui de {antes} para {depois}..."
   "Isso mudou completamente meu {área}..."

5. **Lista/Número**
   "3 coisas que {resultado} não quer que você saiba..."
   "5 sinais de que {situação}..."

6. **POV/Relatable**
   "POV: Você {situação comum}..."
   "Tell me you're {X} without telling me..."

7. **Urgência/FOMO**
   "Você tem 24h para fazer isso..."
   "Antes que deletem esse vídeo..."

**Requisitos:**
- Máximo 10 palavras por hook
- Gerar curiosidade imediata
- Específico para {niche}
- Apropriado para {platform}`,
      variables: [
        {
          name: 'topic',
          label: 'Tema do conteúdo',
          placeholder: 'Ex: Produtividade com IA',
          type: 'text',
          required: true
        },
        {
          name: 'platform',
          label: 'Plataforma',
          placeholder: 'Instagram, TikTok, YouTube Shorts',
          type: 'select',
          options: ['Instagram Reels', 'TikTok', 'YouTube Shorts', 'LinkedIn'],
          required: true
        },
        {
          name: 'niche',
          label: 'Nicho',
          placeholder: 'Ex: Tecnologia, fitness, finanças',
          type: 'text',
          required: true
        },
        {
          name: 'audience',
          label: 'Público-alvo',
          placeholder: 'Ex: Jovens 18-25 anos',
          type: 'text',
          required: true
        }
      ],
      examples: [],
      tags: ['hooks', 'viral', 'reels', 'tiktok'],
      difficulty: 'intermediate',
      isPremium: false,
      isFeatured: true,
      usageCount: 4532
    },
    {
      id: 'social-carousel-linkedin',
      categoryId: 'social',
      title: 'Carrossel LinkedIn',
      description: 'Estrutura de post carrossel educativo',
      template: `Crie carrossel de {slides} slides para LinkedIn sobre: {topic}

Objetivo: {goal}
CTA: {cta}

**ESTRUTURA:**

**Slide 1 - CAPA**
- Título chamativo
- Subtítulo
- Visual sugerido
- Máximo 10 palavras total

**Slides 2-{slides-1} - CONTEÚDO**
Para cada slide:
- 1 ideia por slide
- Título curto
- 2-3 bullet points OU 1 parágrafo curto
- Visual/ícone sugerido

**Slide {slides} - CTA**
- Recapitulação (2-3 palavras)
- Call-to-action claro
- Engajamento (comentário, salvar, compartilhar)

**CAPTION (máximo 3000 caracteres):**
- Hook (primeira linha)
- Contexto/introdução
- Promise do carrossel
- CTA para swipe
- Hashtags estratégicos (5-7)

**Design:**
- Paleta de cores sugerida
- Fonte recomendada
- Layout consistente

Tom: Profissional mas acessível, educativo`,
      variables: [
        {
          name: 'topic',
          label: 'Tema do carrossel',
          placeholder: 'Ex: 7 erros em entrevistas de emprego',
          type: 'text',
          required: true
        },
        {
          name: 'slides',
          label: 'Número de slides',
          placeholder: 'Ex: 8',
          type: 'select',
          options: ['6', '8', '10', '12'],
          required: true
        },
        {
          name: 'goal',
          label: 'Objetivo',
          placeholder: 'Ex: Educar, gerar leads, aumentar autoridade',
          type: 'select',
          options: ['Educar', 'Gerar leads', 'Autoridade', 'Engajamento'],
          required: true
        },
        {
          name: 'cta',
          label: 'Call-to-action',
          placeholder: 'Ex: Baixar e-book, agendar call, comentar',
          type: 'text',
          required: true
        }
      ],
      examples: [],
      tags: ['linkedin', 'carrossel', 'educativo', 'profissional'],
      difficulty: 'intermediate',
      isPremium: true,
      usageCount: 2187
    },
    {
      id: 'social-instagram-caption',
      categoryId: 'social',
      title: 'Caption Instagram Engajadora',
      description: 'Legendas que geram conversas e salvamentos',
      template: `Crie caption de Instagram para:

Tipo de post: {post_type}
Tema: {topic}
Objetivo: {goal}
Tom: {tone}

**ESTRUTURA DA CAPTION:**

**Linha 1 (Hook - visível sem "ver mais")**
- Frase que para o scroll
- Máximo 125 caracteres
- Despertar curiosidade/emoção

**Corpo (após "ver mais")**
- Storytelling OU lista OU dica prática
- Parágrafos curtos (2-3 linhas)
- Usar emojis estrategicamente
- Espaçamento para respiração

**Estruturas opcionais:**
1. **PAS (Problem-Agitate-Solve)**
2. **Storytelling pessoal**
3. **Lista numerada** (3-7 itens)
4. **Antes/Depois**

**CTA (Call-to-Action)**
- Pergunta para engajamento
- Direcionar para bio/link
- Pedir save/compartilhar

**Hashtags (10-15)**
- 5 grandes (100k-1M posts)
- 5 médias (10k-100k)
- 5 pequenas (menos de 10k)
- Relevantes para {topic}

**Extras:**
- Sugestão de localização
- Melhor horário para postar
- Tipo de conteúdo visual ideal`,
      variables: [
        {
          name: 'post_type',
          label: 'Tipo de post',
          placeholder: 'Foto, Carrossel, Reel',
          type: 'select',
          options: ['Foto única', 'Carrossel', 'Reel', 'Stories'],
          required: true
        },
        {
          name: 'topic',
          label: 'Tema',
          placeholder: 'Ex: Rotina matinal de sucesso',
          type: 'text',
          required: true
        },
        {
          name: 'goal',
          label: 'Objetivo',
          placeholder: 'Ex: Engajamento, vendas, autoridade',
          type: 'select',
          options: ['Engajamento', 'Vendas', 'Alcance', 'Autoridade', 'Comunidade'],
          required: true
        },
        {
          name: 'tone',
          label: 'Tom de voz',
          placeholder: 'Ex: Motivacional, educativo, casual',
          type: 'select',
          options: ['Motivacional', 'Educativo', 'Casual', 'Inspiracional', 'Humorístico'],
          required: true
        }
      ],
      examples: [],
      tags: ['instagram', 'caption', 'engajamento', 'hashtags'],
      difficulty: 'beginner',
      isPremium: false,
      isFeatured: true,
      usageCount: 3891
    }
  ]
};
