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
 *
 * Limitaciones:
 * - Aún sin recuperación de contraseña
 * - Aún sin confirmación de email obligatoria
 */

import { supabase } from './supabase.js';

/**
 * Registra un nuevo profesor con email y contraseña.
 * @param {string} email - Email del profesor
 * @param {string} password - Contraseña (mínimo 6 caracteres)
 * @returns {Promise<{data: object|null, error: Error|null}>}
 */
export const registrarProfesor = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    console.error('[Auth] Error al registrar:', error.message);
    return { data: null, error };
  }

  // Crear registro en tabla profesores si el auth fue exitoso
  if (data.user) {
    const { error: dbError } = await supabase
      .from('profesores')
      .insert({ id: data.user.id, email: data.user.email });

    if (dbError) {
      console.error('[Auth] Error al crear registro en profesores:', dbError.message);
      // No retornamos error para no bloquear, pero logueamos
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

// Exportar todo como objeto AuthService para uso opcional como namespace
export const AuthService = {
  registrar: registrarProfesor,
  login: loginProfesor,
  logout: logoutProfesor,
  obtenerSesion,
  obtenerUsuarioActual,
  suscribirCambiosAuth,
  haySesionActiva,
};