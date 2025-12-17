// V7DebugPanel - Painel de debug para identificar problemas no V7 Player
import { useState } from 'react';
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
}: V7DebugPanelProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full shadow-lg text-sm font-bold"
      >
        {isOpen ? '✕ Close Debug' : '🐛 Debug V7'}
      </button>

      {/* Debug Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 right-4 z-50 bg-black/95 backdrop-blur-md text-white p-6 rounded-2xl shadow-2xl w-96 max-h-[80vh] overflow-y-auto border border-purple-500/30"
          >
            <h2 className="text-xl font-bold mb-4 text-purple-400">🔍 V7 Debug Panel</h2>

            {/* Audio Status */}
            <div className="mb-4 p-3 bg-purple-900/30 rounded-lg">
              <h3 className="font-semibold text-purple-300 mb-2">🔊 Audio Status</h3>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-white/60">Playing:</span>
                  <span className={isPlaying ? 'text-green-400' : 'text-red-400'}>
                    {isPlaying ? '▶ YES' : '⏸ NO'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Time:</span>
                  <span className="text-cyan-400">{currentTime.toFixed(2)}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Audio URL:</span>
                  <span className={audioUrl ? 'text-green-400' : 'text-red-400'}>
                    {audioUrl ? '✓ Present' : '✗ Missing'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Timestamps:</span>
                  <span className="text-cyan-400">{wordTimestamps.length} words</span>
                </div>
              </div>
            </div>

            {/* Phase Status */}
            <div className="mb-4 p-3 bg-blue-900/30 rounded-lg">
              <h3 className="font-semibold text-blue-300 mb-2">📊 Phase Status</h3>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-white/60">Phase Index:</span>
                  <span className="text-cyan-400">{currentPhaseIndex}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Phase Type:</span>
                  <span className="text-cyan-400">{currentPhase?.type || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Phase Time:</span>
                  <span className="text-cyan-400">
                    {currentPhase ? `${currentPhase.startTime.toFixed(1)}s - ${currentPhase.endTime.toFixed(1)}s` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Scenes Count:</span>
                  <span className="text-cyan-400">{currentPhase?.scenes?.length || 0}</span>
                </div>
              </div>
            </div>

            {/* Scene Status */}
            <div className="mb-4 p-3 bg-green-900/30 rounded-lg">
              <h3 className="font-semibold text-green-300 mb-2">🎬 Scene Status</h3>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-white/60">Scene Index:</span>
                  <span className="text-cyan-400">{currentSceneIndex}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Scene Type:</span>
                  <span className="text-cyan-400">{currentScene?.type || 'N/A'}</span>
                </div>
                {currentScene?.startTime !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-white/60">Scene Start:</span>
                    <span className="text-cyan-400">{currentScene.startTime.toFixed(2)}s</span>
                  </div>
                )}
                {currentScene?.duration !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-white/60">Scene Duration:</span>
                    <span className="text-cyan-400">{currentScene.duration.toFixed(2)}s</span>
                  </div>
                )}
              </div>
            </div>

            {/* All Scenes in Phase */}
            {currentPhase?.scenes && (
              <div className="mb-4 p-3 bg-yellow-900/30 rounded-lg">
                <h3 className="font-semibold text-yellow-300 mb-2">📋 All Scenes ({currentPhase.scenes.length})</h3>
                <div className="text-xs space-y-1">
                  {currentPhase.scenes.map((scene: any, idx: number) => (
                    <div
                      key={idx}
                      className={`p-2 rounded ${idx === currentSceneIndex ? 'bg-green-500/20 border border-green-500' : 'bg-white/5'}`}
                    >
                      <div className="flex justify-between">
                        <span className="text-white/70">Scene {idx}:</span>
                        <span className="text-cyan-400">{scene.type}</span>
                      </div>
                      {scene.startTime !== undefined && (
                        <div className="text-white/50">
                          {scene.startTime.toFixed(1)}s - {(scene.startTime + (scene.duration || 0)).toFixed(1)}s
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Scene Content Preview */}
            {currentScene?.content && (
              <div className="p-3 bg-pink-900/30 rounded-lg">
                <h3 className="font-semibold text-pink-300 mb-2">📝 Scene Content</h3>
                <pre className="text-xs text-white/70 overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(currentScene.content, null, 2).slice(0, 300)}...
                </pre>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default V7DebugPanel;
