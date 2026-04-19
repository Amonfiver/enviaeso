/**
 * Propósito:
 * Servicio para gestionar la subida, eliminación y listado de materiales
 * en Supabase Storage. Funciona junto con la tabla `materiales` de la BD.
 *
 * Alcance:
 * - Subir archivos al bucket `materiales`
 * - Crear registros en tabla `materiales`
 * - Eliminar archivos y sus registros
 * - Listar materiales por grupo
 *
 * Decisiones:
 * - Bucket único: `materiales`
 * - Path: {profesor_id}/{grupo_id}/{uuid}_{nombre_archivo}
 * - Tamaño máximo: 10 MB (validación previa)
 * - Tipos permitidos: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX
 *
 * Limitaciones:
 * - Sin autenticación real: usa PROFESOR_ID_TEMPORAL
 * - RLS temporalmente permisivo (hasta auth real)
 * - Sin límite de almacenamiento por profesor (MVP)
 */

import { supabase } from './supabase';

// TODO: Reemplazar por el profesor autenticado cuando implementemos login real
const PROFESOR_ID_TEMPORAL = '8f3de77b-11e4-4fd6-a45c-068368e540a9';

const BUCKET_NAME = 'materiales';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const TIPOS_PERMITIDOS = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
];

/**
 * Valida un archivo antes de subirlo.
 * @param {File} archivo - Archivo a validar
 * @returns {Object} { valido: boolean, error: string|null }
 */
export const validarArchivo = (archivo) => {
  if (!archivo) {
    return { valido: false, error: 'No se seleccionó ningún archivo.' };
  }

  if (archivo.size > MAX_FILE_SIZE) {
    return {
      valido: false,
      error: `El archivo excede el tamaño máximo de 10 MB.`,
    };
  }

  if (!TIPOS_PERMITIDOS.includes(archivo.type)) {
    return {
      valido: false,
      error:
        'Tipo de archivo no permitido. Solo PDF, Word, Excel y PowerPoint.',
    };
  }

  return { valido: true, error: null };
};

/**
 * Sube un archivo a Storage y crea registro en tabla materiales.
 * @param {string} grupoId - ID del grupo
 * @param {File} archivo - Archivo a subir
 * @returns {Promise<Object>} { data: { id, url }, error: null } o { data: null, error: string }
 */
export const subirMaterial = async (grupoId, archivo) => {
  const validacion = validarArchivo(archivo);
  if (!validacion.valido) {
    return { data: null, error: validacion.error };
  }

  // Generar ID único para el material
  const materialId = crypto.randomUUID();
  const nombreLimpio = archivo.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filePath = `${PROFESOR_ID_TEMPORAL}/${grupoId}/${materialId}_${nombreLimpio}`;

  try {
    // 1. Subir archivo a Storage
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, archivo, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    // 2. Crear registro en tabla materiales
    const { data: materialData, error: dbError } = await supabase
      .from('materiales')
      .insert([
        {
          id: materialId,
          grupo_id: grupoId,
          nombre_archivo: archivo.name,
          url_storage: filePath,
          tamaño_bytes: archivo.size,
        },
      ])
      .select()
      .single();

    if (dbError) {
      // Si falla la BD, intentar limpiar el archivo subido
      await supabase.storage.from(BUCKET_NAME).remove([filePath]);
      throw dbError;
    }

    return { data: materialData, error: null };
  } catch (error) {
    console.error('Error al subir material:', error);
    return {
      data: null,
      error: error.message || 'No se pudo subir el archivo.',
    };
  }
};

/**
 * Elimina un material del Storage y de la BD.
 * @param {string} materialId - ID del material
 * @param {string} filePath - Ruta en Storage
 * @returns {Promise<Object>} { success: boolean, error: string|null }
 */
export const eliminarMaterial = async (materialId, filePath) => {
  try {
    // 1. Eliminar del Storage primero (operación crítica)
    const { error: storageError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (storageError) {
      console.warn('Error al eliminar de Storage:', storageError);
      // Continuamos para intentar limpiar la BD de todos modos
    }

    // 2. Eliminar de la BD (si falla el Storage, al menos la BD queda limpia)
    const { error: dbError } = await supabase
      .from('materiales')
      .delete()
      .eq('id', materialId);

    if (dbError) {
      throw dbError;
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Error al eliminar material:', error);
    return {
      success: false,
      error: error.message || 'No se pudo eliminar el archivo.',
    };
  }
};

/**
 * Lista todos los materiales de un grupo.
 * @param {string} grupoId - ID del grupo
 * @returns {Promise<Object>} { data: Array, error: string|null }
 */
export const listarMaterialesPorGrupo = async (grupoId) => {
  try {
    const { data, error } = await supabase
      .from('materiales')
      .select('id, nombre_archivo, url_storage, tamaño_bytes, created_at')
      .eq('grupo_id', grupoId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error al listar materiales:', error);
    return { data: [], error: error.message || 'No se pudieron cargar los materiales.' };
  }
};

/**
 * Formatea bytes a unidades legibles (KB, MB).
 * @param {number} bytes - Tamaño en bytes
 * @returns {string} Tamaño formateado
 */
export const formatearTamaño = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

/**
 * Obtiene una URL firmada para descargar un archivo de Storage.
 * La URL es válida por un tiempo limitado (por defecto 300 segundos = 5 min).
 * 
 * NOTA: La descarga forzada depende del navegador. Algunos navegadores móviles
 * pueden previsualizar ciertos formatos (PDF, imágenes) en lugar de descargar.
 * En el frontend se usa el atributo 'download' en el enlace para sugerir
 * el nombre original del archivo.
 * 
 * @param {string} filePath - Ruta del archivo en Storage
 * @param {number} expiresIn - Segundos de validez de la URL (default: 300)
 * @returns {Promise<{url: string|null, error: string|null}>}
 */
export const obtenerUrlDescarga = async (filePath, expiresIn = 300) => {
  try {
    const { data, error } = await supabase
      .storage
      .from(BUCKET_NAME)
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      console.error('[Storage] Error al crear URL firmada:', error.message);
      return { url: null, error: error.message };
    }

    return { url: data.signedUrl, error: null };
  } catch (error) {
    console.error('[Storage] Error inesperado:', error);
    return { url: null, error: error.message };
  }
};
