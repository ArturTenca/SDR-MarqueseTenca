import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ProcessAnalysis } from "@/types/process-analysis";
import { FileText, ChevronDown, Calendar, Key } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ProcessAnalysisProps {
  loading?: boolean;
}

export const ProcessAnalysisSection = ({ loading: externalLoading }: ProcessAnalysisProps) => {
  const [processes, setProcesses] = useState<ProcessAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProcess, setSelectedProcess] = useState<ProcessAnalysis | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchProcesses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("sumario")
        .select("*")
        .order("Date", { ascending: false });

      if (error) {
        console.error("Erro ao buscar processos:", error);
        toast({
          title: "Erro ao carregar processos",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setProcesses(data || []);
    } catch (error) {
      console.error("Erro ao buscar processos:", error);
      toast({
        title: "Erro ao carregar processos",
        description: "Erro inesperado ao carregar os processos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProcesses();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchProcesses, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const openDialog = (process: ProcessAnalysis) => {
    setSelectedProcess(process);
    setIsDialogOpen(true);
  };

  // Função para formatar data corretamente considerando timezone
  const formatDate = (dateString: string | null, includeTime: boolean = false): string => {
    if (!dateString) return "-";
    
    try {
      // Extrai a parte da data (YYYY-MM-DD) e hora (HH:mm) diretamente da string
      // Isso evita problemas de conversão de timezone
      const dateMatch = dateString.match(/(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}):(\d{2}))?/);
      
      if (!dateMatch) {
        // Se não conseguir extrair, tenta usar new Date normalmente
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "-";
        
        if (includeTime) {
          return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
        } else {
          return format(date, "dd/MM/yyyy", { locale: ptBR });
        }
      }
      
      const [, year, month, day, hour = "00", minute = "00"] = dateMatch;
      
      // Formata diretamente sem conversão de timezone
      if (includeTime) {
        return `${day}/${month}/${year} às ${hour}:${minute}`;
      } else {
        return `${day}/${month}/${year}`;
      }
    } catch (error) {
      console.error("Erro ao formatar data:", error, dateString);
      return "-";
    }
  };

  const getKeyPoints = (process: ProcessAnalysis): string[] => {
    const points: string[] = [];
    if (process.Issue1) points.push(process.Issue1);
    if (process.Issue2) points.push(process.Issue2);
    if (process.Issue3) points.push(process.Issue3);
    if (process.Issue4) points.push(process.Issue4);
    if (process.Issue5) points.push(process.Issue5);
    return points;
  };

  if (loading || externalLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full mb-4" />
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (processes.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">Nenhum processo analisado ainda.</p>
          <p className="text-sm text-muted-foreground mt-2">
            Os processos serão exibidos aqui quando a automação processar documentos.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Análise de Processos</h2>
          <p className="text-muted-foreground mt-1">
            {processes.length} {processes.length === 1 ? "processo analisado" : "processos analisados"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {processes.map((process) => {
          const keyPoints = getKeyPoints(process);
          const hasKeyPoints = keyPoints.length > 0;

          return (
            <Card
              key={process.id}
              className="transition-all duration-300 hover:shadow-lg hover:border-primary/20 cursor-pointer"
              onClick={() => openDialog(process)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg line-clamp-2 mb-2">
                      {process.Subject || "Sem título"}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {formatDate(process.Date, false)}
                      </span>
                    </div>
                  </div>
                  {hasKeyPoints && (
                    <Badge variant="outline" className="flex-shrink-0">
                      <Key className="h-3 w-3 mr-1" />
                      {keyPoints.length}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {process.prazo && (
                  <div>
                    <Badge variant="outline" className="text-xs">
                      Prazo: {process.prazo}
                    </Badge>
                  </div>
                )}

                {hasKeyPoints && (
                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Key className="h-3 w-3" />
                        {keyPoints.length} pontos chave - Clique para ver detalhes
                      </span>
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Dialog com detalhes completos */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-2xl">
              {selectedProcess?.Subject || `Processo #${selectedProcess?.id}`}
            </DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="flex-1 overflow-y-auto pr-4">
            <div className="space-y-6">
              {/* Informações do Processo */}
              <div className="space-y-2">
                {selectedProcess?.Date && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Data: {formatDate(selectedProcess.Date, true)}
                    </span>
                  </div>
                )}
                {selectedProcess?.prazo && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Prazo:</span>
                    <Badge variant="outline" className="font-medium">
                      {selectedProcess.prazo}
                    </Badge>
                  </div>
                )}
              </div>

              {/* Sumário */}
              {selectedProcess?.sumario && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Sumário
                  </h3>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {selectedProcess.sumario}
                    </p>
                  </div>
                </div>
              )}

              {/* Pontos Chave */}
              {getKeyPoints(selectedProcess || {} as ProcessAnalysis).length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    Pontos Chave
                  </h3>
                  <div className="space-y-3">
                    {getKeyPoints(selectedProcess || {} as ProcessAnalysis).map((point, index) => (
                      <Card key={index} className="border-l-4 border-l-primary">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-sm font-bold text-primary">
                                {index + 1}
                              </span>
                            </div>
                            <p className="text-sm leading-relaxed flex-1 pt-1">
                              {point}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

