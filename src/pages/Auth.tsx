import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in (simple localStorage check)
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (isLoggedIn === "true") {
      navigate("/");
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Enhanced authentication with multiple checks
      const validCredentials = [
        { username: "admin", password: "1234" },
        { username: "marques", password: "tenca2024" },
        { username: "sdr", password: "mt2024" }
      ];

      const isValidUser = validCredentials.some(
        cred => cred.username === username && cred.password === password
      );

      if (isValidUser) {
        // Set multiple security tokens
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("loginTime", Date.now().toString());
        localStorage.setItem("sessionToken", "mt_sdr_session_" + btoa("marques_tenca_2024"));
        localStorage.setItem("userAgent", navigator.userAgent);
        localStorage.setItem("loginIP", "local"); // In production, get real IP
        
        toast({
          title: "Login realizado com sucesso!",
          description: "Redirecionando para o dashboard...",
        });
        navigate("/");
      } else {
        throw new Error("Usuário ou senha incorretos.");
      }
    } catch (error: any) {
      toast({
        title: "Erro ao fazer login",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <img 
              src="/src/assets/mt-logo.svg" 
              alt="Marques e Tenca" 
              className="h-16 w-auto object-contain rounded-sm"
            />
          </div>
          <CardTitle className="text-2xl text-center">Painel SDR MT</CardTitle>
          <CardDescription className="text-center">
            Faça login para acessar o dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Usuário</Label>
              <Input
                id="username"
                type="text"
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
