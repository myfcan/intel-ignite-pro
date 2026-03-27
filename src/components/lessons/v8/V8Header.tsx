import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, List } from "lucide-react";
import { V8ReportButton } from "./V8ReportButton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface V8HeaderProps {
  title: string;
  currentIndex: number;
  totalSteps: number;
  onBack: () => void;
  sectionTitles?: string[];
  onNavigateToSection?: (index: number) => void;
  lessonId?: string;
  reportContext?: Record<string, unknown>;
}

/** Strip "Seção X — " prefix */
const cleanTitle = (t: string) => t.replace(/^Seção\s*\d+\s*[—–\-]\s*/i, "");

export const V8Header = ({
  title,
  currentIndex,
  totalSteps,
  onBack,
  sectionTitles,
  onNavigateToSection,
  lessonId,
  reportContext,
}: V8HeaderProps) => {
  const [showNav, setShowNav] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const progress = totalSteps > 0 ? ((currentIndex + 1) / totalSteps) * 100 : 0;

  return (
    <>
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
            onClick={() => setShowExitModal(true)}
            className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex-shrink-0"
            aria-label="Voltar"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <h1 className="flex-1 text-sm font-medium text-slate-700 truncate">
            {title}
          </h1>

          <span className="text-[11px] font-semibold text-slate-400 tabular-nums flex-shrink-0 mr-1">
            {currentIndex + 1}/{totalSteps}
          </span>

          {/* Report button */}
          {lessonId && (
            <V8ReportButton lessonId={lessonId} pageContext={reportContext} />
          )}

          {/* Section nav toggle */}
          {sectionTitles && sectionTitles.length > 1 && (
            <button
              onClick={() => setShowNav(!showNav)}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors flex-shrink-0"
              aria-label="Navegar seções"
            >
              <List className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Navigation dots / list */}
        <AnimatePresence>
          {showNav && sectionTitles && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t border-slate-100"
            >
              <div className="max-w-2xl mx-auto px-4 py-3 flex flex-wrap gap-2">
                {sectionTitles.map((t, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      onNavigateToSection?.(i);
                      setShowNav(false);
                    }}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                      i <= currentIndex
                        ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                        : "bg-slate-50 border-slate-200 text-slate-500"
                    }`}
                  >
                    {cleanTitle(t)}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Exit confirmation modal */}
      <AlertDialog open={showExitModal} onOpenChange={setShowExitModal}>
        <AlertDialogContent className="max-w-[340px] rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center text-lg">
              Sair da aula?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-sm text-muted-foreground">
              Seu progresso foi salvo automaticamente. Você poderá continuar de onde parou a qualquer momento.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
            <AlertDialogCancel className="w-full rounded-xl border-border text-foreground font-medium">
              Continuar aula
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onBack()}
              className="w-full rounded-xl font-medium text-white"
              style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}
            >
              Sair da aula
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
