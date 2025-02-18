export interface Project {
  id: string;
  nombre: string;
  ubicacion: string;
  caracteristicas?: Record<string, any>;
  inmobiliaria_id: string;
  created_at: string;
  updated_at: string;
}