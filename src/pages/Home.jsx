/**
 * Propósito:
 * Landing principal unificada de EnviaEso. Presenta dos caminos claros:
 * - Recibir: para quienes quieren apuntarse a recibir materiales o acceder a los suyos
 * - Enviar: para quienes gestionan grupos y envían documentación
 *
 * Alcance:
 * - Hero con marca y valor del producto
 * - Dos bloques principales: Recibir (izquierda) y Enviar (derecha)
 * - Formulario de alta integrado en el bloque Recibir
 * - CTAs claros sin duplicidad de formularios
 *
 * Decisiones:
 * - Nomenclatura generalista: "Recibir/Enviar" en lugar de "Alumno/Profesor"
 * - Estructura visual en cards para claridad y jerarquía
 * - El acceso a materiales se mantiene en /acceso-alumno (enlace desde Recibir)
 * - Responsive: apilado en móvil, lado a lado en desktop
 *
 * Limitaciones:
 * - No se renombran tablas ni lógica interna (profesores/alumnos/grupos)
 * - El cambio es puramente de UX, copies y estructura visual
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';

export default function Home() {
  const navigate = useNavigate();

  // Estados del formulario de alta (sección Apuntarme)
  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [tipoMensaje, setTipoMensaje] = useState('');
  const [loading, setLoading] = useState(false);

  const limpiarFormulario = () => {
    setCodigo('');
    setNombre('');
    setEmail('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMensaje('');
    setTipoMensaje('');
    setLoading(true);

    const codigoNormalizado = codigo.trim().toUpperCase();
    const nombreNormalizado = nombre.trim();
    const emailNormalizado = email.trim().toLowerCase();

    try {
      // 1. Buscar grupo por código
      const { data: grupo, error: errorGrupo } = await supabase
        .from('grupos')
        .select('id, nombre, codigo')
        .eq('codigo', codigoNormalizado)
        .maybeSingle();

      if (errorGrupo) {
        throw errorGrupo;
      }

      if (!grupo) {
        setMensaje('No existe ningún grupo con ese código.');
        setTipoMensaje('error');
        return;
      }

      // 2. Insertar alumno en el grupo
      const { error: errorAlumno } = await supabase.from('alumnos').insert([
        {
          grupo_id: grupo.id,
          nombre: nombreNormalizado,
          email: emailNormalizado,
        },
      ]);

      if (errorAlumno) {
        // Error por duplicado: ya existe ese email en ese grupo
        if (errorAlumno.code === '23505') {
          setMensaje('Ese correo ya está apuntado en este grupo.');
          setTipoMensaje('error');
          return;
        }

        throw errorAlumno;
      }

      setMensaje(`Te has apuntado correctamente al grupo "${grupo.nombre}".`);
      setTipoMensaje('success');
      limpiarFormulario();
    } catch (error) {
      console.error('Error al apuntar alumno:', error);
      setMensaje('Ha ocurrido un error. Inténtalo de nuevo.');
      setTipoMensaje('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        padding: '24px 16px 48px',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* HERO */}
        <div
          style={{
            textAlign: 'center',
            padding: '48px 16px 56px',
          }}
        >
          {/* Logo/Icono */}
          <div
            style={{
              width: '80px',
              height: '80px',
              margin: '0 auto 24px',
              background: 'linear-gradient(135deg, #1570ef 0%, #0ea5e9 100%)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '40px',
              boxShadow: '0 10px 25px rgba(21, 112, 239, 0.25)',
            }}
          >
            📦
          </div>

          {/* Marca */}
          <h1
            style={{
              fontSize: 'clamp(36px, 6vw, 48px)',
              fontWeight: '800',
              color: '#0f172a',
              marginBottom: '16px',
              letterSpacing: '-0.02em',
            }}
          >
            EnviaEso
          </h1>

          {/* Subtítulo de valor */}
          <p
            style={{
              fontSize: 'clamp(18px, 3vw, 22px)',
              color: '#475569',
              maxWidth: '560px',
              margin: '0 auto',
              lineHeight: '1.6',
              fontWeight: '400',
            }}
          >
            Comparte documentación, materiales y archivos de forma organizada.
            <br />
            Sin exponer datos personales. Sin complicaciones.
          </p>
        </div>

        {/* DOS BLOQUES PRINCIPALES */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: '24px',
            alignItems: 'stretch',
          }}
        >
          {/* BLOQUE RECIBIR */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              padding: '32px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.02), 0 10px 15px rgba(0, 0, 0, 0.03)',
              border: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Header del bloque */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  margin: '0 auto 16px',
                  backgroundColor: '#ecfdf5',
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '28px',
                }}
              >
                📥
              </div>
              <h2
                style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#065f46',
                  marginBottom: '8px',
                }}
              >
                Recibir
              </h2>
              <p
                style={{
                  color: '#64748b',
                  fontSize: '15px',
                  lineHeight: '1.6',
                  margin: 0,
                }}
              >
                Apúntate para recibir materiales o accede si ya tienes tu código
              </p>
            </div>

            {/* SECCIÓN 1: APUNTARME */}
            <div
              style={{
                backgroundColor: '#f8fafc',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '20px',
              }}
            >
              <h3
                style={{
                  fontSize: '15px',
                  fontWeight: '600',
                  color: '#334155',
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span style={{ fontSize: '16px' }}>✏️</span>
                Apuntarme por primera vez
              </h3>
              <p
                style={{
                  fontSize: '13px',
                  color: '#64748b',
                  marginBottom: '16px',
                  lineHeight: '1.5',
                }}
              >
                Tengo un código y quiero recibir materiales de un grupo.
              </p>

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '12px' }}>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '4px',
                      fontSize: '13px',
                      fontWeight: '500',
                      color: '#475569',
                    }}
                  >
                    Código del grupo
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: ABC123"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #d1d5db',
                      fontSize: '14px',
                      textTransform: 'uppercase',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '4px',
                      fontSize: '13px',
                      fontWeight: '500',
                      color: '#475569',
                    }}
                  >
                    Tu nombre
                  </label>
                  <input
                    type="text"
                    placeholder="Cómo te conocerán"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #d1d5db',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '4px',
                      fontSize: '13px',
                      fontWeight: '500',
                      color: '#475569',
                    }}
                  >
                    Tu email
                  </label>
                  <input
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #d1d5db',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                    }}
                  />
                  <p
                    style={{
                      fontSize: '11px',
                      color: '#94a3b8',
                      marginTop: '4px',
                      marginBottom: 0,
                    }}
                  >
                    🔒 No se comparte con nadie. Solo para enviarte avisos.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#10b981',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.7 : 1,
                  }}
                >
                  {loading ? 'Apuntando...' : 'Apuntarme al grupo'}
                </button>
              </form>

              {/* Feedback del formulario */}
              {mensaje && (
                <div
                  style={{
                    marginTop: '12px',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    backgroundColor:
                      tipoMensaje === 'error' ? '#fef2f2' : '#f0fdf4',
                    border: `1px solid ${
                      tipoMensaje === 'error' ? '#fecaca' : '#86efac'
                    }`,
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontSize: '13px',
                      textAlign: 'center',
                      color:
                        tipoMensaje === 'error' ? '#b42318' : '#166534',
                      fontWeight: '500',
                    }}
                  >
                    {tipoMensaje === 'error' ? '⚠️ ' : '✓ '}
                    {mensaje}
                  </p>
                </div>
              )}
            </div>

            {/* SECCIÓN 2: YA TENGO ACCESO */}
            <div
              style={{
                backgroundColor: '#f0f9ff',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid #bae6fd',
                marginTop: 'auto',
              }}
            >
              <h3
                style={{
                  fontSize: '15px',
                  fontWeight: '600',
                  color: '#0369a1',
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span style={{ fontSize: '16px' }}>🔑</span>
                Ya estoy apuntado
              </h3>
              <p
                style={{
                  fontSize: '13px',
                  color: '#0369a1',
                  marginBottom: '16px',
                  lineHeight: '1.5',
                }}
              >
                Ya me registré antes y quiero ver mis materiales.
              </p>

              <button
                onClick={() => navigate('/acceso-alumno')}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#ffffff',
                  color: '#0284c7',
                  border: '1px solid #7dd3fc',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <span>📂</span>
                Acceder a mis materiales
              </button>
            </div>
          </div>

          {/* BLOQUE ENVIAR */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              padding: '32px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.02), 0 10px 15px rgba(0, 0, 0, 0.03)',
              border: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Header del bloque */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  margin: '0 auto 16px',
                  backgroundColor: '#eff6ff',
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '28px',
                }}
              >
                📤
              </div>
              <h2
                style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#1e40af',
                  marginBottom: '8px',
                }}
              >
                Enviar
              </h2>
              <p
                style={{
                  color: '#64748b',
                  fontSize: '15px',
                  lineHeight: '1.6',
                  margin: 0,
                }}
              >
                Gestiona grupos, sube materiales y avisa a quienes los esperan
              </p>
            </div>

            {/* Características */}
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                marginBottom: '24px',
              }}
            >
              {[
                { icon: '👥', text: 'Crea y gestiona grupos de receptores' },
                { icon: '📦', text: 'Sube materiales y organiza envíos' },
                { icon: '📧', text: 'Avisa automáticamente por email' },
                { icon: '📊', text: 'Sigue quién ha recibido qué' },
              ].map((item, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '10px',
                  }}
                >
                  <span style={{ fontSize: '20px' }}>{item.icon}</span>
                  <span
                    style={{
                      fontSize: '14px',
                      color: '#475569',
                      fontWeight: '500',
                    }}
                  >
                    {item.text}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA Principal */}
            <button
              onClick={() => navigate('/login')}
              style={{
                width: '100%',
                padding: '16px',
                backgroundColor: '#1570ef',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(21, 112, 239, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
              }}
            >
              <span>🚀</span>
              Entrar al panel de gestión
            </button>

            <p
              style={{
                textAlign: 'center',
                fontSize: '13px',
                color: '#94a3b8',
                marginTop: '12px',
                marginBottom: 0,
              }}
            >
              ¿Primera vez? También puedes registrarte desde ahí
            </p>
          </div>
        </div>

        {/* Footer simple */}
        <div
          style={{
            textAlign: 'center',
            marginTop: '48px',
            paddingTop: '24px',
            borderTop: '1px solid #e2e8f0',
          }}
        >
          <p
            style={{
              fontSize: '13px',
              color: '#94a3b8',
              margin: 0,
            }}
          >
            EnviaEso · Compartir sin complicaciones
          </p>
        </div>
      </div>
    </div>
  );
}