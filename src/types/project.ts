export interface ProjectImage {
  id: string;
  project_id: string;
  storage_path: string;
  created_at: string;
  updated_at: string;
  url?: string; // URL completa para mostrar la imagen (calculada en el frontend)
}

export interface Project {
  id: string;
  nombre: string;
  ubicacion: string;
  cantidad_lotes?: number;
  caracteristicas?: Record<string, any>;
  inmobiliaria_id: string;
  created_at: string;
  updated_at: string;
  images?: ProjectImage[]; // Nueva propiedad para las imágenes
}