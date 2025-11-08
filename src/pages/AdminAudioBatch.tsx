import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Play, Pause, CheckCircle, RefreshCw, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BatchLesson {
  name: string;
  content: string;
  status: 'pending' | 'generating' | 'generated' | 'approved' | 'error';
  audioUrl?: string;
  timestamps?: any;
  error?: string;
}

export default function AdminAudioBatch() {
  const navigate = useNavigate();
  const [trail, setTrail] = useState('');
  const [lessons, setLessons] = useState<BatchLesson[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);

  const addLesson = () => {
    setLessons([...lessons, { name: '', content: '', status: 'pending' }]);
  };

  const updateLesson = (index: number, field: 'name' | 'content', value: string) => {
    const updated = [...lessons];
    updated[index][field] = value;
    setLessons(updated);
  };

  const removeLesson = (index: number) => {
    setLessons(lessons.filter((_, i) => i !== index));
  };

  const base64ToBlob = (base64: string, contentType: string) => {
    const byteCharacters = atob(base64);
    const byteArrays = [];
    
    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length);
      
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    
    return new Blob(byteArrays, { type: contentType });
  };

  const generateAudio = async (index: number) => {
    const lesson = lessons[index];
    
    if (!lesson.content.trim()) {
      toast.error('Conteúdo vazio para: ' + lesson.name);
      return;
    }

    const updated = [...lessons];
    updated[index].status = 'generating';
    setLessons(updated);

    try {
      const { data, error } = await supabase.functions.invoke('generate-audio-elevenlabs', {
        body: {
          text: lesson.content,
          voice_id: 'Xb7hH8MSUJpSbSDYk0k2',
          model_id: 'eleven_multilingual_v2'
        }
      });

      if (error) throw error;

      const blob = base64ToBlob(data.audio_base64, 'audio/mpeg');
      const url = URL.createObjectURL(blob);

      updated[index].audioUrl = url;
      updated[index].timestamps = data.word_timestamps;
      updated[index].status = 'generated';
      setLessons(updated);
      
      toast.success(`Áudio gerado: ${lesson.name}`);
    } catch (error: any) {
      console.error('Erro ao gerar áudio:', error);
      updated[index].status = 'error';
      updated[index].error = error.message;
      setLessons(updated);
      toast.error(`Erro ao gerar: ${lesson.name}`);
    }
  };

  const generateAllAudios = async () => {
    if (!trail.trim()) {
      toast.error('Defina o nome da trilha');
      return;
    }

    if (lessons.length === 0) {
      toast.error('Adicione pelo menos uma aula');
      return;
    }

    if (lessons.some(l => !l.name.trim() || !l.content.trim())) {
      toast.error('Preencha o nome e conteúdo de todas as aulas');
      return;
    }

    setIsGenerating(true);
    toast.info('Iniciando geração em lote...');

    for (let i = 0; i < lessons.length; i++) {
      await generateAudio(i);
    }

    setIsGenerating(false);
    toast.success('Geração em lote concluída!');
  };

  const togglePlay = (index: number) => {
    const lesson = lessons[index];
    if (!lesson.audioUrl) return;

    const audio = document.getElementById(`audio-${index}`) as HTMLAudioElement;
    if (!audio) return;

    if (playingIndex === index) {
      audio.pause();
      setPlayingIndex(null);
    } else {
      if (playingIndex !== null) {
        const prevAudio = document.getElementById(`audio-${playingIndex}`) as HTMLAudioElement;
        prevAudio?.pause();
      }
      audio.play();
      setPlayingIndex(index);
    }
  };

  const approveLesson = async (index: number) => {
    const lesson = lessons[index];
    
    if (!lesson.audioUrl || !lesson.timestamps) {
      toast.error('Áudio não gerado ainda');
      return;
    }

    try {
      toast.info('Salvando no banco de dados...');
      
      // Buscar ou criar trilha
      let { data: trailData, error: trailError } = await supabase
        .from('trails')
        .select('id')
        .eq('title', trail)
        .single();

      if (trailError || !trailData) {
        const { data: newTrail, error: createError } = await supabase
          .from('trails')
          .insert({ 
            title: trail, 
            description: trail,
            order_index: 0
          })
          .select()
          .single();

        if (createError) throw createError;
        trailData = newTrail;
      }

      // Upload do áudio
      const audioBlob = await fetch(lesson.audioUrl).then(r => r.blob());
      const audioFileName = `${trail}-${lesson.name}-${Date.now()}.mp3`;
      
      const { error: uploadError } = await supabase.storage
        .from('lesson-audios')
        .upload(audioFileName, audioBlob, {
          contentType: 'audio/mpeg',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('lesson-audios')
        .getPublicUrl(audioFileName);

      // Criar ou atualizar lesson
      const { error: lessonError } = await supabase
        .from('lessons')
        .upsert({
          title: lesson.name,
          trail_id: trailData.id,
          audio_url: publicUrl,
          word_timestamps: lesson.timestamps,
          lesson_type: 'guided',
          content: { audioText: lesson.content },
          order_index: index + 1
        });

      if (lessonError) throw lessonError;

      const updated = [...lessons];
      updated[index].status = 'approved';
      setLessons(updated);
      
      toast.success(`✅ Aula aprovada e salva: ${lesson.name}`);
    } catch (error: any) {
      console.error('Erro ao aprovar:', error);
      toast.error('Erro ao salvar no banco: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Gerador de Áudio em Lote</h1>
          <p className="text-muted-foreground">
            Sistema automatizado para gerar múltiplos áudios de uma vez
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Configuração da Trilha</CardTitle>
            <CardDescription>Defina a trilha e adicione as aulas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome da Trilha</label>
              <Input
                placeholder="Ex: Trilha 01 - Fundamentos"
                value={trail}
                onChange={(e) => setTrail(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={addLesson} variant="outline" className="flex-1">
                <Upload className="w-4 h-4 mr-2" />
                Adicionar Aula
              </Button>
              <Button 
                onClick={generateAllAudios} 
                disabled={isGenerating || lessons.length === 0}
                className="flex-1"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  'Gerar Todos os Áudios'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {lessons.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Aulas ({lessons.length})</h2>
            
            {lessons.map((lesson, index) => (
              <Card key={index} className={
                lesson.status === 'approved' ? 'border-green-500' :
                lesson.status === 'error' ? 'border-red-500' : ''
              }>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Aula {index + 1}</CardTitle>
                    <div className="flex gap-2">
                      {lesson.status === 'pending' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => generateAudio(index)}
                        >
                          Gerar
                        </Button>
                      )}
                      {lesson.status === 'generated' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => generateAudio(index)}
                          >
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => approveLesson(index)}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Aprovar
                          </Button>
                        </>
                      )}
                      {lesson.status === 'approved' && (
                        <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          Aprovada
                        </span>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeLesson(index)}
                      >
                        Remover
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {lesson.status === 'generating' && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Gerando áudio...
                    </div>
                  )}
                  
                  {lesson.status === 'error' && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                      Erro: {lesson.error}
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nome da Aula</label>
                    <Input
                      placeholder="Ex: Aula 01 - Introdução"
                      value={lesson.name}
                      onChange={(e) => updateLesson(index, 'name', e.target.value)}
                      disabled={lesson.status !== 'pending'}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Conteúdo</label>
                    <Textarea
                      placeholder="Cole o conteúdo da aula aqui..."
                      value={lesson.content}
                      onChange={(e) => updateLesson(index, 'content', e.target.value)}
                      className="min-h-[150px] font-mono text-sm"
                      disabled={lesson.status !== 'pending'}
                    />
                  </div>

                  {lesson.audioUrl && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Preview do Áudio</label>
                      <div className="flex items-center gap-3 p-3 bg-muted rounded">
                        <audio
                          id={`audio-${index}`}
                          src={lesson.audioUrl}
                          onEnded={() => setPlayingIndex(null)}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => togglePlay(index)}
                        >
                          {playingIndex === index ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </Button>
                        <span className="text-sm text-muted-foreground">
                          Áudio gerado com sucesso
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="flex justify-center">
          <Button variant="outline" onClick={() => navigate('/admin')}>
            Voltar ao Admin
          </Button>
        </div>
      </div>
    </div>
  );
}
