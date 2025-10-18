import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('ProtectedRoute - Session check:', session);
        
        if (session) {
          console.log('ProtectedRoute - User authenticated:', session.user.email);
          setIsAuthenticated(true);
        } else {
          console.log('ProtectedRoute - No session, redirecting to auth');
          setIsAuthenticated(false);
          navigate('/auth', { replace: true });
        }
      } catch (error) {
        console.error('Error in auth check:', error);
        setIsAuthenticated(false);
        navigate('/auth', { replace: true });
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setIsAuthenticated(false);
        navigate('/auth', { replace: true });
      } else if (event === 'SIGNED_IN' && session) {
        setIsAuthenticated(true);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Show loading while checking auth
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md p-6">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="text-center text-sm text-muted-foreground">
            Verificando autenticação...
          </div>
        </div>
      </div>
    );
  }

  // Show children only if authenticated
  if (isAuthenticated === true) {
    return <>{children}</>;
  }

  // Don't render anything if not authenticated
  return null;
};
