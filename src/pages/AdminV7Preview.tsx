// src/pages/AdminV7Preview.tsx
// Preview page for V7 Cinematic Lessons - Fetches from database

import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { V7CinematicPlayer } from '@/components/lessons/v7/V7CinematicPlayer';
import { v7TestLesson } from '@/data/v7-test-lesson';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { V7CinematicLesson } from '@/types/v7-cinematic.types';
import { adaptAdminLessonToV7, validateAdminLesson } from '@/services/v7-lesson-adapter';

export default function AdminV7Preview() {
  const navigate = useNavigate();
  const { lessonId } = useParams();
  const { toast } = useToast();

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
          .eq('model', 'v7')
          .maybeSingle();

        if (fetchError) {
          throw new Error(fetchError.message);
        }

        if (!data) {
          throw new Error('Lição V7 não encontrada');
        }

        console.log('[V7Preview] Raw lesson data:', data);

        // Use adapter to transform database content to V7CinematicLesson
        const content = data.content as any;

        // Validate if content matches AdminLessonInput format
        if (validateAdminLesson(content)) {
          console.log('[V7Preview] Using v7-lesson-adapter for transformation');
          const v7Lesson = adaptAdminLessonToV7(data.id, content);
          console.log('[V7Preview] Lesson adapted:', v7Lesson.title, '| Acts:', v7Lesson.cinematicFlow.acts.length);
          setLesson(v7Lesson);
        } else {
          // Fallback to test lesson if format is invalid
          console.warn('[V7Preview] Invalid lesson format, using test lesson');
          setLesson(v7TestLesson);
        }
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
      <div className="absolute top-4 left-4 z-50">
        <Button
          variant="ghost"
          onClick={() => navigate('/admin/v7/create')}
          className="bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
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
        autoPlay={true}
      />
    </div>
  );
}
