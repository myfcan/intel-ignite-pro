import { useState } from "react";
import { motion } from "framer-motion";
import { Award, Lock, Trophy, GraduationCap, Sparkles, Download, X } from "lucide-react";
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

/* ── Diamond divider ── */
function DiamondDivider({ done, compact = false }: { done: boolean; compact?: boolean }) {
  const lineClass = done
    ? "bg-gradient-to-r from-transparent via-amber-300/60 to-transparent"
    : "bg-gradient-to-r from-transparent via-gray-300/50 to-transparent";
  const diamondColor = done ? "hsl(43, 55%, 55%)" : "hsl(0, 0%, 72%)";

  return (
    <div className="flex items-center" style={{ gap: compact ? 4 : 8, margin: compact ? "4px 0" : "10px 0" }}>
      <div className={`flex-1 ${lineClass}`} style={{ height: compact ? 0.8 : 1.5 }} />
      <div
        style={{
          width: compact ? 6 : 10,
          height: compact ? 6 : 10,
          backgroundColor: diamondColor,
          transform: "rotate(45deg)",
        }}
      />
      <div className={`flex-1 ${lineClass}`} style={{ height: compact ? 0.8 : 1.5 }} />
    </div>
  );
}

/* ── Certificate document ── */
function CertificateDocument({
  state,
  compact = false,
  trailTitle,
}: {
  state: CertState;
  compact?: boolean;
  trailTitle: string;
}) {
  const done = state === "completed";
  const locked = state === "locked";
  const docOpacity = done ? 1 : locked ? 0.82 : 0.94;

  const borderColor = done ? "hsl(43, 55%, 62%)" : locked ? "hsl(0, 0%, 84%)" : "hsl(258, 30%, 82%)";

  const sealSize = compact ? 45 : 60;
  const sealIconSize = compact ? 20 : 26;

  return (
    <div
      className="relative"
      style={{
        opacity: docOpacity,
        background: "radial-gradient(ellipse at 30% 20%, #FFFEF8, #FBF9F4)",
        padding: compact ? 15 : 24,
        borderRadius: compact ? 12 : 14,
      }}
    >
      {/* Double border effect */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          borderRadius: "inherit",
          border: `1.5px solid ${borderColor}`,
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          borderRadius: "inherit",
          border: `1.5px solid ${borderColor}`,
          inset: compact ? 5 : 7,
          opacity: 0.7,
        }}
      />

      {/* Content */}
      <div className="relative flex flex-col items-center" style={{ padding: compact ? "3px 0" : "8px 0" }}>
        {/* Seal / Emblem */}
        <div className="relative" style={{ marginBottom: compact ? 8 : 16 }}>
          {done && !compact && (
            <motion.div
              className="absolute rounded-full"
              style={{
                inset: -7,
                border: "1.5px solid hsl(43, 60%, 65%)",
                background: "radial-gradient(circle, rgba(255,215,0,0.06) 0%, transparent 70%)",
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
            />
          )}
          <div
            className="rounded-full flex items-center justify-center"
            style={{
              width: sealSize,
              height: sealSize,
              background: done
                ? "linear-gradient(145deg, hsl(43, 80%, 65%) 0%, hsl(38, 85%, 52%) 50%, hsl(33, 80%, 45%) 100%)"
                : locked
                  ? "linear-gradient(145deg, hsl(0, 0%, 88%) 0%, hsl(0, 0%, 78%) 100%)"
                  : "linear-gradient(145deg, hsl(258, 40%, 86%) 0%, hsl(258, 30%, 74%) 100%)",
              boxShadow: done
                ? "inset 0 2px 4px rgba(255,255,255,0.35), 0 4px 14px rgba(180,130,20,0.25)"
                : "inset 0 1px 2px rgba(255,255,255,0.3), 0 2px 8px rgba(0,0,0,0.08)",
              outline: `${compact ? 2 : 3}px solid ${borderColor}`,
              outlineOffset: compact ? 2.5 : 3.5,
            }}
          >
            {done ? (
              <Trophy style={{ width: sealIconSize, height: sealIconSize }} className="text-amber-100 drop-shadow-sm" />
            ) : locked ? (
              <Lock style={{ width: sealIconSize, height: sealIconSize }} className="text-gray-500" />
            ) : (
              <GraduationCap style={{ width: sealIconSize, height: sealIconSize }} className="text-violet-400" />
            )}
          </div>
        </div>

        {/* Title */}
        <p
          className={`text-center font-semibold uppercase ${
            done ? "text-amber-800" : locked ? "text-gray-500" : "text-gray-600"
          }`}
          style={{
            fontFamily: "'Georgia', 'Times New Roman', serif",
            fontSize: compact ? 11 : 16,
            letterSpacing: compact ? "0.14em" : "0.2em",
            lineHeight: 1.3,
          }}
        >
          Certificado
        </p>
        <p
          className={`text-center uppercase ${
            done ? "text-amber-700/80" : locked ? "text-gray-500/80" : "text-gray-500"
          }`}
          style={{
            fontFamily: "'Georgia', 'Times New Roman', serif",
            fontSize: compact ? 9.5 : 13,
            letterSpacing: compact ? "0.12em" : "0.15em",
            marginTop: compact ? 1 : 2,
          }}
        >
          de Conclusão
        </p>

        {/* Diamond divider */}
        <div style={{ width: "100%", padding: compact ? "0 4px" : "0 12px" }}>
          <DiamondDivider done={done} compact={compact} />
        </div>

        {/* Real text content */}
        {compact ? (
          /* Compact: mini text lines to look like a full document */
          <div className="w-full flex flex-col items-center" style={{ gap: 3, marginTop: 3 }}>
            <p
              className={`italic ${done ? "text-amber-700/80" : "text-gray-500/80"}`}
              style={{ fontFamily: "'Georgia', serif", fontSize: 7 }}
            >
              Concedido a
            </p>
            <div
              className={`${done ? "bg-amber-300/40" : "bg-gray-300/35"}`}
              style={{ width: "60%", height: 1, borderRadius: 1 }}
            />
            <p
              className={`italic text-center leading-tight ${done ? "text-amber-700/70" : "text-gray-500/70"}`}
              style={{ fontFamily: "'Georgia', serif", fontSize: 6.5, marginTop: 1 }}
            >
              "{trailTitle}"
            </p>
            <div style={{ marginTop: 4, width: "40%", borderTop: `0.8px dashed ${done ? "hsl(43,50%,65%)" : "hsl(0,0%,78%)"}` }} />
            <p
              className={`${done ? "text-amber-600/80" : "text-gray-500"}`}
              style={{ fontFamily: "'Georgia', serif", fontSize: 9.5, letterSpacing: "0.08em", marginTop: 3 }}
            >
              AIliv Academy
            </p>
          </div>
        ) : (
          /* Full: real text, no placeholders */
          <div className="w-full flex flex-col items-center" style={{ gap: 4, marginTop: 4 }}>
            <p
              className={`italic ${done ? "text-amber-700/80" : "text-gray-400/80"}`}
              style={{ fontFamily: "'Georgia', serif", fontSize: 10 }}
            >
              Concedido a
            </p>
            <div
              style={{
                width: "70%",
                height: 1.5,
                borderBottom: `1.5px solid ${done ? "hsl(43,50%,68%)" : "hsl(0,0%,80%)"}`,
                marginTop: 8,
                marginBottom: 2,
              }}
            />
            <p
              className={`italic text-center leading-snug ${done ? "text-amber-800/70" : "text-gray-400/70"}`}
              style={{ fontFamily: "'Georgia', serif", fontSize: 10, marginTop: 4 }}
            >
              por conclusão da trilha
            </p>
            <p
              className={`text-center font-medium ${done ? "text-amber-900/80" : "text-gray-500/70"}`}
              style={{ fontFamily: "'Georgia', serif", fontSize: 12, fontStyle: "italic" }}
            >
              "{trailTitle}"
            </p>

            {/* Signature area */}
            <div className="w-full mt-4 pt-3 flex flex-col items-center" style={{ borderTop: `1.5px dashed ${done ? "hsl(43,50%,68%)" : "hsl(0,0%,80%)"}` }}>
              <div
                style={{
                  width: "35%",
                  height: 1.5,
                  borderBottom: `1.5px solid ${done ? "hsl(43,50%,68%)" : "hsl(0,0%,80%)"}`,
                  marginBottom: 4,
                }}
              />
              <p
                className={`font-medium tracking-wide ${done ? "text-amber-600/80" : "text-gray-500"}`}
                style={{ fontFamily: "'Georgia', serif", fontSize: 12, letterSpacing: "0.08em" }}
              >
                AIliv Academy
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Locked overlay */}
      {locked && !compact && (
        <div className="absolute inset-0 flex items-center justify-center rounded-[inherit]" style={{ background: "rgba(255,255,255,0.25)" }}>
          <div className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center shadow-sm">
            <Lock className="w-5 h-5 text-gray-400" />
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Progress bar (violet) ── */
function CertProgress({ value, height = 4 }: { value: number; height?: number }) {
  return (
    <div className="w-full rounded-full bg-violet-100 overflow-hidden" style={{ height }}>
      <motion.div
        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500"
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />
    </div>
  );
}

/* ── Motivational text by state ── */
function MotivationalText({ state, remaining }: { state: CertState; remaining: number }) {
  if (state === "completed") {
    return <p className="text-xs text-amber-700 font-semibold">Parabéns! Trilha concluída. 🎉</p>;
  }

  return (
    <div className="space-y-1">
      <p className="text-[13px] font-semibold text-gray-700">
        {state === "in_progress" ? "Você está no caminho certo!" : "Obtenha seu certificado"}
      </p>
      <p className="text-[11px] text-gray-400 leading-snug">
        Continue e desbloqueie seu certificado personalizado de conclusão
      </p>
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
    ? "1.5px solid hsl(43, 55%, 65%)"
    : "1.5px solid hsl(250, 15%, 88%)";
  const cardShadow = allCompleted
    ? "0 4px 20px rgba(180,130,20,0.15), 0 0 0 3px rgba(217,168,42,0.05)"
    : "0 4px 20px rgba(0,0,0,0.08)";

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
            borderRadius: 18,
            boxShadow: cardShadow,
            background: "#FDFCFA",
            maxHeight: 262,
            overflow: "hidden",
          }}
        >
          <div className="flex items-stretch">
            {/* Mini certificate preview */}
            <div
              className="flex-shrink-0 flex items-center justify-center"
              style={{
                width: "min(180px, 50vw)",
                padding: 10,
                borderRight: "1.5px solid hsl(250, 15%, 92%)",
                boxShadow: "inset -1px 0 3px rgba(0,0,0,0.02)",
              }}
            >
              <CertificateDocument state={state} compact trailTitle={trailTitle} />
            </div>

            {/* Info side */}
            <div className="flex-1 p-3.5 flex flex-col justify-center gap-2.5">
              <div className="flex items-center gap-1.5">
                {allCompleted ? (
                  <Sparkles className="w-4 h-4 text-amber-500" />
                ) : (
                  <Award className="w-4 h-4 text-violet-400" />
                )}
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  Certificado
                </span>
              </div>

              <MotivationalText state={state} remaining={remaining} />

              <div className="flex items-center gap-2">
                <CertProgress value={progress} height={3} />
                <span className="text-[10px] font-bold text-gray-500">
                  {progress}%
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Modal */}
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

              <div className="p-4">
                <CertificateDocument state={state} trailTitle={trailTitle} />
              </div>

              <div className="px-4 pb-4">
                <div className="flex items-center gap-2 mb-3">
                  <CertProgress value={progress} height={4} />
                  <span className="text-xs font-bold text-gray-500">{progress}%</span>
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
      className="w-[320px] flex-shrink-0 sticky top-[72px] self-start"
      whileHover={{ y: -2 }}
    >
      <div
        className="rounded-[18px] overflow-hidden transition-shadow duration-300 hover:shadow-lg"
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
          <CertificateDocument state={state} trailTitle={trailTitle} />
        </div>

        {/* Motivational + Progress footer */}
        <div className="px-4 pb-4 space-y-3">
          <MotivationalText state={state} remaining={remaining} />
          <div className="flex items-center gap-2.5">
            <CertProgress value={progress} height={4} />
            <span className={`text-xs font-bold ${allCompleted ? "text-amber-700" : "text-gray-500"}`}>
              {progress}%
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
