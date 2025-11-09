import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, HelpCircle } from 'lucide-react';
import { GuidedLessonData } from '@/types/guidedLesson';

interface ExercisePreviewProps {
  lesson: GuidedLessonData;
}

export function ExercisePreview({ lesson }: ExercisePreviewProps) {
  if (!lesson.exercisesConfig || lesson.exercisesConfig.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center text-muted-foreground">
          <p>Nenhum exercício configurado para esta aula</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <Card className="border-primary bg-primary/5">
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Preview dos Exercícios</span>
            <Badge variant="secondary">{lesson.exercisesConfig.length} exercícios</Badge>
          </CardTitle>
          <CardDescription>
            Visualize como os exercícios vão aparecer para os alunos
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Exercises Preview */}
      {lesson.exercisesConfig.map((exercise, index) => (
        <Card key={exercise.id} className="border-2">
          <CardHeader className="bg-muted/30">
            <div className="flex items-center justify-between mb-2">
              <Badge variant="outline">Exercício {index + 1}</Badge>
              <Badge className="capitalize">{exercise.type}</Badge>
            </div>
            <CardTitle className="text-xl">{exercise.title}</CardTitle>
            <CardDescription className="text-base">{exercise.instruction}</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {/* Fill-in-the-Blanks Preview */}
            {exercise.type === 'fill-in-blanks' && exercise.data?.sentences && (
              <div className="space-y-6">
                {exercise.data.sentences.map((sentence: any, sentIndex: number) => (
                  <Card key={sentence.id} className="border border-muted">
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        <div className="flex items-start gap-2">
                          <Badge variant="secondary" className="mt-1">
                            {sentIndex + 1}
                          </Badge>
                          <p className="text-base flex-1">
                            {sentence.text.replace('_______', '___')}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Input 
                            placeholder="Digite sua resposta..."
                            disabled
                            className="bg-background"
                          />
                          <Button variant="ghost" size="icon" disabled>
                            <HelpCircle className="h-4 w-4" />
                          </Button>
                        </div>

                        {sentence.hint && (
                          <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
                            <HelpCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                            <div className="text-sm text-amber-700 dark:text-amber-300">
                              <p className="font-medium">Dica:</p>
                              <p>{sentence.hint}</p>
                            </div>
                          </div>
                        )}

                        {sentence.explanation && (
                          <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <div className="text-sm text-green-700 dark:text-green-300">
                              <p className="font-medium">Explicação:</p>
                              <p>{sentence.explanation}</p>
                            </div>
                          </div>
                        )}

                        {sentence.correctAnswers && sentence.correctAnswers.length > 0 && (
                          <div className="p-2 bg-muted rounded text-xs">
                            <span className="font-medium">Respostas aceitas: </span>
                            <span className="text-muted-foreground">
                              {sentence.correctAnswers.join(', ')}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {exercise.data.feedback && (
                  <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
                    <CardContent className="pt-6">
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                        Mensagens de Feedback:
                      </p>
                      <div className="space-y-1 text-sm text-blue-700 dark:text-blue-300">
                        <p>✅ Todas corretas: {exercise.data.feedback.allCorrect}</p>
                        <p>👍 Algumas corretas: {exercise.data.feedback.someCorrect}</p>
                        <p>💡 Precisa revisar: {exercise.data.feedback.needsReview}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* True/False Preview */}
            {exercise.type === 'true-false' && exercise.data?.statements && (
              <div className="space-y-4">
                {exercise.data.statements.map((statement: any, stIndex: number) => (
                  <Card key={statement.id} className="border border-muted">
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <Badge variant="secondary" className="mt-1">
                            {stIndex + 1}
                          </Badge>
                          <p className="flex-1">{statement.text}</p>
                        </div>

                        <div className="flex gap-2">
                          <Button variant="outline" disabled className="flex-1">
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Verdadeiro
                          </Button>
                          <Button variant="outline" disabled className="flex-1">
                            <XCircle className="mr-2 h-4 w-4" />
                            Falso
                          </Button>
                        </div>

                        <div className={`flex items-start gap-2 p-3 rounded-lg border ${
                          statement.correct 
                            ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800'
                            : 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800'
                        }`}>
                          {statement.correct ? (
                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                          )}
                          <div className={`text-sm ${
                            statement.correct 
                              ? 'text-green-700 dark:text-green-300'
                              : 'text-red-700 dark:text-red-300'
                          }`}>
                            <p className="font-medium">
                              Resposta correta: {statement.correct ? 'VERDADEIRO' : 'FALSO'}
                            </p>
                            <p className="mt-1">{statement.explanation}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {exercise.data.feedback && (
                  <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
                    <CardContent className="pt-6">
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                        Mensagens de Feedback:
                      </p>
                      <div className="space-y-1 text-sm text-blue-700 dark:text-blue-300">
                        <p>✅ Todas corretas: {exercise.data.feedback.allCorrect}</p>
                        <p>👍 Algumas corretas: {exercise.data.feedback.someCorrect}</p>
                        <p>💡 Precisa revisar: {exercise.data.feedback.needsReview}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Scenario Selection Preview */}
            {exercise.type === 'scenario-selection' && exercise.data?.scenarios && (
              <div className="space-y-4">
                <div className="grid gap-3">
                  {exercise.data.scenarios.map((scenario: any) => (
                    <Card 
                      key={scenario.id} 
                      className={`border-2 cursor-not-allowed ${
                        scenario.isCorrect 
                          ? 'border-green-500 bg-green-50 dark:bg-green-950/30'
                          : 'border-muted'
                      }`}
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                          <span className="text-3xl">{scenario.emoji}</span>
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg mb-1">{scenario.title}</h4>
                            <p className="text-sm text-muted-foreground mb-3">
                              {scenario.description}
                            </p>
                            
                            {scenario.isCorrect && (
                              <Badge className="bg-green-600">
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Resposta Correta
                              </Badge>
                            )}

                            <div className="mt-3 p-3 bg-background rounded-lg border">
                              <p className="text-sm">
                                <strong>Feedback:</strong> {scenario.feedback}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {exercise.data.correctExplanation && (
                  <Card className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
                    <CardContent className="pt-6">
                      <p className="text-sm font-medium text-green-900 dark:text-green-100 mb-2">
                        Explicação:
                      </p>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        {exercise.data.correctExplanation}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {exercise.data.followUpQuestion && (
                  <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
                    <CardContent className="pt-6">
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                        Pergunta de Reflexão:
                      </p>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                        {exercise.data.followUpQuestion}
                      </p>
                      {exercise.data.followUpAnswer && (
                        <p className="text-sm text-blue-600 dark:text-blue-400">
                          <strong>Resposta:</strong> {exercise.data.followUpAnswer}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Unknown Type */}
            {!['fill-in-blanks', 'true-false', 'scenario-selection'].includes(exercise.type) && (
              <div className="p-6 border border-dashed rounded-lg text-center text-muted-foreground">
                <p>Preview não disponível para o tipo: <strong>{exercise.type}</strong></p>
                <p className="text-sm mt-2">Dados do exercício estão armazenados e serão renderizados corretamente na aula.</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
