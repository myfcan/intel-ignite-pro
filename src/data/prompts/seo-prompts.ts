import { PromptCategory } from '../../types/prompt';

export const seoPromptsCategory: PromptCategory = {
  id: 'seo',
  name: 'SEO Optimization',
  description: 'Prompts para otimizar conteúdo e ranquear no Google',
  icon: 'TrendingUp',
  color: 'bg-yellow-500',
  prompts: [
    {
      id: 'seo-keyword-research',
      categoryId: 'seo',
      title: 'Pesquisa de Palavras-Chave',
      description: 'Encontre oportunidades de SEO',
      template: `Faça pesquisa de palavras-chave para:

Nicho: {niche}
Tema principal: {main_topic}
Tipo de conteúdo: {content_type}
Autoridade do domínio: {domain_authority}

**ANÁLISE:**

1. **Palavra-chave principal**
   - Melhor keyword principal
   - Volume de busca estimado
   - Dificuldade (1-100)
   - Intenção de busca (informacional/transacional/navegacional)

2. **Variações long-tail (10-15 keywords)**
   Para cada:
   - Keyword completa
   - Volume estimado
   - Dificuldade
   - Oportunidade (baixa competição, bom volume)

3. **Perguntas relacionadas (People Also Ask)**
   - 10 perguntas que pessoas fazem
   - Formato ideal de resposta

4. **Palavras-chave LSI (semanticamente relacionadas)**
   - 15-20 termos relacionados para incluir no conteúdo

5. **Análise de concorrência**
   - Tipo de conteúdo que rankeia (guia, lista, vídeo)
   - Tamanho médio (word count)
   - Gaps de conteúdo (o que falta nos concorrentes)

6. **Estratégia de conteúdo**
   - Melhor formato (artigo, vídeo, infográfico)
   - Tamanho recomendado
   - Elementos necessários (tabelas, imagens, vídeos)

7. **Quick wins**
   - 3 keywords com maior chance de ranquear rápido
   - Por que são oportunidades`,
      variables: [
        {
          name: 'niche',
          label: 'Nicho/Indústria',
          placeholder: 'Ex: Marketing digital, saúde, tecnologia',
          type: 'text',
          required: true
        },
        {
          name: 'main_topic',
          label: 'Tema principal',
          placeholder: 'Ex: Como usar ChatGPT para SEO',
          type: 'text',
          required: true
        },
        {
          name: 'content_type',
          label: 'Tipo de conteúdo',
          placeholder: 'Blog post, página de produto, guia',
          type: 'select',
          options: ['Blog post', 'Página de produto', 'Guia completo', 'Listicle', 'Review'],
          required: true
        },
        {
          name: 'domain_authority',
          label: 'Autoridade do domínio',
          placeholder: 'Novo, Médio, Alto',
          type: 'select',
          options: ['Novo (DA 0-20)', 'Médio (DA 21-50)', 'Alto (DA 51+)'],
          required: true
        }
      ],
      examples: [],
      tags: ['seo', 'keywords', 'pesquisa', 'google'],
      difficulty: 'advanced',
      isPremium: true,
      isFeatured: true,
      usageCount: 2987
    },
    {
      id: 'seo-meta-tags',
      categoryId: 'seo',
      title: 'Meta Tags Otimizadas',
      description: 'Title tags e meta descriptions com alto CTR',
      template: `Crie meta tags otimizadas para:

URL: {url}
Palavra-chave principal: {primary_keyword}
Conteúdo resumido: {content_summary}

**TITLE TAG (5 variações)**

Requisitos:
- Máximo 60 caracteres
- Incluir {primary_keyword}
- Incluir ano atual (2025) se relevante
- Números quando possível
- Criar urgência/curiosidade

Fórmulas:
1. Número + Keyword + Benefício
2. Como + Ação + Keyword + Ano
3. Keyword + Guia/Tutorial + Modificador
4. Problema + Solução (Keyword)
5. Comparação + Keyword

**META DESCRIPTION (5 variações)**

Requisitos:
- 150-160 caracteres
- Incluir {primary_keyword}
- Call-to-action claro
- Benefício específico
- Gerar curiosidade

Elementos a incluir:
- O que o usuário vai aprender/ganhar
- Por que clicar agora
- Prova social (opcional): "10mil+ usuários"

**URL SLUG**
- Versão otimizada da URL
- Máximo 5 palavras
- Apenas lowercase e hífens

**H1 (3 opções)**
- Pode ser diferente do title tag
- Mais focado em UX que SEO
- Engajar usuário que já clicou

**Análise de CTR esperado:**
Para cada combinação de title + description, estime CTR e explique por quê.`,
      variables: [
        {
          name: 'url',
          label: 'URL da página',
          placeholder: 'Ex: /blog/chatgpt-para-iniciantes',
          type: 'text',
          required: true
        },
        {
          name: 'primary_keyword',
          label: 'Palavra-chave principal',
          placeholder: 'Ex: ChatGPT para iniciantes',
          type: 'text',
          required: true
        },
        {
          name: 'content_summary',
          label: 'Resumo do conteúdo',
          placeholder: 'Ex: Guia completo de como usar ChatGPT do zero',
          type: 'textarea',
          required: true
        }
      ],
      examples: [],
      tags: ['meta-tags', 'title', 'description', 'ctr'],
      difficulty: 'intermediate',
      isPremium: false,
      usageCount: 3214
    },
    {
      id: 'seo-content-outline',
      categoryId: 'seo',
      title: 'Outline SEO-Otimizado',
      description: 'Estrutura de artigo que rankeia',
      template: `Crie outline completo otimizado para SEO:

Palavra-chave alvo: {target_keyword}
Palavras-chave secundárias: {secondary_keywords}
Tamanho alvo: {word_count} palavras

**ESTRUTURA COMPLETA:**

**Elementos obrigatórios antes do outline:**
1. **Title tag** (60 caracteres)
2. **Meta description** (155 caracteres)
3. **URL slug**
4. **Featured snippet** sugerido (parágrafo de 40-60 palavras que responde direto a keyword)

**H1 (Título principal)**
- 1 opção otimizada

**Introdução (100-150 palavras)**
- Hook
- Problema/pergunta
- O que vão aprender (bullets)
- Keyword no primeiro parágrafo

**Sumário/Índice**
- Links internos para cada H2

**CORPO DO ARTIGO:**

**H2 [Seção 1]**
- Objetivo desta seção
- Keyword secundária a usar
- Número de parágrafos: X
- Elementos especiais: imagem, tabela, lista

  **H3 [Subseção 1.1]**
  - Pontos a cobrir

  **H3 [Subseção 1.2]**
  - Pontos a cobrir

**H2 [Seção 2]**
[repetir estrutura]

**H2 [FAQs]** (People Also Ask)
- 5-7 perguntas comuns
- Respostas de 50-80 palavras cada
- Formato de schema markup sugerido

**H2 [Conclusão]**
- Recap de pontos principais
- CTA claro
- Next steps

**ELEMENTOS ADICIONAIS:**

**Imagens/Mídia sugeridas:**
- 5-7 imagens necessárias
- Alt text para cada uma
- Infográfico sugerido (opcional)

**Links internos:**
- 3-5 oportunidades de link interno
- Anchor text sugerido

**Links externos:**
- 2-3 fontes autoritativas para citar

**Tabela de conteúdo:**
- Gerar automaticamente com plugin

**Schema markup recomendado:**
- Article schema
- FAQ schema (se aplicável)
- HowTo schema (se aplicável)

Tamanho alvo total: {word_count} palavras`,
      variables: [
        {
          name: 'target_keyword',
          label: 'Palavra-chave alvo',
          placeholder: 'Ex: como usar chatgpt',
          type: 'text',
          required: true
        },
        {
          name: 'secondary_keywords',
          label: 'Keywords secundárias',
          placeholder: 'Ex: chatgpt tutorial, chatgpt para iniciantes',
          type: 'textarea',
          required: true
        },
        {
          name: 'word_count',
          label: 'Tamanho alvo',
          placeholder: 'Ex: 2500',
          type: 'select',
          options: ['1000', '1500', '2000', '2500', '3000', '3500'],
          required: true
        }
      ],
      examples: [],
      tags: ['outline', 'estrutura', 'seo', 'artigo'],
      difficulty: 'advanced',
      isPremium: true,
      usageCount: 2543
    }
  ]
};
