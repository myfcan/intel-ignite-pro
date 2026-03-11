const META_LABEL_LINE_REGEX = /(^|\n)\s*(?:Segmento\s+vida\s+real\s+desta\s+atividade|Atividade\s+prática|Atividade\s+pratica|Contexto\s+real)\s*:[^\n]*(?=\n|$)/gi;
const RUSH_LINE_REGEX = /(^|\n)\s*(?:Responda rapidamente[^\n]*|Confie nos seus instintos[^\n]*|Sem pensar muito[^\n]*|Responda agora[^\n]*)(?=\n|$)/gi;

// ElevenLabs v3 — COMPLETE official audio tags whitelist
const ELEVENLABS_EMOTION_TAGS = new Set([
  // Emotions / Directions
  'happy', 'sad', 'excited', 'angry', 'whisper', 'annoyed', 'appalled',
  'thoughtful', 'surprised', 'sarcastic', 'curious', 'crying', 'mischievously',
  'impressed', 'delighted', 'amazed', 'warmly', 'excitedly', 'curiously',
  'dramatically', 'happily', 'sorrowful',
  'calm', 'nervous', 'frustrated', 'serious', 'cheerful', 'empathetic',
  'assertive', 'dramatic tone', 'reflective', 'hopeful', 'energetic',
  'warm', 'encouraging',
  // Non-verbal / Human sounds
  'laughs', 'laughing', 'chuckles', 'sighs', 'sigh', 'clears throat',
  'exhales', 'exhales sharply', 'inhales deeply', 'snorts', 'gulps',
  'swallows', 'gasps', 'wheezing', 'giggles', 'giggling', 'muttering',
  'stammers', 'whispers',
  // Pacing & Delivery
  'pause', 'short pause', 'long pause', 'rushed', 'slows down',
  'hesitates', 'drawn out', 'deliberate', 'rapid-fire', 'timidly',
  'emphasized', 'understated',
  // Creative / Complex
  'interrupting', 'overlapping', 'singing', 'sings', 'woo',
  'happy gasp', 'frustrated sigh', 'laughs softly', 'starts laughing',
  'with genuine belly laugh',
]);

const META_LABEL_DETECT_REGEX = /\b(?:Segmento\s+vida\s+real\s+desta\s+atividade|Atividade\s+prática|Atividade\s+pratica|Contexto\s+real)\s*:/i;
const RUSH_DETECT_REGEX = /\b(?:Responda rapidamente|Confie nos seus instintos|Sem pensar muito|Responda agora)\b/i;
const EMOTION_TAG_DETECT_REGEX = /\[(?:animado|confiante|pause|pausa(?:\s+curta)?|entusiasmado|calmo|sereno|did[aá]tico|tom\s+[^\]\n]{1,20})\]/i;

export function sanitizeV8PedagogicalText(text: string): string {
  if (!text || typeof text !== "string") return text;

  return text
    .replace(META_LABEL_LINE_REGEX, "$1")
    .replace(RUSH_LINE_REGEX, "$1")
    // Strip non-Latin scripts (Devanagari, Bengali, Gurmukhi, Arabic, Cyrillic, CJK, Japanese, Thai, Korean)
    .replace(/[\u0900-\u097F\u0980-\u09FF\u0A00-\u0A7F\u0600-\u06FF\u0400-\u04FF\u4E00-\u9FFF\u3040-\u30FF\u0E00-\u0E7F\uAC00-\uD7AF]/g, '')
    // Convert SSML <break> tags to natural punctuation (v2 doesn't support SSML)
    .replace(/<break\s+time\s*=\s*["']?(\d*\.?\d+)s["']?\s*\/?>/gi, (_match, seconds) => {
      const s = parseFloat(seconds);
      if (s >= 0.8) return '...';
      if (s >= 0.4) return ', ...';
      return ', ';
    })
    // Strip any remaining SSML tags
    .replace(/<[^>]+>/g, '')
    // Strip bracket tags EXCEPT ElevenLabs emotion tags, structural markers, and markdown links
    .replace(/\[([^\]]{1,40})\]/gi, (match, inner) => {
      // Preserve markdown link text [text](url)
      if (/\]\(/.test(text.slice(text.indexOf(match), text.indexOf(match) + match.length + 5))) return match;
      const normalized = inner.toLowerCase().trim();
      // Preserve ElevenLabs emotion/prosody tags
      if (ELEVENLABS_EMOTION_TAGS.has(normalized)) return match;
      // Preserve structural markers (QUIZ, PLAYGROUND, EXERCISE:*)
      if (/^(quiz|playground|exercise:[a-z_-]+)$/i.test(inner.trim())) return match;
      return '';
    })
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Strip ALL bracket tags for display rendering.
 * Emotion/prosody tags like [energetic], [short pause] etc are meant for TTS only.
 */
export function stripProsodyTagsForDisplay(text: string): string {
  if (!text || typeof text !== "string") return text;
  return text
    .replace(/\[([^\]]{1,40})\]/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/^\s+/gm, '')
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
