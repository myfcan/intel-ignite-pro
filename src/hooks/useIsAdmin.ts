import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useIsAdmin(userId: string | undefined) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ⚠️ CRITICAL FIX: Se userId ainda é undefined, manter loading = true
    // Isso evita race condition onde o componente renderiza antes do userId estar pronto
    if (!userId) {
      console.log('[useIsAdmin] userId ainda undefined, mantendo loading=true');
      setIsAdmin(false);
      setLoading(true); // MUDANÇA: Antes era false, agora é true
      return;
    }

    const checkAdminStatus = async () => {
      setLoading(true);
      try {
        console.log('[useIsAdmin] Checking admin status for:', userId);
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .eq('role', 'admin')
          .maybeSingle();

        if (error) {
          console.error('[useIsAdmin] Error:', error);
          setIsAdmin(false);
        } else {
          const adminResult = !!data;
          console.log('[useIsAdmin] ✅ Admin status confirmed:', adminResult, 'Data:', data);
          setIsAdmin(adminResult);
        }
      } catch (error) {
        console.error('[useIsAdmin] Unexpected error:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
        console.log('[useIsAdmin] Loading finished, isAdmin:', !!data);
      }
    };

    checkAdminStatus();
  }, [userId]);

  console.log('[useIsAdmin] Retornando:', { isAdmin, loading, userId });
  return { isAdmin, loading };
}
