import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onboardingQuestions } from '@/data/onboardingQuestions';
import { useOnboarding } from '@/hooks/useOnboarding';
import { supabase } from '@/integrations/supabase/client';
import { WelcomeScreen } from './onboarding/WelcomeScreen';
import { QuestionScreen } from './onboarding/QuestionScreen';
import { ReassuranceScreen } from './onboarding/ReassuranceScreen';
import { LoadingScreen } from './onboarding/LoadingScreen';
import { ProfileScreen } from './onboarding/ProfileScreen';
import { ChallengeScreen } from './onboarding/ChallengeScreen';
import { PricingScreen } from './onboarding/PricingScreen';

type Screen = 'welcome' | 'questions' | 'reassurance' | 'loading' | 'profile' | 'challenge' | 'pricing';

interface UserProfile {
  readiness_score: number;
  readiness_level: string;
  motivation: string;
  potential: string;
  focus: string;
  priority_trail: string;
}

export const OnboardingFlow = () => {
  const navigate = useNavigate();
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [checking, setChecking] = useState(true);
  const { saveAnswer, completeOnboarding, createPricingSession } = useOnboarding();

  // Verificar se usuário já completou onboarding
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/auth');
          return;
        }

        // Verificar se o usuário existe na tabela users
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('onboarding_completed')
          .eq('id', user.id)
          .maybeSingle();

        // Se não existe, criar o registro
        if (!userData && !userError) {
          await supabase
            .from('users')
            .insert({
              id: user.id,
              email: user.email || '',
              name: user.user_metadata?.name || 'Usuário',
              onboarding_completed: false,
            });
        } else if (userData?.onboarding_completed) {
          // Se já completou, redirecionar
          navigate('/dashboard');
          return;
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
      } finally {
        setChecking(false);
      }
    };

    checkOnboardingStatus();
  }, [navigate]);

  const handleStart = () => {
    setCurrentScreen('questions');
  };

  const handleAnswer = async (questionId: string, value: string) => {
    await saveAnswer(questionId, value);

    // Se respondeu sobre medo da IA, mostrar tela de tranquilização
    if (questionId === 'fear') {
      setCurrentScreen('reassurance');
      return;
    }

    // Próxima pergunta
    if (currentQuestionIndex < onboardingQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Última pergunta - processar
      setCurrentScreen('loading');
      
      setTimeout(async () => {
        const userProfile = await completeOnboarding();
        setProfile(userProfile);
        setCurrentScreen('profile');
      }, 3000);
    }
  };

  const handleReassuranceContinue = () => {
    setCurrentScreen('questions');
    setCurrentQuestionIndex(currentQuestionIndex + 1);
  };

  const handleProfileContinue = () => {
    setCurrentScreen('challenge');
  };

  const handleChallengeContinue = async () => {
    await createPricingSession();
    setCurrentScreen('pricing');
  };

  // Mostrar loading enquanto verifica
  if (checking) {
    return <LoadingScreen />;
  }

  // Renderizar tela atual
  if (currentScreen === 'welcome') {
    return <WelcomeScreen onStart={handleStart} />;
  }

  if (currentScreen === 'questions') {
    const question = onboardingQuestions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / onboardingQuestions.length) * 100;
    return <QuestionScreen question={question} progress={progress} onAnswer={handleAnswer} />;
  }

  if (currentScreen === 'reassurance') {
    return <ReassuranceScreen onContinue={handleReassuranceContinue} />;
  }

  if (currentScreen === 'loading') {
    return <LoadingScreen />;
  }

  if (currentScreen === 'profile') {
    return <ProfileScreen profile={profile} onContinue={handleProfileContinue} />;
  }

  if (currentScreen === 'challenge') {
    return <ChallengeScreen profile={profile} onContinue={handleChallengeContinue} />;
  }

  if (currentScreen === 'pricing') {
    return <PricingScreen profile={profile} />;
  }

  return null;
};
