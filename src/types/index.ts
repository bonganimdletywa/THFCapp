import { Session } from '@supabase/supabase-js';
// Import UserRole type for user roles


export interface User {
  id: string;
  fullName: string;
  email: string;

  role: import('./zoho').UserRole; // Supports all user roles
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  session: Session | null;
}

export interface CrateData {
  crateId: string;
  defaultBreadQuantity: number;
  actualBreadQuantity: number;
}

export interface LambdaResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}