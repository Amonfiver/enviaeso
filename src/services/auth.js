/**
 * Propósito:
 * Servicio de autenticación para profesores usando Supabase Auth.
 * Gestiona registro, login, logout y estado de sesión.
 *
 * Alcance:
 * - Registro de profesores con email/contraseña
 * - Login de profesores
 * - Logout
 * - Obtención de sesión actual
 * - Escucha de cambios de auth
 *
 * Decisiones:
 * - Usa Supabase Auth (incluido en el cliente existente)
 * - El email del profesor se usa como identificador único
 * - La tabla `profesores` se sincroniza con el user de Supabase Auth
 * - emailRedirectTo en signUp usa VITE_APP_URL para producción
 *
 * Limitaciones:
 * - Aún sin recuperación de contraseña
 * - Aún sin confirmación de email obligatoria
 */

import { supabase } from './supabase.js';

/**
 * Registra un nuevo profesor con nombre, email y contraseña.
 * @param {string} nombre - Nombre del profesor
 * @param {string} email - Email del profesor
 * @param {string} password - Contraseña (mínimo 6 caracteres)
 * @returns {Promise<{data: object|null, error: Error|null}>}
 */
export const registrarProfesor = async (nombre, email, password) => {
  // 1. Intentar crear el usuario en Supabase Auth
  // emailRedirectTo: asegura que el email de confirmación redirija al dominio correcto
  const redirectUrl = `${import.meta.env.VITE_APP_URL || window.location.origin}/login`;
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectUrl,
    },
  });

  if (error) {
    console.error('[Auth] Error al registrar:', error.message);
    
    // Mejorar mensaje para email ya existente
    if (error.message.includes('User already registered') || 
        error.message.includes('already exists') ||
        error.code === 'user_already_exists') {
      return { 
        data: null, 
        error: { 
          ...error, 
          message: 'Ya existe una cuenta con este email. ¿Quieres iniciar sesión?' 
        } 
      };
    }
    
    return { data: null, error };
  }

  // 2. Crear registro en tabla profesores si el auth fue exitoso
  if (data.user) {
    // Verificar si ya existe el profesor (para evitar duplicados en reintentos)
    const { data: profesorExistente } = await supabase
      .from('profesores')
      .select('id')
      .eq('id', data.user.id)
      .single();

    if (!profesorExistente) {
      const { error: dbError } = await supabase
        .from('profesores')
        .insert({ 
          id: data.user.id, 
          email: data.user.email,
          nombre: nombre.trim()
        });

      if (dbError) {
        console.error('[Auth] Error al crear registro en profesores:', dbError.message);
        // No retornamos error para no bloquear, pero logueamos
      }
    } else {
      // Si ya existe, actualizar el nombre por si acaso
      const { error: updateError } = await supabase
        .from('profesores')
        .update({ nombre: nombre.trim() })
        .eq('id', data.user.id);
        
      if (updateError) {
        console.error('[Auth] Error al actualizar nombre del profesor:', updateError.message);
      }
    }
  }

  console.log('[Auth] Profesor registrado:', data.user?.email);
  return { data, error: null };
};

/**
 * Inicia sesión de profesor con email y contraseña.
 * @param {string} email - Email del profesor
 * @param {string} password - Contraseña
 * @returns {Promise<{data: object|null, error: Error|null}>}
 */
export const loginProfesor = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('[Auth] Error al iniciar sesión:', error.message);
    return { data: null, error };
  }

  console.log('[Auth] Sesión iniciada:', data.user?.email);
  return { data, error: null };
};

/**
 * Cierra la sesión del profesor actual.
 * @returns {Promise<{error: Error|null}>}
 */
export const logoutProfesor = async () => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('[Auth] Error al cerrar sesión:', error.message);
    return { error };
  }

  console.log('[Auth] Sesión cerrada');
  return { error: null };
};

/**
 * Obtiene la sesión actual del profesor.
 * @returns {Promise<{data: {session: object|null}, error: Error|null}>}
 */
export const obtenerSesion = async () => {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    console.error('[Auth] Error al obtener sesión:', error.message);
    return { data: { session: null }, error };
  }

  return { data, error: null };
};

/**
 * Obtiene el usuario actual si hay sesión activa.
 * @returns {Promise<{user: object|null, error: Error|null}>}
 */
export const obtenerUsuarioActual = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error) {
    console.error('[Auth] Error al obtener usuario:', error.message);
    return { user: null, error };
  }

  return { user, error: null };
};

/**
 * Suscribe cambios en el estado de autenticación.
 * @param {function} callback - Función a llamar cuando cambie el auth
 * @returns {function} Función para cancelar la suscripción
 */
export const suscribirCambiosAuth = (callback) => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      console.log('[Auth] Evento:', event, 'Sesión:', session ? 'activa' : 'inactiva');
      callback(event, session);
    }
  );

  return () => subscription.unsubscribe();
};

/**
 * Verifica si hay una sesión activa.
 * @returns {Promise<boolean>}
 */
export const haySesionActiva = async () => {
  const { data } = await obtenerSesion();
  return !!data.session;
};

/**
 * Obtiene o crea el perfil del profesor en la tabla profesores.
 * Si no existe, lo crea automáticamente con los datos de auth.
 * @param {string} userId - ID del usuario de Supabase Auth
 * @param {string} email - Email del usuario
 * @param {string|null} nombre - Nombre del profesor (opcional)
 * @returns {Promise<{data: object|null, error: Error|null}>}
 */
export const obtenerOCrearPerfilProfesor = async (userId, email, nombre = null) => {
  // 1. Intentar obtener el perfil existente
  const { data: perfilExistente, error: errorSelect } = await supabase
    .from('profesores')
    .select('id, email, nombre, created_at')
    .eq('id', userId)
    .single();

  if (perfilExistente) {
    console.log('[Auth] Perfil de profesor encontrado:', perfilExistente.nombre || email);
    return { data: perfilExistente, error: null };
  }

  // 2. Si no existe, crearlo automáticamente
  console.log('[Auth] Perfil no encontrado, creando automáticamente...');
  
  const { data: nuevoPerfil, error: errorInsert } = await supabase
    .from('profesores')
    .insert({
      id: userId,
      email: email,
      nombre: nombre || null,
    })
    .select()
    .single();

  if (errorInsert) {
    console.error('[Auth] Error al crear perfil automáticamente:', errorInsert.message);
    return { data: null, error: errorInsert };
  }

  console.log('[Auth] Perfil creado automáticamente:', nuevoPerfil);
  return { data: nuevoPerfil, error: null };
};

/**
 * Actualiza el perfil del profesor.
 * @param {string} userId - ID del usuario
 * @param {object} datos - Datos a actualizar (nombre, etc.)
 * @returns {Promise<{data: object|null, error: Error|null}>}
 */
export const actualizarPerfilProfesor = async (userId, datos) => {
  const { data, error } = await supabase
    .from('profesores')
    .update(datos)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('[Auth] Error al actualizar perfil:', error.message);
    return { data: null, error };
  }

  console.log('[Auth] Perfil actualizado:', data);
  return { data, error: null };
};

// Exportar todo como objeto AuthService para uso opcional como namespace
export const AuthService = {
  registrar: registrarProfesor,
  login: loginProfesor,
  logout: logoutProfesor,
  obtenerSesion,
  obtenerUsuarioActual,
  suscribirCambiosAuth,
  haySesionActiva,
  obtenerOCrearPerfilProfesor,
  actualizarPerfilProfesor,
};
