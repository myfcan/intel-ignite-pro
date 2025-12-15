// src/pages/AdminV7Preview.tsx
// Preview page for V7 Cinematic Lessons

import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { V7CinematicPlayer } from '@/components/lessons/v7/V7CinematicPlayer';
import { v7TestLesson } from '@/data/v7-test-lesson';
import { useToast } from '@/hooks/use-toast';

export default function AdminV7Preview() {
  const navigate = useNavigate();
  const { lessonId } = useParams();
  const { toast } = useToast();

  // In production, fetch lesson by ID
  // For now, use the test lesson
  const lesson = v7TestLesson;

  const handleComplete = (results: any) => {
    console.log('[V7Preview] Lesson completed:', results);

    toast({
      title: '🎉 Lição Completada!',
      description: `Score: ${results.score} | XP: ${results.xp}`,
    });

    // Could navigate back or show completion screen
  };

  const handleProgress = (progress: number) => {
    console.log('[V7Preview] Progress:', progress.toFixed(1), '%');
  };

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
