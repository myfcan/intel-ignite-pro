// src/components/lessons/v7/ComparativePlaygroundSplit.tsx
// Split-screen comparative playground showing Amateur vs Professional code

import { useState, useCallback, useMemo } from 'react';
import {
  ComparativePlayground,
  V7CinematicLesson,
  V7PlayerState,
} from '@/types/v7-cinematic.types';
import { CodeEditor } from './CodeEditor';
import { ArrowRight, TrendingUp, AlertCircle, CheckCircle2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ComparativePlaygroundSplitProps {
  comparisonData: ComparativePlayground;
  lesson: V7CinematicLesson;
  playerState: V7PlayerState;
}

export const ComparativePlaygroundSplit = ({
  comparisonData,
  lesson,
  playerState,
}: ComparativePlaygroundSplitProps) => {
  // ============================================================================
  // HOOKS AT TOP
  // ============================================================================

  const [activePane, setActivePane] = useState<'amateur' | 'professional'>('amateur');
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [amateurCode, setAmateurCode] = useState(
    comparisonData.amateur.editor.initialCode
  );
  const [executionResults, setExecutionResults] = useState<{
    amateur?: any;
    professional?: any;
  }>({});

  // ============================================================================
  // CODE EXECUTION (MOCK)
  // ============================================================================

  const executeCode = useCallback((code: string, pane: 'amateur' | 'professional') => {
    // This would integrate with a real code execution engine
    // For now, just mock the execution
    try {
      // Mock execution result
      const result = {
        success: true,
        output: '// Code executed successfully',
        executionTime: Math.random() * 100,
        memoryUsage: Math.random() * 50,
      };

      setExecutionResults((prev) => ({
        ...prev,
        [pane]: result,
      }));

      return result;
    } catch (error: any) {
      const result = {
        success: false,
        error: error.message,
      };

      setExecutionResults((prev) => ({
        ...prev,
        [pane]: result,
      }));

      return result;
    }
  }, []);

  const handleRunAmateur = useCallback(() => {
    executeCode(amateurCode, 'amateur');
  }, [amateurCode, executeCode]);

  const handleRunProfessional = useCallback(() => {
    executeCode(comparisonData.professional.editor.initialCode, 'professional');
  }, [comparisonData.professional.editor.initialCode, executeCode]);

  // ============================================================================
  // COMPARISON ANALYSIS
  // ============================================================================

  const comparisonAnalysis = useMemo(() => {
    if (!comparisonData.comparison) return null;

    return {
      metrics: comparisonData.comparison.metrics,
      highlights: comparisonData.comparison.highlights,
      improvements: comparisonData.comparison.highlights.filter(
        (h) => h.importance === 'high'
      ),
    };
  }, [comparisonData.comparison]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderPane = (type: 'amateur' | 'professional') => {
    const pane = type === 'amateur' ? comparisonData.amateur : comparisonData.professional;
    const isAmateur = type === 'amateur';
    const code = isAmateur ? amateurCode : pane.editor.initialCode;

    return (
      <div className={`pane-${type} flex flex-col h-full`}>
        {/* Header */}
        <div
          className={`pane-header px-4 py-3 border-b ${
            isAmateur
              ? 'bg-orange-900/20 border-orange-700/30'
              : 'bg-emerald-900/20 border-emerald-700/30'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3
                className={`font-semibold ${
                  isAmateur ? 'text-orange-300' : 'text-emerald-300'
                }`}
              >
                {pane.title}
              </h3>
              {pane.description && (
                <p className="text-xs text-gray-400 mt-1">{pane.description}</p>
              )}
            </div>

            {/* Status indicator */}
            {executionResults[type] && (
              <div className="flex items-center gap-2">
                {executionResults[type].success ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span className="text-xs text-emerald-400">
                      {executionResults[type].executionTime.toFixed(0)}ms
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-xs text-red-400">Erro</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Code Editor */}
        <div className="flex-1 overflow-hidden">
          <CodeEditor
            code={code}
            language={pane.editor.language}
            readOnly={pane.editor.readOnly}
            onChange={isAmateur ? setAmateurCode : undefined}
            highlightLines={pane.editor.highlightLines}
            annotations={pane.editor.annotations}
          />
        </div>

        {/* Actions */}
        <div className="pane-actions px-4 py-3 border-t border-gray-700 bg-gray-900">
          <div className="flex items-center justify-between">
            <Button
              onClick={isAmateur ? handleRunAmateur : handleRunProfessional}
              size="sm"
              className={
                isAmateur
                  ? 'bg-orange-600 hover:bg-orange-700'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }
            >
              <Zap className="h-4 w-4 mr-2" />
              Executar
            </Button>

            {isAmateur && pane.guidance && (
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400"
                onClick={() => setShowAnalysis(!showAnalysis)}
              >
                {showAnalysis ? 'Ocultar' : 'Ver'} Dicas
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderComparison = () => {
    if (!comparisonAnalysis) return null;

    return (
      <div className="comparison-panel absolute right-0 top-0 bottom-0 w-80 bg-gray-900 border-l border-gray-700 overflow-y-auto">
        <div className="p-4">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Análise Comparativa
          </h3>

          {/* Metrics */}
          <div className="space-y-3 mb-6">
            {comparisonAnalysis.metrics.map((metric) => (
              <div key={metric.id} className="bg-gray-800 rounded-lg p-3">
                <div className="text-xs text-gray-400 mb-1">{metric.name}</div>
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <span className="text-orange-400">{metric.amateurValue}</span>
                    <span className="text-gray-500 mx-2">→</span>
                    <span className="text-emerald-400">{metric.professionalValue}</span>
                  </div>
                  {metric.unit && (
                    <span className="text-xs text-gray-500">{metric.unit}</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Highlights */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white">Principais Diferenças</h4>
            {comparisonAnalysis.highlights.map((highlight) => (
              <div
                key={highlight.id}
                className={`bg-gray-800 rounded-lg p-3 border-l-4 ${
                  highlight.importance === 'high'
                    ? 'border-red-500'
                    : highlight.importance === 'medium'
                    ? 'border-yellow-500'
                    : 'border-blue-500'
                }`}
              >
                <div className="text-sm font-medium text-white mb-1">
                  {highlight.title}
                </div>
                <div className="text-xs text-gray-400">{highlight.description}</div>

                {(highlight.amateurLines || highlight.professionalLines) && (
                  <div className="mt-2 text-xs text-gray-500">
                    {highlight.amateurLines && (
                      <div>Amateur: linhas {highlight.amateurLines.join(', ')}</div>
                    )}
                    {highlight.professionalLines && (
                      <div>Pro: linhas {highlight.professionalLines.join(', ')}</div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Improvements */}
          {comparisonAnalysis.improvements.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-semibold text-white mb-3">
                Principais Melhorias
              </h4>
              <div className="space-y-2">
                {comparisonAnalysis.improvements.map((imp, idx) => (
                  <div key={imp.id} className="flex items-start gap-2 text-xs text-gray-300">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center text-white">
                      {idx + 1}
                    </div>
                    <div>{imp.title}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ============================================================================
  // LAYOUT RENDERING
  // ============================================================================

  const renderLayout = () => {
    switch (comparisonData.layout) {
      case 'split-vertical':
        return (
          <div className="flex h-full">
            <div className="w-1/2 border-r border-gray-700">{renderPane('amateur')}</div>
            <div className="w-1/2">{renderPane('professional')}</div>
          </div>
        );

      case 'split-horizontal':
        return (
          <div className="flex flex-col h-full">
            <div className="h-1/2 border-b border-gray-700">{renderPane('amateur')}</div>
            <div className="h-1/2">{renderPane('professional')}</div>
          </div>
        );

      case 'overlay':
        return (
          <div className="relative h-full">
            {activePane === 'amateur' ? renderPane('amateur') : renderPane('professional')}

            {/* Toggle button */}
            <div className="absolute top-4 right-4 z-10">
              <Button
                onClick={() =>
                  setActivePane(activePane === 'amateur' ? 'professional' : 'amateur')
                }
                className="bg-gray-800 hover:bg-gray-700"
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                Ver {activePane === 'amateur' ? 'Professional' : 'Amateur'}
              </Button>
            </div>
          </div>
        );

      default:
        return renderLayout();
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="comparative-playground-split relative h-full bg-gray-950 text-white">
      {renderLayout()}

      {showAnalysis && renderComparison()}

      {/* Guidance panel (for amateur pane) */}
      {showAnalysis && comparisonData.amateur.guidance && (
        <div className="absolute bottom-4 left-4 right-4 bg-blue-900/90 backdrop-blur-sm rounded-lg p-4 max-w-2xl">
          <h4 className="font-semibold mb-2">💡 Dicas</h4>
          <ul className="text-sm space-y-1">
            {comparisonData.amateur.guidance.hints.map((hint, idx) => (
              <li key={idx} className="text-blue-100">
                • {hint}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
