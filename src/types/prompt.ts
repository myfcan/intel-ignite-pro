/**
 * TIPOS PARA PROMPT LIBRARY
 *
 * Biblioteca de prompts estilo Coursiv
 */

export interface PromptCategory {
  id: string;
  name: string;
  description: string;
  icon: string;              // Lucide icon name
  color: string;             // Tailwind class
  prompts: Prompt[];
  isPopular?: boolean;
}

export interface Prompt {
  id: string;
  categoryId: string;
  title: string;
  description: string;
  template: string;          // Template do prompt com {variables}
  variables: PromptVariable[]; // Variáveis que o usuário pode customizar
  examples: PromptExample[];
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  isPremium: boolean;        // Para paywall futuro
  isFeatured?: boolean;
  usageCount?: number;       // Quantas vezes foi usado
}

export interface PromptVariable {
  name: string;              // Nome da variável: "recipient"
  label: string;             // Label no UI: "Nome do destinatário"
  placeholder: string;       // Placeholder: "Ex: João Silva"
  type: 'text' | 'textarea' | 'select';
  options?: string[];        // Para type="select"
  required: boolean;
}

export interface PromptExample {
  title: string;
  input: Record<string, string>;  // Valores das variáveis
  output: string;                 // Resultado do prompt
}

export interface PromptUsage {
  promptId: string;
  userId: string;
  timestamp: Date;
  variables: Record<string, string>;
}
