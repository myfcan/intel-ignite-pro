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
import { ArrowLeft, Plus, Trash2, Save, Wand2, Eye, Download, Book, Brain, Sparkles, Zap, Star, Rocket, Target, Lightbulb, Trophy, Heart, Crown, Flame } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DynamicExperienceCard } from '@/components/lessons/DynamicExperienceCard';
import { DynamicCardEffect, CARD_EFFECT_TYPES, CARD_EFFECT_LABELS, CARD_EFFECT_DESCRIPTIONS, isValidCardEffectType } from '@/components/lessons/card-effects';

// 🎬 Tipos de Card Effects Cinematográficos
const CINEMATOGRAPHIC_CARD_TYPES = CARD_EFFECT_TYPES.map(type => ({
  value: type,
  label: CARD_EFFECT_LABELS[type] || type,
  isCinematic: true
}));

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
  const [cardsQuantity, setCardsQuantity] = useState<1 | 2>(1);
  // LocalStorage keys
  const CARD1_STORAGE_KEY = 'v5-card-config-card1';
  const CARD2_STORAGE_KEY = 'v5-card-config-card2';

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

  // Auto-save card1 no localStorage
  useEffect(() => {
    localStorage.setItem(CARD1_STORAGE_KEY, JSON.stringify(card1));
  }, [card1]);

  // Auto-save card2 no localStorage
  useEffect(() => {
    localStorage.setItem(CARD2_STORAGE_KEY, JSON.stringify(card2));
  }, [card2]);

  // Estado do preview modal
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewCards, setPreviewCards] = useState<ExperienceCard[]>([]);

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

      setParsedLesson(parsed);
      setSections(sections);
      
      toast({
        title: "✅ JSON analisado!",
        description: `Detectadas ${sections.length} seções na lição "${parsed.title}"`,
      });
      
      console.log('📊 [V5-CONFIG] JSON analisado:', {
        title: parsed.title,
        sectionsCount: sections.length,
        model: parsed.model,
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

    // Se quantidade for 2, validar e adicionar Card 2
    if (cardsQuantity === 2) {
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
    localStorage.removeItem(CARD1_STORAGE_KEY);
    localStorage.removeItem(CARD2_STORAGE_KEY);

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
    localStorage.removeItem(CARD1_STORAGE_KEY);
    localStorage.removeItem(CARD2_STORAGE_KEY);
    
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
                    <CardTitle>📋 Cole o JSON da Lição</CardTitle>
                    <CardDescription>
                      JSON completo da lição V5 (gerado pelo pipeline)
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      value={lessonJson}
                      onChange={(e) => setLessonJson(e.target.value)}
                      placeholder='{"title": "...", "trackId": "...", "sections": [...]}'
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

                    {parsedLesson && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="font-semibold text-green-900">{parsedLesson.title}</p>
                        <p className="text-sm text-green-700">
                          {sections.length} seções detectadas
                        </p>
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
                      Cada seção pode ter até 2 cards. Use anchorText do markdown como gatilho.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Seleção de Seção */}
                    <div className="space-y-2">
                      <Label>1. Selecione a Seção</Label>
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
                          onValueChange={(val) => setCardsQuantity(parseInt(val) as 1 | 2)}
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
                                {CINEMATOGRAPHIC_CARD_TYPES.map(({ value, label }) => (
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
                        {cardsQuantity === 2 && (
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
                                  {CINEMATOGRAPHIC_CARD_TYPES.map(({ value, label }) => (
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
                  Cada seção pode ter até 2 cards ancorados em trechos do markdown.
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
                      <DynamicCardEffect type={card.cardType} />
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
