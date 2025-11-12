import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Plus, Trash2, Rocket, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { PipelineInput } from '@/lib/lessonPipeline/types';
import { runLessonPipeline } from '@/lib/lessonPipeline';

export default function AdminPipelineCreateSingle() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<PipelineInput>({
    model: 'v2',
    title: '',
    trackId: '',
    trackName: '',
    orderIndex: 0,
    sections: [{ id: 'section-1', visualContent: '', speechBubbleText: '' }],
    v3Data: {
      audioText: '',
      slides: [],
    },
    exercises: [],
    estimatedTimeMinutes: 15,
  });

  // Auto-preencher Trail Info
  useEffect(() => {
    const fetchTrailInfo = async () => {
      const { data: trail } = await supabase
        .from('trails')
        .select('id, title')
        .eq('title', 'Fundamentos de IA')
        .eq('is_active', true)
        .single();
      
      if (trail) {
        setFormData(prev => ({
          ...prev,
          trackId: trail.id,
          trackName: trail.title,
        }));
      }
    };
    fetchTrailInfo();
  }, []);

  // Calcular próximo Order Index
  useEffect(() => {
    const fetchNextOrderIndex = async () => {
      if (!formData.trackId) return;
      
      const { data: lessons } = await supabase
        .from('lessons')
        .select('order_index')
        .eq('trail_id', formData.trackId)
        .order('order_index', { ascending: false })
        .limit(1);
      
      const nextIndex = lessons && lessons.length > 0 
        ? lessons[0].order_index + 1 
        : 1;
      
      setFormData(prev => ({ ...prev, orderIndex: nextIndex }));
    };
    
    fetchNextOrderIndex();
  }, [formData.trackId]);

  const addSection = () => {
    setFormData({
      ...formData,
      sections: [
        ...formData.sections,
        { id: `section-${formData.sections.length + 1}`, visualContent: '', speechBubbleText: '' }
      ]
    });
  };

  const removeSection = (index: number) => {
    setFormData({
      ...formData,
      sections: formData.sections.filter((_, i) => i !== index)
    });
  };

  const updateSection = (index: number, field: string, value: string) => {
    const newSections = [...formData.sections];
    newSections[index] = { ...newSections[index], [field]: value };
    setFormData({ ...formData, sections: newSections });
  };

  const addExercise = () => {
    setFormData({
      ...formData,
      exercises: [
        ...formData.exercises,
        { type: 'prompt', prompt: '', question: '' }
      ]
    });
  };

  const removeExercise = (index: number) => {
    setFormData({
      ...formData,
      exercises: formData.exercises.filter((_, i) => i !== index)
    });
  };

  // V3 Slide Functions
  const addSlideV3 = () => {
    if (!formData.v3Data) return;
    
    setFormData({
      ...formData,
      v3Data: {
        ...formData.v3Data,
        slides: [
          ...formData.v3Data.slides,
          {
            id: `slide-${Date.now()}`,
            slideNumber: formData.v3Data.slides.length + 1,
            contentIdea: '',
          }
        ]
      }
    });
  };

  const removeSlideV3 = (index: number) => {
    if (!formData.v3Data) return;
    
    setFormData({
      ...formData,
      v3Data: {
        ...formData.v3Data,
        slides: formData.v3Data.slides.filter((_, i) => i !== index).map((slide, idx) => ({
          ...slide,
          slideNumber: idx + 1
        }))
      }
    });
  };

  const updateSlideV3 = (index: number, field: string, value: any) => {
    if (!formData.v3Data) return;
    
    const newSlides = [...formData.v3Data.slides];
    newSlides[index] = { ...newSlides[index], [field]: value };
    setFormData({
      ...formData,
      v3Data: {
        ...formData.v3Data,
        slides: newSlides
      }
    });
  };

  const startPipeline = async (executionId: string, inputData: PipelineInput) => {
    try {
      // Verificar se usuário está autenticado (força validação server-side)
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('Token JWT inválido ou expirado. Faça login novamente.');
      }

      console.log('🔐 Token validado para:', user.email);

      // 1. Marcar como "running"
      await supabase
        .from('pipeline_executions')
        .update({ 
          status: 'running', 
          started_at: new Date().toISOString() 
        })
        .eq('id', executionId);

      // 2. Executar pipeline localmente
      const result = await runLessonPipeline(inputData, (progress) => {
        // Atualizar progresso no banco
        supabase
          .from('pipeline_executions')
          .update({ 
            current_step: progress.currentStep,
            logs: progress.logs 
          })
          .eq('id', executionId)
          .then(() => console.log('Progresso atualizado:', progress));
      });

      // 3. Marcar como concluído ou falho
      if (result.success) {
        await supabase
          .from('pipeline_executions')
          .update({ 
            status: 'completed', 
            completed_at: new Date().toISOString(),
            lesson_id: result.lessonId,
            output_data: result as any
          })
          .eq('id', executionId);
      } else {
        await supabase
          .from('pipeline_executions')
          .update({ 
            status: 'failed', 
            error_message: result.error || 'Erro desconhecido'
          })
          .eq('id', executionId);
      }

      return result;
    } catch (error) {
      // Marcar como falho em caso de exceção
      await supabase
        .from('pipeline_executions')
        .update({ 
          status: 'failed', 
          error_message: error instanceof Error ? error.message : 'Erro desconhecido'
        })
        .eq('id', executionId);
      
      throw error;
    }
  };

  const handleSubmit = async () => {
    // Validação por modelo
    if (formData.model === 'v3') {
      if (!formData.title || !formData.trackId || !formData.v3Data?.audioText || formData.v3Data.slides.length === 0) {
        toast({
          title: "Campos obrigatórios",
          description: "Preencha título, trail, áudio e pelo menos um slide para V3",
          variant: "destructive"
        });
        return;
      }
    } else {
      if (!formData.title || !formData.trackId || !formData.sections || formData.sections.length === 0) {
        toast({
          title: "Campos obrigatórios",
          description: "Preencha título, trail e pelo menos uma seção",
          variant: "destructive"
        });
        return;
      }
    }

    setIsSubmitting(true);
    try {
      // 1. Criar registro de execução
      const { data, error } = await supabase
        .from('pipeline_executions')
        .insert({
          lesson_title: formData.title,
          model: formData.model,
          status: 'pending',
          input_data: formData as unknown as any,
          track_id: formData.trackId,
          track_name: formData.trackName,
          order_index: formData.orderIndex,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Pipeline criado!",
        description: "Iniciando execução..."
      });

      // 2. Iniciar execução automaticamente
      try {
        await startPipeline(data.id, formData);
        
        toast({
          title: "Pipeline iniciado!",
          description: "Redirecionando para o monitor..."
        });
    } catch (startError) {
      console.error('❌ Pipeline falhou:', startError);
      
      // FASE 5: Debug detalhado do estado de autenticação no momento do erro
      const { data: { session: errorSession } } = await supabase.auth.getSession();
      console.log('🐛 Estado da autenticação no momento do erro:');
      console.log('   Session exists:', !!errorSession);
      console.log('   User:', errorSession?.user?.email);
      console.log('   Expires at:', errorSession?.expires_at ? new Date(errorSession.expires_at * 1000).toLocaleString() : 'N/A');
      
      // Verificar se é erro RLS
      const errorMessage = startError instanceof Error ? startError.message : 'Erro desconhecido';
      const isRLSError = errorMessage.includes('row-level security');
      
      toast({
        title: isRLSError ? "❌ Erro de Autenticação (RLS)" : "Pipeline criado, mas não iniciado",
        description: isRLSError 
          ? `ERRO PERSISTENTE: ${errorMessage}\n\nVerifique o console para diagnóstico detalhado.`
          : "Você pode iniciá-lo manualmente no monitor",
        variant: "destructive",
      });
      
      if (isRLSError) {
        console.error('🚨 ERRO RLS PERSISTENTE - Logs enviados para análise');
        console.error('   Session:', errorSession);
        console.error('   Error:', errorMessage);
        
        // Redirecionar para login após 5 segundos
        setTimeout(() => {
          toast({
            title: "Redirecionando para login...",
            description: "Sua sessão pode ter expirado",
          });
          navigate('/auth');
        }, 5000);
      }
    }

      // 3. Redirecionar para monitor
      navigate(`/admin/pipeline/monitor/${data.id}`);
    } catch (error) {
      console.error('Erro ao criar pipeline:', error);
      toast({
        title: "Erro ao criar pipeline",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/pipeline')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Criar Lição Única</h1>
            <p className="text-muted-foreground">Formulário completo para criação via pipeline</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Modelo</Label>
                <Select value={formData.model} onValueChange={(value: 'v1' | 'v2' | 'v3') => setFormData({ ...formData, model: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="v1">V1 (Áudio por seção + Playgrounds)</SelectItem>
                    <SelectItem value="v2">V2 (Áudio por seção - Sem playgrounds)</SelectItem>
                    <SelectItem value="v3">V3 (Áudio único + ~7 Slides + Playground final)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-2">
                  {formData.model === 'v1' && '📚 V1: Áudio por seção, com playgrounds interativos durante e no final'}
                  {formData.model === 'v2' && '📖 V2: Áudio por seção, focado em consumo linear de conteúdo'}
                  {formData.model === 'v3' && '🎬 V3: Um único áudio, ~7 slides visuais, playground no final'}
                </p>
              </div>
              <div className="space-y-2">
                <Label>Tempo Estimado (min)</Label>
                <Input
                  type="number"
                  value={formData.estimatedTimeMinutes}
                  onChange={(e) => setFormData({ ...formData, estimatedTimeMinutes: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Título da Lição</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Introdução à IA"
              />
            </div>

            <div className="space-y-4 p-4 bg-muted/50 rounded-lg border-2 border-dashed">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">🤖 Auto-preenchido</Label>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, trackId: '' }));
                    setTimeout(() => window.location.reload(), 100);
                  }}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Recalcular
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Trail ID</Label>
                  <Input
                    value={formData.trackId}
                    disabled
                    className="bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Nome da Trail</Label>
                  <Input
                    value={formData.trackName}
                    disabled
                    className="bg-background/50"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Order Index (Próximo disponível)</Label>
                <Input
                  type="number"
                  value={formData.orderIndex}
                  disabled
                  className="bg-background/50"
                />
              </div>
              
              <p className="text-xs text-muted-foreground">
                💡 Estes campos são preenchidos automaticamente. Use "Recalcular" se necessário.
              </p>
            </div>
          </CardContent>
        </Card>

        {formData.model === 'v3' ? (
          // FORMULÁRIO V3 ESPECÍFICO
          <>
            <Card>
              <CardHeader>
                <CardTitle>Áudio Único</CardTitle>
                <CardDescription>
                  V3 usa um áudio único para toda a aula. Descreva o que a MAIA deve falar durante os slides.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Texto do Áudio (Speech da MAIA)</Label>
                  <Textarea
                    value={formData.v3Data?.audioText || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      v3Data: {
                        ...formData.v3Data!,
                        audioText: e.target.value,
                      }
                    })}
                    placeholder="Olá! Hoje vamos aprender sobre IA. Primeiro, vamos entender o que é IA..."
                    rows={8}
                  />
                  <p className="text-xs text-muted-foreground">
                    💡 Este texto será convertido em um único áudio que acompanha todos os slides
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Slides Visuais (Máx. 7)</span>
                  <Button 
                    onClick={addSlideV3} 
                    size="sm" 
                    disabled={(formData.v3Data?.slides?.length || 0) >= 7}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Slide
                  </Button>
                </CardTitle>
                <CardDescription>
                  Descreva a ideia de cada slide. A IA vai gerar a imagem automaticamente.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {(formData.v3Data?.slides || []).map((slide, index) => (
                  <Card key={slide.id}>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center justify-between">
                        Slide {index + 1}
                        <Button variant="destructive" size="sm" onClick={() => removeSlideV3(index)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Ideia/Conteúdo do Slide</Label>
                        <Textarea
                          value={slide.contentIdea}
                          onChange={(e) => updateSlideV3(index, 'contentIdea', e.target.value)}
                          placeholder="Descreva o que deve aparecer neste slide. Ex: 'Uma pessoa sorrindo enquanto trabalha com IA no computador, ambiente de escritório moderno'"
                          rows={4}
                        />
                        <p className="text-xs text-muted-foreground">
                          🎨 A IA vai gerar uma imagem baseada nesta descrição durante o pipeline
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {(formData.v3Data?.slides?.length || 0) === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhum slide adicionado. Clique em "Adicionar Slide" acima.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* PLAYGROUND FINAL */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>🎮 Playground Final-Lesson</span>
                </CardTitle>
                <CardDescription>
                  Adicione uma atividade prática no final da aula (opcional)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="v3-final-playground"
                    checked={!!formData.v3Data?.finalPlaygroundConfig}
                    onCheckedChange={(checked) => {
                      setFormData({
                        ...formData,
                        v3Data: {
                          ...formData.v3Data!,
                          finalPlaygroundConfig: checked ? {
                            type: 'real-playground',
                            config: ''
                          } : undefined
                        }
                      });
                    }}
                  />
                  <Label htmlFor="v3-final-playground" className="font-semibold cursor-pointer">
                    Adicionar Playground Final
                  </Label>
                </div>

                {formData.v3Data?.finalPlaygroundConfig && (
                  <div className="space-y-4 pl-6 border-l-2 border-primary/20">
                    <div className="space-y-2">
                      <Label className="text-sm">Tipo de Playground</Label>
                      <Select 
                        value={formData.v3Data.finalPlaygroundConfig.type}
                        onValueChange={(value: 'real-playground' | 'interactive-simulation') => {
                          setFormData({
                            ...formData,
                            v3Data: {
                              ...formData.v3Data!,
                              finalPlaygroundConfig: {
                                ...formData.v3Data!.finalPlaygroundConfig!,
                                type: value
                              }
                            }
                          });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="real-playground">Real Playground</SelectItem>
                          <SelectItem value="interactive-simulation">Simulação Interativa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm">Configuração (JSON ou Texto)</Label>
                      <Textarea
                        value={typeof formData.v3Data.finalPlaygroundConfig.config === 'string' 
                          ? formData.v3Data.finalPlaygroundConfig.config 
                          : JSON.stringify(formData.v3Data.finalPlaygroundConfig.config, null, 2)}
                        onChange={(e) => {
                          const value = e.target.value;
                          let parsedConfig;
                          
                          try {
                            parsedConfig = JSON.parse(value);
                          } catch {
                            parsedConfig = value;
                          }
                          
                          setFormData({
                            ...formData,
                            v3Data: {
                              ...formData.v3Data!,
                              finalPlaygroundConfig: {
                                ...formData.v3Data!.finalPlaygroundConfig!,
                                config: parsedConfig
                              }
                            }
                          });
                        }}
                        placeholder='{"prompt": "Complete o prompt...", "minLength": 20}'
                        rows={8}
                        className="font-mono text-sm"
                      />
                      <p className="text-xs text-muted-foreground">
                        💡 Cole JSON direto ou digite texto simples. O sistema detecta automaticamente.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          // FORMULÁRIO V1/V2 (ATUAL)
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Seções</span>
                <Button onClick={addSection} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Seção
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.sections?.map((section, index) => (
                <Card key={section.id}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      Seção {index + 1}
                      {formData.sections!.length > 1 && (
                        <Button variant="destructive" size="sm" onClick={() => removeSection(index)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Conteúdo Visual (Markdown)</Label>
                      <Textarea
                        value={section.visualContent}
                        onChange={(e) => updateSection(index, 'visualContent', e.target.value)}
                        placeholder="Conteúdo em Markdown..."
                        rows={5}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Texto para Áudio (Speech Bubble)</Label>
                      <Textarea
                        value={section.speechBubbleText || ''}
                        onChange={(e) => updateSection(index, 'speechBubbleText', e.target.value)}
                        placeholder="Texto que será falado pela Maia..."
                        rows={3}
                      />
                    </div>

                    {/* Playground Mid-Lesson (apenas V1) */}
                    {formData.model === 'v1' && (
                      <div className="space-y-4 p-4 bg-accent/10 rounded-lg border">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id={`playground-${section.id}`}
                            checked={!!section.playgroundConfig}
                            onCheckedChange={(checked) => {
                              const newSections = [...formData.sections!];
                              newSections[index].playgroundConfig = checked ? {
                                type: 'real-playground',
                                config: ''
                              } : undefined;
                              setFormData({ ...formData, sections: newSections });
                            }}
                          />
                          <Label htmlFor={`playground-${section.id}`} className="font-semibold cursor-pointer">
                            🎮 Adicionar Playground Mid-Lesson (apenas V1)
                          </Label>
                        </div>
                      
                      {section.playgroundConfig && (
                        <div className="space-y-4 pl-6 border-l-2 border-primary/20">
                          <div className="space-y-2">
                            <Label className="text-sm">Tipo de Playground</Label>
                            <Select 
                              value={section.playgroundConfig.type}
                              onValueChange={(value: 'real-playground' | 'interactive-simulation') => {
                                const newSections = [...formData.sections!];
                                newSections[index].playgroundConfig!.type = value;
                                setFormData({ ...formData, sections: newSections });
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="real-playground">Real Playground</SelectItem>
                                <SelectItem value="interactive-simulation">Simulação Interativa</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label className="text-sm">Configuração (JSON ou Texto)</Label>
                            <Textarea
                              value={typeof section.playgroundConfig.config === 'string' 
                                ? section.playgroundConfig.config 
                                : JSON.stringify(section.playgroundConfig.config, null, 2)}
                              onChange={(e) => {
                                const newSections = [...formData.sections!];
                                const value = e.target.value;
                                
                                try {
                                  newSections[index].playgroundConfig!.config = JSON.parse(value);
                                } catch {
                                  newSections[index].playgroundConfig!.config = value;
                                }
                                
                                setFormData({ ...formData, sections: newSections });
                              }}
                              placeholder='{"prompt": "Complete o prompt...", "minLength": 20}'
                              rows={8}
                              className="font-mono text-sm"
                            />
                            <p className="text-xs text-muted-foreground">
                              💡 Cole JSON direto ou digite texto simples. O sistema detecta automaticamente.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Exercícios</span>
              <Button onClick={addExercise} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Exercício
              </Button>
            </CardTitle>
            <CardDescription>
              Configure os exercícios básicos. Detalhes serão processados pelo pipeline.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.exercises.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum exercício adicionado. Clique em "Adicionar Exercício" acima.
              </p>
            )}
            {formData.exercises.map((exercise, index) => (
              <Card key={index}>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Exercício {index + 1}</Label>
                    <Button variant="destructive" size="sm" onClick={() => removeExercise(index)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Label>Descrição do Exercício (Texto Livre)</Label>
                    <Textarea
                      value={exercise.prompt || exercise.question || ''}
                      onChange={(e) => {
                        const newExercises = [...formData.exercises];
                        // Guardar apenas como prompt de texto
                        newExercises[index] = {
                          type: 'prompt', // Indica que precisa ser processado pela AI
                          prompt: e.target.value,
                          question: e.target.value, // Compatibilidade
                        };
                        setFormData({ ...formData, exercises: newExercises });
                      }}
                      placeholder='Descreva o exercício em texto livre. Exemplo:

Crie um exercício de múltipla escolha sobre os benefícios da IA.
Pergunta: "Qual é o principal benefício da IA para negócios?"
Opções:
- Redução de custos
- Automação de tarefas repetitivas (CORRETO)
- Substituição completa de funcionários
- Aumento de burocracia

---

Ou especifique o tipo:

Tipo: drag-drop
Instrução: Classifique as tarefas em "Humano" ou "IA"
Items: Criar estratégia, Analisar dados, Negociar contratos, Gerar relatórios
Categorias: Humano, IA'
                      rows={12}
                      className="font-mono text-sm"
                    />
                    <details className="text-xs text-muted-foreground">
                      <summary className="cursor-pointer font-semibold">📚 Tipos suportados (8 modelos)</summary>
                      <ul className="mt-2 space-y-1 pl-4">
                        <li>• <code>multiple-choice</code> - Múltipla escolha com opções</li>
                        <li>• <code>true-false</code> - Verdadeiro ou Falso</li>
                        <li>• <code>fill-blanks</code> - Preencher lacunas em texto</li>
                        <li>• <code>complete-sentence</code> - Completar frase</li>
                        <li>• <code>drag-drop</code> - Arrastar itens para categorias</li>
                        <li>• <code>scenario-selection</code> - Escolher melhor cenário</li>
                        <li>• <code>platform-match</code> - Combinar plataformas com features</li>
                        <li>• <code>data-collection</code> - Categorizar exemplos de dados</li>
                      </ul>
                      <p className="mt-2 text-muted-foreground">
                        💡 <strong>O pipeline vai processar seu texto automaticamente!</strong> Você pode especificar o tipo explicitamente ou deixar a AI escolher o melhor formato.
                      </p>
                    </details>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button variant="outline" onClick={() => navigate('/admin/pipeline')} className="flex-1">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="flex-1">
            <Rocket className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Criando...' : 'Criar e Executar Pipeline'}
          </Button>
        </div>
      </div>
    </div>
  );
}
