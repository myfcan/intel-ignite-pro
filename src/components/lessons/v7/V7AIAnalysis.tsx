// src/components/lessons/v7/V7AIAnalysis.tsx
// Real-time AI code analysis for V7 Comparative Playground

import { useState, useEffect, useCallback } from 'react';
import { Sparkles, TrendingUp, AlertTriangle, CheckCircle2, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface CodeAnalysisResult {
  score: number; // 0-100
  issues: CodeIssue[];
  suggestions: string[];
  improvements: Improvement[];
  metrics: CodeMetrics;
}

interface CodeIssue {
  severity: 'error' | 'warning' | 'info';
  line?: number;
  message: string;
  fix?: string;
}

interface Improvement {
  category: string;
  current: string;
  recommended: string;
  impact: 'high' | 'medium' | 'low';
}

interface CodeMetrics {
  complexity: number;
  readability: number;
  performance: number;
  bestPractices: number;
}

interface V7AIAnalysisProps {
  code: string;
  language: string;
  professionalCode?: string;
  onAnalysisComplete?: (result: CodeAnalysisResult) => void;
  realTime?: boolean;
}

export const V7AIAnalysis = ({
  code,
  language,
  professionalCode,
  onAnalysisComplete,
  realTime = true,
}: V7AIAnalysisProps) => {
  // ============================================================================
  // STATE
  // ============================================================================

  const [analysis, setAnalysis] = useState<CodeAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // ============================================================================
  // AI ANALYSIS
  // ============================================================================

  const analyzeCode = useCallback(async (codeToAnalyze: string) => {
    setIsAnalyzing(true);

    try {
      // Simulate AI analysis (in production, call OpenAI/Anthropic)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const issues: CodeIssue[] = [];
      const suggestions: string[] = [];
      const improvements: Improvement[] = [];

      // Simple rule-based analysis (would be AI in production)

      // Check for try/catch
      if (!codeToAnalyze.includes('try') && codeToAnalyze.includes('await')) {
        issues.push({
          severity: 'error',
          message: 'Missing error handling for async operations',
          fix: 'Wrap await calls in try/catch block',
        });
        suggestions.push('Adicione try/catch para tratar erros assíncronos');
      }

      // Check for response validation
      if (codeToAnalyze.includes('fetch') && !codeToAnalyze.includes('response.ok')) {
        issues.push({
          severity: 'warning',
          message: 'Response status not validated',
          fix: 'Check response.ok before parsing',
        });
        suggestions.push('Valide response.ok antes de processar a resposta');
      }

      // Check for console.log (debugging)
      if (codeToAnalyze.includes('console.log')) {
        issues.push({
          severity: 'info',
          message: 'Console.log found - remove before production',
          fix: 'Use proper logging library',
        });
      }

      // Check variable naming
      if (/\b[a-z]\b/.test(codeToAnalyze)) {
        suggestions.push('Use nomes de variáveis descritivos em vez de letras únicas');
      }

      // Compare with professional code if available
      if (professionalCode) {
        if (professionalCode.length > codeToAnalyze.length * 1.3) {
          improvements.push({
            category: 'Robustez',
            current: 'Código básico sem tratamento completo',
            recommended: 'Adicionar validações e tratamento de erros',
            impact: 'high',
          });
        }

        if (professionalCode.includes('interface') && !codeToAnalyze.includes('interface')) {
          improvements.push({
            category: 'Type Safety',
            current: 'Sem definições de tipos',
            recommended: 'Usar TypeScript interfaces',
            impact: 'medium',
          });
        }
      }

      // Calculate metrics
      const complexity = Math.max(0, 100 - issues.length * 15);
      const readability = codeToAnalyze.includes('//') ? 85 : 70;
      const performance = codeToAnalyze.includes('async') ? 80 : 90;
      const bestPractices = Math.max(0, 100 - issues.filter((i) => i.severity === 'error').length * 25);

      const score = Math.round((complexity + readability + performance + bestPractices) / 4);

      const result: CodeAnalysisResult = {
        score,
        issues,
        suggestions,
        improvements,
        metrics: {
          complexity,
          readability,
          performance,
          bestPractices,
        },
      };

      setAnalysis(result);

      if (onAnalysisComplete) {
        onAnalysisComplete(result);
      }
    } catch (error) {
      console.error('[V7AIAnalysis] Error analyzing code:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [professionalCode, onAnalysisComplete]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    if (realTime && code) {
      // Debounce real-time analysis
      const timer = setTimeout(() => {
        analyzeCode(code);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [code, realTime, analyzeCode]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBg = (score: number): string => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <Lightbulb className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  if (!analysis && !isAnalyzing) {
    return null;
  }

  return (
    <Card className="bg-gray-900 border-gray-700 text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-purple-400" />
          Análise de Código com IA
          {isAnalyzing && (
            <span className="ml-auto text-sm text-gray-400">Analisando...</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {analysis && (
          <>
            {/* Score */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Score Geral</span>
                <span className={`text-2xl font-bold ${getScoreColor(analysis.score)}`}>
                  {analysis.score}/100
                </span>
              </div>
              <Progress value={analysis.score} className="h-2" />
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Complexidade</span>
                  <span className={getScoreColor(analysis.metrics.complexity)}>
                    {analysis.metrics.complexity}%
                  </span>
                </div>
                <Progress value={analysis.metrics.complexity} className="h-1" />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Legibilidade</span>
                  <span className={getScoreColor(analysis.metrics.readability)}>
                    {analysis.metrics.readability}%
                  </span>
                </div>
                <Progress value={analysis.metrics.readability} className="h-1" />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Performance</span>
                  <span className={getScoreColor(analysis.metrics.performance)}>
                    {analysis.metrics.performance}%
                  </span>
                </div>
                <Progress value={analysis.metrics.performance} className="h-1" />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Best Practices</span>
                  <span className={getScoreColor(analysis.metrics.bestPractices)}>
                    {analysis.metrics.bestPractices}%
                  </span>
                </div>
                <Progress value={analysis.metrics.bestPractices} className="h-1" />
              </div>
            </div>

            {/* Issues */}
            {analysis.issues.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Problemas Encontrados
                </h4>
                <div className="space-y-2">
                  {analysis.issues.map((issue, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 p-2 bg-gray-800 rounded text-sm"
                    >
                      {getSeverityIcon(issue.severity)}
                      <div className="flex-1">
                        <p className="text-white">{issue.message}</p>
                        {issue.fix && (
                          <p className="text-gray-400 text-xs mt-1">💡 {issue.fix}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Suggestions */}
            {analysis.suggestions.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-yellow-400" />
                  Sugestões
                </h4>
                <ul className="space-y-1">
                  {analysis.suggestions.map((suggestion, idx) => (
                    <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                      <span className="text-yellow-400">•</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Improvements */}
            {analysis.improvements.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-400" />
                  Melhorias Recomendadas
                </h4>
                <div className="space-y-2">
                  {analysis.improvements.map((improvement, idx) => (
                    <div key={idx} className="p-2 bg-gray-800 rounded">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{improvement.category}</span>
                        <Badge
                          variant={
                            improvement.impact === 'high'
                              ? 'destructive'
                              : improvement.impact === 'medium'
                              ? 'default'
                              : 'secondary'
                          }
                          className="text-xs"
                        >
                          {improvement.impact}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-400">
                        Atual: {improvement.current}
                      </p>
                      <p className="text-xs text-green-400">
                        Recomendado: {improvement.recommended}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Success message */}
            {analysis.score >= 80 && (
              <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded">
                <CheckCircle2 className="h-5 w-5 text-green-400" />
                <span className="text-sm text-green-300">
                  Excelente! Seu código está seguindo boas práticas!
                </span>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
