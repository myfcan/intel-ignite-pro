import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ArrowLeft, 
  FileJson, 
  BookOpen, 
  Copy, 
  CheckCircle,
  FolderOpen,
  Rocket,
  FileText,
  Code,
  Shield,
  AlertTriangle,
  Zap,
  Database,
  Eye,
  Timer,
  Hash,
  GitBranch,
  Lock,
  Image,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { toast } from 'sonner';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';

// JSON Modelo INPUT para Pipeline V7-vv
import V7Aula1InputModelo from '@/data/v7-aula1-input-modelo.json';

// ============================================================================
// CONTRACT DATA — Single Source of Truth (extraído dos docs/contracts/)
// ============================================================================

interface ContractInfo {
  id: string;
  name: string;
  status: 'ACTIVE' | 'DEPRECATED' | 'KNOWN_GAP';
  deprecatedBy?: string;
  category: 'Pipeline' | 'Runtime' | 'System';
  icon: React.ReactNode;
  summary: string;
  invariants: string[];
  errorCodes?: string[];
  filePaths: string[];
}

const CONTRACTS: ContractInfo[] = [
  {
    id: 'C01',
    name: 'Reprocess Mode',
    status: 'ACTIVE',
    category: 'Pipeline',
    icon: <GitBranch className="w-4 h-4" />,
    summary: 'Permite reprocessar aulas com áudio existente, recalculando apenas timings e anchors sem regenerar TTS.',
    invariants: [
      'reprocess: true + existing_audio_url + existing_word_timestamps',
      'Apenas recalcula timings, NÃO regenera áudio',
      'existing_lesson_id permite atualizar aula existente',
      'run_id garante idempotência no reprocessamento',
    ],
    filePaths: [
      'supabase/functions/v7-vv/index.ts',
    ],
  },
  {
    id: 'C02',
    name: 'Anchor Recalculation',
    status: 'ACTIVE',
    category: 'Pipeline',
    icon: <Zap className="w-4 h-4" />,
    summary: 'Recalcula keywordTime de todos os anchors usando wordTimestamps reais do TTS.',
    invariants: [
      'Estratégia LAST_IN_RANGE para pause anchors',
      'Estratégia FIRST_IN_RANGE para show/highlight anchors',
      'Tolerância EPS: 0.30s',
      'Normalização NFD para matching de keywords',
      'Keyword mínima: 4 caracteres',
    ],
    filePaths: [
      'supabase/functions/v7-vv/index.ts',
    ],
  },
  {
    id: 'C03',
    name: 'Scenes Array',
    status: 'KNOWN_GAP',
    category: 'Pipeline',
    icon: <AlertTriangle className="w-4 h-4" />,
    summary: 'output_data.content.scenes[] é atualmente vazio. Renderer usa fallback via visual object.',
    invariants: [
      'scenes[] vazio no output (KNOWN_GAP)',
      'Renderer usa visual object diretamente das phases',
      'Preenchimento adiado para versão futura (MINOR bump)',
      'Sem impacto no runtime atual',
    ],
    filePaths: [
      'docs/contracts/v7-vv-contracts.md (Section E)',
    ],
  },
  {
    id: 'C04',
    name: 'Timeline Normalization',
    status: 'ACTIVE',
    category: 'Pipeline',
    icon: <Timer className="w-4 h-4" />,
    summary: 'Garante monotonicidade temporal e duração mínima para todas as fases.',
    invariants: [
      'startTime >= prevEndTime (monotonicidade)',
      'Clamp em [0, audioDuration]',
      'Duração mínima: 5s para interativas',
      'Duração mínima: 0.5s para narrativas',
      'endTime - startTime > 0 (positivo)',
    ],
    filePaths: [
      'supabase/functions/v7-vv/index.ts',
    ],
  },
  {
    id: 'C05',
    name: 'Traceability & Hash',
    status: 'ACTIVE',
    category: 'Pipeline',
    icon: <Hash className="w-4 h-4" />,
    summary: 'Rastreabilidade completa via run_id, pipeline_version, commit_hash e output_content_hash.',
    invariants: [
      'run_id UUID para idempotência (auto-gerado se ausente)',
      'pipeline_version persistido em output_data.meta',
      'commit_hash persistido em output_data.meta',
      'output_content_hash via SHA-256 (SQL RPC c05_compute_content_hash)',
      'Tabela pipeline_executions com input/output completo',
    ],
    errorCodes: ['HASH_MISMATCH'],
    filePaths: [
      'supabase/functions/v7-vv/index.ts',
      'Tabela: pipeline_executions',
    ],
  },
  {
    id: 'C06',
    name: 'Single Trigger Contract',
    status: 'ACTIVE',
    category: 'Pipeline',
    icon: <Eye className="w-4 h-4" />,
    summary: 'anchorActions é a ÚNICA fonte de verdade para triggers visuais e de interação. triggerTime é removido.',
    invariants: [
      'metadata.triggerContract = "anchorActions"',
      'triggerTime REMOVIDO de todos os microVisuals',
      'Todos os triggers derivam de anchorActions[]',
      'Validado por TRIGGER_CONTRACT_MISMATCH error code',
    ],
    errorCodes: ['TRIGGER_CONTRACT_MISMATCH'],
    filePaths: [
      'supabase/functions/v7-vv/index.ts',
      'supabase/functions/v7-vv/contracts.ts',
    ],
  },
  {
    id: 'C07',
    name: 'Pause Priority Rule',
    status: 'DEPRECATED',
    deprecatedBy: 'C10',
    category: 'Pipeline',
    icon: <AlertTriangle className="w-4 h-4" />,
    summary: 'DEPRECATED — Substituído pelo C10 Hard Pause Anchor. c07OriginalTime não é mais utilizado.',
    invariants: [
      'C10 Hard Pause elimina toda heurística do C07',
      'c07OriginalTime não é mais recalculado',
      'Campos c07* mantidos apenas para retrocompatibilidade',
    ],
    filePaths: [
      'docs/contracts/v7-vv-contracts.md (Section D)',
    ],
  },
  {
    id: 'C08',
    name: 'Phase Drift Monotonicity Fix',
    status: 'ACTIVE',
    category: 'Pipeline',
    icon: <Shield className="w-4 h-4" />,
    summary: 'Detecta e corrige drift temporal quando narração está ANTES do startTime da fase.',
    invariants: [
      'Detecta narração antes do startTime',
      'Expande startTime para cobrir narração',
      'Ajusta endTime da fase anterior para monotonicidade',
      'Janela de busca: 30s antes do startTime',
      'Campos phaseDriftFixed, phaseDriftReason, phaseDriftOldStartTime',
    ],
    filePaths: [
      'supabase/functions/v7-vv/index.ts',
    ],
  },
  {
    id: 'C09',
    name: 'Pause at Last Word',
    status: 'DEPRECATED',
    deprecatedBy: 'C10',
    category: 'Pipeline',
    icon: <AlertTriangle className="w-4 h-4" />,
    summary: 'DEPRECATED — Substituído pelo C10. Usava detecção implícita da última palavra. C10 usa pauseAt explícito.',
    invariants: [
      'Eliminado pela keyword explícita do C10',
      'Ambiguidade removida (última palavra != pauseAt)',
    ],
    filePaths: [
      'docs/contracts/v7-vv-contracts.md (Section D)',
    ],
  },
  {
    id: 'C10',
    name: 'Hard Pause Anchor (Deterministic)',
    status: 'ACTIVE',
    category: 'Pipeline',
    icon: <Lock className="w-4 h-4" />,
    summary: 'Pausa determinística: pauseTime = END do matched word. Zero heurística. pauseAt é OBRIGATÓRIO para cenas interativas.',
    invariants: [
      'pauseTime = wordTimestamps[matchedWordIndex].end',
      'Estratégia: LAST_IN_RANGE dentro de [startTime, endTime]',
      'pauseAt OBRIGATÓRIO para interaction, playground, secret-reveal',
      'Keyword mínima: 4 caracteres',
      'Normalização NFD + remoção de pontuação',
      'Erro PAUSE_ANCHOR_REQUIRED se ausente',
      'Erro PAUSE_ANCHOR_NOT_FOUND se keyword não existe no áudio',
    ],
    errorCodes: [
      'PAUSE_ANCHOR_REQUIRED',
      'PAUSE_ANCHOR_NOT_FOUND',
      'PAUSE_ANCHOR_AMBIGUOUS',
      'PAUSE_ANCHOR_NOT_IN_NARRATION',
    ],
    filePaths: [
      'supabase/functions/v7-vv/index.ts',
      'supabase/functions/v7-vv/contracts.ts',
      'docs/contracts/v7-vv-contracts.md (Section A1)',
    ],
  },
  {
    id: 'C10B',
    name: 'Editorial Guardrail',
    status: 'ACTIVE',
    category: 'Pipeline',
    icon: <Shield className="w-4 h-4" />,
    summary: 'Guardrail editorial: pauseAt deve estar nos últimos 1.5s da narração. Previne pausas prematuras.',
    invariants: [
      'narrationAfterPause = lastWordEnd - pauseTime',
      'FAIL se narrationAfterPause > 1.5s',
      'lastWordEnd = end timestamp da última palavra da cena',
      'Threshold: 1.5 segundos (FROZEN — alterar requer MINOR bump)',
      'Erro PAUSE_ANCHOR_NOT_AT_END com error_details.narrationAfterPause',
    ],
    errorCodes: ['PAUSE_ANCHOR_NOT_AT_END'],
    filePaths: [
      'supabase/functions/v7-vv/index.ts',
      'supabase/functions/v7-vv/contracts.ts',
      'docs/contracts/v7-vv-contracts.md (Section A1)',
    ],
  },
  {
    id: 'C11',
    name: 'Runtime Anchor Audit + RAF Timing',
    status: 'ACTIVE',
    category: 'Runtime',
    icon: <Zap className="w-4 h-4" />,
    summary: 'Auditoria de runtime: cadeia causal obrigatória (ANCHOR_PAUSE → PLAYER_PAUSE → PHASE_REACTION) + polling via RAF a 60fps.',
    invariants: [
      'C11_RUNTIME_ANCHOR_AUDIT: 5 eventos obrigatórios por fase interativa',
      'Sequência: PLAYGROUND_ENTRY → ANCHOR_PAUSE_EXECUTED → PLAYER_PAUSE_STATE_TRUE → SHOULD_PAUSE_TRANSITION → PLAYGROUND_PAUSED_AUDIO',
      'Anchor precision: |currentTime - keywordTime| ≤ 0.15s (150ms)',
      'Pause propagation (anchor→player): ≤ 200ms',
      'Phase reaction (player→playground): ≤ 200ms',
      'C11_RAF_ANCHOR_TIMING: requestAnimationFrame polling ≥ 30Hz',
      'Crossing detection: ≤ 32ms (2 RAF frames)',
      'Fallback timeupdate apenas quando RAF não está ativo',
      'Zero preemption (C10 compliance): preemptiveMs = 0',
    ],
    errorCodes: [
      'C11_MISSING_EVENT',
      'C11_INVALID_TIMESTAMP',
      'C11_WALLCLOCK_NOT_MONOTONIC',
      'C11_CAUSAL_ORDER_VIOLATED',
      'C11_ANCHOR_PRECISION_EXCEEDED',
      'C11_PAUSE_PROPAGATION_SLOW',
      'C11_PHASE_REACTION_SLOW',
      'C11_RAF_NOT_ACTIVE',
      'C11_RAF_LEAK',
      'C11_CROSSING_LATENCY_EXCEEDED',
    ],
    filePaths: [
      'src/components/lessons/v7/cinematic/V7PhasePlayer.tsx',
      'src/components/lessons/v7/cinematic/useAnchorText.ts',
      'src/components/lessons/v7/cinematic/useV7AudioManager.ts',
      'src/components/lessons/v7/cinematic/validators/validateV7DebugLogs.ts',
      'docs/contracts/C11_RUNTIME_ANCHOR_AUDIT.md',
      'docs/contracts/C11_RAF_ANCHOR_TIMING.md',
    ],
  },
  {
    id: 'C12',
    name: 'AI Image Lab',
    status: 'ACTIVE',
    category: 'System',
    icon: <Image className="w-4 h-4" />,
    summary: 'Contrato do Image Lab: auth gate, storage privado, state machine de jobs, idempotência via hash e concurrency lock.',
    invariants: [
      'C12_AUTH_GATE: JWT obrigatório, admin/supervisor para gerar, admin-only para aprovar',
      'C12_STORAGE_PRIVACY: bucket image-lab é privado, acesso via signedUrl apenas',
      'C12_JOB_STATE_MACHINE: queued→processing→completed/failed, approve/reject admin-only',
      'C12_IDEMPOTENCY: SHA256(provider|model|size|preset_key|preset_version|prompt_final)',
      'C12_CONCURRENCY_LOCK: job em processing → erro LOCKED',
    ],
    errorCodes: [
      'AUTH_MISSING', 'AUTH_INVALID', 'FORBIDDEN',
      'LOCKED', 'JOB_NOT_FOUND', 'INVALID_STATUS',
      'GENERATION_FAILED', 'BATCH_FAILED',
    ],
    filePaths: [
      'supabase/functions/image-lab-generate/index.ts',
      'supabase/functions/image-lab-generate-batch/index.ts',
      'docs/contracts/C12_IMAGE_LAB.md',
    ],
  },
];

// ============================================================================
// BOUNDARY CONTRACT (Extracted)
// ============================================================================

const BOUNDARY_FIX_GUARD = {
  invariants: [
    'Positive duration: endTime - startTime > 0',
    'Min duration narrative: 0.05s (50ms)',
    'Min duration interactive: 5.0s',
    'Monotonicity: phases[i].endTime ≤ phases[i+1].startTime',
    'PASS 1: Enforce min duration (expand endTime, clamp to totalDuration)',
    'PASS 2: Enforce monotonicity (shift next.startTime if overlap)',
    'PASS 3: Final validation — duration ≤ 0 → BOUNDARY_FIX_GUARD_FAILED',
  ],
  errorCode: 'BOUNDARY_FIX_GUARD_FAILED',
};

// ============================================================================
// INTERACTIVE SCENE TYPES
// ============================================================================

const INTERACTIVE_SCENE_TYPES = [
  { type: 'interaction', requiresPauseAt: true, mapsTo: 'interaction' },
  { type: 'playground', requiresPauseAt: true, mapsTo: 'playground' },
  { type: 'secret-reveal', requiresPauseAt: true, mapsTo: 'revelation' },
  { type: 'gamification', requiresPauseAt: false, mapsTo: 'narrative' },
];

// ============================================================================
// MICRO VISUAL TYPES
// ============================================================================

const MICRO_VISUAL_TYPES = [
  { input: 'image', output: 'image-flash', desc: 'Flash de imagem' },
  { input: 'text', output: 'text-pop', desc: 'Pop de texto' },
  { input: 'number', output: 'number-count', desc: 'Contador numérico' },
  { input: 'badge', output: 'card-reveal', desc: 'Card/badge' },
  { input: 'highlight', output: 'highlight', desc: 'Destaque (passthrough)' },
  { input: 'letter-reveal', output: 'letter-reveal', desc: 'Revelação letra a letra (passthrough)' },
];

// ============================================================================
// COMPONENT
// ============================================================================

function ContractCard({ contract }: { contract: ContractInfo }) {
  const [isOpen, setIsOpen] = useState(false);

  const statusColor = contract.status === 'ACTIVE' 
    ? 'bg-emerald-600' 
    : contract.status === 'DEPRECATED' 
      ? 'bg-red-600' 
      : 'bg-yellow-600';

  const borderColor = contract.status === 'ACTIVE'
    ? 'border-emerald-500/20 hover:border-emerald-500/40'
    : contract.status === 'DEPRECATED'
      ? 'border-red-500/20 hover:border-red-500/30'
      : 'border-yellow-500/20 hover:border-yellow-500/30';

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className={`border-2 ${borderColor} transition-colors`}>
        <CollapsibleTrigger className="w-full text-left">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              {contract.icon}
              <span className="font-mono text-sm text-muted-foreground">{contract.id}</span>
              <span>{contract.name}</span>
              <Badge className={`${statusColor} text-white text-[10px] ml-auto`}>
                {contract.status}
              </Badge>
              {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </CardTitle>
            <CardDescription className="text-xs">
              {contract.summary}
            </CardDescription>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-3 pt-0">
            {contract.deprecatedBy && (
              <div className="text-xs bg-red-500/10 border border-red-500/20 rounded p-2 text-red-400">
                ⚠️ Substituído por <span className="font-mono font-bold">{contract.deprecatedBy}</span>
              </div>
            )}

            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Invariantes</p>
              <div className="space-y-1">
                {contract.invariants.map((inv, i) => (
                  <p key={i} className="text-xs text-muted-foreground font-mono">
                    • {inv}
                  </p>
                ))}
              </div>
            </div>

            {contract.errorCodes && contract.errorCodes.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Error Codes</p>
                <div className="flex flex-wrap gap-1">
                  {contract.errorCodes.map((code) => (
                    <span key={code} className="text-[10px] font-mono bg-destructive/10 text-destructive px-1.5 py-0.5 rounded">
                      {code}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Arquivos</p>
              <div className="space-y-0.5">
                {contract.filePaths.map((fp, i) => (
                  <p key={i} className="text-[10px] font-mono text-muted-foreground truncate">
                    📄 {fp}
                  </p>
                ))}
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

export default function AdminModelos() {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const copyJsonToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(V7Aula1InputModelo, null, 2));
      setCopied(true);
      toast.success('JSON copiado para a área de transferência!');
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      toast.error('Erro ao copiar JSON');
    }
  };

  const activeContracts = CONTRACTS.filter(c => c.status === 'ACTIVE');
  const deprecatedContracts = CONTRACTS.filter(c => c.status === 'DEPRECATED');
  const gapContracts = CONTRACTS.filter(c => c.status === 'KNOWN_GAP');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4 md:p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
              <FolderOpen className="w-7 h-7 text-emerald-500" />
              Guia de Modelos V7
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Templates JSON, Contratos C01–C12, documentação técnica completa
            </p>
          </div>
        </div>

        {/* CONTRACT VERSION BADGE */}
        <div className="flex flex-wrap gap-2 text-xs">
          <Badge variant="outline" className="border-emerald-500/50 text-emerald-400">
            Contract: c10b-boundaryfix-execstate-1.0
          </Badge>
          <Badge variant="outline" className="border-blue-500/50 text-blue-400">
            Pipeline: v7-vv-1.1.4+
          </Badge>
          <Badge variant="outline" className="border-purple-500/50 text-purple-400">
            Runtime: v7-runtime-c11-1.0
          </Badge>
          <Badge variant="outline" className="border-amber-500/50 text-amber-400">
            Status: FROZEN
          </Badge>
        </div>

        {/* JSON MODELO — DESTAQUE */}
        <Card className="border-2 border-emerald-500/50 bg-gradient-to-r from-emerald-500/10 to-green-500/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <FileJson className="w-7 h-7 text-emerald-500" />
              JSON Modelo Padrão — Aula 1 V7-vv
              <span className="text-xs bg-emerald-600 text-white px-2 py-1 rounded-full">REFERÊNCIA</span>
            </CardTitle>
            <CardDescription>
              Espelho exato da Aula 1 funcionando — Use como base para criar novas aulas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm space-y-1.5">
              <p>✅ 11 cenas completas (dramatic, narrative, interaction, playground, revelation, cta, gamification)</p>
              <p>✅ anchorText.pauseAt APENAS em cenas interativas (C10 compliance)</p>
              <p>✅ Método PERFEITO com letter-reveal (7 tipos canônicos de microVisual)</p>
              <p>✅ Quiz 4 opções com feedback narrado</p>
              <p>✅ Playground amador vs profissional</p>
              <p>✅ CTA via scene.type="narrative" + visual.type="cta" (C10B compliance)</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                size="lg"
                className="flex-1 min-w-[160px] bg-emerald-600 hover:bg-emerald-700"
                onClick={copyJsonToClipboard}
              >
                {copied ? (
                  <><CheckCircle className="w-5 h-5 mr-2" /> Copiado!</>
                ) : (
                  <><Copy className="w-5 h-5 mr-2" /> Copiar JSON Modelo</>
                )}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="flex-1 min-w-[160px] border-emerald-500/50 hover:bg-emerald-500/10"
                onClick={() => navigate('/admin/v7-vv')}
              >
                <Rocket className="w-5 h-5 mr-2" /> Usar no Pipeline
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* CONTRATOS ATIVOS */}
        <div>
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-500" />
            Contratos Ativos ({activeContracts.length})
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            {activeContracts.map(c => (
              <ContractCard key={c.id} contract={c} />
            ))}
          </div>
        </div>

        {/* BOUNDARY FIX GUARD (standalone) */}
        <Card className="border-2 border-orange-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="w-4 h-4 text-orange-500" />
              <span className="font-mono text-sm text-muted-foreground">BoundaryFixGuard</span>
              Boundary Contract
              <Badge className="bg-emerald-600 text-white text-[10px] ml-auto">ACTIVE</Badge>
            </CardTitle>
            <CardDescription className="text-xs">
              Invariantes de timeline: duração positiva, duração mínima e monotonicidade entre fases.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {BOUNDARY_FIX_GUARD.invariants.map((inv, i) => (
              <p key={i} className="text-xs text-muted-foreground font-mono">• {inv}</p>
            ))}
            <span className="text-[10px] font-mono bg-destructive/10 text-destructive px-1.5 py-0.5 rounded inline-block mt-1">
              {BOUNDARY_FIX_GUARD.errorCode}
            </span>
          </CardContent>
        </Card>

        {/* CONTRATOS DEPRECATED + GAPS */}
        {(deprecatedContracts.length > 0 || gapContracts.length > 0) && (
          <div>
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              Deprecated & Known Gaps ({deprecatedContracts.length + gapContracts.length})
            </h2>
            <div className="grid gap-3 md:grid-cols-2">
              {[...deprecatedContracts, ...gapContracts].map(c => (
                <ContractCard key={c.id} contract={c} />
              ))}
            </div>
          </div>
        )}

        {/* REFERENCE CARDS */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* Interactive Scene Types */}
          <Card className="border-2 border-purple-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Code className="w-4 h-4 text-purple-500" />
                Interactive Scene Types
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs space-y-1 font-mono">
                {INTERACTIVE_SCENE_TYPES.map(s => (
                  <p key={s.type}>
                    <span className={s.requiresPauseAt ? 'text-emerald-500' : 'text-yellow-500'}>
                      {s.type}
                    </span>
                    {' → '}{s.mapsTo}
                    {s.requiresPauseAt ? ' ✅ pauseAt' : ' ❌ no pause'}
                  </p>
                ))}
                <p className="text-muted-foreground mt-2 text-[10px]">
                  ⚠️ CTA = scene.type="narrative" + visual.type="cta"
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Micro Visual Types */}
          <Card className="border-2 border-amber-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <FileText className="w-4 h-4 text-amber-500" />
                MicroVisual Types (7 canônicos)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs space-y-1 font-mono">
                {MICRO_VISUAL_TYPES.map(mv => (
                  <p key={mv.input}>
                    <span className="text-emerald-500">{mv.input}</span>
                    {' → '}<span className="text-muted-foreground">{mv.output}</span>
                  </p>
                ))}
                <p className="text-destructive mt-2 text-[10px]">
                  ⛔ icon é REJEITADO — use image/badge
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Visual Effects */}
          <Card className="border-2 border-cyan-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Zap className="w-4 h-4 text-cyan-500" />
                Visual Effects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs space-y-1 font-mono">
                <p><span className="text-cyan-500">mood</span> — dramatic, calm, danger, success</p>
                <p><span className="text-cyan-500">particles</span> — confetti, sparks, ember</p>
                <p><span className="text-cyan-500">glow</span> — Efeito de brilho</p>
                <p><span className="text-cyan-500">shake</span> — Tremor de câmera</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AUDIT GATE */}
        <Card className="border border-border/50 bg-muted/30">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🔒</span>
              <div className="text-sm">
                <p className="font-medium text-foreground mb-1">Audit Gate Protocol</p>
                <p className="text-xs text-muted-foreground font-mono mb-2">
                  Force Test → 12 runs → audit-contracts(batch_id) → HTTP 200 = PASS / HTTP 422 = BLOCKED
                </p>
                <p className="text-xs text-muted-foreground">
                  O audit gate valida: C01 (no duplicates), EXEC_STATE (0 stuck, canonical JSON), C05 (hash), C06 (triggerContract), 
                  BOUNDARY_FIX (duration &gt; 0, monotonic), C10/C10B (pause dentro de 1.5s), CONTRACT_META (version match).
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* LINKS RÁPIDOS */}
        <div className="grid gap-3 md:grid-cols-2">
          <Button
            variant="outline"
            className="w-full border-blue-500/50 hover:bg-blue-500/10"
            onClick={() => navigate('/admin/v7/docs')}
          >
            <BookOpen className="w-4 h-4 mr-2" /> Documentação V7-vv
          </Button>
          <Button
            variant="outline"
            className="w-full border-orange-500/50 hover:bg-orange-500/10"
            onClick={() => navigate('/admin/c10-report')}
          >
            <Database className="w-4 h-4 mr-2" /> C10 Report (Forensic)
          </Button>
        </div>
      </div>
    </div>
  );
}
