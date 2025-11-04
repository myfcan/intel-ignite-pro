import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, SkipForward, SkipBack } from 'lucide-react';
import { GuidedLessonProps } from '@/types/guidedLesson';
import { AnimatedMarkdown } from './AnimatedMarkdown';

export const GuidedLesson = ({ lessonData, onComplete, audioUrl }: GuidedLessonProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [activeSection, setActiveSection] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [audioLoaded, setAudioLoaded] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setAudioLoaded(true);
      // Autoplay após carregar
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.log('Autoplay bloqueado:', err);
      });
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      
      // Determinar seção ativa baseada no tempo
      const currentSectionIndex = lessonData.sections.findIndex((section, index) => {
        const nextSection = lessonData.sections[index + 1];
        return audio.currentTime >= section.timestamp && 
               (!nextSection || audio.currentTime < nextSection.timestamp);
      });
      
      if (currentSectionIndex !== -1 && currentSectionIndex !== activeSection) {
        console.log(`🎯 Mudando para seção ${currentSectionIndex} aos ${Math.floor(audio.currentTime)}s`);
        console.log(`📊 Seção: "${lessonData.sections[currentSectionIndex].speechBubbleText}"`);
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
      sectionRefs.current[activeSection].scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
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

  const skipToSection = (direction: 'prev' | 'next') => {
    const audio = audioRef.current;
    if (!audio) return;

    const newIndex = direction === 'next' 
      ? Math.min(activeSection + 1, lessonData.sections.length - 1)
      : Math.max(activeSection - 1, 0);
    
    audio.currentTime = lessonData.sections[newIndex].timestamp;
    setActiveSection(newIndex);
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

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-32">
      {/* Header Fixo */}
      <header className="sticky top-0 z-40 bg-white border-b-2 border-gray-100 shadow-soft">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{lessonData.title}</h1>
              <p className="text-sm text-gray-600">{lessonData.trackName}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onComplete}
              className="hidden md:flex"
            >
              Ir para Exercício →
            </Button>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* MAIA Narrator Section - Sticky Floating */}
        <div className="sticky top-24 z-30 mb-8 transition-all duration-500">
          <div className="flex items-start gap-6 bg-gradient-to-r from-purple-50 to-cyan-50 rounded-2xl p-6 shadow-lg">
            <div className="relative flex-shrink-0">
              <img 
                src="/maia-avatar.png" 
                alt="MAIA"
                className={`w-24 h-24 transition-transform duration-700 ${isPlaying ? 'animate-pulse' : ''}`}
              />
              {isPlaying && (
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                    <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse delay-100"></span>
                    <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse delay-200"></span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Balão de Fala da MAIA */}
            <div className="relative bg-white rounded-2xl shadow-xl p-6 flex-1 border-2 border-cyan-100 animate-fade-in">
              <div className="absolute -left-3 top-8 w-6 h-6 bg-white transform rotate-45 border-l-2 border-b-2 border-cyan-100"></div>
              <p className="text-base text-gray-800 font-medium leading-relaxed">
                {lessonData.sections[activeSection]?.speechBubbleText}
              </p>
            </div>
          </div>
        </div>

        {/* Seções de Conteúdo */}
        <div className="space-y-6">
          {lessonData.sections.map((section, index) => (
            <div
              key={section.id}
              ref={(el) => (sectionRefs.current[index] = el)}
              className={`
                transition-all duration-700 rounded-2xl p-8 shadow-md
                ${index === activeSection 
                  ? 'bg-gradient-to-br from-cyan-50 to-purple-50 border-l-4 border-cyan-500 shadow-2xl scale-[1.02] animate-fade-in' 
                  : 'bg-white opacity-40'}
                ${index < activeSection ? 'opacity-70' : ''}
              `}
            >
              <AnimatedMarkdown 
                content={section.content}
                isActive={index === activeSection}
                speed={60}
              />
            </div>
          ))}
        </div>
      </main>

      {/* Audio Player Fixo no Rodapé */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-2xl z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          {audioUrl && (
            <>
              <audio ref={audioRef} src={audioUrl} preload="auto" />
              
              <div className="flex flex-col gap-3">
                {/* Controles Principais */}
                <div className="flex items-center gap-4">
                  <Button
                    onClick={() => skipToSection('prev')}
                    size="icon"
                    variant="outline"
                    disabled={activeSection === 0}
                    className="h-10 w-10"
                  >
                    <SkipBack className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    onClick={togglePlay}
                    size="icon"
                    className="h-14 w-14 rounded-full bg-gradient-primary"
                    disabled={!audioLoaded}
                  >
                    {isPlaying ? (
                      <Pause className="w-6 h-6" />
                    ) : (
                      <Play className="w-6 h-6 ml-0.5" />
                    )}
                  </Button>
                  
                  <Button
                    onClick={() => skipToSection('next')}
                    size="icon"
                    variant="outline"
                    disabled={activeSection === lessonData.sections.length - 1}
                    className="h-10 w-10"
                  >
                    <SkipForward className="w-4 h-4" />
                  </Button>

                  {/* Barra de Progresso com Marcadores de Seções */}
                  <div className="flex-1">
                    <div className="relative">
                      <Progress value={progressPercent} className="h-2" />
                      {/* Section Markers */}
                      {lessonData.sections.map((section, index) => {
                        const markerPosition = duration > 0 ? (section.timestamp / duration) * 100 : 0;
                        return (
                          <div
                            key={section.id}
                            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-purple-500 rounded-full shadow-md cursor-pointer hover:scale-125 transition-transform z-10"
                            style={{ left: `${markerPosition}%` }}
                            title={`Seção ${index + 1}`}
                            onClick={() => {
                              if (audioRef.current) {
                                audioRef.current.currentTime = section.timestamp;
                              }
                            }}
                          />
                        );
                      })}
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-muted-foreground">
                        {formatTime(currentTime)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(duration)}
                      </span>
                    </div>
                  </div>

                  {/* Velocidade */}
                  <Button
                    onClick={cyclePlaybackRate}
                    size="sm"
                    variant="outline"
                    className="text-xs font-mono h-10 px-3"
                  >
                    {playbackRate}x
                  </Button>

                  {/* Botão Continue (Desktop) */}
                  <Button
                    onClick={onComplete}
                    className="hidden md:flex bg-gradient-primary"
                  >
                    Continuar para Exercício
                  </Button>
                </div>

                {/* Botão Continue (Mobile) */}
                <Button
                  onClick={onComplete}
                  className="md:hidden w-full bg-gradient-primary"
                >
                  Continuar para Exercício
                </Button>
              </div>
            </>
          )}

          {!audioUrl && (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground mb-3">
                Áudio não disponível para esta aula
              </p>
              <Button onClick={onComplete} className="bg-gradient-primary">
                Continuar para Exercício
              </Button>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
};
