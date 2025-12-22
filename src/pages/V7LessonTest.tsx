// V7 Lesson Test Page - Debug and preview lessons without full pipeline
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, SkipForward, SkipBack, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { fimDaBrincadeiraScript } from '@/data/v7LessonScripts/fimDaBrincadeiraScript';

// Types
interface AnchorAction {
  id: string;
  keyword: string;
  type: 'pause' | 'show' | 'hide' | 'highlight' | 'trigger';
  once?: boolean;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

const V7LessonTest = () => {
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedPhaseIndex, setSelectedPhaseIndex] = useState<number | null>(null);
  const [simulatedWordTimestamps, setSimulatedWordTimestamps] = useState<Array<{word: string, start: number, end: number}>>([]);
  const [validation, setValidation] = useState<ValidationResult>({ isValid: true, errors: [], warnings: [] });
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const script = fimDaBrincadeiraScript;

  // Validate lesson structure
  useEffect(() => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for interactive phases without anchorActions
    script.phases.forEach((phase, index) => {
      if (phase.type === 'interaction' || phase.type === 'playground') {
        if (!phase.anchorActions || phase.anchorActions.length === 0) {
          if (!phase.pauseKeywords || phase.pauseKeywords.length === 0) {
            errors.push(`Fase ${index + 1} (${phase.id}): Tipo interativo SEM anchorActions ou pauseKeywords!`);
          }
        }
      }

      // Check for audioBehavior in interactive phases
      if ((phase.type === 'interaction' || phase.type === 'playground') && !phase.audioBehavior) {
        warnings.push(`Fase ${index + 1} (${phase.id}): Sem audioBehavior definido`);
      }

      // Check audioBehavior.onStart for quiz
      if (phase.type === 'interaction' && phase.audioBehavior?.onStart !== 'pause') {
        warnings.push(`Fase ${index + 1} (${phase.id}): Quiz deveria ter onStart='pause', tem '${phase.audioBehavior?.onStart}'`);
      }
    });

    // Check total duration makes sense
    const lastPhase = script.phases[script.phases.length - 1];
    if (lastPhase && lastPhase.endTime !== script.totalDuration) {
      warnings.push(`totalDuration (${script.totalDuration}s) não bate com última fase (${lastPhase.endTime}s)`);
    }

    setValidation({
      isValid: errors.length === 0,
      errors,
      warnings
    });
  }, [script]);

  // Simulate playback
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentTime(t => {
          if (t >= script.totalDuration) {
            setIsPlaying(false);
            return script.totalDuration;
          }
          return t + 0.1;
        });
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, script.totalDuration]);

  // Find current phase
  const currentPhase = script.phases.find(
    p => currentTime >= p.startTime && currentTime < p.endTime
  );
  const currentPhaseIndex = currentPhase ? script.phases.indexOf(currentPhase) : -1;

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get phase type color
  const getPhaseColor = (type: string) => {
    switch (type) {
      case 'loading': return 'bg-gray-500';
      case 'dramatic': return 'bg-red-500';
      case 'narrative': return 'bg-blue-500';
      case 'interaction': return 'bg-purple-500';
      case 'playground': return 'bg-green-500';
      case 'revelation': return 'bg-yellow-500';
      case 'gamification': return 'bg-pink-500';
      default: return 'bg-gray-400';
    }
  };

  // Simulate adding word timestamps (for testing anchor detection)
  const generateMockTimestamps = () => {
    // Parse narration to create mock timestamps
    const narration = (script as any).narration || '';
    const words = narration.split(/\s+/).filter((w: string) => w.length > 0);
    const avgWordDuration = script.totalDuration / Math.max(words.length, 1);

    const timestamps = words.map((word: string, i: number) => ({
      word: word.replace(/[.,!?;:]/g, ''),
      start: i * avgWordDuration,
      end: (i + 1) * avgWordDuration
    }));

    setSimulatedWordTimestamps(timestamps);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">🧪 V7 Lesson Test</h1>
          <p className="text-gray-400">Debug e preview de aulas V7 sem pipeline</p>
        </div>

        {/* Validation Status */}
        <Card className="bg-gray-800 border-gray-700 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {validation.isValid ? (
                <CheckCircle className="text-green-500" />
              ) : (
                <XCircle className="text-red-500" />
              )}
              Validação do JSON
            </CardTitle>
          </CardHeader>
          <CardContent>
            {validation.errors.length > 0 && (
              <div className="mb-4">
                <h4 className="text-red-400 font-semibold mb-2">❌ Erros:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {validation.errors.map((err, i) => (
                    <li key={i} className="text-red-300 text-sm">{err}</li>
                  ))}
                </ul>
              </div>
            )}
            {validation.warnings.length > 0 && (
              <div>
                <h4 className="text-yellow-400 font-semibold mb-2">⚠️ Avisos:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {validation.warnings.map((warn, i) => (
                    <li key={i} className="text-yellow-300 text-sm">{warn}</li>
                  ))}
                </ul>
              </div>
            )}
            {validation.isValid && validation.warnings.length === 0 && (
              <p className="text-green-400">✅ Estrutura do JSON válida!</p>
            )}
          </CardContent>
        </Card>

        {/* Lesson Info */}
        <Card className="bg-gray-800 border-gray-700 mb-6">
          <CardHeader>
            <CardTitle>{script.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-400">ID:</span>
                <span className="ml-2 font-mono">{script.id}</span>
              </div>
              <div>
                <span className="text-gray-400">Duração:</span>
                <span className="ml-2">{formatTime(script.totalDuration)}</span>
              </div>
              <div>
                <span className="text-gray-400">Fases:</span>
                <span className="ml-2">{script.phases.length}</span>
              </div>
              <div>
                <span className="text-gray-400">Interativas:</span>
                <span className="ml-2">
                  {script.phases.filter(p => p.type === 'interaction' || p.type === 'playground').length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline Controls */}
        <Card className="bg-gray-800 border-gray-700 mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4 mb-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentTime(Math.max(0, currentTime - 10))}
              >
                <SkipBack className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentTime(Math.min(script.totalDuration, currentTime + 10))}
              >
                <SkipForward className="h-4 w-4" />
              </Button>
              <span className="font-mono text-lg">
                {formatTime(currentTime)} / {formatTime(script.totalDuration)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={generateMockTimestamps}
              >
                Gerar WordTimestamps Mock
              </Button>
            </div>
            <Slider
              value={[currentTime]}
              max={script.totalDuration}
              step={0.1}
              onValueChange={([v]) => setCurrentTime(v)}
              className="w-full"
            />
          </CardContent>
        </Card>

        {/* Visual Timeline */}
        <Card className="bg-gray-800 border-gray-700 mb-6">
          <CardHeader>
            <CardTitle>Timeline Visual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative h-16 bg-gray-700 rounded-lg overflow-hidden">
              {script.phases.map((phase, i) => {
                const left = (phase.startTime / script.totalDuration) * 100;
                const width = ((phase.endTime - phase.startTime) / script.totalDuration) * 100;
                const isActive = currentPhaseIndex === i;

                return (
                  <div
                    key={phase.id}
                    className={`absolute h-full ${getPhaseColor(phase.type)} ${isActive ? 'ring-2 ring-white' : 'opacity-70'} cursor-pointer hover:opacity-100 transition-all`}
                    style={{ left: `${left}%`, width: `${width}%` }}
                    onClick={() => setSelectedPhaseIndex(i)}
                    title={`${phase.id} (${phase.type})`}
                  >
                    <div className="h-full flex items-center justify-center text-xs font-semibold truncate px-1">
                      {phase.type}
                    </div>
                  </div>
                );
              })}
              {/* Current time indicator */}
              <div
                className="absolute h-full w-0.5 bg-white z-10"
                style={{ left: `${(currentTime / script.totalDuration) * 100}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-400">
              <span>0:00</span>
              <span>{formatTime(script.totalDuration / 2)}</span>
              <span>{formatTime(script.totalDuration)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Current Phase Info */}
        {currentPhase && (
          <Card className="bg-gray-800 border-gray-700 mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge className={getPhaseColor(currentPhase.type)}>
                  {currentPhase.type.toUpperCase()}
                </Badge>
                Fase Atual: {currentPhase.id}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Timing */}
                <div>
                  <h4 className="font-semibold mb-2">⏱️ Timing</h4>
                  <div className="text-sm space-y-1">
                    <p>Start: {formatTime(currentPhase.startTime)}</p>
                    <p>End: {formatTime(currentPhase.endTime)}</p>
                    <p>Duration: {formatTime(currentPhase.endTime - currentPhase.startTime)}</p>
                  </div>
                </div>

                {/* Anchor Actions */}
                <div>
                  <h4 className="font-semibold mb-2">🎯 Anchor Actions</h4>
                  {currentPhase.anchorActions && currentPhase.anchorActions.length > 0 ? (
                    <div className="space-y-2">
                      {currentPhase.anchorActions.map((action: AnchorAction, i: number) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <Badge variant="outline">{action.type}</Badge>
                          <code className="bg-gray-700 px-2 py-1 rounded">"{action.keyword}"</code>
                          {action.once && <span className="text-gray-400">(once)</span>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm">
                      {(currentPhase.type === 'interaction' || currentPhase.type === 'playground')
                        ? '⚠️ NENHUM - Fase não vai pausar!'
                        : 'Nenhum (não necessário)'}
                    </p>
                  )}
                </div>

                {/* Audio Behavior */}
                <div>
                  <h4 className="font-semibold mb-2">🔊 Audio Behavior</h4>
                  {currentPhase.audioBehavior ? (
                    <div className="text-sm space-y-1">
                      <p>onStart: <code className="bg-gray-700 px-1 rounded">{currentPhase.audioBehavior.onStart}</code></p>
                      <p>mainVolume: {currentPhase.audioBehavior.duringInteraction?.mainVolume ?? 'N/A'}</p>
                      <p>onComplete: <code className="bg-gray-700 px-1 rounded">{currentPhase.audioBehavior.onComplete}</code></p>
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm">Não definido</p>
                  )}
                </div>

                {/* Scenes */}
                <div>
                  <h4 className="font-semibold mb-2">🎬 Scenes ({currentPhase.scenes?.length || 0})</h4>
                  <div className="text-sm max-h-40 overflow-y-auto space-y-1">
                    {currentPhase.scenes?.map((scene: any, i: number) => (
                      <div key={i} className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">{scene.type}</Badge>
                        <span className="text-gray-400">{scene.id}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Phases Summary */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle>📋 Resumo de Todas as Fases</CardTitle>
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
                    <th className="text-left py-2 px-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {script.phases.map((phase, i) => {
                    const isInteractive = phase.type === 'interaction' || phase.type === 'playground';
                    const hasAnchors = (phase.anchorActions?.length || 0) > 0 || (phase.pauseKeywords?.length || 0) > 0;
                    const hasAudioBehavior = !!phase.audioBehavior;
                    const isValid = !isInteractive || hasAnchors;

                    return (
                      <tr
                        key={phase.id}
                        className={`border-b border-gray-700 hover:bg-gray-700 cursor-pointer ${currentPhaseIndex === i ? 'bg-gray-700' : ''}`}
                        onClick={() => setCurrentTime(phase.startTime)}
                      >
                        <td className="py-2 px-2">{i + 1}</td>
                        <td className="py-2 px-2 font-mono text-xs">{phase.id}</td>
                        <td className="py-2 px-2">
                          <Badge className={`${getPhaseColor(phase.type)} text-xs`}>
                            {phase.type}
                          </Badge>
                        </td>
                        <td className="py-2 px-2 font-mono">
                          {formatTime(phase.startTime)}-{formatTime(phase.endTime)}
                        </td>
                        <td className="py-2 px-2">
                          {hasAnchors ? (
                            <span className="text-green-400">
                              {phase.anchorActions?.map((a: AnchorAction) => a.keyword).join(', ') ||
                               phase.pauseKeywords?.join(', ')}
                            </span>
                          ) : (
                            <span className={isInteractive ? 'text-red-400' : 'text-gray-500'}>
                              {isInteractive ? '⚠️ NENHUM' : '-'}
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-2">
                          {hasAudioBehavior ? (
                            <span className="text-green-400">{phase.audioBehavior?.onStart}</span>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </td>
                        <td className="py-2 px-2">
                          {isValid ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Word Timestamps Preview */}
        {simulatedWordTimestamps.length > 0 && (
          <Card className="bg-gray-800 border-gray-700 mt-6">
            <CardHeader>
              <CardTitle>📝 Word Timestamps Simulados ({simulatedWordTimestamps.length} palavras)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1 max-h-40 overflow-y-auto">
                {simulatedWordTimestamps.map((ts, i) => {
                  const isCurrentWord = currentTime >= ts.start && currentTime < ts.end;
                  const isKeyword = script.phases.some(p =>
                    p.anchorActions?.some((a: AnchorAction) =>
                      a.keyword.toLowerCase() === ts.word.toLowerCase()
                    )
                  );

                  return (
                    <span
                      key={i}
                      className={`px-1 rounded text-xs cursor-pointer ${
                        isCurrentWord ? 'bg-blue-500' :
                        isKeyword ? 'bg-purple-500' :
                        'bg-gray-700'
                      }`}
                      onClick={() => setCurrentTime(ts.start)}
                      title={`${formatTime(ts.start)}-${formatTime(ts.end)}`}
                    >
                      {ts.word}
                    </span>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default V7LessonTest;
