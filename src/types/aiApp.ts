/**
 * TIPOS PARA AI DIRECTORY
 *
 * Biblioteca de 30+ ferramentas IA
 */

export type AICategory =
  | 'text'          // ChatGPT, Claude, Jasper
  | 'image'         // Midjourney, DALL-E, Stable Diffusion
  | 'video'         // Sora, Runway, Pika
  | 'audio'         // ElevenLabs, Descript
  | 'code'          // GitHub Copilot, Cursor
  | 'research'      // Perplexity, Phind
  | 'productivity'; // Notion AI, Gamma

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
}

export interface CategoryInfo {
  id: AICategory;
  name: string;
  description: string;
  icon: string;
  color: string;             // Tailwind class: bg-blue-500
}
