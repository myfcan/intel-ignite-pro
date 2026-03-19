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
  hasPartA: boolean;
  hasPartC: boolean;
  errors: string[];
}

interface ParsedImport {
  steps: any[];
  narration_part_a?: string;
  narration_part_c?: string;
}

const REQUIRED_STEP_FIELDS = ['step_number', 'title', 'frames'] as const;

function parseImportJson(jsonText: string): { parsed: ParsedImport | null; error?: string } {
  let raw: any;
  try {
    raw = JSON.parse(jsonText);
  } catch (e) {
    return { parsed: null, error: `JSON inválido: ${(e as Error).message}` };
  }

  // Support both formats: plain array or object with { steps, narration_part_a, narration_part_c }
  if (Array.isArray(raw)) {
    return { parsed: { steps: raw } };
  }

  if (typeof raw === 'object' && raw !== null && Array.isArray(raw.steps)) {
    return {
      parsed: {
        steps: raw.steps,
        narration_part_a: typeof raw.narration_part_a === 'string' ? raw.narration_part_a : undefined,
        narration_part_c: typeof raw.narration_part_c === 'string' ? raw.narration_part_c : undefined,
      },
    };
  }

  return { parsed: null, error: 'JSON deve ser um array de passos ou objeto com { steps: [...], narration_part_a?, narration_part_c? }' };
}

function validateStepsJson(jsonText: string): ValidationResult {
  const result: ValidationResult = {
    valid: false,
    stepsCount: 0,
    framesCount: 0,
    phasesCount: 0,
    hasPartA: false,
    hasPartC: false,
    errors: [],
  };

  const { parsed, error } = parseImportJson(jsonText);
  if (!parsed) {
    result.errors.push(error!);
    return result;
  }

  const steps = parsed.steps;
  result.hasPartA = !!parsed.narration_part_a;
  result.hasPartC = !!parsed.narration_part_c;

  if (steps.length === 0) {
    result.errors.push('Array vazio — nenhum passo encontrado');
    return result;
  }

  result.stepsCount = steps.length;
  const phases = new Set<number>();
  const stepNumbers = new Set<number>();

  for (const [i, step] of steps.entries()) {
    const prefix = `Passo ${step.step_number ?? i + 1}`;

    for (const field of REQUIRED_STEP_FIELDS) {
      if (step[field] === undefined || step[field] === null || step[field] === '') {
        result.errors.push(`${prefix}: campo '${field}' faltando`);
      }
    }

    if (typeof step.step_number === 'number') {
      if (stepNumbers.has(step.step_number)) {
        result.errors.push(`${prefix}: step_number duplicado`);
      }
      stepNumbers.add(step.step_number);
    }

    const phase = step.phase ?? step.phase_number ?? 1;
    if (typeof phase === 'number') {
      phases.add(phase);
    }

    if (step.frames) {
      if (!Array.isArray(step.frames)) {
        result.errors.push(`${prefix}: 'frames' deve ser array`);
      } else {
        result.framesCount += step.frames.length;
        for (const [j, frame] of step.frames.entries()) {
          const fp = `${prefix} Frame ${j + 1}`;
          if (!frame.bar_text) result.errors.push(`${fp}: 'bar_text' faltando`);
          if (!frame.bar_color) result.errors.push(`${fp}: 'bar_color' faltando`);
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
      const { parsed } = parseImportJson(jsonText);
      if (!parsed) return;
      const steps = parsed.steps;

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

      // 5. Auto-fix C2/C3 on imported steps
      let c2Fixed = 0;
      let c3Fixed = 0;
      const TECH_TERMS: Record<string, string> = {
        "api": "Interface que permite dois softwares se comunicarem automaticamente",
        "webhook": "URL que recebe dados automaticamente quando um evento acontece",
        "endpoint": "Endereço (URL) específico onde uma API recebe requisições",
        "oauth": "Protocolo de autorização que permite login seguro sem compartilhar senha",
        "token": "Código temporário usado para autenticar acessos a um serviço",
        "dashboard": "Painel de controle visual com métricas e ações principais",
        "workflow": "Sequência automatizada de tarefas que executa em ordem",
        "trigger": "Evento que dispara uma automação automaticamente",
        "pipeline": "Sequência de etapas de processamento de dados em ordem",
        "prompt": "Instrução de texto enviada para uma IA gerar uma resposta",
        "template": "Modelo pré-pronto que serve como base para criar algo novo",
        "scenario": "Automação no Make.com que conecta apps com regras definidas",
        "module": "Bloco funcional dentro de uma automação que executa uma tarefa",
        "gpt": "Modelo de linguagem da OpenAI usado para gerar texto",
        "calendly": "Ferramenta de agendamento online que sincroniza com seu calendário",
        "make": "Plataforma de automação visual que conecta apps (antigo Integromat)",
        "zapier": "Plataforma de automação que conecta apps sem código",
        "chatbot": "Bot conversacional que responde perguntas automaticamente",
        "ai": "Inteligência Artificial — sistema que simula raciocínio humano",
        "crm": "Sistema para gerenciar relacionamento com clientes",
        "lead": "Potencial cliente que demonstrou interesse no produto/serviço",
        "mcp": "Protocolo que conecta IA a apps externos — como um tradutor universal",
        "chatgpt": "Assistente de IA da OpenAI baseado no modelo GPT",
        "event type": "Modelo de reunião no Calendly — define duração e disponibilidade",
        "single-use link": "Link de agendamento que funciona uma vez só — depois expira",
      };

      // Fetch inserted steps
      const { data: insertedSteps } = await supabase
        .from('v10_lesson_steps')
        .select('id, title, description, frames')
        .eq('lesson_id', lessonId)
        .order('step_number');

      if (insertedSteps) {
        for (const step of insertedSteps) {
          const desc = (step.description || '').toLowerCase();
          const title = (step.title || '').toLowerCase();
          const combinedText = `${title} ${desc}`;
          const frames = [...((step.frames as any[]) || [])] as any[];
          const allElements = frames.flatMap((f: any) => f.elements || []);
          let modified = false;

          // C2: inject tooltip_term if missing
          const hasTooltip = allElements.some((el: any) => el.type === 'tooltip_term');
          if (!hasTooltip && frames.length > 0) {
            const matched: Array<{ term: string; def: string }> = [];
            for (const [term, def] of Object.entries(TECH_TERMS)) {
              const re = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
              if (re.test(combinedText)) {
                matched.push({ term: term.charAt(0).toUpperCase() + term.slice(1), def });
                if (matched.length >= 2) break;
              }
            }
            if (matched.length === 0) {
              const caps = (step.description || '').match(/\b[A-Z][a-zA-Z]{2,}\b/g);
              const skip = new Set(['Voce','Esse','Este','Esta','Essa','Aqui','Agora','Depois','Antes','Clique','Acesse','Configure','Crie','Abra','Vamos','Nesse','Nesta','Para','Como','Quando','Onde','Qual','Cada','Todo','Toda','Todos','Pule','Seus']);
              if (caps) {
                for (const w of caps) {
                  if (!skip.has(w) && w.length >= 3) {
                    matched.push({ term: w, def: 'Funcionalidade ou conceito utilizado neste passo' });
                    break;
                  }
                }
              }
            }
            if (matched.length > 0) {
              if (!frames[0].elements) frames[0].elements = [];
              for (const m of matched) {
                frames[0].elements.push({ type: 'tooltip_term', term: m.term, tip: m.def });
              }
              modified = true;
              c2Fixed++;
            }
          }

          // C3: inject nav_breadcrumb if bar_sub changes
          const hasBreadcrumb = allElements.some((el: any) => el.type === 'nav_breadcrumb');
          const barSubs = frames.map((f: any) => f.bar_sub).filter(Boolean);
          const barSubChanges = new Set(barSubs).size > 1;
          if (barSubChanges && !hasBreadcrumb) {
            for (let fi = 1; fi < frames.length; fi++) {
              const prev = frames[fi - 1].bar_sub;
              const curr = frames[fi].bar_sub;
              if (curr && prev && curr !== prev) {
                if (!frames[fi].elements) frames[fi].elements = [];
                frames[fi].elements.unshift({
                  type: 'nav_breadcrumb',
                  from: prev,
                  to: curr,
                  how: `${prev} → ${curr}`,
                });
              }
            }
            modified = true;
            c3Fixed++;
          }

          if (modified) {
            await supabase
              .from('v10_lesson_steps')
              .update({ frames } as any)
              .eq('id', step.id);
          }
        }
      }

      if (c2Fixed > 0 || c3Fixed > 0) {
        await supabase.from('v10_bpa_pipeline_log').insert({
          pipeline_id: pipelineId,
          stage: 2,
          action: 'auto_c2c3_fix_on_import',
          details: { c2_fixed: c2Fixed, c3_fixed: c3Fixed },
        });
      }

      // 6. Save Part A / Part C narrations if provided
      let narrationsSaved = 0;
      if (parsed.narration_part_a || parsed.narration_part_c) {
        // Fetch existing narrations
        const { data: existingNarrations } = await supabase
          .from('v10_lesson_narrations')
          .select('id, part')
          .eq('lesson_id', lessonId);

        for (const part of ['A', 'C'] as const) {
          const text = part === 'A' ? parsed.narration_part_a : parsed.narration_part_c;
          if (!text) continue;

          const existing = existingNarrations?.find((n) => n.part === part);
          if (existing) {
            await supabase
              .from('v10_lesson_narrations')
              .update({ script_text: text, audio_url: null, duration_seconds: 0 } as any)
              .eq('id', existing.id);
          } else {
            await supabase
              .from('v10_lesson_narrations')
              .insert({ lesson_id: lessonId, part, script_text: text, duration_seconds: 0 } as any);
          }
          narrationsSaved++;
        }
      }

      const extras = [
        `C2/C3 (${c2Fixed}+${c3Fixed})`,
        narrationsSaved > 0 ? `Parte ${parsed.narration_part_a ? 'A' : ''}${parsed.narration_part_a && parsed.narration_part_c ? '+' : ''}${parsed.narration_part_c ? 'C' : ''} salva` : '',
      ].filter(Boolean).join(' · ');

      toast.success(`✅ ${steps.length} passos importados! ${extras}`);
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
