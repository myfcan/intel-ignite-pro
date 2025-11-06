import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { InteractiveSimulationConfig } from '@/types/guidedLesson';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Progress } from '@/components/ui/progress';

interface InteractiveSimulationPlaygroundProps {
  config: InteractiveSimulationConfig;
  onComplete: (data: any) => void;
}

// Gêneros disponíveis para geração dinâmica de opções
const movieDatabase = {
  'Ação': [
    { id: 'acao-1', title: 'Missão Impossível', emoji: '🎬', description: 'Espionagem e ação' },
    { id: 'acao-2', title: 'John Wick', emoji: '🔫', description: 'Ação intensa' },
    { id: 'acao-3', title: 'Mad Max', emoji: '🏜️', description: 'Ação pós-apocalíptica' },
  ],
  'Romance': [
    { id: 'romance-1', title: 'Como Eu Era Antes de Você', emoji: '💕', description: 'Romance emocionante' },
    { id: 'romance-2', title: 'A Culpa é das Estrelas', emoji: '⭐', description: 'Romance juvenil' },
    { id: 'romance-3', title: 'Orgulho e Preconceito', emoji: '📖', description: 'Romance clássico' },
  ],
  'Comédia': [
    { id: 'comedia-1', title: 'Superbad', emoji: '🤣', description: 'Comédia adolescente' },
    { id: 'comedia-2', title: 'Neighbors', emoji: '🏘️', description: 'Comédia de vizinhos' },
    { id: 'comedia-3', title: 'Deadpool', emoji: '🦸', description: 'Comédia de ação' },
  ],
};

const otherGenres: Record<string, string> = {
  'Ação': 'Romance',
  'Romance': 'Comédia',
  'Comédia': 'Ação',
};

export default function InteractiveSimulationPlayground({
  config,
  onComplete,
}: InteractiveSimulationPlaygroundProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState<Record<number, string>>({});
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [showIntro, setShowIntro] = useState(!!config.intro);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentStepData = config.steps[currentStep];
  const isLastStep = currentStep === config.steps.length - 1;

  // Gerar opções dinâmicas baseadas na escolha anterior
  const generateDynamicOptions = (stepData: typeof currentStepData) => {
    if (stepData.options !== 'dynamic' || !selectedGenre) return [];

    const genre = selectedGenre as keyof typeof movieDatabase;
    const sameGenreMovies = movieDatabase[genre] || [];
    const differentGenre = otherGenres[selectedGenre];
    const differentGenreMovies = movieDatabase[differentGenre as keyof typeof movieDatabase] || [];

    if (stepData.step === 2) {
      // Semana 2: 2 do mesmo gênero + 1 diferente
      return [
        { ...sameGenreMovies[0], genre: selectedGenre },
        { ...sameGenreMovies[1], genre: selectedGenre, tag: '🔥 Netflix Recomenda' },
        { ...differentGenreMovies[0], genre: differentGenre, tag: 'Experimente algo novo' },
      ];
    } else if (stepData.step === 3) {
      // Semana 3: 3 do mesmo gênero com match scores
      return [
        { ...sameGenreMovies[0], genre: selectedGenre, tag: '✨ Perfeito pra você', matchScore: '98%' },
        { ...sameGenreMovies[1], genre: selectedGenre, tag: '✨ Perfeito pra você', matchScore: '95%' },
        { ...sameGenreMovies[2], genre: selectedGenre, tag: 'Baseado no seu gosto', matchScore: '92%' },
      ];
    }

    return [];
  };

  const options = currentStepData?.options === 'dynamic'
    ? generateDynamicOptions(currentStepData)
    : currentStepData?.options || [];

  const handleOptionSelect = (optionId: string) => {
    const selectedOption = options.find(opt => opt.id === optionId);
    
    // Salvar seleção
    setSelections(prev => ({ ...prev, [currentStep]: optionId }));
    
    // Salvar gênero se for a primeira escolha
    if (currentStep === 0 && selectedOption) {
      setSelectedGenre(selectedOption.genre);
    }

    // Mostrar feedback
    setShowFeedback(true);

    // Avançar após 3 segundos
    setTimeout(() => {
      setShowFeedback(false);
      if (isLastStep) {
        setIsCompleted(true);
      } else {
        setCurrentStep(prev => prev + 1);
      }
    }, 3000);
  };

  // Renderizar feedback rico
  const renderFeedback = () => {
    if (!currentStepData?.feedback) return null;

    const feedback = currentStepData.feedback;
    const selectedOption = options.find(opt => opt.id === selections[currentStep]);
    const genre = selectedOption?.genre || selectedGenre;

    if (typeof feedback === 'string') {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-green-500/10 border border-green-500/30 rounded-xl"
        >
          <p className="text-center text-green-700 dark:text-green-300 font-medium text-lg">
            {feedback.replace('{genre}', genre)}
          </p>
        </motion.div>
      );
    }

    // Feedback rico (objeto)
    const progressValue = ((currentStep + 1) / config.steps.length) * 100;
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4 p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-200/50 dark:border-green-800/50 rounded-xl"
      >
        <h4 className="text-xl font-bold text-green-800 dark:text-green-200 flex items-center gap-2">
          <span>✨</span> {feedback.title}
        </h4>
        
        <ul className="space-y-2">
          {feedback.learning.map((item, idx) => (
            <motion.li
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.2 }}
              className="text-green-700 dark:text-green-300 font-medium flex items-start gap-2"
            >
              <span className="mt-1">{item.split(' ')[0]}</span>
              <span>{item.replace('{genre}', genre).substring(item.split(' ')[0].length)}</span>
            </motion.li>
          ))}
        </ul>

        {feedback.confidence && (
          <div className="pt-4 border-t border-green-200/50 dark:border-green-800/50">
            <p className="text-sm font-semibold text-green-700 dark:text-green-300 mb-2">
              {feedback.confidence}
            </p>
            <Progress value={progressValue} className="h-2" />
          </div>
        )}

        {feedback.visual && (
          <p className="text-sm text-center text-green-600 dark:text-green-400 font-medium pt-2">
            {feedback.visual}
          </p>
        )}
      </motion.div>
    );
  };

  // Tela de introdução
  if (showIntro && config.intro) {
    return (
      <div className="fixed inset-0 z-[100] bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full"
        >
          <Card className="p-8 bg-white/95 dark:bg-slate-800/95 backdrop-blur shadow-2xl">
            <div className="text-center space-y-6">
              <div className="text-7xl animate-bounce">{config.intro.icon}</div>
              <h2 className="text-3xl font-bold text-foreground">{config.intro.title}</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {config.intro.description}
              </p>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium text-muted-foreground">
                  {config.intro.visual}
                </p>
              </div>
              <Button onClick={() => setShowIntro(false)} size="lg" className="w-full py-6 text-lg">
                🚀 Começar Simulação
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Tela de conclusão
  if (isCompleted) {
    const totalPicks = Object.keys(selections).length;
    const accuracy = 95;
    const learnedPatterns = currentStep + 1;

    return (
      <div className="fixed inset-0 z-[100] bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-4xl w-full my-8"
        >
          <Card className="p-8 bg-white/95 dark:bg-slate-800/95 backdrop-blur shadow-2xl space-y-8">
            {/* Badge */}
            <div className="text-center space-y-4">
              <div className="text-7xl animate-bounce">{config.completion.badge.icon}</div>
              <h2 className="text-3xl font-bold text-foreground">
                {config.completion.badge.title}
              </h2>
            </div>

            {/* Gráfico */}
            {config.completion.chart && (
              <div className="bg-muted/30 p-6 rounded-xl">
                <h3 className="text-xl font-bold text-center mb-6 flex items-center justify-center gap-2">
                  {config.completion.summary?.icon} {config.completion.summary?.title}
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={config.completion.chart.data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="accuracy" 
                      stroke="#10b981" 
                      strokeWidth={3}
                      dot={{ fill: '#10b981', r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Insights */}
            {config.completion.summary && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {config.completion.summary.insights.map((insight, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 rounded-lg border border-purple-200/50 dark:border-purple-800/50"
                    >
                      <p className="text-sm font-semibold text-foreground">
                        {insight
                          .replace('{totalPicks}', totalPicks.toString())
                          .replace('{learnedPatterns}', learnedPatterns.toString())
                          .replace('{accuracy}', accuracy.toString())}
                      </p>
                    </motion.div>
                  ))}
                </div>

                {/* Contexto Real */}
                {config.completion.summary.realWorldContext && (
                  <div className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
                    <h4 className="text-lg font-bold text-foreground mb-4">
                      {config.completion.summary.realWorldContext.title}
                    </h4>
                    <ul className="space-y-2">
                      {config.completion.summary.realWorldContext.points.map((point, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-blue-500">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Mensagem final */}
            <p className="text-center text-lg text-muted-foreground">
              {config.completion.message}
            </p>

            <Button onClick={() => onComplete({ selections, selectedGenre })} size="lg" className="w-full py-6 text-lg">
              ✅ Continuar Aula
            </Button>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Tela de etapas
  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        className="max-w-3xl w-full my-8"
      >
        <Card className="p-8 bg-white/95 dark:bg-slate-800/95 backdrop-blur shadow-2xl space-y-6">
          {/* Header da etapa */}
          {currentStepData?.week && (
            <div className="text-center pb-4 border-b border-border">
              <h3 className="text-2xl font-bold text-foreground">{currentStepData.week}</h3>
              {currentStepData.context && (
                <p className="text-sm text-muted-foreground mt-2">{currentStepData.context}</p>
              )}
              {currentStepData.iaKnowledge && (
                <div className="mt-3 inline-block px-4 py-2 bg-blue-50 dark:bg-blue-950/30 rounded-full border border-blue-200 dark:border-blue-800">
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    {currentStepData.iaKnowledge.replace('{previousGenre}', selectedGenre)}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Prompt */}
          <div className="text-center">
            <h4 className="text-xl font-semibold text-foreground mb-6">
              {currentStepData?.prompt}
            </h4>
          </div>

          {/* Opções */}
          {!showFeedback && (
            <div className="grid gap-4">
              {options.map((option: any) => (
                <motion.div
                  key={option.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    onClick={() => handleOptionSelect(option.id)}
                    className="p-6 cursor-pointer hover:shadow-xl transition-all border-2 hover:border-primary"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-4xl">{option.emoji}</span>
                      <div className="flex-1 text-left">
                        <h5 className="font-bold text-lg text-foreground">{option.title}</h5>
                        {option.description && (
                          <p className="text-sm text-muted-foreground">{option.description}</p>
                        )}
                        {option.tag && (
                          <span className="inline-block mt-2 px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
                            {option.tag}
                          </span>
                        )}
                        {option.matchScore && (
                          <span className="inline-block mt-2 ml-2 px-3 py-1 bg-green-500/10 text-green-600 text-xs font-bold rounded-full">
                            {option.matchScore} compatível
                          </span>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {/* Feedback */}
          {showFeedback && renderFeedback()}

          {/* Progresso */}
          <div className="pt-4">
            <p className="text-xs text-center text-muted-foreground mb-2">
              Etapa {currentStep + 1} de {config.steps.length}
            </p>
            <Progress value={((currentStep + 1) / config.steps.length) * 100} />
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
