import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Settings } from 'lucide-react';
import { InteractiveLesson } from '@/components/lessons/InteractiveLesson';
import { TimestampDebugger } from '@/components/lessons/TimestampDebugger';
import { fundamentos01 } from '@/data/lessons/fundamentos-01';
import { supabase } from '@/integrations/supabase/client';

export default function LessonInteractive() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [trailId, setTrailId] = useState<string | null>(null);
  const [showDebugger, setShowDebugger] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchLessonData = async () => {
      if (!id) return;
      
      const { data } = await supabase
        .from('lessons')
        .select('trail_id, audio_url')
        .eq('id', id)
        .single();
      
      if (data?.trail_id) {
        setTrailId(data.trail_id);
      }
      if (data?.audio_url) {
        setAudioUrl(data.audio_url);
      }
    };
    
    fetchLessonData();
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

  // Debug mode para fundamentos-01
  if (showDebugger && id === '11111111-1111-1111-1111-111111111101' && audioUrl) {
    return <TimestampDebugger audioUrl={audioUrl} sections={fundamentos01.sections} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b-2 border-gray-100 shadow-soft">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="mb-4 -ml-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            
            {id === '11111111-1111-1111-1111-111111111101' && audioUrl && (
              <Button
                variant="outline"
                onClick={() => setShowDebugger(!showDebugger)}
                className="mb-4"
              >
                <Settings className="w-4 h-4 mr-2" />
                {showDebugger ? 'Ver Aula' : 'Debug Timestamps'}
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <InteractiveLesson lessonId={id} />
      </main>
    </div>
  );
}
