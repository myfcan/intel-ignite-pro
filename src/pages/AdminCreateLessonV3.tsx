import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Upload, Trash2, Image, Rocket, CheckCircle, AlertCircle, FileJson, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { PipelineInput, V3Slide } from '@/lib/lessonPipeline/types';
import { runLessonPipeline } from '@/lib/lessonPipeline';

interface SlideWithUpload extends V3Slide {
  isUploading?: boolean;
  uploadError?: string;
}

export default function AdminCreateLessonV3() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [jsonError, setJsonError] = useState('');
  const [jsonParsed, setJsonParsed] = useState(false);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [formData, setFormData] = useState<PipelineInput>({
    model: 'v3',
    title: '',
    trackId: '',
    trackName: '',
    orderIndex: 0,
    sections: [],
    v3Data: {
      audioText: '',
      slides: [],
    },
    exercises: [],
    estimatedTimeMinutes: 15,
  });

  const [availableTrails, setAvailableTrails] = useState<{ id: string; title: string }[]>([]);

  // Buscar todas as trails disponíveis
  useEffect(() => {
    const fetchTrails = async () => {
      const { data: trails } = await supabase
        .from('trails')
        .select('id, title')
        .eq('is_active', true)
        .order('title');

      if (trails && trails.length > 0) {
        setAvailableTrails(trails);
      }
    };
    fetchTrails();
  }, []);

  // Parsear JSON quando digitado
  const handleJsonChange = (value: string) => {
    setJsonInput(value);
    setJsonError('');
    setJsonParsed(false);

    if (!value.trim()) return;

    try {
      const parsed = JSON.parse(value);

      // Validar campos obrigatórios
      if (!parsed.title) {
        setJsonError('Campo "title" obrigatório');
        return;
      }
      if (!parsed.v3Data || !parsed.v3Data.audioText) {
        setJsonError('Campo "v3Data.audioText" obrigatório');
        return;
      }
      if (!parsed.v3Data.slides || parsed.v3Data.slides.length === 0) {
        setJsonError('Campo "v3Data.slides" obrigatório (array não vazio)');
        return;
      }
      if (!parsed.exercises) {
        setJsonError('Campo "exercises" obrigatório');
        return;
      }

      // Encontrar trail pelo nome ou usar a primeira
      let selectedTrail = availableTrails[0];
      if (parsed.trackName) {
        const found = availableTrails.find(t =>
          t.title.toLowerCase().includes(parsed.trackName.toLowerCase())
        );
        if (found) selectedTrail = found;
      }

      // Converter slides para formato com upload
      const slidesWithUpload: SlideWithUpload[] = parsed.v3Data.slides.map((slide: any, idx: number) => ({
        id: slide.id || `slide-${idx + 1}-${Date.now()}`,
        slideNumber: slide.slideNumber || idx + 1,
        contentIdea: slide.contentIdea || '',
        timestamp: slide.timestamp || 0,
        imageUrl: slide.imageUrl || '', // Vazio para upload manual
        imagePrompt: slide.imagePrompt || '',
      }));

      // Atualizar formData
      setFormData({
        model: 'v3',
        title: parsed.title,
        trackId: selectedTrail?.id || '',
        trackName: selectedTrail?.title || '',
        orderIndex: parsed.orderIndex || 1,
        sections: [],
        v3Data: {
          audioText: parsed.v3Data.audioText,
          slides: slidesWithUpload,
          finalPlaygroundConfig: parsed.v3Data.finalPlaygroundConfig || undefined,
        },
        exercises: parsed.exercises || [],
        estimatedTimeMinutes: parsed.estimatedTimeMinutes || 15,
      });

      setJsonParsed(true);
      toast({
        title: "JSON válido!",
        description: `${slidesWithUpload.length} slides carregados. Agora faça upload das imagens.`
      });

    } catch (error) {
      setJsonError(`JSON inválido: ${(error as Error).message}`);
    }
  };

  // Upload de imagem para um slide específico
  const handleImageUpload = async (index: number, file: File) => {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Formato inválido",
        description: "Aceito apenas PNG, JPG ou WebP",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "Máximo 5MB por imagem",
        variant: "destructive"
      });
      return;
    }

    // Marcar como uploading
    const newSlides = [...formData.v3Data!.slides] as SlideWithUpload[];
    newSlides[index] = { ...newSlides[index], isUploading: true, uploadError: undefined };
    setFormData(prev => ({ ...prev, v3Data: { ...prev.v3Data!, slides: newSlides } }));

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `slide-${formData.title.replace(/\s+/g, '-').toLowerCase()}-${index + 1}-${Date.now()}.${fileExt}`;

      // Tentar bucket lesson-images, fallback para lesson-audios
      let publicUrl = '';

      const { error } = await supabase.storage
        .from('lesson-images')
        .upload(fileName, file, { contentType: file.type, upsert: true });

      if (error) {
        if (error.message.includes('Bucket not found')) {
          const { error: fallbackError } = await supabase.storage
            .from('lesson-audios')
            .upload(`slides/${fileName}`, file, { contentType: file.type, upsert: true });

          if (fallbackError) throw fallbackError;

          const { data: { publicUrl: url } } = supabase.storage
            .from('lesson-audios')
            .getPublicUrl(`slides/${fileName}`);
          publicUrl = url;
        } else {
          throw error;
        }
      } else {
        const { data: { publicUrl: url } } = supabase.storage
          .from('lesson-images')
          .getPublicUrl(fileName);
        publicUrl = url;
      }

      // Atualizar slide com URL
      const updatedSlides = [...formData.v3Data!.slides] as SlideWithUpload[];
      updatedSlides[index] = {
        ...updatedSlides[index],
        imageUrl: publicUrl,
        isUploading: false
      };
      setFormData(prev => ({ ...prev, v3Data: { ...prev.v3Data!, slides: updatedSlides } }));

      toast({
        title: "Imagem enviada!",
        description: `Slide ${index + 1} atualizado`
      });

    } catch (error) {
      console.error('Erro no upload:', error);
      const updatedSlides = [...formData.v3Data!.slides] as SlideWithUpload[];
      updatedSlides[index] = {
        ...updatedSlides[index],
        isUploading: false,
        uploadError: error instanceof Error ? error.message : 'Erro no upload'
      };
      setFormData(prev => ({ ...prev, v3Data: { ...prev.v3Data!, slides: updatedSlides } }));

      toast({
        title: "Erro no upload",
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: "destructive"
      });
    }
  };

  // Remover imagem de um slide
  const removeImage = (index: number) => {
    const newSlides = [...formData.v3Data!.slides];
    newSlides[index] = { ...newSlides[index], imageUrl: '' };
    setFormData(prev => ({ ...prev, v3Data: { ...prev.v3Data!, slides: newSlides } }));
  };

  // Contar slides com imagem
  const slidesWithImage = formData.v3Data?.slides.filter(s => s.imageUrl).length || 0;
  const totalSlides = formData.v3Data?.slides.length || 0;

  // Formatar timestamp para exibição
  const formatTimestamp = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Submit do formulário
  const handleSubmit = async () => {
    if (!formData.title) {
      toast({ title: "Título obrigatório", variant: "destructive" });
      return;
    }

    if (!formData.v3Data?.audioText) {
      toast({ title: "Texto do áudio obrigatório", variant: "destructive" });
      return;
    }

    if (totalSlides === 0) {
      toast({ title: "Cole o JSON para carregar os slides", variant: "destructive" });
      return;
    }

    const slidesWithoutImage = formData.v3Data?.slides.filter(s => !s.imageUrl) || [];
    if (slidesWithoutImage.length > 0) {
      toast({
        title: "Imagens faltando",
        description: `${slidesWithoutImage.length} slide(s) ainda não tem imagem`,
        variant: "destructive"
      });
      return;
    }

    if (!formData.trackId) {
      toast({ title: "Selecione uma Trail", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('pipeline_executions')
        .insert({
          lesson_title: formData.title,
          model: 'v3',
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
        description: "Iniciando execução (imagens já enviadas - mais rápido!)"
      });

      const result = await runLessonPipeline(formData, data.id);

      if (result.success) {
        toast({
          title: "Aula V3 criada com sucesso!",
          description: "Redirecionando para o monitor..."
        });
      }

      navigate(`/admin/pipeline/monitor/${data.id}`);

    } catch (error) {
      console.error('Erro:', error);
      toast({
        title: "Erro ao criar aula",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/manual')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Image className="w-8 h-8" />
              Criação Aula V3
            </h1>
            <p className="text-muted-foreground">
              Cole o JSON completo + Upload manual de imagens
            </p>
          </div>
        </div>

        {/* STEP 1: Cole o JSON */}
        <Card className={jsonParsed ? 'border-green-500' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileJson className="w-5 h-5" />
              1. Cole o JSON da Aula
            </CardTitle>
            <CardDescription>
              JSON com title, orderIndex, v3Data (audioText, slides com timestamps, finalPlaygroundConfig), exercises
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={jsonInput}
              onChange={(e) => handleJsonChange(e.target.value)}
              placeholder={`{
  "title": "Os 10 Erros Fatais com IA",
  "orderIndex": 8,
  "estimatedTimeMinutes": 15,
  "v3Data": {
    "audioText": "Olá! Hoje vamos aprender...",
    "slides": [
      { "contentIdea": "Intro - Título chamativo", "timestamp": 0 },
      { "contentIdea": "Erro 1 - Não validar outputs", "timestamp": 45 },
      { "contentIdea": "Erro 2 - Prompts vagos", "timestamp": 90 }
    ],
    "finalPlaygroundConfig": {
      "type": "real-playground",
      "instruction": "Agora pratique!"
    }
  },
  "exercises": [
    { "type": "multiple-choice", "question": "...", "options": [...] }
  ]
}`}
              rows={12}
              className="font-mono text-sm"
            />

            {jsonError && (
              <div className="flex items-center gap-2 text-red-500 text-sm">
                <AlertCircle className="w-4 h-4" />
                {jsonError}
              </div>
            )}

            {jsonParsed && (
              <div className="flex items-center gap-2 text-green-600 text-sm">
                <CheckCircle className="w-4 h-4" />
                JSON válido! {totalSlides} slides carregados com timestamps.
              </div>
            )}
          </CardContent>
        </Card>

        {/* STEP 2: Configurações (aparece após JSON válido) */}
        {jsonParsed && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>2. Confirme as Configurações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Título</Label>
                    <Input value={formData.title} readOnly className="bg-muted" />
                  </div>
                  <div className="space-y-2">
                    <Label>Order Index</Label>
                    <Input
                      type="number"
                      value={formData.orderIndex}
                      onChange={(e) => setFormData(prev => ({ ...prev, orderIndex: parseInt(e.target.value) || 1 }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Trail</Label>
                    <Select
                      value={formData.trackId}
                      onValueChange={(value) => {
                        const selectedTrail = availableTrails.find(t => t.id === value);
                        setFormData(prev => ({
                          ...prev,
                          trackId: value,
                          trackName: selectedTrail?.title || '',
                        }));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTrails.map(trail => (
                          <SelectItem key={trail.id} value={trail.id}>
                            {trail.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Tempo (min)</Label>
                    <Input value={formData.estimatedTimeMinutes} readOnly className="bg-muted" />
                  </div>
                </div>

                {/* Info dos exercícios e playground */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div>
                    <Label className="text-xs text-muted-foreground">Exercícios</Label>
                    <p className="font-medium">{formData.exercises.length} exercício(s)</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Playground Final</Label>
                    <p className="font-medium">
                      {formData.v3Data?.finalPlaygroundConfig ? '✅ Configurado' : '❌ Não configurado'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status Bar */}
            <Card className={`border-2 ${slidesWithImage === totalSlides ? 'border-green-500 bg-green-500/10' : 'border-yellow-500 bg-yellow-500/10'}`}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {slidesWithImage === totalSlides ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                    )}
                    <span className="font-medium">
                      {slidesWithImage}/{totalSlides} imagens enviadas
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {slidesWithImage === totalSlides
                      ? "Pronto para criar aula!"
                      : "Faça upload das imagens para cada slide"
                    }
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* STEP 3: Upload de Imagens */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  3. Upload de Imagens
                </CardTitle>
                <CardDescription>
                  Clique em cada slide para fazer upload. Os timestamps já estão definidos pelo JSON.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {formData.v3Data?.slides.map((slide, index) => {
                    const slideWithUpload = slide as SlideWithUpload;
                    return (
                      <Card key={slide.id} className={`relative ${slide.imageUrl ? 'border-green-500' : 'border-dashed border-2'}`}>
                        <CardContent className="p-3 space-y-2">
                          {/* Header do slide */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm">#{index + 1}</span>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatTimestamp(slide.timestamp || 0)}
                              </span>
                            </div>
                            {slide.imageUrl && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5"
                                onClick={() => removeImage(index)}
                              >
                                <Trash2 className="w-3 h-3 text-red-500" />
                              </Button>
                            )}
                          </div>

                          {/* Área de Upload/Preview */}
                          <div
                            className={`
                              aspect-video rounded-lg overflow-hidden cursor-pointer
                              ${slide.imageUrl
                                ? 'bg-black'
                                : 'bg-muted border border-dashed flex items-center justify-center hover:bg-muted/80'
                              }
                            `}
                            onClick={() => !slide.imageUrl && fileInputRefs.current[index]?.click()}
                          >
                            {slideWithUpload.isUploading ? (
                              <div className="flex flex-col items-center gap-1 text-muted-foreground">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                                <span className="text-xs">Enviando...</span>
                              </div>
                            ) : slide.imageUrl ? (
                              <img
                                src={slide.imageUrl}
                                alt={`Slide ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="flex flex-col items-center gap-1 text-muted-foreground p-2">
                                <Upload className="w-5 h-5" />
                                <span className="text-xs text-center">Upload</span>
                              </div>
                            )}
                          </div>

                          {/* Input hidden */}
                          <input
                            ref={el => fileInputRefs.current[index] = el}
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleImageUpload(index, file);
                              e.target.value = '';
                            }}
                          />

                          {/* Content Idea */}
                          <p className="text-xs text-muted-foreground line-clamp-2" title={slide.contentIdea}>
                            {slide.contentIdea || 'Sem descrição'}
                          </p>

                          {/* Status */}
                          {slide.imageUrl && (
                            <div className="flex items-center gap-1 text-green-600">
                              <CheckCircle className="w-3 h-3" />
                              <span className="text-xs">OK</span>
                            </div>
                          )}

                          {slideWithUpload.uploadError && (
                            <p className="text-xs text-red-500">{slideWithUpload.uploadError}</p>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Botões de Ação */}
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => navigate('/admin/manual')} className="flex-1">
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || slidesWithImage !== totalSlides || totalSlides === 0}
                className="flex-1"
              >
                <Rocket className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Criando...' : 'Criar Aula V3'}
              </Button>
            </div>
          </>
        )}

        {/* Dica */}
        <Card className="bg-blue-500/10 border-blue-500/20">
          <CardContent className="py-4">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Fluxo:</strong> 1. Cole o JSON → 2. Confirme Trail e Order Index → 3. Faça upload das imagens → 4. Criar Aula
              <br />
              <strong>Dica:</strong> Crie imagens no Canva/Figma com 1792x1024 pixels (landscape 16:9)
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
