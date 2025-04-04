export interface Project {
  id: string;
  caracteristicas: {
    nombre: string;
    ubicacion: string;
    valor?: string | number;
    caracteristicas?: string;
  };
  inmobiliaria_id: string;
  created_at: string;
  updated_at: string;
  images?: ProjectImage[];
}

export interface ProjectImage {
  id: string;
  url: string;
  project_id: string;
  created_at: string;
  updated_at: string;
  storage_path: string;
}