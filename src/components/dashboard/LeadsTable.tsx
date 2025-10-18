import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FollowupData } from "@/types/followup";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Download, RefreshCw, FileText, Calendar, Settings } from "lucide-react";
import { format, parseISO, subDays, subWeeks, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { formatMaskedPhone } from "@/lib/phone-utils";
import { supabase } from "@/integrations/supabase/client";

interface FollowupTableData {
  id: number;
  created_at: string;
  encerrado: boolean | null;
  followup1: boolean | null;
  followup2: boolean | null;
  remotejid: string | null;
  ultimaAtividade: string | null;
  ultimaMensagem: string | null;
}

interface LeadsTableProps {
  data: FollowupData[];
  loading: boolean;
  onRefresh: () => void;
}

export const LeadsTable = ({ data, loading, onRefresh }: LeadsTableProps) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showExportPanel, setShowExportPanel] = useState(false);
  const [followupData, setFollowupData] = useState<FollowupTableData[]>([]);
  const [followupLoading, setFollowupLoading] = useState(true);
  const [exportSettings, setExportSettings] = useState({
    fields: {
      id: true,
      leadNumber: true,
      lastActivity: true,
      lastMessage: true,
      status: true,
      closed: true,
    },
    timeRange: "all",
    leadGroups: "all",
    customDays: 30,
  });
  const { toast } = useToast();

  // Buscar dados da tabela followup
  const fetchFollowupData = async () => {
    try {
      setFollowupLoading(true);
      console.log("Buscando dados da tabela followup...");
      
      const { data: followupData, error } = await supabase
        .from("followup")
        .select("*")
        .order("created_at", { ascending: false });

      console.log("Dados do followup:", followupData);
      console.log("Erro do followup:", error);

      if (error) {
        console.error("Erro ao buscar dados do followup:", error);
        toast({
          title: "Erro ao carregar dados",
          description: `Erro: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      setFollowupData(followupData || []);
    } catch (error) {
      console.error("Erro ao buscar dados do followup:", error);
      toast({
        title: "Erro ao carregar dados",
        description: "Erro inesperado ao carregar os dados.",
        variant: "destructive",
      });
    } finally {
      setFollowupLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowupData();
  }, []);

  const getLeadNumber = (remotejid: string | null) => {
    if (!remotejid) return "-";
    
    // Remove @whatsapp.net and extract the phone number
    const phoneNumber = remotejid.replace(/@.*$/, "");
    
    // Format Brazilian phone number: 5511999999999 -> (11) 99999-9999
    if (phoneNumber.length >= 13 && phoneNumber.startsWith('55')) {
      const countryCode = phoneNumber.slice(0, 2); // 55
      const areaCode = phoneNumber.slice(2, 4);    // 11
      const number = phoneNumber.slice(4);         // 9999999999
      
      // Format as (11) 99999-9999
      if (number.length === 9) {
        return `(${areaCode}) ${number.slice(0, 5)}-${number.slice(5)}`;
      } else if (number.length === 8) {
        return `(${areaCode}) ${number.slice(0, 4)}-${number.slice(4)}`;
      }
    }
    
    // If not a standard Brazilian format, return the clean number
    return phoneNumber;
  };

  const getStatusBadge = (item: FollowupTableData) => {
    if (item.encerrado) {
      return <Badge className="bg-gray-600 text-white hover:bg-gray-700 transition-colors">Encerrado</Badge>;
    }
    if (item.followup2) {
      return <Badge className="bg-blue-600 text-white hover:bg-blue-700 transition-colors">Follow-up 2</Badge>;
    }
    if (item.followup1) {
      return <Badge className="bg-yellow-600 text-white hover:bg-yellow-700 transition-colors">Follow-up 1</Badge>;
    }
    return <Badge className="bg-accent text-accent-foreground">Em Andamento</Badge>;
  };

  const filteredData = followupData.filter((item) => {
    const leadNumber = getLeadNumber(item.remotejid);
    const matchesSearch = leadNumber.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "andamento" && !item.encerrado && !item.followup1 && !item.followup2) ||
      (statusFilter === "encerrado" && item.encerrado) ||
      (statusFilter === "followup1" && item.followup1 && !item.encerrado) ||
      (statusFilter === "followup2" && item.followup2 && !item.encerrado);
    return matchesSearch && matchesStatus;
  });

  const exportToCSV = () => {
    const headers = ["ID", "Número do Lead", "Última Atividade", "Última Mensagem", "Status"];
    const csvData = filteredData.map((item) => [
      item.id,
      getLeadNumber(item.remotejid),
      item.ultimaAtividade ? format(parseISO(item.ultimaAtividade), "dd/MM/yyyy HH:mm", { locale: ptBR }) : "-",
      item.ultimaMensagem || "-",
      item.encerrado ? "Encerrado" : item.followup2 ? "Follow-up 2" : item.followup1 ? "Follow-up 1" : "Em Andamento",
    ]);
    
    const csv = [headers, ...csvData].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    
    toast({
      title: "Exportado com sucesso",
      description: "Os dados foram exportados para CSV.",
    });
  };

  const getFilteredDataForExport = () => {
    let exportData = [...followupData];

    // Filter by time range
    if (exportSettings.timeRange !== "all") {
      const now = new Date();
      let startDate: Date;

      switch (exportSettings.timeRange) {
        case "7days":
          startDate = subDays(now, 7);
          break;
        case "30days":
          startDate = subDays(now, 30);
          break;
        case "90days":
          startDate = subDays(now, 90);
          break;
        case "custom":
          startDate = subDays(now, exportSettings.customDays);
          break;
        default:
          startDate = new Date(0);
      }

      exportData = exportData.filter((item) => {
        if (!item.ultimaAtividade) return false;
        const itemDate = parseISO(item.ultimaAtividade);
        return itemDate >= startDate;
      });
    }

    // Filter by lead groups
    if (exportSettings.leadGroups !== "all") {
      switch (exportSettings.leadGroups) {
        case "closed":
          exportData = exportData.filter((item) => item.encerrado);
          break;
        case "active":
          exportData = exportData.filter((item) => !item.encerrado);
          break;
        case "followup1":
          exportData = exportData.filter((item) => item.followup1 && !item.encerrado);
          break;
        case "followup2":
          exportData = exportData.filter((item) => item.followup2 && !item.encerrado);
          break;
      }
    }

    return exportData;
  };

  const exportToTXT = () => {
    const exportData = getFilteredDataForExport();
    
    if (exportData.length === 0) {
      toast({
        title: "Nenhum dado para exportar",
        description: "Não há leads que correspondam aos filtros selecionados.",
        variant: "destructive",
      });
      return;
    }

    let txtContent = "RELATÓRIO DE LEADS - MARQUES E TENCA\n";
    txtContent += "=" .repeat(50) + "\n";
    txtContent += `Gerado em: ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}\n`;
    txtContent += `Total de leads: ${exportData.length}\n\n`;

    // Add filters info
    txtContent += "FILTROS APLICADOS:\n";
    txtContent += "-" .repeat(20) + "\n";
    
    if (exportSettings.timeRange !== "all") {
      const timeRangeText = {
        "7days": "Últimos 7 dias",
        "30days": "Últimos 30 dias", 
        "90days": "Últimos 90 dias",
        "custom": `Últimos ${exportSettings.customDays} dias`
      }[exportSettings.timeRange] || "Todos os períodos";
      txtContent += `Período: ${timeRangeText}\n`;
    } else {
      txtContent += "Período: Todos os períodos\n";
    }

    const leadGroupsText = {
      "all": "Todos os leads",
      "closed": "Apenas encerrados",
      "active": "Apenas em andamento",
      "followup1": "Apenas Follow-up 1",
      "followup2": "Apenas Follow-up 2"
    }[exportSettings.leadGroups] || "Todos os leads";
    txtContent += `Grupo: ${leadGroupsText}\n\n`;

    // Add data
    txtContent += "DADOS DOS LEADS:\n";
    txtContent += "-" .repeat(20) + "\n\n";

    exportData.forEach((item, index) => {
      txtContent += `${index + 1}. `;
      
      if (exportSettings.fields.leadNumber) {
        txtContent += `Número: ${getLeadNumber(item.remotejid)}`;
      }
      
      if (exportSettings.fields.lastActivity) {
        txtContent += ` | Última Atividade: ${item.ultimaAtividade ? format(parseISO(item.ultimaAtividade), "dd/MM/yyyy HH:mm", { locale: ptBR }) : "N/A"}`;
      }
      
      if (exportSettings.fields.status) {
        const status = item.encerrado ? "Encerrado" : item.followup2 ? "Follow-up 2" : item.followup1 ? "Follow-up 1" : "Em Andamento";
        txtContent += ` | Status: ${status}`;
      }
      
      if (exportSettings.fields.closed) {
        txtContent += ` | Encerrado: ${item.encerrado ? "Sim" : "Não"}`;
      }
      
      if (exportSettings.fields.lastMessage && item.ultimaMensagem) {
        txtContent += ` | Última Mensagem: ${item.ultimaMensagem}`;
      }
      
      txtContent += "\n";
    });

    txtContent += "\n" + "=" .repeat(50) + "\n";
    txtContent += "Relatório gerado automaticamente pelo sistema SDR MT\n";

    const blob = new Blob([txtContent], { type: "text/plain;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio-leads-${format(new Date(), "yyyy-MM-dd-HHmm")}.txt`;
    a.click();
    
    toast({
      title: "Relatório exportado com sucesso",
      description: `${exportData.length} leads foram exportados para TXT.`,
    });
  };

  if (loading || followupLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="transition-all duration-300 hover:shadow-lg hover:scale-[1.005]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Tabela de Leads</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => { onRefresh(); fetchFollowupData(); }} className="transition-all duration-200 hover:scale-105 hover:shadow-md">
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
            <Button variant="outline" size="sm" onClick={exportToCSV} className="transition-all duration-200 hover:scale-105 hover:shadow-md">
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowExportPanel(!showExportPanel)} className="transition-all duration-200 hover:scale-105 hover:shadow-md">
              <FileText className="h-4 w-4 mr-2" />
              Relatório TXT
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por número do lead..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="andamento">Em Andamento</SelectItem>
              <SelectItem value="encerrado">Encerrado</SelectItem>
              <SelectItem value="followup1">Follow-up 1</SelectItem>
              <SelectItem value="followup2">Follow-up 2</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número do Lead</TableHead>
                <TableHead>Última Atividade</TableHead>
                <TableHead>Última Mensagem</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    Nenhum lead encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((item) => (
                  <TableRow key={item.id} className="transition-all duration-200 hover:bg-accent/10">
                    <TableCell className="font-medium">{getLeadNumber(item.remotejid)}</TableCell>
                    <TableCell>
                      {item.ultimaAtividade
                        ? format(parseISO(item.ultimaAtividade), "dd/MM/yyyy HH:mm", { locale: ptBR })
                        : "-"}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {item.ultimaMensagem || "-"}
                    </TableCell>
                    <TableCell>{getStatusBadge(item)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Export Panel */}
        {showExportPanel && (
          <Card className="mt-6 border-dashed border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configurações do Relatório TXT
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Fields Selection */}
              <div>
                <Label className="text-base font-semibold mb-3 block">Campos a Incluir:</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="leadNumber"
                      checked={exportSettings.fields.leadNumber}
                      onCheckedChange={(checked) =>
                        setExportSettings(prev => ({
                          ...prev,
                          fields: { ...prev.fields, leadNumber: checked as boolean }
                        }))
                      }
                    />
                    <Label htmlFor="leadNumber">Número do Lead</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="lastActivity"
                      checked={exportSettings.fields.lastActivity}
                      onCheckedChange={(checked) =>
                        setExportSettings(prev => ({
                          ...prev,
                          fields: { ...prev.fields, lastActivity: checked as boolean }
                        }))
                      }
                    />
                    <Label htmlFor="lastActivity">Última Atividade</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="status"
                      checked={exportSettings.fields.status}
                      onCheckedChange={(checked) =>
                        setExportSettings(prev => ({
                          ...prev,
                          fields: { ...prev.fields, status: checked as boolean }
                        }))
                      }
                    />
                    <Label htmlFor="status">Status</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="closed"
                      checked={exportSettings.fields.closed}
                      onCheckedChange={(checked) =>
                        setExportSettings(prev => ({
                          ...prev,
                          fields: { ...prev.fields, closed: checked as boolean }
                        }))
                      }
                    />
                    <Label htmlFor="closed">Encerrado</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="lastMessage"
                      checked={exportSettings.fields.lastMessage}
                      onCheckedChange={(checked) =>
                        setExportSettings(prev => ({
                          ...prev,
                          fields: { ...prev.fields, lastMessage: checked as boolean }
                        }))
                      }
                    />
                    <Label htmlFor="lastMessage">Última Mensagem</Label>
                  </div>
                </div>
              </div>

              {/* Time Range Selection */}
              <div>
                <Label className="text-base font-semibold mb-3 block">Período de Tempo:</Label>
                <Select
                  value={exportSettings.timeRange}
                  onValueChange={(value) =>
                    setExportSettings(prev => ({ ...prev, timeRange: value }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione o período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os períodos</SelectItem>
                    <SelectItem value="7days">Últimos 7 dias</SelectItem>
                    <SelectItem value="30days">Últimos 30 dias</SelectItem>
                    <SelectItem value="90days">Últimos 90 dias</SelectItem>
                    <SelectItem value="custom">Período personalizado</SelectItem>
                  </SelectContent>
                </Select>
                
                {exportSettings.timeRange === "custom" && (
                  <div className="mt-3">
                    <Label htmlFor="customDays">Número de dias:</Label>
                    <Input
                      id="customDays"
                      type="number"
                      min="1"
                      max="365"
                      value={exportSettings.customDays}
                      onChange={(e) =>
                        setExportSettings(prev => ({
                          ...prev,
                          customDays: parseInt(e.target.value) || 30
                        }))
                      }
                      className="mt-1"
                    />
                  </div>
                )}
              </div>

              {/* Lead Groups Selection */}
              <div>
                <Label className="text-base font-semibold mb-3 block">Grupos de Leads:</Label>
                <Select
                  value={exportSettings.leadGroups}
                  onValueChange={(value) =>
                    setExportSettings(prev => ({ ...prev, leadGroups: value }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione o grupo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os leads</SelectItem>
                    <SelectItem value="closed">Apenas encerrados</SelectItem>
                    <SelectItem value="active">Apenas em andamento</SelectItem>
                    <SelectItem value="followup1">Apenas Follow-up 1</SelectItem>
                    <SelectItem value="followup2">Apenas Follow-up 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Preview */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <Label className="text-base font-semibold mb-2 block">Preview:</Label>
                <p className="text-sm text-muted-foreground">
                  Serão exportados aproximadamente <strong>{getFilteredDataForExport().length}</strong> leads
                  {exportSettings.timeRange !== "all" && (
                    <> para o período selecionado</>
                  )}
                  {exportSettings.leadGroups !== "all" && (
                    <> do grupo selecionado</>
                  )}
                  .
                </p>
              </div>

              {/* Export Button */}
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowExportPanel(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={exportToTXT}
                  className="bg-primary hover:bg-primary/90"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Gerar Relatório TXT
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};
