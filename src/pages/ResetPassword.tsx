import { Form, Input, Button, App, Grid } from 'antd';
import { useState } from 'react';
import { supabase } from '../config/supabase';
import { useNavigate, Link } from 'react-router-dom';
import logoLogin from '../utils/img/logo_login.webp';
import fondoLogin from '../utils/img/fondo_login.webp';

const { useBreakpoint } = Grid;

export const ResetPassword = () => {
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const screens = useBreakpoint();

  const handlePasswordReset = async (values: { password: string }) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: values.password
      });

      if (error) {
        throw error;
      }

      message.success('Contraseña actualizada exitosamente');
      // Esperar un momento antes de redirigir
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (error: any) {
      message.error(error.message || 'Error al actualizar la contraseña');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="reset-password-container"
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
          marginBottom: screens?.xs ? 30 : 40
        }}>
          <img
            src={logoLogin}
            alt="Logo"
            style={{
              width: screens?.xs ? '180px' : '220px',
              marginBottom: '20px'
            }}
          />
          <h2 style={{
            fontSize: '22px',
            fontWeight: 500,
            color: '#333',
            margin: '10px 0'
          }}>
            Restablecer Contraseña
          </h2>
        </div>
        
        <Form
          form={form}
          onFinish={handlePasswordReset}
          style={{
            width: '100%',
            maxWidth: '380px'
          }}
          size="large"
        >
          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Por favor ingresa tu nueva contraseña' },
              { min: 6, message: 'La contraseña debe tener al menos 6 caracteres' }
            ]}
          >
            <Input.Password
              placeholder="Nueva contraseña"
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
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Por favor confirma tu contraseña' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Las contraseñas no coinciden'));
                },
              }),
            ]}
          >
            <Input.Password
              placeholder="Confirmar contraseña"
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
              block
              loading={isLoading}
              disabled={isLoading}
              style={{
                height: '55px',
                borderRadius: 8,
                fontWeight: 600,
                fontSize: '18px',
                backgroundColor: '#333',
                border: 'none'
              }}
            >
              {isLoading ? 'Actualizando...' : 'Actualizar Contraseña'}
            </Button>
          </Form.Item>
          
          <div style={{ textAlign: 'center', marginTop: '15px' }}>
            <Link
              to="/login"
              style={{
                color: '#666',
                fontSize: '16px',
                textDecoration: 'none'
              }}
            >
              Volver al inicio de sesión
            </Link>
          </div>
        </Form>
      </div>
    </div>
  );
};