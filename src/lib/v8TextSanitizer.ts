const META_LABEL_LINE_REGEX = /(^|\n)\s*(?:Segmento\s+vida\s+real\s+desta\s+atividade|Atividade\s+prática|Atividade\s+pratica|Contexto\s+real)\s*:[^\n]*(?=\n|$)/gi;
const RUSH_LINE_REGEX = /(^|\n)\s*(?:Responda rapidamente[^\n]*|Confie nos seus instintos[^\n]*|Sem pensar muito[^\n]*|Responda agora[^\n]*)(?=\n|$)/gi;
const GENERIC_TAG_REGEX = /\[(?![^\]]*\]\()[^\]]{1,40}\]/gi;

const META_LABEL_DETECT_REGEX = /\b(?:Segmento\s+vida\s+real\s+desta\s+atividade|Atividade\s+prática|Atividade\s+pratica|Contexto\s+real)\s*:/i;
const RUSH_DETECT_REGEX = /\b(?:Responda rapidamente|Confie nos seus instintos|Sem pensar muito|Responda agora)\b/i;
const EMOTION_TAG_DETECT_REGEX = /\[(?:animado|confiante|pause|pausa(?:\s+curta)?|entusiasmado|calmo|sereno|did[aá]tico|tom\s+[^\]\n]{1,20})\]/i;

export function sanitizeV8PedagogicalText(text: string): string {
  if (!text || typeof text !== "string") return text;

  return text
    .replace(META_LABEL_LINE_REGEX, "$1")
    .replace(RUSH_LINE_REGEX, "$1")
    .replace(GENERIC_TAG_REGEX, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function hasV8ForbiddenNarrationMarkers(text: string): boolean {
  if (!text || typeof text !== "string") return false;

  return (
    META_LABEL_DETECT_REGEX.test(text) ||
    RUSH_DETECT_REGEX.test(text) ||
    EMOTION_TAG_DETECT_REGEX.test(text)
  );
}
