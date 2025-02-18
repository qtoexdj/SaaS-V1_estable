# Plan de Implementación: Página de Proyectos para Admin

## 1. Configuración de Rutas y Navegación

### MainLayout.tsx
- Agregar nuevo ítem en el menú para "Proyectos" bajo la sección de admin
- Usar HomeOutlined como icono
- Configurar la ruta como '/projects-admin'

### App.tsx
- Agregar nueva ruta protegida para Projects_admin
- Asegurar que solo usuarios con rol 'admin' puedan acceder

## 2. Implementación del Componente (Projects_admin.tsx)

### Estructura del Componente
```typescript
- Importar componentes necesarios de Ant Design (Card, List, Space, etc.)
- Implementar fetching de datos usando Supabase cliente
- Mostrar los proyectos en formato de Card List
- Cada card mostrará:
  * Nombre del proyecto
  * Ubicación
  * Características (si existen)
  * Fecha de creación
```

### Integración con Supabase
```typescript
- Usar el cliente de Supabase para obtener los proyectos
- Implementar la query con RLS para obtener solo proyectos del tenant actual
- Tipado correcto de los datos usando TypeScript
```

### UI/UX
- Usar Card List de Ant Design para mostrar los proyectos
- Implementar loading states
- Manejar casos de error y estado vacío
- Asegurar que el diseño sea responsive

## 3. Tipos y Modelos

### Crear tipos para Proyectos
```typescript
interface Proyecto {
  id: string;
  nombre: string;
  ubicacion: string;
  caracteristicas?: Record<string, any>;
  created_at: string;
  updated_at: string;
  inmobiliaria_id: string;
}
```

## 4. Testing y Verificación
- Verificar que las políticas RLS están funcionando correctamente
- Probar la navegación y el routing
- Verificar la visualización en diferentes tamaños de pantalla
- Asegurar que solo los admins pueden acceder a la página

## 5. Siguientes Pasos (Futuras Mejoras)
- Agregar funcionalidad de búsqueda
- Implementar filtros por ubicación
- Agregar capacidad de edición y creación de proyectos
- Mejorar la visualización de características con componentes específicos