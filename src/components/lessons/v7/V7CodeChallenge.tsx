// src/components/lessons/v7/V7CodeChallenge.tsx
// Code challenge component for V7 lessons with execution and validation

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Check, X, Code, RefreshCw, Lightbulb, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InteractionPoint } from '@/types/v7-cinematic.types';
import { CodeEditor } from './CodeEditor';

interface V7CodeChallengeProps {
  interaction: InteractionPoint;
  onComplete: (result: CodeChallengeResult) => void;
  onSkip?: () => void;
}

export interface CodeChallengeResult {
  completed: boolean;
  correct: boolean;
  code: string;
  output: string;
  timeSpent: number;
  attempts: number;
}

export const V7CodeChallenge = ({
  interaction,
  onComplete,
  onSkip,
}: V7CodeChallengeProps) => {
  const [code, setCode] = useState(interaction.content.codeTemplate || '// Escreva seu código aqui\n');
  const [output, setOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [startTime] = useState(Date.now());

  const hint = interaction.content.hint;

  // Safe code execution in a sandbox
  const executeCode = useCallback(async (codeToRun: string): Promise<{ output: string; error: string | null }> => {
    return new Promise((resolve) => {
      try {
        // Create a sandboxed environment
        const logs: string[] = [];
        const mockConsole = {
          log: (...args: any[]) => logs.push(args.map(a => JSON.stringify(a)).join(' ')),
          error: (...args: any[]) => logs.push(`[ERROR] ${args.map(a => JSON.stringify(a)).join(' ')}`),
          warn: (...args: any[]) => logs.push(`[WARN] ${args.map(a => JSON.stringify(a)).join(' ')}`),
        };

        // Execute with timeout
        const timeoutId = setTimeout(() => {
          resolve({ output: logs.join('\n') || 'Timeout: código demorou muito para executar', error: 'Timeout' });
        }, 3000);

        // Create function with custom console
        const fn = new Function('console', codeToRun);
        fn(mockConsole);

        clearTimeout(timeoutId);
        resolve({ output: logs.join('\n') || '(nenhuma saída)', error: null });
      } catch (err: any) {
        resolve({ output: '', error: err.message });
      }
    });
  }, []);

  // Validate the code against rules
  const validateCode = useCallback((codeToValidate: string, result: { output: string; error: string | null }): boolean => {
    // Check for validation rules from interaction
    if (interaction.validation && interaction.validation.length > 0) {
      for (const rule of interaction.validation) {
        if (rule.type === 'regex') {
          const regex = new RegExp(rule.rule as string);
          if (!regex.test(codeToValidate)) {
            return false;
          }
        }
        // Add more validation types as needed
      }
    }

    // If no error, consider it valid (basic validation)
    return result.error === null;
  }, [interaction.validation]);

  const handleRun = async () => {
    setIsRunning(true);
    setAttempts((prev) => prev + 1);

    const result = await executeCode(code);
    
    if (result.error) {
      setOutput(`❌ Erro: ${result.error}`);
      setIsCorrect(false);
    } else {
      setOutput(result.output);
      const valid = validateCode(code, result);
      setIsCorrect(valid);
      
      if (valid) {
        setHasCompleted(true);
        // Complete after showing success
        setTimeout(() => {
          onComplete({
            completed: true,
            correct: true,
            code,
            output: result.output,
            timeSpent: Date.now() - startTime,
            attempts,
          });
        }, 2000);
      }
    }

    setIsRunning(false);
  };

  const handleReset = () => {
    setCode(interaction.content.codeTemplate || '// Escreva seu código aqui\n');
    setOutput('');
    setIsCorrect(null);
  };

  const handleSubmit = () => {
    onComplete({
      completed: true,
      correct: isCorrect || false,
      code,
      output,
      timeSpent: Date.now() - startTime,
      attempts,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="w-full max-w-4xl mx-auto"
    >
      <div className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 px-6 py-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 flex items-center justify-center">
                <Code className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Desafio de Código</h3>
                <p className="text-white/60 text-sm">
                  {interaction.required ? 'Obrigatório' : 'Opcional'} • {interaction.points || 0} pontos
                </p>
              </div>
            </div>

            {/* Status badge */}
            {isCorrect !== null && (
              <div className={`
                px-3 py-1 rounded-full text-sm font-medium
                ${isCorrect ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}
              `}>
                {isCorrect ? '✓ Correto' : '✗ Incorreto'}
              </div>
            )}
          </div>
        </div>

        {/* Challenge description */}
        {interaction.content.question && (
          <div className="px-6 py-4 bg-white/5 border-b border-white/10">
            <p className="text-white/90">{interaction.content.question}</p>
          </div>
        )}

        {/* Code editor */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Editor */}
            <div className="space-y-2">
              <label className="text-white/60 text-sm font-medium flex items-center gap-2">
                <Code className="w-4 h-4" />
                Seu Código
              </label>
              <div className="h-64 rounded-lg overflow-hidden border border-white/10">
                <CodeEditor
                  code={code}
                  onChange={setCode}
                  language="javascript"
                  readOnly={hasCompleted}
                />
              </div>
            </div>

            {/* Output */}
            <div className="space-y-2">
              <label className="text-white/60 text-sm font-medium flex items-center gap-2">
                <Terminal className="w-4 h-4" />
                Saída
              </label>
              <div className="h-64 rounded-lg overflow-auto border border-white/10 bg-black/50 p-4 font-mono text-sm">
                {isRunning ? (
                  <div className="flex items-center gap-2 text-cyan-400">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Executando...
                  </div>
                ) : output ? (
                  <pre className={`whitespace-pre-wrap ${isCorrect === false ? 'text-red-400' : 'text-green-400'}`}>
                    {output}
                  </pre>
                ) : (
                  <span className="text-white/40">Clique em "Executar" para ver a saída</span>
                )}
              </div>
            </div>
          </div>

          {/* Hint section */}
          {hint && !hasCompleted && (
            <div className="mt-4">
              {showHint ? (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg"
                >
                  <div className="flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                    <p className="text-yellow-200 text-sm">{hint}</p>
                  </div>
                </motion.div>
              ) : (
                <button
                  onClick={() => setShowHint(true)}
                  className="flex items-center gap-2 text-yellow-400 hover:text-yellow-300 text-sm transition-colors"
                >
                  <Lightbulb className="w-4 h-4" />
                  Mostrar dica
                </button>
              )}
            </div>
          )}

          {/* Success feedback */}
          <AnimatePresence>
            {hasCompleted && isCorrect && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-6 p-4 rounded-xl bg-green-500/10 border border-green-500/30"
              >
                <div className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-green-400 shrink-0" />
                  <div>
                    <p className="font-medium text-green-300">Desafio Concluído! 🎉</p>
                    <p className="text-sm mt-1 text-green-200/80">
                      {interaction.feedback?.onSuccess?.content || 'Excelente trabalho! Seu código está correto.'}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-black/20 border-t border-white/10 flex items-center justify-between">
          <div className="text-white/40 text-sm flex items-center gap-4">
            {attempts > 0 && <span>Tentativas: {attempts}</span>}
          </div>

          <div className="flex gap-3">
            {!interaction.required && onSkip && !hasCompleted && (
              <Button variant="ghost" onClick={onSkip} className="text-white/60 hover:text-white">
                Pular
              </Button>
            )}

            <Button
              variant="outline"
              onClick={handleReset}
              disabled={hasCompleted}
              className="border-white/20 text-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Resetar
            </Button>

            {!hasCompleted ? (
              <Button
                onClick={handleRun}
                disabled={isRunning}
                className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white"
              >
                {isRunning ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Executando...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Executar
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white"
              >
                <Check className="w-4 h-4 mr-2" />
                Continuar
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
