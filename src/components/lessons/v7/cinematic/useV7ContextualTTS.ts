// Hook para gerar e tocar áudios TTS contextuais via ElevenLabs
// Usado durante Quiz e Playground para sussurros/hints

import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ContextualHint {
  triggerAfter: number; // segundos
  text: string;
  volume: number;
}

interface GeneratedAudio {
  text: string;
  audioUrl: string;
}

interface UseV7ContextualTTSProps {
  hints: ContextualHint[];
  whisper?: boolean;
  voiceId?: string;
  enabled?: boolean;
}

export const useV7ContextualTTS = ({
  hints,
  whisper = true,
  voiceId,
  enabled = true
}: UseV7ContextualTTSProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAudios, setGeneratedAudios] = useState<GeneratedAudio[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const audioUrlsRef = useRef<string[]>([]);

  // Gera todos os áudios de uma vez (batch)
  const generateAllAudios = useCallback(async () => {
    if (!enabled || hints.length === 0) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const texts = hints.map(h => h.text);
      
      console.log(`[useV7ContextualTTS] 🎵 Generating ${texts.length} contextual audios...`);
      
      const { data, error: fnError } = await supabase.functions.invoke('elevenlabs-tts-contextual', {
        body: { texts, whisper, voiceId }
      });
      
      if (fnError) {
        throw new Error(fnError.message);
      }
      
      if (!data?.results) {
        throw new Error('No results returned');
      }
      
      // Converter base64 para URLs de áudio
      const audios: GeneratedAudio[] = [];
      
      for (const result of data.results) {
        if (result.success && result.audioBase64) {
          // Criar blob URL a partir do base64
          const audioBlob = base64ToBlob(result.audioBase64, 'audio/mpeg');
          const audioUrl = URL.createObjectURL(audioBlob);
          
          audios.push({
            text: result.text,
            audioUrl
          });
          
          audioUrlsRef.current.push(audioUrl);
        }
      }
      
      setGeneratedAudios(audios);
      console.log(`[useV7ContextualTTS] ✅ Generated ${audios.length} audios`);
      
      return audios;
      
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate audios';
      console.error('[useV7ContextualTTS] ❌ Error:', message);
      setError(message);
      return [];
    } finally {
      setIsGenerating(false);
    }
  }, [enabled, hints, whisper, voiceId]);

  // ✅ V7-v3: Inicia os timers para tocar os áudios em LOOP até o usuário responder
  const loopIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const startContextualHints = useCallback(async () => {
    if (!enabled || hints.length === 0) return;
    
    // Gerar áudios se ainda não foram gerados
    let audios = generatedAudios;
    if (audios.length === 0) {
      audios = await generateAllAudios() || [];
    }
    
    if (audios.length === 0) {
      console.log('[useV7ContextualTTS] ⚠️ No audios to play');
      return;
    }
    
    // Limpar timers anteriores
    timersRef.current.forEach(t => clearTimeout(t));
    timersRef.current = [];
    if (loopIntervalRef.current) {
      clearInterval(loopIntervalRef.current);
    }
    
    // Calcular duração total de um ciclo
    const lastHint = hints[hints.length - 1];
    const cycleDuration = lastHint.triggerAfter + 15; // +15s após último hint
    
    // Função para agendar um ciclo de hints
    const scheduleHintCycle = (cycleOffset: number = 0) => {
      hints.forEach((hint, index) => {
        if (index >= audios.length) return;
        
        const timer = setTimeout(() => {
          playAudio(audios[index].audioUrl, hint.volume);
        }, (hint.triggerAfter + cycleOffset) * 1000);
        
        timersRef.current.push(timer);
      });
    };
    
    // Primeiro ciclo
    scheduleHintCycle(0);
    
    // ✅ V7-v3: Loop infinito - repetir hints a cada cycleDuration segundos
    loopIntervalRef.current = setInterval(() => {
      // Limpar timers antigos do ciclo anterior
      timersRef.current.forEach(t => clearTimeout(t));
      timersRef.current = [];
      
      // Agendar novo ciclo
      scheduleHintCycle(0);
      console.log('[useV7ContextualTTS] 🔄 Looping contextual hints...');
    }, cycleDuration * 1000);
    
    console.log(`[useV7ContextualTTS] ⏰ Scheduled ${hints.length} contextual hints (looping every ${cycleDuration}s)`);
  }, [enabled, hints, generatedAudios, generateAllAudios]);

  // Toca um áudio específico
  const playAudio = useCallback((audioUrl: string, volume: number = 0.5) => {
    // Parar áudio anterior
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    
    const audio = new Audio(audioUrl);
    audio.volume = volume;
    audioRef.current = audio;
    
    audio.play().catch(err => {
      console.error('[useV7ContextualTTS] ❌ Failed to play:', err);
    });
    
    console.log(`[useV7ContextualTTS] 🔊 Playing contextual audio (volume: ${volume})`);
  }, []);

  // Para todos os áudios, timers e loops
  const stopAll = useCallback(() => {
    // Parar timers
    timersRef.current.forEach(t => clearTimeout(t));
    timersRef.current = [];
    
    // Parar loop
    if (loopIntervalRef.current) {
      clearInterval(loopIntervalRef.current);
      loopIntervalRef.current = null;
    }
    
    // Parar áudio atual
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    
    console.log('[useV7ContextualTTS] 🛑 Stopped all contextual hints and loops');
  }, []);

  // Limpar URLs ao desmontar
  const cleanup = useCallback(() => {
    stopAll();
    
    // Revogar URLs de blob
    audioUrlsRef.current.forEach(url => {
      URL.revokeObjectURL(url);
    });
    audioUrlsRef.current = [];
    
    setGeneratedAudios([]);
  }, [stopAll]);

  return {
    isGenerating,
    generatedAudios,
    error,
    generateAllAudios,
    startContextualHints,
    stopAll,
    cleanup,
    playAudio
  };
};

// Helper para converter base64 em Blob
function base64ToBlob(base64: string, mimeType: string): Blob {
  const byteCharacters = atob(base64);
  const byteNumbers = new Uint8Array(byteCharacters.length);
  
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  
  return new Blob([byteNumbers], { type: mimeType });
}

export default useV7ContextualTTS;
