import { useState } from "react";
import { motion } from "framer-motion";
import { Award, Lock, Trophy, Star, Sparkles, Download, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useIsMobileOrTablet } from "@/hooks/use-mobile";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

interface V8CertificateCardProps {
  completedCount: number;
  totalLessons: number;
  allCompleted: boolean;
  trailTitle: string;
}

type CertState = "locked" | "in_progress" | "completed";

function getState(completedCount: number, totalLessons: number, allCompleted: boolean): CertState {
  if (allCompleted) return "completed";
  if (completedCount > 0) return "in_progress";
  return "locked";
}

/* ── Reusable certificate document mockup ── */
function CertificateDocument({ state, compact = false }: { state: CertState; compact?: boolean }) {
  const done = state === "completed";
  const locked = state === "locked";
  const docOpacity = done ? 1 : locked ? 0.7 : 0.85;

  const borderColor = done ? "hsl(43, 60%, 75%)" : "hsl(0, 0%, 88%)";
  const cornerColor = done ? "hsl(43, 70%, 60%)" : locked ? "hsl(0, 0%, 85%)" : "hsl(0, 0%, 82%)";

  return (
    <div
      className="relative"
      style={{
        opacity: docOpacity,
        background: done
          ? "linear-gradient(170deg, #FFFDF5 0%, #FFF8E1 30%, #FFF3CD 100%)"
          : "linear-gradient(170deg, #FDFCFA 0%, #FAF9F7 50%, #F5F4F2 100%)",
        padding: compact ? 10 : 20,
        borderRadius: compact ? 10 : 14,
      }}
    >
      {/* Noise texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.02,
          borderRadius: "inherit",
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Corner L-shapes */}
      {[
        { top: 4, left: 4, bT: true, bL: true, rTL: true },
        { top: 4, right: 4, bT: true, bR: true, rTR: true },
        { bottom: 4, left: 4, bB: true, bL: true, rBL: true },
        { bottom: 4, right: 4, bB: true, bR: true, rBR: true },
      ].map((c, i) => (
        <div
          key={i}
          className="absolute pointer-events-none"
          style={{
            width: compact ? 10 : 18,
            height: compact ? 10 : 18,
            top: c.top,
            left: c.left,
            right: c.right,
            bottom: c.bottom,
            borderTop: c.bT ? `1.5px solid ${cornerColor}` : undefined,
            borderLeft: c.bL ? `1.5px solid ${cornerColor}` : undefined,
            borderBottom: c.bB ? `1.5px solid ${cornerColor}` : undefined,
            borderRight: c.bR ? `1.5px solid ${cornerColor}` : undefined,
            borderTopLeftRadius: c.rTL ? 3 : undefined,
            borderTopRightRadius: c.rTR ? 3 : undefined,
            borderBottomLeftRadius: c.rBL ? 3 : undefined,
            borderBottomRightRadius: c.rBR ? 3 : undefined,
          } as React.CSSProperties}
        />
      ))}

      {/* Inner bordered area */}
      <div
        className="relative"
        style={{
          border: `1px solid ${borderColor}`,
          borderRadius: compact ? 6 : 8,
          padding: compact ? "8px 6px" : "20px 16px",
        }}
      >
        {/* Seal */}
        <div className="flex justify-center" style={{ marginBottom: compact ? 4 : 14 }}>
          <div className="relative">
            {done && !compact && (
              <motion.div
                className="absolute inset-[-5px] rounded-full"
                style={{
                  border: "1.5px solid hsl(43, 65%, 65%)",
                  background: "radial-gradient(circle, rgba(255,215,0,0.06) 0%, transparent 70%)",
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
              />
            )}
            <div
              className="rounded-full flex items-center justify-center"
              style={{
                width: compact ? 28 : 48,
                height: compact ? 28 : 48,
                background: done
                  ? "linear-gradient(145deg, hsl(43, 85%, 62%) 0%, hsl(38, 90%, 50%) 50%, hsl(33, 85%, 45%) 100%)"
                  : locked
                    ? "linear-gradient(145deg, hsl(0, 0%, 90%) 0%, hsl(0, 0%, 82%) 100%)"
                    : "linear-gradient(145deg, hsl(258, 40%, 90%) 0%, hsl(258, 30%, 80%) 100%)",
                boxShadow: done
                  ? "inset 0 2px 4px rgba(255,255,255,0.4), inset 0 -2px 4px rgba(0,0,0,0.1), 0 3px 10px rgba(180, 130, 20, 0.25)"
                  : "inset 0 1px 2px rgba(255,255,255,0.4), inset 0 -1px 2px rgba(0,0,0,0.05)",
              }}
            >
              {done ? (
                <Trophy style={{ width: compact ? 13 : 22, height: compact ? 13 : 22 }} className="text-amber-100 drop-shadow-sm" />
              ) : locked ? (
                <Lock style={{ width: compact ? 12 : 20, height: compact ? 12 : 20 }} className="text-gray-400" />
              ) : (
                <Award style={{ width: compact ? 12 : 20, height: compact ? 12 : 20 }} className="text-violet-400" />
              )}
            </div>
          </div>
        </div>

        {/* Title */}
        <p
          className={`text-center font-bold uppercase tracking-[0.12em] ${
            done ? "text-amber-800" : locked ? "text-gray-400" : "text-gray-500"
          }`}
          style={{
            fontFamily: "'Georgia', 'Times New Roman', serif",
            fontSize: compact ? 7 : 11,
            marginBottom: compact ? 2 : 4,
          }}
        >
          Certificado de Conclusão
        </p>

        {!compact && (
          <>
            {/* Divider */}
            <div className="flex items-center gap-2 my-2.5 px-2">
              <div className={`flex-1 h-px ${done ? "bg-gradient-to-r from-transparent via-amber-300 to-transparent" : "bg-gradient-to-r from-transparent via-gray-200 to-transparent"}`} />
              <Star className={`w-3 h-3 ${done ? "text-amber-400 fill-amber-400" : "text-gray-300"}`} />
              <div className={`flex-1 h-px ${done ? "bg-gradient-to-r from-transparent via-amber-300 to-transparent" : "bg-gradient-to-r from-transparent via-gray-200 to-transparent"}`} />
            </div>

            {/* Simulated text lines */}
            <div className="space-y-1.5 px-3 mb-3">
              <div className={`h-[5px] rounded-full mx-auto w-[85%] ${done ? "bg-amber-200/50" : "bg-gray-200/40"}`} />
              <div className={`h-[5px] rounded-full mx-auto w-[95%] ${done ? "bg-amber-200/40" : "bg-gray-200/30"}`} />
              <div className={`h-[4px] rounded-full mx-auto w-[65%] ${done ? "bg-amber-200/30" : "bg-gray-100/50"}`} />
            </div>

            {/* Signature area */}
            <div
              className="mt-4 pt-2.5"
              style={{ borderTop: `1px dashed ${done ? "hsl(43, 50%, 75%)" : "hsl(0, 0%, 88%)"}` }}
            >
              <div className={`h-[3px] rounded-full mx-auto w-[30%] mb-1 ${done ? "bg-amber-300/50" : "bg-gray-200/50"}`} />
              <p
                className={`text-center font-medium tracking-wide ${done ? "text-amber-600/70" : "text-gray-300"}`}
                style={{ fontFamily: "'Georgia', 'Times New Roman', serif", fontSize: 9 }}
              >
                AIliv Academy
              </p>
            </div>
          </>
        )}

        {compact && (
          <p
            className={`text-center mt-0.5 ${done ? "text-amber-600/60" : "text-gray-300"}`}
            style={{ fontFamily: "'Georgia', 'Times New Roman', serif", fontSize: 6 }}
          >
            AIliv Academy
          </p>
        )}
      </div>
    </div>
  );
}

export function V8CertificateCard({ completedCount, totalLessons, allCompleted, trailTitle }: V8CertificateCardProps) {
  const isMobile = useIsMobileOrTablet();
  const [modalOpen, setModalOpen] = useState(false);
  const state = getState(completedCount, totalLessons, allCompleted);
  const remaining = totalLessons - completedCount;
  const progress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  const cardBorder = allCompleted
    ? "2px solid hsl(43, 65%, 60%)"
    : "1px solid rgba(0,0,0,0.08)";
  const cardShadow = allCompleted
    ? "0 8px 30px rgba(180, 130, 20, 0.18), 0 0 0 4px rgba(217, 168, 42, 0.06)"
    : "0 4px 20px rgba(0,0,0,0.06)";

  /* ── MOBILE: compact horizontal card ── */
  if (isMobile) {
    return (
      <>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          onClick={() => setModalOpen(true)}
          className="cursor-pointer active:scale-[0.98] transition-transform"
          style={{
            border: cardBorder,
            borderRadius: 20,
            boxShadow: cardShadow,
            background: "#FDFCFA",
            maxHeight: 170,
            overflow: "hidden",
          }}
        >
          <div className="flex items-stretch">
            {/* Mini certificate preview */}
            <div className="w-[90px] flex-shrink-0 flex items-center justify-center p-2.5"
              style={{ borderRight: "1px solid rgba(0,0,0,0.05)" }}
            >
              <CertificateDocument state={state} compact />
            </div>

            {/* Info side */}
            <div className="flex-1 p-3.5 flex flex-col justify-center gap-2">
              <div className="flex items-center gap-1.5">
                {allCompleted ? (
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                ) : (
                  <Award className="w-3.5 h-3.5 text-violet-400" />
                )}
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  Certificado
                </span>
              </div>

              <p className="text-xs text-gray-400 leading-snug">
                {allCompleted
                  ? "Trilha concluída! Toque para ver."
                  : state === "locked"
                    ? "Complete as aulas para liberar"
                    : `${remaining} aula${remaining !== 1 ? "s" : ""} restante${remaining !== 1 ? "s" : ""}`}
              </p>

              <div className="flex items-center gap-2">
                <Progress value={progress} className="flex-1 h-1.5" />
                <span className="text-[10px] font-bold text-gray-400">
                  {completedCount}/{totalLessons}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Modal for full certificate */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="max-w-[92vw] p-0 border-0 bg-transparent shadow-none rounded-2xl overflow-hidden">
            <DialogTitle className="sr-only">Certificado</DialogTitle>
            <div
              className="rounded-2xl overflow-hidden"
              style={{ border: cardBorder, boxShadow: cardShadow, background: "#FDFCFA" }}
            >
              {/* Header */}
              <div className={`px-4 py-3 flex items-center justify-between ${
                allCompleted
                  ? "bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500"
                  : "bg-gradient-to-r from-violet-500 via-indigo-500 to-violet-600"
              }`}>
                <div className="flex items-center gap-2">
                  {allCompleted ? (
                    <Sparkles className="w-4 h-4 text-amber-900" />
                  ) : (
                    <Award className="w-4 h-4 text-white/90" />
                  )}
                  <span className={`text-xs font-bold uppercase tracking-wider ${
                    allCompleted ? "text-amber-900" : "text-white/90"
                  }`}>
                    Certificado
                  </span>
                </div>
                <button onClick={() => setModalOpen(false)} className="w-7 h-7 rounded-full bg-black/10 flex items-center justify-center">
                  <X className="w-3.5 h-3.5 text-white" />
                </button>
              </div>

              {/* Full document */}
              <div className="p-4">
                <CertificateDocument state={state} />
              </div>

              {/* Footer */}
              <div className="px-4 pb-4">
                <div className="flex items-center gap-2 mb-3">
                  <Progress value={progress} className="flex-1 h-2" />
                  <span className="text-xs font-bold text-gray-500">{completedCount}/{totalLessons}</span>
                </div>
                {allCompleted && (
                  <button className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                    <Download className="w-4 h-4" />
                    Baixar Certificado
                  </button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  /* ── DESKTOP: vertical sticky card ── */
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-[280px] flex-shrink-0 sticky top-[72px] self-start"
      whileHover={{ y: -2 }}
    >
      <div
        className="rounded-[20px] overflow-hidden transition-shadow duration-300 hover:shadow-lg"
        style={{ border: cardBorder, boxShadow: cardShadow, background: "#FDFCFA" }}
      >
        {/* Header band */}
        <div className={`px-4 py-3 ${
          allCompleted
            ? "bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500"
            : "bg-gradient-to-r from-violet-500 via-indigo-500 to-violet-600"
        }`}>
          <div className="flex items-center gap-2">
            {allCompleted ? (
              <Sparkles className="w-4 h-4 text-amber-900" />
            ) : (
              <Award className="w-4 h-4 text-white/90" />
            )}
            <span className={`text-xs font-bold uppercase tracking-wider ${
              allCompleted ? "text-amber-900" : "text-white/90"
            }`}>
              Certificado
            </span>
          </div>
        </div>

        {/* Certificate body */}
        <div className="p-4">
          <CertificateDocument state={state} />
        </div>

        {/* Progress footer */}
        <div className="px-4 pb-4">
          <p className={`text-xs mb-2 ${allCompleted ? "text-amber-700 font-semibold" : "text-gray-400"}`}>
            {allCompleted
              ? "Parabéns! Trilha concluída."
              : `${remaining} aula${remaining !== 1 ? "s" : ""} restante${remaining !== 1 ? "s" : ""}`}
          </p>
          <div className="flex items-center gap-2.5">
            <Progress value={progress} className="flex-1 h-2" />
            <span className={`text-xs font-bold ${allCompleted ? "text-amber-700" : "text-gray-500"}`}>
              {completedCount}/{totalLessons}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
