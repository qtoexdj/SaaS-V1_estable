import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { Spin } from 'antd';
import { useUserStore, getUserRole, type UserRole } from '../stores/userStore';
import type { CustomUser } from '../stores/userStore';
import '../styles/MainLayout.css'; // Reutilizamos los estilos de loading

interface PrivateRouteProps {
  children?: React.ReactNode;
  requiredRoles?: UserRole[];
}

interface AuthCheckResult {
  isAuthorized: boolean;
  redirectTo?: string;
  errorMessage?: string;
}

const checkBasicAuth = (user: CustomUser | null, isAuthenticated: boolean): AuthCheckResult => {
  if (!isAuthenticated || !user) {
    return {
      isAuthorized: false,
      redirectTo: '/login',
      errorMessage: '[Auth] Usuario no autenticado'
    };
  }
  return { isAuthorized: true };
};

const checkUserStatus = (user: CustomUser): AuthCheckResult => {
  if (!user.activo) {
    return {
      isAuthorized: false,
      redirectTo: '/login',
      errorMessage: '[Auth] Usuario inactivo'
    };
  }
  return { isAuthorized: true };
};

const checkUserMetadata = (user: CustomUser): AuthCheckResult => {
  const userRole = getUserRole(user);
  if (!userRole || !user.inmobiliaria_id) {
    return {
      isAuthorized: false,
      redirectTo: '/login',
      errorMessage: '[Auth] Metadata de usuario incompleta',
      
    };
  }
  return { isAuthorized: true };
};

const checkUserRole = (user: CustomUser, requiredRoles?: UserRole[]): AuthCheckResult => {
  if (!requiredRoles || requiredRoles.length === 0) {
    return { isAuthorized: true };
  }

  const userRole = getUserRole(user);
  if (!requiredRoles.includes(userRole!)) {
    return {
      isAuthorized: false,
      redirectTo: '/unauthorized',
      errorMessage: '[Auth] Usuario no tiene el rol requerido'
    };
  }
  return { isAuthorized: true };
};

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, requiredRoles }) => {
  const location = useLocation();
  const { user, loading, isAuthenticated } = useUserStore();

  // Mostrar spinner mientras se cargan los datos
  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large">
          <div className="loading-content">Verificando acceso...</div>
        </Spin>
      </div>
    );
  }

  // Realizar verificaciones en orden
  const checks: AuthCheckResult[] = [
    checkBasicAuth(user, isAuthenticated),
    ...(user ? [
      checkUserStatus(user),
      checkUserMetadata(user),
      checkUserRole(user, requiredRoles)
    ] : [])
  ];

  // Encontrar el primer error
  const error = checks.find(check => !check.isAuthorized);
  if (error) {
    if (error.errorMessage) {
      console.warn(error.errorMessage, {
        userId: user?.id,
        role: user?.user_rol,
        requiredRoles,
        path: location.pathname
      });
    }
    return <Navigate to={error.redirectTo!} state={{ from: location }} replace />;
  }

  // Todo ok, renderizar la ruta protegida
  return children ? <>{children}</> : <Outlet />;
};

export default PrivateRoute;