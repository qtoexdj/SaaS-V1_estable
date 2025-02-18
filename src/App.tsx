import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { RealEstate_dev } from './pages/RealEstate_dev';
import { Users_dev } from './pages/Users_dev';
import { UsersAdmin } from './pages/Users_admin';
import Projects_admin from './pages/Projects_admin';
import Projects_dev from './pages/Projects_dev';
import Prospects_admin from './pages/Prospects_admin';
import PushCampaigns_admin from './pages/PushCampaigns_admin';
import Chat_admin from './pages/Chat_admin';
import { PrivateRoute } from './components/PrivateRoute';
import esES from 'antd/locale/es_ES';

// Configuración del tema de Ant Design
const theme = {
  token: {
    colorPrimary: '#00b96b',
    borderRadius: 4,
  },
};

function App() {
  return (
    <ConfigProvider theme={theme} locale={esES}>
      <BrowserRouter>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={<Login />} />
          {/* Rutas privadas */}
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />
          
          <Route path="/real-estate" element={
            <PrivateRoute>
              <RealEstate_dev />
            </PrivateRoute>
          } />
<Route path="/users" element={
  <PrivateRoute>
    <Users_dev />
  </PrivateRoute>
} />
<Route path="/users-admin" element={
  <PrivateRoute>
    <UsersAdmin />
  </PrivateRoute>
} />

<Route path="/prospects-admin" element={
  <PrivateRoute>
    <Prospects_admin />
  </PrivateRoute>
} />

<Route path="/projects-admin" element={
  <PrivateRoute>
    <Projects_admin />
  </PrivateRoute>
} />

<Route path="/projects-dev" element={
  <PrivateRoute>
    <Projects_dev />
  </PrivateRoute>
} />

<Route path="/push-campaigns-admin" element={
  <PrivateRoute>
    <PushCampaigns_admin />
  </PrivateRoute>
} />

<Route path="/chat-admin" element={
  <PrivateRoute>
    <Chat_admin />
  </PrivateRoute>
} />

{/* Redirección por defecto */}
{/* Redirección por defecto */}
          {/* Redirección por defecto */}
          {/* Redirección por defecto */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Página 404 */}
          <Route path="*" element={
            <div style={{ 
              height: '100vh', 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center' 
            }}>
              <h1>404 - Página no encontrada</h1>
            </div>
          } />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
