export interface FollowupData {
  id: number;
  created_at: string;
  remotejid: string | null;
  status: string | null;
  chatID: string | null;
  user_id: string | null;
  // Campos da tabela followup
  ultimaAtividade: string | null;
  ultimaMensagem: string | null;
  encerrado: boolean | null;
  followup1: boolean | null;
  followup2: boolean | null;
}
