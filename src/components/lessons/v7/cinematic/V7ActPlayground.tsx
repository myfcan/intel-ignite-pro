import { useState } from "react";
import { motion } from "framer-motion";

interface PlaygroundSide {
  label: string;
  placeholder: string;
  defaultValue?: string;
  isPro?: boolean;
}

interface GeneratedResult {
  text: string;
  scoreLabel: string;
  scoreValue: string;
  isHighScore: boolean;
}

interface V7ActPlaygroundProps {
  title: string;
  leftSide: PlaygroundSide;
  rightSide: PlaygroundSide;
  onGenerateLeft: (prompt: string) => GeneratedResult;
  onGenerateRight: (prompt: string) => GeneratedResult;
}

export const V7ActPlayground = ({
  title,
  leftSide,
  rightSide,
  onGenerateLeft,
  onGenerateRight
}: V7ActPlaygroundProps) => {
  const [leftPrompt, setLeftPrompt] = useState(leftSide.defaultValue || "");
  const [rightPrompt, setRightPrompt] = useState(rightSide.defaultValue || "");
  const [leftResult, setLeftResult] = useState<GeneratedResult | null>(null);
  const [rightResult, setRightResult] = useState<GeneratedResult | null>(null);

  const handleGenerateLeft = () => {
    const result = onGenerateLeft(leftPrompt);
    setLeftResult(result);
  };

  const handleGenerateRight = () => {
    const result = onGenerateRight(rightPrompt);
    setRightResult(result);
  };

  const renderSide = (
    side: PlaygroundSide,
    prompt: string,
    setPrompt: (v: string) => void,
    result: GeneratedResult | null,
    onGenerate: () => void,
    isPro: boolean
  ) => (
    <div
      className={`
        bg-white/[0.03] border-2 rounded-2xl p-4 sm:p-6 flex flex-col
        ${isPro 
          ? "border-[rgba(78,205,196,0.3)]" 
          : "border-[rgba(255,107,107,0.3)]"
        }
      `}
    >
      {/* Label */}
      <div className="text-base sm:text-lg text-white/50 mb-4">
        {side.label}
      </div>

      {/* Prompt Area */}
      <textarea
        className="flex-1 min-h-[120px] sm:min-h-[150px] bg-black/30 border border-white/10 
                   rounded-xl p-4 text-white font-mono text-sm leading-relaxed
                   resize-none mb-4 focus:outline-none focus:border-white/30
                   placeholder:text-white/30"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder={side.placeholder}
      />

      {/* Generate Button */}
      <button
        className="py-3 sm:py-4 px-6 sm:px-8 rounded-xl text-white text-base sm:text-lg
                   transition-all duration-300 hover:-translate-y-0.5"
        style={{
          background: "linear-gradient(135deg, #667eea, #764ba2)",
          boxShadow: "0 10px 20px rgba(102, 126, 234, 0.3)"
        }}
        onClick={onGenerate}
      >
        Gerar Resposta
      </button>

      {/* Result Area */}
      {result && (
        <motion.div
          className="bg-black/50 rounded-xl p-4 mt-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div 
            className="text-white/90 text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: result.text }}
          />
          <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
            <span className="text-white/50 text-sm">{result.scoreLabel}</span>
            <span 
              className={`text-xl sm:text-2xl font-bold ${
                result.isHighScore ? "text-[#4ecdc4]" : "text-[#ff6b6b]"
              }`}
            >
              {result.scoreValue}
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-6xl">
        {/* Title */}
        <motion.h2
          className="text-2xl sm:text-4xl text-center mb-6 sm:mb-10 font-semibold"
          style={{
            background: "linear-gradient(90deg, #f093fb, #f5576c)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {title}
        </motion.h2>

        {/* Split Screen */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
          {renderSide(
            leftSide,
            leftPrompt,
            setLeftPrompt,
            leftResult,
            handleGenerateLeft,
            false
          )}
          {renderSide(
            rightSide,
            rightPrompt,
            setRightPrompt,
            rightResult,
            handleGenerateRight,
            true
          )}
        </div>
      </div>
    </div>
  );
};
