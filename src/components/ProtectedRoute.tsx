import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const isLoggedIn = localStorage.getItem("isLoggedIn");
      const loginTime = localStorage.getItem("loginTime");
      const sessionToken = localStorage.getItem("sessionToken");
      
      // Check if user is logged in
      if (isLoggedIn !== "true") {
        localStorage.clear();
        navigate("/auth");
        return;
      }

      // Check session timeout (24 hours)
      if (loginTime) {
        const loginTimestamp = parseInt(loginTime);
        const currentTime = Date.now();
        const sessionDuration = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
        
        if (currentTime - loginTimestamp > sessionDuration) {
          localStorage.clear();
          navigate("/auth");
          return;
        }
      } else {
        localStorage.clear();
        navigate("/auth");
        return;
      }

      // Check session token
      if (!sessionToken || sessionToken !== "mt_sdr_session_" + btoa("marques_tenca_2024")) {
        localStorage.clear();
        navigate("/auth");
        return;
      }

      // Additional security checks
      const userAgent = localStorage.getItem("userAgent");
      if (userAgent && userAgent !== navigator.userAgent) {
        localStorage.clear();
        navigate("/auth");
        return;
      }

      setIsAuthenticated(true);
      setIsChecking(false);
    };

    checkAuth();
  }, [navigate]);

  if (isChecking) {
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

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};
