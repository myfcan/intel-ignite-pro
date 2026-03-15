import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Layout, CheckCircle2, Save } from 'lucide-react';
import type { V10BpaPipeline } from '@/types/v10.types';

interface Stage4MockupsProps {
  pipeline: V10BpaPipeline;
  onUpdate: (updates: Partial<V10BpaPipeline>) => Promise<void>;
}

export function Stage4Mockups({ pipeline, onUpdate }: Stage4MockupsProps) {
  const [mockupsTotal, setMockupsTotal] = useState(pipeline.mockups_total);
  const [mockupsFromRefero, setMockupsFromRefero] = useState(pipeline.mockups_from_refero);
  const [mockupsGeneric, setMockupsGeneric] = useState(pipeline.mockups_generic);
  const [mockupsApproved, setMockupsApproved] = useState(pipeline.mockups_approved);
  const [saving, setSaving] = useState(false);

  const progressPercent = mockupsTotal > 0
    ? Math.round((mockupsApproved / mockupsTotal) * 100)
    : 0;

  const barColor = progressPercent === 0
    ? 'bg-red-500'
    : progressPercent >= 100
      ? 'bg-green-500'
      : 'bg-yellow-500';

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdate({
        mockups_total: mockupsTotal,
        mockups_from_refero: mockupsFromRefero,
        mockups_generic: mockupsGeneric,
        mockups_approved: mockupsApproved,
      });
      toast.success('Dados de mockups salvos com sucesso');
    } catch {
      toast.error('Erro ao salvar dados de mockups');
    } finally {
      setSaving(false);
    }
  };

  const handleApproveAll = () => {
    setMockupsApproved(mockupsTotal);
    toast.info('Todos os mockups foram marcados como aprovados. Clique em Salvar para confirmar.');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layout className="h-5 w-5 text-indigo-500" />
          Etapa 4 — Mockups
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm font-medium">
            <span>Progresso</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full transition-all ${barColor}`}
              style={{ width: `${Math.min(progressPercent, 100)}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {mockupsApproved} aprovados de {mockupsTotal} total
          </p>
        </div>

        {/* Breakdown summary */}
        <div className="rounded-md border bg-gradient-to-r from-indigo-50 to-violet-50 px-4 py-2 text-sm font-medium text-indigo-800">
          Refero: {mockupsFromRefero} | Genéricos: {mockupsGeneric} | Total: {mockupsTotal}
        </div>

        {/* Metric cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total */}
          <div className="rounded-lg border bg-gradient-to-br from-indigo-50 to-violet-50 p-4">
            <label className="mb-1 block text-xs font-medium text-indigo-700">
              Total
            </label>
            <Input
              type="number"
              min={0}
              value={mockupsTotal}
              onChange={(e) => setMockupsTotal(Number(e.target.value))}
              className="bg-white"
            />
          </div>

          {/* Via Refero */}
          <div className="rounded-lg border bg-gradient-to-br from-indigo-50 to-violet-50 p-4">
            <label className="mb-1 block text-xs font-medium text-indigo-700">
              Via Refero
            </label>
            <Input
              type="number"
              min={0}
              value={mockupsFromRefero}
              onChange={(e) => setMockupsFromRefero(Number(e.target.value))}
              className="bg-white"
            />
          </div>

          {/* Genéricos */}
          <div className="rounded-lg border bg-gradient-to-br from-indigo-50 to-violet-50 p-4">
            <label className="mb-1 block text-xs font-medium text-indigo-700">
              Genéricos
            </label>
            <Input
              type="number"
              min={0}
              value={mockupsGeneric}
              onChange={(e) => setMockupsGeneric(Number(e.target.value))}
              className="bg-white"
            />
          </div>

          {/* Aprovados */}
          <div className="rounded-lg border bg-gradient-to-br from-indigo-50 to-violet-50 p-4">
            <label className="mb-1 block text-xs font-medium text-indigo-700">
              Aprovados
            </label>
            <Input
              type="number"
              min={0}
              value={mockupsApproved}
              onChange={(e) => setMockupsApproved(Number(e.target.value))}
              className="bg-white"
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            className="min-h-[44px]"
            onClick={handleApproveAll}
            disabled={mockupsTotal === 0}
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Aprovar Todos
          </Button>

          <Button
            className="min-h-[44px]"
            onClick={handleSave}
            disabled={saving}
          >
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
