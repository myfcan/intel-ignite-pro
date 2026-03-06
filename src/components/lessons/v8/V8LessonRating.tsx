import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Send, CheckCircle, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface V8LessonRatingProps {
  lessonId: string;
  open: boolean;
  onClose: () => void;
}

export const V8LessonRating = ({ lessonId, open, onClose }: V8LessonRatingProps) => {
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  // If already rated, skip modal entirely
  useEffect(() => {
    if (!open) return;
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("lesson_ratings")
        .select("rating")
        .eq("user_id", user.id)
        .eq("lesson_id", lessonId)
        .maybeSingle();
      if (data) {
        onClose();
      }
    };
    check();
  }, [lessonId, open]);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Faça login para avaliar");
        return;
      }

      const { error } = await supabase
        .from("lesson_ratings")
        .upsert(
          {
            user_id: user.id,
            lesson_id: lessonId,
            rating,
            comment: comment.trim() || null,
          },
          { onConflict: "user_id,lesson_id" }
        );

      if (error) throw error;
      setSubmitted(true);
      // Auto-close after brief delay
      setTimeout(() => onClose(), 1200);
    } catch (err) {
      console.error("[V8LessonRating] Error:", err);
      toast.error("Erro ao enviar avaliação");
    } finally {
      setLoading(false);
    }
  };

  const activeRating = hoveredStar || rating;

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onMouseDown={() => onClose()}
        />

        {/* Modal content */}
        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="thanks"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="relative z-10 flex flex-col items-center gap-4 p-8 rounded-2xl border border-emerald-200 bg-emerald-50/95 shadow-2xl max-w-sm w-full"
            >
              <CheckCircle className="w-10 h-10 text-emerald-500" />
              <p className="text-base font-bold text-emerald-700">
                Obrigado pelo seu feedback!
              </p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${i <= rating ? "text-amber-400 fill-amber-400" : "text-slate-300"}`}
                  />
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="relative z-10 flex flex-col items-center gap-5 p-7 rounded-2xl border border-slate-200 bg-white shadow-2xl max-w-sm w-full"
            >
              {/* Close button */}
              <button
                onClick={() => onClose()}
                className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Badge icon */}
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 border border-indigo-200 flex items-center justify-center rotate-3">
                <Star className="w-7 h-7 text-indigo-500" />
              </div>

              {/* Title */}
              <div className="text-center space-y-1">
                <h3 className="text-lg font-bold text-slate-900">
                  Sua opinião importa!
                </h3>
                <p className="text-sm text-slate-500">
                  Como você avaliaria esta lição?
                </p>
              </div>

              {/* Stars */}
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <button
                    key={i}
                    onMouseEnter={() => setHoveredStar(i)}
                    onMouseLeave={() => setHoveredStar(0)}
                    onClick={() => setRating(i)}
                    className="p-1 transition-transform hover:scale-110 active:scale-95"
                  >
                    <Star
                      className={`w-9 h-9 transition-colors ${
                        i <= activeRating
                          ? "text-amber-400 fill-amber-400"
                          : "text-slate-300"
                      }`}
                    />
                  </button>
                ))}
              </div>

              {/* Labels */}
              <div className="flex justify-between w-full px-1">
                <span className="text-[11px] text-slate-400">Não é a minha praia</span>
                <span className="text-[11px] text-slate-400">Adorei!</span>
              </div>

              {/* Comment textarea — always visible */}
              <div className="w-full">
                <Textarea
                  placeholder="Conte-nos mais sobre sua experiência... (opcional)"
                  value={comment}
                  onChange={(e) => setComment(e.target.value.slice(0, 500))}
                  className="min-h-[70px] text-sm resize-none border-slate-200 bg-slate-50/50 focus:border-indigo-300"
                  rows={3}
                />
                <p className="text-[10px] text-slate-400 text-right mt-1">
                  {comment.length}/500
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2.5 w-full">
                {/* Submit button */}
                <button
                  onClick={handleSubmit}
                  disabled={rating === 0 || loading}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-semibold text-sm shadow-md disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg transition-shadow"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" /> Enviar feedback
                    </>
                  )}
                </button>

                {/* Skip button */}
                <button
                  onClick={() => onClose()}
                  className="text-sm text-slate-400 hover:text-slate-600 transition-colors py-1"
                >
                  Pular
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};
