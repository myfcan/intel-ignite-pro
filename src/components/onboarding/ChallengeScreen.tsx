import { Button } from '@/components/ui/button';

interface UserProfile {
  readiness_level: string;
  priority_trail: string;
}

interface ChallengeScreenProps {
  profile: UserProfile | null;
  onContinue: () => void;
}

export const ChallengeScreen = ({ profile, onContinue }: ChallengeScreenProps) => {
  const trailNames: Record<string, string> = {
    'fundamentos': 'Fundamentos de IA',
    'rendaExtra': 'Renda Extra com IA',
    'negocios': 'IA para Negócios',
    'diaADia': 'IA no Dia a Dia'
  };

  const priorityTrail = profile?.priority_trail || 'fundamentos';
  const trailName = trailNames[priorityTrail] || 'Fundamentos de IA';

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Sua Jornada Personalizada 🎯</h1>

        <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
          <h2 className="text-2xl font-semibold mb-4 text-center">
            Trilha Recomendada: <span className="text-blue-600">{trailName}</span>
          </h2>
          <p className="text-gray-600 text-center mb-6">
            Baseado no seu perfil, esta é a melhor trilha para começar!
          </p>

          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
              <span className="text-2xl">📚</span>
              <div>
                <p className="font-semibold">Conteúdo Personalizado</p>
                <p className="text-sm text-gray-600">Adaptado ao seu nível: {profile?.readiness_level}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
              <span className="text-2xl">⏱️</span>
              <div>
                <p className="font-semibold">4 Semanas Intensivas</p>
                <p className="text-sm text-gray-600">28 dias para dominar IA</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
              <span className="text-2xl">🎓</span>
              <div>
                <p className="font-semibold">Certificado ao Final</p>
                <p className="text-sm text-gray-600">Comprove suas habilidades</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-amber-400 to-orange-400 p-6 rounded-xl text-white text-center mb-6">
          <p className="text-xl font-bold mb-2">🎁 Oferta Especial de Boas-Vindas</p>
          <p className="text-lg">50% de desconto nos próximos 10 minutos!</p>
        </div>

        <Button onClick={onContinue} size="lg" className="w-full">
          Ver Preços com Desconto →
        </Button>

        <p className="text-center text-gray-500 text-sm mt-4">
          ✨ Milhares de alunos já transformaram suas carreiras
        </p>
      </div>
    </div>
  );
};
