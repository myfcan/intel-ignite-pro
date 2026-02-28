import { V8InlinePlayground } from "@/types/v8Lesson";

/**
 * Parse [PLAYGROUND] blocks from raw content text.
 *
 * Format:
 * [PLAYGROUND]
 * title: Teste na Prática
 * instruction: Compare os dois prompts...
 * narration: [excited] Agora você vai sentir...
 * amateurPrompt: me fala sobre marketing
 * professionalPrompt: Crie 3 estratégias...
 * successMessage: Boa! Você desbloqueou...
 * tryAgainMessage: Quase lá...
 * hints:
 * - Diga o objetivo
 * - Dê contexto
 * - Peça formato
 */

interface ParsedPlayground {
  playground: Omit<V8InlinePlayground, "id" | "afterSectionIndex">;
  /** Position in the raw text (char index) for ordering */
  position: number;
}

export function parsePlaygroundBlocks(rawText: string): ParsedPlayground[] {
  const results: ParsedPlayground[] = [];
  const blockRegex = /\[PLAYGROUND\]\s*\n([\s\S]*?)(?=\n\[(?:PLAYGROUND|SECTION|QUIZ)\]|\n---|\s*$)/gi;

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
    // Find last section before this playground
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
  // Fields that are parsed as lists — skip them as key:value
  const listFields = new Set(["hints", "evaluationcriteria"]);

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("- ")) continue; // list item, not a field

    const colonIdx = trimmed.indexOf(":");
    if (colonIdx === -1) continue;

    const key = trimmed.slice(0, colonIdx).trim();
    // Use everything AFTER the first colon as value (preserves colons in value)
    const value = trimmed.slice(colonIdx + 1).trim();

    // Skip list headers (e.g. "hints:", "evaluationCriteria:")
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
      // Check if there's inline content after the colon
      const afterColon = trimmed.slice(trimmed.indexOf(":") + 1).trim();
      if (afterColon) {
        // Single-line CSV: "evaluationCriteria: a, b, c"
        items.push(...afterColon.split(",").map(s => s.trim()).filter(Boolean));
        continue;
      }
      inList = true;
      continue;
    }
    if (inList) {
      if (trimmed === "") {
        // Skip blank lines inside list (don't break out)
        continue;
      }
      if (trimmed.startsWith("- ")) {
        items.push(trimmed.slice(2).trim());
      } else if (trimmed.includes(":") && !trimmed.startsWith("-")) {
        // Hit next field — stop list
        inList = false;
      } else if (trimmed.length > 0) {
        // Plain text line without "- " prefix — accept it as list item
        items.push(trimmed);
      }
    }
  }

  return items;
}
