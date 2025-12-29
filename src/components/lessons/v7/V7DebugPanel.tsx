// V7DebugPanel - Painel de debug DETALHADO para identificar problemas no V7 Player
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface V7DebugPanelProps {
  currentPhase: any;
  currentPhaseIndex: number;
  currentScene: any;
  currentSceneIndex: number;
  currentTime: number;
  isPlaying: boolean;
  audioUrl: string | null;
  wordTimestamps: any[];
  // ✅ NEW: Full script for debugging
  fullScript?: any;
  // ✅ NEW: Raw database content for debugging
  rawContent?: any;
  // ✅ NEW: Detection path that was used
  detectionPath?: 'v7-vv' | 'emergency' | 'v7-v3' | 'legacy' | 'error';
}

export const V7DebugPanel = ({
  currentPhase,
  currentPhaseIndex,
  currentScene,
  currentSceneIndex,
  currentTime,
  isPlaying,
  audioUrl,
  wordTimestamps,
  fullScript,
  rawContent,
  detectionPath,
}: V7DebugPanelProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'status' | 'script' | 'raw' | 'phases'>('status');

  // ✅ Copy to clipboard helper
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copiado para o clipboard!');
  };

  // ✅ Log full debug info on open
  useEffect(() => {
    if (isOpen) {
      console.log('='.repeat(80));
      console.log('[V7DebugPanel] 🔍 FULL DEBUG INFO');
      console.log('='.repeat(80));
      console.log('[V7DebugPanel] Detection Path:', detectionPath || 'unknown');
      console.log('[V7DebugPanel] Full Script:', fullScript);
      console.log('[V7DebugPanel] Raw Content:', rawContent);
      console.log('[V7DebugPanel] Current Phase:', currentPhase);
      console.log('[V7DebugPanel] Audio URL:', audioUrl);
      console.log('[V7DebugPanel] Word Timestamps:', wordTimestamps?.length, 'words');
      console.log('='.repeat(80));
    }
  }, [isOpen, fullScript, rawContent, currentPhase, audioUrl, wordTimestamps, detectionPath]);

  const getDetectionColor = () => {
    switch (detectionPath) {
      case 'v7-vv': return 'bg-green-600';
      case 'emergency': return 'bg-yellow-600';
      case 'v7-v3': return 'bg-blue-600';
      case 'legacy': return 'bg-orange-600';
      case 'error': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <>
      {/* Toggle Button - ALWAYS VISIBLE, HIGH Z-INDEX */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-[9999] bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full shadow-lg text-sm font-bold"
        style={{ animation: 'pulse 2s infinite' }}
      >
        {isOpen ? '✕ Fechar' : '🐛 DEBUG V7'}
      </button>

      {/* Debug Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 right-4 z-[9999] bg-black text-white p-4 rounded-2xl shadow-2xl w-[520px] max-h-[85vh] overflow-hidden border-2 border-red-500"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-red-400">🔍 V7 Debug Panel</h2>
              <span className={`px-3 py-1 rounded text-xs font-bold text-white ${getDetectionColor()}`}>
                {detectionPath?.toUpperCase() || 'UNKNOWN PATH'}
              </span>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-3 border-b border-white/20 pb-2">
              {(['status', 'script', 'phases', 'raw'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-t text-xs font-bold transition-colors ${
                    activeTab === tab
                      ? 'bg-red-600 text-white'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  {tab.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div className="overflow-y-auto max-h-[55vh] space-y-3">

              {/* STATUS TAB */}
              {activeTab === 'status' && (
                <>
                  {/* Audio Status */}
                  <div className="p-3 bg-purple-900/40 rounded-lg border border-purple-500/30">
                    <h3 className="font-bold text-purple-300 mb-2">🔊 Audio</h3>
                    <div className="text-sm space-y-1 font-mono">
                      <div className="flex justify-between">
                        <span className="text-white/60">Playing:</span>
                        <span className={isPlaying ? 'text-green-400' : 'text-red-400'}>
                          {isPlaying ? '▶ PLAYING' : '⏸ PAUSED'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Current Time:</span>
                        <span className="text-cyan-400">{currentTime?.toFixed(2) || 0}s</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Audio URL:</span>
                        <span className={audioUrl ? 'text-green-400' : 'text-red-400'}>
                          {audioUrl ? '✓ Present' : '✗ MISSING'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Word Timestamps:</span>
                        <span className="text-cyan-400">{wordTimestamps?.length || 0} words</span>
                      </div>
                    </div>
                  </div>

                  {/* Phase Status */}
                  <div className="p-3 bg-blue-900/40 rounded-lg border border-blue-500/30">
                    <h3 className="font-bold text-blue-300 mb-2">📊 Current Phase</h3>
                    <div className="text-sm space-y-1 font-mono">
                      <div className="flex justify-between">
                        <span className="text-white/60">Index:</span>
                        <span className="text-cyan-400">{currentPhaseIndex} / {fullScript?.phases?.length - 1 || '?'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">ID:</span>
                        <span className="text-cyan-400">{currentPhase?.id || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Type:</span>
                        <span className="text-yellow-400 font-bold">{currentPhase?.type || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Time Range:</span>
                        <span className="text-cyan-400">
                          {currentPhase ? `${currentPhase.startTime?.toFixed(1)}s - ${currentPhase.endTime?.toFixed(1)}s` : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Scenes:</span>
                        <span className="text-cyan-400">{currentPhase?.scenes?.length || 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* Current Scene */}
                  <div className="p-3 bg-green-900/40 rounded-lg border border-green-500/30">
                    <h3 className="font-bold text-green-300 mb-2">🎬 Current Scene</h3>
                    <div className="text-sm space-y-1 font-mono">
                      <div className="flex justify-between">
                        <span className="text-white/60">Index:</span>
                        <span className="text-cyan-400">{currentSceneIndex}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">ID:</span>
                        <span className="text-cyan-400">{currentScene?.id || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Type:</span>
                        <span className="text-yellow-400">{currentScene?.type || 'N/A'}</span>
                      </div>
                      {currentScene?.startTime !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-white/60">Start:</span>
                          <span className="text-cyan-400">{currentScene.startTime?.toFixed(2)}s</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quick Scene List */}
                  {currentPhase?.scenes && currentPhase.scenes.length > 0 && (
                    <div className="p-3 bg-yellow-900/40 rounded-lg border border-yellow-500/30">
                      <h3 className="font-bold text-yellow-300 mb-2">📋 All Scenes in Phase ({currentPhase.scenes.length})</h3>
                      <div className="text-xs space-y-1 font-mono max-h-32 overflow-y-auto">
                        {currentPhase.scenes.map((scene: any, idx: number) => (
                          <div
                            key={idx}
                            className={`p-1.5 rounded ${idx === currentSceneIndex ? 'bg-green-500/30 border border-green-500' : 'bg-white/5'}`}
                          >
                            <span className="text-white/50">[{idx}]</span>{' '}
                            <span className="text-cyan-400">{scene.type}</span>{' '}
                            <span className="text-white/40">
                              {scene.startTime?.toFixed(1)}s - {((scene.startTime || 0) + (scene.duration || 0)).toFixed(1)}s
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* SCRIPT TAB */}
              {activeTab === 'script' && (
                <div className="p-3 bg-gray-900/40 rounded-lg border border-gray-500/30">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-gray-300">📜 Full Script</h3>
                    <button
                      onClick={() => copyToClipboard(JSON.stringify(fullScript, null, 2))}
                      className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs"
                    >
                      📋 Copy
                    </button>
                  </div>
                  <pre className="text-xs text-green-400 overflow-x-auto whitespace-pre-wrap font-mono bg-black/50 p-2 rounded max-h-[40vh]">
                    {fullScript ? JSON.stringify(fullScript, null, 2) : 'No script loaded'}
                  </pre>
                </div>
              )}

              {/* PHASES TAB */}
              {activeTab === 'phases' && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-gray-300">🎬 All Phases ({fullScript?.phases?.length || 0})</h3>
                  </div>
                  {fullScript?.phases?.map((phase: any, idx: number) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg border ${
                        idx === currentPhaseIndex
                          ? 'bg-green-900/40 border-green-500'
                          : 'bg-gray-900/40 border-gray-700'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-white">
                          [{idx}] {phase.type?.toUpperCase()}
                        </span>
                        <span className="text-xs text-cyan-400">
                          {phase.startTime?.toFixed(1)}s - {phase.endTime?.toFixed(1)}s
                        </span>
                      </div>
                      <div className="text-xs text-white/60 mt-1">
                        ID: {phase.id} | Scenes: {phase.scenes?.length || 0}
                      </div>
                      {phase.scenes?.length > 0 && (
                        <div className="mt-2 text-xs">
                          <span className="text-yellow-400">Scenes:</span>{' '}
                          {phase.scenes.map((s: any, i: number) => (
                            <span key={i} className="text-white/50">{s.type}{i < phase.scenes.length - 1 ? ', ' : ''}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  )) || <div className="text-white/50">No phases found</div>}
                </div>
              )}

              {/* RAW TAB */}
              {activeTab === 'raw' && (
                <div className="p-3 bg-gray-900/40 rounded-lg border border-gray-500/30">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-gray-300">🗄️ Raw Database Content</h3>
                    <button
                      onClick={() => copyToClipboard(JSON.stringify(rawContent, null, 2))}
                      className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs"
                    >
                      📋 Copy
                    </button>
                  </div>
                  <div className="mb-3 p-2 bg-black/50 rounded text-xs">
                    <div><span className="text-white/60">version:</span> <span className="text-yellow-400">{rawContent?.version || 'N/A'}</span></div>
                    <div><span className="text-white/60">model:</span> <span className="text-yellow-400">{rawContent?.model || 'N/A'}</span></div>
                    <div><span className="text-white/60">phases:</span> <span className="text-yellow-400">{Array.isArray(rawContent?.phases) ? `array(${rawContent.phases.length})` : typeof rawContent?.phases}</span></div>
                    <div><span className="text-white/60">cinematicFlow:</span> <span className="text-yellow-400">{rawContent?.cinematicFlow ? 'exists' : 'N/A'}</span></div>
                    <div><span className="text-white/60">cinematic_flow:</span> <span className="text-yellow-400">{rawContent?.cinematic_flow ? 'exists' : 'N/A'}</span></div>
                    <div><span className="text-white/60">keys:</span> <span className="text-cyan-400">{rawContent ? Object.keys(rawContent).join(', ') : 'N/A'}</span></div>
                  </div>
                  <pre className="text-xs text-orange-400 overflow-x-auto whitespace-pre-wrap font-mono bg-black/50 p-2 rounded max-h-[30vh]">
                    {rawContent ? JSON.stringify(rawContent, null, 2) : 'No raw content available'}
                  </pre>
                </div>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default V7DebugPanel;
