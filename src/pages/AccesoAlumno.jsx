/**
 * Propósito:
 * Página de acceso para alumnos. Permite identificarse con código de grupo
 * y email para acceder a sus materiales.
 *
 * Alcance:
 * - Formulario de acceso con código de grupo y email
 * - Validación de que el alumno pertenece al grupo
 * - Redirección a la página de materiales si la identificación es válida
 * - Sin exponer datos de otros alumnos
 *
 * Decisiones:
 * - Usa código de grupo + email como credenciales (datos ya existentes)
 * - No requiere contraseña (acceso simple, sin auth compleja)
 * - Solo muestra información del propio alumno (privacidad)
 *
 * Limitaciones:
 * - Sin autenticación persistente (sesión por navegación)
 * - Sin recuperación de acceso automática
 * - Sin magic links todavía
 */

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../services/supabase';

export default function AccesoAlumno() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [codigoGrupo, setCodigoGrupo] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [tipoMensaje, setTipoMensaje] = useState('');
  const [autoAccesoIntentado, setAutoAccesoIntentado] = useState(false);

  // Leer query params al cargar
  useEffect(() => {
    const codigoParam = searchParams.get('codigo');
    const emailParam = searchParams.get('email');

    if (codigoParam && emailParam) {
      setCodigoGrupo(codigoParam);
      setEmail(emailParam);
      // Intentar acceso automático si ambos parámetros existen
      setAutoAccesoIntentado(true);
    }
  }, [searchParams]);

  // Intentar acceso automático cuando los estados se actualicen
  useEffect(() => {
    if (autoAccesoIntentado && codigoGrupo && email) {
      handleValidarAcceso();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codigoGrupo, email, autoAccesoIntentado]);

  const handleValidarAcceso = async () => {
    setLoading(true);
    setMensaje('');
    setTipoMensaje('');

    const codigoNormalizado = codigoGrupo.trim().toUpperCase();
    const emailNormalizado = email.trim().toLowerCase();

    if (!codigoNormalizado || !emailNormalizado) {
      setMensaje('El código de grupo y el email son obligatorios.');
      setTipoMensaje('error');
      setLoading(false);
      return;
    }

    try {
      // 1. Buscar el grupo por código
      const { data: grupo, error: errorGrupo } = await supabase
        .from('grupos')
        .select('id, nombre, profesor_id, profesor:profesor_id(nombre)')
        .eq('codigo', codigoNormalizado)
        .single();

      if (errorGrupo || !grupo) {
        setMensaje('Código de grupo no válido.');
        setTipoMensaje('error');
        setLoading(false);
        return;
      }

      // 2. Verificar que el alumno existe en ese grupo con ese email
      const { data: alumno, error: errorAlumno } = await supabase
        .from('alumnos')
        .select('id, nombre, email, grupo_id')
        .eq('grupo_id', grupo.id)
        .eq('email', emailNormalizado)
        .single();

      if (errorAlumno || !alumno) {
        setMensaje('No se encontró tu registro en este grupo. Verifica el código y tu email.');
        setTipoMensaje('error');
        setLoading(false);
        return;
      }

      // 3. Redirigir a la página de materiales con los datos necesarios
      navigate('/mis-materiales', {
        state: {
          alumno: {
            id: alumno.id,
            nombre: alumno.nombre,
            email: alumno.email,
          },
          grupo: {
            id: grupo.id,
            nombre: grupo.nombre,
            profesorNombre: grupo.profesor?.nombre || 'Tu profesor',
          },
        },
      });
    } catch (error) {
      console.error('[AccesoAlumno] Error:', error);
      setMensaje('Error al acceder. Inténtalo de nuevo.');
      setTipoMensaje('error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await handleValidarAcceso();
  };

  return (
    <div className="container" style={{ maxWidth: '400px', marginTop: '48px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '8px' }}>
        Acceso para alumnos
      </h1>
      <p style={{ textAlign: 'center', color: '#667085', marginBottom: '32px' }}>
        Introduce el código de tu grupo y tu email para ver tus materiales.
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label
            htmlFor="codigo"
            style={{
              display: 'block',
              marginBottom: '6px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#344054',
            }}
          >
            Código del grupo
          </label>
          <input
            id="codigo"
            type="text"
            placeholder="Ej: ABC123"
            value={codigoGrupo}
            onChange={(e) => setCodigoGrupo(e.target.value)}
            disabled={loading}
            required
            style={{ textTransform: 'uppercase' }}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label
            htmlFor="email"
            style={{
              display: 'block',
              marginBottom: '6px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#344054',
            }}
          >
            Tu email
          </label>
          <input
            id="email"
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
          />
          <p
            style={{
              marginTop: '6px',
              fontSize: '13px',
              color: '#6b7280',
            }}
          >
            Usa el mismo email con el que te registraste en el grupo.
          </p>
        </div>

        <button type="submit" disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Accediendo...' : 'Ver mis materiales'}
        </button>
      </form>

      {mensaje && (
        <p
          style={{
            marginTop: '16px',
            textAlign: 'center',
            color: tipoMensaje === 'error' ? '#b42318' : '#067647',
            fontWeight: '500',
          }}
        >
          {mensaje}
        </p>
      )}

      <div style={{ marginTop: '32px', textAlign: 'center' }}>
        <a
          href="/"
          style={{
            color: '#667085',
            textDecoration: 'none',
            fontSize: '14px',
          }}
        >
          ← Volver al inicio
        </a>
      </div>
    </div>
  );
}