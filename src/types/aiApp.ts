/**
 * TIPOS PARA AI DIRECTORY
 *
 * Biblioteca de 300+ ferramentas IA
 */

export type AICategory =
  | 'text'           // ChatGPT, Claude, Jasper
  | 'image'          // Midjourney, DALL-E, Stable Diffusion
  | 'video'          // Sora, Runway, Pika
  | 'audio'          // ElevenLabs, Descript
  | 'code'           // GitHub Copilot, Cursor
  | 'research'       // Perplexity, Phind
  | 'productivity'   // Notion AI, Gamma
  | 'automation'     // Zapier, Make
  | 'marketing'      // Jasper, Copy.ai
  | 'sales'          // Gong, Apollo
  | 'customer-service' // Intercom, Zendesk AI
  | 'data'           // Tableau AI, DataRobot
  | 'education'      // Duolingo, Khan Academy
  | 'healthcare'     // Ada Health, Babylon
  | 'legal'          // Harvey, CaseText
  | 'finance'        // Bloomberg GPT, AlphaSense
  | 'hr'             // HireVue, Pymetrics
  | 'agents';        // AI Agents autônomos

export type PricingModel =
  | 'free'
  | 'freemium'
  | 'paid';

export interface AIApp {
  id: string;
  name: string;
  description: string;
  shortDescription: string;  // Para cards
  category: AICategory;
  logo: string;              // URL do logo
  url: string;               // Link oficial
  pricing: PricingModel;
  priceRange?: string;       // "$10-$20/mês"
  rating?: number;           // 0-5
  features: string[];        // Lista de features principais
  tags: string[];            // Tags para busca
  isNew?: boolean;
  isFeatured?: boolean;
  isHot?: boolean;           // Mais usadas/populares
  isPremium?: boolean;       // Pagas e super poderosas
}

export interface CategoryInfo {
  id: AICategory;
  name: string;
  description: string;
  icon: string;
  color: string;             // Tailwind class: bg-blue-500
}
