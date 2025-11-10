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
import { Search, Download, RefreshCw, FileText, Calendar, Settings, ArrowUpRight } from "lucide-react";
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

interface ChatData {
  remotejID: string | null;
  Nome: string | null;
}

interface LeadsTableProps {
  data: FollowupData[];
  loading: boolean;
  onRefresh: () => void;
  onLeadClick?: (remotejid: string) => void;
}

export const LeadsTable = ({ data, loading, onRefresh, onLeadClick }: LeadsTableProps) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showExportPanel, setShowExportPanel] = useState(false);
  const [showCSVExportPanel, setShowCSVExportPanel] = useState(false);
  const [followupData, setFollowupData] = useState<FollowupTableData[]>([]);
  const [followupLoading, setFollowupLoading] = useState(true);
  const [chatsData, setChatsData] = useState<ChatData[]>([]);
  const [chatsLoading, setChatsLoading] = useState(true);
  const [exportSettings, setExportSettings] = useState({
    fields: {
      id: true,
      leadName: true,
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

  // Buscar dados da tabela chats para obter os nomes
  const fetchChatsData = async () => {
    try {
      setChatsLoading(true);
      console.log("🔍 Buscando dados da tabela chats...");
      
      // Buscar todos os campos primeiro para ver o que temos
      const { data: chatsData, error } = await supabase
        .from("chats")
        .select("*");

      console.log("📊 Dados completos do chats:", chatsData);
      console.log("❌ Erro do chats:", error);

      if (error) {
        console.error("Erro ao buscar dados do chats:", error);
        toast({
          title: "Aviso",
          description: `Erro ao buscar nomes: ${error.message}`,
          variant: "destructive",
        });
        setChatsData([]);
        return;
      }

      // Mapear os dados para o formato esperado
      const mappedData = (chatsData || []).map((chat: any) => ({
        remotejID: chat.remotejID || chat.remotejid || chat.remote_jid,
        Nome: chat.Nome || chat.nome || chat.name || null
      }));

      console.log("✅ Dados mapeados do chats:", mappedData);
      console.log("📝 Total de registros:", mappedData.length);
      console.log("📝 Registros com nome:", mappedData.filter((c: any) => c.Nome).length);

      setChatsData(mappedData);
    } catch (error) {
      console.error("Erro ao buscar dados do chats:", error);
      setChatsData([]);
    } finally {
      setChatsLoading(false);
    }
  };

  useEffect(() => {
    // Fetch data immediately
    fetchFollowupData();
    fetchChatsData();
    
    // Auto-refresh every 2 minutes for chats (names might change more frequently)
    const chatsInterval = setInterval(fetchChatsData, 2 * 60 * 1000);
    
    // Auto-refresh every 5 minutes for followup data
    const followupInterval = setInterval(fetchFollowupData, 5 * 60 * 1000);
    
    return () => {
      clearInterval(followupInterval);
      clearInterval(chatsInterval);
    };
  }, []);

  // Função para obter o nome do lead baseado no remotejID
  const getLeadName = (remotejid: string | null): string => {
    if (!remotejid) {
      console.log("⚠️ remotejid é null/undefined");
      return "-";
    }
    
    // Normalizar o remotejid para comparação (remover espaços, converter para lowercase)
    const normalizedRemotejid = remotejid.trim().toLowerCase();
    
    // Buscar o chat correspondente
    const chat = chatsData.find(c => {
      if (!c.remotejID) return false;
      const normalizedChatId = c.remotejID.trim().toLowerCase();
      return normalizedChatId === normalizedRemotejid;
    });
    
    if (chat) {
      console.log(`✅ Nome encontrado para ${remotejid}: ${chat.Nome}`);
      return chat.Nome || "-";
    } else {
      console.log(`❌ Nome NÃO encontrado para ${remotejid}. Total de chats: ${chatsData.length}`);
      console.log("📋 Chats disponíveis:", chatsData.map(c => ({ remotejID: c.remotejID, Nome: c.Nome })));
      return "-";
    }
  };

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
      return <Badge className="bg-green-600 text-white hover:bg-green-700 transition-colors">Encerrado</Badge>;
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

  // Helper function to escape CSV values
  const escapeCSVValue = (value: any): string => {
    if (value === null || value === undefined) return "";
    const stringValue = String(value);
    // If value contains comma, newline, or quote, wrap it in quotes and escape internal quotes
    if (stringValue.includes(",") || stringValue.includes("\n") || stringValue.includes('"')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };

  const exportToCSV = () => {
    const exportData = getFilteredDataForExport();
    
    if (exportData.length === 0) {
      toast({
        title: "Nenhum dado para exportar",
        description: "Não há leads que correspondam aos filtros selecionados.",
        variant: "destructive",
      });
      return;
    }

    // Build headers based on selected fields
    const headers: string[] = [];
    if (exportSettings.fields.id) headers.push("ID");
    if (exportSettings.fields.leadName) headers.push("Nome");
    if (exportSettings.fields.leadNumber) headers.push("Número do Lead");
    if (exportSettings.fields.lastActivity) headers.push("Última Atividade");
    if (exportSettings.fields.lastMessage) headers.push("Última Mensagem");
    if (exportSettings.fields.status) headers.push("Status");
    if (exportSettings.fields.closed) headers.push("Encerrado");

    // Build CSV rows
    const csvRows: string[] = [];
    
    // Add metadata as comments (CSV doesn't support comments, so we'll add them as a header row)
    const metadata = [
      `RELATÓRIO DE LEADS - MARQUES E TENCA`,
      `Gerado em: ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}`,
      `Total de leads: ${exportData.length}`,
      `Período: ${exportSettings.timeRange !== "all" ? {
        "7days": "Últimos 7 dias",
        "30days": "Últimos 30 dias",
        "90days": "Últimos 90 dias",
        "custom": `Últimos ${exportSettings.customDays} dias`
      }[exportSettings.timeRange] || "Todos os períodos" : "Todos os períodos"}`,
      `Grupo: ${{
        "all": "Todos os leads",
        "closed": "Apenas encerrados",
        "active": "Apenas em andamento",
        "followup1": "Apenas Follow-up 1",
        "followup2": "Apenas Follow-up 2"
      }[exportSettings.leadGroups] || "Todos os leads"}`,
      "" // Empty row before data
    ];
    
    // Add metadata rows (we'll add them as regular rows, user can filter in Excel)
    metadata.forEach(meta => {
      csvRows.push(escapeCSVValue(meta));
    });

    // Add header row
    csvRows.push(headers.map(escapeCSVValue).join(","));

    // Add data rows
    exportData.forEach((item) => {
      const row: string[] = [];
      
      if (exportSettings.fields.id) row.push(item.id.toString());
      if (exportSettings.fields.leadName) row.push(getLeadName(item.remotejid));
      if (exportSettings.fields.leadNumber) row.push(getLeadNumber(item.remotejid));
      if (exportSettings.fields.lastActivity) {
        row.push(item.ultimaAtividade 
          ? format(parseISO(item.ultimaAtividade), "dd/MM/yyyy HH:mm", { locale: ptBR })
          : "-");
      }
      if (exportSettings.fields.lastMessage) {
        row.push(item.ultimaMensagem || "-");
      }
      if (exportSettings.fields.status) {
        const status = item.encerrado 
          ? "Encerrado" 
          : item.followup2 
            ? "Follow-up 2" 
            : item.followup1 
              ? "Follow-up 1" 
              : "Em Andamento";
        row.push(status);
      }
      if (exportSettings.fields.closed) {
        row.push(item.encerrado ? "Sim" : "Não");
      }
      
      csvRows.push(row.map(escapeCSVValue).join(","));
    });

    // Join all rows
    const csvContent = csvRows.join("\n");
    
    // Add BOM for UTF-8 to ensure proper encoding in Excel
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio-leads-${format(new Date(), "yyyy-MM-dd-HHmm")}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "Relatório exportado com sucesso",
      description: `${exportData.length} leads foram exportados para CSV.`,
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
      
      if (exportSettings.fields.id) {
        txtContent += `ID: ${item.id}`;
      }
      
      if (exportSettings.fields.leadName) {
        txtContent += `${exportSettings.fields.id ? " | " : ""}Nome: ${getLeadName(item.remotejid)}`;
      }
      
      if (exportSettings.fields.leadNumber) {
        txtContent += `${(exportSettings.fields.id || exportSettings.fields.leadName) ? " | " : ""}Número: ${getLeadNumber(item.remotejid)}`;
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

  if (loading || followupLoading || chatsLoading) {
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
            <Button variant="outline" size="sm" onClick={() => { onRefresh(); fetchFollowupData(); fetchChatsData(); }} className="transition-all duration-200 hover:scale-105 hover:shadow-md">
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowCSVExportPanel(!showCSVExportPanel)} className="transition-all duration-200 hover:scale-105 hover:shadow-md">
              <Download className="h-4 w-4 mr-2" />
              Relatório CSV
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
                <TableHead>Nome</TableHead>
                <TableHead>Número do Lead</TableHead>
                <TableHead>Última Atividade</TableHead>
                <TableHead>Última Mensagem</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Nenhum lead encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((item) => (
                  <TableRow 
                    key={item.id} 
                    className="transition-all duration-200 hover:bg-accent/10 cursor-pointer group"
                    onClick={() => {
                      if (item.remotejid && onLeadClick) {
                        onLeadClick(item.remotejid);
                      }
                    }}
                  >
                    <TableCell className="font-medium">{getLeadName(item.remotejid)}</TableCell>
                    <TableCell className="font-medium">{getLeadNumber(item.remotejid)}</TableCell>
                    <TableCell>
                      {item.ultimaAtividade
                        ? format(parseISO(item.ultimaAtividade), "dd/MM/yyyy HH:mm", { locale: ptBR })
                        : "-"}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {item.ultimaMensagem || "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-between">
                        {getStatusBadge(item)}
                        <ArrowUpRight 
                          className="h-4 w-4 text-muted-foreground transition-all duration-300 ease-in-out group-hover:rotate-0 group-hover:text-primary group-hover:scale-110 ml-2" 
                          style={{ transform: 'rotate(45deg)' }}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* CSV Export Panel */}
        {showCSVExportPanel && (
          <Card className="mt-6 border-dashed border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configurações do Relatório CSV
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Fields Selection */}
              <div>
                <Label className="text-base font-semibold mb-3 block">Campos a Incluir:</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="csv-id"
                      checked={exportSettings.fields.id}
                      onCheckedChange={(checked) =>
                        setExportSettings(prev => ({
                          ...prev,
                          fields: { ...prev.fields, id: checked as boolean }
                        }))
                      }
                    />
                    <Label htmlFor="csv-id">ID</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="csv-leadName"
                      checked={exportSettings.fields.leadName}
                      onCheckedChange={(checked) =>
                        setExportSettings(prev => ({
                          ...prev,
                          fields: { ...prev.fields, leadName: checked as boolean }
                        }))
                      }
                    />
                    <Label htmlFor="csv-leadName">Nome</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="csv-leadNumber"
                      checked={exportSettings.fields.leadNumber}
                      onCheckedChange={(checked) =>
                        setExportSettings(prev => ({
                          ...prev,
                          fields: { ...prev.fields, leadNumber: checked as boolean }
                        }))
                      }
                    />
                    <Label htmlFor="csv-leadNumber">Número do Lead</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="csv-lastActivity"
                      checked={exportSettings.fields.lastActivity}
                      onCheckedChange={(checked) =>
                        setExportSettings(prev => ({
                          ...prev,
                          fields: { ...prev.fields, lastActivity: checked as boolean }
                        }))
                      }
                    />
                    <Label htmlFor="csv-lastActivity">Última Atividade</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="csv-status"
                      checked={exportSettings.fields.status}
                      onCheckedChange={(checked) =>
                        setExportSettings(prev => ({
                          ...prev,
                          fields: { ...prev.fields, status: checked as boolean }
                        }))
                      }
                    />
                    <Label htmlFor="csv-status">Status</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="csv-closed"
                      checked={exportSettings.fields.closed}
                      onCheckedChange={(checked) =>
                        setExportSettings(prev => ({
                          ...prev,
                          fields: { ...prev.fields, closed: checked as boolean }
                        }))
                      }
                    />
                    <Label htmlFor="csv-closed">Encerrado</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="csv-lastMessage"
                      checked={exportSettings.fields.lastMessage}
                      onCheckedChange={(checked) =>
                        setExportSettings(prev => ({
                          ...prev,
                          fields: { ...prev.fields, lastMessage: checked as boolean }
                        }))
                      }
                    />
                    <Label htmlFor="csv-lastMessage">Última Mensagem</Label>
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
                    <Label htmlFor="csv-customDays">Número de dias:</Label>
                    <Input
                      id="csv-customDays"
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
                  onClick={() => setShowCSVExportPanel(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={exportToCSV}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Gerar Relatório CSV
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* TXT Export Panel */}
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
                      id="txt-id"
                      checked={exportSettings.fields.id}
                      onCheckedChange={(checked) =>
                        setExportSettings(prev => ({
                          ...prev,
                          fields: { ...prev.fields, id: checked as boolean }
                        }))
                      }
                    />
                    <Label htmlFor="txt-id">ID</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="txt-leadName"
                      checked={exportSettings.fields.leadName}
                      onCheckedChange={(checked) =>
                        setExportSettings(prev => ({
                          ...prev,
                          fields: { ...prev.fields, leadName: checked as boolean }
                        }))
                      }
                    />
                    <Label htmlFor="txt-leadName">Nome</Label>
                  </div>
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
