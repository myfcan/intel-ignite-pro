import { useEffect, useState, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

/**
 * AdminOnlyRoute - Protege rotas exclusivas para admin (NÃO supervisor).
 * Supervisores e usuários comuns são redirecionados.
 */
export function AdminOnlyRoute({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();
  const hasChecked = useRef(false);

  useEffect(() => {
    if (hasChecked.current) return;
    hasChecked.current = true;

    const check = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error || !session) {
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        setIsAuthenticated(true);

        const { data: roles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id);

        const userRoles = (roles || []).map(r => r.role);
        setIsAdmin(userRoles.includes('admin'));
      } catch (err) {
        console.error('[AdminOnlyRoute] Error:', err);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    check();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    const returnTo = location.pathname + location.search;
    return <Navigate to={`/auth?returnTo=${encodeURIComponent(returnTo)}`} replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}
