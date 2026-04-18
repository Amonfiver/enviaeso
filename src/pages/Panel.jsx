/**
 * Propósito:
 * Pantalla temporal del panel del profesor para crear, editar, borrar y visualizar grupos.
 * Incluye vista de alumnos por grupo respetando privacidad (sin mostrar emails).
 * Muestra contador de alumnos por grupo visible en cada tarjeta.
 *
 * Alcance:
 * MVP puente sin autenticación real.
 *
 * Decisiones:
 * - Usa un profesor_id temporal fijo para validar el flujo
 * - Genera un código automáticamente al crear
 * - Lista los grupos ya creados del profesor
 * - Permite guardar una nota interna opcional por grupo
 * - Permite editar nombre y nota_interna de grupos existentes
 * - Permite borrar grupos con confirmación
 * - Permite ver alumnos de cada grupo sin exponer emails (solo nombre)
 * - Muestra contador de alumnos visible en cada tarjeta de grupo
 *
 * Limitaciones:
 * - Aún no hay login oficial
 * - No se permite editar el código de grupo
 * - Vista de alumnos es de solo lectura
 * - El contador de alumnos se carga junto con los grupos (no en tiempo real)
 */

import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { generarCodigoGrupo } from '../utils/generarCodigoGrupo';

// TODO: Reemplazar por el profesor autenticado cuando implementemos login real
const PROFESOR_ID_TEMPORAL = '8f3de77b-11e4-4fd6-a45c-068368e540a9';

export default function Panel() {
  const [nombreGrupo, setNombreGrupo] = useState('');
  const [notaInterna, setNotaInterna] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [tipoMensaje, setTipoMensaje] = useState('');
  const [loading, setLoading] = useState(false);
  const [grupos, setGrupos] = useState([]);
  const [loadingGrupos, setLoadingGrupos] = useState(true);

  // Estado para edición de grupos
  const [grupoEditando, setGrupoEditando] = useState(null);
  const [editNombre, setEditNombre] = useState('');
  const [editNota, setEditNota] = useState('');
  const [loadingEdicion, setLoadingEdicion] = useState(false);
  const [loadingBorrado, setLoadingBorrado] = useState(null);

  // Estado para vista de alumnos de un grupo
  const [grupoAlumnosAbierto, setGrupoAlumnosAbierto] = useState(null);
  const [alumnos, setAlumnos] = useState([]);
  const [loadingAlumnos, setLoadingAlumnos] = useState(false);

  // Estado para conteo de alumnos por grupo (privacidad: solo conteos, no emails)
  const [conteoAlumnos, setConteoAlumnos] = useState({});

  const cargarGrupos = async () => {
    setLoadingGrupos(true);

    try {
      // 1. Cargar grupos del profesor
      const { data: gruposData, error: gruposError } = await supabase
        .from('grupos')
        .select('id, nombre, codigo, nota_interna, created_at')
        .eq('profesor_id', PROFESOR_ID_TEMPORAL)
        .order('created_at', { ascending: false });

      if (gruposError) {
        throw gruposError;
      }

      const gruposCargados = gruposData || [];
      setGrupos(gruposCargados);

      // 2. Cargar conteo de alumnos por grupo (sin traer emails, solo grupo_id)
      if (gruposCargados.length > 0) {
        const grupoIds = gruposCargados.map((g) => g.id);
        const { data: alumnosData, error: alumnosError } = await supabase
          .from('alumnos')
          .select('grupo_id')
          .in('grupo_id', grupoIds);

        if (alumnosError) {
          console.error('Error al cargar conteo de alumnos:', alumnosError);
          // No bloqueamos la carga de grupos por error en conteo
        } else {
          // Contar alumnos por grupo en cliente (eficiente para MVP)
          const conteos = {};
          alumnosData.forEach((alumno) => {
            conteos[alumno.grupo_id] = (conteos[alumno.grupo_id] || 0) + 1;
          });
          setConteoAlumnos(conteos);
        }
      } else {
        setConteoAlumnos({});
      }
    } catch (error) {
      console.error('Error al cargar grupos:', error);
      setMensaje('No se pudieron cargar los grupos.');
      setTipoMensaje('error');
    } finally {
      setLoadingGrupos(false);
    }
  };

  useEffect(() => {
    cargarGrupos();
  }, []);

  const handleCrearGrupo = async (e) => {
    e.preventDefault();

    setMensaje('');
    setTipoMensaje('');
    setLoading(true);

    const nombreNormalizado = nombreGrupo.trim();
    const notaNormalizada = notaInterna.trim();

    if (!nombreNormalizado) {
      setMensaje('El nombre del grupo es obligatorio.');
      setTipoMensaje('error');
      setLoading(false);
      return;
    }

    try {
      const codigo = generarCodigoGrupo();

      const { data, error } = await supabase
        .from('grupos')
        .insert([
          {
            profesor_id: PROFESOR_ID_TEMPORAL,
            nombre: nombreNormalizado,
            codigo,
            nota_interna: notaNormalizada || null,
          },
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      setMensaje(
        `Grupo creado correctamente. Código generado: ${data.codigo}`
      );
      setTipoMensaje('success');
      setNombreGrupo('');
      setNotaInterna('');

      await cargarGrupos();
    } catch (error) {
      console.error('Error al crear grupo:', error);
      setMensaje('No se pudo crear el grupo. Inténtalo de nuevo.');
      setTipoMensaje('error');
    } finally {
      setLoading(false);
    }
  };

  const handleEditarClick = (grupo) => {
    setGrupoEditando(grupo.id);
    setEditNombre(grupo.nombre);
    setEditNota(grupo.nota_interna || '');
    setMensaje('');
    setTipoMensaje('');
  };

  const handleCancelarEdicion = () => {
    setGrupoEditando(null);
    setEditNombre('');
    setEditNota('');
  };

  const handleGuardarEdicion = async (grupoId) => {
    const nombreNormalizado = editNombre.trim();
    const notaNormalizada = editNota.trim();

    if (!nombreNormalizado) {
      setMensaje('El nombre del grupo es obligatorio.');
      setTipoMensaje('error');
      return;
    }

    setLoadingEdicion(true);
    setMensaje('');
    setTipoMensaje('');

    try {
      const { error } = await supabase
        .from('grupos')
        .update({
          nombre: nombreNormalizado,
          nota_interna: notaNormalizada || null,
        })
        .eq('id', grupoId)
        .eq('profesor_id', PROFESOR_ID_TEMPORAL);

      if (error) {
        throw error;
      }

      setMensaje('Grupo actualizado correctamente.');
      setTipoMensaje('success');
      setGrupoEditando(null);
      setEditNombre('');
      setEditNota('');

      await cargarGrupos();
    } catch (error) {
      console.error('Error al actualizar grupo:', error);
      setMensaje('No se pudo actualizar el grupo. Inténtalo de nuevo.');
      setTipoMensaje('error');
    } finally {
      setLoadingEdicion(false);
    }
  };

  const handleBorrarGrupo = async (grupo) => {
    const confirmacion = window.confirm(
      `¿Estás seguro de que quieres borrar el grupo "${grupo.nombre}"? Esta acción no se puede deshacer.`
    );

    if (!confirmacion) {
      return;
    }

    setLoadingBorrado(grupo.id);
    setMensaje('');
    setTipoMensaje('');

    try {
      const { error } = await supabase
        .from('grupos')
        .delete()
        .eq('id', grupo.id)
        .eq('profesor_id', PROFESOR_ID_TEMPORAL);

      if (error) {
        throw error;
      }

      setMensaje('Grupo borrado correctamente.');
      setTipoMensaje('success');

      // Si estábamos editando este grupo, cancelar edición
      if (grupoEditando === grupo.id) {
        setGrupoEditando(null);
        setEditNombre('');
        setEditNota('');
      }

      // Si teníamos la vista de alumnos de este grupo abierta, limpiarla
      if (grupoAlumnosAbierto === grupo.id) {
        setGrupoAlumnosAbierto(null);
        setAlumnos([]);
      }

      await cargarGrupos();
    } catch (error) {
      console.error('Error al borrar grupo:', error);
      setMensaje('No se pudo borrar el grupo. Inténtalo de nuevo.');
      setTipoMensaje('error');
    } finally {
      setLoadingBorrado(null);
    }
  };

  /**
   * Carga los alumnos de un grupo específico.
   * Solo trae los campos necesarios (id, nombre) respetando privacidad.
   * No consulta ni muestra emails de los alumnos.
   */
  const cargarAlumnos = async (grupoId) => {
    // Si ya está abierto, cerrar
    if (grupoAlumnosAbierto === grupoId) {
      setGrupoAlumnosAbierto(null);
      setAlumnos([]);
      return;
    }

    setGrupoAlumnosAbierto(grupoId);
    setLoadingAlumnos(true);
    setAlumnos([]);

    try {
      const { data, error } = await supabase
        .from('alumnos')
        .select('id, nombre')
        .eq('grupo_id', grupoId)
        .order('nombre', { ascending: true });

      if (error) {
        throw error;
      }

      setAlumnos(data || []);
    } catch (error) {
      console.error('Error al cargar alumnos:', error);
      setMensaje('No se pudieron cargar los alumnos.');
      setTipoMensaje('error');
      // En caso de error, limpiar la vista de alumnos para no insinuar que el grupo está vacío
      setGrupoAlumnosAbierto(null);
      setAlumnos([]);
    } finally {
      setLoadingAlumnos(false);
    }
  };

  return (
    <div className="container">
      <h1>Panel del profesor</h1>
      <p>Crea un grupo y obtén un código para compartir con tus alumnos.</p>

      <form onSubmit={handleCrearGrupo}>
        <input
          type="text"
          placeholder="Nombre del grupo"
          value={nombreGrupo}
          onChange={(e) => setNombreGrupo(e.target.value)}
          required
        />

        <textarea
          placeholder="Nota interna opcional (ej. Curso en Castellón por la tarde, pendiente enviar convenio y presentación...)"
          value={notaInterna}
          onChange={(e) => setNotaInterna(e.target.value)}
          rows={4}
          style={{
            width: '100%',
            marginTop: '12px',
            padding: '12px 14px',
            borderRadius: '12px',
            border: '1px solid #d0d5dd',
            resize: 'vertical',
            font: 'inherit',
          }}
        />

        <button type="submit" disabled={loading} style={{ marginTop: '12px' }}>
          {loading ? 'Creando grupo...' : 'Crear grupo'}
        </button>
      </form>

      {mensaje && (
        <p
          style={{
            marginTop: '16px',
            color: tipoMensaje === 'error' ? '#b42318' : '#067647',
            fontWeight: '600',
          }}
        >
          {mensaje}
        </p>
      )}

      <section style={{ marginTop: '32px' }}>
        <h2>Tus grupos</h2>

        {loadingGrupos ? (
          <p>Cargando grupos...</p>
        ) : grupos.length === 0 ? (
          <p>Aún no has creado grupos.</p>
        ) : (
          <div style={{ display: 'grid', gap: '12px', marginTop: '16px' }}>
            {grupos.map((grupo) => (
              <div
                key={grupo.id}
                style={{
                  border: '1px solid #d0d5dd',
                  borderRadius: '12px',
                  padding: '16px',
                  background: '#ffffff',
                  borderLeft:
                    grupoEditando === grupo.id ? '4px solid #1570ef' : undefined,
                }}
              >
                {grupoEditando === grupo.id ? (
                  // Modo edición
                  <>
                    <input
                      type="text"
                      value={editNombre}
                      onChange={(e) => setEditNombre(e.target.value)}
                      placeholder="Nombre del grupo"
                      style={{
                        width: '100%',
                        marginBottom: '8px',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid #d0d5dd',
                        font: 'inherit',
                        fontWeight: '600',
                      }}
                    />

                    <textarea
                      value={editNota}
                      onChange={(e) => setEditNota(e.target.value)}
                      placeholder="Nota interna opcional"
                      rows={3}
                      style={{
                        width: '100%',
                        marginBottom: '12px',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid #d0d5dd',
                        resize: 'vertical',
                        font: 'inherit',
                      }}
                    />

                    <p
                      style={{
                        margin: '0 0 12px 0',
                        color: '#667085',
                        fontSize: '14px',
                      }}
                    >
                      <strong>Código:</strong> {grupo.codigo}{' '}
                      <em>(no editable)</em>
                    </p>

                    <div
                      style={{
                        display: 'flex',
                        gap: '8px',
                        flexWrap: 'wrap',
                      }}
                    >
                      <button
                        onClick={() => handleGuardarEdicion(grupo.id)}
                        disabled={loadingEdicion}
                        style={{
                          padding: '8px 16px',
                          fontSize: '14px',
                        }}
                      >
                        {loadingEdicion ? 'Guardando...' : 'Guardar'}
                      </button>

                      <button
                        onClick={handleCancelarEdicion}
                        disabled={loadingEdicion}
                        style={{
                          padding: '8px 16px',
                          fontSize: '14px',
                          backgroundColor: '#f2f4f7',
                          color: '#344054',
                        }}
                      >
                        Cancelar
                      </button>
                    </div>
                  </>
                ) : (
                  // Modo visualización
                  <>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: '12px',
                      }}
                    >
                      <h3 style={{ margin: '0 0 8px 0' }}>{grupo.nombre}</h3>

                      <div
                        style={{
                          display: 'flex',
                          gap: '8px',
                          flexShrink: 0,
                        }}
                      >
                        <button
                          onClick={() => handleEditarClick(grupo)}
                          disabled={loadingBorrado === grupo.id}
                          style={{
                            padding: '6px 12px',
                            fontSize: '13px',
                            minWidth: 'auto',
                          }}
                        >
                          Editar
                        </button>

                        <button
                          onClick={() => handleBorrarGrupo(grupo)}
                          disabled={loadingBorrado === grupo.id}
                          style={{
                            padding: '6px 12px',
                            fontSize: '13px',
                            minWidth: 'auto',
                            backgroundColor: '#fef3f2',
                            color: '#b42318',
                            border: '1px solid #fda29b',
                          }}
                        >
                          {loadingBorrado === grupo.id
                            ? 'Borrando...'
                            : 'Borrar'}
                        </button>
                      </div>
                    </div>

                    <p style={{ margin: '0 0 4px 0' }}>
                      <strong>Código:</strong> {grupo.codigo}
                    </p>

                    <p style={{ margin: '4px 0 8px 0', color: '#667085', fontSize: '14px' }}>
                      {conteoAlumnos[grupo.id] || 0} alumno{(conteoAlumnos[grupo.id] || 0) !== 1 ? 's' : ''}
                    </p>

                    {grupo.nota_interna && (
                      <p
                        style={{
                          margin: '8px 0 8px 0',
                          color: '#344054',
                          whiteSpace: 'pre-wrap',
                        }}
                      >
                        <strong>Nota:</strong> {grupo.nota_interna}
                      </p>
                    )}

                    <p
                      style={{ margin: '12px 0 0 0', color: '#667085', fontSize: '14px' }}
                    >
                      Creado: {new Date(grupo.created_at).toLocaleString()}
                    </p>

                    {/* Botón Ver alumnos */}
                    <button
                      onClick={() => cargarAlumnos(grupo.id)}
                      disabled={loadingBorrado === grupo.id}
                      style={{
                        marginTop: '12px',
                        padding: '6px 12px',
                        fontSize: '13px',
                        minWidth: 'auto',
                        backgroundColor: '#f9fafb',
                        color: '#344054',
                        border: '1px solid #d0d5dd',
                      }}
                    >
                      {grupoAlumnosAbierto === grupo.id ? 'Ocultar alumnos' : 'Ver alumnos'}
                    </button>

                    {/* Sección expandible de alumnos */}
                    {grupoAlumnosAbierto === grupo.id && (
                      <div
                        style={{
                          marginTop: '12px',
                          padding: '12px',
                          backgroundColor: '#f9fafb',
                          borderRadius: '8px',
                          border: '1px solid #e4e7ec',
                        }}
                      >
                        <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#344054' }}>
                          Alumnos de {grupo.nombre}
                        </h4>

                        {loadingAlumnos ? (
                          <p style={{ margin: 0, fontSize: '14px', color: '#667085' }}>
                            Cargando alumnos...
                          </p>
                        ) : alumnos.length === 0 ? (
                          <p style={{ margin: 0, fontSize: '14px', color: '#667085' }}>
                            Aún no hay alumnos en este grupo.
                          </p>
                        ) : (
                          <>
                            <p
                              style={{
                                margin: '0 0 8px 0',
                                fontSize: '13px',
                                color: '#667085',
                                fontWeight: '500',
                              }}
                            >
                              Total: {alumnos.length} alumno{alumnos.length !== 1 ? 's' : ''}
                            </p>
                            <ul
                              style={{
                                margin: 0,
                                paddingLeft: '16px',
                                fontSize: '14px',
                                color: '#344054',
                              }}
                            >
                              {alumnos.map((alumno) => (
                                <li key={alumno.id} style={{ marginBottom: '4px' }}>
                                  {alumno.nombre}
                                </li>
                              ))}
                            </ul>
                          </>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}