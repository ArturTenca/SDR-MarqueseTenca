import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { MetricsCards } from "@/components/dashboard/MetricsCards";
import { ChartsSection } from "@/components/dashboard/ChartsSection";
import { LeadsTable } from "@/components/dashboard/LeadsTable";
import { ConversationAnalysis } from "@/components/dashboard/ConversationAnalysis";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { FollowupData } from "@/types/followup";

const Index = () => {
  const [data, setData] = useState<FollowupData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      const { data: chatsData, error } = await supabase
        .from("chats")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      setData(chatsData || []);
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
    fetchData();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Powered by badges */}
        <div className="flex justify-center gap-4 mb-6">
          <div className="flex items-center gap-2 px-4 py-2 bg-transparent text-green-800 rounded-lg text-sm font-medium">
            <div className="w-6 h-6 bg-transparent rounded flex items-center justify-center" style={{filter: 'drop-shadow(0 0 8px #3ECF8E)'}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#3ECF8E" stroke="#3ECF8E" strokeWidth="2">
                <path d="M21.362 9.354H12V.396a.396.396 0 0 0-.716-.233L2.203 12.424l-.401.562a1.04 1.04 0 0 0 .836 1.659H12v8.959a.396.396 0 0 0 .716.233l9.081-12.261.401-.562a1.04 1.04 0 0 0-.836-1.66z"/>
              </svg>
            </div>
            Powered by Supabase
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-transparent text-[#EA4B71] rounded-lg text-sm font-medium">
            <div className="w-6 h-6 bg-transparent rounded flex items-center justify-center" style={{filter: 'drop-shadow(0 0 8px #EA4B71) drop-shadow(0 0 16px #EA4B71)'}}>
              <img width={19} height={19} src="/n8n-color.png" alt="" />
            </div>
            Powered by n8n
          </div>
        </div>

        
        <MetricsCards data={data} loading={loading} />
        
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-card">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="analysis">Análise de Conversas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <ChartsSection data={data} loading={loading} />
          </TabsContent>
          
          <TabsContent value="leads">
            <LeadsTable data={data} loading={loading} onRefresh={fetchData} />
          </TabsContent>
          
          <TabsContent value="analysis">
            <ConversationAnalysis data={data} loading={loading} />
          </TabsContent>
        </Tabs>
      </main>
      
      <footer className="border-t mt-16 py-6 text-center text-sm text-muted-foreground">
        <div className="space-y-2">
          <p>Powered by IA SDR – Automação Marques e Tenca</p>
          <p className="text-xs">Desenvolvido por <span className="font-medium text-primary">Artur Tenca</span></p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
