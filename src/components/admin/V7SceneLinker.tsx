import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Link2, Unlink, Check, Image as ImageIcon, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useSignedUrl } from "@/hooks/useSignedUrl";

const SmallSignedImage = ({ storagePath, className }: { storagePath: string; className?: string }) => {
  const url = useSignedUrl(storagePath);
  if (!url) return <div className={cn("bg-muted flex items-center justify-center", className)}><Loader2 className="w-4 h-4 animate-spin" /></div>;
  return <img src={url} alt="Asset" className={cn("object-cover", className)} />;
};

interface V7Lesson {
  id: string;
  title: string;
  status: string | null;
  created_at: string | null;
}

interface MicroVisualScene {
  actIndex: number;
  phaseIndex: number;
  mvIndex: number;
  mvId: string;
  anchorText: string;
  type: string;
  description?: string;
  storagePath?: string;
  assetId?: string;
  imageUrl?: string;
}

interface ApprovedAsset {
  id: string;
  job_id: string;
  storage_path: string;
  width: number;
  height: number;
  prompt_scene: string;
  preset_key: string | null;
}

export const V7SceneLinker = () => {
  const [collapsed, setCollapsed] = useState(true);
  const [lessons, setLessons] = useState<V7Lesson[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<string>("");
  const [lessonContent, setLessonContent] = useState<any>(null);
  const [scenes, setScenes] = useState<MicroVisualScene[]>([]);
  const [approvedAssets, setApprovedAssets] = useState<ApprovedAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [linkingScene, setLinkingScene] = useState<string | null>(null);

  // Load V7 lessons
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("lessons")
        .select("id, title, status, created_at")
        .eq("model", "v7")
        .order("created_at", { ascending: false })
        .limit(50);
      if (data) setLessons(data as V7Lesson[]);
    };
    load();
  }, []);

  // Load approved assets
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("image_jobs")
        .select("id, approved_asset_id, prompt_scene, preset_key")
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(100) as any;

      if (!data?.length) return;

      const assetIds = data.map((j: any) => j.approved_asset_id).filter(Boolean);
      if (!assetIds.length) return;

      const { data: assets } = await supabase
        .from("image_assets")
        .select("id, job_id, storage_path, width, height")
        .in("id", assetIds) as any;

      if (assets) {
        const merged = assets.map((a: any) => {
          const job = data.find((j: any) => j.approved_asset_id === a.id);
          return { ...a, prompt_scene: job?.prompt_scene || "", preset_key: job?.preset_key || null };
        });
        setApprovedAssets(merged);
      }
    };
    load();
  }, []);

  // Extract image microVisuals from lesson content
  const extractScenes = useCallback((content: any): MicroVisualScene[] => {
    const result: MicroVisualScene[] = [];
    if (!content?.acts) return result;

    content.acts.forEach((act: any, actIndex: number) => {
      if (!act.phases) return;
      act.phases.forEach((phase: any, phaseIndex: number) => {
        if (!phase.microVisuals) return;
        phase.microVisuals.forEach((mv: any, mvIndex: number) => {
          if (mv.type === "image-flash" || mv.type === "image") {
            result.push({
              actIndex,
              phaseIndex,
              mvIndex,
              mvId: mv.id,
              anchorText: mv.anchorText || "",
              type: mv.type,
              description: mv.content?.description || mv.content?.promptScene || "",
              storagePath: mv.content?.storagePath || undefined,
              assetId: mv.content?.assetId || undefined,
              imageUrl: mv.content?.imageUrl || mv.content?.url || undefined,
            });
          }
        });
      });
    });
    return result;
  }, []);

  // Load lesson content when selected
  const loadLesson = async (lessonId: string) => {
    setSelectedLessonId(lessonId);
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("lessons")
        .select("content")
        .eq("id", lessonId)
        .single();
      if (error) throw error;
      const content = data?.content as any;
      setLessonContent(content);
      setScenes(extractScenes(content));
    } catch (err: any) {
      toast.error("Erro ao carregar lição: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Link asset to scene
  const linkAsset = async (scene: MicroVisualScene, asset: ApprovedAsset) => {
    if (!lessonContent || !selectedLessonId) return;
    setSaving(true);
    try {
      // Deep clone content
      const updated = JSON.parse(JSON.stringify(lessonContent));
      const mv = updated.acts[scene.actIndex]?.phases[scene.phaseIndex]?.microVisuals[scene.mvIndex];
      if (!mv) throw new Error("MicroVisual não encontrado no path especificado");

      // Inject storagePath + assetId
      mv.content = {
        ...mv.content,
        storagePath: asset.storage_path,
        assetId: asset.id,
      };

      // Save to DB
      const { error } = await supabase
        .from("lessons")
        .update({ content: updated } as any)
        .eq("id", selectedLessonId);
      if (error) throw error;

      setLessonContent(updated);
      setScenes(extractScenes(updated));
      setLinkingScene(null);
      toast.success(`Asset vinculado à cena "${scene.mvId}"`);
    } catch (err: any) {
      toast.error("Erro ao vincular: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Unlink asset from scene
  const unlinkAsset = async (scene: MicroVisualScene) => {
    if (!lessonContent || !selectedLessonId) return;
    setSaving(true);
    try {
      const updated = JSON.parse(JSON.stringify(lessonContent));
      const mv = updated.acts[scene.actIndex]?.phases[scene.phaseIndex]?.microVisuals[scene.mvIndex];
      if (!mv) throw new Error("MicroVisual não encontrado");

      delete mv.content.storagePath;
      delete mv.content.assetId;

      const { error } = await supabase
        .from("lessons")
        .update({ content: updated } as any)
        .eq("id", selectedLessonId);
      if (error) throw error;

      setLessonContent(updated);
      setScenes(extractScenes(updated));
      toast.info("Asset desvinculado");
    } catch (err: any) {
      toast.error("Erro ao desvincular: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const hasImage = (scene: MicroVisualScene) => !!(scene.storagePath || scene.imageUrl);

  return (
    <Card>
      <CardHeader className="cursor-pointer" onClick={() => setCollapsed(!collapsed)}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Link2 className="w-5 h-5 text-primary" />
            Vincular Assets a Cenas V7
            <Badge variant="secondary" className="text-[10px]">Fase 5</Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px]">
              {approvedAssets.length} assets aprovados
            </Badge>
            {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </div>
        </div>
      </CardHeader>

      {!collapsed && (
        <CardContent className="space-y-4">
          {/* Lesson Selector */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Selecionar Lição V7</label>
            {lessons.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma lição V7 encontrada no banco.</p>
            ) : (
              <Select value={selectedLessonId} onValueChange={loadLesson}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Escolha uma lição V7..." />
                </SelectTrigger>
                <SelectContent>
                  {lessons.map((l) => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.title} ({l.status || "rascunho"})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          )}

          {/* Scenes List */}
          {!loading && selectedLessonId && scenes.length === 0 && (
            <p className="text-sm text-muted-foreground py-4">
              Nenhum microVisual do tipo <code>image-flash</code> ou <code>image</code> encontrado nesta lição.
            </p>
          )}

          {!loading && scenes.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">{scenes.length} cena(s) de imagem encontradas:</p>
              {scenes.map((scene) => (
                <div
                  key={`${scene.actIndex}-${scene.phaseIndex}-${scene.mvIndex}`}
                  className={cn(
                    "border-2 rounded-xl p-4 transition-colors",
                    hasImage(scene) ? "border-green-500/30 bg-green-500/5" : "border-amber-500/30 bg-amber-500/5"
                  )}
                >
                  <div className="flex items-start gap-4">
                    {/* Preview */}
                    <div className="w-24 h-16 rounded-lg overflow-hidden bg-muted shrink-0">
                      {scene.storagePath ? (
                        <SmallSignedImage storagePath={scene.storagePath} className="w-full h-full" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-muted-foreground/40" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-[9px]">
                          Act {scene.actIndex + 1} / Phase {scene.phaseIndex + 1}
                        </Badge>
                        <Badge className={cn("text-[9px]", hasImage(scene) ? "bg-green-500/20 text-green-400" : "bg-amber-500/20 text-amber-400")}>
                          {hasImage(scene) ? "Vinculado" : "Sem imagem"}
                        </Badge>
                        <span className="text-[10px] font-mono text-muted-foreground">{scene.mvId}</span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        🎯 anchor: "{scene.anchorText}"
                      </p>
                      {scene.description && (
                        <p className="text-[11px] text-muted-foreground/70 truncate mt-0.5">
                          📝 {scene.description}
                        </p>
                      )}
                      {scene.assetId && (
                        <p className="text-[10px] font-mono text-green-400 mt-0.5">
                          asset: {scene.assetId.substring(0, 8)}...
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-1 shrink-0">
                      {hasImage(scene) ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs text-red-400"
                          disabled={saving}
                          onClick={() => unlinkAsset(scene)}
                        >
                          <Unlink className="w-3 h-3 mr-1" /> Desvincular
                        </Button>
                      ) : null}
                      <Button
                        size="sm"
                        variant={linkingScene === scene.mvId ? "secondary" : "outline"}
                        className="h-7 text-xs"
                        onClick={() => setLinkingScene(linkingScene === scene.mvId ? null : scene.mvId)}
                      >
                        <Link2 className="w-3 h-3 mr-1" /> {linkingScene === scene.mvId ? "Cancelar" : "Vincular"}
                      </Button>
                    </div>
                  </div>

                  {/* Asset Picker (expanded) */}
                  {linkingScene === scene.mvId && (
                    <div className="mt-3 pt-3 border-t border-border/50">
                      <p className="text-xs font-medium text-foreground mb-2">Selecione um asset aprovado:</p>
                      {approvedAssets.length === 0 ? (
                        <p className="text-xs text-muted-foreground">Nenhum asset aprovado disponível.</p>
                      ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-64 overflow-y-auto">
                          {approvedAssets.map((asset) => (
                            <div
                              key={asset.id}
                              className={cn(
                                "border rounded-lg overflow-hidden cursor-pointer transition-all hover:scale-105 hover:ring-2 hover:ring-primary/50",
                                scene.assetId === asset.id && "ring-2 ring-green-500"
                              )}
                              onClick={() => linkAsset(scene, asset)}
                            >
                              <div className="aspect-video bg-muted">
                                <SmallSignedImage storagePath={asset.storage_path} className="w-full h-full" />
                              </div>
                              <div className="p-1">
                                <p className="text-[9px] text-muted-foreground truncate">{asset.prompt_scene.substring(0, 40)}...</p>
                                <div className="flex items-center gap-1 mt-0.5">
                                  <Badge variant="outline" className="text-[8px]">{asset.width}x{asset.height}</Badge>
                                  {asset.preset_key && <Badge variant="outline" className="text-[8px]">{asset.preset_key}</Badge>}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};
