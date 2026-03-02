import { motion } from "framer-motion";
import { BookOpen, Headphones, ArrowLeft } from "lucide-react";

interface V8ModeSelectorProps {
  onSelectMode: (mode: "read" | "listen") => void;
  onBack?: () => void;
  title?: string;
}

const modes = [
  {
    id: "read" as const,
    icon: BookOpen,
    label: "Ler",
    description: "Leia no seu ritmo, com áudio disponível",
  },
  {
    id: "listen" as const,
    icon: Headphones,
    label: "Ouvir",
    description: "Ouça a narração e acompanhe o texto",
  },
];

export const V8ModeSelector = ({ onSelectMode, onBack, title }: V8ModeSelectorProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative flex flex-col items-center justify-center min-h-[70vh] px-6 gap-10"
    >
      {/* Back button */}
      {onBack && (
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          onClick={onBack}
          className="absolute top-6 left-6 flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </motion.button>
      )}

      {/* Title */}
      <div className="text-center space-y-2">
        {title && (
          <p className="text-sm text-indigo-500 font-medium">{title}</p>
        )}
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Como você quer aprender?
        </h2>
        <p className="text-sm text-slate-500">
          Escolha o modo que melhor combina com você
        </p>
      </div>

      {/* Mode cards */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
        {modes.map((mode, i) => (
          <motion.button
            key={mode.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.1 }}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelectMode(mode.id)}
            className="flex flex-col items-center gap-3 p-6 rounded-2xl border border-slate-200 bg-white shadow-sm backdrop-blur-xl hover:bg-slate-50 hover:border-indigo-500/30 transition-colors"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/20 flex items-center justify-center">
              <mode.icon className="w-6 h-6 text-indigo-500" />
            </div>
            <span className="text-base font-semibold text-slate-900">
              {mode.label}
            </span>
            <span className="text-[11px] text-slate-500 text-center leading-snug">
              {mode.description}
            </span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};
