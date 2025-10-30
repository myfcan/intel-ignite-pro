import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({
    profession: '',
    goal: '',
    time: '',
    experience: ''
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  const questions = [
    {
      step: 1,
      title: "Qual sua profissão ou área?",
      options: [
        { value: "dentista", label: "Dentista", icon: "🦷" },
        { value: "advogado", label: "Advogado", icon: "⚖️" },
        { value: "vendedor", label: "Vendedor", icon: "💼" },
        { value: "contador", label: "Contador", icon: "📊" },
        { value: "empresario", label: "Empresário", icon: "🏢" },
        { value: "outro", label: "Outro", icon: "👤" }
      ]
    },
    {
      step: 2,
      title: "Qual seu principal objetivo?",
      options: [
        { value: "renda", label: "Gerar renda extra", icon: "💰" },
        { value: "produtividade", label: "Aumentar produtividade", icon: "⚡" },
        { value: "curiosidade", label: "Aprender por curiosidade", icon: "🧠" }
      ]
    },
    {
      step: 3,
      title: "Quanto tempo tem por dia?",
      options: [
        { value: "15min", label: "15 minutos", icon: "⏱️" },
        { value: "30min", label: "30 minutos", icon: "⏰" },
        { value: "1h+", label: "1 hora ou mais", icon: "🕐" }
      ]
    },
    {
      step: 4,
      title: "Já usou alguma IA antes?",
      options: [
        { value: "nunca", label: "Nunca usei", icon: "🆕" },
        { value: "pouco", label: "Testei um pouco", icon: "🌱" },
        { value: "frequente", label: "Uso frequentemente", icon: "🚀" }
      ]
    }
  ];

  const currentQuestion = questions[step - 1];
  const progress = (step / 4) * 100;

  const saveOnboardingData = async (data: typeof answers) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Map values to match database enums
      const goalMapping: { [key: string]: 'income' | 'productivity' | 'curiosity' } = {
        'renda': 'income',
        'produtividade': 'productivity',
        'curiosidade': 'curiosity'
      };

      const timeMapping: { [key: string]: '15min' | '30min' | '1h+' } = {
        '15min': '15min',
        '30min': '30min',
        '1h+': '1h+'
      };

      const { error } = await supabase
        .from('users')
        .update({
          profession: data.profession,
          learning_goal: goalMapping[data.goal] || null,
          daily_time: timeMapping[data.time] || null,
        })
        .eq('id', session.user.id);

      if (error) throw error;
    } catch (error: any) {
      console.error('Error saving onboarding:', error);
      toast({
        title: "Erro ao salvar preferências",
        description: "Mas você pode continuar!",
        variant: "destructive",
      });
    }
  };

  const handleSelect = async (value: string) => {
    const questionKey = ['profession', 'goal', 'time', 'experience'][step - 1] as keyof typeof answers;
    const newAnswers = { ...answers, [questionKey]: value };
    setAnswers(newAnswers);

    if (step < 4) {
      setTimeout(() => setStep(step + 1), 300);
    } else {
      await saveOnboardingData(newAnswers);
      
      // Buscar primeira trilha (order_index = 1)
      const { data: trails } = await supabase
        .from('trails')
        .select('id')
        .eq('is_active', true)
        .order('order_index')
        .limit(1);
      
      setTimeout(() => {
        toast({
          title: "Perfeito! Tudo pronto!",
          description: "Vamos começar sua jornada com IA 🚀",
        });
        
        if (trails && trails.length > 0) {
          navigate(`/trails/${trails[0].id}`);
        } else {
          navigate('/dashboard');
        }
      }, 500);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-pink-50 
                    flex items-center justify-center p-4">
      
      {/* Progress bar no topo */}
      <div className="fixed top-0 left-0 right-0 h-2 bg-gray-200 z-50">
        <div 
          className="h-full bg-gradient-to-r from-cyan-400 to-pink-400 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Vamos personalizar sua experiência
          </h1>
          <p className="text-lg text-gray-600">
            Pergunta {step} de 4
          </p>
        </div>

        {/* Pergunta */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 
                        border border-gray-100 animate-scale-in">
          
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            {currentQuestion.title}
          </h2>

          {/* Opções */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQuestion.options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className="group relative bg-gradient-to-br from-gray-50 to-white
                         hover:from-cyan-50 hover:to-pink-50
                         border-2 border-gray-200 hover:border-cyan-400
                         rounded-2xl p-6 transition-all duration-300
                         hover:scale-105 hover:shadow-xl
                         text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="text-4xl">{option.icon}</div>
                  <div className="flex-1">
                    <p className="text-xl font-semibold text-gray-900 
                                 group-hover:text-cyan-600 transition-colors">
                      {option.label}
                    </p>
                  </div>
                  <div className="text-cyan-400 opacity-0 group-hover:opacity-100 
                                transition-opacity text-2xl">
                    →
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Botão voltar */}
        {step > 1 && (
          <button
            onClick={() => setStep(step - 1)}
            className="mt-6 text-gray-600 hover:text-gray-900 flex items-center gap-2 
                     transition-colors font-medium"
          >
            ← Voltar
          </button>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
