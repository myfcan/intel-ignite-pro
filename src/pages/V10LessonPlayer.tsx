import { useParams } from 'react-router-dom';
import LessonContainer from '@/components/lessons/v10/LessonContainer';

export default function V10LessonPlayer() {
  const { lessonSlug } = useParams<{ lessonSlug: string }>();

  if (!lessonSlug) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F0B1E]">
        <p className="text-white/50 text-sm">Aula não encontrada</p>
      </div>
    );
  }

  return <LessonContainer lessonSlug={lessonSlug} />;
}
