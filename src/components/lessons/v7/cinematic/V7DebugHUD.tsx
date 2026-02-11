/**
 * V7DebugHUD - Debug overlay visível na UI para auditoria em tempo real
 * Ativado em rotas /admin/v7/play/:lessonId ou quando ?debug=1
 */
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bug, RotateCcw, Rewind, FileJson } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface LastCrossedAction {
  type: string;
  phaseId: string;
  targetId?: string;
  keywordTime?: number;
  keyword?: string;
  id?: string;
}

interface V7DebugHUDProps {
  // Core state
  hasAudio: boolean;
  wordTimestampsCount: number;
  currentTime: number;
  prevTime: number;
  
  // Anchor state
  lastCrossedAction: LastCrossedAction | null;
  visibleElementsSize: number;
  
  // Quiz state
  quizOptionsEnabled: boolean;
  quizOptionsReason: string;
  
  // Phase data
  currentPhase: any;
  
  // Callbacks for buttons
  onResetState: () => void;
  onSimulateSeekBack: () => void;
  onSeekForward?: () => void;
}

export const V7DebugHUD = ({
  hasAudio,
  wordTimestampsCount,
  currentTime,
  prevTime,
  lastCrossedAction,
  visibleElementsSize,
  quizOptionsEnabled,
  quizOptionsReason,
  currentPhase,
  onResetState,
  onSimulateSeekBack,
  onSeekForward,
}: V7DebugHUDProps) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [showPhaseJsonModal, setShowPhaseJsonModal] = useState(false);
  
  // Check if debug mode is enabled
  const isDebugEnabled = useMemo(() => {
    if (typeof window === 'undefined') return false;
    
    // Check URL for ?debug=1
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('debug') === '1') return true;
    
    // Check if we're in /admin/v7/play route
    if (window.location.pathname.includes('/admin/v7/play')) return true;
    
    // Check if DEV mode
    if (import.meta.env.DEV) return true;
    
    return false;
  }, []);
  
  if (!isDebugEnabled) return null;
  
  const formatTime = (t: number) => t?.toFixed(3) ?? 'N/A';
  
  return (
    <>
      {/* Debug HUD - Fixed top right */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="fixed top-4 right-4 z-[1000] pointer-events-auto"
      >
        {isMinimized ? (
          /* Minimized state - just an icon */
          <button
            onClick={() => setIsMinimized(false)}
            className="w-10 h-10 rounded-full bg-amber-600/90 hover:bg-amber-500 text-white flex items-center justify-center shadow-lg backdrop-blur-sm border border-amber-400/30"
            title="Open Debug HUD"
          >
            <Bug className="w-5 h-5" />
          </button>
        ) : (
          /* Full HUD */
          <div className="bg-black/90 backdrop-blur-md text-white text-xs font-mono rounded-xl shadow-2xl border border-amber-500/50 overflow-hidden w-80">
            {/* Header */}
            <div className="bg-amber-600/80 px-3 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bug className="w-4 h-4" />
                <span className="font-bold">V7 Debug HUD</span>
              </div>
              <button
                onClick={() => setIsMinimized(true)}
                className="text-white/80 hover:text-white text-sm"
              >
                ─
              </button>
            </div>
            
            {/* Content */}
            <div className="p-3 space-y-2">
              {/* Audio Status */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                <div className="text-amber-400/70">hasAudio:</div>
                <div className={hasAudio ? 'text-green-400' : 'text-red-400'}>
                  {hasAudio ? 'true ✓' : 'false ✗'}
                </div>
                
                <div className="text-amber-400/70">timestamps:</div>
                <div className={wordTimestampsCount > 0 ? 'text-green-400' : 'text-red-400'}>
                  {wordTimestampsCount}
                </div>
              </div>
              
              {/* Time tracking */}
              <div className="border-t border-white/10 pt-2">
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  <div className="text-amber-400/70">currentTime:</div>
                  <div className="text-cyan-400">{formatTime(currentTime)}s</div>
                  
                  <div className="text-amber-400/70">prevTime:</div>
                  <div className="text-cyan-400">{formatTime(prevTime)}s</div>
                </div>
              </div>
              
              {/* Last Crossed Action */}
              <div className="border-t border-white/10 pt-2">
                <div className="text-amber-400/70 mb-1">lastCrossedAction:</div>
                {lastCrossedAction ? (
                  <div className="bg-white/5 rounded p-2 space-y-0.5">
                    <div className="flex justify-between">
                      <span className="text-white/50">type:</span>
                      <span className="text-yellow-400">{lastCrossedAction.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/50">phaseId:</span>
                      <span className="text-cyan-400 truncate max-w-[140px]" title={lastCrossedAction.phaseId}>
                        {lastCrossedAction.phaseId}
                      </span>
                    </div>
                    {lastCrossedAction.targetId && (
                      <div className="flex justify-between">
                        <span className="text-white/50">targetId:</span>
                        <span className="text-purple-400 truncate max-w-[140px]" title={lastCrossedAction.targetId}>
                          {lastCrossedAction.targetId}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-white/50">keywordTime:</span>
                      <span className="text-green-400">
                        {lastCrossedAction.keywordTime?.toFixed(3) ?? 'N/A'}s
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-white/30 italic">null (nenhuma ação cruzada)</div>
                )}
              </div>
              
              {/* Visible Elements */}
              <div className="border-t border-white/10 pt-2">
                <div className="grid grid-cols-2 gap-x-4">
                  <div className="text-amber-400/70">visibleElements:</div>
                  <div className="text-cyan-400">{visibleElementsSize}</div>
                </div>
              </div>
              
              {/* Quiz Options */}
              <div className="border-t border-white/10 pt-2">
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  <div className="text-amber-400/70">quizEnabled:</div>
                  <div className={quizOptionsEnabled ? 'text-green-400' : 'text-red-400'}>
                    {quizOptionsEnabled ? 'true ✓' : 'false ✗'}
                  </div>
                  
                  <div className="text-amber-400/70">reason:</div>
                  <div className="text-white/70 truncate" title={quizOptionsReason}>
                    {quizOptionsReason || '—'}
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="border-t border-white/10 pt-3 flex gap-2">
                <button
                  onClick={onResetState}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-red-600/80 hover:bg-red-500 text-white py-1.5 px-2 rounded text-xs font-medium transition-colors"
                  title="Reset all anchor state"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset
                </button>
                
                <button
                  onClick={onSimulateSeekBack}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600/80 hover:bg-blue-500 text-white py-1.5 px-2 rounded text-xs font-medium transition-colors"
                  title="Simulate seek back -2s"
                >
                  <Rewind className="w-3.5 h-3.5" />
                  Seek -2s
                </button>
                
                {onSeekForward && (
                  <button
                    onClick={onSeekForward}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-green-600/80 hover:bg-green-500 text-white py-1.5 px-2 rounded text-xs font-medium transition-colors"
                    title="Seek forward +30s"
                  >
                    ⏩ +30s
                  </button>
                )}
                
                <button
                  onClick={() => setShowPhaseJsonModal(true)}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-purple-600/80 hover:bg-purple-500 text-white py-1.5 px-2 rounded text-xs font-medium transition-colors"
                  title="Dump current phase JSON"
                >
                  <FileJson className="w-3.5 h-3.5" />
                  JSON
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
      
      {/* Phase JSON Modal */}
      <Dialog open={showPhaseJsonModal} onOpenChange={setShowPhaseJsonModal}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden bg-slate-950 border-amber-500/50">
          <DialogHeader>
            <DialogTitle className="text-amber-400 font-mono flex items-center gap-2">
              <FileJson className="w-5 h-5" />
              Phase JSON: {currentPhase?.id || 'N/A'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="overflow-auto max-h-[60vh] bg-black/50 rounded-lg p-4">
            <pre className="text-xs font-mono text-green-400 whitespace-pre-wrap">
              {currentPhase ? JSON.stringify(currentPhase, null, 2) : 'No phase data'}
            </pre>
          </div>
          
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(currentPhase, null, 2));
              }}
            >
              📋 Copy to Clipboard
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowPhaseJsonModal(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default V7DebugHUD;
