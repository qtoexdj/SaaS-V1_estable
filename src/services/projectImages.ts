import { supabase } from '../config/supabase';
import { ProjectImage } from '../types/project';

/**
 * Obtiene todas las imágenes asociadas a un proyecto
 * @param projectId ID del proyecto
 * @returns Array de imágenes del proyecto con URLs públicas
 */
export const getProjectImages = async (projectId: string): Promise<ProjectImage[]> => {
  const { data, error } = await supabase
    .from('project_images')
    .select('*')
    .eq('project_id', projectId);

  if (error) {
    console.error('Error al obtener imágenes del proyecto:', error);
    throw error;
  }

  // Generar URLs para cada imagen
  return data.map((image: ProjectImage) => ({
    ...image,
    url: supabase.storage.from('project-images').getPublicUrl(image.storage_path).data.publicUrl
  }));
};

/**
 * Sube una nueva imagen para un proyecto
 * @param projectId ID del proyecto
 * @param file Archivo a subir
 * @returns Información de la imagen subida
 */
export const uploadProjectImage = async (
  projectId: string,
  file: File
): Promise<ProjectImage> => {
  // Verificar límite de 5 imágenes
  const { count } = await supabase
    .from('project_images')
    .select('*', { count: 'exact', head: true })
    .eq('project_id', projectId);

  if (count && count >= 5) {
    throw new Error('Máximo 5 imágenes por proyecto');
  }

  // Verificar tipo de archivo
  const fileExt = file.name.split('.').pop()?.toLowerCase();
  if (!fileExt || !['jpg', 'jpeg', 'png', 'webp'].includes(fileExt)) {
    throw new Error('Tipo de archivo no permitido. Use jpg, jpeg, png o webp');
  }

  // Verificar tamaño de archivo (máximo 2MB)
  if (file.size > 2 * 1024 * 1024) {
    throw new Error('El archivo es demasiado grande. Máximo 2MB');
  }

  // Generar nombre único para el archivo
  const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
  const filePath = `${projectId}/${fileName}`;

  // Subir archivo a storage
  const { error: uploadError } = await supabase.storage
    .from('project-images')
    .upload(filePath, file);

  if (uploadError) {
    console.error('Error al subir imagen:', uploadError);
    throw uploadError;
  }

  // Registrar en la base de datos
  const { data, error: dbError } = await supabase
    .from('project_images')
    .insert({
      project_id: projectId,
      storage_path: filePath
    })
    .select()
    .single();

  if (dbError) {
    // Si hay error, intentar eliminar el archivo subido
    await supabase.storage.from('project-images').remove([filePath]);
    console.error('Error al registrar imagen en la base de datos:', dbError);
    throw dbError;
  }

  // Generar URL pública
  const { data: { publicUrl } } = supabase.storage
    .from('project-images')
    .getPublicUrl(filePath);

  return {
    ...data,
    url: publicUrl
  };
};

/**
 * Elimina una imagen de un proyecto
 * @param projectId ID del proyecto
 * @param imageId ID de la imagen
 * @param storagePath Ruta de almacenamiento de la imagen
 */
export const deleteProjectImage = async (
  projectId: string,
  imageId: string,
  storagePath: string
): Promise<void> => {
  // Eliminar registro de la base de datos
  const { error: dbError } = await supabase
    .from('project_images')
    .delete()
    .eq('id', imageId)
    .eq('project_id', projectId);

  if (dbError) {
    console.error('Error al eliminar registro de imagen:', dbError);
    throw dbError;
  }

  // Eliminar archivo de storage
  const { error: storageError } = await supabase.storage
    .from('project-images')
    .remove([storagePath]);

  if (storageError) {
    console.error('Error al eliminar archivo de storage:', storageError);
    // No lanzamos error aquí para no bloquear la operación si el archivo ya no existe
  }
};