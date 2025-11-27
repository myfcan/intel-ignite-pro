import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Upload, Trash2, Image, Rocket, CheckCircle, AlertCircle, FileJson } from 'lucide-react';
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

  // Estados para JSON input
  const [jsonInput, setJsonInput] = useState('');
  const [jsonError, setJsonError] = useState('');
  const [jsonParsed, setJsonParsed] = useState(false);

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

  const [availableTrails, setAvailableTrails] = useState<any[]>([]);

  // Buscar trails disponíveis
  useEffect(() => {
    const fetchTrails = async () => {
      const { data: trails } = await supabase
        .from('trails')
        .select('id, title')
        .eq('is_active', true)
        .order('order_index');

      if (trails) {
        setAvailableTrails(trails);
      }
    };
    fetchTrails();
  }, []);

  // Função para parsear JSON e preencher formData
  const handleJsonChange = (value: string) => {
    setJsonInput(value);
    setJsonError('');
    setJsonParsed(false);

    if (!value.trim()) {
      return;
    }

    try {
      const parsed = JSON.parse(value);

      // Validar campos obrigatórios
      if (!parsed.title) {
        setJsonError('Campo "title" obrigatório no JSON');
        return;
      }

      if (!parsed.v3Data?.audioText) {
        setJsonError('Campo "v3Data.audioText" obrigatório no JSON');
        return;
      }

      if (!parsed.v3Data?.slides || !Array.isArray(parsed.v3Data.slides)) {
        setJsonError('Campo "v3Data.slides" deve ser um array');
        return;
      }

      // Buscar trail por nome
      const trail = availableTrails.find(t => 
        t.title.toLowerCase() === 'fundamentos de ia' || 
        t.title.toLowerCase().includes('fundamento')
      );

      if (!trail) {
        setJsonError('Trail "Fundamentos de IA" não encontrada');
        return;
      }

      // Buscar próximo orderIndex
      supabase
        .from('lessons')
        .select('order_index')
        .eq('trail_id', trail.id)
        .order('order_index', { ascending: false })
        .limit(1)
        .then(({ data: lessons }) => {
          const nextIndex = lessons && lessons.length > 0
            ? lessons[0].order_index + 1
            : 1;

          // Converter slides para formato com upload
          const slidesWithUpload: SlideWithUpload[] = parsed.v3Data.slides.map((slide: any, idx: number) => ({
            id: `slide-${idx + 1}-${Date.now()}`,
            slideNumber: idx + 1,
            contentIdea: slide.contentIdea || '',
            imageUrl: '',
            timestamp: slide.timestamp || 0,
          }));

          // Atualizar formData
          setFormData({
            model: 'v3',
            title: parsed.title,
            trackId: trail.id,
            trackName: trail.title,
            orderIndex: parsed.orderIndex || nextIndex,
            sections: parsed.sections || [],
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
            description: `${slidesWithUpload.length} slides carregados. Agora envie as imagens.`
          });
        });

    } catch (error) {
      setJsonError(`Erro ao parsear JSON: ${error instanceof Error ? error.message : 'JSON inválido'}`);
    }
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
      console.log('🔄 Iniciando upload do slide', index + 1);
      
      // Sanitizar título para nome de arquivo seguro
      const sanitizedTitle = formData.title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove acentos
        .replace(/[^a-z0-9]+/g, '-') // Substitui caracteres especiais por hífen
        .replace(/^-+|-+$/g, ''); // Remove hífens do início/fim
      
      const fileExt = file.name.split('.').pop();
      const fileName = `slide-${sanitizedTitle}-${index + 1}-${Date.now()}.${fileExt}`;
      
      console.log('📁 Nome do arquivo:', fileName);

      // Upload para Supabase Storage (bucket lesson-images)
      const { data, error } = await supabase.storage
        .from('lesson-images')
        .upload(fileName, file, {
          contentType: file.type,
          upsert: true
        });

      if (error) {
        console.error('❌ Erro no upload para lesson-images:', error);
        // Se bucket não existe, tentar lesson-audios como fallback
        if (error.message.includes('Bucket not found')) {
          console.log('🔄 Tentando fallback para lesson-audios...');
          const { data: fallbackData, error: fallbackError } = await supabase.storage
            .from('lesson-audios')
            .upload(`slides/${fileName}`, file, {
              contentType: file.type,
              upsert: true
            });

          if (fallbackError) {
            console.error('❌ Erro no fallback:', fallbackError);
            throw fallbackError;
          }

          console.log('✅ Upload via fallback bem-sucedido');
          const { data: { publicUrl } } = supabase.storage
            .from('lesson-audios')
            .getPublicUrl(`slides/${fileName}`);

          console.log('🔗 URL pública (fallback):', publicUrl);

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

      console.log('✅ Upload bem-sucedido para lesson-images');

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('lesson-images')
        .getPublicUrl(fileName);

      console.log('🔗 URL pública:', publicUrl);

      // Atualizar slide com URL
      const updatedSlides = [...formData.v3Data!.slides] as SlideWithUpload[];
      updatedSlides[index] = {
        ...updatedSlides[index],
        imageUrl: publicUrl,
        isUploading: false
      };
      
      console.log('💾 Atualizando estado com URL:', publicUrl);
      setFormData(prev => ({ ...prev, v3Data: { ...prev.v3Data!, slides: updatedSlides } }));

      toast({
        title: "Imagem enviada!",
        description: `Slide ${index + 1} atualizado`
      });

    } catch (error) {
      console.error('💥 Erro fatal no upload:', error);
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

  // Formatar timestamp para exibição (segundos → mm:ss)
  const formatTimestamp = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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
              <FileJson className="w-8 h-8" />
              Criação Aula V3 (JSON Input)
            </h1>
            <p className="text-muted-foreground">
              Cole o JSON completo → Upload manual de imagens → Criar aula
            </p>
          </div>
        </div>

        {/* STEP 1: JSON Input */}
        {!jsonParsed && (
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <CardTitle>📋 Passo 1: Cole o JSON da Aula</CardTitle>
              <CardDescription>
                Cole aqui o JSON completo com title, audioText, slides, exercises, etc.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={jsonInput}
                onChange={(e) => handleJsonChange(e.target.value)}
                placeholder={`{
  "title": "Os 10 Erros Fatais com I.A.",
  "orderIndex": 8,
  "v3Data": {
    "audioText": "Olá! Sou a LIV...",
    "slides": [
      { "contentIdea": "Intro", "timestamp": 0 },
      { "contentIdea": "Erro 1", "timestamp": 45 }
    ]
  },
  "exercises": [...],
  "estimatedTimeMinutes": 15
}`}
                rows={20}
                className="font-mono text-sm"
              />

              {jsonError && (
                <div className="flex items-start gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-600">Erro no JSON</p>
                    <p className="text-sm text-red-500">{jsonError}</p>
                  </div>
                </div>
              )}

              <Button 
                onClick={() => handleJsonChange(jsonInput)}
                disabled={!jsonInput.trim()}
                className="w-full"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Validar e Carregar JSON
              </Button>
            </CardContent>
          </Card>
        )}

        {/* STEP 2: Confirmação de Settings */}
        {jsonParsed && (
          <>
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

            {/* Passo 2: Confirmar Settings */}
            <Card>
              <CardHeader>
                <CardTitle>✅ Passo 2: Confirmar Configurações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div>
                    <Label className="text-xs text-muted-foreground">Título</Label>
                    <p className="font-medium">{formData.title}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Trail</Label>
                    <p className="font-medium">{formData.trackName}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Order Index</Label>
                    <p className="font-medium">{formData.orderIndex}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Total Slides</Label>
                    <p className="font-medium">{totalSlides}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Tempo Estimado</Label>
                    <p className="font-medium">{formData.estimatedTimeMinutes} min</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Exercícios</Label>
                    <p className="font-medium">{formData.exercises?.length || 0}</p>
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  onClick={() => {
                    setJsonParsed(false);
                    setJsonInput('');
                    setFormData({
                      model: 'v3',
                      title: '',
                      trackId: '',
                      trackName: '',
                      orderIndex: 0,
                      sections: [],
                      v3Data: { audioText: '', slides: [] },
                      exercises: [],
                      estimatedTimeMinutes: 15,
                    });
                  }}
                  className="w-full"
                >
                  ← Voltar e editar JSON
                </Button>
              </CardContent>
            </Card>

            {/* STEP 3: Upload de Imagens */}
            <Card>
              <CardHeader>
                <CardTitle>🖼️ Passo 3: Upload de Imagens</CardTitle>
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
                            <div className="flex flex-col">
                              <span className="font-semibold text-sm">Slide {index + 1}</span>
                              <span className="text-xs text-muted-foreground">
                                ⏱️ {formatTimestamp(slide.timestamp || 0)}
                              </span>
                            </div>
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

                          {/* Descrição do slide */}
                          {slide.contentIdea && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {slide.contentIdea}
                            </p>
                          )}

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
              <Button 
                variant="outline" 
                onClick={() => {
                  setJsonParsed(false);
                  setJsonInput('');
                }} 
                className="flex-1"
              >
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
          </>
        )}
      </div>
    </div>
  );
}
