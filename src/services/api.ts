import { PostgrestError } from '@supabase/supabase-js';
import { supabase } from '../config/supabase';
import type { Database } from '../types/database.types';

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 segundo

interface ApiResponse<T> {
  data: T | null;
  error: PostgrestError | Error | null;
}

export class ApiService {
  /**
   * Función genérica de retry para operaciones de API
   */
  private static async retry<T>(
    operation: () => Promise<T>,
    retries: number = MAX_RETRIES,
    delay: number = INITIAL_RETRY_DELAY
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (retries === 0 || !this.isRetryableError(error as Error)) throw error;
      
      console.log(`[API] Reintentando operación. Intentos restantes: ${retries}`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      
      return ApiService.retry(operation, retries - 1, delay * 2);
    }
  }

  /**
   * Envuelve una operación de Supabase con reintentos automáticos
   */
  static async fetchWithRetry<T = any>(
    operation: () => Promise<{ data: T | null; error: PostgrestError | null }>
  ): Promise<ApiResponse<T>> {
    try {
      const result = await ApiService.retry(operation);
      return {
        data: result.data,
        error: result.error
      };
    } catch (error) {
      return {
        data: null,
        error: error as Error
      };
    }
  }

  /**
   * Verifica si un error es recuperable (puede reintentarse)
   */
  private static isRetryableError(error: Error | PostgrestError | null): boolean {
    if (!error) return false;

    if (error instanceof Error && error.message.includes('network')) return true;

    if ('code' in error) {
      const code = (error as PostgrestError).code;
      const retryableCodes = ['40001', '40P01']; // deadlock_detected, lock_not_available
      return retryableCodes.includes(code);
    }

    return false;
  }

  /**
   * Helper para operaciones select con retry
   */
  static async select<T>(
    tableName: keyof Database['public']['Tables'],
    query: (builder: any) => any
  ): Promise<ApiResponse<T[]>> {
    return this.fetchWithRetry(async () => {
      const queryBuilder = supabase.from(tableName).select();
      return await query(queryBuilder);
    });
  }

  /**
   * Helper para operaciones insert con retry
   */
  static async insert<T>(
    tableName: keyof Database['public']['Tables'],
    data: any
  ): Promise<ApiResponse<T>> {
    return this.fetchWithRetry(async () => {
      return await supabase
        .from(tableName)
        .insert(data)
        .select()
        .single();
    });
  }

  /**
   * Helper para operaciones update con retry
   */
  static async update<T>(
    tableName: keyof Database['public']['Tables'],
    query: (builder: any) => any,
    data: any
  ): Promise<ApiResponse<T>> {
    return this.fetchWithRetry(async () => {
      const queryBuilder = supabase.from(tableName).update(data);
      return await query(queryBuilder).select().single();
    });
  }

  /**
   * Helper para operaciones delete con retry
   */
  static async delete<T>(
    tableName: keyof Database['public']['Tables'],
    query: (builder: any) => any
  ): Promise<ApiResponse<T>> {
    return this.fetchWithRetry(async () => {
      const queryBuilder = supabase.from(tableName).delete();
      return await query(queryBuilder).select().single();
    });
  }

  /**
   * Helper para operaciones RPC con retry
   * Nota: Requiere que las funciones estén definidas en la base de datos
   */
  static async rpc<T>(
    functionName: string,
    params?: Record<string, any>
  ): Promise<ApiResponse<T>> {
    return this.fetchWithRetry(async () => {
      return await (supabase.rpc as any)(functionName, params);
    });
  }
}