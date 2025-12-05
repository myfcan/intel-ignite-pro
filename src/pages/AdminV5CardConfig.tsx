import { motion } from "framer-motion";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Plus, Trash2, Save, Wand2, Eye, Download, Book, Brain, Sparkles, Zap, Star, Rocket, Target, Lightbulb, Trophy, Heart, Crown, Flame, Send, CheckCircle2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DynamicExperienceCard } from '@/components/lessons/DynamicExperienceCard';
import { DynamicCardEffect, CARD_EFFECT_TYPES, CARD_EFFECT_LABELS, CARD_EFFECT_DESCRIPTIONS, CARD_EFFECTS_BY_LESSON, isValidCardEffectType, CardEffectType } from '@/components/lessons/card-effects';

// 🎓 Configuração das Aulas disponíveis
const AVAILABLE_LESSONS = [
  {
    id: 'aula-1',
    title: 'Aula 1 - O Furacão da I.A.',
    description: '12 card effects cinematográficos',
    icon: '🌪️'
  },
  {
    id: 'aula-2',
    title: 'Aula 2 - História da Maria',
    description: '14 card effects cinematográficos',
    icon: '👩‍💼'
  },
  {
    id: 'aula-3',
    title: 'Aula 3 - Oportunidades Reais com I.A.',
    description: '15 card effects cinematográficos',
    icon: '💰'
  },
  {
    id: 'aula-4',
    title: 'Aula 4 - O Dia em que a Padaria Mudou de Nível',
    description: '16 card effects cinematográficos',
    icon: '🥖'
  },
];

// 📋 Templates pré-configurados de Experience Cards por Aula
const LESSON_CARD_TEMPLATES: Record<string, ExperienceCard[]> = {
  'aula-1': [
    { sectionIndex: 1, cardIndex: 1, cardType: 'app-builder', anchorText: 'aplicativo funcional', title: 'Criador de Apps', subtitle: 'I.A. construindo aplicativos' },
    { sectionIndex: 1, cardIndex: 2, cardType: 'digital-employee', anchorText: 'funcionário digital', title: 'Funcionário Digital', subtitle: 'Assistente que nunca para' },
    { sectionIndex: 2, cardIndex: 1, cardType: 'business-design', anchorText: 'produtos reais', title: 'Design de Negócio', subtitle: 'Estruturando ideias em minutos' },
    { sectionIndex: 2, cardIndex: 2, cardType: 'content-creator', anchorText: 'e-books, manuais, treinamentos internos', title: 'Coautor de Conteúdo', subtitle: 'Livros e cursos com I.A.' },
    { sectionIndex: 3, cardIndex: 1, cardType: 'content-machine', anchorText: 'linha de produção de conteúdo', title: 'Máquina de Conteúdo', subtitle: 'Produção em escala' },
    { sectionIndex: 3, cardIndex: 2, cardType: 'video-studio', anchorText: 'I.A. criando um vídeo inteiro', title: 'Estúdio de Vídeo I.A.', subtitle: 'Vídeos profissionais automatizados' },
    { sectionIndex: 4, cardIndex: 1, cardType: 'automation', anchorText: 'fluxos e automações', title: 'Fluxos de Automação', subtitle: 'Processos inteligentes' },
    { sectionIndex: 4, cardIndex: 2, cardType: 'presence-amplifier', anchorText: 'versão melhorada de você', title: 'Amplificador de Presença', subtitle: 'Multiplique seu alcance' },
    { sectionIndex: 4, cardIndex: 3, cardType: 'playground-chat', anchorText: 'acessar o Playground', title: 'Playground I.A.', subtitle: 'Experimente agora' },
    { sectionIndex: 5, cardIndex: 1, cardType: 'strategic-advisor', anchorText: 'conselho estratégico de bolso', title: 'Conselho Estratégico', subtitle: 'Análise de cenários com I.A.' },
    { sectionIndex: 5, cardIndex: 2, cardType: 'new-professions', anchorText: 'cria novas profissões', title: 'Novas Profissões', subtitle: 'Carreiras do futuro' },
    { sectionIndex: 5, cardIndex: 3, cardType: 'closing-message', anchorText: 'em cima dessas novas possibilidades', title: 'Próximos Passos', subtitle: 'Sua jornada começa agora' },
  ],
  'aula-2': [
    { sectionIndex: 1, cardIndex: 1, cardType: 'profile-card', anchorText: 'dona de uma pequena loja', title: 'Perfil da Maria', subtitle: 'Conheça a protagonista' },
    { sectionIndex: 1, cardIndex: 2, cardType: 'problem-identifier', anchorText: 'não sabia vender online', title: 'O Desafio', subtitle: 'Identificando barreiras' },
    { sectionIndex: 1, cardIndex: 3, cardType: 'story-revealer', anchorText: 'mudou tudo', title: 'O Segredo', subtitle: 'A virada' },
    { sectionIndex: 2, cardIndex: 1, cardType: 'stats-comparison', anchorText: 'falta de visibilidade', title: 'O Problema Real', subtitle: 'Visibilidade vs Invisibilidade' },
    { sectionIndex: 2, cardIndex: 2, cardType: 'generic-detector', anchorText: 'eram genéricos', title: 'Scanner de Genérico', subtitle: 'Detectando o problema' },
    { sectionIndex: 2, cardIndex: 3, cardType: 'prompt-magic', anchorText: 'segredo', title: 'A Mágica do Prompt', subtitle: 'Transformação do texto' },
    { sectionIndex: 3, cardIndex: 1, cardType: 'amplifier-concept', anchorText: 'amplificadora', title: 'Conceito Amplificador', subtitle: 'IA como multiplicadora' },
    { sectionIndex: 3, cardIndex: 2, cardType: 'emotion-connector', anchorText: 'prompts com emoção', title: 'Conexão Emocional', subtitle: 'Histórias que conectam' },
    { sectionIndex: 3, cardIndex: 3, cardType: 'object-transformer', anchorText: 'Posts que conectam', title: 'Transformação', subtitle: 'De genérico para único' },
    { sectionIndex: 4, cardIndex: 1, cardType: 'transformation-viewer', anchorText: '47 vendas', title: 'Resultados Reais', subtitle: 'A transformação em números' },
    { sectionIndex: 4, cardIndex: 2, cardType: 'prompt-builder', anchorText: 'contar histórias', title: 'Construtor de Prompts', subtitle: 'Passo a passo' },
    { sectionIndex: 4, cardIndex: 3, cardType: 'variation-multiplier', anchorText: 'dezenas de variações', title: 'Multiplicador', subtitle: '1 ideia → muitas versões' },
    { sectionIndex: 5, cardIndex: 1, cardType: 'next-steps', anchorText: 'Próximos passos', title: 'Ação!', subtitle: 'Comece agora' },
    { sectionIndex: 5, cardIndex: 2, cardType: 'closing-message', anchorText: 'possibilidades reais', title: 'Mensagem Final', subtitle: 'Sua jornada começa' },
  ],
  'aula-3': [
    // Seção 1 - O Mercado Invisível (3 cards)
    { sectionIndex: 1, cardIndex: 1, cardType: 'hidden-market', anchorText: 'mercado gigantesco', title: 'Mercado Oculto', subtitle: 'Oportunidades invisíveis' },
    { sectionIndex: 1, cardIndex: 2, cardType: 'need-detector', anchorText: 'milhares de pequenas necessidades', title: 'Detector de Necessidades', subtitle: 'Problemas = oportunidades' },
    { sectionIndex: 1, cardIndex: 3, cardType: 'bridge-builder', anchorText: 'ponte', title: 'Construtor de Pontes', subtitle: 'Conecte problemas a soluções' },
    // Seção 2 - Três Níveis de Oportunidade (3 cards)
    { sectionIndex: 2, cardIndex: 1, cardType: 'level-system', anchorText: 'Nível 1', title: 'Sistema de Níveis', subtitle: 'Evolua passo a passo' },
    { sectionIndex: 2, cardIndex: 2, cardType: 'value-calculator', anchorText: 'Currículos personalizados', title: 'Calculadora de Valor', subtitle: 'Quanto cobrar por serviço' },
    { sectionIndex: 2, cardIndex: 3, cardType: 'reference-builder', anchorText: 'referência', title: 'Construtor de Autoridade', subtitle: 'Vire referência no mercado' },
    // Seção 3 - Casos Reais e Simples (3 cards)
    { sectionIndex: 3, cardIndex: 1, cardType: 'case-viewer', anchorText: 'João cria lojas de e-commerce do zero', title: 'Visualizador de Casos', subtitle: 'João e as lojas online' },
    { sectionIndex: 3, cardIndex: 2, cardType: 'profit-calculator', anchorText: '100 reais por loja', title: 'Calculadora de Ganhos', subtitle: 'Projete sua renda' },
    { sectionIndex: 3, cardIndex: 3, cardType: 'opportunity-identifier', anchorText: 'identificaram oportunidades simples ao redor', title: 'Identificador', subtitle: 'Encontre sua oportunidade' },
    // Seção 4 - Seu Primeiro Teste (3 cards)
    { sectionIndex: 4, cardIndex: 1, cardType: 'problem-solver', anchorText: 'sempre pedem ajuda', title: 'Solucionador', subtitle: 'Transforme problemas em renda' },
    { sectionIndex: 4, cardIndex: 2, cardType: 'template-gallery', anchorText: 'Exemplos para Começar', title: 'Galeria de Templates', subtitle: 'Modelos prontos para usar' },
    { sectionIndex: 4, cardIndex: 3, cardType: 'playground-creator', anchorText: 'Teste agora', title: 'Criador de Soluções', subtitle: 'Pratique no Playground' },
    // Seção 5 - O Caminho Sustentável (3 cards)
    { sectionIndex: 5, cardIndex: 1, cardType: 'timeline-tracker', anchorText: 'Semana 1-2', title: 'Linha do Tempo', subtitle: 'Seu progresso mapeado' },
    { sectionIndex: 5, cardIndex: 2, cardType: 'growth-visualizer', anchorText: 'confiança para cobrar', title: 'Visualizador de Crescimento', subtitle: 'De zero a profissional' },
    { sectionIndex: 5, cardIndex: 3, cardType: 'success-roadmap', anchorText: 'Hoje mesmo', title: 'Mapa do Sucesso', subtitle: 'Comece agora' },
  ],
  'aula-4': [
    // Seção 1 - O dia em que a padaria mudou de nível (3 cards)
    { sectionIndex: 1, cardIndex: 1, cardType: 'bakery-transformation', anchorText: 'cartaz novo, bonito', title: 'Transformação da Padaria', subtitle: 'De comum para profissional' },
    { sectionIndex: 1, cardIndex: 2, cardType: 'teenage-designer', anchorText: 'filha de quatorze anos fez isso', title: 'Designer de 14 Anos', subtitle: 'Criando com I.A.' },
    { sectionIndex: 1, cardIndex: 3, cardType: 'first-mover-advantage', anchorText: 'Quem testou primeiro saiu na frente', title: 'Vantagem do Pioneiro', subtitle: 'Quem age primeiro ganha' },
    // Seção 2 - Os três tipos de pessoa diante da I.A. (3 cards)
    { sectionIndex: 2, cardIndex: 1, cardType: 'three-persona-types', anchorText: 'três tipos de pessoa', title: 'Os Três Perfis', subtitle: 'Medroso, Planejador, Fazedor' },
    { sectionIndex: 2, cardIndex: 2, cardType: 'fear-vs-action', anchorText: 'Isso é complicado demais', title: 'Medo vs Ação', subtitle: 'Duas escolhas, dois destinos' },
    { sectionIndex: 2, cardIndex: 3, cardType: 'silent-doer', anchorText: 'O Fazedor Silencioso', title: 'O Fazedor Silencioso', subtitle: 'Testa, erra, ajusta, lucra' },
    // Seção 3 - O que dá para fazer com I.A. no mundo real (4 cards)
    { sectionIndex: 3, cardIndex: 1, cardType: 'real-world-uses', anchorText: 'possibilidades concretas', title: 'Usos no Mundo Real', subtitle: 'Cardápios, descrições, roteiros' },
    { sectionIndex: 3, cardIndex: 2, cardType: 'resume-builder', anchorText: 'rapaz que sempre ajudou amigos com currículo', title: 'O Rapaz do Currículo', subtitle: 'Transformou ajuda em serviço' },
    { sectionIndex: 3, cardIndex: 3, cardType: 'spreadsheet-master', anchorText: 'moça que gosta de organização', title: 'A Moça das Planilhas', subtitle: 'Organização virou negócio' },
    { sectionIndex: 3, cardIndex: 4, cardType: 'script-writer', anchorText: 'roteirista de apoio', title: 'Roteirista de Apoio', subtitle: 'I.A. estrutura, você grava' },
    // Seção 4 - Trazendo isso para a sua realidade (3 cards)
    { sectionIndex: 4, cardIndex: 1, cardType: 'your-reality', anchorText: 'sua vez de olhar para o seu mundo', title: 'Sua Realidade', subtitle: 'Olhe ao seu redor' },
    { sectionIndex: 4, cardIndex: 2, cardType: 'help-network', anchorText: 'pessoas próximas sempre pedem ajuda', title: 'Sua Rede de Ajuda', subtitle: 'Quem você pode ajudar?' },
    { sectionIndex: 4, cardIndex: 3, cardType: 'small-experiment', anchorText: 'pequeno experimento bem-feito', title: 'Pequeno Experimento', subtitle: 'É assim que começa' },
    // Seção 5 - A verdade que ninguém conta (3 cards)
    { sectionIndex: 5, cardIndex: 1, cardType: 'history-parallel', anchorText: 'internet começou a crescer', title: 'Paralelo Histórico', subtitle: 'Internet → I.A.' },
    { sectionIndex: 5, cardIndex: 2, cardType: 'balanced-approach', anchorText: 'Quem entende o equilíbrio', title: 'O Equilíbrio Certo', subtitle: 'Nem ignora, nem exagera' },
    { sectionIndex: 5, cardIndex: 3, cardType: 'practice-preview', anchorText: 'próximas aulas', title: 'Preview da Prática', subtitle: 'Prompts, estruturas, exercícios' },
  ],
};

// 🎬 Função para gerar tipos de Card Effects filtrados por aula
const getCardTypesForLesson = (lessonId: string) => {
  const lessonCards = CARD_EFFECTS_BY_LESSON[lessonId] || CARD_EFFECT_TYPES;
  return lessonCards.map(type => ({
    value: type,
    label: CARD_EFFECT_LABELS[type] || type,
    isCinematic: true
  }));
};

// 📝 Tipos de Card com texto (legado)
const TEXT_CARD_TYPES = [
  { value: 'ia-book', label: 'Livro I.A.', isCinematic: false },
  { value: 'ia-chat', label: 'Chat I.A.', isCinematic: false },
  { value: 'comparison', label: 'Comparação', isCinematic: false },
  { value: 'quote', label: 'Citação', isCinematic: false },
];

// 🎨 Esquemas de cores disponíveis
const COLOR_SCHEMES = [
  { value: 'purple', label: 'Roxo', color: '#a855f7' },
  { value: 'blue', label: 'Azul', color: '#3b82f6' },
  { value: 'green', label: 'Verde', color: '#22c55e' },
  { value: 'orange', label: 'Laranja', color: '#f97316' },
  { value: 'pink', label: 'Rosa', color: '#ec4899' },
  { value: 'cyan', label: 'Ciano', color: '#06b6d4' },
  { value: 'gold', label: 'Dourado', color: '#eab308' },
  { value: 'red', label: 'Vermelho', color: '#ef4444' },
];

// 🔣 Ícones disponíveis
const AVAILABLE_ICONS = [
  { value: 'book', label: 'Livro', Icon: Book },
  { value: 'brain', label: 'Cérebro', Icon: Brain },
  { value: 'sparkles', label: 'Brilhos', Icon: Sparkles },
  { value: 'zap', label: 'Raio', Icon: Zap },
  { value: 'star', label: 'Estrela', Icon: Star },
  { value: 'rocket', label: 'Foguete', Icon: Rocket },
  { value: 'target', label: 'Alvo', Icon: Target },
  { value: 'lightbulb', label: 'Lâmpada', Icon: Lightbulb },
  { value: 'trophy', label: 'Troféu', Icon: Trophy },
  { value: 'heart', label: 'Coração', Icon: Heart },
  { value: 'crown', label: 'Coroa', Icon: Crown },
  { value: 'flame', label: 'Chama', Icon: Flame },
];

interface Section {
  id: string;
  markdown?: string;
  visualContent?: string;
}

interface ExperienceCard {
  sectionIndex: number;
  cardIndex: number; // 1 ou 2
  cardType: string; // texto livre (ex: "ia-digital-employee", "ia-image-gen")
  anchorText: string; // Trecho do markdown que serve como gatilho
  title: string;
  subtitle: string;
  icon?: string; // emoji ou nome do ícone
  colorScheme?: string; // cor de destaque (hex ou css)
  effectDescription?: string; // descrição técnica das animações
  chapters?: string[]; // páginas/capítulos internos do card
}

export default function AdminV5CardConfig() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [lessonJson, setLessonJson] = useState('');
  const [parsedLesson, setParsedLesson] = useState<any>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [experienceCards, setExperienceCards] = useState<ExperienceCard[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [generatingProgress, setGeneratingProgress] = useState<string | null>(null);
  
  // Auto-save recovery
  useEffect(() => {
    const saved = localStorage.getItem('v5-card-config-autosave');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.lessonJson && data.timestamp && Date.now() - data.timestamp < 24 * 60 * 60 * 1000) {
          toast({
            title: "💾 Progresso recuperado",
            description: "Trabalho anterior restaurado automaticamente.",
          });
          setLessonJson(data.lessonJson);
          if (data.parsedLesson) setParsedLesson(data.parsedLesson);
          if (data.sections) setSections(data.sections);
          if (data.experienceCards) setExperienceCards(data.experienceCards);
        }
      } catch (e) {
        console.error('Erro ao recuperar auto-save:', e);
      }
    }
  }, [toast]);

  // Auto-save on changes
  useEffect(() => {
    if (lessonJson || experienceCards.length > 0) {
      localStorage.setItem('v5-card-config-autosave', JSON.stringify({
        lessonJson,
        parsedLesson,
        sections,
        experienceCards,
        timestamp: Date.now()
      }));
    }
  }, [lessonJson, parsedLesson, sections, experienceCards]);
  
  // Novos estados para o fluxo correto
  const [selectedSectionIndex, setSelectedSectionIndex] = useState<number | null>(null);
  const [cardsQuantity, setCardsQuantity] = useState<1 | 2 | 3>(1);
  const [selectedLesson, setSelectedLesson] = useState<string>('aula-1');

  // Card types filtrados pela aula selecionada
  const cinematographicCardTypes = getCardTypesForLesson(selectedLesson);
  // LocalStorage keys
  const CARD1_STORAGE_KEY = 'v5-card-config-card1';
  const CARD2_STORAGE_KEY = 'v5-card-config-card2';
  const CARD3_STORAGE_KEY = 'v5-card-config-card3';

  // Inicializar com dados salvos ou valores padrão
  const [card1, setCard1] = useState<Partial<ExperienceCard>>(() => {
    const saved = localStorage.getItem(CARD1_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return {
          cardType: '',
          anchorText: '',
          title: '',
          subtitle: '',
          icon: '',
          colorScheme: '',
          effectDescription: '',
          chapters: []
        };
      }
    }
    return {
      cardType: '',
      anchorText: '',
      title: '',
      subtitle: '',
      icon: '',
      colorScheme: '',
      effectDescription: '',
      chapters: []
    };
  });

  const [card2, setCard2] = useState<Partial<ExperienceCard>>(() => {
    const saved = localStorage.getItem(CARD2_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return {
          cardType: '',
          anchorText: '',
          title: '',
          subtitle: '',
          icon: '',
          colorScheme: '',
          effectDescription: '',
          chapters: []
        };
      }
    }
    return {
      cardType: '',
      anchorText: '',
      title: '',
      subtitle: '',
      icon: '',
      colorScheme: '',
      effectDescription: '',
      chapters: []
    };
  });

  const [card3, setCard3] = useState<Partial<ExperienceCard>>(() => {
    const saved = localStorage.getItem(CARD3_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return {
          cardType: '',
          anchorText: '',
          title: '',
          subtitle: '',
          icon: '',
          colorScheme: '',
          effectDescription: '',
          chapters: []
        };
      }
    }
    return {
      cardType: '',
      anchorText: '',
      title: '',
      subtitle: '',
      icon: '',
      colorScheme: '',
      effectDescription: '',
      chapters: []
    };
  });

  // Auto-save card1 no localStorage
  useEffect(() => {
    localStorage.setItem(CARD1_STORAGE_KEY, JSON.stringify(card1));
  }, [card1]);

  // Auto-save card2 no localStorage
  useEffect(() => {
    localStorage.setItem(CARD2_STORAGE_KEY, JSON.stringify(card2));
  }, [card2]);

  // Auto-save card3 no localStorage
  useEffect(() => {
    localStorage.setItem(CARD3_STORAGE_KEY, JSON.stringify(card3));
  }, [card3]);

  // Estado do preview modal
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewCards, setPreviewCards] = useState<ExperienceCard[]>([]);

  // Estado para cards detectados do JSON
  const [detectedCards, setDetectedCards] = useState<ExperienceCard[]>([]);
  const [sendingToPipeline, setSendingToPipeline] = useState(false);

  const handleAnalyzeJson = () => {
    try {
      let parsed = JSON.parse(lessonJson);
      
      if (Array.isArray(parsed)) {
        if (parsed.length === 0) {
          throw new Error('Array JSON está vazio');
        }
        parsed = parsed[0];
      }
      
      if (!parsed.title) {
        throw new Error('JSON precisa ter campo "title"');
      }
      
      const sections = parsed.sections || parsed.content?.sections;
      
      if (!sections || !Array.isArray(sections)) {
        throw new Error('JSON precisa ter "sections" ou "content.sections" como array');
      }

      // 🔍 NOVO: Detectar experienceCards do JSON
      const jsonCards = parsed.experienceCards || [];
      
      setParsedLesson(parsed);
      setSections(sections);
      setDetectedCards(jsonCards);
      
      // Se tem cards no JSON, preencher experienceCards automaticamente
      if (jsonCards.length > 0) {
        setExperienceCards(jsonCards);
      }
      
      toast({
        title: "✅ JSON analisado!",
        description: jsonCards.length > 0
          ? `${sections.length} seções + ${jsonCards.length} experience cards detectados!`
          : `${sections.length} seções detectadas. Nenhum experienceCard no JSON.`,
      });
      
      console.log('📊 [V5-CONFIG] JSON analisado:', {
        title: parsed.title,
        sectionsCount: sections.length,
        model: parsed.model,
        experienceCardsCount: jsonCards.length,
      });
      
    } catch (error: any) {
      console.error('❌ [V5-CONFIG] Erro ao analisar JSON:', error);
      toast({
        title: "Erro ao analisar JSON",
        description: error.message || "JSON inválido. Verifique a sintaxe.",
        variant: "destructive",
      });
    }
  };

  // 🚀 NOVO: Enviar direto para pipeline (sem passar pela aba manual)
  const handleSendToPipeline = async () => {
    if (!parsedLesson) {
      toast({
        title: "JSON não analisado",
        description: "Cole o JSON e clique em 'Analisar JSON' primeiro.",
        variant: "destructive",
      });
      return;
    }

    if (detectedCards.length === 0) {
      toast({
        title: "Nenhum card no JSON",
        description: "O JSON não contém experienceCards. Use a aba 'Configurar Cards' para adicionar manualmente.",
        variant: "destructive",
      });
      return;
    }

    setSendingToPipeline(true);

    try {
      // Buscar próximo order_index
      const { data: existingLessons } = await supabase
        .from('lessons')
        .select('order_index')
        .eq('trail_id', parsedLesson.trackId)
        .order('order_index', { ascending: false })
        .limit(1);

      const nextOrderIndex = existingLessons && existingLessons.length > 0
        ? existingLessons[0].order_index + 1
        : parsedLesson.orderIndex || 1;

      // Normalizar seções
      const rawSections = parsedLesson.sections || parsedLesson.content?.sections || [];
      const normalizedSections = rawSections.map((section: any, index: number) => ({
        id: section.id || `section-${index + 1}`,
        visualContent: section.visualContent || section.markdown || section.content || '',
        ...(section.title && { title: section.title }),
        ...(section.speechBubbleText || section.speechBubble
          ? { speechBubbleText: section.speechBubbleText || section.speechBubble }
          : {}),
        ...(section.showPlaygroundCall !== undefined && { showPlaygroundCall: section.showPlaygroundCall }),
        ...(section.playgroundConfig && { playgroundConfig: section.playgroundConfig })
      }));

      // Formatar cards para o pipeline
      const formattedCards = detectedCards.map((card) => ({
        type: card.cardType,
        sectionIndex: card.sectionIndex,
        anchorText: card.anchorText,
        props: {
          title: card.title,
          subtitle: card.subtitle,
          icon: card.icon || 'sparkles',
          colorScheme: card.colorScheme || 'purple',
          chapters: card.chapters || [],
          effectDescription: card.effectDescription,
        }
      }));

      const pipelineInput = {
        title: parsedLesson.title,
        trackId: parsedLesson.trackId,
        trackName: parsedLesson.trackName || "Trilha Desconhecida",
        orderIndex: nextOrderIndex,
        model: 'v5',
        estimatedTime: parsedLesson.estimatedTimeMinutes || 5,
        sections: normalizedSections,
        exercises: parsedLesson.exercises || [],
        experienceCards: formattedCards,
      };

      const { data, error } = await supabase
        .from('pipeline_executions')
        .insert({
          lesson_title: parsedLesson.title,
          model: 'v5',
          track_id: parsedLesson.trackId,
          track_name: parsedLesson.trackName || "Trilha Desconhecida",
          order_index: nextOrderIndex,
          status: 'pending',
          input_data: pipelineInput,
          current_step: 1,
          total_steps: 8
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "🚀 Enviado para Pipeline!",
        description: `"${parsedLesson.title}" com ${detectedCards.length} cards. Redirecionando...`,
      });

      // Limpar estado
      localStorage.removeItem('v5-card-config-autosave');
      setLessonJson('');
      setParsedLesson(null);
      setSections([]);
      setExperienceCards([]);
      setDetectedCards([]);

      // Redirecionar para monitor
      setTimeout(() => navigate('/admin/pipeline/monitor'), 1500);

    } catch (error: any) {
      console.error('❌ [V5-CONFIG] Erro ao enviar:', error);
      toast({
        title: "Erro ao enviar",
        description: error.message || "Não foi possível enviar para o pipeline.",
        variant: "destructive",
      });
    } finally {
      setSendingToPipeline(false);
    }
  };

  const handleAddCardsToSection = () => {
    if (selectedSectionIndex === null) {
      toast({
        title: "❌ Erro",
        description: "Selecione uma seção primeiro",
        variant: "destructive",
      });
      return;
    }

    const newCards: ExperienceCard[] = [];

    // Validar e adicionar Card 1
    if (!card1.cardType || !card1.anchorText) {
      toast({
        title: "❌ Erro no Card 1",
        description: "CardType e AnchorText são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    newCards.push({
      sectionIndex: selectedSectionIndex,
      cardIndex: 1,
      cardType: card1.cardType!,
      anchorText: card1.anchorText!,
      title: card1.title!,
      subtitle: card1.subtitle || '',
      icon: card1.icon,
      colorScheme: card1.colorScheme,
      effectDescription: card1.effectDescription,
      chapters: card1.chapters || []
    });

    // Se quantidade for 2 ou 3, validar e adicionar Card 2
    if (cardsQuantity >= 2) {
      if (!card2.cardType || !card2.anchorText) {
        toast({
          title: "❌ Erro no Card 2",
          description: "CardType e AnchorText são obrigatórios para o Card 2",
          variant: "destructive",
        });
        return;
      }

      newCards.push({
        sectionIndex: selectedSectionIndex,
        cardIndex: 2,
        cardType: card2.cardType!,
        anchorText: card2.anchorText!,
        title: card2.title!,
        subtitle: card2.subtitle || '',
        icon: card2.icon,
        colorScheme: card2.colorScheme,
        effectDescription: card2.effectDescription,
        chapters: card2.chapters || []
      });
    }

    // Se quantidade for 3, validar e adicionar Card 3
    if (cardsQuantity === 3) {
      if (!card3.cardType || !card3.anchorText) {
        toast({
          title: "❌ Erro no Card 3",
          description: "CardType e AnchorText são obrigatórios para o Card 3",
          variant: "destructive",
        });
        return;
      }

      newCards.push({
        sectionIndex: selectedSectionIndex,
        cardIndex: 3,
        cardType: card3.cardType!,
        anchorText: card3.anchorText!,
        title: card3.title!,
        subtitle: card3.subtitle || '',
        icon: card3.icon,
        colorScheme: card3.colorScheme,
        effectDescription: card3.effectDescription,
        chapters: card3.chapters || []
      });
    }

    // Abrir modal de preview ao invés de adicionar direto
    setPreviewCards(newCards);
    setShowPreviewModal(true);
  };

  const handleConfirmCards = () => {
    // Remover cards antigos dessa seção e adicionar os novos
    const filteredCards = experienceCards.filter(c => c.sectionIndex !== selectedSectionIndex);
    setExperienceCards([...filteredCards, ...previewCards]);

    toast({
      title: "✅ Cards adicionados!",
      description: `${previewCards.length} card(s) configurado(s) para Seção ${selectedSectionIndex}`,
    });

    // Resetar formulário E limpar localStorage
    const emptyCard = {
      cardType: '',
      anchorText: '',
      title: '',
      subtitle: '',
      icon: '',
      colorScheme: '',
      effectDescription: '',
      chapters: []
    };
    
    setCard1(emptyCard);
    setCard2(emptyCard);
    setCard3(emptyCard);
    localStorage.removeItem(CARD1_STORAGE_KEY);
    localStorage.removeItem(CARD2_STORAGE_KEY);
    localStorage.removeItem(CARD3_STORAGE_KEY);

    // Fechar modal
    setShowPreviewModal(false);
    setPreviewCards([]);
  };

  const handleCancelPreview = () => {
    setShowPreviewModal(false);
    setPreviewCards([]);
  };

  const handleClearCards = () => {
    const emptyCard = {
      cardType: '',
      anchorText: '',
      title: '',
      subtitle: '',
      icon: '',
      colorScheme: '',
      effectDescription: '',
      chapters: []
    };

    setCard1(emptyCard);
    setCard2(emptyCard);
    setCard3(emptyCard);
    localStorage.removeItem(CARD1_STORAGE_KEY);
    localStorage.removeItem(CARD2_STORAGE_KEY);
    localStorage.removeItem(CARD3_STORAGE_KEY);

    toast({
      title: "🧹 Formulário limpo",
      description: "Dados dos cards foram apagados",
    });
  };

  const handleRemoveCard = (sectionIndex: number, cardIndex: number) => {
    const filtered = experienceCards.filter(
      c => !(c.sectionIndex === sectionIndex && c.cardIndex === cardIndex)
    );
    setExperienceCards(filtered);
    toast({
      title: "🗑️ Card removido",
      description: `Card ${cardIndex} da Seção ${sectionIndex} foi removido`,
    });
  };

  const handleCreateLesson = async () => {
    if (!parsedLesson) {
      toast({
        title: "JSON não analisado",
        description: "Cole o JSON e clique em 'Analisar JSON' primeiro.",
        variant: "destructive",
      });
      return;
    }

    if (experienceCards.length === 0) {
      toast({
        title: "Nenhum card configurado",
        description: "Adicione pelo menos um experience card.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    setGeneratingProgress("Preparando lição V5...");

    try {
      // ✨ NOVO: Não precisa mais de edge function!
      // O DynamicExperienceCard recebe as props diretamente
      console.log('🎨 [V5-CONFIG] Preparando experienceCards (sem IA)...');

      // PASSO 1: Buscar próximo order_index disponível na trilha
      const { data: existingLessons, error: fetchError } = await supabase
        .from('lessons')
        .select('order_index')
        .eq('trail_id', parsedLesson.trackId)
        .order('order_index', { ascending: false })
        .limit(1);

      if (fetchError) {
        console.warn('⚠️ [V5-CONFIG] Erro ao buscar order_index:', fetchError);
      }

      const nextOrderIndex = existingLessons && existingLessons.length > 0
        ? existingLessons[0].order_index + 1
        : parsedLesson.orderIndex || 1;

      console.log(`📊 [V5-CONFIG] Próximo order_index disponível: ${nextOrderIndex}`);

      // PASSO 2: Criar execução do PIPELINE
      setGeneratingProgress("Criando execução do pipeline...");

      // 🔧 NORMALIZAÇÃO CRÍTICA: Converter campos ANTES de salvar no banco
      const rawSections = parsedLesson.sections || parsedLesson.content?.sections || [];
      const normalizedSections = rawSections.map((section: any, index: number) => ({
        id: section.id || `section-${index + 1}`,
        visualContent: section.visualContent || section.markdown || section.content || '',
        ...(section.title && { title: section.title }),
        ...(section.speechBubbleText || section.speechBubble
          ? { speechBubbleText: section.speechBubbleText || section.speechBubble }
          : {}),
        ...(section.showPlaygroundCall !== undefined && { showPlaygroundCall: section.showPlaygroundCall }),
        ...(section.playgroundConfig && { playgroundConfig: section.playgroundConfig })
      }));

      console.log('🔧 [V5-CONFIG] ✅ Seções normalizadas:', normalizedSections.length);

      // ✨ NOVO: Converter para o formato que o GuidedLessonV5 espera
      // Usa DynamicExperienceCard com props ao invés de componentCode
      const formattedExperienceCards = experienceCards.map((card) => ({
        type: card.cardType,
        sectionIndex: card.sectionIndex,
        anchorText: card.anchorText,
        props: {
          title: card.title,
          subtitle: card.subtitle,
          icon: card.icon || 'sparkles',
          colorScheme: card.colorScheme || 'purple',
          chapters: card.chapters || [],
          effectDescription: card.effectDescription,
        }
      }));

      console.log('✅ [V5-CONFIG] Experience cards formatados:', formattedExperienceCards.length);

      const pipelineInput = {
        title: parsedLesson.title,
        trackId: parsedLesson.trackId,
        trackName: parsedLesson.trackName || "Trilha Desconhecida",
        orderIndex: nextOrderIndex,
        model: 'v5',
        estimatedTime: parsedLesson.estimatedTimeMinutes || 5,
        sections: normalizedSections,
        exercises: parsedLesson.exercises || [],
        experienceCards: formattedExperienceCards,
      };

      const { data, error } = await supabase
        .from('pipeline_executions')
        .insert({
          lesson_title: parsedLesson.title,
          model: 'v5',
          track_id: parsedLesson.trackId,
          track_name: parsedLesson.trackName || "Trilha Desconhecida",
          order_index: nextOrderIndex,
          status: 'pending',
          input_data: pipelineInput,
          current_step: 1,
          total_steps: 8
        })
        .select()
        .single();

      if (error) throw error;

      setGeneratingProgress(null);

      toast({
        title: "✅ Pipeline iniciado!",
        description: `Lição "${parsedLesson.title}" com ${experienceCards.length} Experience Cards criada!`,
      });

      console.log('🎉 [V5-CONFIG] Pipeline execution criada:', data);

      // Limpar auto-save após sucesso
      localStorage.removeItem('v5-card-config-autosave');

      setLessonJson('');
      setParsedLesson(null);
      setSections([]);
      setExperienceCards([]);

      // Redirecionar para o monitor após 2s
      setTimeout(() => {
        navigate('/admin/pipeline/monitor');
      }, 2000);

    } catch (error: any) {
      console.error('❌ [V5-CONFIG] Erro ao criar lição:', error);
      setGeneratingProgress(null);

      toast({
        title: "Erro ao criar lição",
        description: error.message || "Não foi possível criar a lição V5.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-50/30 to-blue-50/30 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin/manual')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Wand2 className="w-8 h-8 text-purple-600" />
                Criar Lição V5 com Experience Cards
              </h1>
              <p className="text-muted-foreground">
                Cole o JSON, configure cards ancorados no texto, e crie a lição
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const data = {
                  lessonJson,
                  parsedLesson,
                  sections,
                  experienceCards,
                  timestamp: Date.now()
                };
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `v5-progress-${Date.now()}.json`;
                a.click();
                toast({ title: "💾 Backup exportado" });
              }}
              disabled={!lessonJson && experienceCards.length === 0}
            >
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
            
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                if (confirm('Limpar todo o progresso? Esta ação não pode ser desfeita.')) {
                  localStorage.removeItem('v5-card-config-autosave');
                  setLessonJson('');
                  setParsedLesson(null);
                  setSections([]);
                  setExperienceCards([]);
                  toast({ title: "🗑️ Progresso limpo" });
                }
              }}
              disabled={!lessonJson && experienceCards.length === 0}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Limpar
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_300px] gap-6">
          {/* Coluna Principal */}
          <div className="space-y-6">
            <Tabs defaultValue="paste" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="paste">1️⃣ Colar JSON</TabsTrigger>
                <TabsTrigger value="manual" disabled={!parsedLesson}>2️⃣ Configurar Cards</TabsTrigger>
              </TabsList>

              {/* TAB 1: COLAR JSON */}
              <TabsContent value="paste" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>📋 Cole o JSON da Lição V5</CardTitle>
                    <CardDescription>
                      JSON completo com seções e experienceCards (incluindo anchorText)
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      value={lessonJson}
                      onChange={(e) => setLessonJson(e.target.value)}
                      placeholder='{"title": "...", "trackId": "...", "sections": [...], "experienceCards": [...]}'
                      className="font-mono text-xs min-h-[300px]"
                    />
                    
                    <Button
                      onClick={handleAnalyzeJson}
                      disabled={!lessonJson.trim()}
                      className="w-full"
                      variant="default"
                    >
                      <Wand2 className="w-4 h-4 mr-2" />
                      Analisar JSON
                    </Button>

                    {/* 📊 Resumo do JSON Analisado */}
                    {parsedLesson && (
                      <div className="space-y-4">
                        {/* Info da Lição */}
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                            <span className="font-semibold text-green-900">{parsedLesson.title}</span>
                          </div>
                          <div className="flex gap-4 text-sm text-green-700">
                            <span>📑 {sections.length} seções</span>
                            <span>🎬 {detectedCards.length} cards detectados</span>
                          </div>
                        </div>

                        {/* Lista de Cards Detectados */}
                        {detectedCards.length > 0 && (
                          <div className="border rounded-lg overflow-hidden">
                            <div className="bg-purple-50 px-4 py-2 border-b">
                              <h4 className="font-medium text-purple-900 flex items-center gap-2">
                                <Sparkles className="w-4 h-4" />
                                Experience Cards no JSON ({detectedCards.length})
                              </h4>
                            </div>
                            <div className="max-h-[200px] overflow-y-auto divide-y">
                              {detectedCards.map((card, idx) => (
                                <div key={idx} className="px-4 py-2 flex items-center gap-2 text-sm">
                                  <Badge variant="outline" className="shrink-0">S{card.sectionIndex}</Badge>
                                  <Badge className="shrink-0">{card.cardType}</Badge>
                                  <span className="text-muted-foreground truncate">"{card.anchorText}"</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Aviso se não tem cards */}
                        {detectedCards.length === 0 && (
                          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                            <p className="text-sm text-amber-800">
                              ⚠️ <strong>Nenhum experienceCard no JSON.</strong> Use a aba "Configurar Cards" para adicionar manualmente.
                            </p>
                          </div>
                        )}

                        {/* 🚀 Botão Enviar para Pipeline */}
                        {detectedCards.length > 0 && (
                          <Button
                            onClick={handleSendToPipeline}
                            disabled={sendingToPipeline}
                            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                            size="lg"
                          >
                            <Send className="w-4 h-4 mr-2" />
                            {sendingToPipeline
                              ? 'Enviando...'
                              : `Enviar para Pipeline (${detectedCards.length} cards)`
                            }
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* TAB 2: CONFIGURAR CARDS MANUALMENTE */}
              <TabsContent value="manual" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>➕ Configurar Experience Cards</CardTitle>
                    <CardDescription>
                      Cada seção pode ter até 3 cards. Use anchorText do markdown como gatilho.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Seleção de Aula */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs">0</span>
                        Selecione a Aula
                      </Label>
                      <div className="grid grid-cols-2 gap-3">
                        {AVAILABLE_LESSONS.map((lesson) => (
                          <div
                            key={lesson.id}
                            onClick={() => setSelectedLesson(lesson.id)}
                            className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                              selectedLesson === lesson.id
                                ? 'border-purple-500 bg-purple-500/10'
                                : 'border-muted hover:border-purple-300'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-lg">{lesson.icon}</span>
                              <span className="font-medium text-sm">{lesson.title.split(' - ')[0]}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">{lesson.title.split(' - ')[1]}</p>
                            <p className="text-[10px] text-purple-500 mt-1">{lesson.description}</p>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Escolha a aula para filtrar os card effects disponíveis
                      </p>

                      {/* Botão Carregar Template */}
                      <Button
                        variant="default"
                        className="w-full mt-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                        onClick={() => {
                          const template = LESSON_CARD_TEMPLATES[selectedLesson];
                          if (template) {
                            setExperienceCards(template);
                            toast({
                              title: "📋 Template carregado!",
                              description: `${template.length} cards pré-configurados para ${AVAILABLE_LESSONS.find(l => l.id === selectedLesson)?.title}`,
                            });
                          }
                        }}
                      >
                        <Wand2 className="w-4 h-4 mr-2" />
                        Carregar Template ({LESSON_CARD_TEMPLATES[selectedLesson]?.length || 0} cards)
                      </Button>
                    </div>

                    <Separator />

                    {/* Seleção de Seção */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">1</span>
                        Selecione a Seção
                      </Label>
                      <Select 
                        value={selectedSectionIndex?.toString() || ''} 
                        onValueChange={(val) => setSelectedSectionIndex(parseInt(val))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Escolha uma seção..." />
                        </SelectTrigger>
                        <SelectContent>
                          {sections.map((_, idx) => (
                            <SelectItem key={idx} value={String(idx + 1)}>
                              Seção {idx + 1}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Quantidade de Cards */}
                    {selectedSectionIndex !== null && (
                      <div className="space-y-2">
                        <Label>2. Quantidade de Cards nesta Seção</Label>
                        <RadioGroup
                          value={String(cardsQuantity)}
                          onValueChange={(val) => setCardsQuantity(parseInt(val) as 1 | 2 | 3)}
                          className="flex gap-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="1" id="qty-1" />
                            <Label htmlFor="qty-1">1 card</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="2" id="qty-2" />
                            <Label htmlFor="qty-2">2 cards</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="3" id="qty-3" />
                            <Label htmlFor="qty-3">3 cards</Label>
                          </div>
                        </RadioGroup>
                      </div>
                    )}

                    {/* Configuração dos Cards */}
                    {selectedSectionIndex !== null && (
                      <div className="space-y-6 border-t pt-6">
                        {/* Card 1 */}
                        <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                          <h4 className="font-semibold flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">1</span>
                              Card 1
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleClearCards}
                              className="h-7 text-xs"
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              Limpar tudo
                            </Button>
                          </h4>
                          
                          <div className="space-y-2">
                            <Label>Tipo de Card Effect *</Label>
                            <Select
                              value={card1.cardType}
                              onValueChange={(value) => setCard1({ ...card1, cardType: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Escolha o tipo de animação" />
                              </SelectTrigger>
                              <SelectContent>
                                <div className="px-2 py-1 text-xs font-medium text-muted-foreground bg-muted/50">
                                  🎬 Animações Cinematográficas
                                </div>
                                {cinematographicCardTypes.map(({ value, label }) => (
                                  <SelectItem key={value} value={value}>
                                    <span className="flex items-center gap-2">
                                      <span className="text-purple-400">▸</span>
                                      {label}
                                    </span>
                                  </SelectItem>
                                ))}
                                <Separator className="my-2" />
                                <div className="px-2 py-1 text-xs font-medium text-muted-foreground bg-muted/50">
                                  📝 Cards de Texto (Legado)
                                </div>
                                {TEXT_CARD_TYPES.map(({ value, label }) => (
                                  <SelectItem key={value} value={value}>
                                    <span className="flex items-center gap-2">
                                      <span className="text-blue-400">▹</span>
                                      {label}
                                    </span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                              {isValidCardEffectType(card1.cardType || '')
                                ? '🎬 Este tipo exibirá uma animação cinematográfica temática'
                                : 'Escolha o tipo de card effect para esta seção'
                              }
                            </p>
                          </div>

                          <div className="space-y-2">
                            <Label>AnchorText (trecho do markdown) *</Label>
                            <Input
                              placeholder='Ex: "aplicativo funcional" ou "funcionário digital"'
                              value={card1.anchorText}
                              onChange={(e) => setCard1({ ...card1, anchorText: e.target.value })}
                            />
                            <p className="text-xs text-muted-foreground">
                              Cole o trecho exato do markdown que será o gatilho para exibir o card
                            </p>
                          </div>

                          {/* Descrição do efeito selecionado */}
                          {card1.cardType && isValidCardEffectType(card1.cardType) && (
                            <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                              <p className="text-xs text-purple-300">
                                <strong>Animação:</strong> {CARD_EFFECT_DESCRIPTIONS[card1.cardType as keyof typeof CARD_EFFECT_DESCRIPTIONS]}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Card 2 (condicional) */}
                        {cardsQuantity >= 2 && (
                          <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                            <h4 className="font-semibold flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">2</span>
                              Card 2
                            </h4>

                            <div className="space-y-2">
                              <Label>Tipo de Card Effect *</Label>
                              <Select
                                value={card2.cardType}
                                onValueChange={(value) => setCard2({ ...card2, cardType: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Escolha o tipo de animação" />
                                </SelectTrigger>
                                <SelectContent>
                                  <div className="px-2 py-1 text-xs font-medium text-muted-foreground bg-muted/50">
                                    🎬 Animações Cinematográficas
                                  </div>
                                  {cinematographicCardTypes.map(({ value, label }) => (
                                    <SelectItem key={value} value={value}>
                                      <span className="flex items-center gap-2">
                                        <span className="text-purple-400">▸</span>
                                        {label}
                                      </span>
                                    </SelectItem>
                                  ))}
                                  <Separator className="my-2" />
                                  <div className="px-2 py-1 text-xs font-medium text-muted-foreground bg-muted/50">
                                    📝 Cards de Texto (Legado)
                                  </div>
                                  {TEXT_CARD_TYPES.map(({ value, label }) => (
                                    <SelectItem key={value} value={value}>
                                      <span className="flex items-center gap-2">
                                        <span className="text-blue-400">▹</span>
                                        {label}
                                      </span>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <p className="text-xs text-muted-foreground">
                                {isValidCardEffectType(card2.cardType || '')
                                  ? '🎬 Este tipo exibirá uma animação cinematográfica temática'
                                  : 'Escolha o tipo de card effect para esta seção'
                                }
                              </p>
                            </div>

                            <div className="space-y-2">
                              <Label>AnchorText (trecho do markdown) *</Label>
                              <Input
                                placeholder='Ex: "outro trecho importante"'
                                value={card2.anchorText}
                                onChange={(e) => setCard2({ ...card2, anchorText: e.target.value })}
                              />
                              <p className="text-xs text-muted-foreground">
                                Cole o trecho exato do markdown que será o gatilho para exibir o card
                              </p>
                            </div>

                            {/* Descrição do efeito selecionado */}
                            {card2.cardType && isValidCardEffectType(card2.cardType) && (
                              <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                                <p className="text-xs text-purple-300">
                                  <strong>Animação:</strong> {CARD_EFFECT_DESCRIPTIONS[card2.cardType as keyof typeof CARD_EFFECT_DESCRIPTIONS]}
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Card 3 (condicional) */}
                        {cardsQuantity === 3 && (
                          <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                            <h4 className="font-semibold flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">3</span>
                              Card 3
                            </h4>

                            <div className="space-y-2">
                              <Label>Tipo de Card Effect *</Label>
                              <Select
                                value={card3.cardType}
                                onValueChange={(value) => setCard3({ ...card3, cardType: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Escolha o tipo de animação" />
                                </SelectTrigger>
                                <SelectContent>
                                  <div className="px-2 py-1 text-xs font-medium text-muted-foreground bg-muted/50">
                                    🎬 Animações Cinematográficas
                                  </div>
                                  {cinematographicCardTypes.map(({ value, label }) => (
                                    <SelectItem key={value} value={value}>
                                      <span className="flex items-center gap-2">
                                        <span className="text-purple-400">▸</span>
                                        {label}
                                      </span>
                                    </SelectItem>
                                  ))}
                                  <Separator className="my-2" />
                                  <div className="px-2 py-1 text-xs font-medium text-muted-foreground bg-muted/50">
                                    📝 Cards de Texto (Legado)
                                  </div>
                                  {TEXT_CARD_TYPES.map(({ value, label }) => (
                                    <SelectItem key={value} value={value}>
                                      <span className="flex items-center gap-2">
                                        <span className="text-blue-400">▹</span>
                                        {label}
                                      </span>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <p className="text-xs text-muted-foreground">
                                {isValidCardEffectType(card3.cardType || '')
                                  ? '🎬 Este tipo exibirá uma animação cinematográfica temática'
                                  : 'Escolha o tipo de card effect para esta seção'
                                }
                              </p>
                            </div>

                            <div className="space-y-2">
                              <Label>AnchorText (trecho do markdown) *</Label>
                              <Input
                                placeholder='Ex: "terceiro trecho importante"'
                                value={card3.anchorText}
                                onChange={(e) => setCard3({ ...card3, anchorText: e.target.value })}
                              />
                              <p className="text-xs text-muted-foreground">
                                Cole o trecho exato do markdown que será o gatilho para exibir o card
                              </p>
                            </div>

                            {/* Descrição do efeito selecionado */}
                            {card3.cardType && isValidCardEffectType(card3.cardType) && (
                              <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                                <p className="text-xs text-purple-300">
                                  <strong>Animação:</strong> {CARD_EFFECT_DESCRIPTIONS[card3.cardType as keyof typeof CARD_EFFECT_DESCRIPTIONS]}
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        <Button onClick={handleAddCardsToSection} className="w-full" size="lg">
                          <Eye className="w-4 h-4 mr-2" />
                          Preview e Adicionar {cardsQuantity} Card(s) à Seção {selectedSectionIndex}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Lista de Cards Configurados */}
                {experienceCards.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>📋 Cards Configurados ({experienceCards.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {experienceCards
                          .sort((a, b) => a.sectionIndex - b.sectionIndex || a.cardIndex - b.cardIndex)
                          .map((card, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline">Seção {card.sectionIndex}</Badge>
                                <Badge variant="secondary">Card {card.cardIndex}</Badge>
                                <Badge>{card.cardType}</Badge>
                              </div>
                              <p className="text-sm font-medium">{card.title}</p>
                              <p className="text-xs text-muted-foreground">
                                AnchorText: "{card.anchorText}"
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveCard(card.sectionIndex, card.cardIndex)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Botão Criar Lição */}
                {experienceCards.length > 0 && (
                  <Button
                    onClick={handleCreateLesson}
                    disabled={isSaving || experienceCards.length === 0}
                    className="w-full"
                    size="lg"
                    variant="default"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {generatingProgress || (isSaving ? 'Salvando...' : `Criar Lição V5 com ${experienceCards.length} Cards`)}
                  </Button>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* SUMÁRIO LATERAL */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>📊 Resumo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Seções:</span>
                  <Badge variant="outline">{sections.length}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Cards Configurados:</span>
                  <Badge>{experienceCards.length}</Badge>
                </div>
                <Separator className="my-2" />
                <p className="text-xs text-muted-foreground">
                  Cada seção pode ter até 3 cards ancorados em trechos do markdown.
                </p>
              </CardContent>
            </Card>

            {/* BARRA DE PROGRESSO VISUAL */}
            {generatingProgress && (
              <Card className="border-primary/50 bg-primary/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full"
                    />
                    Salvando...
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-primary to-accent"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 1.5, ease: "easeInOut" }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {generatingProgress}
                  </p>
                </CardContent>
              </Card>
            )}

            {parsedLesson && (
              <Card>
                <CardHeader>
                  <CardTitle>📄 Lição</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p><strong>Título:</strong> {parsedLesson.title}</p>
                    <p><strong>Modelo:</strong> V5</p>
                    <p><strong>Seções:</strong> {sections.length}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* MODAL DE PREVIEW */}
        <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Preview dos Experience Cards
              </DialogTitle>
              <DialogDescription>
                Veja como o(s) card(s) vai(ão) aparecer na lição. Confira os detalhes antes de adicionar.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-8 py-6">
              {previewCards.map((card, idx) => (
                <div key={idx} className="space-y-4">
                  {/* Header com badges */}
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Seção {card.sectionIndex}</Badge>
                    <Badge variant="secondary">Card {card.cardIndex}</Badge>
                    <Badge>{card.cardType}</Badge>
                  </div>

                  {/* Info resumida */}
                  <div className="p-3 bg-muted/30 rounded-lg text-xs space-y-1">
                    <p><strong>AnchorText:</strong> "{card.anchorText}"</p>
                    {card.effectDescription && <p><strong>Efeito:</strong> {card.effectDescription}</p>}
                  </div>

                  {/* 🎬 PREVIEW: Cinematográfico ou Texto */}
                  <div className="rounded-xl overflow-hidden bg-slate-900 p-4">
                    <p className="text-xs text-slate-400 mb-3 text-center">
                      {isValidCardEffectType(card.cardType)
                        ? '🎬 Preview Cinematográfico - animação em tempo real'
                        : '✨ Preview - exatamente como aparecerá na aula'
                      }
                    </p>
                    {isValidCardEffectType(card.cardType) ? (
                      <DynamicCardEffect type={card.cardType} isActive={true} />
                    ) : (
                      <DynamicExperienceCard
                        type={card.cardType}
                        title={card.title}
                        subtitle={card.subtitle}
                        icon={card.icon || 'sparkles'}
                        colorScheme={card.colorScheme || 'purple'}
                        chapters={card.chapters || []}
                        effectDescription={card.effectDescription}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={handleCancelPreview}>
                Cancelar
              </Button>
              <Button onClick={handleConfirmCards} className="gap-2">
                <Plus className="w-4 h-4" />
                Confirmar e Adicionar {previewCards.length} Card(s)
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
