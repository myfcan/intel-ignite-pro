import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { FileText, AlertTriangle, CheckCircle2, Loader2, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// ── Types ──────────────────────────────────────────────────────────────────────

interface ParsedStep {
  stepNumber: number;
  title: string;
  body: string;
  wordCount: number;
}

interface ParseResult {
  partA: string | null;
  partC: string | null;
  steps: ParsedStep[];
  ignoredSections: string[];
}

interface ImportFullScriptModalProps {
  open: boolean;
  onClose: () => void;
  lessonId: string;
  steps: Array<{ id: string; step_number: number; title: string }>;
  narrations: Array<{ id: string; part: string; script_text: string | null }>;
  onImportComplete: () => void;
}

// ── Markdown preprocessing ─────────────────────────────────────────────────────

function preprocessMarkdown(text: string): string {
  return text
    .replace(/\*\*/g, '')                          // remove all bold markers
    .replace(/^---+\s*$/gm, '')                    // remove horizontal rules
    .replace(/^#{1,3}\s+FASE\s+\d+[^\n]*/gm, '')  // remove FASE headers
    .replace(/^#{1,3}\s+/gm, '')                   // remove remaining markdown headers (##, ###)
    .replace(/\n{3,}/g, '\n\n');                    // collapse excess blank lines
}

// ── Auto-tagging logic ─────────────────────────────────────────────────────────

function autoTagScript(text: string): string {
  let result = text;

  // [ANCHOR:pontos_atencao] before "Agora, os pontos de atenção desse passo:"
  result = result.replace(
    /^(Agora, os pontos de atenção)/gm,
    '[ANCHOR:pontos_atencao]\n$1'
  );

  // [ANCHOR:confirmacao] before "Deu certo se"
  result = result.replace(
    /^(Deu certo se\b)/gm,
    '[ANCHOR:confirmacao]\n$1'
  );

  // [ANCHOR:troca_ferramenta] before tool-change phrases
  const trocaPattern = /^(Agora (?:mudamos de ferramenta|vamos pro|voltamos pro|volte pra|abra o)|Abra uma nova aba)/gim;
  result = result.replace(trocaPattern, '[ANCHOR:troca_ferramenta]\n$1');

  // Deduplicate: remove consecutive or near-consecutive duplicate tags
  result = result.replace(/(\[ANCHOR:[^\]]+\])\s*\n\s*\1/g, '$1');
  // Also collapse any run of ANCHOR tags to unique set
  result = result.replace(/(\[ANCHOR:[^\]]+\]\n?){2,}/g, (match) => {
    const tags = match.trim().split(/\n/).filter(t => t.trim().startsWith('[ANCHOR:'));
    return [...new Set(tags)].join('\n') + '\n';
  });

  return result;
}

// ── Parser ─────────────────────────────────────────────────────────────────────

const METADATA_MARKERS = [
  /^MÉTRICAS/i,
  /^METRICAS/i,
  /^MAPEAMENTO/i,
  /^Comparação/i,
  /^Comparacao/i,
  /^MUDANÇA ESTRUTURAL/i,
  /^MUDANCA ESTRUTURAL/i,
  /^ANCHOR TEXT/i,
  /^CLASSIFICAÇÃO/i,
];

function parseFullScript(rawText: string): ParseResult {
  const ignoredSections: string[] = [];

  // Preprocess: strip markdown formatting
  let text = preprocessMarkdown(rawText);

  // Strip metadata at the end
  for (const marker of METADATA_MARKERS) {
    const match = text.match(new RegExp(`\n(${marker.source}.*)`, 'is'));
    if (match && match.index !== undefined) {
      const removed = text.slice(match.index).trim().split('\n')[0];
      ignoredSections.push(removed.slice(0, 60));
      text = text.slice(0, match.index);
    }
  }

  // ── Zone A: everything between "PARTE A" and ("PARTE B" or first "PASSO 1")
  let partA: string | null = null;
  const partAMatch = text.match(/PARTE\s+A[^\n]*\n([\s\S]*?)(?=PARTE\s+B|PASSO\s+1\s*[—–-])/i);
  if (partAMatch) {
    partA = partAMatch[1].trim();
    partA = partA.replace(/^Sem alteração[^\n]*\n?/gim, '').trim();
  }

  // ── Zone C: everything between "PARTE C" and end of cleaned text
  let partC: string | null = null;
  const partCMatch = text.match(/PARTE\s+C[^\n]*\n([\s\S]*?)$/i);
  if (partCMatch) {
    partC = partCMatch[1].trim();
    partC = partC.replace(/^Sem alteração[^\n]*\n?/gim, '').trim();
  }

  // ── Zone B: split by PASSO N —
  const stepPattern = /^PASSO\s+(\d+)\s*[—–-]\s*(.+)$/gm;
  const stepMatches: Array<{ index: number; stepNumber: number; title: string }> = [];
  let match: RegExpExecArray | null;

  while ((match = stepPattern.exec(text)) !== null) {
    stepMatches.push({
      index: match.index,
      stepNumber: parseInt(match[1], 10),
      title: match[2].trim(),
    });
  }

  const steps: ParsedStep[] = [];
  for (let i = 0; i < stepMatches.length; i++) {
    const start = stepMatches[i].index;
    const end = i + 1 < stepMatches.length
      ? stepMatches[i + 1].index
      : (partCMatch?.index ?? text.length);

    let body = text.slice(start, end);
    // Remove the "PASSO N — Title" header line
    body = body.replace(/^PASSO\s+\d+\s*[—–-][^\n]*\n?/, '').trim();
    // Remove FASE headers that might be between steps
    body = body.replace(/^FASE\s+\d+\s*[—–-][^\n]*\n?/gm, '').trim();

    steps.push({
      stepNumber: stepMatches[i].stepNumber,
      title: stepMatches[i].title,
      body,
      wordCount: body.split(/\s+/).filter(Boolean).length,
    });
  }

  return { partA, partC, steps, ignoredSections };
}

// ── Component ──────────────────────────────────────────────────────────────────

export function ImportFullScriptModal({
  open,
  onClose,
  lessonId,
  steps: dbSteps,
  narrations,
  onImportComplete,
}: ImportFullScriptModalProps) {
  const [rawText, setRawText] = useState('');
  const [autoTag, setAutoTag] = useState(true);
  const [importing, setImporting] = useState(false);

  const hasExistingTags = useMemo(() => rawText.includes('[ANCHOR:'), [rawText]);

  const parsed = useMemo(() => {
    if (!rawText.trim()) return null;
    return parseFullScript(rawText);
  }, [rawText]);

  // Auto-disable auto-tag when script already has anchor tags
  const effectiveAutoTag = autoTag && !hasExistingTags;

  const matchedSteps = useMemo(() => {
    if (!parsed) return [];
    return parsed.steps.map((ps) => {
      const dbStep = dbSteps.find((ds) => ds.step_number === ps.stepNumber);
      return {
        ...ps,
        dbStepId: dbStep?.id ?? null,
        dbTitle: dbStep?.title ?? null,
        titleMatch: dbStep
          ? dbStep.title.toLowerCase().includes(ps.title.toLowerCase().slice(0, 15))
          : false,
      };
    });
  }, [parsed, dbSteps]);

  const unmatchedCount = matchedSteps.filter((s) => !s.dbStepId).length;
  const partAWords = parsed?.partA?.split(/\s+/).filter(Boolean).length ?? 0;
  const partCWords = parsed?.partC?.split(/\s+/).filter(Boolean).length ?? 0;

  const handleImport = async () => {
    if (!parsed || matchedSteps.length === 0) return;

    setImporting(true);
    try {
      let savedSteps = 0;
      let savedParts = 0;

      // ── Save Part A ──
      if (parsed.partA) {
        const existingA = narrations.find((n) => n.part === 'A');
        if (existingA) {
          const { error } = await supabase
            .from('v10_lesson_narrations')
            .update({ script_text: parsed.partA } as any)
            .eq('id', existingA.id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('v10_lesson_narrations')
            .insert({ lesson_id: lessonId, part: 'A', script_text: parsed.partA } as any);
          if (error) throw error;
        }
        savedParts++;
      }

      // ── Save Part C ──
      if (parsed.partC) {
        const existingC = narrations.find((n) => n.part === 'C');
        if (existingC) {
          const { error } = await supabase
            .from('v10_lesson_narrations')
            .update({ script_text: parsed.partC } as any)
            .eq('id', existingC.id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('v10_lesson_narrations')
            .insert({ lesson_id: lessonId, part: 'C', script_text: parsed.partC } as any);
          if (error) throw error;
        }
        savedParts++;
      }

      // ── Save Step Scripts ──
      for (const step of matchedSteps) {
        if (!step.dbStepId) continue;
        const script = effectiveAutoTag ? autoTagScript(step.body) : step.body;
        const { error } = await supabase
          .from('v10_lesson_steps')
          .update({ narration_script: script } as any)
          .eq('id', step.dbStepId);
        if (error) {
          console.error(`Step ${step.stepNumber} save error:`, error);
          continue;
        }
        savedSteps++;
      }

      toast.success(
        `Importado: ${savedSteps} passos + ${savedParts} partes (A/C). ${
          effectiveAutoTag ? 'Tags [ANCHOR:*] inseridas automaticamente.' : ''
        }`
      );

      onImportComplete();
      onClose();
      setRawText('');
    } catch (err: any) {
      toast.error(`Erro na importação: ${err.message}`);
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-indigo-500" />
            Importar Script Completo
          </DialogTitle>
          <DialogDescription>
            Cole o script completo da aula (Partes A + B + C). O sistema detecta
            automaticamente os 27 passos e distribui cada trecho.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Textarea */}
          <Textarea
            className="min-h-[300px] font-mono text-xs leading-relaxed"
            placeholder={`Cole aqui o script completo.\n\nFormato esperado:\nPARTE A — CONTEXTO\n...\nPASSO 1 — Criar conta no Make.com\n...\nPASSO 27 — SDR de Voz — Completo!\n...\nPARTE C — CONSOLIDAÇÃO\n...`}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
          />

          {/* Auto-tag checkbox */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="auto-tag"
              checked={effectiveAutoTag}
              disabled={hasExistingTags}
              onCheckedChange={(v) => setAutoTag(!!v)}
            />
            <label htmlFor="auto-tag" className="text-sm cursor-pointer">
              Inserir tags <code className="text-xs bg-muted px-1 rounded">[ANCHOR:*]</code> automaticamente
            </label>
            {hasExistingTags && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] text-blue-700 font-medium">
                <CheckCircle2 className="h-3 w-3" /> Tags já presentes no script
              </span>
            )}
          </div>

          {/* Preview */}
          {parsed && (
            <div className="rounded-lg border p-4 space-y-3 bg-muted/30">
              <h4 className="text-sm font-semibold">Preview</h4>

              {/* Stats */}
              <div className="flex flex-wrap gap-3 text-xs">
                {parsed.partA && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-green-700">
                    <CheckCircle2 className="h-3 w-3" /> Parte A: {partAWords} palavras
                  </span>
                )}
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 ${
                  parsed.steps.length === 27
                    ? 'bg-green-100 text-green-700'
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  <FileText className="h-3 w-3" /> {parsed.steps.length} passos detectados
                </span>
                {parsed.partC && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-green-700">
                    <CheckCircle2 className="h-3 w-3" /> Parte C: {partCWords} palavras
                  </span>
                )}
                {parsed.ignoredSections.length > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-gray-600">
                    {parsed.ignoredSections.length} seções ignoradas
                  </span>
                )}
              </div>

              {/* Warnings */}
              {parsed.steps.length !== 27 && (
                <div className="flex items-start gap-2 rounded bg-amber-50 p-2 text-xs text-amber-800">
                  <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
                  <span>
                    Esperados 27 passos, detectados {parsed.steps.length}.
                    {unmatchedCount > 0 && ` ${unmatchedCount} passos não encontrados no banco.`}
                  </span>
                </div>
              )}

              {effectiveAutoTag && (
                <div className="flex items-start gap-2 rounded bg-blue-50 p-2 text-xs text-blue-800">
                  <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
                  Tags <code>[ANCHOR:troca_frame]</code> não são detectáveis automaticamente — adicione manualmente após importação.
                </div>
              )}

              {/* Step list */}
              <div className="max-h-[200px] overflow-y-auto space-y-1">
                {matchedSteps.map((s) => (
                  <div key={s.stepNumber} className="flex items-center gap-2 text-xs">
                    <span className={`inline-flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold ${
                      s.dbStepId ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {s.stepNumber}
                    </span>
                    <span className="truncate flex-1">{s.title}</span>
                    <span className="text-muted-foreground">{s.wordCount}w</span>
                    {!s.dbStepId && (
                      <span className="text-red-600 text-[10px]">sem match</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={importing}>
            Cancelar
          </Button>
          <Button
            onClick={handleImport}
            disabled={importing || !parsed || matchedSteps.filter((s) => s.dbStepId).length === 0}
          >
            {importing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Importando...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Importar {matchedSteps.filter((s) => s.dbStepId).length} passos
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
