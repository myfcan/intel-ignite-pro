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

/** Strip "Seção X — " prefix from section titles */
const cleanSectionTitle = (title: string) =>
  title.replace(/^Seção\s*\d+\s*[—–\-]\s*/i, "");

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
      setTimeout(onContinue, 800);
    }
  };

  const canContinue = mode === "read" || audioEnded;
  const cleanTitle = cleanSectionTitle(section.title);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`flex flex-col gap-6 ${section.audioUrl ? "pb-48" : "pb-8"}`}
    >
      {/* Section title */}
      <h2 className="text-xl font-bold leading-snug text-slate-900">
        {cleanTitle}
      </h2>

      {/* Image — floating style (no container, no gradient) */}
      {section.imageUrl && (
        <div className="flex justify-center -mx-4">
          <img
            src={section.imageUrl}
            alt={cleanTitle}
            className="max-w-[85%] h-auto object-contain"
            loading="lazy"
          />
        </div>
      )}

      {/* Markdown body */}
      <div className="v8-markdown text-[17px] leading-[1.75] text-slate-700">
        <ReactMarkdown
          components={{
            h1: ({ children }) => (
              <h1 className="text-2xl font-bold text-slate-900 mt-6 mb-3">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-xl font-semibold text-slate-900 mt-5 mb-2">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-lg font-semibold text-slate-800 mt-4 mb-2">
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
              <li className="text-slate-700">{children}</li>
            ),
            strong: ({ children }) => (
              <strong className="text-slate-900 font-semibold">{children}</strong>
            ),
            em: ({ children }) => (
              <em className="text-indigo-600">{children}</em>
            ),
            code: ({ children, className }) => {
              const isInline = !className;
              return isInline ? (
                <code className="px-1.5 py-0.5 rounded-md bg-slate-100 text-indigo-600 text-[15px] font-mono">
                  {children}
                </code>
              ) : (
                <code className="block p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm font-mono text-slate-700 overflow-x-auto mb-4">
                  {children}
                </code>
              );
            },
            blockquote: ({ children }) => (
              <blockquote className="border-l-2 border-indigo-500/50 pl-4 py-1 mb-4 text-slate-500 italic">
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
        <div className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-4 pt-2 bg-gradient-to-t from-white via-white/95 to-transparent">
          <div className="max-w-2xl mx-auto space-y-3">
            <V8AudioPlayer
              audioUrl={section.audioUrl}
              autoPlay={mode === "listen"}
              onEnded={handleAudioEnded}
            />
            {/* Continue button inside fixed bar */}
            {mode === "read" && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: canContinue ? 1 : 0.4 }}
                onClick={canContinue ? onContinue : undefined}
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 hover:bg-indigo-700 transition-colors disabled:opacity-40"
                disabled={!canContinue}
              >
                {isLast ? "Finalizar conteúdo" : "Continuar"}
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            )}
          </div>
        </div>
      )}

      {/* Continue button when no audio — fixed at bottom */}
      {!section.audioUrl && mode === "read" && (
        <div className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-6 pt-3 bg-gradient-to-t from-white via-white/95 to-transparent">
          <div className="max-w-2xl mx-auto">
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={onContinue}
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 hover:bg-indigo-700 transition-colors"
            >
              {isLast ? "Finalizar conteúdo" : "Continuar"}
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      )}
    </motion.div>
  );
};
