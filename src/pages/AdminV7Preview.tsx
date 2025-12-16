// src/pages/AdminV7Preview.tsx
// Preview page for V7 Cinematic Lessons - Fetches from database
// Last rebuild: 2025-12-16

import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, AlertCircle, Volume2, RefreshCw } from 'lucide-react';
import { V7CinematicPlayer } from '@/components/lessons/v7/V7CinematicPlayer';
import { v7TestLesson } from '@/data/v7-test-lesson';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { regenerateV7LessonAudio } from '@/services/v7CinematicService';
import type { V7CinematicLesson, CinematicAct } from '@/types/v7-cinematic.types';

export default function AdminV7Preview() {
  const navigate = useNavigate();
  const { lessonId } = useParams();
  const { toast } = useToast();
  const [isRegeneratingAudio, setIsRegeneratingAudio] = useState(false);

  const [lesson, setLesson] = useState<V7CinematicLesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch lesson from database
  useEffect(() => {
    async function fetchLesson() {
      // If no lessonId or it's a preview ID, use test lesson
      if (!lessonId || lessonId.startsWith('v7-preview-')) {
        console.log('[V7Preview] Using test lesson (no valid lessonId)');
        setLesson(v7TestLesson);
        setIsLoading(false);
        return;
      }

      try {
        console.log('[V7Preview] Fetching lesson:', lessonId);

        const { data, error: fetchError } = await supabase
          .from('lessons')
          .select('*')
          .eq('id', lessonId)
          .maybeSingle();

        if (fetchError) {
          throw new Error(fetchError.message);
        }

        if (!data) {
          throw new Error('Lição não encontrada. Verifique se você está logado como admin.');
        }

        // Verify it's a V7 lesson
        if (data.model !== 'v7') {
          throw new Error(`Esta lição não é V7 (model: ${data.model})`);
        }

        // Transform database content to V7CinematicLesson format
        const content = data.content as any;
        const timeline = content?.timeline || { acts: [], totalDuration: (data.estimated_time || 5) * 60 };
        const totalDuration = content?.metadata?.totalDuration || timeline.totalDuration || (data.estimated_time || 5) * 60;
        
        // Define background gradients for variety
        const gradients = [
          'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
          'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          'linear-gradient(135deg, #141e30 0%, #243b55 100%)',
          'linear-gradient(135deg, #0d1b2a 0%, #1b263b 50%, #415a77 100%)',
          'linear-gradient(135deg, #1f1c2c 0%, #928dab 100%)',
          'linear-gradient(135deg, #232526 0%, #414345 100%)',
        ];
        
        // Convert timeline acts to cinematicFlow acts format with proper visual structure
        const cinematicActs: CinematicAct[] = (timeline.acts || []).map((act: any, index: number) => {
          const actType = act.type === 'code-demo' ? 'interactive' : 
                          act.type === 'comparison' ? 'revelation' : 
                          act.type === 'challenge' ? 'challenge' :
                          act.type || 'narrative';
          
          const narrative = act.content?.narrative || act.title || '';
          const visualEffects = act.visualEffects || {};
          const gradientIndex = index % gradients.length;
          
          return {
            id: act.id || `act-${index + 1}`,
            type: actType as CinematicAct['type'],
            title: act.title || `Ato ${index + 1}`,
            startTime: act.startTime || 0,
            duration: (act.endTime || 0) - (act.startTime || 0),
            content: {
              visual: {
                type: 'slide' as const,
                background: { 
                  type: 'gradient' as const, 
                  value: gradients[gradientIndex],
                  opacity: 1,
                },
                layers: [
                  {
                    id: `text-layer-${act.id}`,
                    type: 'text' as const,
                    zIndex: 10,
                    position: { x: '10%', y: '40%', width: '80%', height: 'auto' },
                    content: narrative,
                    style: {
                      color: '#ffffff',
                      fontSize: '2rem',
                      fontWeight: 'bold',
                      lineHeight: '1.4',
                      textShadow: '0 4px 12px rgba(0,0,0,0.5)',
                      textAlign: 'center',
                    },
                  },
                ],
              },
              audio: {
                narrationSegment: {
                  start: act.startTime || 0,
                  end: act.endTime || (act.startTime || 0) + 60,
                  text: narrative,
                },
              },
              animations: [],
              particles: visualEffects.particles ? [{ id: `particles-${act.id}`, type: 'sparkle', color: '#60a5fa' }] : undefined,
            },
            transitions: {
              in: { type: 'fade' as const, duration: 400, easing: 'ease-in-out' as const },
              out: { type: 'fade' as const, duration: 400, easing: 'ease-in-out' as const },
            },
          };
        });

        const v7Lesson: V7CinematicLesson = {
          id: data.id,
          model: 'v7-cinematic',
          title: data.title,
          subtitle: content?.metadata?.subtitle || data.description || '',
          duration: totalDuration,
          metadata: {
            difficulty: content?.metadata?.difficulty || data.difficulty_level || 'beginner',
            category: content?.metadata?.category || 'javascript',
            tags: content?.metadata?.tags || [],
            description: data.description || '',
            learningObjectives: content?.metadata?.learningObjectives || [],
            estimatedTime: data.estimated_time || 5,
            version: content?.version || '1.0.0',
            createdAt: data.created_at || new Date().toISOString(),
            updatedAt: data.created_at || new Date().toISOString(),
          },
          cinematicFlow: {
            acts: cinematicActs,
            timeline: {
              totalDuration: totalDuration,
              acts: cinematicActs.map((act) => ({
                actId: act.id,
                startTime: act.startTime,
                endTime: act.startTime + act.duration,
                color: act.type === 'narrative' ? '#667eea' : 
                       act.type === 'challenge' ? '#f59e0b' : 
                       act.type === 'revelation' ? '#10b981' : '#8b5cf6',
              })),
              markers: [],
              chapters: cinematicActs.map((act) => ({
                id: act.id,
                title: act.title,
                startTime: act.startTime,
                endTime: act.startTime + act.duration,
              })),
            },
            transitions: [],
          },
          audioTrack: {
            narration: {
              url: content?.audioConfig?.url || data.audio_url || '',
              duration: totalDuration,
              format: content?.audioConfig?.format || 'mp3',
            },
            syncPoints: cinematicActs.map((act) => ({
              id: `sync-${act.id}`,
              timestamp: act.startTime,
              actId: act.id,
              type: 'act-start' as const,
            })),
            volume: {
              narration: 1,
              music: 0.3,
              effects: 0.5,
            },
          },
          interactionPoints: content?.interactivity?.pausePoints?.map((time: number, i: number) => ({
            id: `interaction-${i + 1}`,
            timestamp: time,
            actId: cinematicActs.find(a => a.startTime <= time && (a.startTime + a.duration) >= time)?.id || 'act-1',
            type: 'quiz' as const,
            required: false,
            content: {
              question: '',
              options: [],
            },
          })) || [],
          gamification: {
            enabled: true,
            xpRewards: [
              { id: 'xp-completion', event: 'challenge-complete', amount: 100 },
              { id: 'xp-interaction', event: 'interaction-success', amount: 50 },
            ],
            achievements: [],
            scoring: {
              maxScore: 100,
              criteria: [
                { id: 'completion', name: 'Completude', weight: 0.5, maxPoints: 50 },
                { id: 'interactions', name: 'Interações', weight: 0.3, maxPoints: 30 },
                { id: 'time', name: 'Tempo', weight: 0.2, maxPoints: 20 },
              ],
            },
          },
          analytics: {
            enabled: true,
            events: [],
            metrics: [],
          },
        };

        console.log('[V7Preview] Lesson loaded:', v7Lesson.title, '| Acts:', cinematicActs.length);
        setLesson(v7Lesson);
      } catch (err: any) {
        console.error('[V7Preview] Error fetching lesson:', err);
        setError(err.message);
        // Fallback to test lesson on error
        setLesson(v7TestLesson);
      } finally {
        setIsLoading(false);
      }
    }

    fetchLesson();
  }, [lessonId]);

  const handleComplete = (results: any) => {
    console.log('[V7Preview] Lesson completed:', results);

    toast({
      title: '🎉 Lição Completada!',
      description: `Score: ${results.score} | XP: ${results.xp}`,
    });
  };

  const handleProgress = (progress: number) => {
    console.log('[V7Preview] Progress:', progress.toFixed(1), '%');
  };

  const handleRegenerateAudio = async () => {
    if (!lessonId || lessonId.startsWith('v7-preview-')) {
      toast({
        title: 'Erro',
        description: 'Não é possível regenerar áudio para lição de teste',
        variant: 'destructive',
      });
      return;
    }

    setIsRegeneratingAudio(true);
    toast({
      title: 'Gerando áudio...',
      description: 'Isso pode levar alguns minutos',
    });

    try {
      const result = await regenerateV7LessonAudio(lessonId);

      if (result.success) {
        toast({
          title: '✅ Áudio gerado com sucesso!',
          description: `${result.wordTimestampsCount || 0} timestamps de palavras`,
        });
        // Reload the page to get new audio
        window.location.reload();
      } else {
        throw new Error(result.error || 'Falha ao gerar áudio');
      }
    } catch (err: any) {
      console.error('[V7Preview] Regenerate audio error:', err);
      toast({
        title: 'Erro ao gerar áudio',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setIsRegeneratingAudio(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="relative w-full h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-cyan-500 animate-spin mx-auto" />
          <p className="text-white/70">Carregando lição V7...</p>
        </div>
      </div>
    );
  }

  // Error state (but still show lesson if fallback worked)
  if (error && !lesson) {
    return (
      <div className="relative w-full h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-bold text-white">Erro ao carregar lição</h2>
          <p className="text-white/70">{error}</p>
          <Button onClick={() => navigate('/admin/v7/create')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return null;
  }

  return (
    <div className="relative w-full h-screen bg-black">
      {/* Back button overlay */}
      <div className="absolute top-4 left-4 z-50 flex gap-2">
        <Button
          variant="ghost"
          onClick={() => navigate('/admin/v7/create')}
          className="bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        
        {/* Regenerate Audio Button */}
        {lessonId && !lessonId.startsWith('v7-preview-') && (
          <Button
            variant="ghost"
            onClick={handleRegenerateAudio}
            disabled={isRegeneratingAudio}
            className="bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-300 backdrop-blur-sm border border-cyan-500/30"
          >
            {isRegeneratingAudio ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 mr-2" />
                Regenerar Áudio
              </>
            )}
          </Button>
        )}
      </div>

      {/* Error banner if using fallback */}
      {error && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-yellow-500/20 border border-yellow-500/50 rounded-lg px-4 py-2 backdrop-blur-sm">
          <p className="text-yellow-200 text-sm">
            ⚠️ Erro ao carregar do DB. Usando lição de teste.
          </p>
        </div>
      )}

      {/* V7 Player */}
      <V7CinematicPlayer
        lesson={lesson}
        onComplete={handleComplete}
        onProgress={handleProgress}
        autoPlay={false}
      />
    </div>
  );
}
