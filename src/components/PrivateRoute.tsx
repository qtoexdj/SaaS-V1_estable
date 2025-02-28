import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { Spin } from 'antd';
import { useUserStore, getUserRole, type UserRole } from '../stores/userStore';

interface PrivateRouteProps {
  children?: React.ReactNode;
  requiredRoles?: UserRole[];
}

export const PrivateRoute = ({ children, requiredRoles }: PrivateRouteProps) => {
  const location = useLocation();
  const { user, loading, isAuthenticated } = useUserStore();

  // Mostrar spinner mientras se cargan los datos
  if (loading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <Spin size="large" />
      </div>
    );
  }

  // Verificar autenticación básica
  if (!isAuthenticated || !user) {
    console.log('[Auth] Usuario no autenticado, redirigiendo a login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Verificar que el usuario esté activo
  if (!user.activo) {
    console.warn('[Auth] Usuario inactivo');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Verificar metadata del JWT
  const userRole = getUserRole(user);
  if (!userRole || !user.inmobiliaria_id) {
    console.warn('[Auth] Metadata de usuario incompleta', {
      role: userRole,
      inmobiliaria: user.inmobiliaria_id
    });
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Verificar roles si se especifican
  if (requiredRoles && requiredRoles.length > 0) {
    if (!requiredRoles.includes(userRole)) {
      console.warn('[Auth] Usuario no tiene el rol requerido', {
        userRole,
        requiredRoles
      });
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Todo ok, renderizar la ruta protegida
  return children ? <>{children}</> : <Outlet />;
};