import { forwardRef, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { V8Section } from "@/types/v8Lesson";

interface V8ContentSectionProps {
  section: V8Section;
  mode: "read" | "listen";
  sectionIndex: number;
}

/** Strip "Seção X — " prefix from section titles */
const cleanSectionTitle = (title: string) =>
  title.replace(/^#{1,6}\s*/, "").replace(/^Seção\s*\d+\s*[—–\-:]\s*/i, "");

/** Strip emotion/direction tags like [confiante], [pause], etc. */
const stripEmotionTags = (text: string) =>
  text.replace(/\[(?![^\]]*\]\()[^\]]{1,40}\]/gi, "");

interface V8TrimmedImageProps {
  src: string;
  alt: string;
  className?: string;
}

const trimmedImageCache = new Map<string, string>();
// Cache version — increment to invalidate when algorithm changes
const TRIM_VERSION = 2;

const V8TrimmedImage = ({ src, alt, className }: V8TrimmedImageProps) => {
  const [resolvedSrc, setResolvedSrc] = useState(() =>
    trimmedImageCache.get(`${TRIM_VERSION}:${src}`) ?? src
  );

  useEffect(() => {
    let cancelled = false;

    const cacheKey = `${TRIM_VERSION}:${src}`;
    const cached = trimmedImageCache.get(cacheKey);
    if (cached) {
      setResolvedSrc(cached);
      return;
    }

    setResolvedSrc(src);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.decoding = "async";

    img.onload = () => {
      try {
        const sourceCanvas = document.createElement("canvas");
        sourceCanvas.width = img.naturalWidth;
        sourceCanvas.height = img.naturalHeight;

        const sourceCtx = sourceCanvas.getContext("2d", { willReadFrequently: true });
        if (!sourceCtx) throw new Error("NO_CANVAS_CONTEXT");

        sourceCtx.drawImage(img, 0, 0);

        const { data, width, height } = sourceCtx.getImageData(
          0,
          0,
          sourceCanvas.width,
          sourceCanvas.height
        );

        // Amostrar cor de fundo dos 4 cantos
        const sampleBg = (px: number, py: number) => {
          const i = (py * width + px) * 4;
          return [data[i], data[i + 1], data[i + 2]];
        };
        const corners = [
          sampleBg(0, 0),
          sampleBg(width - 1, 0),
          sampleBg(0, height - 1),
          sampleBg(width - 1, height - 1),
        ];
        const bgR = Math.round(corners.reduce((s, c) => s + c[0], 0) / 4);
        const bgG = Math.round(corners.reduce((s, c) => s + c[1], 0) / 4);
        const bgB = Math.round(corners.reduce((s, c) => s + c[2], 0) / 4);

        let minX = width, minY = height, maxX = -1, maxY = -1;

        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const i = (y * width + x) * 4;
            const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
            if (a < 10) continue;
            const dist = Math.abs(r - bgR) + Math.abs(g - bgG) + Math.abs(b - bgB);
            if (dist < 30) continue;
            if (x < minX) minX = x;
            if (y < minY) minY = y;
            if (x > maxX) maxX = x;
            if (y > maxY) maxY = y;
          }
        }

        if (maxX < 0 || maxY < 0) {
          if (!cancelled) setResolvedSrc(src);
          return;
        }

        const padding = 4;
        const cropX = Math.max(0, minX - padding);
        const cropY = Math.max(0, minY - padding);
        const cropWidth = Math.min(width - cropX, maxX - minX + 1 + padding * 2);
        const cropHeight = Math.min(height - cropY, maxY - minY + 1 + padding * 2);

        const croppedCanvas = document.createElement("canvas");
        croppedCanvas.width = cropWidth;
        croppedCanvas.height = cropHeight;

        const croppedCtx = croppedCanvas.getContext("2d");
        if (!croppedCtx) throw new Error("NO_CROPPED_CONTEXT");

        croppedCtx.drawImage(
          sourceCanvas,
          cropX,
          cropY,
          cropWidth,
          cropHeight,
          0,
          0,
          cropWidth,
          cropHeight
        );

        const croppedSrc = croppedCanvas.toDataURL("image/png");
        trimmedImageCache.set(cacheKey, croppedSrc);

        if (!cancelled) setResolvedSrc(croppedSrc);
      } catch {
        if (!cancelled) setResolvedSrc(src);
      }
    };

    img.onerror = () => {
      if (!cancelled) setResolvedSrc(src);
    };

    img.src = src;

    return () => {
      cancelled = true;
    };
  }, [src]);

  return <img src={resolvedSrc} alt={alt} className={`block ${className ?? ''}`} loading="lazy" />;
};

export const V8ContentSection = forwardRef<HTMLDivElement, V8ContentSectionProps>(
  ({ section, mode, sectionIndex }, ref) => {
    const cleanTitle = cleanSectionTitle(section.title);
    const sanitizedContent = stripEmotionTags(section.content);

    return (
      <div
        ref={ref}
        id={`v8-section-${sectionIndex}`}
        className="flex flex-col"
      >
        {/* 1. Section title */}
        <h2 className="text-xl font-bold leading-snug text-slate-900">
          {cleanTitle}
        </h2>

        {/* 2. Image — BEFORE markdown */}
        {section.imageUrl && (
          <div className="flex justify-center mt-[30px]">
            <V8TrimmedImage
              src={section.imageUrl}
              alt={cleanTitle}
              className="w-full max-w-[300px] rounded-2xl object-contain"
            />
          </div>
        )}

        {/* 3. Markdown body */}
        <div className="v8-markdown text-[17px] leading-[1.75] text-slate-700 mt-[7px] [&>*:last-child]:mb-0">
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
              p: ({ children }) => <p className="mb-[7px]">{children}</p>,
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
      </div>
    );
  }
);

V8ContentSection.displayName = "V8ContentSection";
