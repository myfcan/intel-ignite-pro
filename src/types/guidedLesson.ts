export interface LessonSection {
  id: string;
  timestamp: number; // segundo em que esta seção começa
  speechBubbleText: string; // frase curta para balão da MAIA (1-2 linhas)
  content: string; // texto completo da seção (pode usar markdown)
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
}
