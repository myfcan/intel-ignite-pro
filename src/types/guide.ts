/**
 * TIPOS PARA GUIAS V5 - IAs POPULARES
 *
 * Modelo V5 = V2 structure (múltiplos áudios) SEM exercícios
 * Usado para mini-cursos sobre ChatGPT, Claude, Gemini, etc.
 */

export interface GuideV5Data {
  id: string;
  title: string;
  description: string;
  aiName: string;           // ChatGPT, Claude, Gemini, etc
  aiLogo: string;           // URL do logo da IA
  category: string;         // text, image, video, research
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number;         // Duração total em segundos
  sections: GuideSectionV5[];
  tags: string[];
  // ✅ NÃO TEM exercisesConfig (diferença do V1-V4)
}

export interface GuideSectionV5 {
  id: string;
  title: string;
  visualContent: string;    // Markdown - conteúdo visual
  timestamp: number;        // Tempo de início da seção
  audio_url?: string;       // URL do áudio (estrutura V2)
  duration?: number;        // Duração específica desta seção
}

export interface Guide {
  id: string;
  aiName: string;
  title: string;
  description: string;
  logo: string;
  category: 'text' | 'image' | 'video' | 'audio' | 'research' | 'productivity';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;    // "5 min", "10 min"
  sections: number;         // Número de seções
  isNew?: boolean;
  isPremium?: boolean;
}
