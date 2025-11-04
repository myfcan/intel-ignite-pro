export interface WordTimestamp {
  word: string;
  start: number; // em segundos
  end: number; // em segundos
}

export interface LessonSection {
  id: string;
  timestamp: number; // segundo em que esta seção começa
  speechBubbleText: string; // frase curta para balão da MAIA (1-2 linhas)
  visualContent: string; // texto visual com markdown e emojis (exibido na tela)
  spokenContent: string; // texto puro falado pela MAIA (para sincronização de áudio)
}

export interface GuidedLessonData {
  id: string;
  title: string;
  trackId: string;
  trackName: string;
  duration: number; // segundos estimados
  sections: LessonSection[];
}

export interface GuidedLessonProps {
  lessonData: GuidedLessonData;
  onComplete: () => void;
  audioUrl?: string; // URL do áudio gerado (opcional, pode ser gerado dinamicamente)
  wordTimestamps?: WordTimestamp[]; // timestamps de palavras para sincronização precisa
}
