import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Loader2, Check, X, RefreshCw, Image as ImageIcon, Zap, CheckCircle2, XCircle, Circle, AlertTriangle, ChevronDown, ChevronUp, Shield, Activity } from "lucide-react";
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
  error_code?: string | null;
}

const SIZE_OPTIONS = [
  { label: "16:9 (Landscape)", value: "1536x1024" },
  { label: "1:1 (Square)", value: "1024x1024" },
  { label: "9:16 (Portrait)", value: "1024x1536" },
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
  const [testingFault, setTestingFault] = useState<string | null>(null);

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

  const createAndGenerate = async (provider: "openai" | "gemini", faultHeader?: string) => {
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

      const headers: Record<string, string> = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };
      // C12.1.x: Add fault injection header if provided
      if (faultHeader) {
        headers["x-image-lab-fault"] = faultHeader;
      }

      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/image-lab-generate`,
        {
          method: "POST",
          headers,
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
      
      if (faultHeader) {
        toast.success(`Fault injection test completed: fallback_used=${result.fallback_used}, provider=${result.job?.provider}`);
      } else {
        toast.success(
          result.cache_hit
            ? "Cache hit! Imagem retornada do cache."
            : `${providerLabel}: Imagem gerada em ${result.job?.latency_ms}ms`
        );
      }

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
      setTestingFault(null);
    }
  };

  // === C12.1.x: Fault Injection Test Handlers ===
  const testFallback = async () => {
    setTestingFault("openai_timeout");
    if (!promptScene.trim()) {
      setPromptScene("Test scene for fallback validation - cinematic landscape");
    }
    toast.info("🧪 Testing OpenAI→Gemini Fallback (fault injection: openai_timeout)");
    await createAndGenerate("openai", "openai_timeout");
  };

  const testDegraded = async () => {
    setTestingFault("both_fail");
    toast.info("🧪 Testing Degraded Mode (fault injection: both_fail)");
    
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) {
      toast.error("Sessão não encontrada");
      setTestingFault(null);
      return;
    }

    try {
      // Call pipeline bridge directly to test degraded mode
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/image-lab-pipeline-bridge`,
        {
          method: "POST",
          headers: {
            // Bridge requires service_role_key — we call via edge function proxy approach
            // For testing, we use the admin's own token to call generate with both_fail
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "x-image-lab-fault": "both_fail",
          },
          body: JSON.stringify({
            job_id: "test-degraded",
            provider: "openai",
            n: 1,
            size: "1024x1024",
          }),
        }
      );

      const result = await resp.json();
      
      if (resp.status === 403 || resp.status === 401) {
        // Bridge requires service_role, so test via generate instead
        if (!promptScene.trim()) {
          setPromptScene("Test scene for degraded mode validation");
        }
        
        // Create a job and test with both_fail through image-lab-generate
        const preset = presets[0];
        if (!preset) {
          toast.error("Nenhum preset disponível");
          setTestingFault(null);
          return;
        }
        
        const { data: job } = await supabase.from("image_jobs").insert({
          preset_id: preset.id,
          preset_key: preset.key,
          preset_version: preset.version,
          prompt_scene: promptScene || "Test degraded mode",
          size: "1024x1024",
          metadata: {},
          status: "queued",
        } as any).select().single() as any;

        if (!job) {
          toast.error("Falha ao criar job de teste");
          setTestingFault(null);
          return;
        }

        const genResp = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/image-lab-generate`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
              "x-image-lab-fault": "both_fail",
            },
            body: JSON.stringify({ job_id: job.id, provider: "openai", n: 1, size: "1024x1024" }),
          }
        );

        const genResult = await genResp.json();
        
        if (!genResult.ok) {
          // Expected: all providers failed → job failed
          toast.success("✅ Degraded mode validated — all providers failed as expected (both_fail simulation)");
          
          // Verify circuit_state was NOT modified
          const { data: circuits } = await supabase.from("image_lab_circuit_state").select("*") as any;
          const allClosed = circuits?.every((c: any) => c.state === "CLOSED");
          if (allClosed) {
            toast.success("✅ Circuit state intact — CLOSED (fault injection did NOT alter circuit)");
          } else {
            toast.warning("⚠️ Circuit state may have changed — check manually");
          }
        } else {
          toast.warning("Unexpected: generation succeeded despite both_fail injection");
        }

        await loadJobs();
        await loadKpis();
      } else {
        // Direct bridge response
        if (result.degraded_mode || result.degraded > 0) {
          toast.success("✅ Degraded mode validated — bridge returned HTTP 200 with degraded placeholder");
        } else {
          toast.info(`Bridge response: ${JSON.stringify(result).substring(0, 200)}`);
        }
      }
    } catch (err: any) {
      toast.error(`Degraded test error: ${err.message}`);
    } finally {
      setTestingFault(null);
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
          <p className="text-sm text-muted-foreground">Geração isolada • OpenAI + Gemini • Integrado com Pipeline V7 e V5</p>
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

            {/* === C13.1: Quick Templates (EPP) === */}
            <div className="border-t pt-4 mt-2">
              <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Quick Templates (EPP)</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  className="text-left border-2 border-primary/20 hover:border-primary/50 rounded-xl p-3 transition-colors bg-primary/5 hover:bg-primary/10"
                  onClick={() => {
                    const eppResult = presets.find(p => p.key === 'epp-result-01');
                    if (eppResult) {
                      setSelectedPresetId(eppResult.id);
                      setSize(eppResult.default_size);
                    }
                    setStyleHints('warm editorial, 85mm, clean copy zone, no text');
                    toast.success('Template EPP Result selecionado — preencha a cena (prompt_scene)');
                  }}
                >
                  <p className="text-sm font-semibold text-foreground">📸 EPP Result (Overlay Copy Safe)</p>
                  <p className="text-[11px] text-muted-foreground mt-1">Hero image com clean copy zone ~35%. Sem texto na imagem.</p>
                </button>
                <button
                  type="button"
                  className="text-left border-2 border-amber-500/20 hover:border-amber-500/50 rounded-xl p-3 transition-colors bg-amber-500/5 hover:bg-amber-500/10"
                  onClick={() => {
                    const eppCompare = presets.find(p => p.key === 'epp-compare-01');
                    if (eppCompare) {
                      setSelectedPresetId(eppCompare.id);
                      setSize(eppCompare.default_size);
                    }
                    setStyleHints('frontal orthographic, 85mm, split screen, no text');
                    toast.success('Template EPP Compare selecionado — preencha a cena (prompt_scene)');
                  }}
                >
                  <p className="text-sm font-semibold text-foreground">⚖️ EPP Compare (Frontal)</p>
                  <p className="text-[11px] text-muted-foreground mt-1">Split-screen antes vs depois. Frontal 85mm, zero keystone.</p>
                </button>
              </div>
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

      {/* === C12.1.x Fault Injection Testing Panel === */}
      <Card className="border-2 border-amber-500/30 bg-amber-500/5">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-500" />
            C12.1.x — Fault Injection Tests
            <Badge variant="outline" className="text-[10px] border-amber-500/50 text-amber-500">Admin Only</Badge>
          </CardTitle>
          <p className="text-xs text-muted-foreground">Testes controlados sem impacto em produção. Circuit state NÃO é alterado.</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Test Fallback */}
            <div className="border rounded-xl p-4 space-y-3 bg-background">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-500" />
                <h4 className="text-sm font-semibold">Test OpenAI→Gemini Fallback</h4>
              </div>
              <p className="text-xs text-muted-foreground">
                Simula SLO_TIMEOUT no OpenAI. Esperado: attempt 1 falha (SLO_TIMEOUT), fallback para Gemini gera imagem.
              </p>
              <div className="text-[10px] font-mono text-muted-foreground space-y-0.5">
                <p>• Header: x-image-lab-fault: openai_timeout</p>
                <p>• Esperado: 2+ attempts, fallback_used=true</p>
                <p>• Circuit state: NÃO alterado</p>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full border-blue-500/30 text-blue-500 hover:bg-blue-500/10"
                onClick={testFallback}
                disabled={generating || !!testingFault}
              >
                {testingFault === "openai_timeout" ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Zap className="w-4 h-4 mr-2" />
                )}
                Test Fallback (no risk)
              </Button>
            </div>

            {/* Test Degraded */}
            <div className="border rounded-xl p-4 space-y-3 bg-background">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                <h4 className="text-sm font-semibold">Test Degraded Mode</h4>
              </div>
              <p className="text-xs text-muted-foreground">
                Simula falha total (OpenAI + Gemini). Esperado: job=failed, degraded_mode=true.
              </p>
              <div className="text-[10px] font-mono text-muted-foreground space-y-0.5">
                <p>• Header: x-image-lab-fault: both_fail</p>
                <p>• Esperado: todos attempts falhados</p>
                <p>• Circuit state: NÃO alterado</p>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full border-orange-500/30 text-orange-500 hover:bg-orange-500/10"
                onClick={testDegraded}
                disabled={generating || !!testingFault}
              >
                {testingFault === "both_fail" ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <AlertTriangle className="w-4 h-4 mr-2" />
                )}
                Test Degraded (no risk)
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>


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

      {/* Fase 5: Vincular Assets a Cenas V7 */}
      <V7SceneLinker />
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
