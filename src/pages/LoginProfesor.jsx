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
    <div className="container" style={{ maxWidth: '400px', marginTop: '48px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '8px' }}>
        {modoRegistro ? 'Crear cuenta' : 'Acceso para profesores'}
      </h1>
      <p style={{ textAlign: 'center', color: '#667085', marginBottom: '32px' }}>
        {modoRegistro
          ? 'Regístrate para gestionar tus grupos'
          : 'Inicia sesión para acceder al panel'}
      </p>

      <form onSubmit={handleSubmit}>
        {modoRegistro && (
          <input
            type="text"
            placeholder="Tu nombre (cómo te verán los alumnos)"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            disabled={loading}
            required
            autoFocus
            style={{ marginBottom: '12px' }}
          />
        )}

        <input
          type="email"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          required
          style={{ marginBottom: '12px' }}
        />

        <input
          type="password"
          placeholder="Contraseña (mín. 6 caracteres)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          required
          style={{ marginBottom: '16px' }}
        />

        <button type="submit" disabled={loading} style={{ width: '100%' }}>
          {loading
            ? modoRegistro
              ? 'Creando cuenta...'
              : 'Iniciando sesión...'
            : modoRegistro
            ? 'Crear cuenta'
            : 'Iniciar sesión'}
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

      <p style={{ marginTop: '24px', textAlign: 'center', color: '#667085' }}>
        {modoRegistro ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}{' '}
        <button
          type="button"
          onClick={toggleModo}
          disabled={loading}
          style={{
            background: 'none',
            border: 'none',
            color: '#1570ef',
            textDecoration: 'underline',
            cursor: 'pointer',
            padding: 0,
            font: 'inherit',
          }}
        >
          {modoRegistro ? 'Inicia sesión' : 'Regístrate'}
        </button>
      </p>

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