export interface FollowupData {
  id: number;
  created_at: string;
  remotejid: string | null;
  status: string | null;
  chatID: string | null;
  user_id: string | null;
}
