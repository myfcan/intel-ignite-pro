import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Play, Pause, CheckCircle, Save } from 'lucide-react';
import { toast } from 'sonner';

interface Section {
  id: string;
  text: string;
  timestamp: number;
}

interface AudioSyncPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  audioUrl: string;
  content: string;
  lessonName: string;
  onSave: (sections: Section[]) => void;
  onApprove: () => void;
}

export default function AudioSyncPreview({
  open,
  onOpenChange,
  audioUrl,
  content,
  lessonName,
  onSave,
  onApprove
}: AudioSyncPreviewProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [sections, setSections] = useState<Section[]>([]);
  const [currentSectionIndex, setCurrentSectionIndex] = useState<number | null>(null);

  // Parse content into sections (assuming sections are separated by double line breaks)
  useEffect(() => {
    if (content) {
      const paragraphs = content
        .split(/\n\n+/)
        .map(p => p.trim())
        .filter(p => p.length > 0);
      
      const parsedSections: Section[] = paragraphs.map((text, index) => ({
        id: `section-${index}`,
        text,
        timestamp: 0 // Default timestamp
      }));
      
      setSections(parsedSections);
    }
  }, [content]);

  // Update current time
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  // Highlight current section based on audio time
  useEffect(() => {
    if (sections.length === 0) return;

    let activeIndex: number | null = null;
    for (let i = 0; i < sections.length; i++) {
      if (currentTime >= sections[i].timestamp) {
        activeIndex = i;
      } else {
        break;
      }
    }
    setCurrentSectionIndex(activeIndex);
  }, [currentTime, sections]);

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

  const updateTimestamp = (index: number, value: string) => {
    const timestamp = parseFloat(value);
    if (isNaN(timestamp) || timestamp < 0) return;

    const updated = [...sections];
    updated[index].timestamp = timestamp;
    setSections(updated);
  };

  const captureCurrentTime = (index: number) => {
    const updated = [...sections];
    updated[index].timestamp = Math.round(currentTime * 100) / 100;
    setSections(updated);
    toast.success(`Timestamp capturado: ${formatTime(currentTime)}`);
  };

  const jumpToSection = (timestamp: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = timestamp;
    }
  };

  const handleSave = () => {
    onSave(sections);
    toast.success('Timestamps salvos!');
  };

  const handleApprove = () => {
    onSave(sections);
    onApprove();
    onOpenChange(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Preview de Sincronização - {lessonName}</DialogTitle>
          <DialogDescription>
            Ajuste os timestamps para sincronizar o áudio com o texto. Clique em "Capturar" durante a reprodução.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Audio Player */}
          <div className="space-y-3 p-4 bg-muted rounded-lg">
            <audio ref={audioRef} src={audioUrl} />
            
            <div className="flex items-center gap-4">
              <Button
                size="sm"
                variant="outline"
                onClick={togglePlay}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              
              <div className="flex-1">
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  step="0.1"
                  value={currentTime}
                  onChange={(e) => {
                    const time = parseFloat(e.target.value);
                    if (audioRef.current) {
                      audioRef.current.currentTime = time;
                    }
                  }}
                  className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
              
              <div className="text-sm text-muted-foreground min-w-[100px] text-right">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>
          </div>

          {/* Sections with Timestamps */}
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {sections.map((section, index) => (
                <div
                  key={section.id}
                  className={`p-4 border rounded-lg transition-all ${
                    currentSectionIndex === index
                      ? 'border-primary bg-primary/5 shadow-md'
                      : 'border-border bg-background'
                  }`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex-1">
                      <div className="text-sm font-medium mb-1">Seção {index + 1}</div>
                      <div className="text-sm text-muted-foreground line-clamp-2">
                        {section.text}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 flex-1">
                      <label className="text-xs font-medium text-muted-foreground min-w-[70px]">
                        Timestamp:
                      </label>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        value={section.timestamp}
                        onChange={(e) => updateTimestamp(index, e.target.value)}
                        className="w-24 h-8 text-sm"
                      />
                      <span className="text-xs text-muted-foreground">
                        ({formatTime(section.timestamp)})
                      </span>
                    </div>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => captureCurrentTime(index)}
                      className="h-8"
                    >
                      Capturar
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => jumpToSection(section.timestamp)}
                      className="h-8"
                    >
                      Ir
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button variant="outline" onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Salvar Timestamps
            </Button>
            <Button onClick={handleApprove}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Salvar e Aprovar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
