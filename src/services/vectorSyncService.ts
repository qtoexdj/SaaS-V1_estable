/**
 * Servicio para sincronizar proyectos con el sistema de vectores
 */
export class VectorSyncService {
  private webhookUrl: string;
  
  constructor(webhookUrl?: string) {
    // Usar proxy local para evitar problemas de CORS
    this.webhookUrl = webhookUrl || '/api/webhook/project-update';
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