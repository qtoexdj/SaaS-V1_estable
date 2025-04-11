import { Form, Input, Button, App } from 'antd';
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../config/supabase';
import { useUserStore } from '../stores/userStore';
import logoLogin from '../utils/img/logo_login.webp';
import fondoLogin from '../utils/img/fondo_login.webp';

interface LoginFormValues {
  email: string;
  password: string;
}

export const Login = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const { initialize } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);
  
  // Detectar tamaño de pantalla para ajustes más precisos
  useEffect(() => {
    const handleResize = () => {
      setViewportHeight(window.innerHeight);
      setViewportWidth(window.innerWidth);
    };
    
    // Comprobar tamaño inicial
    handleResize();
    
    // Actualizar al cambiar el tamaño
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Determinar si estamos en un dispositivo móvil
  const isMobile = viewportWidth <= 576;
  const isSmallDevice = viewportWidth <= 375;

  const handleLogin = async (values: LoginFormValues) => {
    try {
      setLoading(true);
      
      // 1. Iniciar sesión y obtener la sesión inmediatamente
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (authError) throw authError;
      if (!authData.session) throw new Error('No se pudo obtener la sesión');

      // 2. Verificar que el usuario existe y está activo
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('activo, user_rol')
        .eq('id', authData.session.user.id)
        .single();

      if (userError) {
        console.error('Error al obtener datos del usuario:', userError);
        throw new Error('Error al obtener datos del usuario');
      }

      if (!userData.activo) {
        await supabase.auth.signOut();
        throw new Error('Usuario inactivo');
      }

      // 5. Inicializar el estado del usuario
      await initialize();

      // Navegar al dashboard independientemente del rol
      navigate('/dashboard');

    } catch (error: any) {
      let errorMessage = 'Error al iniciar sesión';
      
      if (error.message === 'Usuario inactivo') {
        errorMessage = 'Tu cuenta está desactivada. Contacta al administrador.';
      } else if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Credenciales inválidas';
      } else if (error.message === 'Error al obtener datos del usuario') {
        errorMessage = 'Error al cargar los datos del usuario. Por favor, intenta nuevamente.';
      }
      
      console.error('Error completo:', error);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="login-container" 
      style={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundImage: `url(${fondoLogin})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: 0,
        margin: 0,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }}
    >
      <div 
        style={{
          width: isMobile ? '100%' : '90%',
          maxWidth: isMobile ? undefined : 450,
          height: isMobile ? '100%' : 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: isMobile ? `${viewportHeight * 0.05}px 24px` : '40px 30px',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          boxShadow: isMobile ? 'none' : '0 4px 20px rgba(0,0,0,0.15)',
          borderRadius: isMobile ? 0 : 12,
          overflow: 'auto'
        }}
      >
        <div style={{
          textAlign: 'center',
          marginBottom: isMobile ? 24 : 40
        }}>
          <img
            src={logoLogin}
            alt="Logo"
            style={{
              width: isSmallDevice ? '150px' : isMobile ? '180px' : '220px',
              height: 'auto',
              maxWidth: '80%'
            }}
          />
        </div>
        
        <Form
          form={form}
          onFinish={handleLogin}
          style={{
            width: '100%',
            maxWidth: isMobile ? '100%' : 380
          }}
          size={isMobile ? "large" : "large"}
          layout="vertical"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Por favor ingresa tu email' },
              { type: 'email', message: 'Ingresa un email válido' }
            ]}
          >
            <Input
              placeholder="Correo electrónico"
              style={{
                borderRadius: 8,
                height: isSmallDevice ? '48px' : '55px',
                fontSize: '16px',
                backgroundColor: '#fff',
                border: '1px solid #e0e0e0'
              }}
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Por favor ingresa tu contraseña' }
            ]}
          >
            <Input.Password
              placeholder="Contraseña"
              style={{
                borderRadius: 8,
                height: isSmallDevice ? '48px' : '55px',
                fontSize: '16px',
                backgroundColor: '#fff',
                border: '1px solid #e0e0e0'
              }}
            />
          </Form.Item>
          <Form.Item style={{ marginBottom: isMobile ? 12 : 20 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{
                height: isSmallDevice ? '48px' : '55px',
                borderRadius: 8,
                fontWeight: 600,
                fontSize: '18px',
                backgroundColor: '#333',
                border: 'none'
              }}
            >
              Iniciar Sesión
            </Button>
          </Form.Item>
          
          <div style={{ 
            textAlign: 'center', 
            marginTop: isMobile ? '10px' : '20px' 
          }}>
            <Link
              to="/forgot-password"
              style={{
                color: '#555',
                fontSize: '16px',
                textDecoration: 'none',
                fontWeight: 500
              }}
            >
              Recuperar contraseña
            </Link>
          </div>
        </Form>

        {isMobile && (
          <div style={{ 
            position: 'absolute',
            bottom: '24px',
            width: '100%',
            textAlign: 'center',
            color: '#777',
            fontSize: '14px',
            padding: '0 20px'
          }}>
            © {new Date().getFullYear()} Broky - Todos los derechos reservados
          </div>
        )}
      </div>
    </div>
  );
};