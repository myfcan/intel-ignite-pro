import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Upload, Trash2, Image, Rocket, CheckCircle, AlertCircle } from 'lucide-react';
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

  const [slideCount, setSlideCount] = useState<number>(10);

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

  // Gerar slides quando slideCount mudar
  const generateSlides = (count: number) => {
    const newSlides: SlideWithUpload[] = Array.from({ length: count }, (_, i) => ({
      id: `slide-${i + 1}-${Date.now()}`,
      slideNumber: i + 1,
      contentIdea: '',
      imageUrl: '',
    }));

    setFormData(prev => ({
      ...prev,
      v3Data: {
        ...prev.v3Data!,
        slides: newSlides,
      }
    }));
  };

  // Aplicar quantidade de slides
  const handleSlideCountChange = (value: string) => {
    const count = parseInt(value);
    setSlideCount(count);
    generateSlides(count);
  };

  // Upload de imagem para um slide específico
  const handleImageUpload = async (index: number, file: File) => {
    // Validar tipo de arquivo
    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Formato inválido",
        description: "Aceito apenas PNG, JPG ou WebP",
        variant: "destructive"
      });
      return;
    }

    // Validar tamanho (max 5MB)
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
      // Gerar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `slide-${formData.title.replace(/\s+/g, '-').toLowerCase()}-${index + 1}-${Date.now()}.${fileExt}`;

      // Upload para Supabase Storage (bucket lesson-images)
      const { data, error } = await supabase.storage
        .from('lesson-images')
        .upload(fileName, file, {
          contentType: file.type,
          upsert: true
        });

      if (error) {
        // Se bucket não existe, tentar criar ou usar lesson-audios como fallback
        if (error.message.includes('Bucket not found')) {
          // Fallback para lesson-audios
          const { data: fallbackData, error: fallbackError } = await supabase.storage
            .from('lesson-audios')
            .upload(`slides/${fileName}`, file, {
              contentType: file.type,
              upsert: true
            });

          if (fallbackError) throw fallbackError;

          const { data: { publicUrl } } = supabase.storage
            .from('lesson-audios')
            .getPublicUrl(`slides/${fileName}`);

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
          return;
        }
        throw error;
      }

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('lesson-images')
        .getPublicUrl(fileName);

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

  // Atualizar contentIdea de um slide
  const updateSlideContentIdea = (index: number, value: string) => {
    const newSlides = [...formData.v3Data!.slides];
    newSlides[index] = { ...newSlides[index], contentIdea: value };
    setFormData(prev => ({ ...prev, v3Data: { ...prev.v3Data!, slides: newSlides } }));
  };

  // Contar slides com imagem
  const slidesWithImage = formData.v3Data?.slides.filter(s => s.imageUrl).length || 0;
  const totalSlides = formData.v3Data?.slides.length || 0;

  // Submit do formulário
  const handleSubmit = async () => {
    // Validação
    if (!formData.title) {
      toast({ title: "Título obrigatório", variant: "destructive" });
      return;
    }

    if (!formData.v3Data?.audioText) {
      toast({ title: "Texto do áudio obrigatório", variant: "destructive" });
      return;
    }

    if (totalSlides === 0) {
      toast({ title: "Adicione pelo menos um slide", variant: "destructive" });
      return;
    }

    // Verificar se todas as imagens foram enviadas
    const slidesWithoutImage = formData.v3Data?.slides.filter(s => !s.imageUrl) || [];
    if (slidesWithoutImage.length > 0) {
      toast({
        title: "Imagens faltando",
        description: `${slidesWithoutImage.length} slide(s) ainda não tem imagem`,
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

      // 2. Executar pipeline
      const result = await runLessonPipeline(formData, data.id);

      if (result.success) {
        toast({
          title: "Aula V3 criada com sucesso!",
          description: "Redirecionando para o monitor..."
        });
      }

      // 3. Redirecionar para monitor
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
      <div className="max-w-5xl mx-auto space-y-6">
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
              Upload manual de imagens - Sem geração via API
            </p>
          </div>
        </div>

        {/* Status Bar */}
        <Card className={`border-2 ${slidesWithImage === totalSlides && totalSlides > 0 ? 'border-green-500 bg-green-500/10' : 'border-yellow-500 bg-yellow-500/10'}`}>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {slidesWithImage === totalSlides && totalSlides > 0 ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                )}
                <span className="font-medium">
                  {slidesWithImage}/{totalSlides} imagens enviadas
                </span>
              </div>
              <span className="text-sm text-muted-foreground">
                {slidesWithImage === totalSlides && totalSlides > 0
                  ? "Pronto para criar aula!"
                  : "Envie todas as imagens para continuar"
                }
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Informações Básicas */}
        <Card>
          <CardHeader>
            <CardTitle>Informações da Aula</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Título da Aula</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Os 10 Erros Fatais com I.A."
                />
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
              <Label>Texto do Áudio (Speech da LIV)</Label>
              <Textarea
                value={formData.v3Data?.audioText || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  v3Data: { ...formData.v3Data!, audioText: e.target.value }
                })}
                placeholder="Cole aqui o texto completo que será convertido em áudio..."
                rows={8}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <Label className="text-xs text-muted-foreground">Trail</Label>
                <p className="font-medium">{formData.trackName || 'Carregando...'}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Order Index</Label>
                <p className="font-medium">{formData.orderIndex}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Seletor de Quantidade de Slides */}
        <Card>
          <CardHeader>
            <CardTitle>Quantidade de Slides</CardTitle>
            <CardDescription>
              Escolha quantos slides a aula terá. As caixas de upload serão geradas automaticamente.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Select value={slideCount.toString()} onValueChange={handleSlideCountChange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map(n => (
                    <SelectItem key={n} value={n.toString()}>{n} slides</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Recomendado: 10-15 slides para aulas de 10-15 minutos
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Grid de Slides */}
        <Card>
          <CardHeader>
            <CardTitle>Upload de Imagens</CardTitle>
            <CardDescription>
              Envie uma imagem para cada slide. Formato recomendado: 1792x1024 (landscape 16:9)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {formData.v3Data?.slides.map((slide, index) => {
                const slideWithUpload = slide as SlideWithUpload;
                return (
                  <Card key={slide.id} className={`relative ${slide.imageUrl ? 'border-green-500' : 'border-dashed'}`}>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm">Slide {index + 1}</span>
                        {slide.imageUrl && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => removeImage(index)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        )}
                      </div>

                      {/* Área de Upload/Preview */}
                      <div
                        className={`
                          aspect-video rounded-lg overflow-hidden cursor-pointer
                          ${slide.imageUrl
                            ? 'bg-black'
                            : 'bg-muted border-2 border-dashed flex items-center justify-center hover:bg-muted/80'
                          }
                        `}
                        onClick={() => !slide.imageUrl && fileInputRefs.current[index]?.click()}
                      >
                        {slideWithUpload.isUploading ? (
                          <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                            <span className="text-xs">Enviando...</span>
                          </div>
                        ) : slide.imageUrl ? (
                          <img
                            src={slide.imageUrl}
                            alt={`Slide ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center gap-2 text-muted-foreground p-4">
                            <Upload className="w-6 h-6" />
                            <span className="text-xs text-center">Clique para enviar</span>
                          </div>
                        )}
                      </div>

                      {/* Input hidden para upload */}
                      <input
                        ref={el => fileInputRefs.current[index] = el}
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(index, file);
                          e.target.value = ''; // Reset para permitir mesmo arquivo
                        }}
                      />

                      {/* Descrição opcional */}
                      <Input
                        placeholder="Descrição (opcional)"
                        value={slide.contentIdea}
                        onChange={(e) => updateSlideContentIdea(index, e.target.value)}
                        className="text-xs"
                      />

                      {/* Erro de upload */}
                      {slideWithUpload.uploadError && (
                        <p className="text-xs text-red-500">{slideWithUpload.uploadError}</p>
                      )}

                      {/* Status */}
                      {slide.imageUrl && (
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="w-3 h-3" />
                          <span className="text-xs">Enviado</span>
                        </div>
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

        {/* Dica */}
        <Card className="bg-blue-500/10 border-blue-500/20">
          <CardContent className="py-4">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Dica:</strong> Crie suas imagens no Canva, Figma ou Midjourney com tamanho 1792x1024 pixels
              para melhor qualidade nos slides.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
