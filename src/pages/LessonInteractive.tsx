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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <InteractiveLesson lessonId={id} />
    </div>
  );
}
