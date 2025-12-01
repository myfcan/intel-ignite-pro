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
import { ArrowLeft, Plus, Trash2, Save, Wand2, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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
    if (!card1.cardType || !card1.anchorText || !card1.title) {
      toast({
        title: "❌ Erro no Card 1",
        description: "CardType, AnchorText e Título são obrigatórios",
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
      if (!card2.cardType || !card2.anchorText || !card2.title) {
        toast({
          title: "❌ Erro no Card 2",
          description: "CardType, AnchorText e Título são obrigatórios para o Card 2",
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
    setGeneratingProgress("Gerando componentes dos card effects com IA...");

    try {
      // PASSO 1: Gerar componentes React via IA
      console.log('🎨 [V5-CONFIG] Calling generate-card-effects edge function...');
      
      const { data: generatedData, error: generateError } = await supabase.functions.invoke(
        'generate-card-effects',
        {
          body: { cards: experienceCards }
        }
      );

      if (generateError) {
        console.error('❌ [V5-CONFIG] Error generating cards:', generateError);
        throw new Error(generateError.message || 'Erro ao gerar card effects');
      }

      if (!generatedData.success) {
        throw new Error(generatedData.error || 'Falha ao gerar componentes');
      }

      console.log('✅ [V5-CONFIG] Cards generated successfully:', generatedData.cards.length);
      
      setGeneratingProgress("Componentes gerados! Salvando lição no banco...");

      // PASSO 2: Buscar próximo order_index disponível na trilha
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

      // PASSO 3: Criar execução do PIPELINE (não inserir direto)
      setGeneratingProgress("Criando execução do pipeline...");

      const pipelineInput = {
        title: parsedLesson.title,
        trackId: parsedLesson.trackId,
        trackName: parsedLesson.trackName || "Trilha Desconhecida",
        orderIndex: nextOrderIndex,
        model: 'v5',
        estimatedTime: parsedLesson.estimatedTimeMinutes || 5,
        sections: parsedLesson.sections || parsedLesson.content?.sections,
        exercises: parsedLesson.exercises || [],
        experienceCards: generatedData.cards.map((card: any) => ({
          sectionIndex: card.sectionIndex,
          cardIndex: card.cardIndex,
          cardType: card.cardType,
          anchorText: card.anchorText,
          title: card.title,
          subtitle: card.subtitle,
          icon: card.icon,
          colorScheme: card.colorScheme,
          effectDescription: card.effectDescription,
          chapters: card.chapters,
          componentCode: card.componentCode,
          componentName: card.componentName
        }))
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
        description: `Lição "${parsedLesson.title}" entrando no pipeline com ${generatedData.cards.length} card effects.`,
      });

      console.log('🎉 [V5-CONFIG] Pipeline execution criada:', data);

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
                            <Label>Tipo de Card *</Label>
                            <Input 
                              placeholder='Ex: "ia-digital-employee", "ia-image-gen"'
                              value={card1.cardType}
                              onChange={(e) => setCard1({ ...card1, cardType: e.target.value })}
                            />
                            <p className="text-xs text-muted-foreground">Identificador técnico do card effect</p>
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

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Título *</Label>
                              <Input
                                placeholder="Ex: A I.A. que monta um app"
                                value={card1.title}
                                onChange={(e) => setCard1({ ...card1, title: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Subtítulo</Label>
                              <Input
                                placeholder="Descrição curta"
                                value={card1.subtitle}
                                onChange={(e) => setCard1({ ...card1, subtitle: e.target.value })}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Ícone</Label>
                              <Input
                                placeholder='Ex: 🤖 ou "Bot"'
                                value={card1.icon}
                                onChange={(e) => setCard1({ ...card1, icon: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Cor de Destaque</Label>
                              <Input
                                placeholder="Ex: #837BFF ou purple"
                                value={card1.colorScheme}
                                onChange={(e) => setCard1({ ...card1, colorScheme: e.target.value })}
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Descrição do Efeito Visual</Label>
                            <Textarea
                              placeholder="Ex: pulso marcado no ícone, badge 24/7, animação spring..."
                              value={card1.effectDescription}
                              onChange={(e) => setCard1({ ...card1, effectDescription: e.target.value })}
                              rows={2}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Capítulos / Páginas (opcional)</Label>
                            <Textarea
                              placeholder="Deixe vazio se o card não tiver páginas internas.&#10;&#10;Se tiver conteúdo sequencial:&#10;Linha 1: primeiro texto&#10;Linha 2: segundo texto&#10;Linha 3: terceiro texto"
                              value={card1.chapters?.join('\n')}
                              onChange={(e) => setCard1({ ...card1, chapters: e.target.value.split('\n').filter(l => l.trim()) })}
                              rows={4}
                            />
                            <p className="text-xs text-muted-foreground">
                              Apenas para cards com conteúdo que alterna/transiciona (ex: slides, páginas de livro)
                            </p>
                          </div>
                        </div>

                        {/* Card 2 (condicional) */}
                        {cardsQuantity === 2 && (
                          <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                            <h4 className="font-semibold flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">2</span>
                              Card 2
                            </h4>
                            
                            <div className="space-y-2">
                              <Label>Tipo de Card *</Label>
                              <Input 
                                placeholder='Ex: "ia-digital-employee", "ia-chat-sim"'
                                value={card2.cardType}
                                onChange={(e) => setCard2({ ...card2, cardType: e.target.value })}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>AnchorText (trecho do markdown) *</Label>
                              <Input
                                placeholder='Ex: "outro trecho importante"'
                                value={card2.anchorText}
                                onChange={(e) => setCard2({ ...card2, anchorText: e.target.value })}
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Título *</Label>
                                <Input
                                  placeholder="Ex: Segunda demonstração"
                                  value={card2.title}
                                  onChange={(e) => setCard2({ ...card2, title: e.target.value })}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Subtítulo</Label>
                                <Input
                                  placeholder="Descrição curta"
                                  value={card2.subtitle}
                                  onChange={(e) => setCard2({ ...card2, subtitle: e.target.value })}
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Ícone</Label>
                                <Input
                                  placeholder='Ex: 💡 ou "Lightbulb"'
                                  value={card2.icon}
                                  onChange={(e) => setCard2({ ...card2, icon: e.target.value })}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Cor de Destaque</Label>
                                <Input
                                  placeholder="Ex: #FF6B9D ou pink"
                                  value={card2.colorScheme}
                                  onChange={(e) => setCard2({ ...card2, colorScheme: e.target.value })}
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label>Descrição do Efeito Visual</Label>
                              <Textarea
                                placeholder="Ex: fade-in suave, rotação do ícone..."
                                value={card2.effectDescription}
                                onChange={(e) => setCard2({ ...card2, effectDescription: e.target.value })}
                                rows={2}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Capítulos / Páginas (opcional)</Label>
                              <Textarea
                                placeholder="Deixe vazio se o card não tiver conteúdo interno sequencial"
                                value={card2.chapters?.join('\n')}
                                onChange={(e) => setCard2({ ...card2, chapters: e.target.value.split('\n').filter(l => l.trim()) })}
                                rows={4}
                              />
                              <p className="text-xs text-muted-foreground">
                                Apenas para cards com conteúdo que alterna/transiciona
                              </p>
                            </div>
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
                    Gerando Cards...
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-primary to-accent"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 3, ease: "easeInOut" }}
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

            <div className="space-y-6 py-6">
              {previewCards.map((card, idx) => (
                <div key={idx} className="space-y-3">
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="outline">Seção {card.sectionIndex}</Badge>
                    <Badge variant="secondary">Card {card.cardIndex}</Badge>
                    <Badge>{card.cardType}</Badge>
                  </div>

                  <div className="p-4 bg-muted/30 rounded-lg space-y-2 text-sm">
                    <p><strong>AnchorText:</strong> "{card.anchorText}"</p>
                    <p><strong>Título:</strong> {card.title}</p>
                    <p><strong>Subtítulo:</strong> {card.subtitle || '(vazio)'}</p>
                    <p><strong>Ícone:</strong> {card.icon || '(vazio)'}</p>
                    <p><strong>Cor:</strong> {card.colorScheme || '(vazio)'}</p>
                    <p><strong>Efeito:</strong> {card.effectDescription || '(vazio)'}</p>
                    <p><strong>Capítulos:</strong> {card.chapters?.length || 0} página(s)</p>
                  </div>

                  {/* Placeholder para preview visual */}
                  <div className="border-2 border-dashed border-primary/30 rounded-xl p-6 bg-gradient-to-br from-background to-muted/20">
                    <p className="text-xs text-muted-foreground mb-4 text-center">
                      ℹ️ O componente visual será criado pela IA baseado nessas especificações
                    </p>
                    <div className="text-center text-muted-foreground text-sm space-y-2">
                      <p className="font-semibold text-foreground">{card.title}</p>
                      <p className="text-xs">{card.subtitle}</p>
                      {card.icon && <p className="text-4xl">{card.icon}</p>}
                    </div>
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
