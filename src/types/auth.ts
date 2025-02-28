import type { User as SupabaseUser } from '@supabase/supabase-js';

export interface CustomUser extends Omit<SupabaseUser, 'app_metadata'> {
  nombre: string;
  user_metadata: {
    avatar_url?: string;
    [key: string]: any;
  };
  app_metadata: {
    inmobiliaria_id?: string;
    user_rol?: string;
    activo?: boolean;
    [key: string]: any;
  };
}