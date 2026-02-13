import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ExerciseErrorCard } from './ExerciseErrorCard';
import { Checkbox } from '@/components/ui/checkbox';
import { useV7SoundEffects } from './v7/cinematic/useV7SoundEffects';
import confetti from 'canvas-confetti';

interface DataPoint {
  id: string;
  label: string;
  isCorrect: boolean;
  explanation?: string;
}

interface Scenario {
  id: string;
  emoji: string;
  platform: string;
  situation: string;
  dataPoints: DataPoint[];
  context: string;
}

interface DataCollectionExerciseProps {
  title: string;
  instruction: string;
  scenario: Scenario; // Agora recebe apenas UM cenário
  onComplete: (score: number) => void;
}

export function DataCollectionExercise({
  title,
  instruction,
  scenario,
  onComplete
}: DataCollectionExerciseProps) {
  const [selectedData, setSelectedData] = useState<Set<string>>(new Set());
  const [showFeedback, setShowFeedback] = useState(false);
  const { playSound } = useV7SoundEffects(0.6, true);

  // Validação defensiva
  if (!scenario) {
    return (
      <ExerciseErrorCard 
        title="⚠️ Exercício Sem Cenário"
        message="Este exercício de coleta de dados não possui cenário configurado."
        details="Campo obrigatório 'scenario' está ausente."
      />
    );
  }

  const handleDataToggle = (dataId: string) => {
    if (showFeedback) return;
    
    setSelectedData(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dataId)) {
        newSet.delete(dataId);
        playSound('click-soft');
      } else {
        newSet.add(dataId);
        playSound('click-confirm');
      }
      return newSet;
    });
  };

  const handleSubmit = () => {
    const correctIds = scenario.dataPoints
      .filter(d => d.isCorrect)
      .map(d => d.id);
    
    const incorrectIds = scenario.dataPoints
      .filter(d => !d.isCorrect)
      .map(d => d.id);

    // Calcular score: % de acertos
    const correctSelected = correctIds.filter(id => selectedData.has(id)).length;
    const incorrectSelected = incorrectIds.filter(id => selectedData.has(id)).length;
    const maxScore = correctIds.length;
    const isPerfect = correctSelected === maxScore && incorrectSelected === 0;
    
    // Score baseado na proporção de acertos
    const score = isPerfect ? 100 : Math.round((correctSelected / maxScore) * 100);
    
    setShowFeedback(true);
    
    if (isPerfect) {
      playSound('level-up');
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.5 } });
    } else if (score >= 50) {
      playSound('success');
    } else {
      playSound('error');
    }
    
    // Chama onComplete IMEDIATAMENTE sem delay
    onComplete(score);
  };

  const correctCount = scenario.dataPoints.filter(d => d.isCorrect).length;
  const allCorrectSelected = scenario.dataPoints
    .filter(d => d.isCorrect)
    .every(d => selectedData.has(d.id));
  const noIncorrectSelected = scenario.dataPoints
    .filter(d => !d.isCorrect)
    .every(d => !selectedData.has(d.id));
  const canSubmit = selectedData.size > 0;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center"
      >
        <h3 className="text-3xl font-bold mb-3 text-foreground">{title}</h3>
        <p className="text-muted-foreground text-lg mb-2">{instruction}</p>
        <p className="text-sm text-amber-600 dark:text-amber-400">
          💡 Dica: A IA aprende múltiplas coisas ao mesmo tempo!
        </p>
      </motion.div>

      <Card className="p-8 mb-6 bg-gradient-to-br from-primary/5 to-accent/5 border-2">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-6xl">{scenario.emoji}</span>
            <div className="text-left">
              <p className="text-2xl font-bold text-foreground">
                {scenario.platform}
              </p>
              <p className="text-sm text-muted-foreground">{scenario.context}</p>
            </div>
          </div>
          <p className="text-lg font-medium text-foreground px-6 py-4 bg-white/50 dark:bg-slate-900/50 rounded-xl">
            {scenario.situation}
          </p>
        </div>

        <div className="mb-6">
          <p className="text-sm font-semibold text-muted-foreground mb-4 text-center">
            Selecione TODOS os dados que a IA está coletando nessa situação:
          </p>
          
          <div className="grid gap-3">
            {scenario.dataPoints.map((dataPoint) => {
                  const isSelected = selectedData.has(dataPoint.id);
                  const showResult = showFeedback && isSelected;
                  const isCorrectChoice = dataPoint.isCorrect;
                  
                  return (
                    <motion.div
                      key={dataPoint.id}
                      whileHover={{ scale: showFeedback ? 1 : 1.02 }}
                      whileTap={{ scale: showFeedback ? 1 : 0.98 }}
                    >
                      <label
                        className={`
                          flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all
                          ${showFeedback && isSelected
                            ? isCorrectChoice
                              ? 'border-green-500 bg-green-50 dark:bg-green-950/30'
                              : 'border-red-500 bg-red-50 dark:bg-red-950/30'
                            : isSelected
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50 bg-card'
                          }
                          ${showFeedback ? 'cursor-not-allowed' : ''}
                        `}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleDataToggle(dataPoint.id)}
                          disabled={showFeedback}
                          className="flex-shrink-0"
                        />
                        <span className="flex-1 font-medium text-foreground">
                          {dataPoint.label}
                        </span>
                        
                        {showResult && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex-shrink-0"
                          >
                            {isCorrectChoice ? (
                              <span className="text-2xl">✓</span>
                            ) : (
                              <span className="text-2xl">✗</span>
                            )}
                          </motion.div>
                        )}
                      </label>
                      
                      {showFeedback && isSelected && dataPoint.explanation && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="text-sm text-muted-foreground mt-2 ml-12"
                        >
                          {dataPoint.explanation}
                        </motion.p>
                      )}
                    </motion.div>
                  );
              })}
            </div>
          </div>

          {!showFeedback && (
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="w-full"
              size="lg"
            >
              {canSubmit 
                ? `✅ Verificar Resposta${selectedData.size > 1 ? 's' : ''} (${selectedData.size} selecionada${selectedData.size > 1 ? 's' : ''})`
                : '⏳ Selecione os dados que a IA coleta'
              }
            </Button>
          )}
        </Card>

        <AnimatePresence>
          {showFeedback && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`p-6 rounded-xl border-2 text-center ${
                allCorrectSelected && noIncorrectSelected
                  ? 'bg-green-50 dark:bg-green-950/30 border-green-500'
                  : 'bg-orange-50 dark:bg-orange-950/30 border-orange-500'
              }`}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 15 }}
              >
                {allCorrectSelected && noIncorrectSelected ? (
                  <>
                    <p className="text-2xl font-bold mb-2">🎉 Perfeito!</p>
                    <p className="text-muted-foreground">
                      Você identificou todos os {correctCount} dados corretamente!
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-2xl font-bold mb-2">📚 Quase lá!</p>
                    <p className="text-muted-foreground">
                      A IA estava coletando {correctCount} tipos de dados. Continue observando!
                    </p>
                  </>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
    </div>
  );
}
