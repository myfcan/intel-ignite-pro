import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, SkipForward, SkipBack, ChevronLeft, Volume2, Sparkles } from 'lucide-react';
import { GuidedLessonProps } from '@/types/guidedLesson';
import { SyncedText } from './SyncedText';

export const GuidedLesson = ({ lessonData, onComplete, audioUrl }: GuidedLessonProps) => {
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

  // Remover função de timestamps - não mais necessária

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* ===== HEADER SUPER COMPACTO ===== */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-slate-200/50 shadow-sm">
        <div className="container mx-auto px-4 py-2.5">
          <div className="flex items-center gap-3">
            {/* Voltar */}
            <button
              onClick={() => navigate(-1)}
              className="p-1.5 hover:bg-slate-100 rounded-lg transition-all"
            >
              <ChevronLeft className="w-5 h-5 text-slate-700" />
            </button>
            
            {/* Título + Trilha */}
            <div className="flex-1 min-w-0">
              <h1 className="text-sm font-semibold text-slate-900 truncate">
                {lessonData.title}
              </h1>
              <p className="text-xs text-slate-600">{lessonData.trackName}</p>
            </div>
            
            {/* Progresso compacto */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
                {Math.round(progressPercent)}%
              </span>
              <div className="w-20 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
            
            {/* Exercício */}
            <button 
              onClick={onComplete}
              className="px-3 py-1.5 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-lg text-xs font-medium text-white shadow-md hover:shadow-lg transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3 h-3" />
              <span className="hidden sm:inline">Exercício</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* ===== CONTEÚDO PRINCIPAL ===== */}
      <div className="container mx-auto px-4 pt-20 pb-32">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-[360px_1fr] gap-6">
            
            {/* ===== SIDEBAR: MAIA SEMPRE VISÍVEL ===== */}
            <aside className="hidden lg:block">
              <div className="sticky top-20 space-y-4">
                
                {/* MAIA Card */}
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 shadow-xl">
                  {/* Avatar */}
                  <div className="flex justify-center mb-4">
                    <div className="relative">
                      <img 
                        src="/maia-avatar.png" 
                        alt="MAIA" 
                        className="w-32 h-32 object-contain drop-shadow-2xl"
                      />
                      {/* Indicador de áudio */}
                      {isPlaying && (
                        <div className="absolute -bottom-1 -right-1 flex gap-1">
                          <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Balão de fala compacto */}
                  <div className="bg-gradient-to-br from-cyan-50 to-purple-50 rounded-xl p-4 border border-cyan-200/50">
                    <p className="text-sm text-center text-slate-700 font-medium leading-relaxed">
                      {lessonData.sections[activeSection]?.speechBubbleText}
                    </p>
                  </div>
                </div>
                
                {/* Navegação de seções */}
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 border border-slate-200/50 shadow-lg">
                  <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">
                    Seções
                  </h3>
                  <div className="space-y-2">
                    {lessonData.sections.map((section, index) => (
                      <button
                        key={section.id}
                        onClick={() => {
                          if (audioRef.current && section.timestamp !== undefined) {
                            audioRef.current.currentTime = section.timestamp;
                          }
                        }}
                        className={`
                          w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                          ${activeSection === index
                            ? 'bg-gradient-to-r from-cyan-400 to-purple-500 text-white shadow-md'
                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                          }
                        `}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`
                            w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                            ${activeSection === index ? 'bg-white/20' : 'bg-slate-200'}
                          `}>
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
            
            {/* ===== CONTEÚDO: SEÇÕES COMPACTAS ===== */}
            <main className="space-y-5">
              {lessonData.sections.map((section, index) => (
                <div
                  key={section.id}
                  id={`section-${index}`}
                  ref={(el) => (sectionRefs.current[index] = el)}
                  className={`
                    transition-all duration-500
                    ${activeSection >= index ? 'opacity-100' : 'opacity-40'}
                  `}
                >
                  <div className={`
                    bg-white/80 backdrop-blur-xl rounded-2xl p-6 border shadow-lg
                    ${activeSection === index 
                      ? 'border-cyan-300/50 ring-2 ring-cyan-400/20' 
                      : 'border-slate-200/50'
                    }
                  `}>
                    
                    {/* Header da seção */}
                    <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-200/50">
                      <div className={`
                        w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0
                        ${activeSection === index 
                          ? 'bg-gradient-to-r from-cyan-400 to-purple-500 text-white shadow-md' 
                          : 'bg-slate-100 text-slate-500'
                        }
                      `}>
                        {index + 1}
                      </div>
                      {activeSection === index && (
                        <span className="text-xs font-medium text-cyan-600 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
                          Você está aqui
                        </span>
                      )}
                    </div>
                    
                    {/* Conteúdo formatado */}
                    <div className="prose prose-slate prose-sm max-w-none
                      prose-headings:text-slate-900 prose-headings:font-bold prose-headings:mb-3
                      prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg
                      prose-p:text-slate-700 prose-p:leading-relaxed prose-p:mb-3
                      prose-strong:text-cyan-600 prose-strong:font-semibold
                      prose-ul:my-3 prose-ul:space-y-1
                      prose-li:text-slate-700 prose-li:pl-1
                      prose-li:marker:text-cyan-500
                      prose-blockquote:border-l-cyan-400 prose-blockquote:bg-cyan-50/50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg
                      prose-code:text-purple-600 prose-code:bg-purple-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs
                    ">
                      <SyncedText
                        content={section.visualContent}
                        isActive={index === activeSection}
                        isPast={index < activeSection}
                        isFuture={index > activeSection}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </main>
          </div>
        </div>
      </div>
      
      {/* ===== MOBILE: MAIA FLUTUANTE ===== */}
      <div className="lg:hidden fixed bottom-24 right-4 z-40">
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-3.5 border border-cyan-300/50 shadow-2xl max-w-[240px]">
          <div className="flex items-start gap-2.5">
            <img 
              src="/maia-avatar.png" 
              alt="MAIA" 
              className="w-12 h-12 object-contain flex-shrink-0"
            />
            <p className="text-xs text-slate-700 leading-tight">
              {lessonData.sections[activeSection]?.speechBubbleText}
            </p>
          </div>
        </div>
      </div>

      {/* ===== PLAYER FIXO - DESTACADO ===== */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-slate-700/50 z-50 shadow-2xl">
        <div className="container mx-auto px-4 py-3">
          <div className="max-w-5xl mx-auto">
            
            {/* Desktop */}
            <div className="hidden md:flex items-center gap-4">
              
              {/* Controles principais */}
              <div className="flex items-center gap-2">
                <button
                  onClick={skipBackward}
                  disabled={!audioUrl}
                  className="w-9 h-9 bg-slate-700/50 hover:bg-slate-700 disabled:opacity-30 rounded-lg flex items-center justify-center text-white transition-all"
                >
                  <SkipBack size={16} />
                </button>
                
                <button
                  onClick={togglePlay}
                  disabled={!audioUrl}
                  className="w-11 h-11 bg-gradient-to-r from-cyan-400 to-purple-500 disabled:opacity-30 rounded-xl flex items-center justify-center text-white shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all hover:scale-105"
                >
                  {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
                </button>
                
                <button
                  onClick={skipForward}
                  disabled={!audioUrl}
                  className="w-9 h-9 bg-slate-700/50 hover:bg-slate-700 disabled:opacity-30 rounded-lg flex items-center justify-center text-white transition-all"
                >
                  <SkipForward size={16} />
                </button>
              </div>
              
              {/* Barra de progresso */}
              <div className="flex-1 flex items-center gap-3">
                <Volume2 className="text-cyan-400 flex-shrink-0" size={18} />
                
                <span className="text-xs text-slate-400 font-medium tabular-nums min-w-[38px]">
                  {formatTime(currentTime)}
                </span>
                
                <div 
                  className="flex-1 h-2.5 bg-slate-700/40 rounded-full overflow-hidden cursor-pointer hover:h-3 transition-all group"
                  onClick={handleProgressBarClick}
                >
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-all relative"
                    style={{ width: `${progressPercent}%` }}
                  >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                
                <span className="text-xs text-slate-400 font-medium tabular-nums min-w-[38px] text-right">
                  {formatTime(duration)}
                </span>
              </div>
              
              {/* Velocidade */}
              <button
                onClick={cyclePlaybackRate}
                disabled={!audioUrl}
                className="px-3 py-2 bg-slate-700/50 hover:bg-slate-700 disabled:opacity-30 rounded-lg text-white font-bold text-xs transition-all min-w-[55px]"
              >
                {playbackRate}x
              </button>
              
              {/* Continuar */}
              <button
                onClick={onComplete}
                className="px-4 py-2 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-xl text-white font-semibold text-sm shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all whitespace-nowrap hover:scale-105"
              >
                Continuar
              </button>
            </div>
            
            {/* Mobile */}
            <div className="flex md:hidden flex-col gap-2.5">
              {/* Barra de progresso */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium tabular-nums">
                  {formatTime(currentTime)}
                </span>
                <div 
                  className="flex-1 h-2.5 bg-slate-700/40 rounded-full overflow-hidden"
                  onClick={handleProgressBarClick}
                >
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className="text-xs text-slate-400 font-medium tabular-nums">
                  {formatTime(duration)}
                </span>
              </div>
              
              {/* Controles */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={skipBackward}
                    disabled={!audioUrl}
                    className="w-9 h-9 bg-slate-700/50 rounded-lg flex items-center justify-center text-white disabled:opacity-30"
                  >
                    <SkipBack size={16} />
                  </button>
                  <button 
                    onClick={togglePlay}
                    disabled={!audioUrl}
                    className="w-11 h-11 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-cyan-500/30 disabled:opacity-30"
                  >
                    {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
                  </button>
                  <button 
                    onClick={skipForward}
                    disabled={!audioUrl}
                    className="w-9 h-9 bg-slate-700/50 rounded-lg flex items-center justify-center text-white disabled:opacity-30"
                  >
                    <SkipForward size={16} />
                  </button>
                  <button 
                    onClick={cyclePlaybackRate}
                    disabled={!audioUrl}
                    className="px-3 py-2 bg-slate-700/50 rounded-lg text-white font-bold text-xs min-w-[50px] disabled:opacity-30"
                  >
                    {playbackRate}x
                  </button>
                </div>
                <button 
                  onClick={onComplete}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-lg text-white font-semibold text-sm"
                >
                  Continuar
                </button>
              </div>
            </div>
            
          </div>
        </div>
      </div>
      
      {/* Audio element */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          preload="auto"
        />
      )}
    </div>
  );
};
