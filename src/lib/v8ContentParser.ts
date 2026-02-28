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

    // Parse user challenge if present
    const challengeInstruction = fields.userchallengeinstruction || fields.userChallengeInstruction;
    const challengePrompt = fields.userchallengeprompt || fields.userChallengePrompt;
    if (challengeInstruction || challengePrompt) {
      const criteriaRaw = fields.evaluationcriteria || fields.evaluationCriteria || "";
      const criteria = criteriaRaw
        ? criteriaRaw.split(",").map((c: string) => c.trim()).filter(Boolean)
        : [];

      playground.userChallenge = {
        instruction: challengeInstruction || "Agora é sua vez!",
        challengePrompt: challengePrompt || "",
        hints,
        evaluationCriteria: criteria,
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

  for (const line of lines) {
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;

    const key = line.slice(0, colonIdx).trim();
    const value = line.slice(colonIdx + 1).trim();

    // Skip list headers (e.g. "hints:")
    if (!value && key.toLowerCase() === "hints") continue;

    if (key && value) {
      fields[key.toLowerCase()] = value;
      // Also store original case
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
    if (trimmed.toLowerCase().startsWith(`${fieldName}:`)) {
      inList = true;
      continue;
    }
    if (inList) {
      if (trimmed.startsWith("- ")) {
        items.push(trimmed.slice(2).trim());
      } else if (trimmed === "" || (!trimmed.startsWith("-") && trimmed.includes(":"))) {
        inList = false;
      }
    }
  }

  return items.slice(0, 3); // max 3 hints
}
