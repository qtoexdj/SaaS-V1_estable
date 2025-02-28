import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../config/supabase';

export type UserRole = 'dev' | 'admin' | 'vende';

interface UserAppMetadata {
  user_rol: UserRole;
  inmobiliaria_id: string;
}

interface DatabaseUser {
  id: string;
  email: string;
  nombre: string | null;
  user_rol: UserRole;
  inmobiliaria_id: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
  inmobiliarias?: {
    nombre: string;
  } | null;
}

export interface CustomUser {
  id: string;
  email: string;
  nombre: string | null;
  user_rol: UserRole;
  inmobiliaria_id: string;
  activo: boolean;
  app_metadata: UserAppMetadata;
  user_metadata: {
    avatar_url?: string | undefined;
  };
}

interface UserState {
  user: CustomUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  inmobiliariaName?: string;
  initialize: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Omit<CustomUser, 'id' | 'app_metadata'>>) => Promise<void>;
  updateUserMetadata: (metadata: Partial<CustomUser['user_metadata']>) => Promise<void>;
}

const initialState = {
  user: null,
  loading: false,
  isAuthenticated: false,
  inmobiliariaName: undefined
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      ...initialState,

      initialize: async () => {
        set({ loading: true });
        try {
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session?.user) {
            const { data: userData, error: userError } = await supabase
              .from('usuarios')
              .select(`
                *,
                inmobiliarias (
                  nombre
                )
              `)
              .eq('id', session.user.id)
              .single();

            if (userError) throw userError;

            const dbUser = userData as DatabaseUser;

            if (!dbUser.activo) {
              await supabase.auth.signOut();
              set({ ...initialState, loading: false });
              throw new Error('Usuario inactivo');
            }

            const customUser: CustomUser = {
              id: dbUser.id,
              email: dbUser.email,
              nombre: dbUser.nombre,
              user_rol: dbUser.user_rol,
              inmobiliaria_id: dbUser.inmobiliaria_id,
              activo: dbUser.activo,
              app_metadata: {
                user_rol: dbUser.user_rol,
                inmobiliaria_id: dbUser.inmobiliaria_id
              },
              user_metadata: {
                avatar_url: session.user.user_metadata?.avatar_url
              }
            };

            set({
              user: customUser,
              isAuthenticated: true,
              loading: false,
              inmobiliariaName: dbUser.inmobiliarias?.nombre
            });
          } else {
            set({ ...initialState, loading: false });
          }
        } catch (error) {
          console.error('Error en initialize:', error);
          set({ ...initialState, loading: false });
        }
      },

      updateProfile: async (data) => {
        const state = get();
        if (!state.user?.id) throw new Error('No hay usuario autenticado');

        const { error } = await supabase
          .from('usuarios')
          .update(data)
          .eq('id', state.user.id);

        if (error) throw error;

        set({
          user: state.user ? {
            ...state.user,
            ...data
          } : null
        });
      },

      updateUserMetadata: async (metadata) => {
        const state = get();
        if (!state.user?.id) throw new Error('No hay usuario autenticado');

        const { data: { user }, error } = await supabase.auth.updateUser({
          data: { ...state.user.user_metadata, ...metadata }
        });

        if (error) throw error;

        if (user) {
          set({
            user: state.user ? {
              ...state.user,
              user_metadata: {
                ...state.user.user_metadata,
                ...metadata
              }
            } : null
          });
        }
      },

      signOut: async () => {
        try {
          // Primero limpiamos el estado local
          set(initialState);

          // Luego hacemos el signOut de Supabase
          const { error } = await supabase.auth.signOut();
          if (error) throw error;

          // Limpiamos el storage de zustand
          localStorage.removeItem('user-storage');

          // Redirigimos usando window.location para forzar una recarga limpia
          window.location.href = '/login';
          
        } catch (error) {
          console.error('Error en signOut:', error);
          // En caso de error, intentamos reinicializar
          await get().initialize();
          throw error;
        }
      }
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        inmobiliariaName: state.inmobiliariaName
      })
    }
  )
);

// Helpers
export const getUserRole = (user: CustomUser | null): UserRole | null => {
  return user?.app_metadata?.user_rol || null;
};

export const getInmobiliariaId = (user: CustomUser | null): string | null => {
  return user?.inmobiliaria_id || null;
};