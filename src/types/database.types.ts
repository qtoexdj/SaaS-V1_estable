import { UserRole } from '../stores/userStore';

export interface Database {
  public: {
    Tables: {
      inmobiliarias: {
        Row: {
          id: string;
          nombre: string;
          activo: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nombre: string;
          activo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nombre?: string;
          activo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      usuarios: {
        Row: {
          id: string;
          email: string;
          nombre: string | null;
          telefono: string | null;
          user_rol: UserRole;
          inmobiliaria_id: string;
          activo: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          nombre?: string | null;
          telefono?: string | null;
          user_rol: UserRole;
          inmobiliaria_id: string;
          activo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          nombre?: string | null;
          telefono?: string | null;
          user_rol?: UserRole;
          inmobiliaria_id?: string;
          activo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
