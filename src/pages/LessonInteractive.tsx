import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { InteractiveLesson } from '@/components/lessons/InteractiveLesson';
import { MiniMaia } from '@/components/MiniMaia';
import { useState } from 'react';

export default function LessonInteractive() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showMaia, setShowMaia] = useState(false);
  const [maiaMessage, setMaiaMessage] = useState('');

  const handleComplete = () => {
    setMaiaMessage('🎉 Parabéns! Você concluiu esta aula com sucesso! Continue assim e você vai dominar a IA!');
    setShowMaia(true);
  };

  const handleMaiaClose = () => {
    setShowMaia(false);
    navigate('/dashboard');
  };

  if (!id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>ID da aula não encontrado</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {showMaia && (
        <MiniMaia
          message={maiaMessage}
          variant="celebration"
          showConfetti={true}
          onClose={handleMaiaClose}
        />
      )}

      {/* Header */}
      <header className="bg-white border-b-2 border-gray-100 shadow-soft">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4 -ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <InteractiveLesson
          lessonId={id}
          onComplete={handleComplete}
        />
      </main>
    </div>
  );
}
