import { motion } from "framer-motion";
import { Headphones } from "lucide-react";

/**
 * V8AudioLockOverlay — Visual hint shown over locked exercise options
 * while the narration audio is still playing.
 */
export const V8AudioLockOverlay = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 border border-slate-200"
  >
    <Headphones className="w-4 h-4 text-indigo-500 animate-pulse" />
    <span className="text-xs font-medium text-slate-500">
      Ouça o enunciado antes de responder...
    </span>
  </motion.div>
);
