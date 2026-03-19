import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  ClipboardList,
  Loader2,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ImportStepsModalProps {
  open: boolean;
  onClose: () => void;
  pipelineId: string;
  lessonId: string | null;
  onSuccess: () => void;
}

interface ValidationResult {
  valid: boolean;
  stepsCount: number;
  framesCount: number;
  phasesCount: number;
  errors: string[];
}

const REQUIRED_STEP_FIELDS = ['step_number', 'title', 'frames'] as const;

function validateStepsJson(jsonText: string): ValidationResult {
  const result: ValidationResult = {
    valid: false,
    stepsCount: 0,
    framesCount: 0,
    phasesCount: 0,
    errors: [],
  };

  let steps: any[];
  try {
    steps = JSON.parse(jsonText);
  } catch (e) {
    result.errors.push(`JSON inválido: ${(e as Error).message}`);
    return result;
  }

  if (!Array.isArray(steps)) {
    result.errors.push('JSON deve ser um array de passos: [{ ... }, { ... }]');
    return result;
  }

  if (steps.length === 0) {
    result.errors.push('Array vazio — nenhum passo encontrado');
    return result;
  }

  result.stepsCount = steps.length;
  const phases = new Set<number>();
  const stepNumbers = new Set<number>();

  for (const [i, step] of steps.entries()) {
    const prefix = `Passo ${step.step_number ?? i + 1}`;

    // Required fields
    for (const field of REQUIRED_STEP_FIELDS) {
      if (step[field] === undefined || step[field] === null || step[field] === '') {
        result.errors.push(`${prefix}: campo '${field}' faltando`);
      }
    }

    // step_number uniqueness
    if (typeof step.step_number === 'number') {
      if (stepNumbers.has(step.step_number)) {
        result.errors.push(`${prefix}: step_number duplicado`);
      }
      stepNumbers.add(step.step_number);
    }

    // Phase
    const phase = step.phase ?? step.phase_number ?? 1;
    if (typeof phase === 'number') {
      phases.add(phase);
    }

    // Frames validation
    if (step.frames) {
      if (!Array.isArray(step.frames)) {
        result.errors.push(`${prefix}: 'frames' deve ser array`);
      } else {
        result.framesCount += step.frames.length;

        for (const [j, frame] of step.frames.entries()) {
          const fp = `${prefix} Frame ${j + 1}`;

          if (!frame.bar_text) {
            result.errors.push(`${fp}: 'bar_text' faltando`);
          }
          if (!frame.bar_color) {
            result.errors.push(`${fp}: 'bar_color' faltando`);
          }
          if (!frame.elements || !Array.isArray(frame.elements) || frame.elements.length === 0) {
            result.errors.push(`${fp}: 'elements' vazio ou faltando`);
          }
        }
      }
    }
  }

  result.phasesCount = phases.size;
  result.valid = result.errors.length === 0;
  return result;
}

/**
 * Map a raw JSON step to the exact v10_lesson_steps DB columns.
 * Handles both `phase` and `phase_number` from the JSON input.
 */
function mapStepToDbRow(step: any, lessonId: string) {
  const phase = typeof step.phase === 'number'
    ? step.phase
    : typeof step.phase_number === 'number'
      ? step.phase_number
      : 1;

  return {
    lesson_id: lessonId,
    step_number: step.step_number,
    title: step.title,
    description: step.description || null,
    slug: step.slug || null,
    app_name: step.app_name || null,
    app_icon: step.app_icon || null,
    app_badge_bg: step.app_badge_bg || '#e2e8f0',
    app_badge_color: step.app_badge_color || '#1e293b',
    accent_color: step.accent_color || '#6366f1',
    duration_seconds: step.duration_seconds || 30,
    progress_percent: step.progress_percent || 0,
    phase,
    frames: step.frames || [],
    liv: step.liv || { tip: '', analogy: '', sos: '' },
    warnings: step.warnings || null,
    narration_script: step.narration_script || null,
  };
}

export function ImportStepsModal({
  open,
  onClose,
  pipelineId,
  lessonId,
  onSuccess,
}: ImportStepsModalProps) {
  const [jsonText, setJsonText] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  const validation = useMemo(() => {
    if (!jsonText.trim()) return null;
    return validateStepsJson(jsonText);
  }, [jsonText]);

  const handleImport = async () => {
    if (!validation?.valid || !lessonId) return;

    setIsImporting(true);
    try {
      const steps = JSON.parse(jsonText) as any[];

      // 1. Delete existing steps for this lesson
      const { error: delError } = await supabase
        .from('v10_lesson_steps')
        .delete()
        .eq('lesson_id', lessonId);

      if (delError) {
        toast.error(`Erro ao limpar passos existentes: ${delError.message}`);
        return;
      }

      // 2. Map and insert
      const inserts = steps.map((s) => mapStepToDbRow(s, lessonId));

      const { error: insertError } = await supabase
        .from('v10_lesson_steps')
        .insert(inserts);

      if (insertError) {
        toast.error(`Erro ao importar: ${insertError.message}`);
        return;
      }

      // 3. Update pipeline counters
      await supabase
        .from('v10_bpa_pipeline')
        .update({
          steps_generated: steps.length,
          steps_audited: 0,
          audit_passed: false,
        })
        .eq('id', pipelineId);

      // 4. Log
      await supabase.from('v10_bpa_pipeline_log').insert({
        pipeline_id: pipelineId,
        stage: 2,
        action: 'steps_imported_json',
        details: {
          steps_count: steps.length,
          frames_count: validation.framesCount,
          phases_count: validation.phasesCount,
        },
      });

      toast.success(`✅ ${steps.length} passos importados! (${validation.framesCount} frames)`);
      onSuccess();
      onClose();
    } catch (e) {
      toast.error(`Erro: ${(e as Error).message}`);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Importar Passos (JSON)
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Cole o JSON completo dos passos da aula. Formato: array de objetos com campos obrigatórios
            (<code className="text-xs">step_number</code>, <code className="text-xs">title</code>, <code className="text-xs">frames</code>).
          </p>

          <Textarea
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            placeholder={`[
  {
    "step_number": 1,
    "title": "Criar conta no Calendly",
    "app_name": "Calendly",
    "app_icon": "📅",
    "phase": 1,
    "frames": [
      {
        "bar_text": "calendly.com",
        "bar_color": "#006BFF",
        "bar_sub": "Sign up",
        "action": "Preencha os campos...",
        "check": "Você é redirecionado...",
        "elements": [
          {"type": "chrome_header", "url": "https://calendly.com/signup"},
          {"type": "input", "label": "Email", "placeholder": "seu@email.com"}
        ]
      }
    ]
  }
]`}
            className="min-h-[400px] font-mono text-xs leading-relaxed"
            maxLength={500000}
          />

          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span>{jsonText.length.toLocaleString()} caracteres</span>
            <span>Máximo: 500.000</span>
          </div>

          {/* Real-time validation */}
          {validation && (
            <div
              className={`rounded-lg p-4 text-sm ${
                validation.valid
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}
            >
              {validation.valid ? (
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-800">JSON válido</p>
                    <p className="text-green-600 mt-1">
                      {validation.stepsCount} passos · {validation.framesCount} frames · {validation.phasesCount} fases
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-800">
                      {validation.errors.length} erro{validation.errors.length > 1 ? 's' : ''} encontrado{validation.errors.length > 1 ? 's' : ''}
                    </p>
                    <ul className="mt-2 space-y-1">
                      {validation.errors.slice(0, 10).map((err, i) => (
                        <li key={i} className="text-red-600 text-xs">• {err}</li>
                      ))}
                      {validation.errors.length > 10 && (
                        <li className="text-red-400 text-xs">
                          ... e mais {validation.errors.length - 10} erros
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Replacement warning */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <p className="text-xs text-amber-700">
              Se já existirem passos nesta aula, eles serão <strong>SUBSTITUÍDOS</strong> pelos importados.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={onClose} disabled={isImporting}>
              Cancelar
            </Button>
            <Button
              onClick={handleImport}
              disabled={!validation?.valid || isImporting || !lessonId}
            >
              {isImporting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Importando...
                </>
              ) : (
                <>
                  <ClipboardList className="w-4 h-4 mr-2" />
                  Importar {validation?.stepsCount || 0} passos
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
