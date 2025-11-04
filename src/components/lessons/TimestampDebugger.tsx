import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, Pause, Flag } from 'lucide-react';

interface TimestampDebuggerProps {
  audioUrl: string;
  sections: Array<{ id: string; speechBubbleText: string }>;
}

export const TimestampDebugger = ({ audioUrl, sections }: TimestampDebuggerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [capturedTimestamps, setCapturedTimestamps] = useState<number[]>([]);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

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

  const captureTimestamp = () => {
    const audio = audioRef.current;
    if (!audio) return;

    const timestamp = Math.floor(audio.currentTime);
    setCapturedTimestamps([...capturedTimestamps, timestamp]);
    setCurrentSectionIndex(currentSectionIndex + 1);
    
    console.log(`✅ Timestamp capturado: ${timestamp}s para seção "${sections[currentSectionIndex]?.speechBubbleText}"`);
  };

  const copyCode = () => {
    const code = `timestamp: ${capturedTimestamps[currentSectionIndex - 1] || 0}`;
    navigator.clipboard.writeText(code);
    console.log('📋 Código copiado!');
  };

  const exportAllTimestamps = () => {
    console.log('\n🎯 ===== TIMESTAMPS CAPTURADOS =====');
    capturedTimestamps.forEach((timestamp, index) => {
      console.log(`Seção ${index}: timestamp: ${timestamp}, // "${sections[index]?.speechBubbleText}"`);
    });
    console.log('===================================\n');
    
    // Copy all to clipboard
    const allCode = capturedTimestamps.map((timestamp, index) => 
      `timestamp: ${timestamp}, // "${sections[index]?.speechBubbleText}"`
    ).join('\n');
    navigator.clipboard.writeText(allCode);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-purple-50 p-8">
      <Card className="max-w-2xl mx-auto p-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">🎯 Ferramenta de Debug de Timestamps</h1>
          <p className="text-gray-600">
            Toque o áudio e clique em "Marcar Seção" quando ouvir cada novo título começar
          </p>
        </div>

        <audio 
          ref={audioRef} 
          src={audioUrl} 
          preload="auto"
          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
          onEnded={() => setIsPlaying(false)}
        />

        {/* Player */}
        <div className="space-y-4 p-6 bg-gradient-to-r from-purple-50 to-cyan-50 rounded-lg">
          <div className="flex items-center justify-center gap-4">
            <Button
              onClick={togglePlay}
              size="lg"
              className="h-16 w-16 rounded-full bg-gradient-to-r from-purple-600 to-cyan-600"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
            </Button>
            <div className="text-center">
              <div className="text-3xl font-mono font-bold text-gray-900">
                {formatTime(currentTime)}
              </div>
              <div className="text-sm text-gray-600">Tempo atual</div>
            </div>
          </div>
        </div>

        {/* Próxima Seção */}
        {currentSectionIndex < sections.length && (
          <div className="space-y-3">
            <div className="p-4 bg-white rounded-lg border-2 border-purple-200">
              <div className="text-sm text-gray-600 mb-2">
                🎯 Quando ouvir a MAIA falar EXATAMENTE esta frase:
              </div>
              <div className="text-xl font-bold text-purple-600 leading-relaxed">
                "{sections[currentSectionIndex]?.speechBubbleText}"
              </div>
            </div>
            
            <Button
              onClick={captureTimestamp}
              size="lg"
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              disabled={!isPlaying}
            >
              <Flag className="w-5 h-5 mr-2" />
              Marcar Seção {currentSectionIndex + 1}
            </Button>
          </div>
        )}

        {/* Timestamps Capturados */}
        {capturedTimestamps.length > 0 && (
          <div className="space-y-3">
            <div className="font-semibold text-gray-900">Timestamps Capturados:</div>
            <div className="space-y-2">
              {capturedTimestamps.map((timestamp, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded"
                >
                  <div>
                    <span className="font-mono font-bold text-green-700">{timestamp}s</span>
                    <span className="text-sm text-gray-600 ml-3">
                      {sections[index]?.speechBubbleText}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            {capturedTimestamps.length === sections.length && (
              <Button
                onClick={exportAllTimestamps}
                size="lg"
                className="w-full bg-gradient-to-r from-purple-600 to-cyan-600"
              >
                📋 Copiar Todos os Timestamps
              </Button>
            )}
          </div>
        )}

        {/* Instruções */}
        <div className="text-sm text-gray-600 space-y-2 p-4 bg-blue-50 rounded-lg">
          <div className="font-semibold text-blue-900 mb-2">📖 Como usar:</div>
          <ol className="list-decimal list-inside space-y-2 ml-2">
            <li>Clique em <span className="text-purple-600">Play</span> para iniciar o áudio</li>
            <li>Ouça atentamente o áudio da MAIA</li>
            <li className="font-semibold">Quando ouvir a <span className="text-purple-600">frase EXATA</span> mostrada acima, clique imediatamente em <span className="text-green-600">"Marcar Seção"</span></li>
            <li>Repita para todas as 5 seções</li>
            <li>No final, clique em <span className="text-purple-600">"Copiar Todos os Timestamps"</span> e me envie</li>
          </ol>
        </div>
      </Card>
    </div>
  );
};