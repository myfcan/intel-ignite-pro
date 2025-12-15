// src/components/lessons/v7/V7Subtitles.tsx
// Full subtitle/transcript display with accessibility features

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Captions, 
  CaptionsOff, 
  Settings, 
  Maximize2, 
  Minimize2,
  ChevronUp,
  ChevronDown 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';

interface WordTimestamp {
  word: string;
  start: number;
  end: number;
}

interface SubtitleSettings {
  fontSize: 'small' | 'medium' | 'large' | 'xlarge';
  backgroundColor: 'transparent' | 'semi' | 'solid';
  textColor: 'white' | 'yellow' | 'cyan';
  position: 'bottom' | 'top';
}

interface V7SubtitlesProps {
  wordTimestamps: WordTimestamp[];
  currentTime: number;
  isVisible: boolean;
  onToggle: () => void;
  onSeek?: (time: number) => void;
  lessonTitle?: string;
}

const FONT_SIZE_MAP = {
  small: 'text-sm sm:text-base',
  medium: 'text-base sm:text-lg',
  large: 'text-lg sm:text-xl',
  xlarge: 'text-xl sm:text-2xl',
};

const TEXT_COLOR_MAP = {
  white: 'text-white',
  yellow: 'text-yellow-300',
  cyan: 'text-cyan-300',
};

const BG_OPACITY_MAP = {
  transparent: 'bg-transparent',
  semi: 'bg-black/60',
  solid: 'bg-black/90',
};

export const V7Subtitles = ({
  wordTimestamps,
  currentTime,
  isVisible,
  onToggle,
  onSeek,
  lessonTitle = 'Aula',
}: V7SubtitlesProps) => {
  // ============================================================================
  // STATE
  // ============================================================================

  const [settings, setSettings] = useState<SubtitleSettings>({
    fontSize: 'medium',
    backgroundColor: 'semi',
    textColor: 'white',
    position: 'bottom',
  });
  const [showFullTranscript, setShowFullTranscript] = useState(false);
  
  const transcriptRef = useRef<HTMLDivElement>(null);
  const currentWordRef = useRef<HTMLSpanElement>(null);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  // Find current word index
  const currentWordIndex = useMemo(() => {
    return wordTimestamps.findIndex(
      (word) => currentTime >= word.start && currentTime < word.end
    );
  }, [wordTimestamps, currentTime]);

  // Get words to display (current context window)
  const displayWords = useMemo(() => {
    if (wordTimestamps.length === 0) return [];

    const windowSize = 15;
    const halfWindow = Math.floor(windowSize / 2);
    
    let start = Math.max(0, currentWordIndex - halfWindow);
    let end = Math.min(wordTimestamps.length, start + windowSize);
    
    // Adjust start if we're near the end
    if (end === wordTimestamps.length) {
      start = Math.max(0, end - windowSize);
    }

    return wordTimestamps.slice(start, end).map((word, idx) => ({
      ...word,
      originalIndex: start + idx,
    }));
  }, [wordTimestamps, currentWordIndex]);

  // Generate full transcript with paragraphs
  const fullTranscript = useMemo(() => {
    if (wordTimestamps.length === 0) return [];

    const paragraphs: { words: (WordTimestamp & { originalIndex: number })[]; startTime: number }[] = [];
    let currentParagraph: (WordTimestamp & { originalIndex: number })[] = [];
    let paragraphStartTime = 0;

    wordTimestamps.forEach((word, index) => {
      if (currentParagraph.length === 0) {
        paragraphStartTime = word.start;
      }

      currentParagraph.push({ ...word, originalIndex: index });

      // Create new paragraph after ~50 words or at sentence endings
      const isPunctuation = /[.!?]$/.test(word.word);
      if ((isPunctuation && currentParagraph.length >= 20) || currentParagraph.length >= 50) {
        paragraphs.push({ words: currentParagraph, startTime: paragraphStartTime });
        currentParagraph = [];
      }
    });

    // Add remaining words
    if (currentParagraph.length > 0) {
      paragraphs.push({ words: currentParagraph, startTime: paragraphStartTime });
    }

    return paragraphs;
  }, [wordTimestamps]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Auto-scroll transcript to current word
  useEffect(() => {
    if (showFullTranscript && currentWordRef.current && transcriptRef.current) {
      currentWordRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [currentWordIndex, showFullTranscript]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleWordClick = useCallback(
    (word: WordTimestamp) => {
      if (onSeek) {
        onSeek(word.start);
      }
    },
    [onSeek]
  );

  const handleSettingChange = useCallback(
    <K extends keyof SubtitleSettings>(key: K, value: SubtitleSettings[K]) => {
      setSettings((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  const positionClasses = settings.position === 'bottom' 
    ? 'bottom-28 sm:bottom-32' 
    : 'top-4 sm:top-8';

  return (
    <>
      {/* Subtitle Toggle Button */}
      <div className="absolute bottom-20 right-4 z-40 flex gap-2">
        <Button
          onClick={onToggle}
          variant="ghost"
          size="icon"
          className={`rounded-lg transition-colors ${
            isVisible ? 'bg-cyan-500/80 hover:bg-cyan-600/80' : 'bg-gray-600/80 hover:bg-gray-500/80'
          }`}
          aria-label={isVisible ? 'Ocultar legendas' : 'Mostrar legendas'}
          aria-pressed={isVisible}
        >
          {isVisible ? (
            <Captions className="w-5 h-5 text-white" aria-hidden="true" />
          ) : (
            <CaptionsOff className="w-5 h-5 text-white" aria-hidden="true" />
          )}
        </Button>

        {/* Settings button - use controlled state without causing re-renders */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-lg bg-gray-600/80 hover:bg-gray-500/80"
              aria-label="Configurações de legendas"
            >
              <Settings className="w-5 h-5 text-white" aria-hidden="true" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-72 bg-gray-900/95 backdrop-blur-lg border-gray-700 p-4"
            side="top"
            align="end"
          >
            <div className="space-y-4">
              <h4 className="text-white text-sm font-medium">Configurações de Legenda</h4>

              {/* Font Size */}
              <div className="space-y-2">
                <label className="text-white text-xs">Tamanho da fonte</label>
                <div className="flex gap-2">
                  {(['small', 'medium', 'large', 'xlarge'] as const).map((size) => (
                    <Button
                      key={size}
                      onClick={() => handleSettingChange('fontSize', size)}
                      variant="ghost"
                      size="sm"
                      className={`flex-1 text-xs ${
                        settings.fontSize === size
                          ? 'bg-cyan-500/80 text-white'
                          : 'bg-gray-700/50 text-gray-300'
                      }`}
                    >
                      {size === 'small' ? 'P' : size === 'medium' ? 'M' : size === 'large' ? 'G' : 'XG'}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Background */}
              <div className="space-y-2">
                <label className="text-white text-xs">Fundo</label>
                <div className="flex gap-2">
                  {(['transparent', 'semi', 'solid'] as const).map((bg) => (
                    <Button
                      key={bg}
                      onClick={() => handleSettingChange('backgroundColor', bg)}
                      variant="ghost"
                      size="sm"
                      className={`flex-1 text-xs ${
                        settings.backgroundColor === bg
                          ? 'bg-cyan-500/80 text-white'
                          : 'bg-gray-700/50 text-gray-300'
                      }`}
                    >
                      {bg === 'transparent' ? 'Nenhum' : bg === 'semi' ? 'Semi' : 'Sólido'}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Text Color */}
              <div className="space-y-2">
                <label className="text-white text-xs">Cor do texto</label>
                <div className="flex gap-2">
                  {(['white', 'yellow', 'cyan'] as const).map((color) => (
                    <Button
                      key={color}
                      onClick={() => handleSettingChange('textColor', color)}
                      variant="ghost"
                      size="sm"
                      className={`flex-1 ${
                        settings.textColor === color
                          ? 'ring-2 ring-cyan-500'
                          : ''
                      }`}
                    >
                      <span className={TEXT_COLOR_MAP[color]}>Aa</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Position */}
              <div className="space-y-2">
                <label className="text-white text-xs">Posição</label>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleSettingChange('position', 'top')}
                    variant="ghost"
                    size="sm"
                    className={`flex-1 ${
                      settings.position === 'top'
                        ? 'bg-cyan-500/80 text-white'
                        : 'bg-gray-700/50 text-gray-300'
                    }`}
                  >
                    <ChevronUp className="w-4 h-4 mr-1" />
                    Topo
                  </Button>
                  <Button
                    onClick={() => handleSettingChange('position', 'bottom')}
                    variant="ghost"
                    size="sm"
                    className={`flex-1 ${
                      settings.position === 'bottom'
                        ? 'bg-cyan-500/80 text-white'
                        : 'bg-gray-700/50 text-gray-300'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4 mr-1" />
                    Base
                  </Button>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Full transcript toggle */}
        <Button
          onClick={() => setShowFullTranscript(!showFullTranscript)}
          variant="ghost"
          size="icon"
          className="rounded-lg bg-gray-600/80 hover:bg-gray-500/80"
          aria-label={showFullTranscript ? 'Minimizar transcrição' : 'Ver transcrição completa'}
          aria-expanded={showFullTranscript}
        >
          {showFullTranscript ? (
            <Minimize2 className="w-5 h-5 text-white" aria-hidden="true" />
          ) : (
            <Maximize2 className="w-5 h-5 text-white" aria-hidden="true" />
          )}
        </Button>
      </div>

      {/* Inline Subtitles */}
      <AnimatePresence>
        {isVisible && !showFullTranscript && displayWords.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`absolute ${positionClasses} left-0 right-0 z-30 px-4 sm:px-8`}
            role="region"
            aria-live="polite"
            aria-label="Legendas"
          >
            <div
              className={`${BG_OPACITY_MAP[settings.backgroundColor]} backdrop-blur-sm rounded-lg px-4 sm:px-6 py-3 mx-auto max-w-4xl`}
            >
              <p className={`${FONT_SIZE_MAP[settings.fontSize]} ${TEXT_COLOR_MAP[settings.textColor]} text-center leading-relaxed`}>
                {displayWords.map((word) => (
                  <span
                    key={`${word.originalIndex}-${word.start}`}
                    className={`inline transition-all duration-150 cursor-pointer hover:underline ${
                      word.originalIndex === currentWordIndex
                        ? 'font-bold text-cyan-300'
                        : word.originalIndex < currentWordIndex
                        ? 'opacity-60'
                        : 'opacity-90'
                    }`}
                    onClick={() => handleWordClick(word)}
                    role="button"
                    tabIndex={0}
                    aria-label={`Ir para ${word.word}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleWordClick(word);
                      }
                    }}
                  >
                    {word.word}{' '}
                  </span>
                ))}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full Transcript Panel */}
      <AnimatePresence>
        {showFullTranscript && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-gray-900/95 backdrop-blur-lg z-50 overflow-hidden flex flex-col"
            role="dialog"
            aria-label="Transcrição completa"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <div>
                <h2 className="text-white font-semibold">Transcrição</h2>
                <p className="text-gray-400 text-xs">{lessonTitle}</p>
              </div>
              <Button
                onClick={() => setShowFullTranscript(false)}
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-white"
                aria-label="Fechar transcrição"
              >
                <Minimize2 className="w-5 h-5" />
              </Button>
            </div>

            {/* Transcript Content */}
            <div
              ref={transcriptRef}
              className="flex-1 overflow-y-auto p-4 space-y-4"
              tabIndex={0}
              aria-label="Conteúdo da transcrição"
            >
              {fullTranscript.map((paragraph, pIndex) => (
                <div key={pIndex} className="space-y-2">
                  <button
                    onClick={() => onSeek?.(paragraph.startTime)}
                    className="text-cyan-400 text-xs font-mono hover:underline focus:outline-none focus:ring-2 focus:ring-cyan-500 rounded"
                    aria-label={`Ir para ${formatTime(paragraph.startTime)}`}
                  >
                    {formatTime(paragraph.startTime)}
                  </button>
                  <p className={`${FONT_SIZE_MAP[settings.fontSize]} ${TEXT_COLOR_MAP[settings.textColor]} leading-relaxed`}>
                    {paragraph.words.map((word) => (
                      <span
                        key={`${word.originalIndex}-${word.start}`}
                        ref={word.originalIndex === currentWordIndex ? currentWordRef : undefined}
                        className={`inline cursor-pointer hover:underline transition-colors ${
                          word.originalIndex === currentWordIndex
                            ? 'bg-cyan-500/30 font-bold'
                            : word.originalIndex < currentWordIndex
                            ? 'opacity-60'
                            : ''
                        }`}
                        onClick={() => handleWordClick(word)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            handleWordClick(word);
                          }
                        }}
                      >
                        {word.word}{' '}
                      </span>
                    ))}
                  </p>
                </div>
              ))}
            </div>

            {/* Footer with current time */}
            <div className="p-4 border-t border-gray-700 text-center">
              <span className="text-gray-400 text-sm">
                Tempo atual: {formatTime(currentTime)}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
