import { motion } from "framer-motion";
import { Lightbulb } from "lucide-react";
import { V8LearnAndGrow } from "@/types/v8Lesson";

interface V8LearnAndGrowBlockProps {
  data: V8LearnAndGrow;
}

export const V8LearnAndGrowBlock = ({ data }: V8LearnAndGrowBlockProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-5 space-y-4"
    >
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100">
          <Lightbulb className="w-4.5 h-4.5 text-amber-600" />
        </div>
        <h3 className="text-base font-bold text-amber-900">
          💡 Aprender e Crescer
        </h3>
      </div>

      {/* 3 synthesis lines */}
      <div className="space-y-3 pl-1">
        {/* 1. What changed */}
        <div className="flex gap-2.5">
          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-200 text-amber-800 text-xs font-bold flex items-center justify-center mt-0.5">
            1
          </span>
          <p className="text-sm text-amber-900 leading-relaxed">
            <span className="font-semibold">Percebeu a virada?</span>{" "}
            {data.whatChanged}
          </p>
        </div>

        {/* 2. Before vs After */}
        <div className="flex gap-2.5">
          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-200 text-amber-800 text-xs font-bold flex items-center justify-center mt-0.5">
            2
          </span>
          <p className="text-sm text-amber-900 leading-relaxed">
            {data.beforeAfter}
          </p>
        </div>

        {/* 3. Practical example */}
        <div className="flex gap-2.5">
          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-200 text-amber-800 text-xs font-bold flex items-center justify-center mt-0.5">
            3
          </span>
          <p className="text-sm text-amber-900 leading-relaxed">
            <span className="font-semibold">Aplica hoje em:</span>{" "}
            {data.practicalExample}
          </p>
        </div>
      </div>
    </motion.div>
  );
};
