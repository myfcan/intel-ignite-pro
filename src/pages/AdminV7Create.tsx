// src/pages/AdminV7Create.tsx
// Admin page for creating and editing V7 Cinematic Lessons

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Film, Sparkles, Save, Play, Loader2, RefreshCw, Trash2, Edit } from 'lucide-react';
import { V7PipelineInput } from '@/types/v7-cinematic.types';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useV7LessonEditor } from '@/hooks/useV7LessonEditor';
import { AI_CATEGORIES, DIFFICULTY_LABELS } from '@/constants/ai-categories';

export default function AdminV7Create() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editLessonId = searchParams.get('edit');
  const { toast } = useToast();

  // Use the lesson editor hook for editing existing lessons
  const {
    isLoading: isLoadingLesson,
    isEditing,
    lesson: existingLesson,
    formData: loadedFormData,
    hasChanges,
    updateFormData,
    regenerateLesson,
    setLessonStatus,
    deleteLesson,
  } = useV7LessonEditor({ lessonId: editLessonId || undefined });

  // ============================================================================
  // STATE
  // ============================================================================

  const [formData, setFormData] = useState<Partial<V7PipelineInput>>({
    title: '',
    subtitle: '',
    difficulty: 'beginner',
    category: 'prompts',
    tags: [],
    learningObjectives: [],
    narrativeScript: '',
    duration: 300, // 5 minutes default
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLesson, setGeneratedLesson] = useState<any>(null);

  // Sync form data when editing
  useEffect(() => {
    if (loadedFormData) {
      setFormData(loadedFormData);
    }
  }, [loadedFormData]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleInputChange = (field: keyof V7PipelineInput, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (isEditing) {
      updateFormData({ [field]: value });
    }
  };

  const handleGenerateLesson = async () => {
    // Validate form
    if (!formData.title || !formData.narrativeScript) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha pelo menos o título e o roteiro narrativo',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Call V7 Pipeline Edge Function
      const { data, error } = await supabase.functions.invoke('v7-pipeline', {
        body: {
          title: formData.title,
          subtitle: formData.subtitle || '',
          difficulty: formData.difficulty || 'beginner',
          category: formData.category || 'prompts',
          tags: formData.tags || [],
          learningObjectives: formData.learningObjectives || [],
          narrativeScript: formData.narrativeScript,
          duration: formData.duration || 300,
        },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Pipeline failed');

      toast({
        title: '✨ Lição V7 gerada com sucesso!',
        description: `${data.stats.actCount} atos criados, ${data.stats.interactivePoints} pontos interativos`,
      });

      // Store generated lesson data
      setGeneratedLesson({
        id: data.lessonId || `v7-preview-${Date.now()}`,
        title: formData.title,
        model: 'v7-cinematic',
        content: data.content,
        stats: data.stats,
      });
    } catch (error: any) {
      console.error('[AdminV7Create] Pipeline error:', error);
      toast({
        title: 'Erro ao gerar lição',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerateLesson = async () => {
    if (!isEditing || !editLessonId) return;

    setIsGenerating(true);
    try {
      await regenerateLesson(formData);
      toast({
        title: '✨ Lição regenerada!',
        description: 'A lição foi atualizada com o novo conteúdo',
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao regenerar',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePreview = () => {
    if (isEditing && editLessonId) {
      navigate(`/admin/v7/preview/${editLessonId}`);
    } else if (generatedLesson) {
      navigate(`/admin/v7/preview/${generatedLesson.id}`);
    }
  };

  const handleSave = async () => {
    try {
      if (isEditing && editLessonId) {
        // Activate existing lesson
        await setLessonStatus(true, 'published');
        navigate('/admin');
      } else if (generatedLesson) {
        // Activate newly generated lesson
        if (generatedLesson.id && !generatedLesson.id.startsWith('v7-preview-')) {
          const { error } = await supabase
            .from('lessons')
            .update({ is_active: true, status: 'published' })
            .eq('id', generatedLesson.id);

          if (error) throw error;

          toast({
            title: '💾 Lição publicada!',
            description: 'A lição V7 foi ativada e está disponível',
          });
        } else {
          toast({
            title: '💾 Lição salva!',
            description: 'A lição V7 foi salva como rascunho',
          });
        }

        navigate('/admin');
      }
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!editLessonId) return;

    const success = await deleteLesson();
    if (success) {
      navigate('/admin');
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  if (isLoadingLesson) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-cyan-500 mx-auto" />
          <p className="text-muted-foreground">Carregando lição...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        <Button variant="ghost" onClick={() => navigate('/admin')} className="mb-2 sm:mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar ao Admin
        </Button>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2 sm:gap-3">
            <Film className="w-8 h-8 sm:w-10 sm:h-10 text-cyan-500" />
            {isEditing ? 'Editar Lição V7' : 'Criar Lição V7 Cinematic'}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {isEditing
              ? 'Atualize o conteúdo e regenere a lição se necessário'
              : 'Sistema de nova geração para experiências imersivas de aprendizado'}
          </p>
        </div>

        {isEditing && (
          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Edit className="w-4 h-4" />
                Modo Edição
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>Você está editando a lição: <strong>{existingLesson?.title}</strong></p>
              <p className="mt-1">
                Para atualizar o conteúdo, modifique o roteiro e clique em "Regenerar Lição".
              </p>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Informações</TabsTrigger>
            <TabsTrigger value="narrative">Roteiro</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            {/* Main Form */}
            <Card className="border-2 border-cyan-500/20">
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
                <CardDescription>
                  Configure os dados principais da lição cinematográfica
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Título da Lição *</Label>
                  <Input
                    id="title"
                    placeholder="Ex: Dominando Prompts com ChatGPT"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                  />
                </div>

                {/* Subtitle */}
                <div className="space-y-2">
                  <Label htmlFor="subtitle">Subtítulo</Label>
                  <Input
                    id="subtitle"
                    placeholder="Uma jornada cinematográfica pelo mundo da IA"
                    value={formData.subtitle}
                    onChange={(e) => handleInputChange('subtitle', e.target.value)}
                  />
                </div>

                {/* Difficulty and Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="difficulty">Dificuldade</Label>
                    <Select
                      value={formData.difficulty}
                      onValueChange={(value) => handleInputChange('difficulty', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">{DIFFICULTY_LABELS.beginner}</SelectItem>
                        <SelectItem value="intermediate">{DIFFICULTY_LABELS.intermediate}</SelectItem>
                        <SelectItem value="advanced">{DIFFICULTY_LABELS.advanced}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Ferramenta/Tópico de IA</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => handleInputChange('category', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {AI_CATEGORIES.map((group) => (
                          <SelectGroup key={group.group}>
                            <SelectLabel>{group.group}</SelectLabel>
                            {group.items.map((item) => (
                              <SelectItem key={item.value} value={item.value}>
                                {item.label}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Duration */}
                <div className="space-y-2">
                  <Label htmlFor="duration">Duração Estimada (segundos)</Label>
                  <Input
                    id="duration"
                    type="number"
                    placeholder="300"
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Aproximadamente {Math.floor((formData.duration || 0) / 60)} minutos
                  </p>
                </div>

                {/* Learning Objectives */}
                <div className="space-y-2">
                  <Label htmlFor="objectives">Objetivos de Aprendizado</Label>
                  <Textarea
                    id="objectives"
                    placeholder="Digite um objetivo por linha:&#10;- Dominar técnicas de prompt&#10;- Usar ChatGPT de forma avançada&#10;- Automatizar tarefas com IA"
                    rows={4}
                    value={formData.learningObjectives?.join('\n')}
                    onChange={(e) => {
                      const objectives = e.target.value.split('\n').filter((o) => o.trim());
                      handleInputChange('learningObjectives', objectives);
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="narrative">
            {/* Narrative Script */}
            <Card className="border-2 border-purple-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  Roteiro Narrativo
                </CardTitle>
                <CardDescription>
                  Escreva o roteiro completo da narração. A IA irá processar e criar os atos
                  cinematográficos automaticamente.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Escreva o roteiro narrativo completo aqui...&#10;&#10;Exemplo:&#10;Bem-vindo à jornada pelo mundo da Inteligência Artificial. Hoje, vamos explorar como criar prompts eficazes que transformam suas interações com o ChatGPT...&#10;&#10;[Continue com o roteiro completo, incluindo pontos de interação e desafios]"
                  rows={15}
                  value={formData.narrativeScript}
                  onChange={(e) => handleInputChange('narrativeScript', e.target.value)}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {formData.narrativeScript?.length || 0} caracteres
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 sm:gap-4">
          {isEditing ? (
            <>
              <Button
                onClick={handleRegenerateLesson}
                disabled={isGenerating || !hasChanges}
                className="flex-1 sm:flex-none bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Regenerando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2" />
                    Regenerar Lição
                  </>
                )}
              </Button>

              <Button onClick={handlePreview} variant="outline" size="lg">
                <Play className="w-5 h-5 mr-2" />
                Preview
              </Button>

              <Button onClick={handleSave} variant="default" size="lg">
                <Save className="w-5 h-5 mr-2" />
                Salvar
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="lg">
                    <Trash2 className="w-5 h-5 mr-2" />
                    Excluir
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Excluir lição?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação não pode ser desfeita. A lição será permanentemente removida.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          ) : (
            <>
              <Button
                onClick={handleGenerateLesson}
                disabled={isGenerating || !formData.title || !formData.narrativeScript}
                className="flex-1 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                    Gerando Lição V7...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Gerar Lição V7
                  </>
                )}
              </Button>

              {generatedLesson && (
                <>
                  <Button onClick={handlePreview} variant="outline" size="lg">
                    <Play className="w-5 h-5 mr-2" />
                    Preview
                  </Button>

                  <Button onClick={handleSave} variant="default" size="lg">
                    <Save className="w-5 h-5 mr-2" />
                    Salvar
                  </Button>
                </>
              )}
            </>
          )}
        </div>

        {/* Info Card */}
        <Card className="bg-blue-500/5 border-blue-500/20">
          <CardHeader>
            <CardTitle className="text-sm">ℹ️ Como funciona o V7 Cinematic</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p>
              1. <strong>Roteiro Narrativo</strong>: A IA analisa seu roteiro e divide em atos
              cinematográficos
            </p>
            <p>
              2. <strong>Geração de Atos</strong>: Cada ato recebe animações, transições e
              sincronização de áudio
            </p>
            <p>
              3. <strong>Playground Comparativo</strong>: Código amateur vs professional é
              gerado automaticamente
            </p>
            <p>
              4. <strong>Interações</strong>: Pontos de interação são inseridos
              estrategicamente
            </p>
            <p>
              5. <strong>Gamificação</strong>: XP, achievements e scoring são configurados
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
