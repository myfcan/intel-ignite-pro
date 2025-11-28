import { useState, useEffect, useCallback } from 'react';
import { getUnlockedPrompts, UnlockedPrompt } from '@/services/promptUnlock';

export function useUnlockedPrompts() {
  const [unlockedPrompts, setUnlockedPrompts] = useState<UnlockedPrompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUnlockedPrompts = useCallback(async () => {
    setIsLoading(true);
    try {
      const prompts = await getUnlockedPrompts();
      setUnlockedPrompts(prompts);
    } catch (error) {
      console.error('[useUnlockedPrompts] Erro ao buscar prompts:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUnlockedPrompts();
  }, [fetchUnlockedPrompts]);

  const isPromptUnlocked = useCallback(
    (promptId: string) => {
      return unlockedPrompts.some(up => up.prompt_id === promptId);
    },
    [unlockedPrompts]
  );

  return {
    unlockedPrompts,
    isLoading,
    isPromptUnlocked,
    refresh: fetchUnlockedPrompts
  };
}
