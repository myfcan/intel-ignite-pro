import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Save, Sparkles, Loader2, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { V10BpaPipeline, V10ScoreSemaphore } from '@/types/v10.types';

interface Stage1ScoreProps {
  pipeline: V10BpaPipeline;
  onUpdate: (updates: Partial<V10BpaPipeline>) => Promise<void>;
}

interface ScoreField {
  key: 'score_docs' | 'score_pedagogy' | 'score_difficulty' | 'score_relevance';
  label: string;
  weight: number;
}

const SCORE_FIELDS: ScoreField[] = [
  { key: 'score_docs', label: 'Documentação oficial', weight: 0.30 },
  { key: 'score_pedagogy', label: 'Valor pedagógico', weight: 0.30 },
  { key: 'score_difficulty', label: 'Dificuldade (inverso: fácil = mais pontos)', weight: 0.20 },
  { key: 'score_relevance', label: 'Relevância mercado', weight: 0.20 },
];

function computeSemaphore(total: number): V10ScoreSemaphore {
  if (total >= 70) return 'green';
  if (total >= 40) return 'yellow';
  return 'red';
}

function semaphoreEmoji(semaphore: V10ScoreSemaphore): string {
  switch (semaphore) {
    case 'green': return '\u{1F7E2}';
    case 'yellow': return '\u{1F7E1}';
    case 'red': return '\u{1F534}';
  }
}

function semaphoreColor(semaphore: V10ScoreSemaphore): string {
  switch (semaphore) {
    case 'green': return 'bg-green-500';
    case 'yellow': return 'bg-yellow-400';
    case 'red': return 'bg-red-500';
  }
}

export function Stage1Score({ pipeline, onUpdate }: Stage1ScoreProps) {
  const [scores, setScores] = useState<Record<ScoreField['key'], number>>({
    score_docs: pipeline.score_docs,
    score_pedagogy: pipeline.score_pedagogy,
    score_difficulty: pipeline.score_difficulty,
    score_relevance: pipeline.score_relevance,
  });
  const [docsManualInput, setDocsManualInput] = useState(pipeline.docs_manual_input ?? '');
  const [tools, setTools] = useState<string[]>(pipeline.tools ?? []);
  const [newTool, setNewTool] = useState('');
  const [saving, setSaving] = useState(false);
  const [suggesting, setSuggesting] = useState(false);

  const scoreTotal = Math.round(
    SCORE_FIELDS.reduce((sum, field) => sum + scores[field.key] * field.weight, 0)
  );
  const semaphore = computeSemaphore(scoreTotal);

  const handleSliderChange = (key: ScoreField['key'], value: number[]) => {
    setScores((prev) => ({ ...prev, [key]: value[0] }));
  };

  const handleSuggestScore = async () => {
    setSuggesting(true);
    try {
      const { data, error } = await supabase.functions.invoke('v10-score-bpa', {
        body: { pipeline_id: pipeline.id },
      });
      if (error) {
        toast.error('Erro ao sugerir score via IA');
        return;
      }
      const responseData = data as Record<string, unknown>;
      setScores({
        score_docs: (responseData.score_docs as number) ?? 0,
        score_pedagogy: (responseData.score_pedagogy as number) ?? 0,
        score_difficulty: (responseData.score_difficulty as number) ?? 0,
        score_relevance: (responseData.score_relevance as number) ?? 0,
      });

      toast.success('Score sugerido pela IA!');
    } catch {
      toast.error('Erro ao sugerir score via IA');
    } finally {
      setSuggesting(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdate({
        score_docs: scores.score_docs,
        score_pedagogy: scores.score_pedagogy,
        score_difficulty: scores.score_difficulty,
        score_relevance: scores.score_relevance,
        score_total: scoreTotal,
        score_semaphore: semaphore,
        docs_manual_input: docsManualInput || null,
      });
      toast.success('Score salvo com sucesso!');
    } catch {
      toast.error('Erro ao salvar score');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Etapa 1 — Score de Viabilidade</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Semaphore indicator and total score */}
        <div className="flex items-center gap-6 rounded-lg border p-4">
          <div className="flex flex-col items-center gap-2">
            <div className={`h-16 w-16 rounded-full ${semaphoreColor(semaphore)} flex items-center justify-center text-3xl shadow-lg`}>
              {semaphoreEmoji(semaphore)}
            </div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {semaphore === 'green' ? 'Viável' : semaphore === 'yellow' ? 'Revisar' : 'Inviável'}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-5xl font-bold tabular-nums">{scoreTotal}</span>
            <span className="text-sm text-muted-foreground">/ 100 pontos</span>
          </div>
        </div>

        {/* Score sliders */}
        <div className="space-y-5">
          {SCORE_FIELDS.map((field) => (
            <div key={field.key} className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor={field.key}>
                  {field.label}
                  <span className="ml-2 text-xs text-muted-foreground font-normal">
                    (peso: {Math.round(field.weight * 100)}%)
                  </span>
                </Label>
                <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-sm font-semibold text-primary tabular-nums">
                  {scores[field.key]}/100
                </span>
              </div>
              <Slider
                id={field.key}
                min={0}
                max={100}
                step={5}
                value={[scores[field.key]]}
                onValueChange={(value) => handleSliderChange(field.key, value)}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0</span>
                <span>50</span>
                <span>100</span>
              </div>
            </div>
          ))}
        </div>

        {/* Documentation notes */}
        <div className="space-y-2">
          <Label htmlFor="docs_manual_input">Notas de documentação (opcional)</Label>
          <Textarea
            id="docs_manual_input"
            placeholder="Links de referência, observações sobre documentação disponível..."
            value={docsManualInput}
            onChange={(e) => setDocsManualInput(e.target.value)}
            rows={4}
          />
        </div>

        {/* Action buttons */}
        <Button
          variant="outline"
          onClick={handleSuggestScore}
          disabled={suggesting}
          className="min-h-[44px] w-full"
        >
          <Sparkles className="mr-2 h-4 w-4" />
          {suggesting ? 'Analisando...' : 'IA Sugerir Score'}
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="min-h-[44px] w-full"
        >
          <Save className="mr-2 h-4 w-4" />
          {saving ? 'Salvando...' : 'Salvar Score'}
        </Button>
      </CardContent>
    </Card>
  );
}
