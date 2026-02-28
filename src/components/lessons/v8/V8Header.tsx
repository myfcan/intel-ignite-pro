import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

interface V8HeaderProps {
  title: string;
  currentIndex: number;
  totalSteps: number;
  onBack: () => void;
}

export const V8Header = ({
  title,
  currentIndex,
  totalSteps,
  onBack,
}: V8HeaderProps) => {
  const progress = totalSteps > 0 ? ((currentIndex + 1) / totalSteps) * 100 : 0;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-b border-slate-200">
      {/* Progress bar */}
      <div className="h-1 w-full bg-slate-100">
        <motion.div
          className="h-full bg-gradient-to-r from-indigo-500 to-violet-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>

      {/* Header content */}
      <div className="flex items-center gap-3 px-4 py-3 max-w-2xl mx-auto">
        <button
          onClick={onBack}
          className="p-1.5 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors flex-shrink-0"
          aria-label="Voltar"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <h1 className="flex-1 text-sm font-medium text-slate-700 truncate">
          {title}
        </h1>

        <span className="text-[11px] font-semibold text-slate-400 tabular-nums flex-shrink-0">
          {currentIndex + 1}/{totalSteps}
        </span>
      </div>
    </div>
  );
};
