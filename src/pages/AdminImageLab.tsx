import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Loader2, Check, X, RefreshCw, Image as ImageIcon, Zap, CheckCircle2, XCircle, Circle, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { V7SceneLinker } from "@/components/admin/V7SceneLinker";

// === Processing Monitor Types ===
interface MonitorStep {
  id: string;
  label: string;
  status: 'pending' | 'running' | 'done' | 'error';
  detail?: string;
}

interface MonitorState {
  visible: boolean;
  steps: MonitorStep[];
  error: string | null;
  progress: number;
  jobId: string | null;
}

const INITIAL_MONITOR: MonitorState = {
  visible: false,
  steps: [],
  error: null,
  progress: 0,
  jobId: null,
};

const makeSteps = (provider: 'openai' | 'gemini'): MonitorStep[] => [
  { id: 'create-job', label: 'Criando Job no banco', status: 'pending' },
  { id: 'auth', label: 'Autenticando sessão', status: 'pending' },
  { id: 'call-api', label: 'Chamando image-lab-generate', status: 'pending' },
  { id: 'wait-response', label: provider === 'openai' ? 'Aguardando resposta GPT' : 'Aguardando resposta Gemini 🍌', status: 'pending' },
  { id: 'load-results', label: 'Carregando resultados', status: 'pending' },
];

// === Processing Monitor Component ===
const ProcessingMonitor = ({ monitor, onDismiss }: { monitor: MonitorState; onDismiss: () => void }) => {
  const [collapsed, setCollapsed] = useState(false);

  if (!monitor.visible) return null;

  const isDone = monitor.steps.every(s => s.status === 'done' || s.status === 'error');
  const hasError = !!monitor.error;

  const stepIcon = (status: MonitorStep['status']) => {
    switch (status) {
      case 'done': return <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />;
      case 'running': return <Loader2 className="w-4 h-4 text-cyan-500 animate-spin shrink-0" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-500 shrink-0" />;
      default: return <Circle className="w-4 h-4 text-muted-foreground/40 shrink-0" />;
    }
  };

  return (
    <Card className={cn(
      "border-2 transition-colors",
      hasError ? "border-red-500/40 bg-red-500/5" : isDone ? "border-green-500/30 bg-green-500/5" : "border-cyan-500/30 bg-cyan-500/5"
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            {hasError ? (
              <XCircle className="w-4 h-4 text-red-500" />
            ) : isDone ? (
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            ) : (
              <Loader2 className="w-4 h-4 text-cyan-500 animate-spin" />
            )}
            Monitor de Processamento
            {monitor.jobId && (
              <span className="font-mono text-[10px] text-muted-foreground ml-2">{monitor.jobId.substring(0, 8)}...</span>
            )}
          </CardTitle>
          <div className="flex items-center gap-1">
            <Badge variant={hasError ? "destructive" : isDone ? "success" : "secondary"} className="text-[10px]">
              {hasError ? 'Erro' : isDone ? 'Concluído' : `${monitor.progress}%`}
            </Badge>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setCollapsed(!collapsed)}>
              {collapsed ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
            </Button>
            {isDone && (
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onDismiss}>
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>
        <Progress 
          value={monitor.progress} 
          className={cn("h-1.5 mt-1", hasError && "[&>div]:bg-red-500", !hasError && isDone && "[&>div]:bg-green-500")}
        />
      </CardHeader>
      {!collapsed && (
        <CardContent className="pt-2 space-y-3">
          {/* Steps */}
          <div className="space-y-1.5">
            {monitor.steps.map(step => (
              <div key={step.id} className={cn(
                "flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors",
                step.status === 'running' && "bg-cyan-500/10",
                step.status === 'done' && "bg-green-500/5",
                step.status === 'error' && "bg-red-500/10",
              )}>
                {stepIcon(step.status)}
                <span className={cn(step.status === 'pending' && "text-muted-foreground/60")}>
                  {step.label}
                </span>
                {step.detail && (
                  <span className="ml-auto text-[10px] text-muted-foreground font-mono">{step.detail}</span>
                )}
              </div>
            ))}
          </div>

          {/* Error Panel */}
          {hasError && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-red-500">Erro no Processamento</p>
                  <p className="text-[11px] mt-1 text-red-400 font-mono break-all">{monitor.error}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};
interface Preset {
  id: string;
  key: string;
  version: string;
  title: string;
  default_size: string;
}

interface JobRow {
  id: string;
  status: string;
  preset_key: string;
  preset_version: string;
  provider: string;
  model: string;
  size: string;
  prompt_scene: string;
  prompt_final: string | null;
  hash: string | null;
  cache_hit: boolean;
  latency_ms: number | null;
  error_message: string | null;
  created_at: string;
  approved_asset_id: string | null;
}

interface AssetRow {
  id: string;
  job_id: string;
  attempt_id: string;
  status: string;
  public_url: string | null;
  storage_path: string;
  width: number;
  height: number;
  created_at: string;
  hash: string | null;
}

interface AttemptRow {
  id: string;
  provider: string;
  model: string;
  latency_ms: number | null;
  bytes_out: number | null;
  status: string;
}

const SIZE_OPTIONS = [
  { label: "16:9 (Landscape)", value: "1536x1024" },
  { label: "1:1 (Square)", value: "1024x1024" },
  { label: "9:16 (Portrait)", value: "1024x1536" },
];

// === V7 Aula 1 — Scene Blocks Data ===
interface SceneBlock {
  id: string;
  number: number;
  title: string;
  emoji: string;
  type: string;
  mood: 'danger' | 'warning' | 'success' | 'neutral';
  description: string;
  prompt: string;
  style: string;
}

const V7_SCENE_BLOCKS: SceneBlock[] = [
  {
    id: 'scene-1-dramatic',
    number: 1,
    title: 'Entrada Dramática',
    emoji: '🎭',
    type: 'dramatic',
    mood: 'danger',
    description: '98% das pessoas usam IA como brinquedo. Número gigante surge na tela preta com efeito de impacto.',
    prompt: 'Dark cinematic scene, giant glowing red number "98%" floating in black void, dramatic lighting from below, digital particles disintegrating around the number, moody atmosphere, a silhouette of a person looking up at the number in awe, ultra high quality, movie poster composition',
    style: 'dark cinematic, red glow, dramatic lighting, high contrast',
  },
  {
    id: 'scene-2-comparison',
    number: 2,
    title: 'Comparação 98% vs 2%',
    emoji: '⚖️',
    type: 'split-screen',
    mood: 'warning',
    description: 'Split screen: lado esquerdo com pessoa brincando com IA (R$0), lado direito com profissional faturando (R$30.000/mês).',
    prompt: 'Split screen composition: left side shows casual person on couch laughing at phone screen with toy emojis floating around (dull gray tones), right side shows focused professional at modern desk with multiple screens showing data and money symbols (golden warm tones), dramatic dividing line between both sides, cinematic lighting',
    style: 'split composition, contrast warm vs cold, cinematic',
  },
  {
    id: 'scene-3-quiz',
    number: 3,
    title: 'Autoavaliação',
    emoji: '🎯',
    type: 'quiz',
    mood: 'danger',
    description: 'Momento de autoavaliação: "Suas últimas 5 interações com IA foram para quê?" — reflexão profunda.',
    prompt: 'Person sitting alone in dark room illuminated by phone screen, mirror reflection showing two versions - one playing with AI casually, another using it professionally, introspective mood, blue and amber lighting, cinematic depth of field, emotional portrait',
    style: 'introspective, dual lighting, emotional portrait',
  },
  {
    id: 'scene-4-secret',
    number: 4,
    title: 'O Segredo dos 2%',
    emoji: '🔐',
    type: 'secret-reveal',
    mood: 'success',
    description: 'Revelação do segredo: "Os 2% que sabem usar IA de verdade se tornam 10X mais inteligentes".',
    prompt: 'Mysterious vault door opening with brilliant golden light streaming out, silhouette of person stepping through the light, particles and sparkles in the air, text "2%" glowing ethereally, treasure-like atmosphere but modern and technological, cinematic wide shot',
    style: 'golden light, mysterious, revelation, cinematic',
  },
  {
    id: 'scene-5-perfeito',
    number: 5,
    title: 'Método PERFEITO',
    emoji: '✨',
    type: 'revelation',
    mood: 'success',
    description: 'As 8 letras P-E-R-F-E-I-T-O sendo reveladas verticalmente, cada uma representando um pilar.',
    prompt: 'Eight glowing golden letters "PERFEITO" arranged vertically like a monolith, each letter emanating a different colored light representing a pillar of knowledge, futuristic holographic style, dark background with subtle matrix-like data streams, heroic and empowering atmosphere, ultra detailed 3D typography',
    style: 'holographic, golden typography, futuristic, empowering',
  },
  {
    id: 'scene-6-playground',
    number: 6,
    title: 'Desafio dos R$500',
    emoji: '🎮',
    type: 'playground',
    mood: 'success',
    description: 'Desafio prático: comparação entre prompt amador (R$0) e profissional (R$500) para posts de moda.',
    prompt: 'Two screens side by side on modern desk: left screen shows generic boring social media post (gray, flat), right screen shows stunning luxury fashion post with beautiful typography and imagery (vibrant, premium). A hand pointing from left to right with visible "R$500" floating above the professional result, warm studio lighting',
    style: 'comparison, premium vs generic, warm studio light',
  },
  {
    id: 'scene-7-roadmap',
    number: 7,
    title: 'Revelação & Roadmap',
    emoji: '🗺️',
    type: 'revelation',
    mood: 'success',
    description: 'Cards dos próximos módulos: ChatGPT, Claude, Gemini, Perplexity, Grok — cada IA com personalidade.',
    prompt: 'Futuristic command center with 5 holographic cards floating in arc formation, each card showing a different AI personality: a chameleon (ChatGPT), a professor with glasses (Claude), a detective with magnifying glass (Gemini/Perplexity), a jester (Grok). Neon blue and purple lighting, cinematic wide angle, control room atmosphere',
    style: 'holographic cards, neon, futuristic command center',
  },
  {
    id: 'scene-8-cta',
    number: 8,
    title: 'Call to Action Final',
    emoji: '🚀',
    type: 'result',
    mood: 'neutral',
    description: 'Dois caminhos: "Continuar nos 98%" (porta escura) vs "Entrar nos 2%" (porta iluminada). Escolha do destino.',
    prompt: 'Fork in the road: left path leads to a dark mundane door with "98%" fading above it (gray, depressing), right path leads to a brilliant glowing portal with "2%" shining above it (golden, inspiring). Person standing at the crossroads from behind, dramatic lighting, cinematic composition, motivational atmosphere',
    style: 'fork in road, dramatic contrast, motivational, cinematic',
  },
];

// === PARTE 3: Hook to get signed URLs on-demand ===
const useSignedUrl = (storagePath: string | null) => {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!storagePath) return;
    let cancelled = false;

    const fetchUrl = async () => {
      const { data, error } = await supabase.storage
        .from("image-lab")
        .createSignedUrl(storagePath, 3600);
      if (!cancelled && !error && data?.signedUrl) {
        setUrl(data.signedUrl);
      }
    };
    fetchUrl();

    return () => { cancelled = true; };
  }, [storagePath]);

  return url;
};

// Signed image component
const SignedImage = ({ storagePath, alt }: { storagePath: string | null; alt: string }) => {
  const url = useSignedUrl(storagePath);

  if (!url) {
    return (
      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return <img src={url} alt={alt} className="w-full h-full object-cover" />;
};

const AdminImageLab = () => {
  const navigate = useNavigate();
  const [presets, setPresets] = useState<Preset[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState("");
  const [size, setSize] = useState("1536x1024");
  const [promptScene, setPromptScene] = useState("");
  const [styleHints, setStyleHints] = useState("");
  const [generating, setGenerating] = useState(false);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [currentAssets, setCurrentAssets] = useState<AssetRow[]>([]);
  const [currentAttempts, setCurrentAttempts] = useState<AttemptRow[]>([]);
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [kpis, setKpis] = useState<any>(null);

  useEffect(() => {
    loadPresets();
    loadJobs();
    loadKpis();
  }, []);

  const loadPresets = async () => {
    const { data } = await supabase.from("image_presets").select("*").eq("is_active", true) as any;
    if (data?.length) {
      setPresets(data);
      setSelectedPresetId(data[0].id);
    }
  };

  const loadJobs = async () => {
    const { data } = await supabase
      .from("image_jobs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50) as any;
    if (data) setJobs(data);
  };

  const loadKpis = async () => {
    const { data } = await supabase.from("image_lab_kpis_last_7d").select("*").single() as any;
    if (data) setKpis(data);
  };

  const loadAssetsForJob = async (jobId: string) => {
    const [assetsRes, attemptsRes] = await Promise.all([
      supabase.from("image_assets").select("*").eq("job_id", jobId).order("created_at", { ascending: true }) as any,
      supabase.from("image_attempts").select("*").eq("job_id", jobId).order("created_at", { ascending: true }) as any,
    ]);
    setCurrentAssets(assetsRes.data || []);
    setCurrentAttempts(attemptsRes.data || []);
  };

  // Monitor state
  const [monitor, setMonitor] = useState<MonitorState>(INITIAL_MONITOR);

  const updateStep = (stepId: string, status: MonitorStep['status'], detail?: string) => {
    setMonitor(prev => ({
      ...prev,
      steps: prev.steps.map(s => s.id === stepId ? { ...s, status, detail } : s),
    }));
  };

  const setMonitorProgress = (value: number) => {
    setMonitor(prev => ({ ...prev, progress: value }));
  };

  const createAndGenerate = async (provider: "openai" | "gemini") => {
    if (!promptScene.trim()) {
      toast.error("Descreva a cena (prompt_scene)");
      return;
    }
    if (!selectedPresetId) {
      toast.error("Selecione um preset");
      return;
    }

    // Initialize monitor
    setMonitor({
      visible: true,
      steps: makeSteps(provider),
      error: null,
      progress: 0,
      jobId: null,
    });

    setGenerating(true);
    setCurrentAssets([]);
    setCurrentAttempts([]);

    try {
      // Step 1: Create job
      updateStep('create-job', 'running');
      setMonitorProgress(10);
      
      const preset = presets.find((p) => p.id === selectedPresetId);
      const { data: job, error: jobError } = await supabase.from("image_jobs").insert({
        preset_id: selectedPresetId,
        preset_key: preset?.key,
        preset_version: preset?.version,
        prompt_scene: promptScene,
        size,
        metadata: styleHints ? { style_hints: styleHints } : {},
        status: "queued",
      } as any).select().single() as any;

      if (jobError) throw jobError;

      setCurrentJobId(job.id);
      setMonitor(prev => ({ ...prev, jobId: job.id }));
      updateStep('create-job', 'done', job.id.substring(0, 8));
      setMonitorProgress(25);

      // Step 2: Auth
      updateStep('auth', 'running');
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error("Sessão não encontrada. Faça login novamente.");
      updateStep('auth', 'done');
      setMonitorProgress(35);

      // Step 3: Call API
      updateStep('call-api', 'running');
      setMonitorProgress(40);

      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/image-lab-generate`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ job_id: job.id, provider, n: 1, size }),
        }
      );
      
      updateStep('call-api', 'done');
      setMonitorProgress(60);

      // Step 4: Parse response
      updateStep('wait-response', 'running');
      const result = await resp.json();
      
      if (!result.ok) {
        updateStep('wait-response', 'error', result.error_code || 'FAILED');
        throw new Error(result.error_message || "Generation failed");
      }
      
      updateStep('wait-response', 'done', result.cache_hit ? 'cache hit' : `${result.job?.latency_ms}ms`);
      setMonitorProgress(80);

      const providerLabel = provider === 'openai' ? 'GPT' : 'Gemini 🍌';
      toast.success(
        result.cache_hit
          ? "Cache hit! Imagem retornada do cache."
          : `${providerLabel}: Imagem gerada em ${result.job?.latency_ms}ms`
      );

      // Step 5: Load results
      updateStep('load-results', 'running');
      setMonitorProgress(90);
      
      await loadAssetsForJob(job.id);
      await loadJobs();
      await loadKpis();
      
      updateStep('load-results', 'done');
      setMonitorProgress(100);

    } catch (err: any) {
      const errorMsg = err.message || "Erro desconhecido";
      setMonitor(prev => ({ ...prev, error: errorMsg, progress: prev.progress }));
      
      // Mark any running step as error
      setMonitor(prev => ({
        ...prev,
        steps: prev.steps.map(s => s.status === 'running' ? { ...s, status: 'error' as const } : s),
      }));
      
      toast.error(errorMsg);
      console.error("[ImageLab]", err);
    } finally {
      setGenerating(false);
    }
  };

  const approveAsset = async (assetId: string, jobId: string) => {
    await (supabase.from("image_assets").update({ status: "approved" } as any).eq("id", assetId) as any);
    await (supabase.from("image_assets").update({ status: "rejected" } as any).eq("job_id", jobId).neq("id", assetId).neq("status", "approved") as any);
    await (supabase.from("image_jobs").update({ status: "approved", approved_asset_id: assetId } as any).eq("id", jobId) as any);

    toast.success("Asset aprovado ✓");
    await loadAssetsForJob(jobId);
    await loadJobs();
    await loadKpis();
  };

  const rejectAsset = async (assetId: string, jobId: string) => {
    await (supabase.from("image_assets").update({ status: "rejected" } as any).eq("id", assetId) as any);
    toast.info("Asset rejeitado");
    await loadAssetsForJob(jobId);
  };

  const retryJob = async (jobId: string) => {
    await (supabase.from("image_jobs").update({ status: "queued" } as any).eq("id", jobId) as any);
    const { data: { session } } = await supabase.auth.getSession();
    setGenerating(true);
    try {
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/image-lab-generate`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ job_id: jobId, provider: jobs.find(j => j.id === jobId)?.provider || "openai", n: 1, size }),
        }
      );
      const result = await resp.json();
      if (result.ok) toast.success("Retry concluído");
      else toast.error(result.error_message);
      await loadAssetsForJob(jobId);
      await loadJobs();
    } finally {
      setGenerating(false);
    }
  };

  const statusColor = (s: string) => {
    switch (s) {
      case "approved": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "completed": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "failed": return "bg-red-500/20 text-red-400 border-red-500/30";
      case "rejected": return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "processing": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-primary" />
            AI Image Lab
          </h1>
          <p className="text-sm text-muted-foreground">Geração isolada • OpenAI + Gemini • Sem integração com Pipeline</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Panel */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Gerar Imagem</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Preset</label>
                <select
                  value={selectedPresetId}
                  onChange={(e) => setSelectedPresetId(e.target.value)}
                  className="w-full h-11 rounded-xl border-2 border-input bg-background px-4 text-sm"
                >
                  {presets.map((p) => (
                    <option key={p.id} value={p.id}>{p.title} ({p.key}@{p.version})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Size</label>
                <select
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  className="w-full h-11 rounded-xl border-2 border-input bg-background px-4 text-sm"
                >
                  {SIZE_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Cena (prompt_scene) *</label>
              <Textarea
                value={promptScene}
                onChange={(e) => setPromptScene(e.target.value)}
                placeholder="Homem adulto olhando para tela iluminada com expressão de descoberta"
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Style Hints (opcional)</label>
              <Input
                value={styleHints}
                onChange={(e) => setStyleHints(e.target.value)}
                placeholder="warm tones, moody atmosphere"
              />
            </div>

            <div className="flex gap-3">
              <Button onClick={() => createAndGenerate("openai")} disabled={generating}>
                {generating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
                Generate (GPT)
              </Button>
              <Button variant="outline" onClick={() => createAndGenerate("gemini")} disabled={generating}>
                {generating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ImageIcon className="w-4 h-4 mr-2" />}
                Generate (Gemini 🍌)
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* KPIs Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">KPIs (7 dias)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {kpis ? (
              <>
                <KpiRow label="Total Jobs" value={kpis.total_jobs} />
                <KpiRow label="Total Attempts" value={kpis.total_attempts} />
                <KpiRow label="First-Pass Accept" value={`${kpis.first_pass_accept_rate}%`} />
                <KpiRow label="Avg Attempts/Approved" value={kpis.avg_attempts_per_approved} />
                <KpiRow label="Fail Rate OpenAI" value={`${kpis.fail_rate_openai}%`} />
                <KpiRow label="Fail Rate Gemini" value={`${kpis.fail_rate_gemini}%`} />
                <KpiRow label="Avg Latency OAI" value={`${kpis.avg_latency_openai}ms`} />
                <KpiRow label="Avg Latency Gemini" value={`${kpis.avg_latency_gemini}ms`} />
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Carregando...</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* === V7 Aula 1 — Scene Blocks === */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            🎬 Aula 1 — Cenas para Geração
            <Badge variant="secondary" className="text-[10px]">V7 • Fim da Brincadeira</Badge>
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1">Clique em uma cena para preencher o prompt automaticamente e gerar imagens.</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {V7_SCENE_BLOCKS.map((scene) => (
              <div
                key={scene.id}
                className={cn(
                  "border-2 rounded-xl p-4 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg",
                  scene.mood === 'danger' && "border-red-500/30 hover:border-red-500/60 bg-red-500/5",
                  scene.mood === 'warning' && "border-amber-500/30 hover:border-amber-500/60 bg-amber-500/5",
                  scene.mood === 'success' && "border-green-500/30 hover:border-green-500/60 bg-green-500/5",
                  scene.mood === 'neutral' && "border-primary/30 hover:border-primary/60 bg-primary/5",
                )}
                onClick={() => {
                  setPromptScene(scene.prompt);
                  setStyleHints(scene.style);
                  toast.info(`Cena "${scene.title}" carregada! Ajuste e clique em Generate.`);
                }}
              >
                <div className="flex items-start gap-2 mb-2">
                  <span className="text-2xl">{scene.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[9px] shrink-0">Cena {scene.number}</Badge>
                      <Badge className={cn(
                        "text-[9px]",
                        scene.mood === 'danger' && "bg-red-500/20 text-red-400",
                        scene.mood === 'warning' && "bg-amber-500/20 text-amber-400",
                        scene.mood === 'success' && "bg-green-500/20 text-green-400",
                        scene.mood === 'neutral' && "bg-primary/20 text-primary",
                      )}>{scene.type}</Badge>
                    </div>
                    <h4 className="text-sm font-semibold mt-1 text-foreground">{scene.title}</h4>
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-3">{scene.description}</p>
                <div className="mt-3 pt-2 border-t border-border/50">
                  <p className="text-[10px] text-muted-foreground/70 italic line-clamp-2">🎨 {scene.prompt}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* === Fase 5: Vincular Assets a Cenas V7 === */}
      <V7SceneLinker />

      {/* Processing Monitor */}
      <ProcessingMonitor monitor={monitor} onDismiss={() => setMonitor(INITIAL_MONITOR)} />

      {/* Results Grid — PARTE 3: Uses SignedImage component */}
      {currentAssets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Resultados do Job Atual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {currentAssets.map((asset) => {
                const attempt = currentAttempts.find((a) => a.id === asset.attempt_id);
                return (
                  <div key={asset.id} className="border rounded-lg overflow-hidden bg-card">
                    <div className="aspect-square bg-muted relative">
                      <SignedImage storagePath={asset.storage_path} alt="Generated" />
                    </div>
                    <div className="p-2 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-muted-foreground">{attempt?.provider || "?"}</span>
                        <Badge className={`text-[10px] ${statusColor(asset.status)}`}>{asset.status}</Badge>
                      </div>
                      {attempt?.latency_ms && (
                        <p className="text-xs text-muted-foreground">
                          {attempt.latency_ms}ms
                          {attempt.bytes_out ? ` • ${Math.round(attempt.bytes_out / 1024)}KB` : ""}
                        </p>
                      )}
                      {asset.status === "completed" && (
                        <div className="flex gap-1 pt-1">
                          <Button size="sm" variant="ghost" className="h-7 text-xs text-green-400" onClick={() => approveAsset(asset.id, asset.job_id)}>
                            <Check className="w-3 h-3 mr-1" /> Approve
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 text-xs text-red-400" onClick={() => rejectAsset(asset.id, asset.job_id)}>
                            <X className="w-3 h-3 mr-1" /> Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Job History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Histórico de Jobs (últimos 50)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="text-left py-2 px-2">Status</th>
                  <th className="text-left py-2 px-2">Preset</th>
                  <th className="text-left py-2 px-2">Provider</th>
                  <th className="text-left py-2 px-2">Size</th>
                  <th className="text-left py-2 px-2">Latency</th>
                  <th className="text-left py-2 px-2">Cache</th>
                  <th className="text-left py-2 px-2">Scene</th>
                  <th className="text-left py-2 px-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id} className="border-b border-border/50 hover:bg-muted/30 cursor-pointer" onClick={() => {
                    setCurrentJobId(job.id);
                    loadAssetsForJob(job.id);
                  }}>
                    <td className="py-2 px-2">
                      <Badge className={`text-[10px] ${statusColor(job.status)}`}>{job.status}</Badge>
                    </td>
                    <td className="py-2 px-2 font-mono text-xs">{job.preset_key}@{job.preset_version}</td>
                    <td className="py-2 px-2 text-xs">{job.provider}</td>
                    <td className="py-2 px-2 text-xs">{job.size}</td>
                    <td className="py-2 px-2 text-xs">{job.latency_ms ? `${job.latency_ms}ms` : "-"}</td>
                    <td className="py-2 px-2 text-xs">{job.cache_hit ? "✓" : "-"}</td>
                    <td className="py-2 px-2 text-xs max-w-[200px] truncate">{job.prompt_scene}</td>
                    <td className="py-2 px-2">
                      {["failed", "rejected"].includes(job.status) && (
                        <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={(e) => { e.stopPropagation(); retryJob(job.id); }}>
                          <RefreshCw className="w-3 h-3 mr-1" /> Retry
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
                {jobs.length === 0 && (
                  <tr><td colSpan={8} className="text-center py-8 text-muted-foreground">Nenhum job ainda</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const KpiRow = ({ label, value }: { label: string; value: any }) => (
  <div className="flex justify-between items-center">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className="text-sm font-mono font-bold text-foreground">{value}</span>
  </div>
);

export default AdminImageLab;
