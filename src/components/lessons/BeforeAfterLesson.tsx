import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

interface BeforeAfterLessonProps {
  content: {
    badExample: string;
    goodExample: string;
    challenge: string;
    challengePrompt: string;
  };
  onSubmit: (answers: any) => Promise<any>;
  testInPlayground: (prompt: string) => Promise<{ aiResponse: string; aiFeedback: string }>;
  submitting: boolean;
}

export const BeforeAfterLesson = ({ 
  content, 
  onSubmit, 
  testInPlayground,
  submitting 
}: BeforeAfterLessonProps) => {
  // Validar se o conteúdo está no formato correto
  if (!content || !content.badExample || !content.goodExample || !content.challenge || !content.challengePrompt) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">
            Conteúdo da aula não está no formato correto para este tipo de exercício.
          </p>
        </div>
      </div>
    );
  }

  const [improvedPrompt, setImprovedPrompt] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleGetSuggestion = async () => {
    setTesting(true);
    try {
      const result = await testInPlayground(
        `Analise este prompt ruim e sugira melhorias específicas: "${content.challengePrompt}". 
         Dê 3 sugestões práticas de como melhorá-lo.`
      );
      setAiSuggestion(result.aiResponse);
    } catch (error) {
      console.error('Error getting suggestion:', error);
    } finally {
      setTesting(false);
    }
  };

  const handleSubmit = async () => {
    const result = await onSubmit({
      improved: improvedPrompt.length > content.challengePrompt.length,
      improvedPrompt,
    });
    setResult(result);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🔄 Transformação: Antes e Depois</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Bad Example */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">❌</span>
              <h3 className="font-bold text-lg">Prompt Ruim:</h3>
            </div>
            <Card className="bg-red-50 border-red-200">
              <CardContent className="pt-4">
                <p className="text-gray-700 font-mono">{content.badExample}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  📉 Problema: Muito genérico, sem contexto
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Good Example */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">✅</span>
              <h3 className="font-bold text-lg">Prompt Bom:</h3>
            </div>
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-4">
                <p className="text-gray-700 font-mono">{content.goodExample}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  📈 Por que funciona: Específico, com contexto e objetivo claro
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Challenge */}
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              <h3 className="font-bold text-lg">Sua Vez!</h3>
            </div>
            
            <p className="text-muted-foreground">{content.challenge}</p>
            
            <Card className="bg-gray-50">
              <CardContent className="pt-4">
                <p className="font-semibold mb-2">Prompt original:</p>
                <p className="font-mono text-sm">{content.challengePrompt}</p>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Como você melhoraria este prompt?</label>
              <Textarea
                value={improvedPrompt}
                onChange={(e) => setImprovedPrompt(e.target.value)}
                placeholder="Digite sua versão melhorada..."
                rows={4}
                className="resize-none"
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleGetSuggestion}
                disabled={testing}
                variant="outline"
                className="flex-1"
              >
                {testing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analisando...
                  </>
                ) : (
                  '🤖 Ver Sugestão da IA'
                )}
              </Button>

              <Button
                onClick={handleSubmit}
                disabled={!improvedPrompt.trim() || submitting || !!result}
                className="flex-1"
              >
                {submitting ? 'Enviando...' : 'Enviar Resposta'}
              </Button>
            </div>

            {aiSuggestion && (
              <Card className="bg-purple-50 border-purple-200">
                <CardHeader>
                  <CardTitle className="text-base">💡 Sugestões da IA:</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{aiSuggestion}</p>
                </CardContent>
              </Card>
            )}

            {result && (
              <Card className={result.passed ? 'border-green-500 bg-green-50' : 'border-orange-500 bg-orange-50'}>
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <h3 className="text-xl font-bold mb-2">Resultado: {result.score}%</h3>
                    <p className="text-lg">{result.feedback}</p>
                    {result.passed && !result.isLastLesson && (
                      <p className="text-sm text-muted-foreground mt-2">
                        ⏳ Redirecionando para a próxima aula em instantes...
                      </p>
                    )}
                    {result.passed && result.isLastLesson && (
                      <p className="text-sm text-green-600 font-semibold mt-2">
                        🎉 Aguarde a Liv com uma surpresa especial!
                      </p>
                    )}
                  </div>
                  
                  {!result.passed && (
                    <div className="flex gap-3">
                      <Button
                        type="button"
                        onClick={() => {
                          setImprovedPrompt('');
                          setAiSuggestion('');
                          setResult(null);
                        }}
                        variant="outline"
                        className="flex-1"
                        size="lg"
                      >
                        🔄 Tentar Novamente
                      </Button>
                      <Button
                        type="button"
                        onClick={() => window.history.back()}
                        variant="secondary"
                        className="flex-1"
                        size="lg"
                      >
                        Voltar
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
