import { forwardRef } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { V8Section } from "@/types/v8Lesson";
import { V8AudioPlayer } from "./V8AudioPlayer";

interface V8ContentSectionProps {
  section: V8Section;
  mode: "read" | "listen";
  onAudioEnded?: () => void;
  sectionIndex: number;
  isActiveAudio?: boolean;
}

/** Strip "Seção X — " prefix from section titles */
const cleanSectionTitle = (title: string) =>
  title.replace(/^Seção\s*\d+\s*[—–\-]\s*/i, "");

/** Strip emotion/direction tags like [confiante], [pause], etc. */
const stripEmotionTags = (text: string) =>
  text.replace(/\[(?![^\]]*\]\()[^\]]{1,40}\]/gi, "");

export const V8ContentSection = forwardRef<HTMLDivElement, V8ContentSectionProps>(
  ({ section, mode, onAudioEnded, sectionIndex, isActiveAudio = false }, ref) => {
    const cleanTitle = cleanSectionTitle(section.title);
    const sanitizedContent = stripEmotionTags(section.content);

    return (
      <motion.div
        ref={ref}
        id={`v8-section-${sectionIndex}`}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut", delay: sectionIndex * 0.05 }}
        className="flex flex-col pb-10 border-b border-slate-100 last:border-b-0"
      >
        {/* Section title */}
        <h2 className="text-xl font-bold leading-snug text-slate-900">
          {cleanTitle}
        </h2>

        {/* Image — 7px from title, 7px before content */}
        {section.imageUrl && (
          <div className="flex justify-center mt-[7px] mb-[7px]">
            <div className="bg-white rounded-2xl">
              <img
                src={section.imageUrl}
                alt={cleanTitle}
                className="max-w-[85%] max-h-[280px] h-auto object-contain mx-auto"
                loading="lazy"
              />
            </div>
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
            {sanitizedContent}
          </ReactMarkdown>
        </div>

        {/* Audio player — inline (not fixed) */}
        {section.audioUrl && (
          <div className="mt-2">
            <V8AudioPlayer
              audioUrl={section.audioUrl}
              autoPlay={mode === "listen" && isActiveAudio}
              onEnded={onAudioEnded}
            />
          </div>
        )}
      </motion.div>
    );
  }
);

V8ContentSection.displayName = "V8ContentSection";
