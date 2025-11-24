import { PromptCategory } from '../../types/prompt';

export const blogPromptsCategory: PromptCategory = {
  id: 'blog',
  name: 'Escrita de Blog',
  description: 'Prompts para criar artigos otimizados, títulos chamativos e conteúdo viral',
  icon: 'PenTool',
  color: 'bg-purple-500',
  isPopular: true,
  prompts: [
    {
      id: 'blog-article-complete',
      categoryId: 'blog',
      title: 'Artigo de Blog Completo',
      description: 'Gere artigo completo otimizado para SEO e leitura',
      template: `Escreva um artigo de blog completo sobre:

Tema: {topic}
Público-alvo: {audience}
Objetivo: {goal}
Tom: {tone}
Tamanho: {word_count} palavras

Estrutura:
1. **Título**: Chamativo, incluindo palavra-chave principal
2. **Introdução** (10% do texto):
   - Hook que prende atenção
   - Problema ou pergunta
   - Promessa do que o leitor aprenderá

3. **Corpo** (80% do texto):
   - Use H2 e H3 para organizar
   - Parágrafos curtos (3-4 linhas)
   - Exemplos práticos
   - Bullet points quando possível
   - Dados e estatísticas (se relevante)

4. **Conclusão** (10% do texto):
   - Resumo dos pontos principais
   - Call-to-action claro

5. **Meta Description** (máximo 155 caracteres)

Otimizações SEO:
- Palavra-chave no título, primeiro parágrafo e conclusão
- Subtítulos descritivos
- Links internos (sugerir onde adicionar)
- Imagens sugeridas (descrever)`,
      variables: [
        {
          name: 'topic',
          label: 'Tema do artigo',
          placeholder: 'Ex: Como usar ChatGPT para produtividade',
          type: 'text',
          required: true
        },
        {
          name: 'audience',
          label: 'Público-alvo',
          placeholder: 'Ex: Profissionais de marketing iniciantes',
          type: 'text',
          required: true
        },
        {
          name: 'goal',
          label: 'Objetivo do artigo',
          placeholder: 'Ex: Educar, vender produto, gerar leads',
          type: 'select',
          options: ['Educar', 'Vender', 'Gerar leads', 'Engajar', 'Ranquear no Google'],
          required: true
        },
        {
          name: 'tone',
          label: 'Tom de voz',
          placeholder: 'Ex: Didático, casual, técnico',
          type: 'select',
          options: ['Didático', 'Casual', 'Técnico', 'Inspiracional', 'Profissional'],
          required: true
        },
        {
          name: 'word_count',
          label: 'Número de palavras',
          placeholder: 'Ex: 1500',
          type: 'select',
          options: ['800', '1200', '1500', '2000', '2500'],
          required: true
        }
      ],
      examples: [],
      tags: ['artigo', 'seo', 'conteúdo', 'completo'],
      difficulty: 'intermediate',
      isPremium: false,
      isFeatured: true,
      usageCount: 2341
    },
    {
      id: 'blog-headlines',
      categoryId: 'blog',
      title: 'Gerador de Títulos Virais',
      description: 'Crie 20 títulos irresistíveis para seu artigo',
      template: `Gere 20 títulos de blog sobre o tema "{topic}" para o público "{audience}".

Para cada título, use uma das fórmulas comprovadas:

**Fórmulas:**
1. Número + Adjetivo + Palavra-chave + Promessa
   Ex: "7 Estratégias Poderosas de SEO que Triplicaram meu Tráfego"

2. Como + Ação + Benefício Específico
   Ex: "Como Escrever E-mails que Geram 45% Mais Respostas"

3. [Ano] + Guia + Para + Resultado
   Ex: "Guia 2025 Para Dominar ChatGPT em 30 Dias"

4. Pergunta Intrigante
   Ex: "Por Que 90% dos Blogs Falham nos Primeiros 6 Meses?"

5. Segredo/Verdade + Que + Autoridade + Não Quer que Você Saiba
   Ex: "O Segredo que Agências de Marketing Escondem de Você"

Requisitos:
- Máximo 60 caracteres
- Incluir palavra-chave: {keyword}
- Criar curiosidade SEM clickbait
- Específico e mensurável quando possível
- Variar as fórmulas`,
      variables: [
        {
          name: 'topic',
          label: 'Tema do artigo',
          placeholder: 'Ex: Produtividade com IA',
          type: 'text',
          required: true
        },
        {
          name: 'audience',
          label: 'Público-alvo',
          placeholder: 'Ex: Empreendedores digitais',
          type: 'text',
          required: true
        },
        {
          name: 'keyword',
          label: 'Palavra-chave principal',
          placeholder: 'Ex: ChatGPT',
          type: 'text',
          required: true
        }
      ],
      examples: [
        {
          title: 'Títulos sobre IA',
          input: {
            topic: 'Usar IA para criar conteúdo',
            audience: 'Criadores de conteúdo',
            keyword: 'IA generativa'
          },
          output: `1. 7 Ferramentas de IA Generativa que Economizaram 20h/Semana
2. Como Criar Conteúdo com IA Sem Perder sua Autenticidade
3. Guia 2025: IA Generativa Para Criadores de Conteúdo
4. Por Que 80% dos Criadores Usam IA Generativa Errado?
5. IA Generativa: De Iniciante a Expert em 14 Dias
...`
        }
      ],
      tags: ['título', 'headline', 'viral', 'ctr'],
      difficulty: 'beginner',
      isPremium: false,
      isFeatured: true,
      usageCount: 3102
    },
    {
      id: 'blog-listicle',
      categoryId: 'blog',
      title: 'Artigo Estilo Listicle',
      description: 'Artigos em formato de lista que performam bem',
      template: `Crie um artigo listicle completo:

Título: {number} {topic_type} para {goal}
Exemplo: "10 Ferramentas IA para Dobrar sua Produtividade"

Estrutura de cada item:
1. **Nome/Título do item**
2. Descrição breve (2-3 frases)
3. Por que é útil
4. Como usar (passo a passo curto)
5. Dica pro

Tema: {topic}
Número de itens: {number}
Público: {audience}

Adicione:
- Introdução explicando por que essa lista é valiosa
- Conclusão com item bônus
- CTA no final`,
      variables: [
        {
          name: 'topic',
          label: 'Tema da lista',
          placeholder: 'Ex: Apps de produtividade',
          type: 'text',
          required: true
        },
        {
          name: 'number',
          label: 'Número de itens',
          placeholder: 'Ex: 10',
          type: 'select',
          options: ['5', '7', '10', '15', '20'],
          required: true
        },
        {
          name: 'topic_type',
          label: 'Tipo de item',
          placeholder: 'Ex: Ferramentas, Estratégias, Dicas',
          type: 'text',
          required: true
        },
        {
          name: 'goal',
          label: 'Objetivo/Benefício',
          placeholder: 'Ex: Aumentar produtividade',
          type: 'text',
          required: true
        },
        {
          name: 'audience',
          label: 'Público-alvo',
          placeholder: 'Ex: Desenvolvedores',
          type: 'text',
          required: true
        }
      ],
      examples: [],
      tags: ['listicle', 'lista', 'viral', 'fácil'],
      difficulty: 'beginner',
      isPremium: false,
      usageCount: 1876
    },
    {
      id: 'blog-case-study',
      categoryId: 'blog',
      title: 'Estudo de Caso Detalhado',
      description: 'Conte uma história de sucesso (ou fracasso) com dados',
      template: `Escreva um estudo de caso sobre:

Contexto: {context}
Problema inicial: {problem}
Solução implementada: {solution}
Resultados: {results}

Estrutura:
1. **Título**: Resultado mensurável + como foi alcançado
   Ex: "Como Aumentamos o Tráfego em 340% em 90 Dias"

2. **Overview** (resumo executivo em bullet points)

3. **Contexto e Background**
   - Quem: Empresa/pessoa
   - O que: Situação inicial
   - Quando: Timeline

4. **O Desafio**
   - Problema específico
   - Por que era difícil
   - O que estava em jogo

5. **A Solução**
   - Estratégia escolhida
   - Por que escolhemos essa abordagem
   - Implementação passo a passo

6. **Resultados**
   - Números específicos (antes vs depois)
   - Gráficos e tabelas (descrever)
   - Impacto no negócio

7. **Aprendizados**
   - O que funcionou
   - O que não funcionou
   - Recomendações

8. **Conclusão + CTA**

Tom: Honesto, baseado em dados, storytelling`,
      variables: [
        {
          name: 'context',
          label: 'Contexto/Empresa',
          placeholder: 'Ex: Startup SaaS B2B com 50 clientes',
          type: 'textarea',
          required: true
        },
        {
          name: 'problem',
          label: 'Problema inicial',
          placeholder: 'Ex: Tráfego estagnado há 6 meses',
          type: 'textarea',
          required: true
        },
        {
          name: 'solution',
          label: 'Solução implementada',
          placeholder: 'Ex: Estratégia de SEO + conteúdo',
          type: 'textarea',
          required: true
        },
        {
          name: 'results',
          label: 'Resultados obtidos',
          placeholder: 'Ex: +340% tráfego, +120% leads',
          type: 'textarea',
          required: true
        }
      ],
      examples: [],
      tags: ['case-study', 'resultados', 'dados', 'storytelling'],
      difficulty: 'advanced',
      isPremium: true,
      usageCount: 743
    }
  ]
};
