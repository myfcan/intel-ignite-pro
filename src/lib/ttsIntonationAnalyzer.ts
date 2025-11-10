/**
 * 🎙️ TTS INTONATION ANALYZER
 * Detecta problemas de entonação no texto antes da geração de áudio
 */

export interface IntonationIssue {
  type: 'uppercase' | 'multiple-exclamation' | 'multiple-question' | 'excessive-emphasis' | 'emoji-sequence' | 'long-sentence';
  severity: 'low' | 'medium' | 'high';
  message: string;
  location: string;
  suggestion: string;
}

export interface IntonationAnalysisResult {
  hasIssues: boolean;
  issues: IntonationIssue[];
  score: number; // 0-100, quanto maior melhor
}

/**
 * Analisa o texto em busca de problemas de entonação para TTS
 */
export function analyzeTTSIntonation(text: string, sectionId?: string): IntonationAnalysisResult {
  const issues: IntonationIssue[] = [];
  
  // 1. Detectar palavras em CAIXA ALTA (exceto siglas de 2-3 letras)
  const uppercasePattern = /\b[A-ZÀÁÂÃÄÅÇÈÉÊËÌÍÎÏÑÒÓÔÕÖÙÚÛÜÝŸ]{4,}\b/g;
  const uppercaseMatches = text.match(uppercasePattern);
  if (uppercaseMatches) {
    uppercaseMatches.forEach(word => {
      issues.push({
        type: 'uppercase',
        severity: 'high',
        message: `Palavra em CAIXA ALTA detectada: "${word}"`,
        location: sectionId || 'texto',
        suggestion: `Trocar "${word}" por "${word.toLowerCase()}" para evitar "gritos" no áudio`
      });
    });
  }

  // 2. Detectar múltiplas exclamações (!! ou mais)
  const multipleExclamationPattern = /!{2,}/g;
  const exclamationMatches = text.match(multipleExclamationPattern);
  if (exclamationMatches) {
    exclamationMatches.forEach(match => {
      issues.push({
        type: 'multiple-exclamation',
        severity: 'medium',
        message: `Múltiplas exclamações detectadas: "${match}"`,
        location: sectionId || 'texto',
        suggestion: 'Usar apenas uma exclamação (!) para entonação natural'
      });
    });
  }

  // 3. Detectar múltiplos pontos de interrogação (?? ou mais)
  const multipleQuestionPattern = /\?{2,}/g;
  const questionMatches = text.match(multipleQuestionPattern);
  if (questionMatches) {
    questionMatches.forEach(match => {
      issues.push({
        type: 'multiple-question',
        severity: 'medium',
        message: `Múltiplos pontos de interrogação detectados: "${match}"`,
        location: sectionId || 'texto',
        suggestion: 'Usar apenas um ponto de interrogação (?) para entonação natural'
      });
    });
  }

  // 4. Detectar ênfase excessiva (***palavra*** ou palavras em negrito com CAIXA ALTA)
  const excessiveEmphasisPattern = /\*\*\*[^*]+\*\*\*|\*\*[A-ZÀÁÂÃÄÅÇÈÉÊËÌÍÎÏÑÒÓÔÕÖÙÚÛÜÝŸ]{4,}\*\*/g;
  const emphasisMatches = text.match(excessiveEmphasisPattern);
  if (emphasisMatches) {
    emphasisMatches.forEach(match => {
      issues.push({
        type: 'excessive-emphasis',
        severity: 'medium',
        message: `Ênfase excessiva detectada: "${match}"`,
        location: sectionId || 'texto',
        suggestion: 'Usar formatação simples (**texto**) e evitar CAIXA ALTA dentro de negrito'
      });
    });
  }

  // 5. Detectar sequências de emojis (3 ou mais emojis seguidos)
  const emojiSequencePattern = /[\u{1F300}-\u{1F9FF}]{3,}/gu;
  const emojiMatches = text.match(emojiSequencePattern);
  if (emojiMatches) {
    emojiMatches.forEach(match => {
      issues.push({
        type: 'emoji-sequence',
        severity: 'low',
        message: `Sequência de emojis detectada: "${match}"`,
        location: sectionId || 'texto',
        suggestion: 'Emojis em sequência podem causar pausas estranhas no áudio'
      });
    });
  }

  // 6. Detectar frases muito longas (mais de 150 caracteres sem pontuação)
  const sentences = text.split(/[.!?]+/);
  sentences.forEach((sentence, index) => {
    const cleanSentence = sentence.trim();
    if (cleanSentence.length > 150) {
      issues.push({
        type: 'long-sentence',
        severity: 'low',
        message: `Frase muito longa detectada (${cleanSentence.length} caracteres)`,
        location: sectionId || `frase ${index + 1}`,
        suggestion: 'Dividir em frases menores para melhorar o ritmo da narração'
      });
    }
  });

  // Calcular score (0-100)
  const highIssues = issues.filter(i => i.severity === 'high').length;
  const mediumIssues = issues.filter(i => i.severity === 'medium').length;
  const lowIssues = issues.filter(i => i.severity === 'low').length;
  
  const score = Math.max(0, 100 - (highIssues * 20 + mediumIssues * 10 + lowIssues * 5));

  return {
    hasIssues: issues.length > 0,
    issues,
    score
  };
}

/**
 * Analisa todas as seções de uma aula
 */
export function analyzeLessonIntonation(sections: Array<{ id: string; visualContent?: string; content?: string }>): IntonationAnalysisResult {
  const allIssues: IntonationIssue[] = [];
  
  sections.forEach(section => {
    const textContent = section.visualContent || section.content || '';
    if (textContent) {
      const result = analyzeTTSIntonation(textContent, section.id);
      allIssues.push(...result.issues);
    }
  });

  // Calcular score geral
  const highIssues = allIssues.filter(i => i.severity === 'high').length;
  const mediumIssues = allIssues.filter(i => i.severity === 'medium').length;
  const lowIssues = allIssues.filter(i => i.severity === 'low').length;
  
  const score = Math.max(0, 100 - (highIssues * 20 + mediumIssues * 10 + lowIssues * 5));

  return {
    hasIssues: allIssues.length > 0,
    issues: allIssues,
    score
  };
}

/**
 * Formata os problemas encontrados para exibição
 */
export function formatIntonationReport(result: IntonationAnalysisResult): string {
  if (!result.hasIssues) {
    return '✅ Nenhum problema de entonação detectado! Texto pronto para TTS.';
  }

  const lines: string[] = [
    `⚠️ ANÁLISE DE ENTONAÇÃO TTS - Score: ${result.score}/100`,
    '',
    'Problemas encontrados:',
    ''
  ];

  // Agrupar por severidade
  const highIssues = result.issues.filter(i => i.severity === 'high');
  const mediumIssues = result.issues.filter(i => i.severity === 'medium');
  const lowIssues = result.issues.filter(i => i.severity === 'low');

  if (highIssues.length > 0) {
    lines.push('🔴 CRÍTICO (podem causar "gritos" no áudio):');
    highIssues.forEach(issue => {
      lines.push(`  • ${issue.message} [${issue.location}]`);
      lines.push(`    💡 ${issue.suggestion}`);
    });
    lines.push('');
  }

  if (mediumIssues.length > 0) {
    lines.push('🟡 MÉDIO (podem causar entonação exagerada):');
    mediumIssues.forEach(issue => {
      lines.push(`  • ${issue.message} [${issue.location}]`);
      lines.push(`    💡 ${issue.suggestion}`);
    });
    lines.push('');
  }

  if (lowIssues.length > 0) {
    lines.push('🟢 BAIXO (melhorias recomendadas):');
    lowIssues.forEach(issue => {
      lines.push(`  • ${issue.message} [${issue.location}]`);
      lines.push(`    💡 ${issue.suggestion}`);
    });
  }

  return lines.join('\n');
}
