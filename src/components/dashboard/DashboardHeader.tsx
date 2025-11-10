import { Building2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
// Logo moved to public folder

export const DashboardHeader = () => {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      // Sign out using Supabase Auth
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Erro no logout:', error);
        toast({
          title: "Erro no logout",
          description: "Ocorreu um erro ao fazer logout.",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });
      
      // Navigation will be handled by ProtectedRoute listening to auth changes
    } catch (error: any) {
      console.error('Erro no logout:', error);
      toast({
        title: "Erro no logout",
        description: "Ocorreu um erro ao fazer logout.",
        variant: "destructive",
      });
    }
  };

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Building2 className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Painel de Conversões – SDR MT
              </h1>
              <p className="text-sm text-muted-foreground">
                Monitoramento em tempo real das interações e reuniões agendadas via automação n8n
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <a 
              href="/" 
              className="transition-all duration-300 hover:shadow-lg hover:shadow-red-500/30 hover:bg-red-500/8 rounded-sm"
              title="Voltar para visão geral"
            >
              <img src="/mt-logo.svg" alt="Marques e Tenca" className="h-10 w-auto rounded-sm" />
            </a>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="transition-all duration-200 hover:scale-110 hover:shadow-md"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="gap-2 transition-all duration-200 hover:scale-105 hover:shadow-md"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
