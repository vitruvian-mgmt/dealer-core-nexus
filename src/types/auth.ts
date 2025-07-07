import { User, Session } from '@supabase/supabase-js';

export type UserRole = 'admin' | 'sales_manager' | 'sales_rep' | 'technician' | 'inventory_manager' | 'accountant';

export interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  dealership_id: string;
  dealership_name: string; // Keep for compatibility
  role_id: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  dealerships?: {
    name: string;
  };
  roles?: {
    name: string;
    permissions: any; // Use any for JSON compatibility
  };
  // Add computed properties for compatibility
  role?: UserRole;
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
}

export interface CreateProfileData {
  full_name: string;
  role: UserRole;
  dealership_name: string;
  phone?: string;
}