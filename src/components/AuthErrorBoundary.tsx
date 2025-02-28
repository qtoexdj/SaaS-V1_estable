import React from 'react';
import { Button, Result } from 'antd';
import { supabase } from '../config/supabase';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class AuthErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error('[Auth Error]', error);
    
    // Si el error está relacionado con JWT o autenticación, cerrar sesión
    if (
      error.message.includes('JWT') || 
      error.message.includes('token') ||
      error.message.includes('auth') ||
      error.message.includes('session')
    ) {
      supabase.auth.signOut().catch(console.error);
    }
  }

  handleRetry = () => {
    // Intentar recargar la aplicación
    window.location.reload();
  };

  handleLogin = () => {
    // Redirigir al login
    window.location.href = '/login';
  };

  render() {
    if (this.state.hasError) {
      // UI de error usando Ant Design
      return (
        <Result
          status="error"
          title="Error de Autenticación"
          subTitle={
            <div>
              <p>Ha ocurrido un error con tu sesión.</p>
              <p style={{ fontSize: '0.9em', color: '#666' }}>
                {import.meta.env.DEV ? this.state.error?.message : 'Por favor, inicia sesión nuevamente.'}
              </p>
            </div>
          }
          extra={[
            <Button key="retry" onClick={this.handleRetry}>
              Reintentar
            </Button>,
            <Button key="login" type="primary" onClick={this.handleLogin}>
              Ir al Login
            </Button>
          ]}
        />
      );
    }

    return this.props.children;
  }
}