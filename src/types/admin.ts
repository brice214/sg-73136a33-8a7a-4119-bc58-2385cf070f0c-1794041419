export type AdminRole = 'super_admin' | 'agasa' | 'aganor' | 'dgccrf';

export interface AdminUser {
  id: string;
  role: AdminRole;
  full_name: string | null;
  created_at: string;
  is_blocked: boolean;
  email?: string;
}

export interface AdminSession {
  user: AdminUser;
  accessToken: string;
}