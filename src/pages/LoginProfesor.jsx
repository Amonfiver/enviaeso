/**
 * Propósito:
 * Página de login y registro para profesores.
 * Punto de entrada al panel de administración.
 *
 * Alcance:
 * - Formulario de login con email/contraseña
 * - Formulario de registro (alternable)
 * - Feedback de errores y éxito
 * - Redirección al panel si ya está logueado
 *
 * Decisiones:
 * - Login y registro en la misma pantalla (toggle simple)
 * - Sin confirmación de email obligatoria (MVP)
 * - Redirección automática al panel tras login exitoso
 *
 * Limitaciones:
 * - Aún sin recuperación de contraseña
 * - Aún sin validaciones complejas de contraseña
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  loginProfesor,
  registrarProfesor,
  haySesionActiva,
} from '../services/auth';

export default function LoginProfesor() {
  const navigate = useNavigate();

  // Estados del formulario
  const [modoRegistro, setModoRegistro] = useState(false);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [tipoMensaje, setTipoMensaje] = useState('');

  // Verificar si ya hay sesión activa
  useEffect(() => {
    const verificarSesion = async () => {
      const activa = await haySesionActiva();
      if (activa) {
        navigate('/panel');
      }
    };
    verificarSesion();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensaje('');
    setTipoMensaje('');

    const emailTrim = email.trim();

    if (!emailTrim || !password) {
      setMensaje('Email y contraseña son obligatorios.');
      setTipoMensaje('error');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setMensaje('La contraseña debe tener al menos 6 caracteres.');
      setTipoMensaje('error');
      setLoading(false);
      return;
    }

    // Validar nombre solo en modo registro
    const nombreTrim = nombre.trim();
    if (modoRegistro && !nombreTrim) {
      setMensaje('El nombre es obligatorio para registrarte.');
      setTipoMensaje('error');
      setLoading(false);
      return;
    }

    let resultado;
    if (modoRegistro) {
      resultado = await registrarProfesor(nombreTrim, emailTrim, password);
    } else {
      resultado = await loginProfesor(emailTrim, password);
    }

    if (resultado.error) {
      setMensaje(resultado.error.message || 'Error de autenticación.');
      setTipoMensaje('error');
    } else {
      // En registro, si la respuesta indica que ya existe el email, no mostrar éxito
      if (modoRegistro && resultado.data?.user?.identities?.length === 0) {
        // El usuario ya existía, Supabase devuelve el user pero sin identidades nuevas
        setMensaje('Ya existe una cuenta con este email. ¿Quieres iniciar sesión?');
        setTipoMensaje('error');
        // Cambiar automáticamente a modo login después de un momento
        setTimeout(() => {
          setModoRegistro(false);
          setMensaje('');
        }, 2000);
      } else {
        setMensaje(
          modoRegistro
            ? 'Cuenta creada correctamente. Redirigiendo...'
            : 'Sesión iniciada. Redirigiendo...'
        );
        setTipoMensaje('success');
        // Redirigir al panel tras breve delay
        setTimeout(() => navigate('/panel'), 1000);
      }
    }

    setLoading(false);
  };

  const toggleModo = () => {
    setModoRegistro(!modoRegistro);
    setMensaje('');
    setTipoMensaje('');
    // Limpiar nombre al cambiar de modo
    setNombre('');
  };

  return (
    <div className="container" style={{ maxWidth: '420px', marginTop: '64px' }}>
      {/* Logo/Icono y título */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div
          style={{
            width: '64px',
            height: '64px',
            margin: '0 auto 16px',
            backgroundColor: '#1570ef',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
          }}
        >
          📚
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px', color: '#101828' }}>
          {modoRegistro ? 'Crear cuenta' : 'Acceso para profesores'}
        </h1>
        <p style={{ color: '#667085', fontSize: '16px', lineHeight: '1.5' }}>
          {modoRegistro
            ? 'Regístrate para gestionar tus grupos y enviar materiales'
            : 'Inicia sesión para acceder a tu panel de profesor'}
        </p>
      </div>

      {/* Card principal */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
          border: '1px solid #e4e7ec',
        }}
      >
        <form onSubmit={handleSubmit}>
          {modoRegistro && (
            <div style={{ marginBottom: '20px' }}>
              <label
                htmlFor="nombre"
                style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#344054',
                }}
              >
                Tu nombre
              </label>
              <input
                id="nombre"
                type="text"
                placeholder="Cómo te verán tus alumnos"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                disabled={loading}
                required
                autoFocus
              />
              <p style={{ marginTop: '6px', fontSize: '13px', color: '#6b7280' }}>
                Este nombre aparecerá en los emails que envíes a tus alumnos.
              </p>
            </div>
          )}

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
              Email
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
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label
              htmlFor="password"
              style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#344054',
              }}
            >
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px 20px',
              fontSize: '16px',
              fontWeight: '600',
            }}
          >
            {loading
              ? modoRegistro
                ? 'Creando cuenta...'
                : 'Iniciando sesión...'
              : modoRegistro
              ? 'Crear cuenta'
              : 'Iniciar sesión'}
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

        {/* Separador */}
        <div
          style={{
            margin: '24px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div style={{ flex: 1, height: '1px', backgroundColor: '#e4e7ec' }} />
          <span style={{ color: '#667085', fontSize: '14px' }}>o</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#e4e7ec' }} />
        </div>

        {/* Toggle modo */}
        <div style={{ textAlign: 'center' }}>
          <p style={{ margin: '0 0 8px 0', color: '#667085', fontSize: '14px' }}>
            {modoRegistro ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}
          </p>
          <button
            type="button"
            onClick={toggleModo}
            disabled={loading}
            style={{
              backgroundColor: '#f9fafb',
              border: '1px solid #d0d5dd',
              color: '#344054',
              padding: '10px 20px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              width: '100%',
            }}
          >
            {modoRegistro ? 'Iniciar sesión' : 'Crear cuenta nueva'}
          </button>
        </div>
      </div>

      {/* Volver al inicio */}
      <div style={{ marginTop: '24px', textAlign: 'center' }}>
        <a
          href="/"
          style={{
            color: '#667085',
            textDecoration: 'none',
            fontSize: '14px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span>←</span> Volver al inicio
        </a>
      </div>
    </div>
  );
}