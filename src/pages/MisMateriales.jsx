/**
 * Propósito:
 * Página donde el alumno puede ver y descargar los materiales
 * compartidos por su profesor en el grupo.
 *
 * Alcance:
 * - Muestra los materiales del grupo al que pertenece el alumno
 * - Permite descargar cada material
 * - Muestra información básica (nombre, tamaño)
 * - Sin exponer datos de otros alumnos
 *
 * Decisiones:
 * - Accede vía location.state (datos pasados desde AccesoAlumno)
 * - Si no hay datos de acceso, redirige a la página de acceso
 * - Usa URLs firmadas de Supabase Storage para descargas
 * - Sin autenticación persistente (solo sesión por navegación)
 *
 * Limitaciones:
 * - Sin tracking de descargas todavía
 * - Sin indicador de "nuevo" vs "ya visto"
 * - Sin offline/cache
 */

import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import {
  listarMaterialesPorGrupo,
  obtenerUrlDescarga,
  formatearTamaño,
} from '../services/storage';

export default function MisMateriales() {
  const location = useLocation();
  const navigate = useNavigate();

  // Datos del alumno y grupo pasados desde AccesoAlumno
  const { alumno, grupo } = location.state || {};

  const [materiales, setMateriales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState('');
  const [tipoMensaje, setTipoMensaje] = useState('');
  const [descargando, setDescargando] = useState(null);

  // Si no hay datos de acceso, redirigir
  useEffect(() => {
    if (!alumno || !grupo) {
      navigate('/acceso-alumno');
      return;
    }

    cargarMateriales();
  }, [alumno, grupo, navigate]);

  const cargarMateriales = async () => {
    setLoading(true);
    setMensaje('');
    setTipoMensaje('');

    try {
      const { data, error } = await listarMaterialesPorGrupo(grupo.id);

      if (error) {
        throw new Error(error);
      }

      setMateriales(data || []);
    } catch (error) {
      console.error('[MisMateriales] Error al cargar materiales:', error);
      setMensaje('No se pudieron cargar los materiales. Inténtalo de nuevo.');
      setTipoMensaje('error');
    } finally {
      setLoading(false);
    }
  };

  const handleDescargar = async (material) => {
    setDescargando(material.id);
    setMensaje('');
    setTipoMensaje('');

    try {
      const { url, error } = await obtenerUrlDescarga(material.url_storage, 300); // 5 minutos de validez

      if (error || !url) {
        throw new Error(error || 'No se pudo generar el enlace de descarga');
      }

      // Crear enlace temporal para forzar descarga
      const link = document.createElement('a');
      link.href = url;
      link.download = material.nombre_archivo; // Sugerir nombre de archivo
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      
      // Limpiar después de un momento
      setTimeout(() => {
        document.body.removeChild(link);
      }, 100);

      setMensaje(`Descargando "${material.nombre_archivo}"...`);
      setTipoMensaje('success');
    } catch (error) {
      console.error('[MisMateriales] Error al descargar:', error);
      setMensaje(`Error al descargar "${material.nombre_archivo}". Inténtalo de nuevo.`);
      setTipoMensaje('error');
    } finally {
      setDescargando(null);
    }
  };

  // Si no hay datos, mostrar loading mientras redirige
  if (!alumno || !grupo) {
    return (
      <div className="container">
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ marginBottom: '24px' }}>
        <h1>Mis materiales</h1>
        <p style={{ color: '#667085', marginBottom: '4px' }}>
          Hola, <strong>{alumno.nombre}</strong>.
        </p>
        <p style={{ color: '#667085', fontSize: '14px' }}>
          Grupo: <strong>{grupo.nombre}</strong>
        </p>
      </div>

      {loading ? (
        <p>Cargando materiales...</p>
      ) : materiales.length === 0 ? (
        <div
          style={{
            padding: '24px',
            backgroundColor: '#f9fafb',
            borderRadius: '12px',
            textAlign: 'center',
          }}
        >
          <p style={{ color: '#667085', margin: 0 }}>
            Aún no hay materiales disponibles en tu grupo.
          </p>
          <p style={{ color: '#667085', fontSize: '14px', marginTop: '8px' }}>
            Vuelve más tarde o contacta a tu profesor.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '12px' }}>
          {materiales.map((material) => (
            <div
              key={material.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px',
                backgroundColor: '#ffffff',
                border: '1px solid #d0d5dd',
                borderRadius: '12px',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    margin: '0 0 4px 0',
                    fontWeight: '500',
                    color: '#344054',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  📄 {material.nombre_archivo}
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: '13px',
                    color: '#6b7280',
                  }}
                >
                  {formatearTamaño(material.tamaño_bytes)} • Subido el{' '}
                  {new Date(material.created_at).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => handleDescargar(material)}
                disabled={descargando === material.id}
                style={{
                  marginLeft: '12px',
                  padding: '8px 16px',
                  fontSize: '14px',
                  minWidth: 'auto',
                  whiteSpace: 'nowrap',
                }}
              >
                {descargando === material.id ? 'Abriendo...' : 'Descargar'}
              </button>
            </div>
          ))}
        </div>
      )}

      {mensaje && (
        <p
          style={{
            marginTop: '16px',
            color: tipoMensaje === 'error' ? '#b42318' : '#067647',
            fontWeight: '500',
          }}
        >
          {mensaje}
        </p>
      )}

      <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #e4e7ec' }}>
        <button
          onClick={() => navigate('/acceso-alumno')}
          style={{
            padding: '8px 16px',
            fontSize: '14px',
            minWidth: 'auto',
            backgroundColor: '#f2f4f7',
            color: '#344054',
            border: '1px solid #d0d5dd',
          }}
        >
          ← Salir / Cambiar de grupo
        </button>
      </div>
    </div>
  );
}