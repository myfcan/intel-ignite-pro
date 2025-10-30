import { Button } from '@/components/ui/button';

interface UserProfile {
  readiness_score: number;
  readiness_level: string;
  motivation: string;
  potential: string;
  focus: string;
}

interface ProfileScreenProps {
  profile: UserProfile | null;
  onContinue: () => void;
}

export const ProfileScreen = ({ profile, onContinue }: ProfileScreenProps) => {
  if (!profile) return null;

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Seu Perfil de Aprendizado em IA</h1>

        <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">Nível de Prontidão</h2>
          <div className="bg-gray-200 h-4 rounded-full overflow-hidden mb-2">
            <div 
              className="h-full bg-gradient-to-r from-orange-400 via-yellow-400 to-green-500"
              style={{ width: `${profile.readiness_score}%` }}
            />
          </div>
          <p className="text-2xl font-bold text-center my-4">{profile.readiness_level}</p>
          <p className="text-center text-gray-600">
            👍 Ótimo! Você tem uma base sólida para começar
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          {[
            { icon: '💪', label: 'Motivação', value: profile.motivation },
            { icon: '⭐', label: 'Potencial', value: profile.potential },
            { icon: '⏰', label: 'Foco', value: profile.focus },
            { icon: '🧠', label: 'Conhecimento IA', value: profile.readiness_level }
          ].map((stat, i) => (
            <div key={i} className="bg-white p-4 rounded-xl shadow-sm text-center">
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
              <div className="font-bold">{stat.value}</div>
            </div>
          ))}
        </div>

        <p className="text-center text-gray-700 mb-8">
          📈 Com dedicação, você pode se tornar proficiente em 4 semanas!
        </p>

        <Button onClick={onContinue} size="lg" className="w-full">
          Ver Minha Jornada →
        </Button>
      </div>
    </div>
  );
};
