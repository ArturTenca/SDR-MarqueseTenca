import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { MetricsCards } from "@/components/dashboard/MetricsCards";
import { ChartsSection } from "@/components/dashboard/ChartsSection";
import { LeadsTable } from "@/components/dashboard/LeadsTable";
import { MessagesViewer } from "@/components/dashboard/MessagesViewer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { FollowupData } from "@/types/followup";

const Index = () => {
  const [data, setData] = useState<FollowupData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check authentication
    const checkAuth = () => {
      const isLoggedIn = localStorage.getItem("isLoggedIn");
      
      if (isLoggedIn !== "true") {
        navigate("/auth");
        return;
      }

      setIsAuthenticated(true);
    };

    checkAuth();
  }, [navigate]);

  const fetchData = async () => {
    try {
      const { data: followupData, error } = await supabase
        .from("followup")
        .select("*")
        .order("ultimaAtividade", { ascending: false });

      if (error) throw error;
      setData(followupData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os dados do dashboard.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
      
      // Auto-refresh every 5 minutes
      const interval = setInterval(fetchData, 5 * 60 * 1000);
      
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        <MetricsCards data={data} loading={loading} />
        
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-card">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="messages">Mensagens</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <ChartsSection data={data} loading={loading} />
          </TabsContent>
          
          <TabsContent value="leads">
            <LeadsTable data={data} loading={loading} onRefresh={fetchData} />
          </TabsContent>
          
          <TabsContent value="messages">
            <MessagesViewer data={data} loading={loading} />
          </TabsContent>
        </Tabs>
      </main>
      
      <footer className="border-t mt-16 py-6 text-center text-sm text-muted-foreground">
        Powered by IA SDR – Automação Marques e Tenca
      </footer>
    </div>
  );
};

export default Index;
