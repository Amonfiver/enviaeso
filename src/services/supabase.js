/**
 * Propósito:
 * Cliente único de Supabase para toda la aplicación EnviaEso.
 *
 * Alcance:
 * Centraliza la conexión con el proyecto Supabase desde el frontend.
 *
 * Decisiones actuales:
 * - Se usa la URL pública del proyecto
 * - Se usa la publishable key pública en frontend
 * - Las claves secretas nunca se exponen aquí
 *
 * Limitaciones:
 * - Solo prepara la conexión base
 * - Aún no incluye helpers de auth ni consultas de negocio
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error(
    'Faltan las variables de entorno de Supabase. Revisa tu archivo .env.local'
  );
}

export const supabase = createClient(supabaseUrl, supabasePublishableKey);