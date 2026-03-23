/**
 * Anchor Text System — Pipeline Utilities
 *
 * Parses [ANCHOR:*] tags from narration scripts, cleans text for ElevenLabs,
 * and matches anchor phrases to ElevenLabs alignment timestamps.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export type AnchorType =
  | 'pontos_atencao'
  | 'confirmacao'
  | 'troca_frame'
  | 'troca_ferramenta';

export interface AnchorTag {
  type: AnchorType;
  position_in_text: number;
  phrase_after: string;
}

export interface AnchorResult {
  anchor_type: AnchorType;
  timestamp_seconds: number;
  match_phrase: string;
  label: string | null;
}

export interface AlignmentData {
  characters: string[];
  character_start_times_seconds: number[];
  character_end_times_seconds: number[];
}

// ─── Constants ───────────────────────────────────────────────────────────────

const VALID_ANCHOR_TYPES: AnchorType[] = [
  'pontos_atencao',
  'confirmacao',
  'troca_frame',
  'troca_ferramenta',
];

const ANCHOR_TAG_REGEX = /\[ANCHOR:(\w+)\]\n?/g;

// Tolerant regex for removal — catches variations in casing, extra spaces, brackets
const ANCHOR_REMOVE_REGEX = /\[\s*[Aa][Nn][Cc][Hh][Oo][Rr]\s*:\s*\w+\s*\]\n?/g;

// Number of words to extract after each tag for match_phrase
const PHRASE_WORD_COUNT = 6;

// ─── Parser ──────────────────────────────────────────────────────────────────

/**
 * Extracts [ANCHOR:type] tags from a narration script.
 * Returns the list of tags with their positions and the phrase that follows.
 */
export function parseAnchorTags(script: string): AnchorTag[] {
  const tags: AnchorTag[] = [];
  let match: RegExpExecArray | null;

  // Reset regex state
  ANCHOR_TAG_REGEX.lastIndex = 0;

  while ((match = ANCHOR_TAG_REGEX.exec(script)) !== null) {
    const type = match[1] as AnchorType;

    if (!VALID_ANCHOR_TYPES.includes(type)) {
      console.warn(`[anchor-utils] Unknown anchor type: ${type}. Skipping.`);
      continue;
    }

    // Text after the tag (what will remain after tag removal)
    const afterTag = script.substring(match.index + match[0].length);
    const phraseAfter = extractFirstWords(afterTag, PHRASE_WORD_COUNT);

    tags.push({
      type,
      position_in_text: match.index,
      phrase_after: phraseAfter,
    });
  }

  return tags;
}

/**
 * Removes all [ANCHOR:*] tags from text, producing clean text for ElevenLabs.
 */
export function removeAnchorTags(script: string): string {
  // Use tolerant regex to catch any variation of [ANCHOR:*] tags
  return script.replace(ANCHOR_REMOVE_REGEX, '').replace(/\n{3,}/g, '\n\n').trim();
}

// ─── Match Algorithm ─────────────────────────────────────────────────────────

/**
 * Matches anchor phrases against ElevenLabs alignment data to extract timestamps.
 *
 * For each anchor tag, finds the match_phrase in the reconstructed text
 * from the alignment, then returns the timestamp of the first character.
 *
 * Throws if a phrase is not found (pipeline must block).
 */
export function matchAnchorsToTimestamps(
  tags: AnchorTag[],
  alignment: AlignmentData,
): AnchorResult[] {
  const fullText = alignment.characters.join('');
  const results: AnchorResult[] = [];

  for (const tag of tags) {
    const { type, phrase_after } = tag;

    if (!phrase_after || phrase_after.trim().length === 0) {
      throw new Error(
        `[anchor-utils] Anchor '${type}' has no phrase_after. ` +
        `The tag must be followed by text in the script.`
      );
    }

    const charIndex = fullText.indexOf(phrase_after);

    if (charIndex < 0) {
      throw new Error(
        `[anchor-utils] Anchor match failed: "${phrase_after}" not found in audio alignment. ` +
        `Anchor type: '${type}'. Regenerate audio with updated script.`
      );
    }

    const timestamp = alignment.character_start_times_seconds[charIndex];

    if (timestamp === undefined || timestamp < 0) {
      throw new Error(
        `[anchor-utils] Invalid timestamp for anchor '${type}' at char index ${charIndex}. ` +
        `Regenerate audio.`
      );
    }

    results.push({
      anchor_type: type,
      timestamp_seconds: Math.round(timestamp * 100) / 100, // 2 decimal precision
      match_phrase: phrase_after,
      label: generateLabel(type, phrase_after),
    });
  }

  return results;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function extractFirstWords(text: string, count: number): string {
  const trimmed = text.trim();
  const words = trimmed.split(/\s+/).slice(0, count);
  return words.join(' ');
}

function generateLabel(type: AnchorType, phrase: string): string {
  const typeLabels: Record<AnchorType, string> = {
    pontos_atencao: 'Pontos de atenção',
    confirmacao: 'Confirmação',
    troca_frame: 'Troca de frame',
    troca_ferramenta: 'Troca de ferramenta',
  };
  const shortPhrase = phrase.length > 30 ? phrase.substring(0, 30) + '...' : phrase;
  return `${typeLabels[type]}: ${shortPhrase}`;
}
