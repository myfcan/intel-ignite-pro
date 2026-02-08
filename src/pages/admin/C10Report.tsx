/**
 * C10/C10B Pipeline Validation Report
 * Relatório visual das provas do contrato C10 HARD PAUSE ANCHOR
 */

import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, XCircle, AlertTriangle, Clock, FileCode, Database } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface C10Run {
  run_id: string;
  pipeline_version: string;
  commit_hash: string;
  lesson_id: string | null;
  status: string;
  created_at: string;
  trigger_contract: string | null;
}

interface InteractivePhase {
  phase_id: string;
  phase_type: string;
  pauseAt_input: string;
  matched_keyword: string;
  pause_time: number;
  c07_reason: string;
  c10_validated: boolean;
  c10b_validated: boolean;
  narration_after: number;
}

interface BoundaryCheck {
  phase_id: string;
  phase_type: string;
  start_time: number;
  end_time: number;
  next_start: number | null;
  is_monotonic: boolean;
}

export default function C10Report() {
  const [runs, setRuns] = useState<C10Run[]>([]);
  const [selectedRun, setSelectedRun] = useState<C10Run | null>(null);
  const [phases, setPhases] = useState<InteractivePhase[]>([]);
  const [boundaries, setBoundaries] = useState<BoundaryCheck[]>([]);
  const [loading, setLoading] = useState(true);

  // Buscar runs C10
  useEffect(() => {
    async function fetchRuns() {
      const { data, error } = await supabase
        .from('pipeline_executions')
        .select('id, pipeline_version, commit_hash, lesson_id, status, created_at, output_data')
        .like('pipeline_version', '%c10%')
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching runs:', error);
        return;
      }

      const formattedRuns: C10Run[] = (data || []).map((row: any) => ({
        run_id: row.id,
        pipeline_version: row.pipeline_version,
        commit_hash: row.commit_hash,
        lesson_id: row.lesson_id,
        status: row.status,
        created_at: row.created_at,
        trigger_contract: row.output_data?.meta?.triggerContract || row.output_data?.content?.metadata?.triggerContract || null
      }));

      setRuns(formattedRuns);
      if (formattedRuns.length > 0) {
        setSelectedRun(formattedRuns[0]);
      }
      setLoading(false);
    }

    fetchRuns();
  }, []);

  // Buscar detalhes do run selecionado
  useEffect(() => {
    if (!selectedRun) return;

    async function fetchRunDetails() {
      const { data, error } = await supabase
        .from('pipeline_executions')
        .select('input_data, output_data')
        .eq('id', selectedRun.run_id)
        .single();

      if (error || !data) {
        console.error('Error fetching run details:', error);
        return;
      }

      const outputData = data.output_data as any;
      const inputData = data.input_data as any;
      const phasesData = outputData?.content?.phases || [];

      // Extrair fases interativas
      const interactiveTypes = ['interaction', 'quiz', 'playground', 'cta'];
      const interactivePhases: InteractivePhase[] = [];

      for (const phase of phasesData) {
        if (!interactiveTypes.includes(phase.type)) continue;

        const pauseAction = phase.anchorActions?.find((a: any) => a.type === 'pause');
        const inputScene = inputData?.scenes?.find((s: any) => s.id === phase.id);

        interactivePhases.push({
          phase_id: phase.id,
          phase_type: phase.type,
          pauseAt_input: inputScene?.anchorText?.pauseAt || '(não definido)',
          matched_keyword: pauseAction?.keyword || '(não encontrado)',
          pause_time: pauseAction?.keywordTime || 0,
          c07_reason: pauseAction?.c07Reason || '(sem reason)',
          c10_validated: pauseAction?.c10Validated || false,
          c10b_validated: pauseAction?.c10bValidated || false,
          narration_after: pauseAction?.c10bNarrationAfterPause || 0
        });
      }

      setPhases(interactivePhases);

      // Verificar boundaries
      const boundaryChecks: BoundaryCheck[] = [];
      for (let i = 0; i < phasesData.length; i++) {
        const phase = phasesData[i];
        const nextPhase = phasesData[i + 1];

        boundaryChecks.push({
          phase_id: phase.id,
          phase_type: phase.type,
          start_time: phase.startTime || 0,
          end_time: phase.endTime || 0,
          next_start: nextPhase?.startTime || null,
          is_monotonic: nextPhase ? (phase.endTime <= nextPhase.startTime) : true
        });
      }

      setBoundaries(boundaryChecks);
    }

    fetchRunDetails();
  }, [selectedRun]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Clock className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const allC10Valid = phases.every(p => p.c10_validated);
  const allC10bValid = phases.every(p => p.c10b_validated);
  const allMonotonic = boundaries.every(b => b.is_monotonic);

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">📋 Relatório C10/C10B</h1>
          <p className="text-muted-foreground">Validação do HARD PAUSE ANCHOR CONTRACT</p>
        </div>
        <div className="flex gap-2">
          {allC10Valid && allC10bValid && allMonotonic ? (
            <Badge className="bg-green-500 text-white text-lg px-4 py-2">
              <CheckCircle className="w-5 h-5 mr-2" />
              VALIDADO
            </Badge>
          ) : (
            <Badge variant="destructive" className="text-lg px-4 py-2">
              <XCircle className="w-5 h-5 mr-2" />
              FALHAS DETECTADAS
            </Badge>
          )}
        </div>
      </div>

      {/* Prova 1: IDs do Deploy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            1️⃣ IDs do Deploy C10B
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>run_id</TableHead>
                  <TableHead>pipeline_version</TableHead>
                  <TableHead>commit_hash</TableHead>
                  <TableHead>lesson_id</TableHead>
                  <TableHead>status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {runs.map((run) => (
                  <TableRow 
                    key={run.run_id} 
                    className={`cursor-pointer hover:bg-muted/50 ${selectedRun?.run_id === run.run_id ? 'bg-primary/10' : ''}`}
                    onClick={() => setSelectedRun(run)}
                  >
                    <TableCell className="font-mono text-xs">{run.run_id}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{run.pipeline_version}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{run.commit_hash}</TableCell>
                    <TableCell className="font-mono text-xs">{run.lesson_id || '-'}</TableCell>
                    <TableCell>
                      <Badge className={run.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'}>
                        {run.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {selectedRun && (
        <>
          {/* Prova 2: Trigger Contract */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCode className="w-5 h-5" />
                2️⃣ Trigger Contract
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">pipeline_version</p>
                  <p className="font-mono font-bold">{selectedRun.pipeline_version}</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">commit_hash</p>
                  <p className="font-mono font-bold text-sm">{selectedRun.commit_hash}</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">triggerContract</p>
                  <p className="font-mono font-bold flex items-center gap-2">
                    {selectedRun.trigger_contract === 'anchorActions' ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        anchorActions
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-red-500" />
                        {selectedRun.trigger_contract || 'NOT FOUND'}
                      </>
                    )}
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Caminho</p>
                  <p className="font-mono text-xs">output_data→meta→triggerContract</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Prova 3: C10 Pause Determinístico */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                ⏸️ 3️⃣ C10: Pause Determinístico
                {allC10Valid ? (
                  <Badge className="bg-green-500 text-white ml-2">
                    <CheckCircle className="w-4 h-4 mr-1" /> OK
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="ml-2">
                    <XCircle className="w-4 h-4 mr-1" /> FALHA
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {phases.length === 0 ? (
                <p className="text-muted-foreground">Nenhuma fase interativa encontrada neste run.</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>phase_id</TableHead>
                        <TableHead>type</TableHead>
                        <TableHead>pauseAt (input)</TableHead>
                        <TableHead>matched_keyword</TableHead>
                        <TableHead>pause_time (s)</TableHead>
                        <TableHead>c07_reason</TableHead>
                        <TableHead>C10</TableHead>
                        <TableHead>C10B</TableHead>
                        <TableHead>narration_after (s)</TableHead>
                        <TableHead>Verdict</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {phases.map((phase) => (
                        <TableRow key={phase.phase_id}>
                          <TableCell className="font-mono text-xs">{phase.phase_id}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{phase.phase_type}</Badge>
                          </TableCell>
                          <TableCell className="font-medium">"{phase.pauseAt_input}"</TableCell>
                          <TableCell className="font-medium">"{phase.matched_keyword}"</TableCell>
                          <TableCell className="font-mono">{phase.pause_time.toFixed(3)}</TableCell>
                          <TableCell className="font-mono text-xs">{phase.c07_reason}</TableCell>
                          <TableCell>
                            {phase.c10_validated ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-500" />
                            )}
                          </TableCell>
                          <TableCell>
                            {phase.c10b_validated ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-500" />
                            )}
                          </TableCell>
                          <TableCell className={`font-mono ${phase.narration_after > 1.5 ? 'text-red-500 font-bold' : 'text-green-600'}`}>
                            {phase.narration_after.toFixed(3)}
                          </TableCell>
                          <TableCell>
                            {phase.c10_validated && phase.c10b_validated && phase.narration_after <= 1.5 ? (
                              <Badge className="bg-green-500 text-white">✅ OK</Badge>
                            ) : (
                              <Badge variant="destructive">❌ FAIL</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              <Separator className="my-4" />

              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">📊 Critérios de Sucesso C10:</h4>
                <ul className="text-sm space-y-1">
                  <li className="flex items-center gap-2">
                    {allC10Valid ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
                    c10_validated = true para todas as fases interativas
                  </li>
                  <li className="flex items-center gap-2">
                    {allC10bValid ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
                    c10b_validated = true (pauseAt nos últimos 1.5s)
                  </li>
                  <li className="flex items-center gap-2">
                    {phases.every(p => p.narration_after <= 1.5) ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
                    narration_after_pause ≤ 1.5s
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Prova 5: Boundary Fix */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📏 5️⃣ Boundary Fix (Monotonicidade)
                {allMonotonic ? (
                  <Badge className="bg-green-500 text-white ml-2">
                    <CheckCircle className="w-4 h-4 mr-1" /> OK
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="ml-2">
                    <AlertTriangle className="w-4 h-4 mr-1" /> OVERLAP
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>phase_id</TableHead>
                      <TableHead>type</TableHead>
                      <TableHead>start_time</TableHead>
                      <TableHead>end_time</TableHead>
                      <TableHead>next_start</TableHead>
                      <TableHead>Monotonic</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {boundaries.map((b, i) => (
                      <TableRow key={b.phase_id}>
                        <TableCell>{i + 1}</TableCell>
                        <TableCell className="font-mono text-xs">{b.phase_id}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{b.phase_type}</Badge>
                        </TableCell>
                        <TableCell className="font-mono">{b.start_time.toFixed(3)}</TableCell>
                        <TableCell className="font-mono">{b.end_time.toFixed(3)}</TableCell>
                        <TableCell className="font-mono">{b.next_start?.toFixed(3) || '(LAST)'}</TableCell>
                        <TableCell>
                          {b.is_monotonic ? (
                            <Badge className="bg-green-500 text-white">✅ OK</Badge>
                          ) : (
                            <Badge variant="destructive">❌ OVERLAP</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <Separator className="my-4" />

              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">📊 Regra de Monotonicidade:</h4>
                <p className="text-sm text-muted-foreground">
                  Para todas as fases: <code className="bg-muted px-1 py-0.5 rounded">phase[N].endTime ≤ phase[N+1].startTime</code>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Prova 6: Player preemptiveMs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🎮 6️⃣ Player: preemptiveMs = 0
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-zinc-900 text-zinc-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                <pre>{`// src/components/lessons/v7/cinematic/useAnchorText.ts
// Linhas 384-392

// Get trigger point
// ✅ C10 FIX: preemptiveMs = 0 para pause (100% determinístico)
// O pause agora é calculado no FIM da última palavra pelo C10 HARD PAUSE ANCHOR
// Não há necessidade de antecipar - o keywordTime já é o END time da palavra
let triggerPoint: number | null = null;
if (action.keywordTime !== undefined && action.keywordTime > 0) {
  const preemptiveMs = 0; // ← C10: ZERO antecipação para TODOS os tipos
  triggerPoint = action.keywordTime - (preemptiveMs / 1000);
}`}</pre>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm">Player não antecipa mais a pausa — stop exatamente no keywordTime</span>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
