import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, X, Send, Phone, Trash2, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";

interface BlockedNumber {
  id: number;
  numero: string;
  created_at?: string;
}

export const BlockedNumbersSection = () => {
  const [numbers, setNumbers] = useState<string[]>([]);
  const [currentNumber, setCurrentNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [blockedNumbers, setBlockedNumbers] = useState<BlockedNumber[]>([]);
  const [loadingNumbers, setLoadingNumbers] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [numberToDelete, setNumberToDelete] = useState<BlockedNumber | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();


  const handleAddNumber = () => {
    const trimmedNumber = currentNumber.trim();
    
    if (!trimmedNumber) {
      toast({
        title: "Número inválido",
        description: "Por favor, insira um número válido.",
        variant: "destructive",
      });
      return;
    }

    // Verifica se o número já foi adicionado
    if (numbers.includes(trimmedNumber)) {
      toast({
        title: "Número duplicado",
        description: "Este número já foi adicionado à lista.",
        variant: "destructive",
      });
      return;
    }

    setNumbers([...numbers, trimmedNumber]);
    setCurrentNumber("");
  };

  const handleRemoveNumber = (numberToRemove: string) => {
    setNumbers(numbers.filter(num => num !== numberToRemove));
  };

  const handleSubmit = async () => {
    if (numbers.length === 0) {
      toast({
        title: "Lista vazia",
        description: "Adicione pelo menos um número antes de enviar.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    try {
      // Insere cada número diretamente no Supabase
      for (let i = 0; i < numbers.length; i++) {
        const number = numbers[i];
        
        try {
          // Verifica se o número já existe
          const { data: existing } = await supabase
            .from("numeros")
            .select("id")
            .eq("numero", number)
            .single();

          if (existing) {
            // Número já existe, pular
            console.log(`Número ${number} já existe, pulando...`);
            successCount++;
            continue;
          }

          // Insere o número no banco
          const { error } = await supabase
            .from("numeros")
            .insert({
              numero: number,
            });

          if (error) {
            throw new Error(`Erro ao inserir número ${number}: ${error.message}`);
          }

          successCount++;
          
          // Pequeno delay entre requisições para evitar sobrecarga
          if (i < numbers.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        } catch (error: any) {
          errorCount++;
          errors.push(error.message || `Erro ao inserir número ${number}`);
          console.error(`Erro ao inserir número ${number}:`, error);
        }
      }

      // Mostra resultado baseado no sucesso/erro
      if (errorCount === 0) {
        toast({
          title: "Números adicionados com sucesso",
          description: `${successCount} número(s) foram adicionados ao banco de dados.`,
        });
        // Limpa a lista após envio bem-sucedido
        setNumbers([]);
        // Recarrega números do banco
        await fetchBlockedNumbers();
      } else if (successCount > 0) {
        toast({
          title: "Adição parcial",
          description: `${successCount} número(s) adicionados com sucesso, ${errorCount} falharam.`,
          variant: "destructive",
        });
        // Recarrega números do banco mesmo com envio parcial
        await fetchBlockedNumbers();
      } else {
        throw new Error(errors.join("; "));
      }
    } catch (error: any) {
      console.error("Erro ao adicionar números:", error);
      toast({
        title: "Erro ao adicionar",
        description: error.message || "Não foi possível adicionar os números.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Buscar números bloqueados do Supabase
  const fetchBlockedNumbers = async () => {
    try {
      setLoadingNumbers(true);
      console.log("🔍 Buscando números bloqueados do Supabase...");
      
      const { data, error } = await supabase
        .from("numeros")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("❌ Erro ao buscar números bloqueados:", error);
        toast({
          title: "Erro ao carregar números",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      console.log("✅ Números encontrados:", data);
      console.log("📊 Total de números:", data?.length || 0);
      
      // Mapear os dados para garantir que a coluna 'numero' está correta
      const mappedData = (data || []).map((item: any) => ({
        id: item.id,
        numero: item.numero || item.number || item.telefone || item.numero_telefone || "",
        created_at: item.created_at,
      })).filter((item: BlockedNumber) => item.numero); // Filtrar apenas itens com número válido

      console.log("📝 Dados mapeados:", mappedData);
      setBlockedNumbers(mappedData);
    } catch (error: any) {
      console.error("❌ Erro ao buscar números bloqueados:", error);
      toast({
        title: "Erro ao carregar números",
        description: "Não foi possível carregar os números bloqueados.",
        variant: "destructive",
      });
    } finally {
      setLoadingNumbers(false);
    }
  };

  // Carregar números ao montar o componente e configurar real-time
  useEffect(() => {
    fetchBlockedNumbers();
    
    // Auto-refresh a cada 30 segundos para atualização mais frequente
    const interval = setInterval(fetchBlockedNumbers, 30 * 1000);
    
    // Configurar real-time subscription para atualizações automáticas
    const channel = supabase
      .channel('numeros-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'numeros'
        },
        (payload) => {
          console.log('🔄 Mudança detectada na tabela numeros:', payload);
          // Recarregar números quando houver mudanças
          fetchBlockedNumbers();
        }
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);

  // Abrir dialog de confirmação para deletar
  const handleDeleteClick = (number: BlockedNumber) => {
    setNumberToDelete(number);
    setDeleteDialogOpen(true);
  };

  // Confirmar e deletar número diretamente do Supabase
  const handleConfirmDelete = async () => {
    if (!numberToDelete) return;

    setIsDeleting(true);

    try {
      // Deleta o número diretamente do Supabase onde a coluna numero é igual
      const { error } = await supabase
        .from("numeros")
        .delete()
        .eq("numero", numberToDelete.numero);

      if (error) {
        throw new Error(`Erro ao deletar número: ${error.message}`);
      }

      toast({
        title: "Número deletado com sucesso",
        description: `O número ${numberToDelete.numero} foi removido.`,
      });

      // Recarregar lista do banco
      await fetchBlockedNumbers();
      setDeleteDialogOpen(false);
      setNumberToDelete(null);
    } catch (error: any) {
      console.error("Erro ao deletar número:", error);
      toast({
        title: "Erro ao deletar",
        description: error.message || "Não foi possível deletar o número.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddNumber();
    }
  };

  return (
    <Card className="transition-all duration-300 hover:shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          Números Bloqueados
        </CardTitle>
        <CardDescription>
          Adicione um ou mais números para bloquear e envie via webhook
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Formulário para adicionar números */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone-number">Número de Telefone</Label>
            <div className="flex gap-2">
              <Input
                id="phone-number"
                type="text"
                placeholder="Ex: 5511999999999"
                value={currentNumber}
                onChange={(e) => setCurrentNumber(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button
                type="button"
                onClick={handleAddNumber}
                variant="outline"
                className="transition-all duration-200 hover:scale-105 hover:shadow-md"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              ⚠️ O número deve sempre incluir DDD e DDI
            </p>
          </div>
        </div>

        {/* Lista de números adicionados (temporários, antes de enviar) */}
        {numbers.length > 0 && (
          <div className="space-y-3">
            <Label>Números adicionados ({numbers.length})</Label>
            <div className="border rounded-lg p-4 space-y-2 max-h-[300px] overflow-y-auto">
              {numbers.map((number, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-muted/50 rounded-md hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="font-mono">
                      {number}
                    </Badge>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveNumber(number)}
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lista de números bloqueados do banco */}
        <div className="space-y-3 border-t pt-6">
          <div className="flex items-center justify-between">
            <Label>Números bloqueados ({blockedNumbers.length})</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={fetchBlockedNumbers}
              disabled={loadingNumbers}
              className="h-8"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loadingNumbers ? "animate-spin" : ""}`} />
              Atualizar
            </Button>
          </div>
          {loadingNumbers ? (
            <div className="border rounded-lg p-4 text-center text-muted-foreground">
              Carregando números...
            </div>
          ) : blockedNumbers.length === 0 ? (
            <div className="border rounded-lg p-4 text-center text-muted-foreground">
              Nenhum número bloqueado encontrado.
            </div>
          ) : (
            <div className="border rounded-lg p-4 space-y-2 max-h-[400px] overflow-y-auto">
              {blockedNumbers.map((blockedNumber) => (
                <div
                  key={blockedNumber.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-md hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="font-mono text-sm">
                      {blockedNumber.numero}
                    </Badge>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteClick(blockedNumber)}
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Botão de enviar */}
        <div className="flex justify-end pt-4 border-t">
          <Button
            onClick={handleSubmit}
            disabled={numbers.length === 0 || isSubmitting}
            className="transition-all duration-200 hover:scale-105 hover:shadow-md"
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Enviar {numbers.length > 0 && `(${numbers.length})`}
              </>
            )}
          </Button>
        </div>


        {/* Dialog de confirmação para deletar */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar exclusão</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja remover o número <strong className="font-mono">{numberToDelete?.numero}</strong> da lista de bloqueados?
                Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteDialogOpen(false);
                  setNumberToDelete(null);
                }}
                disabled={isDeleting}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <div className="h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Deletando...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Deletar
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};


