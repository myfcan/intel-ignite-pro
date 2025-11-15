import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Wrench } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { validateExercise } from '@/lib/exerciseValidator';

/**
 * 🔧 PÁGINA DE CORREÇÃO DE EXERCÍCIOS
 *
 * Converte exercícios no formato antigo para o formato novo esperado pelo validator.
 */
export default function AdminFixLessonExercises() {
  const navigate = useNavigate();
  const [lessonId, setLessonId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const fixExercise = (exercise: any, index: number): any => {
    const timestamp = Date.now();
    const baseExercise = {
      id: exercise.id || `exercise-${timestamp}-${index}`,
      title: exercise.title || getExerciseTitle(exercise.type),
      instruction: exercise.instruction || getExerciseInstruction(exercise.type)
    };

    switch (exercise.type) {
      case 'multiple-choice':
        // ✅ CRÍTICO: Converter correctAnswer de índice (número) para texto da opção
        let correctAnswerText: string;

        if (exercise.correctOptionIndex !== undefined) {
          correctAnswerText = exercise.options[exercise.correctOptionIndex];
        } else if (typeof exercise.correctAnswer === 'number') {
          // ✅ BUG FIX: Converter índice numérico para texto
          correctAnswerText = exercise.options[exercise.correctAnswer];
        } else {
          correctAnswerText = exercise.correctAnswer;
        }

        return {
          ...baseExercise,
          type: 'multiple-choice',
          data: {
            question: exercise.question,
            options: exercise.options,
            correctAnswer: correctAnswerText,
            explanation: exercise.feedback || exercise.explanation || 'Correto!'
          }
        };

      case 'true-false':
        // Verificar se já está no formato correto
        if (exercise.data?.statements) {
          return exercise; // Já está correto
        }

        return {
          ...baseExercise,
          type: 'true-false',
          data: {
            statements: [{
              id: `stmt-${index}`,
              text: exercise.statement || exercise.question,
              correct: exercise.answer ?? exercise.correctAnswer,
              explanation: exercise.feedback || exercise.explanation || 'Correto!'
            }],
            feedback: {
              perfect: 'Perfeito! Você acertou!',
              good: 'Bom trabalho!',
              needsReview: 'Revise o conteúdo da lição.'
            }
          }
        };

      case 'fill-in-blanks':
        // Verificar se já está no formato correto
        if (exercise.data?.sentences) {
          return exercise; // Já está correto
        }

        let sentenceText = '';
        let correctAnswersArray: string[] = [];

        if (exercise.question && exercise.question.includes('_')) {
          sentenceText = exercise.question;
          correctAnswersArray = exercise.correctAnswers || exercise.blanks || [];
        } else if (exercise.sentence) {
          const correctAnswerValue = exercise.correctAnswer || exercise.answer || '';
          sentenceText = exercise.sentence.replace(correctAnswerValue, '_______');
          correctAnswersArray = Array.isArray(correctAnswerValue) ? correctAnswerValue : [correctAnswerValue];
        } else {
          sentenceText = exercise.text || exercise.question || '';
          correctAnswersArray = exercise.correctAnswers || exercise.blanks || [];
        }

        return {
          ...baseExercise,
          type: 'fill-in-blanks',
          data: {
            sentences: [{
              id: `sentence-${index}`,
              text: sentenceText,
              correctAnswers: correctAnswersArray,
              hint: exercise.hint || 'Pense no que você aprendeu',
              explanation: exercise.feedback || exercise.explanation || 'Excelente!'
            }],
            feedback: {
              allCorrect: 'Excelente!',
              someCorrect: 'Bom, mas revise algumas respostas.',
              needsReview: 'Revise o conteúdo da lição.'
            }
          }
        };

      default:
        return exercise;
    }
  };

  const getExerciseTitle = (type: string): string => {
    const titles: Record<string, string> = {
      'multiple-choice': 'Múltipla Escolha',
      'true-false': 'Verdadeiro ou Falso',
      'fill-in-blanks': 'Preencher Lacunas',
      'complete-sentence': 'Complete a Sentença'
    };
    return titles[type] || 'Exercício';
  };

  const getExerciseInstruction = (type: string): string => {
    const instructions: Record<string, string> = {
      'multiple-choice': 'Escolha a alternativa correta:',
      'true-false': 'Indique se a afirmação é verdadeira ou falsa:',
      'fill-in-blanks': 'Preencher os espaços em branco:',
      'complete-sentence': 'Complete a sentença com a palavra correta:'
    };
    return instructions[type] || 'Responda o exercício:';
  };

  const handleFix = async () => {
    if (!lessonId.trim()) {
      setResult({ error: 'Digite o ID da lição' });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // 1. Buscar lição atual
      const { data: lesson, error: fetchError } = await supabase
        .from('lessons')
        .select('id, title, exercises')
        .eq('id', lessonId)
        .single();

      if (fetchError) throw fetchError;
      if (!lesson) throw new Error('Lição não encontrada');

      // 2. Verificar se tem exercícios
      if (!lesson.exercises || !Array.isArray(lesson.exercises) || lesson.exercises.length === 0) {
        setResult({
          error: 'Esta lição não tem exercícios para corrigir',
          lesson: lesson
        });
        setLoading(false);
        return;
      }

      console.log('📥 Exercícios ANTES da correção:', lesson.exercises);

      // 3. Aplicar correções
      const fixedExercises = lesson.exercises.map((ex, idx) => fixExercise(ex, idx));

      console.log('📤 Exercícios DEPOIS da correção:', fixedExercises);

      // 4. Validar exercícios corrigidos
      const validationResults = fixedExercises.map(ex => validateExercise(ex));
      const hasErrors = validationResults.some(r => !r.isValid);

      if (hasErrors) {
        setResult({
          error: 'Alguns exercícios ainda têm erros após correção',
          validationResults: validationResults,
          before: lesson.exercises,
          after: fixedExercises
        });
        setLoading(false);
        return;
      }

      // 5. Atualizar no banco
      const { error: updateError } = await supabase
        .from('lessons')
        .update({
          exercises: fixedExercises,
          exercises_version: 1
        })
        .eq('id', lessonId);

      if (updateError) throw updateError;

      setResult({
        success: true,
        lesson: lesson,
        before: lesson.exercises,
        after: fixedExercises,
        validationResults: validationResults
      });

    } catch (error: any) {
      console.error('❌ Erro ao corrigir exercícios:', error);
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Button
        variant="ghost"
        onClick={() => navigate('/admin/pipeline/manage-lessons')}
        className="mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="w-5 h-5" />
            Corrigir Exercícios de Lição
          </CardTitle>
          <CardDescription>
            Converte exercícios no formato antigo para o formato novo (com structure data + validação)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">ID da Lição</label>
            <Input
              placeholder="8aea62d7-009c-444e-be3f-70c3cfcadf21"
              value={lessonId}
              onChange={(e) => setLessonId(e.target.value)}
            />
          </div>

          <Button
            onClick={handleFix}
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Corrigindo...' : 'Corrigir Exercícios'}
          </Button>

          {result && (
            <div className="mt-6">
              {result.success ? (
                <div className="bg-green-50 border border-green-200 rounded p-4">
                  <h3 className="font-bold text-green-800 mb-2">✅ Exercícios Corrigidos com Sucesso!</h3>
                  <p className="text-sm text-green-700 mb-4">
                    Lição: {result.lesson.title}
                  </p>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm mb-2">📊 Validação:</h4>
                      {result.validationResults.map((r: any, i: number) => (
                        <div key={i} className="text-xs bg-white p-2 rounded mb-1">
                          ✅ Exercício {i + 1}: {r.exerciseType} - Válido
                        </div>
                      ))}
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm mb-2">🔍 Mudanças:</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-xs font-medium mb-1">ANTES:</p>
                          <pre className="text-xs bg-red-50 p-2 rounded overflow-auto max-h-48">
                            {JSON.stringify(result.before, null, 2)}
                          </pre>
                        </div>
                        <div>
                          <p className="text-xs font-medium mb-1">DEPOIS:</p>
                          <pre className="text-xs bg-green-50 p-2 rounded overflow-auto max-h-48">
                            {JSON.stringify(result.after, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded p-4">
                  <h3 className="font-bold text-red-800 mb-2">❌ Erro</h3>
                  <p className="text-sm text-red-700">{result.error}</p>

                  {result.validationResults && (
                    <div className="mt-4">
                      <h4 className="font-semibold text-sm mb-2">Erros de Validação:</h4>
                      {result.validationResults.map((r: any, i: number) => (
                        <div key={i} className="text-xs bg-white p-2 rounded mb-1">
                          {r.isValid ? '✅' : '❌'} Exercício {i + 1}: {r.exerciseType}
                          {r.errors.length > 0 && (
                            <ul className="ml-4 mt-1">
                              {r.errors.map((err: string, j: number) => (
                                <li key={j} className="text-red-600">• {err}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {result.before && result.after && (
                    <div className="mt-4">
                      <h4 className="font-semibold text-sm mb-2">Comparação:</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-xs font-medium mb-1">ANTES:</p>
                          <pre className="text-xs bg-white p-2 rounded overflow-auto max-h-48">
                            {JSON.stringify(result.before, null, 2)}
                          </pre>
                        </div>
                        <div>
                          <p className="text-xs font-medium mb-1">DEPOIS:</p>
                          <pre className="text-xs bg-white p-2 rounded overflow-auto max-h-48">
                            {JSON.stringify(result.after, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
