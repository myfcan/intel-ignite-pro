import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, SkipForward, SkipBack, ChevronLeft, Volume2, Sparkles } from 'lucide-react';
import { GuidedLessonProps, WordTimestamp } from '@/types/guidedLesson';
import { SyncedText } from './SyncedText';
import { AnimatedMarkdown } from './AnimatedMarkdown';

export const GuidedLesson = ({ lessonData, onComplete, audioUrl, wordTimestamps = [] }: GuidedLessonProps) => {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [activeSection, setActiveSection] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [audioLoaded, setAudioLoaded] = useState(false);
  const [isSkippingForward, setIsSkippingForward] = useState(false);
  const [isSkippingBackward, setIsSkippingBackward] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setAudioLoaded(true);
      console.log('🎵 DURAÇÃO TOTAL DO ÁUDIO:', Math.floor(audio.duration), 'segundos');
      console.log('📋 TIMESTAMPS CONFIGURADOS:');
      lessonData.sections.forEach((section, idx) => {
        console.log(`  ${idx}: ${section.timestamp}s - "${section.speechBubbleText}"`);
      });
      // Autoplay após carregar
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.log('Autoplay bloqueado:', err);
      });
    };

    const handleTimeUpdate = () => {
      const currentSeconds = Math.floor(audio.currentTime);
      setCurrentTime(audio.currentTime);
      
      // Log a cada 5 segundos para ajudar no mapeamento
      if (currentSeconds % 5 === 0 && currentSeconds !== Math.floor(currentTime)) {
        console.log(`⏱️ Tempo atual: ${currentSeconds}s`);
      }
      
      // Determinar seção ativa baseada no tempo
      const currentSectionIndex = lessonData.sections.findIndex((section, index) => {
        const nextSection = lessonData.sections[index + 1];
        return audio.currentTime >= section.timestamp && 
               (!nextSection || audio.currentTime < nextSection.timestamp);
      });
      
      if (currentSectionIndex !== -1 && currentSectionIndex !== activeSection) {
        console.log(`\n🎯 ===== MUDANÇA DE SEÇÃO =====`);
        console.log(`   Tempo: ${Math.floor(audio.currentTime)}s`);
        console.log(`   Seção ${currentSectionIndex}: "${lessonData.sections[currentSectionIndex].speechBubbleText}"`);
        console.log(`   Timestamp configurado: ${lessonData.sections[currentSectionIndex].timestamp}s`);
        console.log(`===============================\n`);
        setActiveSection(currentSectionIndex);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl, lessonData.sections, activeSection]);

  // Separate effect for smooth scrolling
  useEffect(() => {
    if (activeSection !== null && sectionRefs.current[activeSection]) {
      const element = sectionRefs.current[activeSection];
      const yOffset = -120; // Offset para não ficar colado no topo
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }, [activeSection]);

  const togglePlay = () => {
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
    setIsSkippingBackward(true);
    audio.currentTime = Math.max(0, audio.currentTime - 10);
    setTimeout(() => setIsSkippingBackward(false), 300);
  };

  const skipForward = () => {
    const audio = audioRef.current;
    if (!audio) return;
    setIsSkippingForward(true);
    audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 10);
    setTimeout(() => setIsSkippingForward(false), 300);
  };

  const cyclePlaybackRate = () => {
    const rates = [1, 1.25, 1.5, 2];
    const currentIndex = rates.indexOf(playbackRate);
    const nextRate = rates[(currentIndex + 1) % rates.length];
    
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audio.currentTime = percent * (audio.duration || 0);
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F0522] to-[#1A0B2E] text-white pb-32">
      {/* Header Fixo */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-xl border-b border-purple-500/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-purple-800/50 rounded-lg transition-all group"
              title="Voltar"
            >
              <ChevronLeft className="w-5 h-5 text-purple-300 group-hover:text-white transition-colors" />
            </button>
            
            <div className="flex-1">
              <h1 className="text-xl font-bold text-white">{lessonData.title}</h1>
              <p className="text-sm text-purple-300">{lessonData.trackName}</p>
            </div>
            
            <button 
              onClick={onComplete}
              className="px-4 py-2 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-lg font-medium hover:shadow-lg hover:shadow-cyan-400/25 transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">Ir para Exercício</span>
              <span className="sm:hidden">Exercício</span>
            </button>
          </div>
          
          {/* Barra de progresso melhorada */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-purple-300">Progresso da aula</span>
              <span className="text-white font-semibold">{Math.round(progressPercent)}%</span>
            </div>
            <div className="h-2 bg-purple-900/50 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-all duration-500 relative"
                style={{ width: `${progressPercent}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="container mx-auto px-4 pt-36 pb-48">
        <div className="max-w-4xl mx-auto">
          {/* MAIA Narradora */}
          <div className="mb-12 flex flex-col items-center">
            <div className="mb-6 animate-fade-in">
              <img 
                src="/maia-avatar.png" 
                alt="MAIA" 
                className="w-32 h-32 object-contain drop-shadow-2xl"
              />
            </div>
            
            {/* Balão de fala sincronizado */}
            <div className="relative max-w-2xl w-full">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-cyan-400/30 shadow-2xl relative overflow-hidden">
                {isPlaying && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full animate-ping" />
                )}
                <p className="text-lg text-white text-center font-medium leading-relaxed">
                  {lessonData.sections[activeSection]?.speechBubbleText}
                </p>
              </div>
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[12px] border-b-white/10" />
            </div>
          </div>

          {/* Seções de Conteúdo */}
          <div className="space-y-8">
            {lessonData.sections.map((section, index) => (
              <div
                key={section.id}
                id={`section-${index}`}
                ref={(el) => (sectionRefs.current[index] = el)}
                className={`
                  transition-all duration-500 transform
                  ${activeSection >= index 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-30 translate-y-4'
                  }
                `}
              >
                <div className={`
                  bg-purple-900/10 backdrop-blur-sm rounded-2xl p-8 border
                  ${activeSection === index 
                    ? 'border-cyan-400/50 shadow-2xl shadow-cyan-500/20 ring-2 ring-cyan-400/20' 
                    : 'border-purple-500/20'
                  }
                `}>
                  {/* Indicador de seção */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-all
                      ${activeSection === index 
                        ? 'bg-gradient-to-r from-cyan-400 to-purple-500 text-white scale-110' 
                        : 'bg-purple-900/30 text-purple-400'
                      }
                    `}>
                      {index + 1}
                    </div>
                    {activeSection === index && (
                      <span className="text-cyan-400 text-sm font-medium animate-pulse flex items-center gap-2">
                        <span className="w-2 h-2 bg-cyan-400 rounded-full" />
                        Você está aqui
                      </span>
                    )}
                  </div>
                  
                  {/* Conteúdo da seção */}
                  <div className="prose prose-invert prose-lg max-w-none prose-headings:text-white prose-p:text-purple-100 prose-strong:text-cyan-400 prose-ul:text-purple-100 prose-li:text-purple-100 prose-li:marker:text-cyan-400">
                    {wordTimestamps.length > 0 ? (
                      <SyncedText 
                        content={section.content}
                        isActive={index === activeSection}
                        wordTimestamps={wordTimestamps}
                        currentTime={currentTime}
                      />
                    ) : (
                      <AnimatedMarkdown 
                        content={section.content}
                        isActive={index === activeSection}
                        speed={60}
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Audio Player Fixo no Rodapé - VERSÃO MELHORADA */}
      <footer className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-xl border-t border-purple-500/20 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-6xl mx-auto">
            {audioUrl && (
              <>
                <audio ref={audioRef} src={audioUrl} preload="auto" />
                
                {/* Desktop layout */}
                <div className="hidden md:flex items-center justify-between gap-4">
                  {/* Controles de navegação */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={skipBackward}
                      disabled={!audioLoaded}
                      className={`
                        w-11 h-11 bg-purple-800/50 hover:bg-purple-700/50 disabled:opacity-30 disabled:cursor-not-allowed rounded-full flex items-center justify-center text-white transition-all
                        ${isSkippingBackward ? 'scale-90' : 'scale-100'}
                      `}
                      title="Voltar 10 segundos"
                    >
                      <SkipBack size={20} />
                    </button>
                    
                    <button
                      onClick={togglePlay}
                      disabled={!audioLoaded}
                      className="w-14 h-14 bg-gradient-to-r from-cyan-400 to-purple-500 disabled:opacity-30 disabled:cursor-not-allowed rounded-full flex items-center justify-center text-white hover:shadow-lg hover:shadow-cyan-400/25 transition-all hover:scale-105 active:scale-95"
                    >
                      {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
                    </button>
                    
                    <button
                      onClick={skipForward}
                      disabled={!audioLoaded}
                      className={`
                        w-11 h-11 bg-purple-800/50 hover:bg-purple-700/50 disabled:opacity-30 disabled:cursor-not-allowed rounded-full flex items-center justify-center text-white transition-all
                        ${isSkippingForward ? 'scale-90' : 'scale-100'}
                      `}
                      title="Avançar 10 segundos"
                    >
                      <SkipForward size={20} />
                    </button>
                  </div>
                  
                  {/* Barra de progresso do áudio */}
                  <div className="flex-1 flex items-center gap-3">
                    <Volume2 className="text-cyan-400 flex-shrink-0" size={20} />
                    
                    <span className="text-sm text-purple-300 font-medium min-w-[45px] tabular-nums">
                      {formatTime(currentTime)}
                    </span>
                    
                    <div 
                      className="flex-1 h-3 bg-purple-900/30 rounded-full overflow-hidden cursor-pointer hover:h-4 transition-all group"
                      onClick={handleProgressBarClick}
                      title="Clique para pular para um ponto específico"
                    >
                      <div 
                        className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-all relative"
                        style={{ width: `${progressPercent}%` }}
                      >
                        <div className="absolute right-0 top-0 w-1 h-full bg-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                    
                    <span className="text-sm text-purple-300 font-medium min-w-[45px] tabular-nums">
                      {formatTime(duration)}
                    </span>
                  </div>
                  
                  <button
                    onClick={cyclePlaybackRate}
                    disabled={!audioLoaded}
                    className="px-5 py-3 bg-purple-600/80 hover:bg-purple-600 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl text-white font-bold transition-all min-w-[70px] text-lg hover:scale-105 active:scale-95"
                  >
                    {playbackRate}x
                  </button>
                  
                  <button
                    onClick={onComplete}
                    className="px-6 py-3 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-xl text-white font-semibold hover:shadow-lg hover:shadow-cyan-400/25 transition-all whitespace-nowrap hover:scale-105 active:scale-95"
                  >
                    Continuar para Exercício
                  </button>
                </div>
                
                {/* Mobile layout */}
                <div className="flex md:hidden flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <Volume2 className="text-cyan-400 flex-shrink-0" size={18} />
                    
                    <div className="flex-1 flex flex-col gap-1">
                      <div 
                        className="h-3 bg-purple-900/30 rounded-full overflow-hidden cursor-pointer active:h-4 transition-all"
                        onClick={handleProgressBarClick}
                      >
                        <div 
                          className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-all"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      
                      <div className="flex justify-between text-xs text-purple-300 font-medium tabular-nums">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={skipBackward}
                        disabled={!audioLoaded}
                        className={`
                          w-10 h-10 bg-purple-800/50 active:bg-purple-700/50 disabled:opacity-30 rounded-full flex items-center justify-center text-white
                          ${isSkippingBackward ? 'scale-90' : 'scale-100'}
                        `}
                      >
                        <SkipBack size={18} />
                      </button>
                      
                      <button
                        onClick={togglePlay}
                        disabled={!audioLoaded}
                        className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-purple-500 disabled:opacity-30 rounded-full flex items-center justify-center text-white active:scale-95"
                      >
                        {isPlaying ? <Pause size={22} /> : <Play size={22} className="ml-0.5" />}
                      </button>
                      
                      <button
                        onClick={skipForward}
                        disabled={!audioLoaded}
                        className={`
                          w-10 h-10 bg-purple-800/50 active:bg-purple-700/50 disabled:opacity-30 rounded-full flex items-center justify-center text-white
                          ${isSkippingForward ? 'scale-90' : 'scale-100'}
                        `}
                      >
                        <SkipForward size={18} />
                      </button>
                      
                      <button
                        onClick={cyclePlaybackRate}
                        disabled={!audioLoaded}
                        className="px-3 py-2 bg-purple-600/80 active:bg-purple-600 disabled:opacity-30 rounded-lg text-white font-bold text-sm min-w-[50px]"
                      >
                        {playbackRate}x
                      </button>
                    </div>
                    
                    <button
                      onClick={onComplete}
                      className="px-4 py-2 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-lg text-white font-semibold text-sm active:scale-95"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              </>
            )}

            {!audioUrl && (
              <div className="text-center py-4">
                <p className="text-sm text-purple-300 mb-3">
                  Áudio não disponível para esta aula
                </p>
                <button onClick={onComplete} className="px-6 py-3 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-xl text-white font-semibold">
                  Continuar para Exercício
                </button>
              </div>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};
