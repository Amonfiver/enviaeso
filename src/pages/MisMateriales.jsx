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
      <div className="container" style={{ textAlign: 'center', padding: '48px' }}>
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '800px', padding: '16px 12px' }}>
      {/* Header */}
      <div
        style={{
          marginBottom: '24px',
          padding: '20px 16px',
          backgroundColor: '#f0fdf4',
          borderRadius: '16px',
          border: '1px solid #86efac',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '12px',
            flexWrap: 'wrap',
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              backgroundColor: '#10b981',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              flexShrink: 0,
            }}
          >
            📚
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <h1 style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: '700', color: '#101828' }}>
              Mis materiales
            </h1>
            <p style={{ margin: 0, color: '#667085', fontSize: '13px' }}>
              Grupo: <strong style={{ color: '#059669' }}>{grupo.nombre}</strong>
            </p>
          </div>
        </div>
        <p style={{ margin: '0', color: '#344054', fontSize: '15px', lineHeight: '1.5' }}>
          Hola, <strong>{alumno.nombre}</strong>. Aquí tienes los materiales compartidos.
        </p>
      </div>

      {/* Lista de materiales */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <p style={{ color: '#667085' }}>Cargando materiales...</p>
        </div>
      ) : materiales.length === 0 ? (
        <div
          style={{
            padding: '40px 20px',
            backgroundColor: '#f9fafb',
            borderRadius: '16px',
            textAlign: 'center',
            border: '1px solid #e4e7ec',
          }}
        >
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>📭</div>
          <p style={{ color: '#344054', fontSize: '16px', fontWeight: '500', margin: '0 0 8px 0' }}>
            Aún no hay materiales disponibles
          </p>
          <p style={{ color: '#667085', fontSize: '14px', margin: 0 }}>
            Vuelve más tarde o contacta a tu profesor si esperabas encontrar algo aquí.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '12px' }}>
          {materiales.map((material) => (
            <div
              key={material.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                padding: '16px',
                backgroundColor: '#ffffff',
                border: '1px solid #e4e7ec',
                borderRadius: '12px',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: '#f0f9ff',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    flexShrink: 0,
                  }}
                >
                  📄
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      margin: '0 0 4px 0',
                      fontWeight: '500',
                      color: '#344054',
                      fontSize: '15px',
                      lineHeight: '1.4',
                      wordBreak: 'break-word',
                    }}
                  >
                    {material.nombre_archivo}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '12px',
                      color: '#6b7280',
                    }}
                  >
                    {formatearTamaño(material.tamaño_bytes)} • {new Date(material.created_at).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleDescargar(material)}
                disabled={descargando === material.id}
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '14px',
                  fontWeight: '600',
                  minHeight: '44px',
                }}
              >
                {descargando === material.id ? 'Abriendo...' : '⬇️ Descargar'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Nota de ayuda */}
      <div
        style={{
          marginTop: '16px',
          padding: '14px',
          backgroundColor: '#fefce8',
          borderRadius: '10px',
          border: '1px solid #fde047',
        }}
      >
        <p style={{ margin: 0, fontSize: '13px', color: '#854d0e', lineHeight: '1.5' }}>
          💡 <strong>Nota:</strong> Si el archivo se abre en el navegador, mantén pulsado y selecciona "Descargar".
        </p>
      </div>

      {/* Mensaje de feedback */}
      {mensaje && (
        <div
          style={{
            marginTop: '16px',
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

      {/* Footer con botón de salir */}
      <div
        style={{
          marginTop: '24px',
          paddingTop: '20px',
          borderTop: '1px solid #e4e7ec',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <button
          onClick={() => navigate('/acceso-alumno')}
          style={{
            width: '100%',
            padding: '14px',
            fontSize: '15px',
            fontWeight: '600',
            minHeight: '48px',
            backgroundColor: '#f2f4f7',
            color: '#344054',
            border: '1px solid #d0d5dd',
            borderRadius: '10px',
          }}
        >
          ← Acceder con otro código
        </button>
      </div>
    </div>
  );
}
