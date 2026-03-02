import { V8InlinePlayground, V8InlineQuiz, V8Section, V8LessonData } from "@/types/v8Lesson";

// ─── Types ───

interface ParsedPlayground {
  playground: Omit<V8InlinePlayground, "id" | "afterSectionIndex">;
  position: number;
}

interface ParsedSection {
  title: string;
  content: string;
  position: number;
}

interface ParsedQuiz {
  quiz: Omit<V8InlineQuiz, "id" | "afterSectionIndex">;
  position: number;
}

// ═══════════════════════════════════════════════
// parseFullContent — Master function
// ═══════════════════════════════════════════════

export interface ParseResult extends V8LessonData {
  hasManualExercises: boolean;
  hasManualQuizzes: boolean;
  hasManualPlaygrounds: boolean;
  manualExerciseTypes: string[];
}

export function parseFullContent(rawText: string): ParseResult {
  // 1. Extract title from first # line
  const titleMatch = rawText.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1].trim() : "Aula sem título";

  // 2. Extract description (text between # and first ##)
  let description = "";
  if (titleMatch) {
    const afterTitle = rawText.slice(titleMatch.index! + titleMatch[0].length);
    const firstSectionIdx = afterTitle.search(/^##\s/m);
    const firstBlockIdx = afterTitle.search(/^\[(?:PLAYGROUND|QUIZ)\]/m);
    let endIdx = afterTitle.length;
    if (firstSectionIdx !== -1) endIdx = Math.min(endIdx, firstSectionIdx);
    if (firstBlockIdx !== -1) endIdx = Math.min(endIdx, firstBlockIdx);
    description = afterTitle.slice(0, endIdx).trim();
  }

  // 3. Parse sections
  const parsedSections = parseSections(rawText);

  // 3.1 If there's intro content between # and first ##, create a "Section 0"
  // Filter out meta-comments that are instructions, not real content
  const META_KEYWORDS = /\b(parser|fix|aplicar|opcional|discutimos|TODO|FIXME|implementar|corrigir|descrição opcional)\b/i;
  if (description && description.trim().length > 20 && !META_KEYWORDS.test(description)) {
    const introSection: ParsedSection = {
      title: "Abertura",
      content: description,
      position: 0,
    };
    parsedSections.unshift(introSection);
  }

  // 4. Parse playgrounds (existing)
  const parsedPlaygrounds = parsePlaygroundBlocks(rawText);

  // 5. Parse quizzes
  const parsedQuizzes = parseQuizBlocks(rawText);

  // 6. Build section positions for afterSectionIndex calculation
  const sectionPositions = parsedSections.map(s => s.position);

  // Helper: find afterSectionIndex for a given position
  const findAfterSectionIndex = (pos: number): number => {
    let idx = 0;
    for (let i = sectionPositions.length - 1; i >= 0; i--) {
      if (sectionPositions[i] < pos) {
        idx = i;
        break;
      }
    }
    return idx;
  };

  // 7. Build V8Sections
  const sections: V8Section[] = parsedSections.map((s, i) => {
    // Extract imageUrl from section content if present
    const imageMatch = s.content.match(/^imageUrl:\s*(.+)$/m);
    const imageUrl = imageMatch ? imageMatch[1].trim() : undefined;
    const cleanContent = imageMatch
      ? s.content.replace(/^imageUrl:\s*.+$/m, "").trim()
      : s.content;

    return {
      id: `section-${String(i + 1).padStart(2, "0")}`,
      title: s.title,
      content: cleanContent,
      audioUrl: "",
      ...(imageUrl ? { imageUrl } : {}),
    };
  });

  // 8. Build V8InlinePlaygrounds
  const inlinePlaygrounds: V8InlinePlayground[] = parsedPlaygrounds.map((pg, i) => ({
    ...pg.playground,
    id: `playground-${String(i + 1).padStart(2, "0")}`,
    afterSectionIndex: findAfterSectionIndex(pg.position),
  }));

  // 9. Build V8InlineQuizzes
  const inlineQuizzes: V8InlineQuiz[] = parsedQuizzes.map((q, i) => ({
    ...q.quiz,
    id: `quiz-${String(i + 1).padStart(2, "0")}`,
    afterSectionIndex: findAfterSectionIndex(q.position),
  }));

  // 10. Parse exercise markers [EXERCISE:tipo]
  const exerciseMarkers = parseExerciseMarkers(rawText);

  return {
    contentVersion: "v8",
    title,
    description: description || undefined,
    sections,
    inlineQuizzes,
    inlinePlaygrounds: inlinePlaygrounds.length > 0 ? inlinePlaygrounds : [],
    exercises: [],
    hasManualExercises: exerciseMarkers.length > 0,
    hasManualQuizzes: parsedQuizzes.length > 0,
    hasManualPlaygrounds: parsedPlaygrounds.length > 0,
    manualExerciseTypes: exerciseMarkers,
  };
}

// ═══════════════════════════════════════════════
// parseSections — Extract ## headings
// ═══════════════════════════════════════════════

export function parseSections(rawText: string): ParsedSection[] {
  const results: ParsedSection[] = [];
  const sectionRegex = /^##\s+(.+)$/gm;

  const matches: Array<{ title: string; index: number }> = [];
  let m: RegExpExecArray | null;
  while ((m = sectionRegex.exec(rawText)) !== null) {
    matches.push({ title: m[1].trim(), index: m.index });
  }

  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index + rawText.slice(matches[i].index).indexOf("\n") + 1;
    const end = i + 1 < matches.length ? matches[i + 1].index : rawText.length;

    // Get raw content between this ## and next ## (or end)
    let content = rawText.slice(start, end);

    // Remove any [PLAYGROUND] or [QUIZ] blocks from section content
    content = content
      .replace(/\[PLAYGROUND\]\s*\n[\s\S]*?(?=\n##\s|\n\[(?:PLAYGROUND|QUIZ)\]|\s*$)/gi, "")
      .replace(/\[QUIZ\]\s*\n[\s\S]*?(?=\n##\s|\n\[(?:PLAYGROUND|QUIZ)\]|\s*$)/gi, "")
      .trim();

    if (content || matches[i].title) {
      results.push({
        title: matches[i].title,
        content,
        position: matches[i].index,
      });
    }
  }

  return results;
}

// ═══════════════════════════════════════════════
// parseQuizBlocks — Extract [QUIZ] blocks
// ═══════════════════════════════════════════════

export function parseQuizBlocks(rawText: string): ParsedQuiz[] {
  const results: ParsedQuiz[] = [];
  const blockRegex = /\[QUIZ\]\s*\n([\s\S]*?)(?=\n\[(?:PLAYGROUND|QUIZ|SECTION)\]|\n##\s|\n---|\s*$)/gi;

  let match: RegExpExecArray | null;
  while ((match = blockRegex.exec(rawText)) !== null) {
    const blockContent = match[1];
    const position = match.index;

    const fields = parseFields(blockContent);
    const options = parseQuizOptions(blockContent);

    const quiz: Omit<V8InlineQuiz, "id" | "afterSectionIndex"> = {
      question: fields.question || "",
      options,
      explanation: fields.explanation || "",
      reinforcement: fields.reinforcement,
    };

    results.push({ quiz, position });
  }

  return results;
}

function parseQuizOptions(block: string): V8InlineQuiz["options"] {
  const options: V8InlineQuiz["options"] = [];
  const lines = block.split("\n");
  let inOptions = false;

  for (const line of lines) {
    const trimmed = line.trim();

    // Detect start of options block
    if (trimmed.toLowerCase().startsWith("options:")) {
      inOptions = true;
      continue;
    }

    if (inOptions) {
      // Match "- [x] text" or "- [ ] text"
      const optMatch = trimmed.match(/^-\s*\[(x|\s)\]\s*(.+)$/i);
      if (optMatch) {
        options.push({
          id: `opt-${String(options.length + 1).padStart(2, "0")}`,
          text: optMatch[2].trim(),
          isCorrect: optMatch[1].toLowerCase() === "x",
        });
      } else if (trimmed === "") {
        continue; // skip blank lines inside options
      } else if (trimmed.includes(":") && !trimmed.startsWith("-")) {
        // Hit next field
        inOptions = false;
      }
    }
  }

  return options;
}

// ═══════════════════════════════════════════════
// parsePlaygroundBlocks — Extract [PLAYGROUND] blocks (existing, enhanced)
// ═══════════════════════════════════════════════

export function parsePlaygroundBlocks(rawText: string): ParsedPlayground[] {
  const results: ParsedPlayground[] = [];
  const blockRegex = /\[PLAYGROUND\]\s*\n([\s\S]*?)(?=\n\[(?:PLAYGROUND|QUIZ|SECTION)\]|\n##\s|\n---|\s*$)/gi;

  let match: RegExpExecArray | null;
  while ((match = blockRegex.exec(rawText)) !== null) {
    const blockContent = match[1];
    const position = match.index;

    const fields = parseFields(blockContent);

    const hints = parseListField(blockContent, "hints");
    const evaluationCriteria = parseListField(blockContent, "evaluationCriteria");

    // Fallback: if evaluationCriteria was written as CSV on one line
    if (evaluationCriteria.length === 0) {
      const criteriaRaw = fields.evaluationcriteria || fields.evaluationCriteria || "";
      if (criteriaRaw) {
        evaluationCriteria.push(...criteriaRaw.split(",").map((c: string) => c.trim()).filter(Boolean));
      }
    }

    const playground: Omit<V8InlinePlayground, "id" | "afterSectionIndex"> = {
      title: fields.title || "Playground",
      instruction: fields.instruction || "",
      narration: fields.narration,
      amateurPrompt: fields.amateurprompt || fields.amateurPrompt || "",
      professionalPrompt: fields.professionalprompt || fields.professionalPrompt || "",
      amateurResult: fields.amateurresult || fields.amateurResult,
      professionalResult: fields.professionalresult || fields.professionalResult,
      successMessage: fields.successmessage || fields.successMessage || "Boa! Você avançou.",
      tryAgainMessage: fields.tryagainmessage || fields.tryAgainMessage || "Tente novamente com mais detalhes.",
      subtitle: fields.subtitle,
    };

    // offlineFallback
    const fallbackMessage = fields.offlinefallbackmessage || fields.offlineFallbackMessage;
    const fallbackExample = fields.offlinefallbackexampleanswer || fields.offlineFallbackExampleAnswer;
    if (fallbackMessage || fallbackExample) {
      playground.offlineFallback = {
        message: fallbackMessage || "Continue a aula normalmente.",
        exampleAnswer: fallbackExample || "",
      };
    }

    // Parse user challenge if present
    const challengeInstruction = fields.userchallengeinstruction || fields.userChallengeInstruction;
    const challengePrompt = fields.userchallengeprompt || fields.userChallengePrompt;
    if (challengeInstruction || challengePrompt) {
      const maxAttemptsRaw = fields.maxattempts || fields.maxAttempts;
      const maxAttempts = maxAttemptsRaw ? parseInt(maxAttemptsRaw, 10) : undefined;

      playground.userChallenge = {
        instruction: challengeInstruction || "Agora é sua vez!",
        challengePrompt: challengePrompt || "",
        hints,
        evaluationCriteria,
        ...(maxAttempts && !isNaN(maxAttempts) ? { maxAttempts } : {}),
      };
    }

    if (hints.length > 0 && !playground.userChallenge) {
      playground.hintOnFail = hints;
    }

    results.push({ playground, position });
  }

  return results;
}

/**
 * Assign afterSectionIndex based on section count before each playground position.
 */
export function assignPlaygroundIndices(
  playgrounds: ParsedPlayground[],
  sectionPositions: number[],
): V8InlinePlayground[] {
  return playgrounds.map((pg, idx) => {
    let afterIndex = 0;
    for (let i = sectionPositions.length - 1; i >= 0; i--) {
      if (sectionPositions[i] < pg.position) {
        afterIndex = i;
        break;
      }
    }

    return {
      ...pg.playground,
      id: `playground-${String(idx + 1).padStart(2, "0")}`,
      afterSectionIndex: afterIndex,
    };
  });
}

// ─── Helpers ───

function parseFields(block: string): Record<string, string> {
  const fields: Record<string, string> = {};
  const lines = block.split("\n");
  const listFields = new Set(["hints", "evaluationcriteria", "options"]);

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("- ")) continue;

    const colonIdx = trimmed.indexOf(":");
    if (colonIdx === -1) continue;

    const key = trimmed.slice(0, colonIdx).trim();
    const value = trimmed.slice(colonIdx + 1).trim();

    if (!value && listFields.has(key.toLowerCase())) continue;

    if (key && value) {
      fields[key.toLowerCase()] = value;
      fields[key] = value;
    }
  }

  return fields;
}

function parseListField(block: string, fieldName: string): string[] {
  const items: string[] = [];
  const lines = block.split("\n");
  let inList = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.toLowerCase() === `${fieldName.toLowerCase()}:` || trimmed.toLowerCase().startsWith(`${fieldName.toLowerCase()}:`)) {
      const afterColon = trimmed.slice(trimmed.indexOf(":") + 1).trim();
      if (afterColon) {
        items.push(...afterColon.split(",").map(s => s.trim()).filter(Boolean));
        continue;
      }
      inList = true;
      continue;
    }
    if (inList) {
      if (trimmed === "") {
        continue;
      }
      if (trimmed.startsWith("- ")) {
        items.push(trimmed.slice(2).trim());
      } else if (trimmed.includes(":") && !trimmed.startsWith("-")) {
        inList = false;
      } else if (trimmed.length > 0) {
        items.push(trimmed);
      }
    }
  }

  return items;
}

// ═══════════════════════════════════════════════
// parseExerciseMarkers — Extract [EXERCISE:tipo] markers
// ═══════════════════════════════════════════════

const VALID_EXERCISE_TYPES = [
  "drag-drop", "fill-in-blanks", "scenario-selection", "true-false",
  "platform-match", "data-collection", "complete-sentence",
  "multiple-choice", "flipcard-quiz", "timed-quiz",
];

export function parseExerciseMarkers(rawText: string): string[] {
  const markers: string[] = [];
  const regex = /\[EXERCISE:([a-z-]+)\]/gi;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(rawText)) !== null) {
    const type = match[1].toLowerCase();
    if (VALID_EXERCISE_TYPES.includes(type)) {
      markers.push(type);
    }
  }
  return markers;
}
