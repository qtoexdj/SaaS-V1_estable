import { useEffect } from 'react';
import { supabase } from '../config/supabase';
import { useUserStore, type CustomUser } from '../stores/userStore';

interface UseAuthReturn {
  user: CustomUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  role: string | null;
  inmobiliariaName: string | undefined;
  signOut: () => Promise<void>;
}

export const useAuth = (): UseAuthReturn => {
  const {
    user,
    loading,
    isAuthenticated,
    inmobiliariaName,
    initialize,
    signOut
  } = useUserStore();

  useEffect(() => {
    let isSubscribed = true;

    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && isSubscribed && !user) {
        try {
          await initialize();
        } catch (error) {
          console.error('Error en la inicialización:', error);
        }
      }
    };

    checkSession();

    return () => {
      isSubscribed = false;
    };
  }, [initialize, user]);

  useEffect(() => {
    let isSubscribed = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (!isSubscribed) return;

      if (event === 'SIGNED_OUT') {
        // En lugar de llamar a signOut(), solo limpiamos el estado local
        useUserStore.setState(state => ({
          ...state,
          user: null,
          isAuthenticated: false,
          loading: false,
          inmobiliariaName: undefined
        }));
      }
    });

    return () => {
      isSubscribed = false;
      subscription.unsubscribe();
    };
  }, [signOut]);

  const getUserRole = (): string | null => {
    if (!user) return null;
    return user.app_metadata?.user_rol || null;
  };

  return {
    user,
    loading,
    isAuthenticated,
    role: getUserRole(),
    inmobiliariaName,
    signOut
  };
};