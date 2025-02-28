import { Card, Form, Input, Button, App, Typography, Grid } from 'antd';
import { useState } from 'react';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase';
import { useUserStore } from '../stores/userStore';

const { Title } = Typography;
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

  const getTitleSize = () => {
    if (screens.xs) return 3;
    if (screens.sm) return 2;
    return 2;
  };

  const getSubtitleSize = () => {
    if (screens.xs) return 5;
    if (screens.sm) return 4;
    return 4;
  };

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

      // 6. Navegar según el rol del usuario
      const userRole = userData.user_rol;
      
      if (userRole === 'dev') {
        navigate('/dev/users');
      } else if (userRole === 'admin') {
        navigate('/admin/users');
      } else if (userRole === 'vende') {
        navigate('/dashboard');
      } else {
        navigate('/unauthorized');
      }

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
        background: 'linear-gradient(135deg, #e6f7ff 0%, #f0f5ff 100%)',
        margin: 0,
        padding: '20px',
        overflow: 'auto'
      }}>
      <Card style={{
        width: '90%',
        maxWidth: 380,
        borderRadius: 8,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        margin: '0 auto'
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: screens.xs ? 24 : 32
        }}>
          <Title
            level={getTitleSize()}
            style={{
              margin: 0,
              color: '#1890ff',
              fontWeight: 600,
              fontSize: screens.xs ? '24px' : '32px'
            }}
          >
            SaaS
          </Title>
          <Title
            level={getSubtitleSize()}
            style={{
              margin: screens.xs ? '4px 0 0' : '8px 0 0',
              fontWeight: 400,
              color: 'rgba(0,0,0,0.45)',
              fontSize: screens.xs ? '16px' : '20px'
            }}
          >
            Iniciar Sesión
          </Title>
        </div>
        <Form
          form={form}
          onFinish={handleLogin}
          style={{
            padding: screens.xs ? '0 8px' : '0 16px'
          }}
          size={screens.xs ? "middle" : "large"}
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Por favor ingresa tu email' },
              { type: 'email', message: 'Ingresa un email válido' }
            ]}
          >
            <Input
              prefix={<UserOutlined style={{ color: '#1890ff' }} />}
              placeholder="Email"
              size="large"
              style={{ borderRadius: 6 }}
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Por favor ingresa tu contraseña' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#1890ff' }} />}
              placeholder="Contraseña"
              size="large"
              style={{ borderRadius: 6 }}
            />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
              style={{
                height: screens.xs ? 40 : 45,
                borderRadius: 6,
                fontWeight: 500,
                fontSize: screens.xs ? '14px' : '16px'
              }}
            >
              Iniciar Sesión
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};