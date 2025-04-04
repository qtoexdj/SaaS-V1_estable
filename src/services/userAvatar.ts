import { supabase } from '../config/supabase';
import { v4 as uuidv4 } from 'uuid';

export const uploadUserAvatar = async (file: File, userId: string) => {
  try {
    // Validar el tipo de archivo
    if (!file.type.startsWith('image/')) {
      throw new Error('El archivo debe ser una imagen');
    }

    // Validar el tamaño del archivo (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      throw new Error('La imagen no debe superar los 2MB');
    }

    // Crear nombre único para el archivo
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${uuidv4()}.${fileExt}`;

    // Subir el archivo
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      throw uploadError;
    }

    // Obtener la URL pública del avatar
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    // Actualizar el campo avatar_url en la tabla usuarios
    const { error: updateError } = await supabase
      .from('usuarios')
      .update({ avatar_url: publicUrl })
      .eq('id', userId);

    if (updateError) {
      throw updateError;
    }

    return { publicUrl };
  } catch (error) {
    console.error('Error al subir el avatar:', error);
    throw error;
  }
};

export const deleteUserAvatar = async (userId: string, avatarUrl: string) => {
  try {
    // Extraer el nombre del archivo de la URL
    const fileName = avatarUrl.split('/').pop();
    if (!fileName) throw new Error('URL de avatar inválida');

    // Eliminar el archivo del storage
    const { error: deleteError } = await supabase.storage
      .from('avatars')
      .remove([`${userId}/${fileName}`]);

    if (deleteError) {
      throw deleteError;
    }

    // Actualizar el campo avatar_url en la tabla usuarios
    const { error: updateError } = await supabase
      .from('usuarios')
      .update({ avatar_url: null })
      .eq('id', userId);

    if (updateError) {
      throw updateError;
    }

    return true;
  } catch (error) {
    console.error('Error al eliminar el avatar:', error);
    throw error;
  }
};