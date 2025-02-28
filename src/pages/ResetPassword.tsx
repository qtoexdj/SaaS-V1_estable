import { Card, Form, Input, Button, App } from 'antd';
import { useState } from 'react';
import { LockOutlined } from '@ant-design/icons';
import { supabase } from '../config/supabase';
import { useNavigate } from 'react-router-dom';

export const ResetPassword = () => {
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

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
    <div style={{
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: '#f0f2f5'
    }}>
      <Card title="Restablecer Contraseña" style={{ width: 300 }}>
        <Form
          form={form}
          onFinish={handlePasswordReset}
          layout="vertical"
        >
          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Por favor ingresa tu nueva contraseña' },
              { min: 6, message: 'La contraseña debe tener al menos 6 caracteres' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Nueva contraseña"
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
              prefix={<LockOutlined />}
              placeholder="Confirmar contraseña"
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? 'Actualizando...' : 'Actualizar Contraseña'}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};