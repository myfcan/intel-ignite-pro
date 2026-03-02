import { useState } from "react";
import { Flag, X, Send, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface V8ReportButtonProps {
  lessonId: string;
  pageContext?: Record<string, unknown>;
}

const CATEGORIES = [
  "Ortografia ou gramática incorreta",
  "Conteúdo desatualizado",
  "Erro de tradução",
  "Resposta incorreta",
  "Áudio com problema",
  "Outro problema",
];

export const V8ReportButton = ({ lessonId, pageContext }: V8ReportButtonProps) => {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<string | null>(null);
  const [details, setDetails] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async () => {
    if (!category) return;
    setSending(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Erro", description: "Você precisa estar logado para reportar.", variant: "destructive" });
        return;
      }
      const { error } = await supabase.from("lesson_reports" as any).insert({
        user_id: user.id,
        lesson_id: lessonId,
        category,
        details: details.trim() || null,
        page_context: pageContext || {},
      } as any);
      if (error) throw error;
      toast({ title: "Obrigado!", description: "Seu report foi enviado com sucesso." });
      setOpen(false);
      setCategory(null);
      setDetails("");
    } catch {
      toast({ title: "Erro ao enviar", description: "Tente novamente mais tarde.", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors flex-shrink-0"
        aria-label="Reportar problema"
      >
        <Flag className="w-4 h-4" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-[60] bg-black/30"
            />
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-x-4 bottom-4 z-[61] max-w-md mx-auto rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <span className="text-sm font-semibold text-slate-900">Reportar Problema</span>
                <button onClick={() => setOpen(false)} className="p-1 rounded-full hover:bg-slate-100">
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              {/* Categories */}
              <div className="px-4 py-3 space-y-2">
                <p className="text-xs text-slate-500 mb-2">Selecione o tipo de problema:</p>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                        category === cat
                          ? "bg-indigo-50 border-indigo-300 text-indigo-700"
                          : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Details */}
              <div className="px-4 pb-3">
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Detalhes adicionais (opcional)..."
                  className="w-full h-16 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 resize-none"
                />
              </div>

              {/* Submit */}
              <div className="px-4 pb-4">
                <button
                  onClick={handleSubmit}
                  disabled={!category || sending}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {sending ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</>
                  ) : (
                    <><Send className="w-4 h-4" /> Enviar Report</>
                  )}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
