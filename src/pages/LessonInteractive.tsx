import { useParams } from 'react-router-dom';
import { InteractiveLesson } from '@/components/lessons/InteractiveLesson';

export default function LessonInteractive() {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>ID da aula não encontrado</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      
      <div className="relative z-10">
        <InteractiveLesson lessonId={id} />
      </div>
    </div>
  );
}
