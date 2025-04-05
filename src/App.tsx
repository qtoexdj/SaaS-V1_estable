import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { App as AntApp } from 'antd';
import { AuthMiddleware } from './middleware/auth';
import { AuthErrorBoundary } from './components/AuthErrorBoundary';
import { MainLayout } from './layouts/MainLayout';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Páginas
import { Login } from './pages/Login';
import { ResetPassword } from './pages/ResetPassword';
import { ForgotPassword } from './pages/ForgotPassword';
import { Dashboard } from './pages/Dashboard';
import { PrivateRoute } from './components/PrivateRoute';
import { Unauthorized } from './pages/Unauthorized';

// Admin imports
import Projects_admin from './pages/Projects_admin';
import { UsersAdmin } from './pages/Users_admin';
import Chat_admin from './pages/Chat_admin';
import Prospects_admin from './pages/Prospects_admin';
import PushCampaigns_admin from './pages/PushCampaigns_admin';
import Inmobiliaria_admin from './pages/Inmobiliaria_admin';

// Dev imports
import Projects_dev from './pages/Projects_dev';
import { Users_dev } from './pages/Users_dev';
import { RealEstate_dev } from './pages/RealEstate_dev';
import Prospects_dev from './pages/Prospects_dev';
import Profile from './pages/Profile';
import Support from './pages/Support';

import './App.css';
import './styles/global.css';

function App() {
  return (
    <ThemeProvider>
      <AuthErrorBoundary>
        <AntApp>
          <Router>
            <AuthProvider>
              <AuthMiddleware>
                <Routes>
                  {/* Rutas públicas - no requieren autenticación */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/unauthorized" element={<Unauthorized />} />

                  {/* Rutas protegidas */}
                  <Route path="/" element={<PrivateRoute />}>
                    {/* Ruta por defecto */}
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    
                    {/* Layout principal para todas las rutas protegidas */}
                    <Route element={<MainLayout><Outlet /></MainLayout>}>
                      {/* Dashboard general */}
                      <Route path="dashboard" element={<Dashboard />} />
                      
                      {/* Perfil de usuario */}
                      <Route path="profile" element={<Profile />} />
                      
                      {/* Ruta de Soporte */}
                      <Route path="support" element={<Support />} />

                      {/* Rutas Admin */}
                      <Route path="admin">
                        <Route path="projects" element={
                          <PrivateRoute requiredRoles={['admin']}>
                            <Projects_admin />
                          </PrivateRoute>
                        } />
                        <Route path="users" element={
                          <PrivateRoute requiredRoles={['admin']}>
                            <UsersAdmin />
                          </PrivateRoute>
                        } />
                        <Route path="chat" element={
                          <PrivateRoute requiredRoles={['admin']}>
                            <Chat_admin />
                          </PrivateRoute>
                        } />
                        <Route path="prospects" element={
                          <PrivateRoute requiredRoles={['admin']}>
                            <Prospects_admin />
                          </PrivateRoute>
                        } />
                        <Route path="push-campaigns" element={
                          <PrivateRoute requiredRoles={['admin']}>
                            <PushCampaigns_admin />
                          </PrivateRoute>
                        } />
                        <Route path="inmobiliaria" element={
                          <PrivateRoute requiredRoles={['admin']}>
                            <Inmobiliaria_admin />
                          </PrivateRoute>
                        } />
                      </Route>

                      {/* Rutas Dev */}
                      <Route path="dev">
                        <Route path="projects" element={
                          <PrivateRoute requiredRoles={['dev']}>
                            <Projects_dev />
                          </PrivateRoute>
                        } />
                        <Route path="users" element={
                          <PrivateRoute requiredRoles={['dev']}>
                            <Users_dev />
                          </PrivateRoute>
                        } />
                        <Route path="real-estate" element={
                          <PrivateRoute requiredRoles={['dev']}>
                            <RealEstate_dev />
                          </PrivateRoute>
                        } />
                        <Route path="prospects" element={
                          <PrivateRoute requiredRoles={['dev']}>
                            <Prospects_dev />
                          </PrivateRoute>
                        } />
                      </Route>
                    </Route>
                  </Route>
                </Routes>
              </AuthMiddleware>
            </AuthProvider>
          </Router>
        </AntApp>
      </AuthErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
