import { useEffect, useState } from 'react';
import { supabase } from '../config/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface DatabaseUser {
  id: string;
  nombre: string;
  email: string;
  telefono: string | null;
  user_rol: string;
  inmobiliaria_id: string | null;
  activo: boolean;
}

interface User extends Omit<SupabaseUser, 'user_metadata' | 'app_metadata'> {
  nombre: string;
  user_metadata: Record<string, any>;
  app_metadata: {
    inmobiliaria_id?: string;
    user_rol?: string;
    [key: string]: any;
  };
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [inmobiliariaName, setInmobiliariaName] = useState<string | null>(null);

  const fetchUserDetails = async (userId: string, session: any): Promise<DatabaseUser | null> => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      // Asegurar que tengamos el inmobiliaria_id del usuario
      const inmobiliariaId = session?.user?.app_metadata?.inmobiliaria_id || data?.inmobiliaria_id;
      
      return {
        ...data,
        inmobiliaria_id: inmobiliariaId
      };
    } catch (error) {
      console.error('Error fetching user details:', error);
      return null;
    }
  };

  const fetchInmobiliariaName = async (inmobiliariaId: string) => {
    const { data: inmobiliaria, error } = await supabase
      .from('inmobiliarias')
      .select('nombre')
      .eq('id', inmobiliariaId)
      .single();

    if (error) {
      console.error('Error fetching inmobiliaria name:', error);
    } else {
      setInmobiliariaName(inmobiliaria?.nombre || null);
    }
  };

  const updateUserState = async (session: any) => {
    if (session?.user) {
      const userDetails = await fetchUserDetails(session.user.id, session);
      
      if (userDetails) {
        setUser({
          ...session.user,
          nombre: userDetails.nombre,
          user_metadata: session.user.user_metadata || {},
          app_metadata: session.user.app_metadata || {}
        });

        if (session.user.app_metadata?.inmobiliaria_id) {
          await fetchInmobiliariaName(session.user.app_metadata.inmobiliaria_id);
        }
      }
    } else {
      setUser(null);
      setInmobiliariaName(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    // Verificar sesión actual
    supabase.auth.getSession().then(({ data: { session } }) => {
      updateUserState(session);
    });

    // Escuchar cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      await updateUserState(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const getUserRole = () => {
    return user?.app_metadata?.user_rol || null;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setInmobiliariaName(null);
  };

  return {
    user,
    loading,
    isAuthenticated: !!user,
    role: getUserRole(),
    inmobiliariaName,
    signOut
  };
};