import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Download, Copy, Play, Pause, Volume2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fundamentos02, fundamentos02AudioText } from '@/data/lessons/fundamentos-02';

interface SectionMarker {
  phrase: string;
  sectionId: string;
}

interface Lesson {
  id: string;
  title: string;
  content: any;
}

export default function AdminAudioGenerator() {
  const [text, setText] = useState('');
  const [markers, setMarkers] = useState<SectionMarker[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [timestamps, setTimestamps] = useState<any>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string>('');
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [qualityAnalysis, setQualityAnalysis] = useState<any>(null);
  
  // Estados para reprodução de áudio
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    const { data, error } = await supabase
      .from('lessons')
      .select('id, title, content')
      .eq('lesson_type', 'guided')
      .order('title');

    if (error) {
      console.error('Erro ao buscar lições:', error);
      toast.error('Erro ao carregar lições');
      return;
    }

    setLessons(data || []);
  };

  // Auto-load lesson content when selected
  useEffect(() => {
    if (selectedLessonId) {
      const lesson = lessons.find(l => l.id === selectedLessonId);
      if (lesson) {
        // 🔥 PRIORITY: Try to load from local TypeScript files first
        // This is where we have the complete audioText
        let lessonText = '';
        const lessonMarkers: SectionMarker[] = [];
        
        // Map lesson IDs to their local data
        const localLessons: Record<string, { audioText: string; sections: any[] }> = {
          'fundamentos-02': {
            audioText: fundamentos02AudioText,
            sections: fundamentos02.sections
          }
          // Add more lessons here as they are created
        };
        
        // Check if we have local data for this lesson
        if (localLessons[selectedLessonId]) {
          const localData = localLessons[selectedLessonId];
          lessonText = localData.audioText;
          
          // Create markers from sections
          // CRITICAL: Include speechBubbleText because that's what's sent to ElevenLabs!
          localData.sections.forEach((section: any, index: number) => {
            // Concatenate speechBubbleText + visualContent (matching audio generation)
            const fullText = `${section.speechBubbleText || ''} ${section.visualContent || ''}`.trim();
            lessonMarkers.push({
              phrase: fullText.substring(0, 50) || '',
              sectionId: section.id || `section_${index}`
            });
          });
          
          setText(lessonText);
          setMarkers(lessonMarkers);
          toast.success('✅ Conteúdo carregado do arquivo local!');
          return;
        }
        
        // Fallback: Try to extract from database content
        if (lesson.content) {
          const content = lesson.content;
          
          if (content.sections && Array.isArray(content.sections)) {
            content.sections.forEach((section: any, index: number) => {
              if (section.visualContent) {
                lessonText += section.visualContent + '\n\n---\n\n';
                lessonMarkers.push({
                  phrase: section.visualContent.substring(0, 50),
                  sectionId: section.id || `section_${index}`
                });
              }
            });
          }
          
          if (lessonText) {
            setText(lessonText.trim());
            setMarkers(lessonMarkers);
            toast.success('Conteúdo da lição carregado!');
          } else {
            toast.error('⚠️ Nenhum texto encontrado. Cole o texto manualmente.');
          }
        }
      }
    }
  }, [selectedLessonId, lessons]);

  const handleGenerate = async () => {
    if (!text.trim()) {
      toast.error('Por favor, insira um texto');
      return;
    }

    if (markers.length === 0) {
      toast.error('Por favor, adicione pelo menos um marcador de seção');
      return;
    }

    setIsGenerating(true);
    setAudioUrl(null);
    setTimestamps(null);
    setQualityAnalysis(null);

    try {
      toast.info('Gerando áudio com timestamps...');

      const { data, error } = await supabase.functions.invoke('generate-audio-with-timestamps', {
        body: {
          text: text,
          voice_id: 'Xb7hH8MSUJpSbSDYk0k2',
          model_id: 'eleven_multilingual_v2',
          section_markers: markers
        }
      });

      if (error) throw error;

      const blob = base64ToBlob(data.audio_base64, 'audio/mpeg');
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      setTimestamps(data);

      toast.success('✅ Áudio gerado com sucesso!');

      // Se tiver lesson selecionada, salvar automaticamente
      if (selectedLessonId) {
        toast.info('Salvando no banco de dados...');
        
        // 🧹 Buscar áudio anterior para deletar
        const { data: lessonData } = await supabase
          .from('lessons')
          .select('audio_url')
          .eq('id', selectedLessonId)
          .single();

        // Deletar áudio antigo se existir
        if (lessonData?.audio_url) {
          try {
            const oldAudioPath = lessonData.audio_url.split('/lesson-audios/')[1];
            if (oldAudioPath) {
              const { error: deleteError } = await supabase.storage
                .from('lesson-audios')
                .remove([oldAudioPath]);
              
              if (deleteError) {
                console.warn('Erro ao deletar áudio antigo:', deleteError);
              } else {
                console.log('✅ Áudio antigo deletado:', oldAudioPath);
              }
            }
          } catch (err) {
            console.warn('Erro ao processar deleção:', err);
          }
        }
        
        // Upload do novo áudio
        const audioFileName = `lesson-${selectedLessonId}-${Date.now()}.mp3`;
        const { error: uploadError } = await supabase.storage
          .from('lesson-audios')
          .upload(audioFileName, blob, {
            contentType: 'audio/mpeg',
            upsert: true
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('lesson-audios')
          .getPublicUrl(audioFileName);

        // Atualizar a lesson
        const { error: updateError } = await supabase
          .from('lessons')
          .update({
            audio_url: publicUrl,
            word_timestamps: data.word_timestamps
          })
          .eq('id', selectedLessonId);

        if (updateError) throw updateError;

        toast.success('✅ Áudio salvo no banco de dados!');
      }

      // 🎯 Análise automática de qualidade
      toast.info('🔍 Analisando qualidade do áudio...');
      setIsAnalyzing(true);
      
      try {
        // Calcular duração esperada: 300s (5 minutos) como padrão baseado no texto
        const expectedDuration = Math.round(text.length / 15); // ~15 chars/second para fala natural
        
        const { data: qualityData, error: qualityError } = await supabase.functions.invoke('analyze-audio-quality', {
          body: {
            audio_base64: data.audio_base64,
            expected_duration: expectedDuration,
            text_length: text.length
          }
        });

        if (qualityError) {
          console.error('Erro na análise de qualidade:', qualityError);
          toast.error('⚠️ Análise de qualidade falhou, mas o áudio foi gerado');
        } else {
          setQualityAnalysis(qualityData);
          
          // Feedback baseado na recomendação
          if (qualityData.recommendation === 'regenerate') {
            toast.error(`❌ Qualidade baixa (${qualityData.quality_score}/100). Recomendado regenerar!`);
          } else if (qualityData.recommendation === 'review') {
            toast.warning(`⚠️ Qualidade média (${qualityData.quality_score}/100). Revisar antes de publicar.`);
          } else {
            toast.success(`✅ Qualidade excelente (${qualityData.quality_score}/100)! Inteligibilidade: ${qualityData.intelligibility_score}/100`);
          }
        }
      } catch (qualityError: any) {
        console.error('Erro ao analisar qualidade:', qualityError);
        toast.error('⚠️ Análise de qualidade não disponível');
      } finally {
        setIsAnalyzing(false);
      }

    } catch (error: any) {
      console.error('Erro ao gerar áudio:', error);
      toast.error(error.message || 'Erro ao gerar áudio');
    } finally {
      setIsGenerating(false);
    }
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

  const copyTimestamps = () => {
    if (!timestamps) return;
    
    const timestampsText = JSON.stringify(timestamps, null, 2);
    navigator.clipboard.writeText(timestampsText);
    toast.success('Timestamps copiados!');
  };

  const downloadAudio = () => {
    if (!audioUrl) return;
    
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = `audio-${Date.now()}.mp3`;
    link.click();
    toast.success('Download iniciado!');
  };

  const analyzeQuality = async () => {
    if (!audioUrl || !timestamps) {
      toast.error('Gere um áudio primeiro');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const audioBlob = await fetch(audioUrl).then(r => r.blob());
      const audioBase64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.readAsDataURL(audioBlob);
      });

      // Calcular duração esperada
      const expectedDuration = Math.round(text.length / 15);

      const { data, error } = await supabase.functions.invoke('analyze-audio-quality', {
        body: {
          audio_base64: audioBase64,
          expected_duration: expectedDuration,
          text_length: text.length
        }
      });

      if (error) throw error;

      setQualityAnalysis(data);
      
      // Feedback baseado na análise
      if (data.recommendation === 'regenerate') {
        toast.error(`Qualidade baixa (${data.quality_score}/100). Regenerar recomendado!`);
      } else if (data.recommendation === 'review') {
        toast.warning(`Qualidade média (${data.quality_score}/100). Revisar antes de publicar.`);
      } else {
        toast.success(`Qualidade excelente (${data.quality_score}/100)!`);
      }
      
    } catch (error: any) {
      console.error('Erro ao analisar qualidade:', error);
      toast.error('Erro ao analisar qualidade do áudio');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">🎙️ Gerador de Áudio com Timestamps</h1>
      </div>

      <div className="space-y-6">
        {/* Seletor de Aula */}
        <Card>
          <CardHeader>
            <CardTitle>Selecionar Aula (Opcional - salva automaticamente no banco)</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedLessonId} onValueChange={setSelectedLessonId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma aula..." />
              </SelectTrigger>
              <SelectContent>
                {lessons.map((lesson) => (
                  <SelectItem key={lesson.id} value={lesson.id}>
                    {lesson.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Texto da Lição */}
        <Card>
          <CardHeader>
            <CardTitle>Texto da Lição (Audio Text)</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Cole o texto da lição aqui..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[200px] font-mono text-sm"
            />
          </CardContent>
        </Card>

        {/* Seções Encontradas */}
        {markers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Seções encontradas no texto ({markers.length} marcações)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {markers.map((marker, index) => (
                  <div key={index} className="p-2 bg-muted rounded text-sm">
                    <span className="font-mono text-muted-foreground">{marker.sectionId}:</span> {marker.phrase}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Botão Gerar */}
        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !text.trim() || markers.length === 0}
          className="w-full"
          size="lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Gerando áudio...
            </>
          ) : (
            'Gerar Áudio com Timestamps'
          )}
        </Button>

        {/* Áudio Gerado */}
        {audioUrl && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>✅ Áudio Gerado!</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <audio
                  ref={audioRef}
                  src={audioUrl}
                  onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                  onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                  onEnded={() => setIsPlaying(false)}
                  className="hidden"
                />
                
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={togglePlay}
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  
                  <div className="flex-1">
                    <input
                      type="range"
                      min="0"
                      max={duration || 0}
                      value={currentTime}
                      onChange={(e) => {
                        const time = parseFloat(e.target.value);
                        setCurrentTime(time);
                        if (audioRef.current) {
                          audioRef.current.currentTime = time;
                        }
                      }}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>
                  
                  <Volume2 className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            {/* Timestamps de Seções */}
            {timestamps?.section_timestamps && (
              <Card>
                <CardHeader>
                  <CardTitle>Timestamps de Seções:</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {Object.entries(timestamps.section_timestamps).map(([sectionId, time]) => (
                      <div key={sectionId} className="flex justify-between p-2 bg-muted rounded text-sm">
                        <span className="font-mono">{sectionId}</span>
                        <span className="text-muted-foreground">{String(time)}s</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Timestamps de Palavras */}
            {timestamps?.word_timestamps && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    Timestamps de Palavras ({timestamps.word_timestamps.length} palavras):
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="max-h-[200px] overflow-y-auto">
                    <div className="space-y-1 font-mono text-xs">
                      {timestamps.word_timestamps.slice(0, 30).map((wt: any, i: number) => (
                        <div key={i} className="flex gap-2">
                          <span className="text-muted-foreground">{wt.start.toFixed(2)}s</span>
                          <span>{wt.word}</span>
                        </div>
                      ))}
                      {timestamps.word_timestamps.length > 30 && (
                        <div className="text-muted-foreground italic mt-2">
                          ... e mais {timestamps.word_timestamps.length - 30} palavras
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Botões de Ação */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={analyzeQuality}
                disabled={isAnalyzing}
                className="flex-1"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analisando...
                  </>
                ) : (
                  'Testar Qualidade'
                )}
              </Button>
              
              <Button
                variant="outline"
                onClick={copyTimestamps}
                className="flex-1"
              >
                <Copy className="mr-2 h-4 w-4" />
                Copiar Timestamps
              </Button>
              
              <Button
                variant="outline"
                onClick={downloadAudio}
                className="flex-1"
              >
                <Download className="mr-2 h-4 w-4" />
                Baixar Áudio
              </Button>
            </div>

            {/* Análise de Qualidade */}
            {qualityAnalysis && (
              <Card className={
                qualityAnalysis.recommendation === 'regenerate' ? 'border-destructive' :
                qualityAnalysis.recommendation === 'review' ? 'border-warning' :
                'border-success'
              }>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Análise de Qualidade</span>
                    <span className={`text-2xl font-bold ${
                      qualityAnalysis.recommendation === 'regenerate' ? 'text-destructive' :
                      qualityAnalysis.recommendation === 'review' ? 'text-warning' :
                      'text-success'
                    }`}>
                      {qualityAnalysis.quality_score}/100
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Métricas principais */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Qualidade Geral</p>
                      <p className="text-2xl font-bold">{qualityAnalysis.quality_score}/100</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Inteligibilidade</p>
                      <p className="text-2xl font-bold">{qualityAnalysis.intelligibility_score}/100</p>
                    </div>
                  </div>

                  {/* Estatísticas */}
                  <div className="border-t pt-4 space-y-2">
                    <p className="font-semibold text-sm">Estatísticas:</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Duração:</span>
                        <span className="font-mono">{qualityAnalysis.stats.total_duration}s</span>
                      </div>
                      {qualityAnalysis.stats.expected_duration && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Esperada:</span>
                          <span className="font-mono">{qualityAnalysis.stats.expected_duration}s</span>
                        </div>
                      )}
                      {qualityAnalysis.stats.duration_diff_percent !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Diferença:</span>
                          <span className={`font-mono ${qualityAnalysis.stats.duration_diff_percent > 10 ? 'text-warning' : ''}`}>
                            {qualityAnalysis.stats.duration_diff_percent}%
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Volume médio:</span>
                        <span className="font-mono">{qualityAnalysis.stats.avg_volume}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Silêncios:</span>
                        <span className="font-mono">{qualityAnalysis.stats.silence_count}</span>
                      </div>
                    </div>
                  </div>

                  {/* Problemas encontrados */}
                  {qualityAnalysis.issues.length > 0 && (
                    <div className="border-t pt-4 space-y-2">
                      <p className="font-semibold text-sm">Problemas Encontrados:</p>
                      <div className="space-y-2">
                        {qualityAnalysis.issues.map((issue, index) => (
                          <div key={index} className={`p-3 rounded-lg border ${
                            issue.severity === 'high' ? 'bg-destructive/10 border-destructive' :
                            issue.severity === 'medium' ? 'bg-warning/10 border-warning' :
                            'bg-muted border-border'
                          }`}>
                            <div className="flex items-start gap-2">
                              <span className={`text-xs font-semibold uppercase px-2 py-1 rounded ${
                                issue.severity === 'high' ? 'bg-destructive text-destructive-foreground' :
                                issue.severity === 'medium' ? 'bg-warning text-warning-foreground' :
                                'bg-muted-foreground text-muted'
                              }`}>
                                {issue.severity}
                              </span>
                              <div className="flex-1">
                                <p className="text-sm font-medium capitalize">{issue.type.replace(/_/g, ' ')}</p>
                                <p className="text-sm text-muted-foreground mt-1">{issue.description}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recomendação */}
                  <div className={`p-4 rounded-lg ${
                    qualityAnalysis.recommendation === 'regenerate' ? 'bg-destructive/10' :
                    qualityAnalysis.recommendation === 'review' ? 'bg-warning/10' :
                    'bg-success/10'
                  }`}>
                    <p className="font-semibold text-sm mb-1">Recomendação:</p>
                    <p className="text-sm">
                      {qualityAnalysis.recommendation === 'regenerate' && 
                        '❌ Qualidade insuficiente. Regenerar o áudio é altamente recomendado.'}
                      {qualityAnalysis.recommendation === 'review' && 
                        '⚠️ Qualidade aceitável, mas revisar antes de publicar.'}
                      {qualityAnalysis.recommendation === 'ok' && 
                        '✅ Qualidade excelente! Pronto para uso.'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
