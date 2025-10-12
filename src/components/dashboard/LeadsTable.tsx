import { useState } from "react";
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
import { Search, Download, RefreshCw } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface LeadsTableProps {
  data: FollowupData[];
  loading: boolean;
  onRefresh: () => void;
}

export const LeadsTable = ({ data, loading, onRefresh }: LeadsTableProps) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();

  const getStatusBadge = (item: FollowupData) => {
    if (item.encerrado) {
      return <Badge className="bg-success text-success-foreground">Encerrado</Badge>;
    }
    if (item.followup2) {
      return <Badge variant="outline">Follow-up 2</Badge>;
    }
    if (item.followup1) {
      return <Badge variant="outline">Follow-up 1</Badge>;
    }
    return <Badge className="bg-accent text-accent-foreground">Em Andamento</Badge>;
  };

  const filteredData = data.filter((item) => {
    const matchesSearch = item.remotejID?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "encerrado" && item.encerrado) ||
      (statusFilter === "andamento" && !item.encerrado) ||
      (statusFilter === "followup1" && item.followup1 && !item.encerrado) ||
      (statusFilter === "followup2" && item.followup2 && !item.encerrado);
    return matchesSearch && matchesStatus;
  });

  const exportToCSV = () => {
    const headers = ["ID", "Lead", "Última Atividade", "Status", "Encerrado"];
    const csvData = filteredData.map((item) => [
      item.id,
      item.remotejID || "-",
      item.ultimaAtividade ? format(parseISO(item.ultimaAtividade), "dd/MM/yyyy HH:mm", { locale: ptBR }) : "-",
      item.followup2 ? "Follow-up 2" : item.followup1 ? "Follow-up 1" : "Em Andamento",
      item.encerrado ? "Sim" : "Não",
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

  if (loading) {
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Tabela de Leads</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por ID do lead..."
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

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID Lead</TableHead>
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
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.remotejID || "-"}</TableCell>
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
      </CardContent>
    </Card>
  );
};
