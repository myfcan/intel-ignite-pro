import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { InteractiveLesson } from '@/components/lessons/InteractiveLesson';
import { supabase } from '@/integrations/supabase/client';

export default function LessonInteractive() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [trailId, setTrailId] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrailId = async () => {
      if (!id) return;
      
      const { data } = await supabase
        .from('lessons')
        .select('trail_id')
        .eq('id', id)
        .single();
      
      if (data?.trail_id) {
        setTrailId(data.trail_id);
      }
    };
    
    fetchTrailId();
  }, [id]);

  if (!id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>ID da aula não encontrado</p>
      </div>
    );
  }

  const handleBack = () => {
    if (trailId) {
      navigate(`/trails/${trailId}`);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b-2 border-gray-100 shadow-soft">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="mb-4 -ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <InteractiveLesson lessonId={id} />
      </main>
    </div>
  );
}
