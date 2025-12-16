// src/pages/AdminV7Create.tsx
// Admin page for creating and editing V7 Cinematic Lessons
// Supports two creation methods: JSON paste or Form-based

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
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Film, Sparkles, Save, Play, Loader2, RefreshCw, Trash2, Edit, FileJson, FormInput, Send, CheckCircle2, AlertCircle } from 'lucide-react';
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

  const [creationMethod, setCreationMethod] = useState<'json' | 'form'>('json');
  
  // JSON method state
  const [jsonInput, setJsonInput] = useState('');
  const [jsonValidation, setJsonValidation] = useState<{
    isValid: boolean;
    error?: string;
    data?: any;
    stats?: { 
      sections: number; 
      duration: number;
      actCount?: number;
      narrationCount?: number;
      hasCinematicFlow?: boolean;
    };
  }>({ isValid: false });

  // Form method state
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
  // JSON VALIDATION
  // ============================================================================

  const validateJson = (input: string) => {
    if (!input.trim()) {
      setJsonValidation({ isValid: false });
      return;
    }

    try {
      const parsed = JSON.parse(input);
      
      // Validate required fields
      if (!parsed.title) {
        setJsonValidation({ isValid: false, error: 'Campo "title" é obrigatório' });
        return;
      }
      
      // Accept cinematic_flow.acts OR narrativeScript OR sections
      const hasCinematicFlow = parsed.cinematic_flow?.acts?.length > 0;
      const hasNarrativeScript = !!parsed.narrativeScript;
      const hasSections = parsed.sections?.length > 0;
      
      if (!hasCinematicFlow && !hasNarrativeScript && !hasSections) {
        setJsonValidation({ 
          isValid: false, 
          error: 'Campo "cinematic_flow.acts", "narrativeScript" ou "sections" é obrigatório' 
        });
        return;
      }

      // Calculate stats
      const actCount = parsed.cinematic_flow?.acts?.length || 0;
      const sections = parsed.sections?.length || 0;
      const duration = parsed.duration || 300;

      // Extract narration count for cinematic_flow
      let narrationCount = 0;
      if (hasCinematicFlow) {
        narrationCount = parsed.cinematic_flow.acts.filter(
          (act: any) => act.audio?.narration
        ).length;
      }

      setJsonValidation({
        isValid: true,
        data: parsed,
        stats: { 
          sections: actCount || sections, 
          duration,
          actCount,
          narrationCount,
          hasCinematicFlow,
        }
      });
    } catch (e: any) {
      setJsonValidation({ isValid: false, error: `JSON inválido: ${e.message}` });
    }
  };

  useEffect(() => {
    validateJson(jsonInput);
  }, [jsonInput]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleInputChange = (field: keyof V7PipelineInput, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (isEditing) {
      updateFormData({ [field]: value });
    }
  };

  const handleGenerateFromJson = async () => {
    if (!jsonValidation.isValid || !jsonValidation.data) {
      toast({
        title: 'JSON inválido',
        description: 'Corrija os erros no JSON antes de enviar',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);

    try {
      const payload = jsonValidation.data;
      
      // Call V7 Pipeline Edge Function
      const { data, error } = await supabase.functions.invoke('v7-pipeline', {
        body: {
          title: payload.title,
          subtitle: payload.subtitle || '',
          difficulty: payload.difficulty || 'beginner',
          category: payload.category || 'prompts',
          tags: payload.tags || [],
          learningObjectives: payload.learningObjectives || [],
          narrativeScript: payload.narrativeScript || '',
          sections: payload.sections,
          duration: payload.duration || 300,
          // Support for cinematic_flow.acts structure
          cinematic_flow: payload.cinematic_flow,
        },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Pipeline failed');

      toast({
        title: '✨ Lição V7 gerada com sucesso!',
        description: `${data.stats?.actCount || 0} atos criados`,
      });

      setGeneratedLesson({
        id: data.lessonId,
        title: payload.title,
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

  const handleGenerateFromForm = async () => {
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
        description: `${data.stats?.actCount || 0} atos criados, ${data.stats?.interactivePoints || 0} pontos interativos`,
      });

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
      navigate(`/admin/v7/play/${editLessonId}`);
    } else if (generatedLesson?.id) {
      navigate(`/admin/v7/play/${generatedLesson.id}`);
    }
  };

  const handleSave = async () => {
    try {
      if (isEditing && editLessonId) {
        await setLessonStatus(true, 'pronta');
        navigate('/admin');
      } else if (generatedLesson) {
        if (generatedLesson.id && !generatedLesson.id.startsWith('v7-preview-')) {
          const { error } = await supabase
            .from('lessons')
            .update({ is_active: true, status: 'pronta' })
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

        {/* Generated Lesson Success */}
        {generatedLesson && (
          <Card className="border-green-500/30 bg-green-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-green-600">
                <CheckCircle2 className="w-4 h-4" />
                Lição Gerada com Sucesso!
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <p><strong>{generatedLesson.title}</strong></p>
              {generatedLesson.stats && (
                <div className="flex gap-2 mt-2">
                  <Badge variant="secondary">{generatedLesson.stats.actCount} atos</Badge>
                  <Badge variant="secondary">{generatedLesson.stats.interactivePoints || 0} interações</Badge>
                </div>
              )}
              <div className="flex gap-2 mt-3">
                <Button size="sm" onClick={handlePreview}>
                  <Play className="w-4 h-4 mr-1" />
                  Preview
                </Button>
                <Button size="sm" variant="default" onClick={handleSave}>
                  <Save className="w-4 h-4 mr-1" />
                  Publicar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Creation Method Tabs */}
        {!isEditing && (
          <Tabs value={creationMethod} onValueChange={(v) => setCreationMethod(v as 'json' | 'form')} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="json" className="flex items-center gap-2">
                <FileJson className="w-4 h-4" />
                Colar JSON
              </TabsTrigger>
              <TabsTrigger value="form" className="flex items-center gap-2">
                <FormInput className="w-4 h-4" />
                Formulário
              </TabsTrigger>
            </TabsList>

            {/* JSON Method */}
            <TabsContent value="json" className="space-y-4">
              <Card className="border-2 border-cyan-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileJson className="w-5 h-5 text-cyan-500" />
                    JSON da Lição V7
                  </CardTitle>
                  <CardDescription>
                    Cole o JSON completo da lição. Deve conter pelo menos "title" e "narrativeScript" ou "sections".
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder={`{
  "title": "Nome da Lição",
  "subtitle": "Subtítulo opcional",
  "difficulty": "beginner",
  "category": "chatgpt",
  "narrativeScript": "Roteiro completo da narração...",
  "duration": 300
}`}
                    rows={15}
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                    className="font-mono text-sm"
                  />
                  
                  {/* Validation Feedback */}
                  {jsonInput && (
                    <div className={`p-3 rounded-lg ${jsonValidation.isValid ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
                      {jsonValidation.isValid ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle2 className="w-4 h-4" />
                            <span className="text-sm">JSON válido</span>
                          </div>
                          {jsonValidation.stats && (
                            <div className="flex flex-wrap gap-2">
                              {jsonValidation.stats.hasCinematicFlow ? (
                                <>
                                  <Badge variant="default" className="bg-cyan-600">{jsonValidation.stats.actCount} atos cinematográficos</Badge>
                                  <Badge variant="outline">{jsonValidation.stats.narrationCount} narrações</Badge>
                                </>
                              ) : (
                                <Badge variant="outline">{jsonValidation.stats.sections} seções</Badge>
                              )}
                              <Badge variant="outline">{Math.floor(jsonValidation.stats.duration / 60)}min</Badge>
                            </div>
                          )}
                          {jsonValidation.stats?.hasCinematicFlow && (
                            <p className="text-xs text-muted-foreground">
                              ✓ Estrutura cinematic_flow detectada - visual.instruction e audio.narration serão processados separadamente
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-red-600">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-sm">{jsonValidation.error}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <Button
                    onClick={handleGenerateFromJson}
                    disabled={isGenerating || !jsonValidation.isValid}
                    className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
                    size="lg"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Processando Pipeline...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Enviar para Pipeline V7
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Form Method */}
            <TabsContent value="form" className="space-y-4">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="basic">Informações</TabsTrigger>
                  <TabsTrigger value="narrative">Roteiro</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
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

              <Button
                onClick={handleGenerateFromForm}
                disabled={isGenerating || !formData.title || !formData.narrativeScript}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Gerando Lição V7...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Gerar Lição V7 Cinematic
                  </>
                )}
              </Button>
            </TabsContent>
          </Tabs>
        )}

        {/* Editing Mode Actions */}
        {isEditing && (
          <>
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic">Informações</TabsTrigger>
                <TabsTrigger value="narrative">Roteiro</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <Card className="border-2 border-cyan-500/20">
                  <CardHeader>
                    <CardTitle>Informações Básicas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Título da Lição *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subtitle">Subtítulo</Label>
                      <Input
                        id="subtitle"
                        value={formData.subtitle}
                        onChange={(e) => handleInputChange('subtitle', e.target.value)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="narrative">
                <Card className="border-2 border-purple-500/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-500" />
                      Roteiro Narrativo
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      rows={15}
                      value={formData.narrativeScript}
                      onChange={(e) => handleInputChange('narrativeScript', e.target.value)}
                      className="font-mono text-sm"
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="flex flex-wrap gap-3 sm:gap-4">
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
            </div>
          </>
        )}

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
