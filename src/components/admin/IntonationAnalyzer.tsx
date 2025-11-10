import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { analyzeTTSIntonation } from '@/lib/ttsIntonationAnalyzer';
import { Volume2, AlertCircle } from 'lucide-react';

/**
 * Componente para testar a análise de entonação TTS
 */
export function IntonationAnalyzer() {
  const [text, setText] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);

  const handleAnalyze = () => {
    if (!text.trim()) return;
    const result = analyzeTTSIntonation(text, 'teste');
    setAnalysis(result);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getSeverityBg = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-500/10 border-red-500';
      case 'medium': return 'bg-yellow-500/10 border-yellow-500';
      case 'low': return 'bg-blue-500/10 border-blue-500';
      default: return 'bg-gray-500/10 border-gray-500';
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Volume2 className="w-5 h-5" />
        <h3 className="text-lg font-semibold">Testador de Análise de Entonação</h3>
      </div>

      <Textarea
        placeholder="Cole o texto da aula aqui para testar..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
        className="mb-4"
      />

      <Button onClick={handleAnalyze} disabled={!text.trim()}>
        Analisar Texto
      </Button>

      {analysis && (
        <div className="mt-6 space-y-4">
          {/* Score */}
          <div className={`p-4 rounded-lg border-l-4 ${
            analysis.score < 50 
              ? 'bg-red-500/10 border-red-500' 
              : analysis.score < 80 
              ? 'bg-yellow-500/10 border-yellow-500' 
              : 'bg-green-500/10 border-green-500'
          }`}>
            <div className="font-semibold text-lg mb-2">
              Score de Qualidade: {analysis.score}/100
            </div>
            <div className="text-sm text-muted-foreground">
              {analysis.score >= 80 && '✅ Excelente! Texto pronto para TTS.'}
              {analysis.score >= 50 && analysis.score < 80 && '⚠️ Atenção! Alguns problemas podem afetar a entonação.'}
              {analysis.score < 50 && '❌ Crítico! Muitos problemas detectados.'}
            </div>
          </div>

          {/* Problemas Encontrados */}
          {analysis.hasIssues ? (
            <div className="space-y-3">
              <h4 className="font-semibold">Problemas Detectados:</h4>
              
              {['high', 'medium', 'low'].map(severity => {
                const issues = analysis.issues.filter((i: any) => i.severity === severity);
                if (issues.length === 0) return null;

                return (
                  <div key={severity} className={`p-4 rounded-lg border-l-4 ${getSeverityBg(severity)}`}>
                    <div className={`font-medium mb-2 ${getSeverityColor(severity)}`}>
                      {severity === 'high' && '🔴 CRÍTICO'}
                      {severity === 'medium' && '🟡 MÉDIO'}
                      {severity === 'low' && '🟢 BAIXO'}
                      {' '}({issues.length} problema{issues.length > 1 ? 's' : ''})
                    </div>
                    
                    <div className="space-y-2">
                      {issues.map((issue: any, idx: number) => (
                        <div key={idx} className="text-sm">
                          <div className="text-muted-foreground">
                            • {issue.message}
                          </div>
                          <div className="text-xs text-blue-600 ml-4 mt-1">
                            💡 {issue.suggestion}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-4 rounded-lg bg-green-500/10 border-l-4 border-green-500">
              <div className="flex items-center gap-2 text-green-600 font-medium">
                <AlertCircle className="w-5 h-5" />
                Nenhum problema detectado! Texto pronto para TTS.
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
