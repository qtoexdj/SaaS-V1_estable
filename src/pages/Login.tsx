import { Form, Input, Button, App, Grid } from 'antd';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../config/supabase';
import { useUserStore } from '../stores/userStore';
import logoLogin from '../utils/img/logo_login.webp';
import fondoLogin from '../utils/img/fondo_login.webp';
const { useBreakpoint } = Grid;

interface LoginFormValues {
  email: string;
  password: string;
}

export const Login = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const { initialize } = useUserStore();
  const screens = useBreakpoint();
  const [loading, setLoading] = useState(false);


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
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundImage: `url(${fondoLogin})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        margin: 0,
        padding: '20px',
        overflow: 'auto'
      }}>
      <div style={{
        width: '90%',
        maxWidth: 450,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '40px 20px',
        borderRadius: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        margin: '0 auto'
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: screens.xs ? 30 : 40
        }}>
          <img
            src={logoLogin}
            alt="Logo"
            style={{
              width: screens.xs ? '180px' : '220px',
              marginBottom: '20px'
            }}
          />
        </div>
        
        <Form
          form={form}
          onFinish={handleLogin}
          style={{
            width: '100%',
            maxWidth: '380px'
          }}
          size="large"
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
              size="large"
              style={{
                borderRadius: 8,
                height: '55px',
                fontSize: '16px',
                padding: '10px 15px',
                backgroundColor: '#fff',
                color: '#333'
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
              size="large"
              style={{
                borderRadius: 8,
                height: '55px',
                fontSize: '16px',
                padding: '10px 15px',
                backgroundColor: '#fff',
                color: '#333'
              }}
            />
          </Form.Item>
          <Form.Item style={{ marginBottom: 15 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
              style={{
                height: '55px',
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
          
          <div style={{ textAlign: 'center', marginTop: '15px' }}>
            <Link
              to="/forgot-password"
              style={{
                color: '#666',
                fontSize: '16px',
                textDecoration: 'none'
              }}
            >
              Recuperar contraseña
            </Link>
          </div>
        </Form>
      </div>
    </div>
  );
};