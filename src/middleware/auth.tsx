import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore, type UserRole } from '../stores/userStore';

export const AuthMiddleware = ({ children }: { children: React.ReactNode }) => {
  const { user, loading: userLoading, isAuthenticated } = useUserStore();
  const navigate = useNavigate();

  useEffect(() => {
    // Solo realizar redirecciones cuando no está cargando
    if (!userLoading) {
      const currentPath = window.location.pathname;
      
      // No redirigir si ya estamos en login o unauthorized
      if (currentPath === '/login' || currentPath === '/unauthorized') {
        return;
      }

      if (!isAuthenticated) {
        // Si no hay sesión, redirigir al login
        navigate('/login');
      } else if (!user?.user_rol || !user?.inmobiliaria_id) {
        // Si hay sesión pero faltan metadatos críticos, redirigir a página de no autorizado
        navigate('/unauthorized');
      }
    }
  }, [user, userLoading, isAuthenticated, navigate]);

  // Mostrar nada mientras se verifica la autenticación
  if (userLoading) {
    return null;
  }

  // Si todo está bien, renderizar los children
  return <>{children}</>;
};

// HOC para proteger rutas específicas según rol
export const withRoleCheck = (
  WrappedComponent: React.ComponentType,
  allowedRoles: UserRole[]
) => {
  return function WithRoleCheck(props: any) {
    const { user } = useUserStore();
    const navigate = useNavigate();

    useEffect(() => {
      const userRole = user?.user_rol;
      if (userRole && !allowedRoles.includes(userRole)) {
        console.warn(`[Auth] Acceso denegado para rol: ${userRole}`);
        navigate('/unauthorized');
      }
    }, [user, navigate]);

    if (!user?.user_rol) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
};