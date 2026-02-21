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
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Film, Sparkles, Save, Play, Loader2, RefreshCw, Trash2, Edit, FileJson, FormInput, Send, CheckCircle2, AlertCircle, Mic, Zap } from 'lucide-react';
import { V7PipelineInput } from '@/types/v7-cinematic.types';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useV7LessonEditor } from '@/hooks/useV7LessonEditor';
import { AI_CATEGORIES, DIFFICULTY_LABELS } from '@/constants/ai-categories';
import { V7PipelineMonitor, PipelineStep, PipelineLog, DEFAULT_V7_PIPELINE_STEPS } from '@/components/admin/V7PipelineMonitor';

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
      pauseKeywordCount?: number; // ✅ V7.1: Track pause keywords
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
  const [useEmotionTags, setUseEmotionTags] = useState(false);

  // Pipeline Monitor State
  const [pipelineSteps, setPipelineSteps] = useState<PipelineStep[]>([]);
  const [pipelineLogs, setPipelineLogs] = useState<PipelineLog[]>([]);
  const [pipelineProgress, setPipelineProgress] = useState(0);
  const [pipelineError, setPipelineError] = useState<string | null>(null);

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
      
      // Accept multiple JSON formats:
      // V7-v3: cinematicFlow.phases (camelCase, new format)
      // V7-v2: cinematic_flow.acts (snake_case, legacy)
      // V7-v1: narrativeScript OR sections
      const hasCinematicFlowV3 = parsed.cinematicFlow?.phases?.length > 0;
      const hasCinematicFlowV2 = parsed.cinematic_flow?.acts?.length > 0;
      const hasNarrativeScript = !!parsed.narrativeScript;
      const hasSections = parsed.sections?.length > 0;
      
      if (!hasCinematicFlowV3 && !hasCinematicFlowV2 && !hasNarrativeScript && !hasSections) {
        setJsonValidation({ 
          isValid: false, 
          error: 'Campo "cinematicFlow.phases", "cinematic_flow.acts", "narrativeScript" ou "sections" é obrigatório' 
        });
        return;
      }

      // Calculate stats based on format detected
      let actCount = 0;
      let narrationCount = 0;
      let pauseKeywordCount = 0;
      let interactiveActsWithoutPauseKeyword: string[] = [];
      const sections = parsed.sections?.length || 0;
      const duration = parsed.duration || 300;

      // V7-v3 format: cinematicFlow.phases
      if (hasCinematicFlowV3) {
        actCount = parsed.cinematicFlow.phases.length;
        
        parsed.cinematicFlow.phases.forEach((phase: any, index: number) => {
          // Count narrations
          if (phase.audio?.narration) {
            narrationCount++;
          }
          
          // Check anchorText for pause phrases
          if (phase.anchorText?.pausePhrase) {
            pauseKeywordCount++;
          } else if (phase.type === 'quiz' || phase.type === 'playground' || phase.type === 'secret-reveal') {
            interactiveActsWithoutPauseKeyword.push(phase.id || `phase-${index + 1}`);
          }
        });
      }
      // V7-v2 format: cinematic_flow.acts
      else if (hasCinematicFlowV2) {
        actCount = parsed.cinematic_flow.acts.length;
        
        narrationCount = parsed.cinematic_flow.acts.filter(
          (act: any) => act.narration || act.content?.audio?.narration
        ).length;

        parsed.cinematic_flow.acts.forEach((act: any, index: number) => {
          if (act.pauseKeyword || act.pauseKeywords?.length > 0) {
            pauseKeywordCount++;
          } else if (act.type === 'interaction' || act.type === 'playground' || act.type === 'quiz') {
            interactiveActsWithoutPauseKeyword.push(act.id || `act-${index + 1}`);
          }
        });
      }

      // ✅ V7.1: Warn if interactive acts don't have pauseKeyword
      let warning: string | undefined;
      if (interactiveActsWithoutPauseKeyword.length > 0) {
        warning = `Atos interativos sem pauseKeyword: ${interactiveActsWithoutPauseKeyword.join(', ')}. O sistema tentará detectar automaticamente.`;
      }

      setJsonValidation({
        isValid: true,
        data: parsed,
        error: warning, // Use error field for warnings too
        stats: {
          sections: actCount || sections,
          duration,
          actCount,
          narrationCount,
          hasCinematicFlow: hasCinematicFlowV3 || hasCinematicFlowV2,
          pauseKeywordCount, // ✅ V7.1: Track pause keywords
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

    // Reset and initialize pipeline monitor
    setIsGenerating(true);
    setPipelineError(null);
    setPipelineProgress(0);
    setPipelineLogs([]);
    setPipelineSteps(DEFAULT_V7_PIPELINE_STEPS.map(s => ({ ...s, status: 'pending' })));

    const addLog = (level: PipelineLog['level'], message: string) => {
      setPipelineLogs(prev => [...prev, { timestamp: new Date(), level, message }]);
    };

    const updateStep = (stepId: string, status: PipelineStep['status'], message?: string) => {
      setPipelineSteps(prev => prev.map(s => 
        s.id === stepId ? { ...s, status, message } : s
      ));
    };

    try {
      const payload = jsonValidation.data;
      
      // Step 1: Validate
      updateStep('validate', 'running');
      addLog('info', 'Iniciando validação do JSON...');
      await new Promise(r => setTimeout(r, 300));
      updateStep('validate', 'completed');
      setPipelineProgress(10);
      addLog('success', 'JSON validado com sucesso');

      // Step 2: Processing acts
      updateStep('process-acts', 'running');
      addLog('info', `Processando ${payload.cinematic_flow?.acts?.length || 0} atos cinematográficos...`);
      setPipelineProgress(20);

      // Step 3: Extract narration
      updateStep('extract-narration', 'running');
      addLog('info', 'Extraindo narrações de audio.narration...');
      setPipelineProgress(30);

      // Step 4: Generate audio (mark as running)
      updateStep('generate-audio', 'running');
      addLog('info', 'Preparando geração de áudio...');
      setPipelineProgress(40);

      // Call V7 Pipeline Edge Function
      addLog('info', 'Enviando para Pipeline V7...');
      const { data, error } = await supabase.functions.invoke('v7-vv', {
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
          cinematic_flow: payload.cinematic_flow,
          cinematicFlow: payload.cinematicFlow,
          useEmotionTags, // ← toggle eleven_v3
        },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Pipeline failed');

      // Update completed steps
      updateStep('process-acts', 'completed', `${data.stats?.actCount || 0} atos`);

      // Show narration source info
      const narrationMsg = data.stats?.narrationCount > 0
        ? `${data.stats.narrationCount} narrações`
        : data.stats?.audioSource === 'narrativeScript'
          ? 'via narrativeScript'
          : '0 narrações';
      updateStep('extract-narration', 'completed', narrationMsg);
      setPipelineProgress(60);

      if (data.stats?.hasAudio) {
        const audioSourceMsg = data.stats?.audioSource === 'narrativeScript'
          ? 'Áudio (narrativeScript)'
          : 'Áudio gerado';
        updateStep('generate-audio', 'completed', audioSourceMsg);
        addLog('success', `Áudio gerado via ElevenLabs (fonte: ${data.stats?.audioSource || 'unknown'})`);
      } else if (data.stats?.audioError) {
        // ✅ V7-v2 FIX: Show audio generation error
        updateStep('generate-audio', 'error', 'Falha no áudio');
        addLog('error', `❌ ERRO: ${data.stats.audioError}`);
        addLog('warning', '⚠️ Lição salva SEM áudio - regenere para adicionar áudio');
        toast({
          title: '⚠️ Áudio não gerado',
          description: 'A lição foi salva, mas sem áudio. Você pode regenerar depois.',
          variant: 'destructive',
        });
      } else {
        updateStep('generate-audio', 'completed', 'Sem áudio');
        addLog('info', 'Geração de áudio pulada (desabilitada ou sem narração)');
      }
      setPipelineProgress(75);

      // Step 5: Build content
      updateStep('build-content', 'running');
      addLog('info', 'Construindo conteúdo final...');
      await new Promise(r => setTimeout(r, 200));
      updateStep('build-content', 'completed');
      setPipelineProgress(85);
      addLog('success', 'Conteúdo construído');

      // Step 6: Save to database
      updateStep('save-database', 'running');
      addLog('info', 'Salvando no banco de dados...');
      await new Promise(r => setTimeout(r, 200));
      updateStep('save-database', 'completed', `ID: ${data.lessonId?.slice(0, 8)}...`);
      setPipelineProgress(100);
      addLog('success', `Lição salva com ID: ${data.lessonId}`);

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
      setPipelineError(error.message);
      addLog('error', `Erro: ${error.message}`);
      
      // Mark current running step as error
      setPipelineSteps(prev => prev.map(s => 
        s.status === 'running' ? { ...s, status: 'error' } : s
      ));
      
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
      const { data, error } = await supabase.functions.invoke('v7-vv', {
        body: {
          title: formData.title,
          subtitle: formData.subtitle || '',
          difficulty: formData.difficulty || 'beginner',
          category: formData.category || 'prompts',
          tags: formData.tags || [],
          learningObjectives: formData.learningObjectives || [],
          narrativeScript: formData.narrativeScript,
          duration: formData.duration || 300,
          useEmotionTags, // ← toggle eleven_v3
        },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Pipeline failed');

      // ✅ V7-v2 FIX: Check for audio generation warnings
      if (data.stats?.audioError) {
        toast({
          title: '⚠️ Lição criada, mas sem áudio',
          description: `Erro: ${data.stats.audioError}. Você pode regenerar o áudio depois.`,
          variant: 'destructive',
        });
      } else {
        toast({
          title: '✨ Lição V7 gerada com sucesso!',
          description: `${data.stats?.actCount || 0} atos criados${data.stats?.hasAudio ? ', com áudio' : ''}`,
        });
      }

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

                  {/* ── Toggle Modelo de Áudio ── */}
                  <div className={`flex items-start gap-4 p-4 rounded-xl border-2 transition-colors ${useEmotionTags ? 'border-violet-400/50 bg-violet-500/5' : 'border-border bg-muted/30'}`}>
                    <Switch
                      id="emotion-tags-json"
                      checked={useEmotionTags}
                      onCheckedChange={setUseEmotionTags}
                      className="mt-0.5 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <label htmlFor="emotion-tags-json" className="text-sm font-semibold cursor-pointer">
                          {useEmotionTags ? '🎭 eleven_v3 — Audio Tags Ativas' : '🔊 eleven_multilingual_v2 — Padrão'}
                        </label>
                        <Badge variant="outline" className={`text-[10px] ${useEmotionTags ? 'border-violet-400 text-violet-600' : 'text-muted-foreground'}`}>
                          {useEmotionTags ? 'v3 alpha' : 'v2 estável'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {useEmotionTags
                          ? 'Preserva tags como [excited], [pause], [whispers] no texto. SSML (<break/>) é ignorado.'
                          : 'Modelo padrão. Tags emocionais [tag] são removidas automaticamente.'}
                      </p>
                      {useEmotionTags && (
                        <button
                          type="button"
                          onClick={() => navigate('/admin/audio-preview')}
                          className="mt-1.5 text-[11px] text-violet-600 underline hover:no-underline"
                        >
                          → Testar tags no sandbox de áudio
                        </button>
                      )}
                    </div>
                    <Mic className={`w-5 h-5 flex-shrink-0 mt-0.5 ${useEmotionTags ? 'text-violet-500' : 'text-muted-foreground'}`} />
                  </div>

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

                  {/* Pipeline Progress Monitor */}
                  <V7PipelineMonitor
                    isRunning={isGenerating}
                    steps={pipelineSteps}
                    logs={pipelineLogs}
                    progress={pipelineProgress}
                    error={pipelineError}
                  />
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

              {/* ── Toggle Modelo de Áudio (Form) ── */}
              <div className={`flex items-start gap-4 p-4 rounded-xl border-2 transition-colors ${useEmotionTags ? 'border-violet-400/50 bg-violet-500/5' : 'border-border bg-muted/30'}`}>
                <Switch
                  id="emotion-tags-form"
                  checked={useEmotionTags}
                  onCheckedChange={setUseEmotionTags}
                  className="mt-0.5 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <label htmlFor="emotion-tags-form" className="text-sm font-semibold cursor-pointer">
                      {useEmotionTags ? '🎭 eleven_v3 — Audio Tags Ativas' : '🔊 eleven_multilingual_v2 — Padrão'}
                    </label>
                    <Badge variant="outline" className={`text-[10px] ${useEmotionTags ? 'border-violet-400 text-violet-600' : 'text-muted-foreground'}`}>
                      {useEmotionTags ? 'v3 alpha' : 'v2 estável'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {useEmotionTags
                      ? 'Preserva [excited], [pause], [whispers] no roteiro. SSML (<break/>) é ignorado.'
                      : 'Modelo padrão. Tags emocionais [tag] são removidas automaticamente.'}
                  </p>
                  {useEmotionTags && (
                    <button
                      type="button"
                      onClick={() => navigate('/admin/audio-preview')}
                      className="mt-1.5 text-[11px] text-violet-600 underline hover:no-underline"
                    >
                      → Testar tags no sandbox de áudio
                    </button>
                  )}
                </div>
                <Mic className={`w-5 h-5 flex-shrink-0 mt-0.5 ${useEmotionTags ? 'text-violet-500' : 'text-muted-foreground'}`} />
              </div>

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
