import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Wand2, Eye, Save, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { IaBookExperienceCard } from '@/components/lessons/IaBookExperienceCard';

interface Lesson {
  id: string;
  title: string;
  model: string;
  content: any;
  trail_id: string;
}

type CardType = 'ia-book' | 'ia-image-generator' | 'ia-chat-simulator';

interface ExperienceCardConfig {
  type: CardType;
  sectionIndex: number;
  props?: Record<string, any>;
}

export default function AdminV5CardConfig() {
  const navigate = useNavigate();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [selectedSection, setSelectedSection] = useState<number>(0);
  const [selectedCardType, setSelectedCardType] = useState<CardType>('ia-book');
  const [isSaving, setIsSaving] = useState(false);
  const [previewConfig, setPreviewConfig] = useState<ExperienceCardConfig | null>(null);

  // Carregar lições V5 ou V4 (que podem ser convertidas para V5)
  useEffect(() => {
    loadLessons();
  }, []);

  const loadLessons = async () => {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('id, title, model, content, trail_id')
        .in('model', ['v4', 'v5'])
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setLessons(data || []);
      console.log('📚 [V5-CONFIG] Lições carregadas:', data?.length);
    } catch (error) {
      console.error('❌ [V5-CONFIG] Erro ao carregar lições:', error);
      toast({
        title: "Erro ao carregar lições",
        description: "Não foi possível carregar a lista de lições.",
        variant: "destructive",
      });
    }
  };

  const handleLessonSelect = (lessonId: string) => {
    const lesson = lessons.find(l => l.id === lessonId);
    setSelectedLesson(lesson || null);
    setSelectedSection(0);
    setPreviewConfig(null);
  };

  const getSections = () => {
    if (!selectedLesson?.content?.sections) return [];
    return selectedLesson.content.sections;
  };

  const generatePreview = () => {
    if (!selectedLesson) return;

    const config: ExperienceCardConfig = {
      type: selectedCardType,
      sectionIndex: selectedSection,
      props: selectedCardType === 'ia-book' ? {} : undefined,
    };

    setPreviewConfig(config);
    console.log('🎨 [V5-CONFIG] Preview gerado:', config);
  };

  const renderCardPreview = () => {
    if (!previewConfig) return null;

    switch (previewConfig.type) {
      case 'ia-book':
        return <IaBookExperienceCard key="preview" />;
      
      case 'ia-image-generator':
        return (
          <div className="p-8 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-200 text-center">
            <Sparkles className="w-12 h-12 mx-auto mb-4 text-purple-600" />
            <p className="text-lg font-semibold text-purple-900">IaImageGeneratorCard</p>
            <p className="text-sm text-purple-600 mt-2">Card ainda não implementado</p>
          </div>
        );
      
      case 'ia-chat-simulator':
        return (
          <div className="p-8 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border-2 border-blue-200 text-center">
            <Sparkles className="w-12 h-12 mx-auto mb-4 text-blue-600" />
            <p className="text-lg font-semibold text-blue-900">IaChatSimulatorCard</p>
            <p className="text-sm text-blue-600 mt-2">Card ainda não implementado</p>
          </div>
        );
      
      default:
        return null;
    }
  };

  const saveConfiguration = async () => {
    if (!selectedLesson || !previewConfig) {
      toast({
        title: "Configuração incompleta",
        description: "Selecione uma lição, seção e gere o preview antes de salvar.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      // Buscar conteúdo atual da lição
      const { data: lessonData, error: fetchError } = await supabase
        .from('lessons')
        .select('content, model')
        .eq('id', selectedLesson.id)
        .single();

      if (fetchError) throw fetchError;

      const currentContent = (lessonData.content || {}) as any;
      const experienceCards = currentContent.experienceCards || [];

      // Verificar se já existe um card nesta seção
      const existingIndex = experienceCards.findIndex(
        (card: any) => card.sectionIndex === previewConfig.sectionIndex
      );

      if (existingIndex >= 0) {
        // Substituir card existente
        experienceCards[existingIndex] = previewConfig;
        console.log('🔄 [V5-CONFIG] Card existente atualizado na seção', previewConfig.sectionIndex);
      } else {
        // Adicionar novo card
        experienceCards.push(previewConfig);
        console.log('✨ [V5-CONFIG] Novo card adicionado na seção', previewConfig.sectionIndex);
      }

      // Atualizar conteúdo com experienceCards e garantir que model seja v5
      const updatedContent = {
        ...currentContent,
        experienceCards,
      };

      const { error: updateError } = await supabase
        .from('lessons')
        .update({
          content: updatedContent,
          model: 'v5', // Forçar modelo V5
        })
        .eq('id', selectedLesson.id);

      if (updateError) throw updateError;

      toast({
        title: "✅ Configuração salva!",
        description: `Experience card "${previewConfig.type}" adicionado à seção ${previewConfig.sectionIndex + 1}.`,
      });

      // Recarregar lições
      await loadLessons();
      
      // Atualizar lição selecionada
      const updatedLesson = lessons.find(l => l.id === selectedLesson.id);
      if (updatedLesson) {
        setSelectedLesson({ ...updatedLesson, content: updatedContent, model: 'v5' });
      }

    } catch (error) {
      console.error('❌ [V5-CONFIG] Erro ao salvar:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar a configuração. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getExistingCards = () => {
    if (!selectedLesson?.content) return [];
    const content = selectedLesson.content as any;
    if (!content.experienceCards) return [];
    return content.experienceCards as ExperienceCardConfig[];
  };

  const removeCard = async (sectionIndex: number) => {
    if (!selectedLesson) return;

    try {
      const currentContent = (selectedLesson.content || {}) as any;
      const experienceCards = (currentContent.experienceCards || []).filter(
        (card: any) => card.sectionIndex !== sectionIndex
      );

      const updatedContent = {
        ...currentContent,
        experienceCards,
      };

      const { error: updateError } = await supabase
        .from('lessons')
        .update({ content: updatedContent })
        .eq('id', selectedLesson.id);

      if (updateError) throw updateError;

      toast({
        title: "Card removido",
        description: `Experience card removido da seção ${sectionIndex + 1}.`,
      });

      await loadLessons();
      const updatedLesson = lessons.find(l => l.id === selectedLesson.id);
      if (updatedLesson) {
        setSelectedLesson({ ...updatedLesson, content: updatedContent });
      }

    } catch (error) {
      console.error('❌ [V5-CONFIG] Erro ao remover:', error);
      toast({
        title: "Erro ao remover",
        description: "Não foi possível remover o card.",
        variant: "destructive",
      });
    }
  };

  const sections = getSections();
  const existingCards = getExistingCards();

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
              Configurador V5 - Experience Cards
            </h1>
            <p className="text-muted-foreground">
              Adicione cards interativos animados nas seções das aulas V5
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Painel de Configuração */}
          <div className="space-y-6">
            {/* Card de Seleção */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="w-5 h-5" />
                  Configuração
                </CardTitle>
                <CardDescription>
                  Selecione a aula, seção e tipo de card
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Seleção de Lição */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Lição</label>
                  <Select onValueChange={handleLessonSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma lição..." />
                    </SelectTrigger>
                    <SelectContent>
                      {lessons.map((lesson) => (
                        <SelectItem key={lesson.id} value={lesson.id}>
                          {lesson.title} <Badge variant="outline" className="ml-2">{lesson.model}</Badge>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Seleção de Seção */}
                {selectedLesson && sections.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Seção</label>
                    <Select
                      value={selectedSection.toString()}
                      onValueChange={(value) => setSelectedSection(parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {sections.map((section: any, idx: number) => {
                          const hasCard = existingCards.some(c => c.sectionIndex === idx);
                          return (
                            <SelectItem key={idx} value={idx.toString()}>
                              Seção {idx + 1}: {section.title || section.id}
                              {hasCard && <Badge variant="secondary" className="ml-2">Com card</Badge>}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Seleção de Tipo de Card */}
                {selectedLesson && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tipo de Card</label>
                    <Select
                      value={selectedCardType}
                      onValueChange={(value) => setSelectedCardType(value as CardType)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ia-book">
                          📚 IaBookExperienceCard
                        </SelectItem>
                        <SelectItem value="ia-image-generator" disabled>
                          🎨 IaImageGeneratorCard (em breve)
                        </SelectItem>
                        <SelectItem value="ia-chat-simulator" disabled>
                          💬 IaChatSimulatorCard (em breve)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Botão de Preview */}
                {selectedLesson && (
                  <div className="pt-2">
                    <Button
                      onClick={generatePreview}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                      size="lg"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Gerar Preview
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Cards Existentes */}
            {selectedLesson && existingCards.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    Cards Configurados
                  </CardTitle>
                  <CardDescription>
                    Experience cards já adicionados nesta lição
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {existingCards.map((card, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border"
                    >
                      <div className="flex-1">
                        <p className="font-medium">Seção {card.sectionIndex + 1}</p>
                        <p className="text-sm text-muted-foreground">{card.type}</p>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeCard(card.sectionIndex)}
                      >
                        Remover
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* JSON Preview */}
            {previewConfig && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    JSON Preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-xs">
                    {JSON.stringify(previewConfig, null, 2)}
                  </pre>
                  
                  <Button
                    onClick={saveConfiguration}
                    disabled={isSaving}
                    className="w-full mt-4 bg-green-600 hover:bg-green-700"
                    size="lg"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? 'Salvando...' : 'Salvar Configuração'}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Painel de Preview */}
          <div className="space-y-6">
            <Card className="min-h-[600px]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Preview do Card
                </CardTitle>
                <CardDescription>
                  Visualização em tempo real do experience card
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!previewConfig ? (
                  <div className="flex flex-col items-center justify-center h-96 text-center space-y-4">
                    <AlertCircle className="w-16 h-16 text-muted-foreground/30" />
                    <div>
                      <p className="text-lg font-medium text-muted-foreground">
                        Nenhum preview gerado
                      </p>
                      <p className="text-sm text-muted-foreground/60 mt-1">
                        Configure uma lição, seção e tipo de card, depois clique em "Gerar Preview"
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm font-medium text-blue-900">
                        📍 Este card aparecerá na Seção {previewConfig.sectionIndex + 1}
                      </p>
                      <p className="text-xs text-blue-700 mt-1">
                        {selectedLesson?.title}
                      </p>
                    </div>
                    
                    <div className="border-2 border-dashed border-muted-foreground/30 rounded-2xl p-6">
                      {renderCardPreview()}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
