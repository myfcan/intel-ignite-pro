import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, Check, X, RefreshCw, Image as ImageIcon, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

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

  const createAndGenerate = async (mode: "single" | "batch") => {
    if (!promptScene.trim()) {
      toast.error("Descreva a cena (prompt_scene)");
      return;
    }
    if (!selectedPresetId) {
      toast.error("Selecione um preset");
      return;
    }

    setGenerating(true);
    setCurrentAssets([]);
    setCurrentAttempts([]);

    try {
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
      toast.info("Job criado. Gerando imagem...");

      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (mode === "single") {
        const resp = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/image-lab-generate`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ job_id: job.id, provider: "openai", n: 1, size }),
          }
        );
        const result = await resp.json();
        if (!result.ok) throw new Error(result.error_message || "Generation failed");

        toast.success(
          result.cache_hit
            ? "Cache hit! Imagem retornada do cache."
            : `Imagem gerada em ${result.job?.latency_ms}ms`
        );
      } else {
        const resp = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/image-lab-generate-batch`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              job_id: job.id,
              plan: [
                { provider: "openai", n: 2 },
                { provider: "gemini", n: 2 },
              ],
              size,
            }),
          }
        );
        const result = await resp.json();
        if (!result.ok && result.total_generated === 0) throw new Error(result.error_message || "Batch failed");

        toast.success(`${result.total_generated} imagens geradas (${result.latency_ms}ms). ${result.total_failed || 0} falhas.`);
      }

      await loadAssetsForJob(job.id);
      await loadJobs();
      await loadKpis();
    } catch (err: any) {
      toast.error(err.message || "Erro ao gerar");
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
          body: JSON.stringify({ job_id: jobId, provider: "openai", n: 1, size }),
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
              <Button onClick={() => createAndGenerate("single")} disabled={generating}>
                {generating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
                Generate 1 (OpenAI)
              </Button>
              <Button variant="outline" onClick={() => createAndGenerate("batch")} disabled={generating}>
                {generating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ImageIcon className="w-4 h-4 mr-2" />}
                Generate 4 (2 OAI + 2 Gemini)
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
