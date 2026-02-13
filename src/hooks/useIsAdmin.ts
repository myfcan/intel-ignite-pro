import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

type AppRole = 'admin' | 'supervisor' | 'user';

export function useIsAdmin(userId: string | undefined) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSupervisor, setIsSupervisor] = useState(false);
  const [userRole, setUserRole] = useState<AppRole>('user');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      console.log('[useIsAdmin] userId ainda undefined, mantendo loading=true');
      setIsAdmin(false);
      setIsSupervisor(false);
      setUserRole('user');
      setLoading(true);
      return;
    }

    const checkAdminStatus = async () => {
      setLoading(true);
      try {
        console.log('[useIsAdmin] Checking admin status for:', userId);
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId);

        if (error) {
          console.error('[useIsAdmin] Error:', error);
          setIsAdmin(false);
          setIsSupervisor(false);
          setUserRole('user');
        } else {
          const roles = (data || []).map((r) => r.role as AppRole);
          const hasAdmin = roles.includes('admin');
          const hasSupervisor = roles.includes('supervisor');
          
          setIsAdmin(hasAdmin);
          setIsSupervisor(hasSupervisor);
          setUserRole(hasAdmin ? 'admin' : hasSupervisor ? 'supervisor' : 'user');
          
          console.log('[useIsAdmin] ✅ Roles:', roles, 'isAdmin:', hasAdmin, 'isSupervisor:', hasSupervisor);
        }
      } catch (error) {
        console.error('[useIsAdmin] Unexpected error:', error);
        setIsAdmin(false);
        setIsSupervisor(false);
        setUserRole('user');
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [userId]);

  // canAccessAdmin: admin OU supervisor podem acessar o painel admin
  const canAccessAdmin = isAdmin || isSupervisor;

  return { isAdmin, isSupervisor, canAccessAdmin, userRole, loading };
}
