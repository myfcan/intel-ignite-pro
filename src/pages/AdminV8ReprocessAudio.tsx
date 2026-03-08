import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, RefreshCw, Loader2, CheckCircle, XCircle, Volume2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ReprocessResult {
  success: boolean;
  lessonId: string;
  lessonTitle: string;
  totalAudios: number;
  totalErrors: number;
  elapsedMs: number;
  results: Array<{ index: number; type: string; audioUrl: string; sizeKB: number }>;
  errors: Array<{ index: number; type: string; error: string }>;
}

export default function AdminV8ReprocessAudio() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [lessonId, setLessonId] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ReprocessResult | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = useCallback((msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  }, []);

  const handleReprocess = useCallback(async () => {
    if (!lessonId.trim()) {
      toast({ title: "❌ Informe o ID da aula", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    setResult(null);
    setLogs([]);
    addLog(`🔄 Iniciando reprocessamento: ${lessonId}`);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Não autenticado");

      addLog("📡 Chamando v8-reprocess-audio...");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/v8-reprocess-audio`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ lessonId: lessonId.trim() }),
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errText}`);
      }

      const data: ReprocessResult = await response.json();
      setResult(data);
      addLog(`✅ Concluído: ${data.totalAudios} áudios, ${data.totalErrors} erros, ${(data.elapsedMs / 1000).toFixed(1)}s`);

      toast({
        title: data.success ? "✅ Áudios reprocessados!" : "⚠️ Com erros",
        description: `${data.totalAudios} áudios gerados em ${(data.elapsedMs / 1000).toFixed(1)}s`,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      addLog(`❌ Erro: ${msg}`);
      toast({ title: "❌ Erro", description: msg, variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  }, [lessonId, toast, addLog]);

  return (
    <div className="min-h-screen bg-background p-6 max-w-4xl mx-auto">
      <button
        onClick={() => navigate("/admin")}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar ao Admin
      </button>

      <h1 className="text-2xl font-bold mb-2">🔄 Reprocessar Áudio V8</h1>
      <p className="text-muted-foreground mb-6">
        Gera áudios via ElevenLabs para aulas V8 que ficaram sem áudio por interrupção do pipeline.
      </p>

      {/* Input */}
      <div className="bg-card border border-border rounded-lg p-4 mb-6">
        <label className="block text-sm font-medium mb-2">Lesson ID</label>
        <div className="flex gap-3">
          <input
            type="text"
            value={lessonId}
            onChange={(e) => setLessonId(e.target.value)}
            placeholder="e46bfa60-f4ab-4058-87eb-cf36497e2bfe"
            className="flex-1 px-3 py-2 bg-background border border-border rounded-md text-sm font-mono"
            disabled={isProcessing}
          />
          <button
            onClick={handleReprocess}
            disabled={isProcessing || !lessonId.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium disabled:opacity-50"
          >
            {isProcessing ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Processando...</>
            ) : (
              <><RefreshCw className="w-4 h-4" /> Reprocessar</>
            )}
          </button>
        </div>
      </div>

      {/* Logs */}
      {logs.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-4 mb-6">
          <h3 className="text-sm font-medium mb-2">📋 Logs</h3>
          <div className="bg-background rounded p-3 max-h-40 overflow-y-auto font-mono text-xs space-y-1">
            {logs.map((log, i) => (
              <div key={i} className={log.includes('❌') ? 'text-destructive' : log.includes('✅') ? 'text-green-500' : 'text-muted-foreground'}>
                {log}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          <div className={`border rounded-lg p-4 ${result.success ? 'border-green-500/50 bg-green-500/5' : 'border-yellow-500/50 bg-yellow-500/5'}`}>
            <div className="flex items-center gap-2 mb-2">
              {result.success ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-yellow-500" />
              )}
              <span className="font-medium">{result.lessonTitle}</span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
              <div>🎵 {result.totalAudios} áudios</div>
              <div>❌ {result.totalErrors} erros</div>
              <div>⏱️ {(result.elapsedMs / 1000).toFixed(1)}s</div>
            </div>
          </div>

          {/* Audio list */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="text-sm font-medium mb-3">Áudios Gerados</h3>
            <div className="space-y-2">
              {result.results.map((r, i) => (
                <div key={i} className="flex items-center justify-between bg-background rounded p-2 text-sm">
                  <span className="font-mono text-muted-foreground">
                    {r.type} [{r.index}] — {r.sizeKB}KB
                  </span>
                  <button
                    onClick={() => new Audio(r.audioUrl).play()}
                    className="flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <Volume2 className="w-3 h-3" /> Ouvir
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Errors */}
          {result.errors.length > 0 && (
            <div className="bg-destructive/5 border border-destructive/30 rounded-lg p-4">
              <h3 className="text-sm font-medium text-destructive mb-2">Erros</h3>
              {result.errors.map((e, i) => (
                <div key={i} className="text-xs text-destructive font-mono">
                  {e.type} [{e.index}]: {e.error}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
