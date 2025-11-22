import { chatgptGuide } from './chatgpt-guide';
import { claudeGuide } from './claude-guide';
import { geminiGuide } from './gemini-guide';
import { grokGuide } from './grok-guide';
import { soraGuide } from './sora-guide';
import { midjourneyGuide } from './midjourney-guide';
import { perplexityGuide } from './perplexity-guide';
import { Guide, GuideV5Data } from '../../types/guide';

// Export all guide data
export const allGuidesData: GuideV5Data[] = [
  chatgptGuide,
  claudeGuide,
  geminiGuide,
  grokGuide,
  soraGuide,
  midjourneyGuide,
  perplexityGuide
];

// Export metadata for guides list page
export const guidesMetadata: Guide[] = [
  {
    id: 'chatgpt-essentials',
    aiName: 'ChatGPT',
    title: 'ChatGPT Essencial',
    description: 'Domine o ChatGPT: da criação de conta até prompts avançados',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg',
    category: 'text',
    difficulty: 'beginner',
    estimatedTime: '7 min',
    sections: 6,
    isNew: true
  },
  {
    id: 'claude-essentials',
    aiName: 'Claude',
    title: 'Claude Essencial',
    description: 'A IA focada em conversas longas e análise de documentos',
    logo: 'https://www.anthropic.com/images/icons/claude-avatar.svg',
    category: 'text',
    difficulty: 'beginner',
    estimatedTime: '6 min',
    sections: 5,
    isNew: true
  },
  {
    id: 'gemini-essentials',
    aiName: 'Gemini',
    title: 'Google Gemini Essencial',
    description: 'A IA integrada ao ecossistema Google completo',
    logo: 'https://www.gstatic.com/lamda/images/gemini_sparkle_v002_d4735304ff6292a690345.svg',
    category: 'text',
    difficulty: 'beginner',
    estimatedTime: '6 min',
    sections: 5,
    isNew: true
  },
  {
    id: 'grok-essentials',
    aiName: 'Grok',
    title: 'Grok Essencial',
    description: 'A IA rebelde do Elon Musk com acesso ao X em tempo real',
    logo: 'https://grok.x.ai/assets/grok-logo.svg',
    category: 'text',
    difficulty: 'beginner',
    estimatedTime: '5 min',
    sections: 5
  },
  {
    id: 'sora-essentials',
    aiName: 'Sora',
    title: 'Sora Essencial',
    description: 'Crie vídeos incríveis com o gerador de vídeo da OpenAI',
    logo: 'https://cdn.openai.com/sora/images/sora-logo.svg',
    category: 'video',
    difficulty: 'intermediate',
    estimatedTime: '6 min',
    sections: 5
  },
  {
    id: 'midjourney-essentials',
    aiName: 'Midjourney',
    title: 'Midjourney Essencial',
    description: 'O melhor gerador de imagens IA para arte conceitual',
    logo: 'https://www.midjourney.com/apple-touch-icon.png',
    category: 'image',
    difficulty: 'intermediate',
    estimatedTime: '7 min',
    sections: 6
  },
  {
    id: 'perplexity-essentials',
    aiName: 'Perplexity',
    title: 'Perplexity Essencial',
    description: 'A IA de busca com fontes verificadas em tempo real',
    logo: 'https://www.perplexity.ai/favicon.svg',
    category: 'research',
    difficulty: 'beginner',
    estimatedTime: '5 min',
    sections: 5
  }
];

// Helper function to get guide data by ID
export const getGuideById = (id: string): GuideV5Data | undefined => {
  return allGuidesData.find(guide => guide.id === id);
};

// Helper function to get guides by category
export const getGuidesByCategory = (category: string): GuideV5Data[] => {
  return allGuidesData.filter(guide => guide.category === category);
};
