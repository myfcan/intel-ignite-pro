import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface QuizPlaygroundLessonProps {
  content: {
    quiz: {
      question: string;
      options: string[];
      correctAnswer: string;
    };
    playgroundInstructions: string;
  };
  onSubmit: (answers: any) => Promise<any>;
  testInPlayground: (prompt: string) => Promise<{ aiResponse: string; aiFeedback: string }>;
  submitting: boolean;
}

export const QuizPlaygroundLesson = ({ 
  content, 
  onSubmit, 
  testInPlayground, 
  submitting 
}: QuizPlaygroundLessonProps) => {
  const [quizAnswer, setQuizAnswer] = useState('');
  const [quizResult, setQuizResult] = useState<{ correct: boolean } | null>(null);
  const [prompt, setPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiFeedback, setAiFeedback] = useState('');
  const [testing, setTesting] = useState(false);

  const handleQuizSubmit = () => {
    const correct = quizAnswer === content.quiz.correctAnswer;
    setQuizResult({ correct });
  };

  const handleTestPrompt = async () => {
    if (!prompt.trim()) return;
    
    setTesting(true);
    try {
      const result = await testInPlayground(prompt);
      setAiResponse(result.aiResponse);
      setAiFeedback(result.aiFeedback);
    } catch (error) {
      console.error('Playground error:', error);
    } finally {
      setTesting(false);
    }
  };

  const handleFinalSubmit = async () => {
    await onSubmit({
      quizCorrect: quizResult?.correct,
      promptTested: prompt
    });
  };

  return (
    <div className="space-y-6">
      {/* PART 1: QUIZ */}
      <Card>
        <CardHeader>
          <CardTitle>❓ Quiz</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-lg font-medium">{content.quiz.question}</p>
          
          <RadioGroup value={quizAnswer} onValueChange={setQuizAnswer}>
            {content.quiz.options.map((option) => (
              <div key={option} className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-accent">
                <RadioGroupItem value={option} id={option} />
                <Label htmlFor={option} className="flex-1 cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>

          <Button
            onClick={handleQuizSubmit}
            disabled={!quizAnswer || !!quizResult}
            className="w-full"
          >
            Confirmar Resposta
          </Button>

          {quizResult && (
            <div className={`p-4 rounded-lg ${quizResult.correct ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              <p className="font-bold text-lg">
                {quizResult.correct ? '✅ Correto!' : '❌ Incorreto'}
              </p>
              {!quizResult.correct && (
                <p className="text-sm mt-2">
                  Resposta correta: {content.quiz.correctAnswer}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* PART 2: PLAYGROUND */}
      {quizResult?.correct && (
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle>🎮 Playground - Teste na Prática!</CardTitle>
            <p className="text-muted-foreground">{content.playgroundInstructions}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Digite seu prompt aqui..."
              rows={4}
              className="resize-none"
            />

            <Button
              onClick={handleTestPrompt}
              disabled={!prompt.trim() || testing}
              className="w-full"
            >
              {testing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Testando...
                </>
              ) : (
                '🤖 Testar com IA'
              )}
            </Button>

            {aiResponse && (
              <div className="space-y-4">
                <Card className="bg-blue-50">
                  <CardHeader>
                    <CardTitle className="text-base">💬 Resposta da IA:</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap">{aiResponse}</p>
                  </CardContent>
                </Card>

                <Card className="bg-purple-50">
                  <CardHeader>
                    <CardTitle className="text-base">💡 Feedback sobre seu prompt:</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap">{aiFeedback}</p>
                  </CardContent>
                </Card>

                <Button
                  onClick={handleFinalSubmit}
                  disabled={submitting}
                  className="w-full"
                  size="lg"
                >
                  {submitting ? 'Enviando...' : 'Concluir Aula'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
