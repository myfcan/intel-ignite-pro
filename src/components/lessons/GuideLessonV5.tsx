import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, CheckCircle, ChevronLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GuideV5Data } from '@/types/guide';
import { toast } from '@/hooks/use-toast';

interface GuideLessonV5Props {
  guideData: GuideV5Data;
  onComplete?: () => void;
}

/**
 * GuideLessonV5: Componente para Mini-Cursos de IAs Populares
 *
 * Características:
 * - Modelo V5 = V2 structure (múltiplos áudios, um por seção)
 * - SEM exercícios (diferença principal do V1-V4)
 * - SEM playground
 * - Foco em consumo de conteúdo educacional
 * - Usado para guias sobre ChatGPT, Claude, Gemini, etc.
 */
export function GuideLessonV5({ guideData, onComplete }: GuideLessonV5Props) {
  const navigate = useNavigate();
  const [currentSection, setCurrentSection] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const currentSectionData = guideData.sections[currentSection];
  const currentAudioUrl = currentSectionData?.audio_url;
  const hasNextSection = currentSection < guideData.sections.length - 1;
  const hasPreviousSection = currentSection > 0;

  // 🔊 Inicializar áudio quando trocar seção
  useEffect(() => {
    if (audioRef.current && currentAudioUrl) {
      audioRef.current.src = currentAudioUrl;
      audioRef.current.load();
      setCurrentTime(0);
      setDuration(0);
      setIsPlaying(false);
    }
  }, [currentSection, currentAudioUrl]);

  // 📊 Atualizar tempo do áudio
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);

      // Se tem próxima seção, avança automaticamente
      if (hasNextSection) {
        handleNextSection();
      } else {
        // Última seção completa -> aula concluída
        handleLessonComplete();
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [hasNextSection]);

  // 🎵 Controles de áudio
  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleNextSection = () => {
    if (hasNextSection) {
      setCurrentSection(prev => prev + 1);
      // Scroll to top of content
      contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePreviousSection = () => {
    if (hasPreviousSection) {
      setCurrentSection(prev => prev - 1);
      contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (seconds: number): string => {
    if (!seconds || !isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 🎉 Completar aula
  const handleLessonComplete = () => {
    setIsCompleted(true);

    // Confetti celebration
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    toast({
      title: '🎉 Guia Concluído!',
      description: `Você completou: ${guideData.title}`,
    });

    // Callback opcional
    if (onComplete) {
      setTimeout(() => onComplete(), 2000);
    }
  };

  const handleBackToDashboard = () => {
    navigate('/guides');
  };

  // 📱 UI: Tela de conclusão
  if (isCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 p-4">
        <Card className="max-w-lg w-full p-8 text-center space-y-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>

          <div>
            <h1 className="text-3xl font-bold mb-2">Parabéns!</h1>
            <p className="text-gray-600">
              Você completou o guia <span className="font-semibold">{guideData.title}</span>
            </p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-900">
              <span className="font-semibold">{guideData.sections.length}</span> seções concluídas •
              <span className="font-semibold"> {Math.floor(guideData.duration / 60)}</span> minutos de conteúdo
            </p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleBackToDashboard}
              className="w-full"
              size="lg"
            >
              Ver Outros Guias
            </Button>

            <Button
              onClick={() => setIsCompleted(false)}
              variant="outline"
              className="w-full"
            >
              Revisar Conteúdo
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // 📱 UI Principal
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header com logo da IA */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToDashboard}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Voltar
          </Button>

          <div className="flex items-center gap-3">
            {guideData.aiLogo && (
              <img
                src={guideData.aiLogo}
                alt={guideData.aiName}
                className="w-8 h-8 rounded-lg"
              />
            )}
            <div className="text-right">
              <h1 className="font-semibold text-sm">{guideData.title}</h1>
              <p className="text-xs text-gray-500">
                Seção {currentSection + 1} de {guideData.sections.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="overflow-hidden">
          {/* Conteúdo visual com scroll */}
          <div
            ref={contentRef}
            className="p-6 md:p-8 max-h-[60vh] overflow-y-auto prose prose-sm md:prose-base max-w-none"
          >
            <h2 className="text-2xl font-bold mb-4 text-purple-900">
              {currentSectionData.title}
            </h2>

            <ReactMarkdown
              components={{
                h1: ({ node, ...props }) => <h1 className="text-3xl font-bold mt-6 mb-4 text-purple-900" {...props} />,
                h2: ({ node, ...props }) => <h2 className="text-2xl font-bold mt-5 mb-3 text-purple-800" {...props} />,
                h3: ({ node, ...props }) => <h3 className="text-xl font-semibold mt-4 mb-2 text-purple-700" {...props} />,
                p: ({ node, ...props }) => <p className="mb-4 leading-relaxed text-gray-700" {...props} />,
                ul: ({ node, ...props }) => <ul className="mb-4 ml-6 space-y-2 list-disc" {...props} />,
                ol: ({ node, ...props }) => <ol className="mb-4 ml-6 space-y-2 list-decimal" {...props} />,
                li: ({ node, ...props }) => <li className="text-gray-700" {...props} />,
                code: ({ node, inline, ...props }: any) =>
                  inline ? (
                    <code className="bg-purple-100 text-purple-900 px-1.5 py-0.5 rounded text-sm font-mono" {...props} />
                  ) : (
                    <code className="block bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto font-mono text-sm my-4" {...props} />
                  ),
                blockquote: ({ node, ...props }) => (
                  <blockquote className="border-l-4 border-purple-500 pl-4 italic text-gray-600 my-4" {...props} />
                ),
                table: ({ node, ...props }) => (
                  <div className="overflow-x-auto my-4">
                    <table className="min-w-full border-collapse border border-gray-300" {...props} />
                  </div>
                ),
                th: ({ node, ...props }) => (
                  <th className="border border-gray-300 bg-purple-50 px-4 py-2 text-left font-semibold" {...props} />
                ),
                td: ({ node, ...props }) => (
                  <td className="border border-gray-300 px-4 py-2" {...props} />
                ),
              }}
            >
              {currentSectionData.visualContent}
            </ReactMarkdown>
          </div>

          {/* Player de áudio */}
          {currentAudioUrl && (
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
              <audio ref={audioRef} className="hidden" />

              {/* Progress bar */}
              <div className="mb-4">
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-2 bg-white/30 rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, white ${(currentTime / duration) * 100}%, rgba(255,255,255,0.3) ${(currentTime / duration) * 100}%)`
                  }}
                />
                <div className="flex justify-between text-xs mt-2 opacity-90">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Controles */}
              <div className="flex items-center justify-center gap-4">
                <Button
                  onClick={handlePreviousSection}
                  disabled={!hasPreviousSection}
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 disabled:opacity-30"
                >
                  <SkipBack className="w-5 h-5" />
                </Button>

                <Button
                  onClick={togglePlay}
                  size="icon"
                  className="w-14 h-14 rounded-full bg-white text-purple-600 hover:bg-gray-100"
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6" />
                  ) : (
                    <Play className="w-6 h-6 ml-1" />
                  )}
                </Button>

                <Button
                  onClick={handleNextSection}
                  disabled={!hasNextSection}
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 disabled:opacity-30"
                >
                  <SkipForward className="w-5 h-5" />
                </Button>
              </div>

              {/* Indicador de seção */}
              <div className="mt-4 text-center">
                <p className="text-sm opacity-90">
                  {currentSectionData.title}
                </p>
              </div>
            </div>
          )}

          {/* Navegação entre seções (sem áudio) */}
          {!currentAudioUrl && (
            <div className="p-6 bg-gray-50 flex justify-between">
              <Button
                onClick={handlePreviousSection}
                disabled={!hasPreviousSection}
                variant="outline"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Seção Anterior
              </Button>

              {hasNextSection ? (
                <Button onClick={handleNextSection}>
                  Próxima Seção
                  <SkipForward className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleLessonComplete} className="bg-green-600 hover:bg-green-700">
                  Concluir Guia
                  <CheckCircle className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          )}
        </Card>

        {/* Progresso geral */}
        <div className="mt-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progresso do Guia</span>
            <span>{Math.round(((currentSection + 1) / guideData.sections.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentSection + 1) / guideData.sections.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
