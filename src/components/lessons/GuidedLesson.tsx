import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Sparkles, ChevronLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';
import { GuidedLessonProps } from '@/types/guidedLesson';

export function GuidedLesson({ lessonData, onComplete, audioUrl, wordTimestamps }: GuidedLessonProps) {
  const navigate = useNavigate();
  const [currentSection, setCurrentSection] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(lessonData.duration || 0);
  const [sectionJustChanged, setSectionJustChanged] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const hasScrolledRef = useRef<{ [key: number]: boolean }>({});
  const lastSectionRef = useRef<number>(0);
  
  useEffect(() => {
    const audio = audioRef.current;
    
    // Inicializar o ref na primeira montagem
    lastSectionRef.current = 0;
    
    console.log('🔍 [DEBUG] audioUrl recebido:', audioUrl);
    console.log('🔍 [DEBUG] audioRef.current:', audio);
    
    if (!audio) {
      console.error('❌ [ÁUDIO] Elemento de áudio não encontrado');
      return;
    }
    
    if (!audioUrl) {
      console.error('❌ [ÁUDIO] URL do áudio não fornecida');
      return;
    }
    
    console.log('✅ [ÁUDIO] Inicializando áudio:', audioUrl);
    console.log('📋 [ÁUDIO] Seções:', lessonData.sections.map(s => `${s.id} (${s.timestamp}s)`));
    
    const handleTimeUpdate = () => {
      const time = audio.currentTime;
      setCurrentTime(time);
      
      // Buffer de 2 segundos para sincronização mais precisa com o áudio
      const SYNC_BUFFER = 2;
      
      const sectionIndex = lessonData.sections.findIndex((section, index) => {
        const nextSection = lessonData.sections[index + 1];
        const sectionStart = section.timestamp + SYNC_BUFFER;
        const sectionEnd = nextSection ? nextSection.timestamp + SYNC_BUFFER : Infinity;
        return time >= sectionStart && time < sectionEnd;
      });
      
      if (sectionIndex !== -1 && sectionIndex !== lastSectionRef.current) {
        console.log(`📍 [SEÇÃO] Mudando para seção ${sectionIndex}: ${lessonData.sections[sectionIndex].id}`);
        lastSectionRef.current = sectionIndex;
        setCurrentSection(sectionIndex);
        
        // Ativar efeito visual de mudança de seção
        setSectionJustChanged(true);
        setTimeout(() => setSectionJustChanged(false), 1000);
        
        // Scroll suave para a nova seção apenas se ainda não scrollou para ela
        if (!hasScrolledRef.current[sectionIndex]) {
          const sectionElement = document.getElementById(`section-${sectionIndex}`);
          if (sectionElement) {
            // Offset ajustado para alinhar com o topo do box da MAIA
            const yOffset = -80;
            const y = sectionElement.getBoundingClientRect().top + window.pageYOffset + yOffset;
            console.log(`📜 [SCROLL] Rolando para seção ${sectionIndex}`);
            window.scrollTo({ top: y, behavior: 'smooth' });
            hasScrolledRef.current[sectionIndex] = true;
          }
        }
      }
    };
    
    const handleLoadedMetadata = () => {
      console.log(`✅ [ÁUDIO] Carregado com sucesso! Duração: ${audio.duration}s`);
      setDuration(audio.duration);
      // Tentar dar play automaticamente
      audio.play().then(() => {
        console.log('🎵 [AUTOPLAY] Áudio iniciado automaticamente');
        setIsPlaying(true);
      }).catch(err => {
        console.warn('⚠️ [AUTOPLAY] Navegador bloqueou autoplay:', err);
      });
    };
    
    const handleError = (e: Event) => {
      console.error('❌ [ÁUDIO] Erro ao carregar:', e);
      console.error('❌ [ÁUDIO] URL problemática:', audioUrl);
    };
    
    const handleCanPlay = () => {
      console.log('🎵 [ÁUDIO] Pronto para reproduzir');
    };
    
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('error', handleError);
    audio.addEventListener('canplay', handleCanPlay);
    
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, [lessonData.sections, audioUrl]);
  
  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };
  
  const skipBackward = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, audio.currentTime - 10);
  };
  
  const skipForward = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 10);
  };
  
  const cycleSpeed = () => {
    const speeds = [1, 1.25, 1.5, 2];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    setPlaybackSpeed(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };
  
  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audio.currentTime = percent * (audio.duration || 0);
  };
  
  const jumpToSection = (index: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const section = lessonData.sections[index];
    if (section && section.timestamp !== undefined) {
      audio.currentTime = section.timestamp;
      hasScrolledRef.current[index] = false;
    }
  };
  
  const formatTime = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-md">
        <div className="w-full px-4 sm:px-6 py-3">
          <div className="flex items-center gap-3 max-w-[1920px] mx-auto">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-lg transition-all flex-shrink-0">
              <ChevronLeft className="w-5 h-5 text-slate-700" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-sm sm:text-base font-semibold text-slate-900 truncate">{lessonData.title}</h1>
              <p className="text-xs text-slate-600 truncate">{lessonData.trackName}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xs font-semibold bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">{Math.round(progress)}%</span>
              <div className="w-20 sm:w-24 h-1 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
            <button onClick={onComplete} className="px-3 py-1.5 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-lg text-xs font-medium text-white shadow-md hover:shadow-lg transition-all flex-shrink-0">
              <Sparkles className="w-3 h-3 inline mr-1" />
              <span className="hidden sm:inline">Exercício</span>
            </button>
          </div>
        </div>
      </header>

      <div className="w-full px-3 sm:px-6 pt-20 pb-32">
        <div className="w-full max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-[300px_1fr] gap-6 lg:gap-12">
            
            <aside className="hidden lg:block">
              <div className="sticky top-24 space-y-3">
                
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 border border-slate-200/50 shadow-xl">
                  <div className="flex justify-center mb-3">
                    <div className="relative group cursor-pointer">
                      {/* MAIA com animações otimizadas (sem piscamento) */}
                      <img 
                        src="/maia-avatar-v3.png" 
                        alt="MAIA" 
                        className={`
                          w-44 h-44 object-contain
                          animate-fly-in-rasante animate-float
                          transition-all duration-300 ease-in-out
                          lg:group-hover:scale-105 cursor-pointer
                          ${isPlaying ? 'animate-pulse-glow brightness-110' : ''}
                        `}
                        style={{
                          filter: !isPlaying 
                            ? 'drop-shadow(0 25px 25px rgb(0 0 0 / 0.15))' 
                            : undefined
                        }}
                      />
                      {/* Indicadores de áudio melhorados */}
                      {isPlaying && (
                        <div className="absolute -bottom-1 -right-1 flex gap-1">
                          <span className="w-2.5 h-2.5 bg-cyan-400 rounded-full animate-audio-bounce shadow-cyan-glow" style={{ animationDelay: '0ms' }} />
                          <span className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-audio-bounce shadow-lg" style={{ animationDelay: '150ms' }} />
                          <span className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-audio-bounce shadow-pink-glow" style={{ animationDelay: '300ms' }} />
                        </div>
                      )}
                      
                      {/* Balão fixo ao lado da cabeça */}
                      <div className="absolute -top-2 -right-12 hidden lg:block">
                        <div className="relative bg-white rounded-xl px-4 py-2.5 border-2 border-cyan-200 shadow-lg">
                          <p className="text-xs font-medium text-slate-700 text-center">
                            Olá, Eu<br />sou a MAIA!
                          </p>
                          {/* Rabinho do balão apontando para a MAIA */}
                          <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45 w-3 h-3 bg-white border-l-2 border-b-2 border-cyan-200"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-3 border border-slate-200/50 shadow-xl">
                  <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Seções da aula</h3>
                  <div className="space-y-1.5">
                    {lessonData.sections.map((section, index) => (
                      <button
                        key={section.id}
                        onClick={() => jumpToSection(index)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-[10px] font-medium transition-all ${
                          currentSection === index
                            ? 'bg-gradient-to-r from-cyan-400 to-purple-500 text-white shadow-lg'
                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                            currentSection === index ? 'bg-white/20' : 'bg-slate-200'
                          }`}>
                            {index + 1}
                          </span>
                          <span className="truncate">{section.id}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                
              </div>
            </aside>
            
            <main className="space-y-4 sm:space-y-6 min-w-0">
              {lessonData.sections.map((section, index) => (
                <div
                  key={section.id}
                  id={`section-${index}`}
                  className={`transition-all duration-500 ${currentSection >= index ? 'opacity-100' : 'opacity-40'}`}
                >
                  <div className={`bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border shadow-xl transition-all relative overflow-hidden ${
                    currentSection === index
                      ? 'border-cyan-300/50 ring-2 ring-cyan-400/20'
                      : 'border-slate-200/50'
                  }`}>
                    {currentSection === index && sectionJustChanged && (
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 via-purple-400/20 to-transparent animate-[slide-in-right_0.8s_ease-out]" />
                    )}
                    <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-200/50 relative z-10">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base flex-shrink-0 shadow-md transition-all ${
                        currentSection === index
                          ? 'bg-gradient-to-r from-cyan-400 to-purple-500 text-white'
                          : 'bg-slate-100 text-slate-500'
                      } ${currentSection === index && sectionJustChanged ? 'duration-300 scale-125 shadow-2xl shadow-cyan-400/60 rotate-[360deg]' : 'duration-500 scale-100 rotate-0'}`}>
                        {index + 1}
                      </div>
                      {currentSection === index && (
                        <span className={`text-xs font-medium text-cyan-600 flex items-center gap-1.5 transition-all ${
                          sectionJustChanged ? 'scale-110 font-bold' : 'scale-100'
                        }`}>
                          <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
                          Você está aqui
                        </span>
                      )}
                    </div>
                    <div className="prose prose-slate prose-base max-w-none 
  prose-headings:text-slate-900 prose-headings:font-bold prose-headings:tracking-tight
  prose-h1:!text-xl sm:prose-h1:!text-2xl prose-h1:mb-4 prose-h1:leading-tight
  prose-h2:!text-lg sm:prose-h2:!text-xl prose-h2:mb-3 prose-h2:mt-6 prose-h2:leading-snug
  prose-h3:!text-base sm:prose-h3:!text-lg prose-h3:mb-2 prose-h3:mt-4
  prose-p:text-slate-700 prose-p:!text-base prose-p:leading-relaxed prose-p:mb-3
  prose-strong:text-cyan-600 prose-strong:font-semibold prose-strong:px-0.5
  prose-em:text-slate-600 prose-em:not-italic prose-em:font-medium
  prose-ul:my-3 prose-ul:space-y-2 prose-ul:!text-base
  prose-ol:my-3 prose-ol:space-y-2 prose-ol:!text-base
  prose-li:text-slate-700 prose-li:!text-base prose-li:leading-relaxed prose-li:pl-1
  prose-li:marker:text-cyan-500
  prose-blockquote:border-l-4 prose-blockquote:border-l-cyan-400 
  prose-blockquote:bg-gradient-to-r prose-blockquote:from-cyan-50/60 prose-blockquote:to-blue-50/40
  prose-blockquote:py-3 prose-blockquote:px-4 prose-blockquote:rounded-r-lg 
  prose-blockquote:shadow-sm prose-blockquote:my-4
  prose-blockquote:text-slate-700 prose-blockquote:!text-base
  prose-code:text-purple-600 prose-code:bg-purple-100 prose-code:px-1.5 prose-code:py-0.5 
  prose-code:rounded prose-code:!text-sm prose-code:font-mono prose-code:font-medium
  prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-pre:p-4 prose-pre:rounded-lg prose-pre:my-4 prose-pre:!text-sm
  prose-a:text-cyan-600 prose-a:no-underline prose-a:font-medium hover:prose-a:text-cyan-700 hover:prose-a:underline
  prose-img:rounded-lg prose-img:shadow-md prose-img:my-6">
                      <ReactMarkdown>{section.visualContent}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}
            </main>
            
          </div>
        </div>
      </div>

      {/* MAIA Mobile - versão premium responsiva */}
      <div className="lg:hidden fixed bottom-24 sm:bottom-28 left-3 right-3 z-40 flex justify-center">
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-3 sm:p-4 border-2 border-cyan-300/60 shadow-2xl max-w-[340px] w-full">
          <div className="flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <img 
                src="/maia-avatar-v3.png" 
                alt="MAIA" 
                className={`
                  w-14 h-14 sm:w-16 sm:h-16 object-contain
                  animate-fly-in-rasante animate-float
                  ${isPlaying ? 'animate-pulse-glow brightness-110' : ''}
                `}
                style={{
                  filter: !isPlaying 
                    ? 'drop-shadow(0 10px 15px rgb(0 0 0 / 0.15))' 
                    : undefined
                }}
              />
              {/* Indicadores de áudio para mobile */}
              {isPlaying && (
                <div className="absolute -bottom-0.5 -right-0.5 flex gap-0.5">
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-audio-bounce shadow-sm shadow-cyan-400" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-audio-bounce shadow-sm" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-audio-bounce shadow-sm shadow-purple-400" style={{ animationDelay: '300ms' }} />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-slate-700 leading-snug font-medium">
                {lessonData.sections[currentSection]?.speechBubbleText || "Vamos aprender!"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-slate-700/50 z-50 shadow-2xl">
        <div className="w-full px-4 sm:px-6 py-3">
          <div className="max-w-[1800px] mx-auto">
            
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={skipBackward} className="w-9 h-9 bg-slate-700/50 hover:bg-slate-700 rounded-lg flex items-center justify-center text-white transition-all">
                  <SkipBack size={16} />
                </button>
                <button onClick={togglePlayPause} className="w-11 h-11 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all hover:scale-105">
                  {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
                </button>
                <button onClick={skipForward} className="w-9 h-9 bg-slate-700/50 hover:bg-slate-700 rounded-lg flex items-center justify-center text-white transition-all">
                  <SkipForward size={16} />
                </button>
              </div>
              
              <div className="flex-1 flex items-center gap-3 min-w-0">
                <Volume2 className="text-cyan-400 flex-shrink-0" size={18} />
                <span className="text-xs text-slate-400 font-medium tabular-nums">{formatTime(currentTime)}</span>
                <div className="flex-1 h-2.5 bg-slate-700/40 rounded-full overflow-hidden cursor-pointer hover:h-3 transition-all group min-w-0" onClick={handleProgressBarClick}>
                  <div className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-all relative" style={{ width: `${progress}%` }}>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                <span className="text-xs text-slate-400 font-medium tabular-nums">{formatTime(duration)}</span>
              </div>
              
              <button onClick={cycleSpeed} className="px-3 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-white font-bold text-xs transition-all min-w-[55px] flex-shrink-0">
                {playbackSpeed}x
              </button>
              <button onClick={onComplete} className="px-5 py-2 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-xl text-white font-semibold text-sm shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all whitespace-nowrap hover:scale-105 flex-shrink-0">
                Continuar
              </button>
            </div>
            
            <div className="flex md:hidden flex-col gap-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium tabular-nums">{formatTime(currentTime)}</span>
                <div className="flex-1 h-2.5 bg-slate-700/40 rounded-full overflow-hidden" onClick={handleProgressBarClick}>
                  <div className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-all" style={{ width: `${progress}%` }} />
                </div>
                <span className="text-xs text-slate-400 font-medium tabular-nums">{formatTime(duration)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button onClick={skipBackward} className="w-9 h-9 bg-slate-700/50 rounded-lg flex items-center justify-center text-white">
                    <SkipBack size={16} />
                  </button>
                  <button onClick={togglePlayPause} className="w-11 h-11 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-cyan-500/30">
                    {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
                  </button>
                  <button onClick={skipForward} className="w-9 h-9 bg-slate-700/50 rounded-lg flex items-center justify-center text-white">
                    <SkipForward size={16} />
                  </button>
                  <button onClick={cycleSpeed} className="px-3 py-2 bg-slate-700/50 rounded-lg text-white font-bold text-xs min-w-[50px]">
                    {playbackSpeed}x
                  </button>
                </div>
                <button onClick={onComplete} className="px-4 py-2 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-lg text-white font-semibold text-sm">
                  Continuar
                </button>
              </div>
            </div>
            
          </div>
        </div>
      </div>

      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          preload="auto"
          autoPlay
        />
      )}
    </div>
  );
}
