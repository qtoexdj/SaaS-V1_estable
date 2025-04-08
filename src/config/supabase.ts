import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

// Obtener variables de entorno
let supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
let supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Valores predeterminados para desarrollo o si faltan variables de entorno
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('⚠️ Faltan las variables de entorno de Supabase. La aplicación funcionará en modo degradado.');
  // Usar valores ficticios para permitir que la aplicación se inicie
  supabaseUrl = 'https://example.supabase.co';
  supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4YW1wbGUiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjk2MjgxMCwiZXhwIjoxOTMyNTM4ODEwfQ.fake-key';
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