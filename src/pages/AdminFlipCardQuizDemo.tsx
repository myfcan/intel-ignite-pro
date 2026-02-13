import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, RotateCcw, CheckCircle2, XCircle, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FlipCardQuizExercise } from '@/components/lessons/FlipCardQuizExercise';
import type { FlipCardQuizExerciseData } from '@/types/exerciseSchemas';

const DEMO_DATA: FlipCardQuizExerciseData = {
  cards: [
    {
      id: 'fc-demo-1',
      front: {
        icon: 'Brain',
        label: 'Conceito 1',
        color: 'cyan',
      },
      back: {
        text: 'Qual modelo de IA é especializado em gerar imagens a partir de texto?',
      },
      options: [
        { id: 'a1', text: 'GPT-4', isCorrect: false },
        { id: 'a2', text: 'Midjourney', isCorrect: true },
        { id: 'a3', text: 'Whisper', isCorrect: false },
      ],
      explanation: 'O Midjourney é um dos principais modelos especializados em geração de imagens a partir de prompts de texto.',
    },
    {
      id: 'fc-demo-2',
      front: {
        icon: 'Zap',
        label: 'Desafio 2',
        color: 'emerald',
      },
      back: {
        text: 'O que é um "token" no contexto de modelos de linguagem?',
      },
      options: [
        { id: 'b1', text: 'Uma moeda digital', isCorrect: false },
        { id: 'b2', text: 'Um pedaço de texto processado pelo modelo', isCorrect: true },
        { id: 'b3', text: 'Um tipo de API key', isCorrect: false },
        { id: 'b4', text: 'Um certificado de segurança', isCorrect: false },
      ],
      explanation: 'Tokens são as unidades básicas de texto que os LLMs processam — podem ser palavras, partes de palavras ou caracteres.',
    },
    {
      id: 'fc-demo-3',
      front: {
        icon: 'Target',
        label: 'Aplicação 3',
        color: 'purple',
      },
      back: {
        text: 'Qual técnica de prompt melhora respostas complexas pedindo à IA para "pensar passo a passo"?',
      },
      options: [
        { id: 'c1', text: 'Few-shot prompting', isCorrect: false },
        { id: 'c2', text: 'Chain of Thought', isCorrect: true },
        { id: 'c3', text: 'Zero-shot classification', isCorrect: false },
      ],
      explanation: 'Chain of Thought (CoT) é a técnica de pedir à IA para raciocinar passo a passo, melhorando a qualidade em tarefas complexas.',
    },
  ],
  feedback: {
    perfect: '🏆 Incrível! Você acertou todos os cards!',
    good: '👏 Bom trabalho! Continue praticando!',
    needsReview: '📚 Revise os conceitos e tente de novo.',
  },
};

export default function AdminFlipCardQuizDemo() {
  const navigate = useNavigate();
  const [lastScore, setLastScore] = useState<number | null>(null);
  const [runKey, setRunKey] = useState(0);

  const handleComplete = (score: number) => {
    setLastScore(score);
    console.log(`[FlipCard Quiz Demo] Score final: ${score}%`);
  };

  const handleReset = () => {
    setLastScore(null);
    setRunKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/debugs')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Layers className="w-6 h-6 text-purple-500" />
              Demo: FlipCard Quiz (3 cards)
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Teste do exercício flipcard-quiz — vire os cards, responda e valide o score.
            </p>
          </div>
        </div>

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
              <div className="text-sm text-muted-foreground text-center">
                <p>3 cards · todas corretas = 100%</p>
              </div>
              <Button variant="outline" className="w-full" onClick={handleReset}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Rodar Novamente
              </Button>
            </CardContent>
          </Card>
        )}

        {lastScore === null && (
          <FlipCardQuizExercise
            key={runKey}
            title="Quiz de Cards: Fundamentos de IA"
            instruction="Vire cada card, leia a pergunta e selecione a resposta correta!"
            data={DEMO_DATA}
            onComplete={handleComplete}
          />
        )}
      </div>
    </div>
  );
}
