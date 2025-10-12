export interface FollowupData {
  id: number;
  created_at: string;
  remotejID: string | null;
  ultimaMensagem: string | null;
  ultimaAtividade: string | null;
  encerrado: boolean | null;
  followup1: boolean | null;
  followup2: boolean | null;
}
