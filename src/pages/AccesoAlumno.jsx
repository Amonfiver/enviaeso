/**
 * Propósito:
 * Página de acceso para quienes reciben materiales. Permite identificarse
 * con código de grupo y email para acceder a sus documentos.
 *
 * Alcance:
 * - Formulario de acceso con código de grupo y email
 * - Validación de que el receptor pertenece al grupo
 * - Redirección a la página de materiales si la identificación es válida
 * - Sin exponer datos de otros receptores
 *
 * Decisiones:
 * - Naming generalista: "Recibir" en lugar de "Alumno"
 * - Usa código de grupo + email como credenciales (datos ya existentes)
 * - No requiere contraseña (acceso simple, sin auth compleja)
 * - Solo muestra información del propio usuario (privacidad)
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
    <div className="container" style={{ maxWidth: '420px', marginTop: '32px', padding: '0 16px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div
          style={{
            width: '56px',
            height: '56px',
            margin: '0 auto 12px',
            backgroundColor: '#10b981',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
          }}
        >
          🎓
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px', color: '#101828' }}>
          Acceso para recibir
        </h1>
        <p style={{ color: '#667085', fontSize: '15px', lineHeight: '1.5', padding: '0 8px' }}>
          Introduce el código de tu grupo y tu email para ver tus materiales.
        </p>
      </div>

      {/* Card principal */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '24px 20px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
          border: '1px solid #e4e7ec',
        }}
      >
        {/* Mensaje de auto-acceso */}
        {autoAccesoIntentado && loading && (
          <div
            style={{
              marginBottom: '20px',
              padding: '12px 16px',
              borderRadius: '8px',
              backgroundColor: '#f0f9ff',
              border: '1px solid #bae6fd',
            }}
          >
            <p style={{ margin: 0, textAlign: 'center', color: '#0369a1', fontSize: '14px' }}>
              🔗 Accediendo automáticamente desde el enlace...
            </p>
          </div>
        )}

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
              style={{ 
                textTransform: 'uppercase',
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                minHeight: '48px',
              }}
            />
            <p style={{ marginTop: '6px', fontSize: '12px', color: '#6b7280' }}>
              Pídele el código si no lo tienes.
            </p>
          </div>

          <div style={{ marginBottom: '20px' }}>
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
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                minHeight: '48px',
              }}
            />
            <p style={{ marginTop: '6px', fontSize: '12px', color: '#6b7280' }}>
              Usa el email con el que te registraste.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '16px',
              fontWeight: '600',
              minHeight: '52px',
            }}
          >
            {loading ? 'Accediendo...' : 'Ver mis materiales'}
          </button>
        </form>

        {/* Mensaje de feedback */}
        {mensaje && (
          <div
            style={{
              marginTop: '20px',
              padding: '12px 16px',
              borderRadius: '8px',
              backgroundColor: tipoMensaje === 'error' ? '#fef2f2' : '#f0fdf4',
              border: `1px solid ${tipoMensaje === 'error' ? '#fecaca' : '#86efac'}`,
            }}
          >
            <p
              style={{
                margin: 0,
                textAlign: 'center',
                color: tipoMensaje === 'error' ? '#b42318' : '#166534',
                fontWeight: '500',
                fontSize: '14px',
              }}
            >
              {tipoMensaje === 'error' ? '⚠️ ' : '✓ '}
              {mensaje}
            </p>
          </div>
        )}

        {/* Nota de privacidad */}
        <div
          style={{
            marginTop: '20px',
            padding: '14px',
            backgroundColor: '#f9fafb',
            borderRadius: '10px',
            border: '1px solid #e4e7ec',
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: '13px',
              color: '#667085',
              textAlign: 'center',
              lineHeight: '1.5',
            }}
          >
            🔒 <strong>Privacidad:</strong> Tu correo no se comparte. Solo para verificar que perteneces al grupo.
          </p>
        </div>
      </div>

      {/* Volver al inicio */}
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <a
          href="/"
          style={{
            color: '#667085',
            textDecoration: 'none',
            fontSize: '14px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px',
          }}
        >
          <span>←</span> Volver al inicio
        </a>
      </div>

      {/* Footer soporte */}
      <div
        style={{
          marginTop: '24px',
          paddingTop: '16px',
          borderTop: '1px solid #e2e8f0',
          textAlign: 'center',
        }}
      >
        <p
          style={{
            fontSize: '12px',
            color: '#94a3b8',
            margin: 0,
          }}
        >
          ¿Necesitas ayuda? Soporte:{' '}
          <a
            href="mailto:amoneyfiver@gmail.com"
            style={{
              color: '#64748b',
              textDecoration: 'underline',
            }}
          >
            amoneyfiver@gmail.com
          </a>
        </p>
      </div>
    </div>
  );
}
