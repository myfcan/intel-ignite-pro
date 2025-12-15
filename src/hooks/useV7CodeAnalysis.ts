import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CodeIssue {
  type: 'error' | 'warning' | 'suggestion';
  line?: number;
  message: string;
  fix?: string;
}

export interface CodeAnalysis {
  score: number;
  issues: CodeIssue[];
  summary: string;
  improvements: string[];
  isCorrect: boolean;
}

interface UseV7CodeAnalysisOptions {
  expectedCode: string;
  context: string;
  language?: string;
  debounceMs?: number;
  minCodeLength?: number;
}

export function useV7CodeAnalysis({
  expectedCode,
  context,
  language = 'javascript',
  debounceMs = 1500,
  minCodeLength = 10
}: UseV7CodeAnalysisOptions) {
  const [analysis, setAnalysis] = useState<CodeAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const lastCodeRef = useRef<string>('');
  const abortControllerRef = useRef<AbortController | null>(null);

  const analyzeCode = useCallback(async (userCode: string) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Skip if code is too short or unchanged
    if (userCode.length < minCodeLength) {
      setAnalysis(null);
      return;
    }
    
    if (userCode === lastCodeRef.current) {
      return;
    }
    
    lastCodeRef.current = userCode;
    setIsAnalyzing(true);
    setError(null);
    
    abortControllerRef.current = new AbortController();

    try {
      const { data, error: fnError } = await supabase.functions.invoke('v7-code-analysis', {
        body: {
          userCode,
          expectedCode,
          context,
          language
        }
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setAnalysis(data as CodeAnalysis);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return; // Ignore aborted requests
      }
      console.error('Code analysis error:', err);
      setError(err instanceof Error ? err.message : 'Erro ao analisar código');
    } finally {
      setIsAnalyzing(false);
    }
  }, [expectedCode, context, language, minCodeLength]);

  const debouncedAnalyze = useCallback((userCode: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      analyzeCode(userCode);
    }, debounceMs);
  }, [analyzeCode, debounceMs]);

  const reset = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setAnalysis(null);
    setError(null);
    setIsAnalyzing(false);
    lastCodeRef.current = '';
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    analysis,
    isAnalyzing,
    error,
    analyzeCode: debouncedAnalyze,
    analyzeImmediate: analyzeCode,
    reset
  };
}
