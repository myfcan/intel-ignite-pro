import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Trophy, Clock, ArrowRight, Home } from 'lucide-react';
import { useEffect } from 'react';

interface ConclusionScreenProps {
  scores: number[];
  timeSpent: number;
  lessonTitle: string;
  nextLessonId?: string;
  nextLessonType?: string;
  exerciseMetadata?: Array<{ title: string; type: string }>;
}

export function ConclusionScreen({ scores, timeSpent, lessonTitle, nextLessonId, nextLessonType, exerciseMetadata }: ConclusionScreenProps) {
  const navigate = useNavigate();
  
  // Calcular média dos scores
  const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
  
  // Converter tempo para minutos
  const minutes = Math.floor(timeSpent / 60000);
  
  useEffect(() => {
    // Disparar confetti ao montar o componente usando importação dinâmica
    let interval: number;
    
    import('canvas-confetti').then((module) => {
      const confetti = module.default;
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      interval = window.setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);
    }).catch((error) => {
      console.log('Confetti não disponível:', error);
    });

    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  const handleGoToNextLesson = () => {
    if (nextLessonId) {
      const route = nextLessonType === 'guided' 
        ? `/lessons-interactive/${nextLessonId}`
        : `/lessons/${nextLessonId}`;
      navigate(route);
    }
  };

  return (
    <div 
      data-testid="conclusion-screen"
      className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-8"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <Card className="p-8 md:p-12 shadow-2xl border-2">
          {/* Cabeçalho */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-block mb-4"
            >
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Trophy className="w-12 h-12 text-primary" />
              </div>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl font-bold mb-2"
            >
              🎉 Parabéns!
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-muted-foreground"
            >
              Você completou a aula:
            </motion.p>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-2xl font-semibold text-primary mt-2"
            >
              {lessonTitle}
            </motion.p>
          </div>

          {/* Badge de Conquista */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-8"
          >
            <Card className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/20 p-6">
              <div className="flex items-center justify-center gap-4">
                <div className="text-5xl">🏆</div>
                <div>
                  <h3 className="text-xl font-bold text-amber-700 dark:text-amber-400">
                    Aula Dominada
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Completou todos os exercícios com sucesso
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Estatísticas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="grid grid-cols-2 gap-4 mb-8"
          >
            {/* Playground Interativo */}
            <Card className="p-4 bg-green-500/5 border-green-500/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Playground</p>
                  <p className="font-semibold text-green-600">✓ Completo</p>
                </div>
              </div>
            </Card>

            {/* Exercícios */}
            <Card className="p-4 bg-blue-500/5 border-blue-500/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Exercícios</p>
                  <p className="font-semibold text-blue-600">{scores.length}/{exerciseMetadata?.length || scores.length} ✓</p>
                </div>
              </div>
            </Card>

            {/* Performance */}
            <Card className="p-4 bg-purple-500/5 border-purple-500/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Performance</p>
                  <p className="font-semibold text-purple-600">{Math.round(averageScore)}%</p>
                </div>
              </div>
            </Card>

            {/* Tempo */}
            <Card className="p-4 bg-orange-500/5 border-orange-500/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tempo Total</p>
                  <p className="font-semibold text-orange-600">{minutes} min</p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Breakdown dos Exercícios */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mb-8"
          >
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">Desempenho nos Exercícios</h3>
            <div className="space-y-2">
              {scores.map((score, index) => {
                const metadata = exerciseMetadata?.[index];
                const getEmojiByType = (type?: string) => {
                  switch(type) {
                    case 'drag-drop': return '🎯';
                    case 'complete-sentence': return '✏️';
                    case 'true-false': return '✔️';
                    case 'fill-in-blanks': return '📝';
                    case 'scenario-selection': return '🎭';
                    case 'platform-match': return '🔗';
                    case 'data-collection': return '📊';
                    default: return '📝';
                  }
                };
                
                return (
                  <div key={index} className="flex items-center gap-3">
                    <span className="text-2xl">
                      {getEmojiByType(metadata?.type)}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">
                          {metadata?.title || `Exercício ${index + 1}`}
                        </span>
                        <span className="text-sm font-semibold text-primary">
                          {Math.round(score)}%
                        </span>
                      </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${score}%` }}
                        transition={{ delay: 0.8 + (index * 0.2), duration: 0.8 }}
                        className="h-full bg-primary"
                      />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Próximos Passos */}
          {nextLessonId && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="mb-6"
            >
              <Card className="p-4 bg-primary/5 border-primary/20">
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Próxima aula disponível!
                </h3>
                <p className="text-sm text-muted-foreground">
                  Continue sua jornada de aprendizado com a próxima aula
                </p>
              </Card>
            </motion.div>
          )}

          {/* Botões de Ação */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="flex flex-col sm:flex-row gap-3"
          >
            {nextLessonId && (
              <Button
                size="lg"
                className="flex-1"
                onClick={handleGoToNextLesson}
                data-testid="conclusion-next-lesson"
              >
                Ir para Próxima Aula
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
            
            <Button
              size="lg"
              variant="outline"
              className={nextLessonId ? '' : 'flex-1'}
              onClick={handleGoToDashboard}
              data-testid="conclusion-dashboard"
            >
              <Home className="w-4 h-4 mr-2" />
              Voltar ao Dashboard
            </Button>
          </motion.div>
        </Card>
      </motion.div>
    </div>
  );
}
