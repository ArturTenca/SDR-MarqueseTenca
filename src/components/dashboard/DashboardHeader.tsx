import { Building2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import mtLogo from "@/assets/mt-logo.png";

export const DashboardHeader = () => {
  const { theme, setTheme } = useTheme();

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
            <img src={mtLogo} alt="Marques e Tenca" className="h-10 w-auto" />
            <Button
              variant="outline"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
