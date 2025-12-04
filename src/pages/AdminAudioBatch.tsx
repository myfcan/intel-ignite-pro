import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Play, Pause, CheckCircle, RefreshCw, Upload, FileUp, AlertTriangle, Eye, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import AudioSyncPreview from '@/components/admin/AudioSyncPreview';

interface SectionMarker {
  phrase: string;
  sectionId: string;
}

interface BatchLesson {
  name: string;
  content: string;
  orderIndex?: number;
  status: 'pending' | 'generating' | 'generated' | 'approved' | 'error';
  audioUrl?: string;
  timestamps?: any;
  error?: string;
  hasConflict?: boolean;
  conflictingLessonTitle?: string;
  sections?: Array<{ id: string; text: string; timestamp: number }>;
  sectionMarkers?: SectionMarker[];
  sectionTimestamps?: Record<string, number>;
}

export default function AdminAudioBatch() {
  const navigate = useNavigate();
  const [trail, setTrail] = useState('');
  const [lessons, setLessons] = useState<BatchLesson[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [isCheckingConflicts, setIsCheckingConflicts] = useState(false);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const extractOrderIndex = (name: string): number => {
    // Padrões: trilha01-aula03, Aula 03, aula-03, etc
    const match = name.match(/aula[_-\s]*(\d+)/i);
    if (match) return parseInt(match[1], 10);
    
    // Fallback: pegar qualquer número no nome
    const anyNumber = name.match(/(\d+)/);
    return anyNumber ? parseInt(anyNumber[1], 10) : 1;
  };

  const detectSectionMarkers = (content: string): SectionMarker[] => {
    const markers: SectionMarker[] = [];
    
    // Padrão 1: Detectar marcadores explícitos como "--- SECTION_01 ---"
    const explicitMarkerRegex = /---\s*([A-Z_0-9-]+)\s*---/g;
    let match;
    
    while ((match = explicitMarkerRegex.exec(content)) !== null) {
      const sectionId = match[1].toLowerCase().replace(/_/g, '-');
      const sectionStart = match.index + match[0].length;
      
      // Pegar as primeiras 50 palavras após o marcador como phrase
      const textAfter = content.substring(sectionStart).trim();
      const phrase = textAfter.substring(0, 100).split(/\s+/).slice(0, 10).join(' ');
      
      if (phrase) {
        markers.push({
          phrase: phrase.trim(),
          sectionId: sectionId
        });
      }
    }
    
    // Padrão 2: Se não encontrou marcadores explícitos, dividir por parágrafos
    if (markers.length === 0) {
      const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 50);
      paragraphs.forEach((paragraph, index) => {
        const phrase = paragraph.trim().substring(0, 100).split(/\s+/).slice(0, 10).join(' ');
        markers.push({
          phrase: phrase.trim(),
          sectionId: `section-${index + 1}`
        });
      });
    }
    
    console.log(`🔍 Detectados ${markers.length} section markers:`, markers);
    return markers;
  };

  const checkForConflicts = async (lessonsToCheck: BatchLesson[]) => {
    if (!trail.trim()) return lessonsToCheck;

    setIsCheckingConflicts(true);
    try {
      // Buscar trilha
      const { data: trailData } = await supabase
        .from('trails')
        .select('id')
        .eq('title', trail)
        .maybeSingle();

      if (!trailData) {
        // Trilha não existe, sem conflitos
        return lessonsToCheck.map(l => ({ ...l, hasConflict: false }));
      }

      // Buscar todas as aulas existentes na trilha
      const { data: existingLessons } = await supabase
        .from('lessons')
        .select('order_index, title')
        .eq('trail_id', trailData.id);

      if (!existingLessons || existingLessons.length === 0) {
        return lessonsToCheck.map(l => ({ ...l, hasConflict: false }));
      }

      // Mapear order_index existentes
      const existingOrderIndexes = new Map(
        existingLessons.map(l => [l.order_index, l.title])
      );

      // Verificar conflitos
      const updatedLessons = lessonsToCheck.map(lesson => {
        const orderIndex = lesson.orderIndex || extractOrderIndex(lesson.name);
        const conflictingTitle = existingOrderIndexes.get(orderIndex);
        
        return {
          ...lesson,
          hasConflict: !!conflictingTitle,
          conflictingLessonTitle: conflictingTitle || undefined
        };
      });

      const conflictCount = updatedLessons.filter(l => l.hasConflict).length;
      if (conflictCount > 0) {
        toast.warning(`⚠️ ${conflictCount} aula(s) com order_index conflitante detectada(s)`);
      }

      return updatedLessons;
    } catch (error: any) {
      console.error('Erro ao verificar conflitos:', error);
      toast.error('Erro ao verificar conflitos: ' + error.message);
      return lessonsToCheck;
    } finally {
      setIsCheckingConflicts(false);
    }
  };

  // Verificar conflitos quando a trilha muda
  useEffect(() => {
    if (trail.trim() && lessons.length > 0) {
      checkForConflicts(lessons).then(setLessons);
    }
  }, [trail]);

  const addLesson = () => {
    setLessons([...lessons, { name: '', content: '', status: 'pending' }]);
  };

  const updateLesson = (index: number, field: 'name' | 'content', value: string) => {
    const updated = [...lessons];
    updated[index][field] = value;
    // Recalcular orderIndex quando o nome muda
    if (field === 'name' && value.trim()) {
      updated[index].orderIndex = extractOrderIndex(value);
    }
    setLessons(updated);
  };

  const removeLesson = (index: number) => {
    setLessons(lessons.filter((_, i) => i !== index));
  };

  const parseCSV = (text: string): BatchLesson[] => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('CSV deve conter cabeçalho e pelo menos uma linha de dados');
    }

    const header = lines[0].toLowerCase().split(',').map(h => h.trim());
    const nameIndex = header.findIndex(h => h === 'name' || h === 'nome' || h === 'title' || h === 'titulo');
    const contentIndex = header.findIndex(h => h === 'content' || h === 'conteudo' || h === 'texto' || h === 'text');

    if (nameIndex === -1 || contentIndex === -1) {
      throw new Error('CSV deve conter colunas "name" e "content" (ou "nome" e "conteudo")');
    }

    const parsed: BatchLesson[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;

      // Simple CSV parsing (doesn't handle commas inside quotes perfectly)
      const values = line.split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
      
      if (values[nameIndex] && values[contentIndex]) {
        const lessonName = values[nameIndex];
        parsed.push({
          name: lessonName,
          content: values[contentIndex],
          orderIndex: extractOrderIndex(lessonName),
          status: 'pending'
        });
      }
    }

    return parsed;
  };

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('Arquivo muito grande. Máximo: 5MB');
      return;
    }

    try {
      const text = await file.text();
      let importedLessons: BatchLesson[] = [];

      if (file.name.endsWith('.json')) {
        const data = JSON.parse(text);
        
        // Support different JSON formats
        if (Array.isArray(data)) {
          importedLessons = data.map((item: any) => {
            const lessonName = item.name || item.title || item.nome || item.titulo || '';
            return {
              name: lessonName,
              content: item.content || item.text || item.conteudo || item.texto || '',
              orderIndex: item.orderIndex || item.order_index || extractOrderIndex(lessonName),
              status: 'pending' as const
            };
          });
        } else if (data.lessons && Array.isArray(data.lessons)) {
          importedLessons = data.lessons.map((item: any) => {
            const lessonName = item.name || item.title || item.nome || item.titulo || '';
            return {
              name: lessonName,
              content: item.content || item.text || item.conteudo || item.texto || '',
              orderIndex: item.orderIndex || item.order_index || extractOrderIndex(lessonName),
              status: 'pending' as const
            };
          });
        } else if (data.trail) {
          setTrail(data.trail);
          if (data.lessons && Array.isArray(data.lessons)) {
            importedLessons = data.lessons.map((item: any) => {
              const lessonName = item.name || item.title || item.nome || item.titulo || '';
              return {
                name: lessonName,
                content: item.content || item.text || item.conteudo || item.texto || '',
                orderIndex: item.orderIndex || item.order_index || extractOrderIndex(lessonName),
                status: 'pending' as const
              };
            });
          }
        }
      } else if (file.name.endsWith('.csv')) {
        importedLessons = parseCSV(text);
      } else {
        toast.error('Formato não suportado. Use JSON ou CSV');
        return;
      }

      // Validate imported data
      const validLessons = importedLessons.filter(l => l.name.trim() && l.content.trim());
      
      if (validLessons.length === 0) {
        toast.error('Nenhuma aula válida encontrada no arquivo');
        return;
      }

      if (validLessons.length < importedLessons.length) {
        toast.warning(`${importedLessons.length - validLessons.length} aula(s) ignorada(s) por dados incompletos`);
      }

      // Verificar conflitos antes de adicionar
      const lessonsWithConflicts = await checkForConflicts(validLessons);
      setLessons(lessonsWithConflicts);
      toast.success(`${validLessons.length} aula(s) importada(s) com sucesso!`);
      
    } catch (error: any) {
      console.error('Erro ao importar arquivo:', error);
      toast.error('Erro ao processar arquivo: ' + error.message);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const base64ToBlob = (base64: string, contentType: string) => {
    if (!base64 || typeof base64 !== 'string') {
      throw new Error('Base64 inválido ou vazio');
    }
    
    try {
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
    } catch (error: any) {
      console.error('Erro ao decodificar base64:', error);
      throw new Error('Falha ao converter base64 para blob: ' + error.message);
    }
  };

  const generateAudio = async (index: number) => {
    const lesson = lessons[index];
    
    if (!lesson.content.trim()) {
      toast.error('Conteúdo vazio para: ' + lesson.name);
      return;
    }

    if (lesson.hasConflict) {
      toast.warning(`⚠️ Esta aula substituirá "${lesson.conflictingLessonTitle}" (order_index: ${lesson.orderIndex})`);
    }

    const updated = [...lessons];
    updated[index].status = 'generating';
    setLessons(updated);

    try {
      console.log('🎤 Gerando áudio para:', lesson.name);
      console.log('📝 Tamanho do texto:', lesson.content.length);
      
      // Detectar section markers automaticamente
      const sectionMarkers = detectSectionMarkers(lesson.content);
      updated[index].sectionMarkers = sectionMarkers;
      
      console.log(`🔍 Detectados ${sectionMarkers.length} section markers`);
      
      // Usar generate-audio-with-timestamps para obter section timestamps
      const { data, error } = await supabase.functions.invoke('generate-audio-with-timestamps', {
        body: {
          text: lesson.content,
          voice_id: 'Xb7hH8MSUJpSbSDYk0k2',
          model_id: 'eleven_multilingual_v2',
          section_markers: sectionMarkers
        }
      });

      console.log('📦 Resposta recebida:', { 
        hasData: !!data, 
        hasError: !!error,
        dataKeys: data ? Object.keys(data) : [],
        audioBase64Length: data?.audio_base64?.length,
        wordTimestampsCount: data?.word_timestamps?.length,
        sectionTimestampsCount: data?.section_timestamps ? Object.keys(data.section_timestamps).length : 0
      });

      if (error) {
        console.error('❌ Erro da edge function:', error);
        throw error;
      }

      if (!data?.audio_base64) {
        console.error('❌ Resposta sem audio_base64:', data);
        throw new Error('Resposta da API não contém áudio');
      }

      console.log('🔄 Convertendo base64 para blob...');
      const blob = base64ToBlob(data.audio_base64, 'audio/mpeg');
      const url = URL.createObjectURL(blob);
      console.log('✅ Blob URL criado:', url);

      // Processar section timestamps
      const sections: Array<{ id: string; text: string; timestamp: number }> = [];
      if (data.section_timestamps) {
        Object.entries(data.section_timestamps).forEach(([sectionId, timestamp]) => {
          const marker = sectionMarkers.find(m => m.sectionId === sectionId);
          sections.push({
            id: sectionId,
            text: marker?.phrase || '',
            timestamp: timestamp as number
          });
        });
        console.log(`✅ ${sections.length} section timestamps mapeados`);
      }

      updated[index].audioUrl = url;
      updated[index].timestamps = data.word_timestamps;
      updated[index].sectionTimestamps = data.section_timestamps;
      updated[index].sections = sections;
      updated[index].status = 'generated';
      setLessons(updated);
      
      console.log('✅ Estado atualizado para:', updated[index].status);
      console.log('✅ Sections:', sections);
      toast.success(`✅ Áudio gerado com ${sections.length} seções detectadas: ${lesson.name}`);
    } catch (error: any) {
      console.error('💥 Erro ao gerar áudio:', error);
      console.error('Stack trace:', error.stack);
      updated[index].status = 'error';
      updated[index].error = error.message;
      setLessons(updated);
      toast.error(`Erro ao gerar: ${lesson.name} - ${error.message}`);
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

  const handleSaveSections = (index: number, sections: Array<{ id: string; text: string; timestamp: number }>) => {
    const updated = [...lessons];
    updated[index].sections = sections;
    setLessons(updated);
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

      // Preparar content com sections se disponível
      const contentData: any = { audioText: lesson.content };
      if (lesson.sections && lesson.sections.length > 0) {
        contentData.sections = lesson.sections;
      }

      // Criar ou atualizar lesson
      const finalOrderIndex = lesson.orderIndex || extractOrderIndex(lesson.name);
      const { error: lessonError } = await supabase
        .from('lessons')
        .upsert({
          title: lesson.name,
          trail_id: trailData.id,
          audio_url: publicUrl,
          word_timestamps: lesson.timestamps,
          lesson_type: 'guided',
          content: contentData,
          order_index: finalOrderIndex
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
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/manual')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold">Gerador de Áudio em Lote</h1>
            <p className="text-muted-foreground">
              Sistema automatizado para gerar múltiplos áudios de uma vez
            </p>
          </div>
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

            <div className="space-y-2">
              <label className="text-sm font-medium">Importar Aulas</label>
              <div className="flex gap-2">
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,.csv"
                  onChange={handleFileImport}
                  className="hidden"
                  id="file-import"
                />
                <Button 
                  onClick={() => fileInputRef.current?.click()} 
                  variant="outline" 
                  className="flex-1"
                >
                  <FileUp className="w-4 h-4 mr-2" />
                  Importar JSON/CSV
                </Button>
                <Button onClick={addLesson} variant="outline" className="flex-1">
                  <Upload className="w-4 h-4 mr-2" />
                  Adicionar Manualmente
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                JSON: {"{"}"trail": "Nome", "lessons": [{"{"}"name": "...", "content": "..."{"}"}]{"}"}
                <br />
                CSV: name,content (ou nome,conteudo)
              </p>
            </div>

            <Button 
              onClick={generateAllAudios} 
              disabled={isGenerating || lessons.length === 0}
              className="w-full"
              size="lg"
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
          </CardContent>
        </Card>

        {lessons.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Aulas ({lessons.length})</h2>
            
            {lessons.map((lesson, index) => (
              <Card key={index} className={
                lesson.status === 'approved' ? 'border-green-500' :
                lesson.status === 'error' ? 'border-red-500' :
                lesson.hasConflict ? 'border-amber-500' : ''
              }>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {lesson.name || `Aula ${index + 1}`}
                        {lesson.orderIndex && (
                          <span className="text-muted-foreground text-base font-normal">
                            (order_index: {lesson.orderIndex})
                          </span>
                        )}
                        {lesson.hasConflict && (
                          <span className="inline-flex items-center gap-1 text-sm font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded">
                            <AlertTriangle className="w-4 h-4" />
                            Conflito
                          </span>
                        )}
                      </CardTitle>
                    </div>
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
                            variant="outline"
                            onClick={() => setPreviewIndex(index)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Preview
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
                  {lesson.hasConflict && (
                    <Alert className="border-amber-500 bg-amber-50">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      <AlertDescription className="text-amber-800">
                        Já existe uma aula "{lesson.conflictingLessonTitle}" com order_index {lesson.orderIndex}.
                        Ao aprovar esta aula, ela será substituída no banco de dados.
                      </AlertDescription>
                    </Alert>
                  )}
                  
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
                    <div className="space-y-4">
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

                      {lesson.sections && lesson.sections.length > 0 && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            🎯 Seções Detectadas ({lesson.sections.length})
                          </label>
                          <div className="border rounded-lg p-4 bg-background space-y-2 max-h-[300px] overflow-y-auto">
                            {lesson.sections.map((section, sIdx) => (
                              <div 
                                key={sIdx} 
                                className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                              >
                                <div className="flex-shrink-0 w-16 text-center">
                                  <div className="text-sm font-mono font-bold text-primary">
                                    {Math.floor(section.timestamp / 60)}:{String(section.timestamp % 60).padStart(2, '0')}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {section.timestamp}s
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-mono text-muted-foreground mb-1">
                                    {section.id}
                                  </div>
                                  <div className="text-sm text-foreground line-clamp-2">
                                    {section.text}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
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

      {/* Audio Sync Preview Dialog */}
      {previewIndex !== null && lessons[previewIndex] && (
        <AudioSyncPreview
          open={previewIndex !== null}
          onOpenChange={(open) => !open && setPreviewIndex(null)}
          audioUrl={lessons[previewIndex].audioUrl || ''}
          content={lessons[previewIndex].content}
          lessonName={lessons[previewIndex].name}
          onSave={(sections) => handleSaveSections(previewIndex, sections)}
          onApprove={() => approveLesson(previewIndex)}
        />
      )}
    </div>
  );
}
