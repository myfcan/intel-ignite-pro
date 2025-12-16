// V7ActPlayground - 100% Cinematic Split-Screen Playground
// Features: Side-by-side comparison, live scoring, animated results, real-time feedback

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PlaygroundSide {
  label: string;
  placeholder: string;
  defaultValue?: string;
  isPro?: boolean;
  badge?: string;
}

interface GeneratedResult {
  text: string;
  scoreLabel: string;
  scoreValue: number;
  maxScore: number;
  feedback?: string;
  highlights?: string[];
}

interface V7ActPlaygroundProps {
  title: string;
  subtitle?: string;
  leftSide: PlaygroundSide;
  rightSide: PlaygroundSide;
  onGenerateLeft: (prompt: string) => GeneratedResult | Promise<GeneratedResult>;
  onGenerateRight: (prompt: string) => GeneratedResult | Promise<GeneratedResult>;
  onSoundTrigger?: (type: "click" | "success" | "generate") => void;
}

export const V7ActPlayground = ({
  title,
  subtitle,
  leftSide,
  rightSide,
  onGenerateLeft,
  onGenerateRight,
  onSoundTrigger,
}: V7ActPlaygroundProps) => {
  const [leftPrompt, setLeftPrompt] = useState(leftSide.defaultValue || "");
  const [rightPrompt, setRightPrompt] = useState(rightSide.defaultValue || "");
  const [leftResult, setLeftResult] = useState<GeneratedResult | null>(null);
  const [rightResult, setRightResult] = useState<GeneratedResult | null>(null);
  const [isGeneratingLeft, setIsGeneratingLeft] = useState(false);
  const [isGeneratingRight, setIsGeneratingRight] = useState(false);
  const [animatedLeftScore, setAnimatedLeftScore] = useState(0);
  const [animatedRightScore, setAnimatedRightScore] = useState(0);

  // Animate scores
  useEffect(() => {
    if (leftResult) {
      let current = 0;
      const target = leftResult.scoreValue;
      const increment = target / 30;
      const interval = setInterval(() => {
        current += increment;
        if (current >= target) {
          setAnimatedLeftScore(target);
          clearInterval(interval);
        } else {
          setAnimatedLeftScore(Math.floor(current));
        }
      }, 30);
      return () => clearInterval(interval);
    }
  }, [leftResult]);

  useEffect(() => {
    if (rightResult) {
      let current = 0;
      const target = rightResult.scoreValue;
      const increment = target / 30;
      const interval = setInterval(() => {
        current += increment;
        if (current >= target) {
          setAnimatedRightScore(target);
          clearInterval(interval);
        } else {
          setAnimatedRightScore(Math.floor(current));
        }
      }, 30);
      return () => clearInterval(interval);
    }
  }, [rightResult]);

  const handleGenerateLeft = useCallback(async () => {
    setIsGeneratingLeft(true);
    onSoundTrigger?.("generate");
    try {
      const result = await Promise.resolve(onGenerateLeft(leftPrompt));
      setLeftResult(result);
      if (result.scoreValue >= result.maxScore * 0.8) {
        onSoundTrigger?.("success");
      }
    } finally {
      setIsGeneratingLeft(false);
    }
  }, [leftPrompt, onGenerateLeft, onSoundTrigger]);

  const handleGenerateRight = useCallback(async () => {
    setIsGeneratingRight(true);
    onSoundTrigger?.("generate");
    try {
      const result = await Promise.resolve(onGenerateRight(rightPrompt));
      setRightResult(result);
      if (result.scoreValue >= result.maxScore * 0.8) {
        onSoundTrigger?.("success");
      }
    } finally {
      setIsGeneratingRight(false);
    }
  }, [rightPrompt, onGenerateRight, onSoundTrigger]);

  const renderSide = (
    side: PlaygroundSide,
    prompt: string,
    setPrompt: (v: string) => void,
    result: GeneratedResult | null,
    onGenerate: () => void,
    isGenerating: boolean,
    animatedScore: number,
    delay: number
  ) => {
    const isPro = side.isPro;
    const scorePercent = result ? (animatedScore / result.maxScore) * 100 : 0;
    const isHighScore = scorePercent >= 80;

    return (
      <motion.div
        className="relative"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay }}
      >
        {/* Glow effect */}
        {result && isHighScore && (
          <motion.div
            className="absolute -inset-2 rounded-3xl opacity-50"
            style={{
              background: `radial-gradient(circle, ${isPro ? "rgba(78, 205, 196, 0.3)" : "rgba(102, 126, 234, 0.3)"}, transparent)`,
              filter: "blur(20px)",
            }}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}

        <div
          className={`
            relative bg-white/[0.02] backdrop-blur-xl border-2 rounded-2xl p-4 sm:p-6 
            flex flex-col h-full overflow-hidden
            ${isPro
              ? "border-[rgba(78,205,196,0.4)]"
              : "border-[rgba(255,107,107,0.3)]"
            }
          `}
        >
          {/* Badge */}
          {side.badge && (
            <motion.div
              className={`absolute -top-3 -right-3 px-3 py-1 rounded-full text-xs font-bold
                ${isPro ? "bg-[#4ecdc4] text-black" : "bg-[#ff6b6b] text-white"}`}
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: delay + 0.3, type: "spring" }}
            >
              {side.badge}
            </motion.div>
          )}

          {/* Label */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-base sm:text-lg text-white/60 font-medium">
              {side.label}
            </span>
            {isPro && (
              <span className="text-[#4ecdc4] text-sm">✓ Recomendado</span>
            )}
          </div>

          {/* Prompt Area */}
          <div className="relative flex-1 min-h-[120px] sm:min-h-[150px] mb-4">
            <textarea
              className="w-full h-full bg-black/40 border border-white/10 
                         rounded-xl p-4 text-white font-mono text-sm leading-relaxed
                         resize-none focus:outline-none focus:border-white/30
                         placeholder:text-white/30 transition-all"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={side.placeholder}
            />
            
            {/* Character count */}
            <span className="absolute bottom-2 right-2 text-xs text-white/30">
              {prompt.length} chars
            </span>
          </div>

          {/* Generate Button */}
          <motion.button
            className={`w-full py-3 sm:py-4 px-6 rounded-xl text-white text-base sm:text-lg
                       font-medium relative overflow-hidden
                       ${isGenerating ? "opacity-70" : ""}`}
            style={{
              background: isPro
                ? "linear-gradient(135deg, #4ecdc4, #45b7aa)"
                : "linear-gradient(135deg, #667eea, #764ba2)",
              boxShadow: isPro
                ? "0 10px 20px rgba(78, 205, 196, 0.3)"
                : "0 10px 20px rgba(102, 126, 234, 0.3)",
            }}
            onClick={onGenerate}
            disabled={isGenerating || !prompt.trim()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Loading animation */}
            {isGenerating && (
              <motion.div
                className="absolute inset-0 bg-white/20"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            )}
            <span className="relative z-10">
              {isGenerating ? "Gerando..." : "🚀 Gerar Resposta"}
            </span>
          </motion.button>

          {/* Result Area */}
          <AnimatePresence>
            {result && (
              <motion.div
                className="bg-black/50 rounded-xl p-4 mt-4 border border-white/10"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                {/* Result text */}
                <div
                  className="text-white/90 text-sm leading-relaxed mb-4 max-h-32 overflow-y-auto"
                  dangerouslySetInnerHTML={{ __html: result.text }}
                />

                {/* Highlights */}
                {result.highlights && result.highlights.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {result.highlights.map((h, i) => (
                      <motion.span
                        key={i}
                        className="px-2 py-1 bg-white/10 rounded text-xs text-white/70"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        {h}
                      </motion.span>
                    ))}
                  </div>
                )}

                {/* Score */}
                <div className="border-t border-white/10 pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white/50 text-sm">{result.scoreLabel}</span>
                    <motion.span
                      className={`text-2xl sm:text-3xl font-bold ${
                        isHighScore ? "text-[#4ecdc4]" : "text-[#ff6b6b]"
                      }`}
                      style={{
                        textShadow: isHighScore
                          ? "0 0 20px rgba(78, 205, 196, 0.5)"
                          : "none",
                      }}
                    >
                      {animatedScore}/{result.maxScore}
                    </motion.span>
                  </div>

                  {/* Progress bar */}
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${
                        isHighScore ? "bg-[#4ecdc4]" : "bg-[#ff6b6b]"
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${scorePercent}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>

                  {/* Feedback */}
                  {result.feedback && (
                    <p className="mt-3 text-sm text-white/60">{result.feedback}</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-6xl">
        {/* Title */}
        <motion.div
          className="text-center mb-6 sm:mb-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2
            className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2"
            style={{
              background: "linear-gradient(90deg, #f093fb, #f5576c)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {title}
          </h2>
          {subtitle && (
            <p className="text-white/60">{subtitle}</p>
          )}
        </motion.div>

        {/* Split Screen */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
          {renderSide(
            leftSide,
            leftPrompt,
            setLeftPrompt,
            leftResult,
            handleGenerateLeft,
            isGeneratingLeft,
            animatedLeftScore,
            0
          )}
          {renderSide(
            rightSide,
            rightPrompt,
            setRightPrompt,
            rightResult,
            handleGenerateRight,
            isGeneratingRight,
            animatedRightScore,
            0.2
          )}
        </div>

        {/* Winner announcement */}
        <AnimatePresence>
          {leftResult && rightResult && (
            <motion.div
              className="mt-6 text-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/5 rounded-full border border-white/10">
                <span className="text-2xl">
                  {leftResult.scoreValue > rightResult.scoreValue
                    ? "👈"
                    : leftResult.scoreValue < rightResult.scoreValue
                      ? "👉"
                      : "🤝"}
                </span>
                <span className="text-white/80">
                  {leftResult.scoreValue > rightResult.scoreValue
                    ? "Lado esquerdo venceu!"
                    : leftResult.scoreValue < rightResult.scoreValue
                      ? "Lado direito venceu!"
                      : "Empate!"}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
