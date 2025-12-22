// V7 Lesson Test Page - Debug and preview lessons without full pipeline
// Features: JSON input, audio generation, database loading, full visualization
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Play, Pause, SkipForward, SkipBack, AlertTriangle, CheckCircle, XCircle,
  Upload, Database, Mic, RefreshCw, Volume2, VolumeX, ArrowLeft
} from 'lucide-react';
import { fimDaBrincadeiraScript } from '@/data/v7LessonScripts/fimDaBrincadeiraScript';

// Types
interface AnchorAction {
  id: string;
  keyword: string;
  type: 'pause' | 'show' | 'hide' | 'highlight' | 'trigger';
  once?: boolean;
}

interface WordTimestamp {
  word: string;
  start: number;
  end: number;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

interface LessonScript {
  id: string;
  title: string;
  totalDuration: number;
  audioUrl?: string;
  phases: any[];
  [key: string]: any;
}

const V7LessonTest = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Script source
  const [scriptSource, setScriptSource] = useState<'default' | 'json' | 'database'>('default');
  const [jsonInput, setJsonInput] = useState('');
  const [lessonId, setLessonId] = useState('');
  const [script, setScript] = useState<LessonScript>(fimDaBrincadeiraScript as any);

  // Audio
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [wordTimestamps, setWordTimestamps] = useState<WordTimestamp[]>([]);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [narrationText, setNarrationText] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Playback
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [audioDuration, setAudioDuration] = useState(0);

  // Validation
  const [validation, setValidation] = useState<ValidationResult>({ isValid: true, errors: [], warnings: [] });

  // Simulation interval
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load default narration
  useEffect(() => {
    const defaultNarration = (fimDaBrincadeiraScript as any).narration || '';
    setNarrationText(defaultNarration);
  }, []);

  // Validate script whenever it changes
  useEffect(() => {
    if (!script?.phases) return;

    const errors: string[] = [];
    const warnings: string[] = [];

    script.phases.forEach((phase: any, index: number) => {
      // Check interactive phases
      if (phase.type === 'interaction' || phase.type === 'playground') {
        const hasAnchors = (phase.anchorActions?.length > 0) || (phase.pauseKeywords?.length > 0);
        if (!hasAnchors) {
          errors.push(`Fase ${index + 1} (${phase.id}): Tipo interativo SEM anchorActions ou pauseKeywords!`);
        }
        if (!phase.audioBehavior) {
          warnings.push(`Fase ${index + 1} (${phase.id}): Sem audioBehavior definido`);
        }
        if (phase.audioBehavior?.onStart !== 'pause') {
          warnings.push(`Fase ${index + 1} (${phase.id}): Deveria ter onStart='pause', tem '${phase.audioBehavior?.onStart || 'undefined'}'`);
        }
      }
    });

    // Check duration
    const lastPhase = script.phases[script.phases.length - 1];
    if (lastPhase && lastPhase.endTime !== script.totalDuration) {
      warnings.push(`totalDuration (${script.totalDuration}s) ≠ última fase (${lastPhase.endTime}s)`);
    }

    // Check wordTimestamps
    if (wordTimestamps.length === 0) {
      warnings.push('Sem wordTimestamps - AnchorText não funcionará!');
    }

    setValidation({ isValid: errors.length === 0, errors, warnings });
  }, [script, wordTimestamps]);

  // Parse JSON input
  const handleParseJson = useCallback(() => {
    try {
      const parsed = JSON.parse(jsonInput);
      if (!parsed.phases || !Array.isArray(parsed.phases)) {
        throw new Error('JSON deve ter um array "phases"');
      }
      setScript(parsed);
      setCurrentTime(0);
      toast({ title: 'JSON carregado!', description: `${parsed.phases.length} fases encontradas` });
    } catch (err: any) {
      toast({ title: 'Erro no JSON', description: err.message, variant: 'destructive' });
    }
  }, [jsonInput, toast]);

  // Load from database
  const handleLoadFromDatabase = useCallback(async () => {
    if (!lessonId.trim()) {
      toast({ title: 'Digite o ID da aula', variant: 'destructive' });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lessonId.trim())
        .single();

      if (error) throw error;

      // Extract script from content
      const content = data.content as any;
      const phases = content?.cinematic_flow?.acts || content?.cinematicStructure?.acts || [];

      const loadedScript: LessonScript = {
        id: data.id,
        title: data.title,
        totalDuration: content?.cinematic_flow?.timeline?.totalDuration || 480,
        audioUrl: data.audio_url,
        phases: phases.map((act: any, i: number) => ({
          id: act.id || `phase-${i}`,
          type: act.type || 'narrative',
          startTime: act.startTime || 0,
          endTime: act.endTime || 60,
          anchorActions: act.anchorActions || [],
          pauseKeywords: act.pauseKeywords || [],
          audioBehavior: act.audioBehavior,
          scenes: act.scenes || [],
          ...act
        }))
      };

      setScript(loadedScript);
      setAudioUrl(data.audio_url);

      // Load word timestamps
      const timestamps = data.word_timestamps as any[];
      if (timestamps?.length > 0) {
        const normalized = timestamps.map(t => ({
          word: t.word,
          start: t.start ?? t.start_time ?? 0,
          end: t.end ?? t.end_time ?? 0
        }));
        setWordTimestamps(normalized);
      }

      setCurrentTime(0);
      toast({ title: 'Aula carregada!', description: `${loadedScript.phases.length} fases, ${timestamps?.length || 0} timestamps` });
    } catch (err: any) {
      toast({ title: 'Erro ao carregar', description: err.message, variant: 'destructive' });
    }
  }, [lessonId, toast]);

  // Generate audio via ElevenLabs
  const handleGenerateAudio = useCallback(async () => {
    if (!narrationText.trim()) {
      toast({ title: 'Digite o texto da narração', variant: 'destructive' });
      return;
    }

    setIsGeneratingAudio(true);

    try {
      // Call the v7-pipeline edge function with just audio generation
      const { data, error } = await supabase.functions.invoke('v7-pipeline', {
        body: {
          action: 'generate_audio_only',
          narrativeScript: narrationText,
          voice_id: 'pFZP5JQG7iQjIQuC4Bku', // Default voice
          generate_audio: true
        }
      });

      if (error) throw error;

      if (data?.audioUrl) {
        setAudioUrl(data.audioUrl);
        toast({ title: 'Áudio gerado!', description: 'URL do áudio disponível' });
      }

      if (data?.wordTimestamps?.length > 0) {
        setWordTimestamps(data.wordTimestamps);
        toast({ title: 'WordTimestamps!', description: `${data.wordTimestamps.length} palavras sincronizadas` });
      }
    } catch (err: any) {
      console.error('Audio generation error:', err);
      toast({ title: 'Erro ao gerar áudio', description: err.message, variant: 'destructive' });
    } finally {
      setIsGeneratingAudio(false);
    }
  }, [narrationText, toast]);

  // Audio element setup
  useEffect(() => {
    if (audioUrl && !audioRef.current) {
      audioRef.current = new Audio(audioUrl);
      audioRef.current.addEventListener('loadedmetadata', () => {
        setAudioDuration(audioRef.current?.duration || 0);
      });
      audioRef.current.addEventListener('timeupdate', () => {
        setCurrentTime(audioRef.current?.currentTime || 0);
      });
      audioRef.current.addEventListener('ended', () => {
        setIsPlaying(false);
      });
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [audioUrl]);

  // Play/pause
  const togglePlayPause = useCallback(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    } else {
      // Simulate playback without audio
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  // Simulated playback (when no audio)
  useEffect(() => {
    if (isPlaying && !audioRef.current) {
      intervalRef.current = setInterval(() => {
        setCurrentTime(t => {
          if (t >= script.totalDuration) {
            setIsPlaying(false);
            return script.totalDuration;
          }
          return t + 0.1;
        });
      }, 100);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, script.totalDuration]);

  // Seek
  const handleSeek = useCallback((value: number[]) => {
    const time = value[0];
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  }, []);

  // Mute
  const toggleMute = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
    setIsMuted(!isMuted);
  }, [isMuted]);

  // Find current phase and word
  const currentPhase = script.phases?.find(
    (p: any) => currentTime >= p.startTime && currentTime < p.endTime
  );
  const currentPhaseIndex = currentPhase ? script.phases.indexOf(currentPhase) : -1;

  const currentWord = wordTimestamps.find(
    w => currentTime >= w.start && currentTime < w.end
  );

  // Check if current word is an anchor keyword
  const isAnchorKeyword = useCallback((word: string) => {
    if (!currentPhase) return false;
    const keywords = [
      ...(currentPhase.anchorActions?.map((a: any) => a.keyword.toLowerCase()) || []),
      ...(currentPhase.pauseKeywords?.map((k: string) => k.toLowerCase()) || [])
    ];
    return keywords.includes(word.toLowerCase().replace(/[.,!?;:]/g, ''));
  }, [currentPhase]);

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Phase colors
  const getPhaseColor = (type: string) => {
    const colors: Record<string, string> = {
      loading: 'bg-gray-500',
      dramatic: 'bg-red-500',
      narrative: 'bg-blue-500',
      interaction: 'bg-purple-500',
      playground: 'bg-green-500',
      revelation: 'bg-yellow-500',
      gamification: 'bg-pink-500',
      cta: 'bg-orange-500'
    };
    return colors[type] || 'bg-gray-400';
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/manual-hub')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold">🧪 V7 Lesson Test</h1>
            <p className="text-gray-400">Teste e debug de aulas V7 com visualização de fases e sincronização</p>
          </div>
        </div>

        {/* Source Selection */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle>📥 Fonte do Script</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={scriptSource} onValueChange={(v) => setScriptSource(v as any)}>
              <TabsList className="grid grid-cols-3 w-full max-w-md">
                <TabsTrigger value="default">Default</TabsTrigger>
                <TabsTrigger value="json">JSON</TabsTrigger>
                <TabsTrigger value="database">Database</TabsTrigger>
              </TabsList>

              <TabsContent value="default" className="mt-4">
                <p className="text-sm text-gray-400 mb-2">
                  Usando: <code className="bg-gray-700 px-2 py-1 rounded">fimDaBrincadeiraScript</code>
                </p>
                <Button onClick={() => setScript(fimDaBrincadeiraScript as any)} variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" /> Recarregar Default
                </Button>
              </TabsContent>

              <TabsContent value="json" className="mt-4 space-y-4">
                <Textarea
                  placeholder='Cole seu JSON aqui... { "id": "...", "title": "...", "phases": [...] }'
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  className="h-40 font-mono text-xs bg-gray-900"
                />
                <Button onClick={handleParseJson}>
                  <Upload className="w-4 h-4 mr-2" /> Carregar JSON
                </Button>
              </TabsContent>

              <TabsContent value="database" className="mt-4 space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="ID da aula (UUID)"
                    value={lessonId}
                    onChange={(e) => setLessonId(e.target.value)}
                    className="max-w-md bg-gray-900"
                  />
                  <Button onClick={handleLoadFromDatabase}>
                    <Database className="w-4 h-4 mr-2" /> Carregar
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Audio Generation */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle>🎙️ Geração de Áudio (ElevenLabs)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Cole o texto da narração aqui para gerar áudio e wordTimestamps..."
              value={narrationText}
              onChange={(e) => setNarrationText(e.target.value)}
              className="h-32 font-mono text-xs bg-gray-900"
            />
            <div className="flex gap-4 items-center">
              <Button onClick={handleGenerateAudio} disabled={isGeneratingAudio}>
                <Mic className="w-4 h-4 mr-2" />
                {isGeneratingAudio ? 'Gerando...' : 'Gerar Áudio + Timestamps'}
              </Button>
              {audioUrl && (
                <Badge variant="outline" className="text-green-400">
                  ✅ Áudio disponível
                </Badge>
              )}
              {wordTimestamps.length > 0 && (
                <Badge variant="outline" className="text-blue-400">
                  📝 {wordTimestamps.length} palavras
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Validation */}
        <Card className={`border ${validation.isValid ? 'border-green-500/50 bg-green-900/20' : 'border-red-500/50 bg-red-900/20'}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {validation.isValid ? <CheckCircle className="text-green-500" /> : <XCircle className="text-red-500" />}
              Validação
            </CardTitle>
          </CardHeader>
          <CardContent>
            {validation.errors.length > 0 && (
              <div className="mb-4">
                <h4 className="text-red-400 font-semibold mb-2">❌ Erros ({validation.errors.length}):</h4>
                <ul className="list-disc list-inside space-y-1">
                  {validation.errors.map((err, i) => (
                    <li key={i} className="text-red-300 text-sm">{err}</li>
                  ))}
                </ul>
              </div>
            )}
            {validation.warnings.length > 0 && (
              <div>
                <h4 className="text-yellow-400 font-semibold mb-2">⚠️ Avisos ({validation.warnings.length}):</h4>
                <ul className="list-disc list-inside space-y-1">
                  {validation.warnings.map((warn, i) => (
                    <li key={i} className="text-yellow-300 text-sm">{warn}</li>
                  ))}
                </ul>
              </div>
            )}
            {validation.isValid && validation.warnings.length === 0 && (
              <p className="text-green-400">✅ Tudo OK!</p>
            )}
          </CardContent>
        </Card>

        {/* Lesson Info */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle>{script.title || 'Sem título'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
              <div><span className="text-gray-400">ID:</span> <span className="font-mono">{script.id}</span></div>
              <div><span className="text-gray-400">Duração:</span> {formatTime(script.totalDuration || 0)}</div>
              <div><span className="text-gray-400">Fases:</span> {script.phases?.length || 0}</div>
              <div><span className="text-gray-400">Interativas:</span> {script.phases?.filter((p: any) => p.type === 'interaction' || p.type === 'playground').length || 0}</div>
              <div><span className="text-gray-400">Timestamps:</span> {wordTimestamps.length}</div>
            </div>
          </CardContent>
        </Card>

        {/* Player Controls */}
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4 mb-4">
              <Button variant="outline" size="icon" onClick={() => handleSeek([Math.max(0, currentTime - 10)])}>
                <SkipBack className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={togglePlayPause}>
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button variant="outline" size="icon" onClick={() => handleSeek([Math.min(script.totalDuration, currentTime + 10)])}>
                <SkipForward className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={toggleMute}>
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
              <span className="font-mono text-lg min-w-[120px]">
                {formatTime(currentTime)} / {formatTime(audioDuration || script.totalDuration)}
              </span>
              {currentWord && (
                <Badge className={isAnchorKeyword(currentWord.word) ? 'bg-purple-500 animate-pulse' : 'bg-gray-600'}>
                  "{currentWord.word}"
                </Badge>
              )}
            </div>
            <Slider
              value={[currentTime]}
              max={audioDuration || script.totalDuration}
              step={0.1}
              onValueChange={handleSeek}
            />
          </CardContent>
        </Card>

        {/* Visual Timeline */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle>Timeline Visual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative h-16 bg-gray-700 rounded-lg overflow-hidden">
              {script.phases?.map((phase: any, i: number) => {
                const totalDur = audioDuration || script.totalDuration;
                const left = (phase.startTime / totalDur) * 100;
                const width = ((phase.endTime - phase.startTime) / totalDur) * 100;
                const isActive = currentPhaseIndex === i;

                return (
                  <div
                    key={phase.id || i}
                    className={`absolute h-full ${getPhaseColor(phase.type)} ${isActive ? 'ring-2 ring-white z-10' : 'opacity-70'} cursor-pointer hover:opacity-100 transition-all`}
                    style={{ left: `${left}%`, width: `${width}%` }}
                    onClick={() => handleSeek([phase.startTime])}
                    title={`${phase.id} (${phase.type}) - ${formatTime(phase.startTime)}`}
                  >
                    <div className="h-full flex items-center justify-center text-xs font-semibold truncate px-1">
                      {phase.type}
                    </div>
                  </div>
                );
              })}
              <div
                className="absolute h-full w-0.5 bg-white z-20"
                style={{ left: `${(currentTime / (audioDuration || script.totalDuration)) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Current Phase Details */}
        {currentPhase && (
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge className={getPhaseColor(currentPhase.type)}>{currentPhase.type.toUpperCase()}</Badge>
                Fase Atual: {currentPhase.id}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">⏱️ Timing</h4>
                  <div className="text-sm space-y-1">
                    <p>Start: {formatTime(currentPhase.startTime)}</p>
                    <p>End: {formatTime(currentPhase.endTime)}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">🎯 Anchors</h4>
                  {(currentPhase.anchorActions?.length > 0 || currentPhase.pauseKeywords?.length > 0) ? (
                    <div className="space-y-1">
                      {currentPhase.anchorActions?.map((a: any, i: number) => (
                        <Badge key={i} variant="outline" className="mr-1 text-green-400">"{a.keyword}"</Badge>
                      ))}
                      {currentPhase.pauseKeywords?.map((k: string, i: number) => (
                        <Badge key={i} variant="outline" className="mr-1 text-blue-400">"{k}"</Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-red-400 text-sm">⚠️ NENHUM</p>
                  )}
                </div>
                <div>
                  <h4 className="font-semibold mb-2">🔊 Audio</h4>
                  {currentPhase.audioBehavior ? (
                    <div className="text-sm">
                      <p>onStart: <code className="bg-gray-700 px-1 rounded">{currentPhase.audioBehavior.onStart}</code></p>
                      <p>volume: {currentPhase.audioBehavior.duringInteraction?.mainVolume ?? '-'}</p>
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm">-</p>
                  )}
                </div>
                <div>
                  <h4 className="font-semibold mb-2">🎬 Scenes</h4>
                  <p className="text-sm">{currentPhase.scenes?.length || 0} cenas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Word Timestamps Preview */}
        {wordTimestamps.length > 0 && (
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle>📝 WordTimestamps ({wordTimestamps.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1 max-h-60 overflow-y-auto p-2 bg-gray-900 rounded">
                {wordTimestamps.map((ts, i) => {
                  const isCurrent = currentTime >= ts.start && currentTime < ts.end;
                  const isKeyword = isAnchorKeyword(ts.word);

                  return (
                    <span
                      key={i}
                      className={`px-1.5 py-0.5 rounded text-xs cursor-pointer transition-all ${
                        isCurrent ? 'bg-blue-500 scale-110' :
                        isKeyword ? 'bg-purple-600 ring-1 ring-purple-400' :
                        'bg-gray-700 hover:bg-gray-600'
                      }`}
                      onClick={() => handleSeek([ts.start])}
                      title={`${formatTime(ts.start)} - ${formatTime(ts.end)}`}
                    >
                      {ts.word}
                    </span>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Phases Table */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle>📋 Todas as Fases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-2 px-2">#</th>
                    <th className="text-left py-2 px-2">ID</th>
                    <th className="text-left py-2 px-2">Tipo</th>
                    <th className="text-left py-2 px-2">Tempo</th>
                    <th className="text-left py-2 px-2">Anchors</th>
                    <th className="text-left py-2 px-2">Audio</th>
                    <th className="text-left py-2 px-2">OK</th>
                  </tr>
                </thead>
                <tbody>
                  {script.phases?.map((phase: any, i: number) => {
                    const isInteractive = phase.type === 'interaction' || phase.type === 'playground';
                    const hasAnchors = (phase.anchorActions?.length > 0) || (phase.pauseKeywords?.length > 0);
                    const isValid = !isInteractive || hasAnchors;

                    return (
                      <tr
                        key={phase.id || i}
                        className={`border-b border-gray-700 hover:bg-gray-700 cursor-pointer ${currentPhaseIndex === i ? 'bg-gray-700' : ''}`}
                        onClick={() => handleSeek([phase.startTime])}
                      >
                        <td className="py-2 px-2">{i + 1}</td>
                        <td className="py-2 px-2 font-mono text-xs">{phase.id}</td>
                        <td className="py-2 px-2">
                          <Badge className={`${getPhaseColor(phase.type)} text-xs`}>{phase.type}</Badge>
                        </td>
                        <td className="py-2 px-2 font-mono">{formatTime(phase.startTime)}-{formatTime(phase.endTime)}</td>
                        <td className="py-2 px-2">
                          {hasAnchors ? (
                            <span className="text-green-400 text-xs">
                              {phase.anchorActions?.map((a: any) => a.keyword).join(', ') || phase.pauseKeywords?.join(', ')}
                            </span>
                          ) : (
                            <span className={isInteractive ? 'text-red-400' : 'text-gray-500'}>
                              {isInteractive ? '⚠️' : '-'}
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-2 text-xs">
                          {phase.audioBehavior?.onStart || '-'}
                        </td>
                        <td className="py-2 px-2">
                          {isValid ? <CheckCircle className="h-4 w-4 text-green-500" /> : <AlertTriangle className="h-4 w-4 text-red-500" />}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default V7LessonTest;
