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
    <div className="min-h-screen relative overflow-hidden"
         style={{
           background: 'linear-gradient(135deg, #0F172A 0%, #020617 100%)'
         }}>
      {/* Grid Pattern Background */}
      <div 
        className="fixed inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
          pointerEvents: 'none'
        }}
      />
      
      {/* Purple Gradient at Bottom */}
      <div 
        className="fixed inset-x-0 bottom-0 h-64 opacity-20"
        style={{
          background: 'linear-gradient(to top, rgba(139, 92, 246, 0.4) 0%, transparent 100%)',
          pointerEvents: 'none'
        }}
      />
      
      <div className="relative z-10">
        <InteractiveLesson lessonId={id} />
      </div>
    </div>
  );
}
