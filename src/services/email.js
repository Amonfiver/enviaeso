/**
 * ================================================================================
 * PROPOSITO DEL ARCHIVO
 * ================================================================================
 * Servicio de envío de correos electrónicos en EnviaEso.
 * Proporciona tanto mocks para desarrollo/pruebas como vía real de envío
 * mediante llamada a la Supabase Edge Function `send-test-email`.
 *
 * Este archivo es el punto de entrada frontend para todas las operaciones
 * de email, manteniendo la seguridad al delegar el envío real al backend.
 *
 * ================================================================================
 * ALCANCE ACTUAL
 * ================================================================================
 * - Funciones mock para desarrollo y pruebas UX (sin envío real)
 * - Función real `enviarCorreoReal()` que llama a Edge Function
 * - Manejo de respuestas de éxito/error estandarizado
 * - No expone secretos (API keys viven solo en el backend)
 *
 * ================================================================================
 * DECISIONES IMPORTANTES
 * ================================================================================
 * 1. DUALIDAD MOCK/REAL:
 *    - Mocks disponibles para desarrollo rápido sin dependencias
 *    - Función real disponible para pruebas controladas
 *    - El frontend elige cuál usar según contexto
 *
 * 2. SEGURIDAD - EDGE FUNCTION COMO BACKEND:
 *    - Resend API key solo existe en variables de entorno de Supabase
 *    - Frontend solo conoce la URL pública de la Edge Function
 *    - Sin autenticación aún (cualquiera puede llamar al endpoint)
 *
 * 3. MANEJO DE ERRORES:
 *    - Respuestas estandarizadas: { success: boolean, error?: string, ... }
 *    - Logs en consola solo en desarrollo
 *    - Mensajes de error legibles para el usuario final
 *
 * ================================================================================
 * LIMITACIONES O ESTADO TEMPORAL
 * ================================================================================
 * - La función real `enviarCorreoReal()` NO tiene autenticación aún
 * - Rate-limiting pendiente en la Edge Function
 * - Sin plantillas profesionales todavía
 * - Envío masivo no implementado (solo individual)
 * - La Edge Function debe estar deployada para que funcione el envío real
 *
 * ================================================================================
 * SIGUIENTE EVOLUCION PREVISTA
 * ================================================================================
 * 1. Añadir botón de prueba en Panel.jsx usando `enviarCorreoReal()`
 * 2. Implementar autorización en Edge Function (solo profesores autenticados)
 * 3. Preparar envío masivo a todos los alumnos de un grupo
 * 4. Diseñar plantillas HTML profesionales
 *
 * ================================================================================
 */

import { supabase } from './supabase.js';

/**
 * Envía un correo real llamando a la Edge Function de Supabase.
 * 
 * @param {Object} params - Parámetros del correo
 * @param {string} params.to - Dirección de email destino
 * @param {string} params.subject - Asunto del correo
 * @param {string} params.html - Contenido HTML (opcional si hay text)
 * @param {string} params.text - Contenido texto plano (opcional si hay html)
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>} Resultado
 * 
 * @example
 * const resultado = await enviarCorreoReal({
 *   to: 'test@ejemplo.com',
 *   subject: 'Prueba de EnviaEso',
 *   html: '<p>Esto es una prueba</p>'
 * });
 */
export async function enviarCorreoReal({ to, subject, html, text }) {
  // Validación básica de parámetros
  if (!to || !subject) {
    return {
      success: false,
      error: 'Faltan parámetros requeridos: to, subject'
    };
  }

  if (!html && !text) {
    return {
      success: false,
      error: 'Debe proporcionar html o text como contenido del correo'
    };
  }

  try {
    // Construir payload
    const payload = {
      to: to.trim(),
      subject: subject.trim(),
      ...(html && { html: html.trim() }),
      ...(text && { text: text.trim() })
    };

    // Log en desarrollo
    if (import.meta.env.DEV) {
      console.log('[EmailService] Enviando correo real a Edge Function:', {
        to: payload.to,
        subject: payload.subject
      });
    }

    // Llamar a Edge Function via supabase client
    const { data, error } = await supabase.functions.invoke('send-test-email', {
      body: payload
    });

    if (error) {
      console.error('[EmailService] Error llamando a Edge Function:', error);
      return {
        success: false,
        error: error.message || 'Error al comunicarse con el servidor de email'
      };
    }

    // Éxito
    if (import.meta.env.DEV) {
      console.log('[EmailService] Correo enviado correctamente:', data);
    }

    return {
      success: true,
      messageId: data?.messageId,
      to: data?.to,
      subject: data?.subject
    };

  } catch (err) {
    console.error('[EmailService] Error inesperado:', err);
    return {
      success: false,
      error: 'Error inesperado al enviar el correo'
    };
  }
}

/**
 * Simula el envío de un correo de prueba.
 * Útil para validar configuración sin afectar usuarios reales.
 * 
 * @param {Object} params - Parámetros del correo
 * @param {string} params.para - Dirección de email destino
 * @param {string} params.asunto - Asunto del correo
 * @param {string} params.contenido - Contenido HTML o texto plano
 * @returns {Promise<{success: boolean, messageId: string, error?: string}>} Resultado simulado
 * 
 * @example
 * const resultado = await enviarCorreoPrueba({
 *   para: 'test@ejemplo.com',
 *   asunto: 'Prueba de EnviaEso',
 *   contenido: '<p>Esto es una prueba</p>'
 * });
 */
export async function enviarCorreoPrueba({ para, asunto, contenido }) {
  // Validación básica de parámetros
  if (!para || !asunto || !contenido) {
    return {
      success: false,
      messageId: null,
      error: 'Faltan parámetros requeridos: para, asunto, contenido'
    };
  }

  // Log de desarrollo (solo para debugging, se eliminará en producción)
  if (import.meta.env.DEV) {
    console.log('[EmailService] Mock: enviarCorreoPrueba', {
      para,
      asunto,
      timestamp: new Date().toISOString()
    });
  }

  // Simulación de delay de red + procesamiento
  await new Promise(resolve => setTimeout(resolve, 800));

  // Mock de respuesta exitosa
  return {
    success: true,
    messageId: `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    error: null
  };
}

/**
 * Simula el envío de aviso a todos los alumnos de un grupo.
 * Usado cuando el profesor publica nuevos materiales.
 * 
 * @param {Object} params - Parámetros del envío grupal
 * @param {string} params.grupoId - ID del grupo en Supabase
 * @param {string} params.grupoNombre - Nombre del grupo (para personalizar)
 * @param {string} params.profesorNombre - Nombre del profesor
 * @param {Array<{nombre: string, email: string}>} params.alumnos - Lista de alumnos a notificar
 * @param {string} params.urlAcceso - URL mágica para acceder a los materiales
 * @returns {Promise<{success: boolean, enviados: number, fallidos: number, error?: string}>} Resultado simulado
 * 
 * @example
 * const resultado = await enviarAvisoGrupo({
 *   grupoId: 'uuid-del-grupo',
 *   grupoNombre: 'Matemáticas 4ºA',
 *   profesorNombre: 'María García',
 *   alumnos: [{ nombre: 'Juan', email: 'juan@ejemplo.com' }],
 *   urlAcceso: 'https://enviaeso.com/acceso?token=abc123'
 * });
 */
export async function enviarAvisoGrupo({ 
  grupoId, 
  grupoNombre, 
  profesorNombre, 
  alumnos, 
  urlAcceso 
}) {
  // Validación básica de parámetros
  if (!grupoId || !grupoNombre || !profesorNombre || !alumnos || !urlAcceso) {
    return {
      success: false,
      enviados: 0,
      fallidos: alumnos?.length || 0,
      error: 'Faltan parámetros requeridos: grupoId, grupoNombre, profesorNombre, alumnos, urlAcceso'
    };
  }

  if (!Array.isArray(alumnos) || alumnos.length === 0) {
    return {
      success: false,
      enviados: 0,
      fallidos: 0,
      error: 'La lista de alumnos está vacía o no es válida'
    };
  }

  // Log de desarrollo (solo para debugging)
  if (import.meta.env.DEV) {
    console.log('[EmailService] Mock: enviarAvisoGrupo', {
      grupoId,
      grupoNombre,
      totalAlumnos: alumnos.length,
      timestamp: new Date().toISOString()
    });
  }

  // Simulación de delay proporcional al número de alumnos
  // (máximo 3 segundos para no bloquear UI)
  const delayMs = Math.min(alumnos.length * 100, 3000);
  await new Promise(resolve => setTimeout(resolve, delayMs));

  // Mock: simulamos que todos se envían correctamente
  // En implementación real, habría manejo de fallos individuales
  const enviados = alumnos.length;
  const fallidos = 0;

  return {
    success: true,
    enviados,
    fallidos,
    error: null
  };
}

/**
 * Preparación para futura función: envío con plantilla HTML.
 * Actualmente devuelve mock, pero define la interfaz para emails
 * con diseño profesional usando plantillas de Resend.
 * 
 * @param {Object} params - Parámetros del correo
 * @param {string} params.para - Email destinatario
 * @param {string} params.plantilla - Nombre de la plantilla ('bienvenida' | 'nuevo-material' | 'recordatorio')
 * @param {Object} params.variables - Variables para reemplazar en la plantilla
 * @returns {Promise<{success: boolean, messageId: string}>} Resultado simulado
 * 
 * NOTA: Las plantillas se definirán en Resend Dashboard o como React Email
 * components cuando se migre a backend.
 */
export async function enviarCorreoPlantilla({ para, plantilla, variables }) {
  const plantillasDisponibles = ['bienvenida', 'nuevo-material', 'recordatorio'];
  
  if (!plantillasDisponibles.includes(plantilla)) {
    return {
      success: false,
      messageId: null,
      error: `Plantilla '${plantilla}' no disponible. Opciones: ${plantillasDisponibles.join(', ')}`
    };
  }

  if (import.meta.env.DEV) {
    console.log('[EmailService] Mock: enviarCorreoPlantilla', {
      para,
      plantilla,
      variables: Object.keys(variables || {}),
      timestamp: new Date().toISOString()
    });
  }

  await new Promise(resolve => setTimeout(resolve, 600));

  return {
    success: true,
    messageId: `mock_tpl_${Date.now()}`,
    error: null
  };
}

// Exportar objeto consolidado para facilitar imports
export const EmailService = {
  enviarCorreoReal,
  enviarCorreoPrueba,
  enviarAvisoGrupo,
  enviarCorreoPlantilla
};

export default EmailService;