# Plan de Implementación: Frontend-driven Webhooks para MCP_Vector_Sync

## Resumen Ejecutivo

Este documento detalla el plan para resolver el problema de timeout al crear/editar proyectos en el sistema actual. El problema se debe a la ejecución de operaciones HTTP sincrónicas dentro de un trigger de PostgreSQL, lo que causa que las transacciones superen el límite de tiempo establecido.

La solución propuesta traslada la responsabilidad de enviar los webhooks desde la base de datos (Supabase) al frontend, permitiendo una experiencia de usuario más fluida y eliminando los timeouts.

## Diagnóstico del Problema

### Síntomas
- Error 500 (Internal Server Error) durante la creación de proyectos
- Código de error PostgreSQL: 57014
- Mensaje: "canceling statement due to statement timeout"
- Logs en Supabase muestran errores 406 (Not Acceptable) en consultas relacionadas

### Causa Raíz
Al analizar los triggers de la tabla `proyectos`:

```sql
SELECT trigger_name, event_manipulation, action_statement, action_timing 
FROM information_schema.triggers 
WHERE event_object_table = 'proyectos'
```

Se encontró que el trigger `projects_change_trigger` ejecuta la función `notify_project_change_direct()` que:

1. Realiza llamadas HTTP a un webhook externo
2. Implementa reintentos con backoff exponencial (2, 4, 8 segundos)
3. Registra cada intento en una tabla `webhook_logs`
4. Todo esto ocurre dentro de la misma transacción de inserción/actualización

## Solución Propuesta

### Arquitectura Actual vs. Propuesta

**Arquitectura Actual:**
```
Frontend -> Supabase INSERT/UPDATE -> Trigger -> HTTP Call (sincrónico) -> MCP_Vector_Sync
                                               |
                                               v
                                         webhook_logs
```

**Arquitectura Propuesta:**
```
Frontend -> Supabase INSERT/UPDATE ------> Base de datos actualizada
      |                                    |
      v                                    v
      HTTP Call (asincrónico) -----------> MCP_Vector_Sync
```

### Beneficios de la Nueva Arquitectura
1. **Eliminación de timeouts**: Las operaciones de base de datos completan rápidamente
2. **Mejor UX**: Respuestas inmediatas para el usuario
3. **Separación de responsabilidades**: La sincronización de datos no bloquea operaciones CRUD
4. **Mayor resiliencia**: Fallos en el sistema de embedding no afectan las operaciones principales

## Plan de Implementación

### Fase 1: Preparación (0.5 horas)

#### 1.1 Desactivar el trigger actual en Supabase
```sql
-- Desactivar el trigger para evitar duplicación de webhooks
ALTER TABLE proyectos DISABLE TRIGGER projects_change_trigger;

-- Verificar que el trigger está desactivado
SELECT trigger_name, trigger_enabled 
FROM information_schema.triggers 
WHERE event_object_table = 'proyectos';
```

#### 1.2 Configurar Ambiente de Pruebas
1. Crear un endpoint de prueba para webhooks usando [Webhook.site](https://webhook.site) o similar
2. Documentar la URL para utilizarla durante las pruebas
3. Establecer un entorno de desarrollo aislado para evitar impactar usuarios

### Fase 2: Implementación en Frontend (2-3 horas)

#### 2.1 Crear Servicio de Webhook
Crear un servicio dedicado para manejar webhooks en el frontend:

```typescript
// services/vectorSyncService.ts
import { Project } from '../types/project';

/**
 * Servicio para sincronizar proyectos con el sistema de vectores
 */
export class VectorSyncService {
  private webhookUrl: string;
  
  constructor(webhookUrl?: string) {
    this.webhookUrl = webhookUrl || 'https://mcpvectorsync-production.up.railway.app/webhook/project-update';
  }
  
  /**
   * Notifica al servicio de vectores sobre cambios en un proyecto
   */
  async notifyProjectChange(
    inmobiliariaId: string, 
    projectId: string, 
    eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  ): Promise<boolean> {
    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inmobiliaria_id: inmobiliariaId,
          project_id: projectId,
          event: eventType,
          timestamp: new Date().toISOString(),
          source: 'frontend'
        })
      });
      
      if (!response.ok) {
        console.warn(
          `Vector sync webhook respondió con error: ${response.status}`,
          await response.text()
        );
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error al enviar webhook de sincronización:', error);
      return false;
    }
  }
  
  /**
   * Implementación con reintentos para casos críticos
   */
  async notifyProjectChangeWithRetry(
    inmobiliariaId: string, 
    projectId: string, 
    eventType: 'INSERT' | 'UPDATE' | 'DELETE',
    maxRetries: number = 3
  ): Promise<boolean> {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const success = await this.notifyProjectChange(
        inmobiliariaId, 
        projectId, 
        eventType
      );
      
      if (success) return true;
      
      // Esperar antes de reintentar (backoff exponencial)
      if (attempt < maxRetries - 1) {
        const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s...
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    return false;
  }
}

// Exportar instancia por defecto
export const vectorSyncService = new VectorSyncService();
```

#### 2.2 Modificar Componentes de Creación/Edición
Localizar los componentes que manejan operaciones CRUD de proyectos y añadir la lógica del webhook:

##### Creación de Proyectos
```typescript
// Ejemplo para la función que maneja la creación
import { vectorSyncService } from '../services/vectorSyncService';

const handleCreate = async (values) => {
  try {
    // 1. Crear el proyecto en Supabase
    const { data, error } = await supabase
      .from('proyectos')
      .insert({
        inmobiliaria_id: currentInmobiliariaId,
        caracteristicas: values
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error al crear proyecto:', error);
      message.error(`Error al crear el proyecto: ${error.message}`);
      throw error;
    }
    
    // 2. Notificar al servicio de vectores
    // No esperar a que termine para no bloquear la UI
    vectorSyncService.notifyProjectChange(
      currentInmobiliariaId,
      data.id,
      'INSERT'
    ).then(success => {
      if (!success) {
        console.warn(`No se pudo notificar la creación del proyecto ${data.id} al servicio de vectores`);
      }
    }).catch(e => {
      console.error('Error en notificación de vector sync:', e);
    });
    
    message.success('Proyecto creado correctamente');
    return data;
  } catch (error) {
    message.error(`Error al crear el proyecto: ${error.message}`);
    throw error;
  }
};
```

##### Actualización de Proyectos
```typescript
// Ejemplo para la función que maneja la actualización
const handleUpdate = async (projectId, values) => {
  try {
    // 1. Actualizar el proyecto en Supabase
    const { data, error } = await supabase
      .from('proyectos')
      .update({
        caracteristicas: values
      })
      .eq('id', projectId)
      .select()
      .single();
      
    if (error) {
      console.error('Error al actualizar proyecto:', error);
      message.error(`Error al actualizar el proyecto: ${error.message}`);
      throw error;
    }
    
    // 2. Notificar al servicio de vectores
    // No esperar a que termine para no bloquear la UI
    vectorSyncService.notifyProjectChange(
      data.inmobiliaria_id,
      data.id,
      'UPDATE'
    ).then(success => {
      if (!success) {
        console.warn(`No se pudo notificar la actualización del proyecto ${data.id} al servicio de vectores`);
      }
    }).catch(e => {
      console.error('Error en notificación de vector sync:', e);
    });
    
    message.success('Proyecto actualizado correctamente');
    return data;
  } catch (error) {
    message.error(`Error al actualizar el proyecto: ${error.message}`);
    throw error;
  }
};
```

##### Eliminación de Proyectos (si aplica)
```typescript
// Ejemplo para la función que maneja la eliminación
const handleDelete = async (projectId, inmobiliariaId) => {
  try {
    // 1. Eliminar el proyecto en Supabase
    const { error } = await supabase
      .from('proyectos')
      .delete()
      .eq('id', projectId);
      
    if (error) {
      console.error('Error al eliminar proyecto:', error);
      message.error(`Error al eliminar el proyecto: ${error.message}`);
      throw error;
    }
    
    // 2. Notificar al servicio de vectores
    vectorSyncService.notifyProjectChange(
      inmobiliariaId,
      projectId,
      'DELETE'
    ).then(success => {
      if (!success) {
        console.warn(`No se pudo notificar la eliminación del proyecto ${projectId} al servicio de vectores`);
      }
    }).catch(e => {
      console.error('Error en notificación de vector sync:', e);
    });
    
    message.success('Proyecto eliminado correctamente');
  } catch (error) {
    message.error(`Error al eliminar el proyecto: ${error.message}`);
    throw error;
  }
};
```

### Fase 3: Pruebas (1-2 horas)

#### 3.1 Pruebas Unitarias
1. Verificar que el servicio `VectorSyncService` envía correctamente los webhooks
2. Probar diferentes escenarios (éxito, error, timeout) y verificar el manejo apropiado

#### 3.2 Pruebas en Entorno de Desarrollo
1. Crear un nuevo proyecto en el frontend
   - Verificar que se complete rápidamente sin timeout
   - Confirmar que el webhook se envía correctamente (usando logs o servicios de captura)
2. Actualizar un proyecto existente
   - Verificar que se complete rápidamente sin timeout
   - Confirmar que el webhook se envía correctamente con el tipo 'UPDATE'
3. Eliminar un proyecto (si aplica)
   - Verificar que se complete rápidamente sin timeout
   - Confirmar que el webhook se envía correctamente con el tipo 'DELETE'

#### 3.3 Pruebas de Integración
1. Verificar que MCP_Vector_Sync recibe y procesa correctamente los webhooks del frontend
2. Confirmar que los embeddings se generan correctamente
3. Verificar que los embeddings aparecen en la tabla `proyecto_vector`

#### 3.4 Pruebas de Rendimiento
1. Medir y comparar tiempos de respuesta:
   - Tiempo para crear/actualizar proyectos (debería ser <2 segundos)
   - Tiempo total incluyendo la sincronización de vectores
2. Verificar que la UI no se bloquea durante las operaciones

### Fase 4: Despliegue a Producción (1 hora)

#### 4.1 Preparar Despliegue
1. Crear un branch específico para este cambio
2. Preparar Pull Request con documentación clara:
   - Problema a resolver
   - Cambios realizados
   - Pruebas ejecutadas
   - Plan de rollback

#### 4.2 Despliegue Gradual
1. Desplegar cambios en el frontend
2. Ejecutar el SQL para desactivar el trigger en producción
3. Monitorear activamente logs y métricas durante 1 hora:
   - Errores en consola
   - Tiempos de respuesta
   - Tasas de éxito/error en webhooks

#### 4.3 Verificación Post-despliegue
1. Realizar prueba manual en producción creando un proyecto
2. Verificar que el proyecto aparece en la tabla `proyecto_vector`
3. Verificar tiempos de respuesta y experiencia de usuario

### Fase 5: Seguimiento y Monitoreo (Continuo)

#### 5.1 Establecer Métricas a Monitorear
1. Tasa de éxito de webhooks (meta: >99%)
2. Tiempo promedio de creación/actualización (meta: <2s)
3. Latencia de sincronización (tiempo entre creación y vector disponible)

#### 5.2 Alertas
Configurar alertas para detectar problemas:
1. Tasa de error en webhooks supera 5%
2. Tiempo de respuesta excede 5 segundos
3. Fallos en la generación de embeddings

## Plan de Rollback

En caso de problemas significativos, seguir este plan de rollback:

### 1. Revertir Cambios en Frontend
1. Desplegar versión anterior del frontend sin los cambios del webhook
2. Comunicar el rollback al equipo

### 2. Reactivar Trigger en Supabase
```sql
ALTER TABLE proyectos ENABLE TRIGGER projects_change_trigger;
```

### 3. Aumentar Timeout (Solución temporal mientras se soluciona el problema)
```sql
ALTER DATABASE postgres SET statement_timeout = '30000';  -- 30 segundos
```

## Métricas de Éxito

### Métricas Cuantitativas
1. **Reducción del tiempo de creación**: De >15 segundos a <2 segundos
2. **Tasa de éxito**: 99% de proyectos se crean sin errores
3. **Tasa de sincronización**: 95% de embeddings generados dentro de 30 segundos

### Métricas Cualitativas
1. **Experiencia de usuario**: No hay bloqueos en la UI durante la creación
2. **Satisfacción del equipo**: Mejora reportada por usuarios internos y externos

## Cronograma Detallado

| Fase | Tarea | Responsable | Duración |
|------|-------|-------------|----------|
| 1.1 | Desactivar trigger | DBA | 15 min |
| 1.2 | Configurar ambiente de pruebas | Desarrollo | 15 min |
| 2.1 | Crear servicio de webhook | Frontend | 45 min |
| 2.2 | Modificar componente de creación | Frontend | 45 min |
| 2.3 | Modificar componente de edición | Frontend | 45 min |
| 3.1 | Pruebas unitarias | QA/Desarrollo | 30 min |
| 3.2 | Pruebas en desarrollo | QA | 45 min |
| 3.3 | Pruebas de integración | QA/Backend | 45 min |
| 4.1 | Preparar despliegue | DevOps | 30 min |
| 4.2 | Despliegue a producción | DevOps | 30 min |
| 4.3 | Verificación post-despliegue | QA/Desarrollo | 30 min |

**Tiempo total estimado**: 5.5 horas

## Apéndice: Código de Trigger Actual

```sql
CREATE OR REPLACE FUNCTION public.notify_project_change_direct()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    http_response_status INT;
    retry_count INT := 0;
    max_retries INT := 3;
    backoff_time INT;
    response_body TEXT;
BEGIN
    -- Intentar enviar el webhook con reintentos
    WHILE retry_count < max_retries LOOP
        BEGIN
            SELECT status, content::text INTO http_response_status, response_body
            FROM extensions.http_post(
                'https://mcpvectorsync-production.up.railway.app/webhook/project-update',
                json_build_object(
                    'inmobiliaria_id', NEW.inmobiliaria_id,
                    'project_id', NEW.id,
                    'event', TG_OP,
                    'timestamp', now()
                )::text,
                'application/json'
            );

            -- Registrar el intento en webhook_logs
            INSERT INTO webhook_logs (
                tabla, 
                operacion, 
                registro_id, 
                tiempo, 
                estado, 
                respuesta
            ) VALUES (
                'proyectos',
                TG_OP,
                NEW.id,
                now(),
                CASE 
                    WHEN http_response_status BETWEEN 200 AND 299 THEN 'success'
                    ELSE 'error'
                END,
                json_build_object(
                    'status', http_response_status,
                    'body', response_body,
                    'attempt', retry_count + 1
                )
            );

            -- Si el envío fue exitoso, salir del bucle
            IF http_response_status BETWEEN 200 AND 299 THEN
                EXIT;
            END IF;

            -- Incrementar contador y esperar
            retry_count := retry_count + 1;
            IF retry_count < max_retries THEN
                backoff_time := power(2, retry_count); -- 2, 4, 8 segundos
                PERFORM pg_sleep(backoff_time);
            END IF;

        EXCEPTION WHEN OTHERS THEN
            -- Registrar el error
            INSERT INTO webhook_logs (
                tabla, 
                operacion, 
                registro_id, 
                tiempo, 
                estado, 
                respuesta
            ) VALUES (
                'proyectos',
                TG_OP,
                NEW.id,
                now(),
                'error',
                json_build_object(
                    'error', SQLERRM,
                    'attempt', retry_count + 1
                )
            );

            -- Incrementar contador y esperar
            retry_count := retry_count + 1;
            IF retry_count < max_retries THEN
                backoff_time := power(2, retry_count);
                PERFORM pg_sleep(backoff_time);
            END IF;
        END;
    END LOOP;

    RETURN NEW;
END;
$function$;