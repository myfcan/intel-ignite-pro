// ============================================
// 3D BACKGROUND CONTROLS - Settings Panel
// ============================================

import { memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings2, Sparkles, Gauge, Eye, RotateCcw, X, Zap } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useBackground3D } from '@/contexts/Background3DContext';

export const Background3DControls = memo(() => {
  const [isOpen, setIsOpen] = useState(false);
  const { settings, updateSettings, resetSettings, toggleEnabled } = useBackground3D();

  return (
    <>
      {/* Floating Toggle Button - More prominent */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-[9999] w-14 h-14 rounded-full bg-gradient-to-br from-primary to-purple-600 shadow-xl shadow-primary/30 flex items-center justify-center text-white hover:scale-105 transition-all border-2 border-white/20"
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.95 }}
        title="Configurações 3D"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, type: "spring" }}
      >
        <Settings2 className="w-6 h-6" />
      </motion.button>

      {/* Settings Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 right-4 z-50 w-80 bg-card/95 backdrop-blur-md border border-border rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/50">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground">Efeitos 3D</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-5">
              {/* Master Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium text-foreground">Ativar 3D</span>
                </div>
                <Switch
                  checked={settings.enabled}
                  onCheckedChange={toggleEnabled}
                />
              </div>

              <div className={`space-y-5 transition-opacity ${!settings.enabled ? 'opacity-40 pointer-events-none' : ''}`}>
                {/* Bloom Intensity */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      <span className="text-sm text-foreground">Intensidade Bloom</span>
                    </div>
                    <span className="text-xs text-muted-foreground font-mono">
                      {(settings.bloomIntensity * 100).toFixed(0)}%
                    </span>
                  </div>
                  <Slider
                    value={[settings.bloomIntensity]}
                    onValueChange={([v]) => updateSettings({ bloomIntensity: v })}
                    min={0}
                    max={2}
                    step={0.1}
                    className="w-full"
                  />
                </div>

                {/* Particle Speed */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Gauge className="w-4 h-4 text-cyan-400" />
                      <span className="text-sm text-foreground">Velocidade Partículas</span>
                    </div>
                    <span className="text-xs text-muted-foreground font-mono">
                      {(settings.particleSpeed * 100).toFixed(0)}%
                    </span>
                  </div>
                  <Slider
                    value={[settings.particleSpeed]}
                    onValueChange={([v]) => updateSettings({ particleSpeed: v })}
                    min={0.1}
                    max={2}
                    step={0.1}
                    className="w-full"
                  />
                </div>

                {/* Opacity */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-blue-400" />
                      <span className="text-sm text-foreground">Opacidade</span>
                    </div>
                    <span className="text-xs text-muted-foreground font-mono">
                      {(settings.opacity * 100).toFixed(0)}%
                    </span>
                  </div>
                  <Slider
                    value={[settings.opacity]}
                    onValueChange={([v]) => updateSettings({ opacity: v })}
                    min={0}
                    max={1}
                    step={0.05}
                    className="w-full"
                  />
                </div>

                {/* Particle Count (Performance) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-foreground">Qtd. Partículas</span>
                    </div>
                    <span className="text-xs text-muted-foreground font-mono">
                      {(settings.particleCount * 100).toFixed(0)}%
                    </span>
                  </div>
                  <Slider
                    value={[settings.particleCount]}
                    onValueChange={([v]) => updateSettings({ particleCount: v })}
                    min={0.25}
                    max={1}
                    step={0.25}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Reduza para melhor performance
                  </p>
                </div>
              </div>

              {/* Reset Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={resetSettings}
                className="w-full"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Restaurar Padrões
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});

Background3DControls.displayName = 'Background3DControls';
