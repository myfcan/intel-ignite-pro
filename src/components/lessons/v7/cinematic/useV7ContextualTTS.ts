// Hook para gerar e tocar áudios TTS contextuais via ElevenLabs
// Usado durante Quiz e Playground para sussurros/hints
// ✅ V7-v4: Cache persistente no Supabase Storage

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

// ✅ Gerar hash único para o texto (para cache)
function hashText(text: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
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

  // ✅ V7-v4: Verificar se áudio já existe no cache
  const checkCachedAudio = useCallback(async (text: string): Promise<string | null> => {
    const hash = hashText(text);
    const fileName = `hint_${hash}.mp3`;
    
    // Verificar se arquivo existe no Storage
    const { data } = await supabase.storage
      .from('tts-cache')
      .getPublicUrl(fileName);
    
    // Verificar se realmente existe fazendo HEAD request
    try {
      const response = await fetch(data.publicUrl, { method: 'HEAD' });
      if (response.ok) {
        console.log(`[useV7ContextualTTS] ✅ Cache HIT: "${text.substring(0, 30)}..."`);
        return data.publicUrl;
      }
    } catch {
      // Arquivo não existe
    }
    
    return null;
  }, []);

  // ✅ V7-v4: Salvar áudio no cache
  const cacheAudio = useCallback(async (text: string, audioBase64: string): Promise<string> => {
    const hash = hashText(text);
    const fileName = `hint_${hash}.mp3`;
    
    // Converter base64 para blob
    const audioBlob = base64ToBlob(audioBase64, 'audio/mpeg');
    
    // Upload para Storage
    const { error: uploadError } = await supabase.storage
      .from('tts-cache')
      .upload(fileName, audioBlob, {
        contentType: 'audio/mpeg',
        upsert: true
      });
    
    if (uploadError) {
      console.error('[useV7ContextualTTS] ❌ Cache upload error:', uploadError);
      // Fallback: retornar blob URL local
      return URL.createObjectURL(audioBlob);
    }
    
    // Obter URL pública
    const { data } = supabase.storage
      .from('tts-cache')
      .getPublicUrl(fileName);
    
    console.log(`[useV7ContextualTTS] 💾 Cached: "${text.substring(0, 30)}..."`);
    return data.publicUrl;
  }, []);

  // Gera todos os áudios (usando cache quando disponível)
  const generateAllAudios = useCallback(async () => {
    if (!enabled || hints.length === 0) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      console.log(`[useV7ContextualTTS] 🎵 Checking cache for ${hints.length} hints...`);
      
      const audios: GeneratedAudio[] = [];
      const textsToGenerate: { index: number; text: string }[] = [];
      
      // ✅ Primeiro, verificar quais já estão em cache
      for (let i = 0; i < hints.length; i++) {
        const hint = hints[i];
        const cachedUrl = await checkCachedAudio(hint.text);
        
        if (cachedUrl) {
          audios[i] = { text: hint.text, audioUrl: cachedUrl };
        } else {
          textsToGenerate.push({ index: i, text: hint.text });
        }
      }
      
      // ✅ Gerar apenas os que não estão em cache
      if (textsToGenerate.length > 0) {
        console.log(`[useV7ContextualTTS] 🔄 Generating ${textsToGenerate.length} new audios...`);
        
        const { data, error: fnError } = await supabase.functions.invoke('elevenlabs-tts-contextual', {
          body: { 
            texts: textsToGenerate.map(t => t.text), 
            whisper, 
            voiceId 
          }
        });
        
        if (fnError) {
          throw new Error(fnError.message);
        }
        
        if (!data?.results) {
          throw new Error('No results returned');
        }
        
        // Processar resultados e salvar em cache
        for (let i = 0; i < data.results.length; i++) {
          const result = data.results[i];
          const originalIndex = textsToGenerate[i].index;
          
          if (result.success && result.audioBase64) {
            // Salvar no cache e obter URL
            const audioUrl = await cacheAudio(result.text, result.audioBase64);
            audios[originalIndex] = { text: result.text, audioUrl };
          }
        }
      }
      
      // Filtrar nulls e ordenar
      const finalAudios = audios.filter(Boolean);
      setGeneratedAudios(finalAudios);
      
      console.log(`[useV7ContextualTTS] ✅ Ready: ${finalAudios.length} audios (${hints.length - textsToGenerate.length} from cache)`);
      
      return finalAudios;
      
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate audios';
      console.error('[useV7ContextualTTS] ❌ Error:', message);
      setError(message);
      return [];
    } finally {
      setIsGenerating(false);
    }
  }, [enabled, hints, whisper, voiceId, checkCachedAudio, cacheAudio]);

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

  // Limpar URLs ao desmontar (não precisa mais revogar blob URLs pois usamos Storage)
  const cleanup = useCallback(() => {
    stopAll();
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
