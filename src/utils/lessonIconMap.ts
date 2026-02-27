import {
  Brain, Bot, MessageSquare, Video, Image, Table2, DollarSign,
  ShoppingCart, Briefcase, Code, Shield, Gem, Target, Zap,
  FileText, Share2, BookOpen, Lightbulb, Smartphone, Mic,
  PenTool, Wand2, Users, Globe, Search, BarChart3,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface KeywordMapping {
  keywords: string[];
  icon: LucideIcon;
}

const KEYWORD_MAP: KeywordMapping[] = [
  { keywords: ['prompt', 'comando'], icon: MessageSquare },
  { keywords: ['ia', 'inteligência artificial', 'inteligencia'], icon: Bot },
  { keywords: ['fundamento', 'básico', 'basico', 'base', 'introdução', 'introducao'], icon: Brain },
  { keywords: ['vídeo', 'video'], icon: Video },
  { keywords: ['imagem', 'foto', 'visual'], icon: Image },
  { keywords: ['planilha', 'organiza', 'tabela', 'excel'], icon: Table2 },
  { keywords: ['renda', 'dinheiro', 'monetiz', 'ganhar', 'faturar', 'lucro'], icon: DollarSign },
  { keywords: ['venda', 'cliente', 'vendas'], icon: ShoppingCart },
  { keywords: ['negócio', 'negocio', 'empresa', 'empreend'], icon: Briefcase },
  { keywords: ['código', 'codigo', 'app', 'programa', 'desenvolv', 'vibe code'], icon: Code },
  { keywords: ['copyright', 'direito', 'legal', 'proteção'], icon: Shield },
  { keywords: ['avançado', 'avancado', 'expert', 'maestria'], icon: Gem },
  { keywords: ['plano', 'estratégia', 'estrategia', 'planej'], icon: Target },
  { keywords: ['automação', 'automacao', 'automat'], icon: Zap },
  { keywords: ['conteúdo', 'conteudo', 'texto', 'post', 'blog', 'artigo'], icon: FileText },
  { keywords: ['rede social', 'instagram', 'tiktok', 'youtube', 'social'], icon: Share2 },
  { keywords: ['criativ', 'criar', 'criação', 'design'], icon: PenTool },
  { keywords: ['ideia', 'inspiração', 'insight'], icon: Lightbulb },
  { keywords: ['celular', 'mobile', 'bolso', 'dia a dia'], icon: Smartphone },
  { keywords: ['áudio', 'audio', 'voz', 'podcast', 'narração'], icon: Mic },
  { keywords: ['mágica', 'magica', 'truque', 'segredo'], icon: Wand2 },
  { keywords: ['equipe', 'time', 'colabora', 'pessoas'], icon: Users },
  { keywords: ['internet', 'web', 'online', 'digital'], icon: Globe },
  { keywords: ['pesquisa', 'busca', 'encontr'], icon: Search },
  { keywords: ['dados', 'métrica', 'metrica', 'análise', 'analise', 'resultado'], icon: BarChart3 },
  { keywords: ['aprend', 'cérebro', 'cerebro', 'neural', 'máquina', 'maquina'], icon: Brain },
];

/**
 * Returns a Lucide icon component based on the lesson title keywords.
 * Falls back to BookOpen if no keyword matches.
 */
export function getLessonIcon(title: string): LucideIcon {
  const lower = title.toLowerCase();
  for (const { keywords, icon } of KEYWORD_MAP) {
    if (keywords.some(kw => lower.includes(kw))) {
      return icon;
    }
  }
  return BookOpen;
}
