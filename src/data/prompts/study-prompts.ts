import { PromptCategory } from '../../types/prompt';

export const studyPromptsCategory: PromptCategory = {
  id: 'study',
  name: 'Study Buddy',
  description: 'Prompts para aprender, revisar e fixar conteúdo com eficiência',
  icon: 'BookOpen',
  color: 'bg-green-500',
  prompts: [
    {
      id: 'study-explain-concept',
      categoryId: 'study',
      title: 'Explicar Conceito Complexo',
      description: 'Entenda qualquer assunto em linguagem simples',
      template: `Explique o conceito "{concept}" como se você fosse um professor didático.

Contexto: {context}
Nível do aluno: {level}
Analogia preferida: {analogy_type}

Estrutura:
1. **Definição em 1 frase simples**
2. **Por que é importante** (aplicação prática)
3. **Como funciona** (passo a passo ou processo)
4. **Analogia do dia a dia** para facilitar entendimento
5. **Exemplo concreto** de uso
6. **Erros comuns** que estudantes cometem
7. **Como praticar/aplicar**

Regras:
- Evite jargões técnicos (ou explique quando usar)
- Use analogias que {level} entenderia
- Parágrafos curtos
- Destaque termos importantes
- Adicione emojis para facilitar leitura (opcional)`,
      variables: [
        {
          name: 'concept',
          label: 'Conceito a ser explicado',
          placeholder: 'Ex: Machine Learning',
          type: 'text',
          required: true
        },
        {
          name: 'context',
          label: 'Contexto/Área',
          placeholder: 'Ex: Ciência da Computação',
          type: 'text',
          required: true
        },
        {
          name: 'level',
          label: 'Nível do aluno',
          placeholder: 'Ex: Iniciante total',
          type: 'select',
          options: ['Criança de 10 anos', 'Iniciante total', 'Intermediário', 'Avançado'],
          required: true
        },
        {
          name: 'analogy_type',
          label: 'Tipo de analogia',
          placeholder: 'Ex: Culinária, esportes, cotidiano',
          type: 'text',
          required: false
        }
      ],
      examples: [],
      tags: ['explicação', 'aprendizado', 'didático', 'conceito'],
      difficulty: 'beginner',
      isPremium: false,
      isFeatured: true,
      usageCount: 3421
    },
    {
      id: 'study-flashcards',
      categoryId: 'study',
      title: 'Gerador de Flashcards',
      description: 'Crie flashcards Anki-style para memorização',
      template: `Crie {quantity} flashcards sobre o tema: {topic}

Formato para cada flashcard:
**Frente (Pergunta):**
- Pergunta específica
- Pode ser: definição, aplicação, exemplo, comparação

**Verso (Resposta):**
- Resposta concisa (máximo 50 palavras)
- Informação essencial apenas
- Mnemônicos se aplicável

Tipos de flashcards a incluir:
1. Definição básica
2. Aplicação prática
3. Diferença entre conceitos similares
4. Exemplos
5. Fórmulas/processos

Conteúdo base: {content}

Regras:
- Cada card deve testar UMA informação
- Perguntas claras e não ambíguas
- Respostas objetivas
- Use active recall (não apenas "o que é X?")`,
      variables: [
        {
          name: 'topic',
          label: 'Tema de estudo',
          placeholder: 'Ex: Verbos irregulares em inglês',
          type: 'text',
          required: true
        },
        {
          name: 'content',
          label: 'Conteúdo base',
          placeholder: 'Cole o texto/aula que você quer transformar em flashcards',
          type: 'textarea',
          required: true
        },
        {
          name: 'quantity',
          label: 'Quantidade de flashcards',
          placeholder: 'Ex: 20',
          type: 'select',
          options: ['10', '20', '30', '50'],
          required: true
        }
      ],
      examples: [],
      tags: ['flashcards', 'memorização', 'anki', 'revisão'],
      difficulty: 'beginner',
      isPremium: false,
      usageCount: 2187
    },
    {
      id: 'study-practice-questions',
      categoryId: 'study',
      title: 'Questões de Prática',
      description: 'Gere questões de múltipla escolha ou dissertativas',
      template: `Crie {quantity} questões de prática sobre: {topic}

Tipo de questão: {question_type}
Dificuldade: {difficulty}
Contexto: {context}

Para questões de **múltipla escolha**:
- Enunciado claro
- 4 alternativas (A, B, C, D)
- Apenas 1 correta
- Distratores plausíveis
- Explicação da resposta correta

Para questões **dissertativas**:
- Pergunta aberta que exige raciocínio
- Resposta modelo (150-200 palavras)
- Critérios de avaliação

Distribuição de dificuldade:
- {difficulty} = Fácil: 40% | Média: 40% | Difícil: 20%

Cobrir:
- Conceitos fundamentais
- Aplicações práticas
- Análise crítica
- Resolução de problemas`,
      variables: [
        {
          name: 'topic',
          label: 'Tema',
          placeholder: 'Ex: Revolução Francesa',
          type: 'text',
          required: true
        },
        {
          name: 'quantity',
          label: 'Quantidade',
          placeholder: 'Ex: 15',
          type: 'select',
          options: ['5', '10', '15', '20', '30'],
          required: true
        },
        {
          name: 'question_type',
          label: 'Tipo de questão',
          placeholder: 'Múltipla escolha ou dissertativa',
          type: 'select',
          options: ['Múltipla escolha', 'Dissertativa', 'Mista'],
          required: true
        },
        {
          name: 'difficulty',
          label: 'Nível de dificuldade',
          placeholder: 'Fácil, Média ou Difícil',
          type: 'select',
          options: ['Fácil', 'Média', 'Difícil', 'Mista'],
          required: true
        },
        {
          name: 'context',
          label: 'Contexto/Objetivo',
          placeholder: 'Ex: Preparação para ENEM',
          type: 'text',
          required: false
        }
      ],
      examples: [],
      tags: ['questões', 'prática', 'exercícios', 'prova'],
      difficulty: 'intermediate',
      isPremium: true,
      usageCount: 1654
    }
  ]
};
