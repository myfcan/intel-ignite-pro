import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Send, CheckCircle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface V8LessonRatingProps {
  lessonId: string;
  onSubmitted?: () => void;
}

export const V8LessonRating = ({ lessonId, onSubmitted }: V8LessonRatingProps) => {
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [existingRating, setExistingRating] = useState<number | null>(null);

  // Check for existing rating
  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("lesson_ratings")
        .select("rating, comment")
        .eq("user_id", user.id)
        .eq("lesson_id", lessonId)
        .maybeSingle();
      if (data) {
        setExistingRating(data.rating);
        setRating(data.rating);
        setComment(data.comment || "");
        setSubmitted(true);
      }
    };
    check();
  }, [lessonId]);

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
      onSubmitted?.();
    } catch (err) {
      console.error("[V8LessonRating] Error:", err);
      toast.error("Erro ao enviar avaliação");
    } finally {
      setLoading(false);
    }
  };

  const activeRating = hoveredStar || rating;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="w-full max-w-sm"
    >
      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div
            key="thanks"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-3 p-5 rounded-2xl border border-emerald-200 bg-emerald-50/80"
          >
            <CheckCircle className="w-8 h-8 text-emerald-500" />
            <p className="text-sm font-semibold text-emerald-700">
              Obrigado pelo seu feedback!
            </p>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${i <= rating ? "text-amber-400 fill-amber-400" : "text-slate-300"}`}
                />
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4 p-5 rounded-2xl border border-slate-200 bg-white/90 shadow-sm"
          >
            {/* Badge icon */}
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 border border-indigo-200 flex items-center justify-center rotate-3">
              <Star className="w-6 h-6 text-indigo-500" />
            </div>

            {/* Title */}
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                Sua opinião importa!
              </h3>
              <p className="text-xs text-slate-500">
                Como você avaliaria esta lição?
              </p>
            </div>

            {/* Stars */}
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <button
                  key={i}
                  onMouseEnter={() => setHoveredStar(i)}
                  onMouseLeave={() => setHoveredStar(0)}
                  onClick={() => setRating(i)}
                  className="p-1 transition-transform hover:scale-110 active:scale-95"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
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
              <span className="text-[10px] text-slate-400">Não é a minha praia</span>
              <span className="text-[10px] text-slate-400">Adorei!</span>
            </div>

            {/* Comment textarea */}
            {rating > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="w-full"
              >
                <Textarea
                  placeholder="Conte-nos mais sobre sua experiência... (opcional)"
                  value={comment}
                  onChange={(e) => setComment(e.target.value.slice(0, 500))}
                  className="min-h-[60px] text-xs resize-none border-slate-200 bg-slate-50/50 focus:border-indigo-300"
                  rows={3}
                />
                <p className="text-[10px] text-slate-400 text-right mt-1">
                  {comment.length}/500
                </p>
              </motion.div>
            )}

            {/* Submit button */}
            <button
              onClick={handleSubmit}
              disabled={rating === 0 || loading}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-semibold text-sm shadow-md disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg transition-shadow"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" /> Enviar feedback
                </>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
