import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GuideLessonV5 } from '@/components/lessons/GuideLessonV5';
import { getGuideById } from '@/data/guides';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

/**
 * GuideDetail Page: Exibe um guia específico com player V5
 *
 * URL: /guides/:guideId
 * Carrega dados do guia e renderiza GuideLessonV5
 */
export default function GuideDetail() {
  const { guideId } = useParams<{ guideId: string }>();
  const navigate = useNavigate();

  const guideData = guideId ? getGuideById(guideId) : undefined;

  // Guide não encontrado
  if (!guideData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Guia não encontrado
          </h1>
          <p className="text-gray-600 mb-6">
            O guia que você está procurando não existe ou foi removido.
          </p>
          <Button onClick={() => navigate('/guides')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Guias
          </Button>
        </div>
      </div>
    );
  }

  // Renderizar guia com componente V5
  return (
    <GuideLessonV5
      guideData={guideData}
      onComplete={() => {
        // Ao completar, voltar para lista de guias
        navigate('/guides');
      }}
    />
  );
}
