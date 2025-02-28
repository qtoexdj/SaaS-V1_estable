import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Faltan las variables de entorno de Supabase');
}

// Configuración según la documentación oficial
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Monitor de sesión según la documentación
supabase.auth.onAuthStateChange((event, session) => {
  if (session?.user && import.meta.env.DEV) {
    console.log('Supabase auth event:', event);
    console.log('User role:', session.user.app_metadata.user_rol);
  }
});