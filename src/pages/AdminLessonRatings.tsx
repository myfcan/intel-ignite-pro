import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Star, MessageSquare, TrendingUp, BarChart3, Trash2, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

interface RatingRow {
  id: string;
  user_id: string;
  lesson_id: string;
  rating: number;
  comment: string | null;
  is_approved: boolean;
  created_at: string;
  user_name?: string;
  lesson_title?: string;
}

export default function AdminLessonRatings() {
  const navigate = useNavigate();
  const [ratings, setRatings] = useState<RatingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRating, setFilterRating] = useState<number | null>(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      // Fetch ratings
      let query = supabase
        .from("lesson_ratings")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);

      if (filterRating) {
        query = query.eq("rating", filterRating);
      }

      const { data: ratingsData } = await query;
      if (!ratingsData) { setLoading(false); return; }

      // Fetch user names and lesson titles
      const userIds = [...new Set(ratingsData.map(r => r.user_id))];
      const lessonIds = [...new Set(ratingsData.map(r => r.lesson_id))];

      const [usersRes, lessonsRes] = await Promise.all([
        userIds.length > 0
          ? supabase.from("users").select("id, name").in("id", userIds)
          : Promise.resolve({ data: [] }),
        lessonIds.length > 0
          ? supabase.from("lessons").select("id, title").in("id", lessonIds)
          : Promise.resolve({ data: [] }),
      ]);

      const userMap = new Map((usersRes.data || []).map(u => [u.id, u.name]));
      const lessonMap = new Map((lessonsRes.data || []).map(l => [l.id, l.title]));

      setRatings(ratingsData.map(r => ({
        ...r,
        user_name: userMap.get(r.user_id) || "—",
        lesson_title: lessonMap.get(r.lesson_id) || r.lesson_id.slice(0, 8),
      })));
      setLoading(false);
    };
    fetch();
  }, [filterRating]);

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta avaliação permanentemente?")) return;
    const { error } = await supabase.from("lesson_ratings").delete().eq("id", id);
    if (error) { toast.error("Erro ao excluir"); return; }
    setRatings(prev => prev.filter(r => r.id !== id));
    toast.success("Avaliação excluída");
  };

  const handleToggleApproved = async (id: string, current: boolean) => {
    const { error } = await supabase.from("lesson_ratings").update({ is_approved: !current } as any).eq("id", id);
    if (error) { toast.error("Erro ao atualizar"); return; }
    setRatings(prev => prev.map(r => r.id === id ? { ...r, is_approved: !current } : r));
    toast.success(!current ? "Avaliação ativada" : "Avaliação desativada");
  };

  // KPIs
  const total = ratings.length;
  const avg = total > 0 ? (ratings.reduce((a, r) => a + r.rating, 0) / total).toFixed(1) : "—";
  const withComments = ratings.filter(r => r.comment).length;
  const distribution = [1, 2, 3, 4, 5].map(s => ({
    stars: s,
    count: ratings.filter(r => r.rating === s).length,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => navigate("/admin")} className="mb-2">
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar ao Admin
        </Button>

        <h1 className="text-2xl font-bold">Avaliações de Aulas</h1>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4 text-center">
              <BarChart3 className="w-5 h-5 mx-auto text-indigo-500 mb-1" />
              <p className="text-2xl font-bold">{total}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <Star className="w-5 h-5 mx-auto text-amber-500 mb-1" />
              <p className="text-2xl font-bold">{avg}</p>
              <p className="text-xs text-muted-foreground">Média</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <MessageSquare className="w-5 h-5 mx-auto text-emerald-500 mb-1" />
              <p className="text-2xl font-bold">{withComments}</p>
              <p className="text-xs text-muted-foreground">Com comentário</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <TrendingUp className="w-5 h-5 mx-auto text-violet-500 mb-1" />
              <div className="flex justify-center gap-1 mt-1">
                {distribution.map(d => (
                  <div key={d.stars} className="text-center">
                    <div className="text-xs font-bold">{d.count}</div>
                    <div className="text-[10px] text-muted-foreground">{d.stars}★</div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Distribuição</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-2 items-center">
          <span className="text-sm text-muted-foreground">Filtrar:</span>
          <Button
            size="sm"
            variant={filterRating === null ? "default" : "outline"}
            onClick={() => setFilterRating(null)}
          >
            Todas
          </Button>
          {[5, 4, 3, 2, 1].map(s => (
            <Button
              key={s}
              size="sm"
              variant={filterRating === s ? "default" : "outline"}
              onClick={() => setFilterRating(s)}
            >
              {s}★
            </Button>
          ))}
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Avaliações recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground py-8">Carregando...</p>
            ) : ratings.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Nenhuma avaliação encontrada</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Aula</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Comentário</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ratings.map(r => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium text-sm max-w-[160px] truncate">
                        {r.lesson_title}
                      </TableCell>
                      <TableCell className="text-sm">{r.user_name}</TableCell>
                      <TableCell>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map(i => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${i <= r.rating ? "text-amber-400 fill-amber-400" : "text-slate-300"}`}
                            />
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                        {r.comment || "—"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(r.created_at).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell>
                        {r.is_approved ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                            <CheckCircle className="w-3.5 h-3.5" /> Ativo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <XCircle className="w-3.5 h-3.5" /> Inativo
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-1.5 justify-end">
                          <Button
                            size="sm"
                            variant={r.is_approved ? "outline" : "default"}
                            className="h-7 text-xs"
                            onClick={() => handleToggleApproved(r.id, r.is_approved)}
                          >
                            {r.is_approved ? "Desativar" : "Ativar"}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-7 text-xs"
                            onClick={() => handleDelete(r.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
