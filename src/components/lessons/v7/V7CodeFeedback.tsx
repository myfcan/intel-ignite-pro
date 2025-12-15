import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertCircle, 
  AlertTriangle, 
  Lightbulb, 
  CheckCircle2, 
  Loader2,
  TrendingUp,
  Code2,
  Sparkles
} from 'lucide-react';
import { CodeAnalysis, CodeIssue } from '@/hooks/useV7CodeAnalysis';

interface V7CodeFeedbackProps {
  analysis: CodeAnalysis | null;
  isAnalyzing: boolean;
  error: string | null;
  userCode: string;
  expectedCode: string;
  showDiff?: boolean;
}

const IssueIcon = ({ type }: { type: CodeIssue['type'] }) => {
  switch (type) {
    case 'error':
      return <AlertCircle className="w-4 h-4 text-red-400" />;
    case 'warning':
      return <AlertTriangle className="w-4 h-4 text-amber-400" />;
    case 'suggestion':
      return <Lightbulb className="w-4 h-4 text-cyan-400" />;
  }
};

const ScoreIndicator = ({ score }: { score: number }) => {
  const getColor = () => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-amber-400';
    return 'text-red-400';
  };

  const getGradient = () => {
    if (score >= 80) return 'from-emerald-500/20 to-emerald-500/5';
    if (score >= 60) return 'from-amber-500/20 to-amber-500/5';
    return 'from-red-500/20 to-red-500/5';
  };

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r ${getGradient()}`}
    >
      <TrendingUp className={`w-4 h-4 ${getColor()}`} />
      <span className={`text-sm font-bold ${getColor()}`}>{score}%</span>
    </motion.div>
  );
};

const CodeDiff = ({ userCode, expectedCode }: { userCode: string; expectedCode: string }) => {
  const userLines = userCode.split('\n');
  const expectedLines = expectedCode.split('\n');
  
  const maxLines = Math.max(userLines.length, expectedLines.length);
  
  return (
    <div className="mt-4 rounded-lg overflow-hidden border border-border/30">
      <div className="grid grid-cols-2 text-xs">
        <div className="bg-red-500/10 px-3 py-2 border-b border-r border-border/30">
          <span className="text-red-400 font-medium">Seu código</span>
        </div>
        <div className="bg-emerald-500/10 px-3 py-2 border-b border-border/30">
          <span className="text-emerald-400 font-medium">Código esperado</span>
        </div>
      </div>
      <div className="grid grid-cols-2 text-xs font-mono max-h-48 overflow-y-auto">
        <div className="bg-card/50 p-2 border-r border-border/30">
          {userLines.map((line, i) => (
            <div 
              key={i} 
              className={`px-2 py-0.5 ${
                line !== expectedLines[i] ? 'bg-red-500/10 text-red-300' : 'text-muted-foreground'
              }`}
            >
              <span className="text-muted-foreground/50 mr-2">{i + 1}</span>
              {line || ' '}
            </div>
          ))}
        </div>
        <div className="bg-card/50 p-2">
          {expectedLines.map((line, i) => (
            <div 
              key={i} 
              className={`px-2 py-0.5 ${
                line !== userLines[i] ? 'bg-emerald-500/10 text-emerald-300' : 'text-muted-foreground'
              }`}
            >
              <span className="text-muted-foreground/50 mr-2">{i + 1}</span>
              {line || ' '}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const V7CodeFeedback: React.FC<V7CodeFeedbackProps> = ({
  analysis,
  isAnalyzing,
  error,
  userCode,
  expectedCode,
  showDiff = false
}) => {
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-lg bg-red-500/10 border border-red-500/20"
      >
        <div className="flex items-center gap-2 text-red-400">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm">{error}</span>
        </div>
      </motion.div>
    );
  }

  if (isAnalyzing) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-4 rounded-lg bg-primary/10 border border-primary/20"
      >
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
          <div className="flex-1">
            <p className="text-sm text-foreground">Analisando seu código...</p>
            <p className="text-xs text-muted-foreground">IA verificando sintaxe e lógica</p>
          </div>
          <Sparkles className="w-5 h-5 text-primary animate-pulse" />
        </div>
      </motion.div>
    );
  }

  if (!analysis) {
    return (
      <div className="p-4 rounded-lg bg-muted/30 border border-border/30">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Code2 className="w-5 h-5" />
          <span className="text-sm">Digite código para receber feedback em tempo real</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Header with score */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {analysis.isCorrect ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          ) : (
            <Code2 className="w-5 h-5 text-primary" />
          )}
          <span className="text-sm font-medium text-foreground">
            {analysis.isCorrect ? 'Código correto!' : 'Análise do código'}
          </span>
        </div>
        <ScoreIndicator score={analysis.score} />
      </div>

      {/* Summary */}
      <div className="p-3 rounded-lg bg-card/50 border border-border/30">
        <p className="text-sm text-foreground">{analysis.summary}</p>
      </div>

      {/* Issues */}
      <AnimatePresence mode="popLayout">
        {analysis.issues.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Pontos de atenção
            </h4>
            {analysis.issues.map((issue, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-3 rounded-lg border ${
                  issue.type === 'error' 
                    ? 'bg-red-500/10 border-red-500/20' 
                    : issue.type === 'warning'
                    ? 'bg-amber-500/10 border-amber-500/20'
                    : 'bg-cyan-500/10 border-cyan-500/20'
                }`}
              >
                <div className="flex items-start gap-2">
                  <IssueIcon type={issue.type} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">{issue.message}</p>
                    {issue.fix && (
                      <p className="text-xs text-muted-foreground mt-1">
                        💡 {issue.fix}
                      </p>
                    )}
                    {issue.line && (
                      <span className="text-xs text-muted-foreground">
                        Linha {issue.line}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Improvements */}
      {analysis.improvements.length > 0 && !analysis.isCorrect && (
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Próximos passos
          </h4>
          <ul className="space-y-1">
            {analysis.improvements.map((improvement, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="text-primary">→</span>
                {improvement}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Diff view */}
      {showDiff && !analysis.isCorrect && (
        <div>
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Comparação
          </h4>
          <CodeDiff userCode={userCode} expectedCode={expectedCode} />
        </div>
      )}
    </motion.div>
  );
};
