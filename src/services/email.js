<!--
================================================================================
PROPOSITO DEL ARCHIVO
================================================================================
Servicio de preparación para envío de correos electrónicos en EnviaEso.
Define la interfaz y estructura base para futura integración con Resend,
pero NO envía correos reales en esta implementación.

Este archivo es parte del frontend pero está diseñado para ser migrado
fácilmente a un backend seguro cuando se implemente el envío real.

================================================================================
ALCANCE
================================================================================
- Definir funciones de envío de correo con firma clara
- Proveer mocks controlados para desarrollo y pruebas
- Documentar requisitos de seguridad para envío real
- Servir como contrato entre frontend y futuro backend de emails

================================================================================
DECISIONES IMPORTANTES
================================================================================
1. UBICACIÓN EN FRONTEND (TEMPORAL):
   - Se coloca en src/services/ por consistencia con otros servicios
   - Las funciones actuales solo devuelven mocks, NO envían correos reales
   - El envío real requiere backend para proteger API keys de Resend

2. SEGURIDAD - POR QUÉ NO RESEND DESDE FRONTEND:
   - Resend requiere API key con permisos de envío
   - Exponer API key en frontend = riesgo de abuso y costes inesperados
   - Cualquier usuario podría extraer la key y enviar spam
   - Solución correcta: backend intermediario que valide y envíe

3. ESTRUCTURA DE FUNCIONES:
   - enviarCorreoPrueba(): Para validar configuración futura
   - enviarAvisoGrupo(): Para notificar a alumnos de nuevos materiales
   - Ambas devuelven Promesas para simular comportamiento async real

4. MOCK CONTROLADO:
   - Las funciones loguean en consola (solo en desarrollo)
   - Devuelven éxito simulado tras delay realista
   - Permiten probar flujo UX sin enviar correos reales

================================================================================
LIMITACIONES O ESTADO TEMPORAL
================================================================================
- NO envía correos reales (devuelve mocks)
- NO debe usarse en producción sin migrar a backend
- Las direcciones de email no se validan realmente
- Los logs en consola son solo para desarrollo

================================================================================
MIGRACIÓN FUTURA A BACKEND
================================================================================
Cuando se implemente el backend seguro:
1. Mover estas funciones a endpoint API (ej: /api/enviar-correo)
2. Validar origen y rate-limiting en backend
3. Usar Resend SDK desde servidor con API key segura
4. Frontend llamará al endpoint en lugar de estas funciones
5. Mantener misma interfaz de datos para minimizar cambios

================================================================================
-->

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
  enviarCorreoPrueba,
  enviarAvisoGrupo,
  enviarCorreoPlantilla
};

export default EmailService;