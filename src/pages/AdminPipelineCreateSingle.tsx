import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Plus, Trash2, Rocket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { PipelineInput } from '@/lib/lessonPipeline/types';

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
        description: "Redirecionando para o monitor..."
      });

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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Trail ID (UUID)</Label>
                <Input
                  value={formData.trackId}
                  onChange={(e) => setFormData({ ...formData, trackId: e.target.value })}
                  placeholder="UUID da trilha"
                />
              </div>
              <div className="space-y-2">
                <Label>Nome da Trail</Label>
                <Input
                  value={formData.trackName}
                  onChange={(e) => setFormData({ ...formData, trackName: e.target.value })}
                  placeholder="Ex: Fundamentos"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Order Index</Label>
              <Input
                type="number"
                value={formData.orderIndex}
                onChange={(e) => setFormData({ ...formData, orderIndex: parseInt(e.target.value) })}
              />
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
                    <Label>Tipo</Label>
                    <Select
                      value={exercise.type}
                      onValueChange={(value) => {
                        const newExercises = [...formData.exercises];
                        newExercises[index] = { ...newExercises[index], type: value as any };
                        setFormData({ ...formData, exercises: newExercises });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="multiple-choice">Múltipla Escolha</SelectItem>
                        <SelectItem value="true-false">Verdadeiro/Falso</SelectItem>
                        <SelectItem value="fill-blanks">Preencher Lacunas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Pergunta</Label>
                    <Input
                      value={exercise.question || ''}
                      onChange={(e) => {
                        const newExercises = [...formData.exercises];
                        newExercises[index] = { ...newExercises[index], question: e.target.value };
                        setFormData({ ...formData, exercises: newExercises });
                      }}
                      placeholder="Digite a pergunta..."
                    />
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
