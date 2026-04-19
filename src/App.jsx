/**
 * Propósito:
 * Componente raíz de la aplicación EnviaEso.
 *
 * Alcance:
 * Define las rutas base públicas y del panel del profesor.
 * Gestiona la autenticación y redirecciones según estado de sesión.
 *
 * Decisiones:
 * - "/" para el flujo del alumno
 * - "/login" para acceso de profesores (login/registro)
 * - "/panel" para el panel del profesor (requiere auth)
 * - Detección global de cambios de sesión
 *
 * Limitaciones:
 * - Protección de rutas básica (redirección simple)
 * - Sin manejo de roles avanzado
 */

import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import LoginProfesor from './pages/LoginProfesor';
import Panel from './pages/Panel';
import { suscribirCambiosAuth, haySesionActiva } from './services/auth';

function App() {
  const [sesionActiva, setSesionActiva] = useState(false);
  const [cargando, setCargando] = useState(true);

  // Verificar sesión inicial y suscribir cambios
  useEffect(() => {
    // Verificación inicial
    const verificarSesion = async () => {
      const activa = await haySesionActiva();
      setSesionActiva(activa);
      setCargando(false);
    };
    verificarSesion();

    // Suscribirse a cambios de auth
    const unsubscribe = suscribirCambiosAuth((event, session) => {
      setSesionActiva(!!session);
      console.log('[App] Estado de sesión actualizado:', !!session);
    });

    return () => unsubscribe();
  }, []);

  // Componente de protección de ruta simple
  const RutaProtegida = ({ children }) => {
    if (cargando) {
      return (
        <div style={{ padding: '48px', textAlign: 'center', color: '#667085' }}>
          Cargando...
        </div>
      );
    }
    return sesionActiva ? children : <Navigate to="/login" replace />;
  };

  // Componente de redirección si ya está logueado
  const RutaPublicaProfesor = ({ children }) => {
    if (cargando) {
      return (
        <div style={{ padding: '48px', textAlign: 'center', color: '#667085' }}>
          Cargando...
        </div>
      );
    }
    return sesionActiva ? <Navigate to="/panel" replace /> : children;
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta pública para alumnos */}
        <Route path="/" element={<Home />} />

        {/* Ruta de login/registro (redirige si ya está logueado) */}
        <Route
          path="/login"
          element={
            <RutaPublicaProfesor>
              <LoginProfesor />
            </RutaPublicaProfesor>
          }
        />

        {/* Panel protegido (requiere auth) */}
        <Route
          path="/panel"
          element={
            <RutaProtegida>
              <Panel />
            </RutaProtegida>
          }
        />

        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;