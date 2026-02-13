import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, RotateCcw, CheckCircle2, XCircle, Timer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TimedQuizExercise } from '@/components/lessons/TimedQuizExercise';
import type { TimedQuizExerciseData } from '@/types/exerciseSchemas';

const DEMO_DATA: TimedQuizExerciseData = {
  timePerQuestion: 15,
  bonusPerSecondLeft: 2,
  timeoutPenalty: 'wrong',
  visualTheme: 'cyber',
  questions: [
    {
      id: 'tq-demo-1',
      question: 'Qual ferramenta de IA é mais usada para gerar textos longos e criativos?',
      options: [
        { id: 'a1', text: 'Midjourney', isCorrect: false },
        { id: 'a2', text: 'ChatGPT', isCorrect: true },
        { id: 'a3', text: 'Canva', isCorrect: false },
        { id: 'a4', text: 'Notion AI', isCorrect: false },
      ],
      explanation: 'O ChatGPT (OpenAI) é a ferramenta mais popular para geração de textos longos e criativos, com bilhões de interações mensais.',
    },
    {
      id: 'tq-demo-2',
      question: 'O que significa "prompt engineering"?',
      options: [
        { id: 'b1', text: 'Programar robôs industriais', isCorrect: false },
        { id: 'b2', text: 'Desenhar interfaces de IA', isCorrect: false },
        { id: 'b3', text: 'Técnica de criar instruções otimizadas para IAs', isCorrect: true },
        { id: 'b4', text: 'Configurar servidores de machine learning', isCorrect: false },
      ],
      explanation: 'Prompt engineering é a arte de criar instruções precisas e otimizadas para obter os melhores resultados de modelos de IA.',
    },
    {
      id: 'tq-demo-3',
      question: 'Qual dessas é uma forma real de gerar renda extra com IA em 2025?',
      options: [
        { id: 'c1', text: 'Criar conteúdo automatizado para redes sociais', isCorrect: true },
        { id: 'c2', text: 'Deixar a IA minerar criptomoedas sozinha', isCorrect: false },
        { id: 'c3', text: 'Vender o código-fonte do ChatGPT', isCorrect: false },
        { id: 'c4', text: 'Hackear bancos com IA', isCorrect: false },
      ],
      explanation: 'Criar conteúdo automatizado (posts, vídeos, copywriting) com IA é uma das formas mais acessíveis e legais de gerar renda extra.',
    },
  ],
  feedback: {
    perfect: '🏆 Perfeito! Você domina IA para renda extra!',
    good: '👏 Ótimo trabalho! Quase lá!',
    needsReview: '📚 Revise os conceitos e tente novamente.',
    timeBonus: '⚡ Bônus de velocidade!',
  },
};

export default function AdminTimedQuizDemo() {
  const navigate = useNavigate();
  const [lastScore, setLastScore] = useState<number | null>(null);
  const [runKey, setRunKey] = useState(0);

  const handleComplete = (score: number) => {
    setLastScore(score);
    console.log(`[TimedQuiz Demo] Score final: ${score}%`);
  };

  const handleReset = () => {
    setLastScore(null);
    setRunKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/debugs')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Timer className="w-6 h-6 text-red-500" />
              Demo: Timed Quiz (3 perguntas)
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Teste de stale-closure fix — valide que o score final inclui a última pergunta corretamente.
            </p>
          </div>
        </div>

        {/* Score result card */}
        {lastScore !== null && (
          <Card className="border-2 border-green-500/30 bg-green-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                {lastScore >= 90 ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : lastScore >= 50 ? (
                  <CheckCircle2 className="w-5 h-5 text-amber-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
                Resultado Final
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-4xl font-bold text-center">{lastScore}%</div>
              <div className="text-sm text-muted-foreground text-center space-y-1">
                <p>3 perguntas · todas corretas = 100%</p>
                <p>Se respondeu tudo certo e viu <strong>100%</strong>, o fix de stale closure está funcionando. ✅</p>
                <p>Se viu <strong>67%</strong> (2/3), o bug de stale closure <strong>persiste</strong>. ❌</p>
              </div>
              <Button variant="outline" className="w-full" onClick={handleReset}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Rodar Novamente
              </Button>
            </CardContent>
          </Card>
        )}

        {/* TimedQuiz component */}
        {lastScore === null && (
          <TimedQuizExercise
            key={runKey}
            title="Quiz Rápido: IA & Renda Extra"
            instruction="Responda as 3 perguntas antes que o tempo acabe!"
            data={DEMO_DATA}
            onComplete={handleComplete}
          />
        )}
      </div>
    </div>
  );
}
