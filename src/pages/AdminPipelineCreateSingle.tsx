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
        { type: 'multiple-choice', question: '', data: {} }
      ]
    });
  };

  const removeExercise = (index: number) => {
    setFormData({
      ...formData,
      exercises: formData.exercises.filter((_, i) => i !== index)
    });
  };

  const startPipeline = async (executionId: string, inputData: PipelineInput) => {
    try {
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
    if (!formData.title || !formData.trackId || formData.sections.length === 0) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha título, trail e pelo menos uma seção",
        variant: "destructive"
      });
      return;
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
        console.error('Erro ao iniciar pipeline:', startError);
        toast({
          title: "Pipeline criado, mas não iniciado",
          description: "Você pode iniciá-lo manualmente no monitor",
          variant: "destructive"
        });
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
                <Select value={formData.model} onValueChange={(value: 'v1' | 'v2') => setFormData({ ...formData, model: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="v1">V1 (Áudio único)</SelectItem>
                    <SelectItem value="v2">V2 (Áudio por seção)</SelectItem>
                  </SelectContent>
                </Select>
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
            {formData.sections.map((section, index) => (
              <Card key={section.id}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    Seção {index + 1}
                    {formData.sections.length > 1 && (
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

                  {/* Playground Mid-Lesson */}
                  <div className="space-y-4 p-4 bg-accent/10 rounded-lg border">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id={`playground-${section.id}`}
                        checked={!!section.playgroundConfig}
                        onCheckedChange={(checked) => {
                          const newSections = [...formData.sections];
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
                              const newSections = [...formData.sections];
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
                              const newSections = [...formData.sections];
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
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>

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
                    <Label>Exercício Completo (JSON ou Texto)</Label>
                    <Textarea
                      value={typeof exercise.data === 'string' 
                        ? exercise.data 
                        : JSON.stringify(exercise, null, 2)}
                      onChange={(e) => {
                        const newExercises = [...formData.exercises];
                        const value = e.target.value;
                        
                        try {
                          // Tenta fazer parse de JSON
                          const parsed = JSON.parse(value);
                          newExercises[index] = {
                            type: parsed.type || 'multiple-choice',
                            question: parsed.question || parsed.instruction || '',
                            instruction: parsed.instruction || parsed.question || '',
                            data: parsed.data || parsed
                          };
                        } catch {
                          // Se não for JSON válido, mantém como objeto simples
                          newExercises[index] = {
                            type: 'multiple-choice',
                            question: value,
                            data: { rawText: value }
                          };
                        }
                        
                        setFormData({ ...formData, exercises: newExercises });
                      }}
                      placeholder='Cole o JSON completo do exercício, ex:
{
  "type": "drag-drop",
  "instruction": "Classifique os dados...",
  "data": {
    "items": [...],
    "categories": [...]
  }
}'
                      rows={12}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      💡 <strong>Cole JSON direto</strong> com type, instruction e data. O pipeline detecta automaticamente.
                    </p>
                    <details className="text-xs text-muted-foreground">
                      <summary className="cursor-pointer font-semibold">📚 Tipos suportados (8 modelos)</summary>
                      <ul className="mt-2 space-y-1 pl-4">
                        <li>• <code>multiple-choice</code> - Múltipla escolha</li>
                        <li>• <code>true-false</code> - Verdadeiro/Falso</li>
                        <li>• <code>fill-blanks</code> - Preencher lacunas</li>
                        <li>• <code>complete-sentence</code> - Completar frase</li>
                        <li>• <code>drag-drop</code> - Arrastar e soltar</li>
                        <li>• <code>scenario-selection</code> - Seleção de cenário</li>
                        <li>• <code>platform-match</code> - Combinar plataformas</li>
                        <li>• <code>data-collection</code> - Coleta de dados</li>
                      </ul>
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
