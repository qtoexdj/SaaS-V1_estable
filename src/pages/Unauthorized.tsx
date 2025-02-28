import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const Unauthorized = () => {
  const navigate = useNavigate();
  const { role } = useAuth();

  const handleBackToDashboard = () => {
    // Redirigir al dashboard si hay un rol, o al login si no hay
    navigate(role ? '/dashboard' : '/login');
  };

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: '#f0f2f5'
    }}>
      <Result
        status="403"
        title="No Autorizado"
        subTitle="Lo sentimos, no tienes permisos para acceder a esta página."
        extra={
          <Button type="primary" onClick={handleBackToDashboard}>
            Volver al Dashboard
          </Button>
        }
      />
    </div>
  );
};