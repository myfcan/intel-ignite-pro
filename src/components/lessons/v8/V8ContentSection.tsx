import { useState } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { ArrowRight } from "lucide-react";
import { V8Section } from "@/types/v8Lesson";
import { V8AudioPlayer } from "./V8AudioPlayer";

interface V8ContentSectionProps {
  section: V8Section;
  mode: "read" | "listen";
  onContinue: () => void;
  isLast?: boolean;
}

export const V8ContentSection = ({
  section,
  mode,
  onContinue,
  isLast = false,
}: V8ContentSectionProps) => {
  const [audioEnded, setAudioEnded] = useState(false);

  const handleAudioEnded = () => {
    setAudioEnded(true);
    if (mode === "listen") {
      // Auto-advance after short delay in listen mode
      setTimeout(onContinue, 800);
    }
  };

  const canContinue = mode === "read" || audioEnded;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex flex-col gap-6 pb-32"
    >
      {/* Section title */}
      <h2
        className="text-[28px] font-bold leading-[1.2] text-white"
        style={{ letterSpacing: "-0.01em" }}
      >
        {section.title}
      </h2>

      {/* Image with gradient overlay */}
      {section.imageUrl && (
        <div className="relative rounded-2xl overflow-hidden">
          <img
            src={section.imageUrl}
            alt={section.title}
            className="w-full h-48 sm:h-56 object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
        </div>
      )}

      {/* Markdown body */}
      <div className="v8-markdown text-[17px] leading-[1.75] text-slate-300">
        <ReactMarkdown
          components={{
            h1: ({ children }) => (
              <h1 className="text-2xl font-bold text-white mt-6 mb-3">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-xl font-semibold text-white mt-5 mb-2">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-lg font-semibold text-slate-200 mt-4 mb-2">
                {children}
              </h3>
            ),
            p: ({ children }) => <p className="mb-4">{children}</p>,
            ul: ({ children }) => (
              <ul className="list-disc list-inside mb-4 space-y-1.5 ml-1">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal list-inside mb-4 space-y-1.5 ml-1">
                {children}
              </ol>
            ),
            li: ({ children }) => (
              <li className="text-slate-300">{children}</li>
            ),
            strong: ({ children }) => (
              <strong className="text-white font-semibold">{children}</strong>
            ),
            em: ({ children }) => (
              <em className="text-indigo-300">{children}</em>
            ),
            code: ({ children, className }) => {
              const isInline = !className;
              return isInline ? (
                <code className="px-1.5 py-0.5 rounded-md bg-white/10 text-indigo-300 text-[15px] font-mono">
                  {children}
                </code>
              ) : (
                <code className="block p-4 rounded-xl bg-white/5 border border-white/10 text-sm font-mono text-slate-300 overflow-x-auto mb-4">
                  {children}
                </code>
              );
            },
            blockquote: ({ children }) => (
              <blockquote className="border-l-2 border-indigo-500/50 pl-4 py-1 mb-4 text-slate-400 italic">
                {children}
              </blockquote>
            ),
          }}
        >
          {section.content}
        </ReactMarkdown>
      </div>

      {/* Audio player — sticky at bottom */}
      {section.audioUrl && (
        <div className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-4 pt-2 bg-gradient-to-t from-slate-950 via-slate-950/95 to-transparent">
          <div className="max-w-2xl mx-auto">
            <V8AudioPlayer
              audioUrl={section.audioUrl}
              autoPlay={mode === "listen"}
              onEnded={handleAudioEnded}
            />
          </div>
        </div>
      )}

      {/* Continue button (read mode or after audio ends) */}
      {mode === "read" && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: canContinue ? 1 : 0.4 }}
          onClick={canContinue ? onContinue : undefined}
          className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-shadow disabled:opacity-40"
          disabled={!canContinue}
        >
          {isLast ? "Finalizar conteúdo" : "Continuar"}
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      )}
    </motion.div>
  );
};
