import { supabase } from '../config/supabase';

export const resetPassword = async (email: string) => {
  try {
    const redirectTo = `${window.location.origin}/reset-password`;
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectTo
    });

    if (error) {
      console.error('Error al enviar el correo de reseteo:', error);
      throw error;
    }

    return { 
      success: true, 
      message: 'Se ha enviado un correo con instrucciones para restablecer tu contraseña. Por favor revisa tu bandeja de entrada.' 
    };
  } catch (error: any) {
    console.error('Error en resetPassword:', error);
    return { 
      success: false, 
      message: error.message || 'Error al enviar el correo de reseteo de contraseña' 
    };
  }
};