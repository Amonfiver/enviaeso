/**
 * Propósito:
 * Pantalla temporal del panel del profesor para crear, editar, borrar y visualizar grupos.
 * Incluye vista de alumnos por grupo respetando privacidad (sin mostrar emails).
 * Muestra contador de alumnos por grupo visible en cada tarjeta.
 * Permite enviar avisos por email a alumnos individuales sin exponer sus direcciones.
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
 * - Incluye prueba controlada de envío de emails individuales
 * - Permite enviar avisos reales a alumnos seleccionados por nombre (email oculto)
 * - Permite enviar avisos a todos los alumnos de un grupo ("Avisar a todos")
 *
 * Limitaciones:
 * - Aún no hay login oficial
 * - No se permite editar el código de grupo
 * - Vista de alumnos es de solo lectura
 * - El contador de alumnos se carga junto con los grupos (no en tiempo real)
 * - Envío de emails de prueba sin autenticación adicional
 * - No se registra trazabilidad de envíos en tabla envios/envios_alumnos
 * - Envío grupal secuencial sin rate-limiting avanzado
 */

import { useEffect, useState, useRef } from 'react';
import { supabase } from '../services/supabase';
import { generarCodigoGrupo } from '../utils/generarCodigoGrupo';
import {
  subirMaterial,
  eliminarMaterial,
  listarMaterialesPorGrupo,
  formatearTamaño,
} from '../services/storage';
import { enviarCorreoReal } from '../services/email';

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

  // Estado para materiales por grupo
  const [materialesPorGrupo, setMaterialesPorGrupo] = useState({});
  const [loadingMateriales, setLoadingMateriales] = useState({});
  const [errorMateriales, setErrorMateriales] = useState({}); // Nuevo: errores por grupo
  const [subiendoArchivo, setSubiendoArchivo] = useState(null);
  
  // Estado separado para controlar visibilidad de la sección de materiales
  const [grupoMaterialesAbierto, setGrupoMaterialesAbierto] = useState(null);

  // Estado para prueba de envío de email
  const [emailPrueba, setEmailPrueba] = useState('');
  const [loadingEmailPrueba, setLoadingEmailPrueba] = useState(false);

  // Estado para envío de aviso a alumno individual
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState(null); // { id, nombre, email }
  const [loadingAvisoAlumno, setLoadingAvisoAlumno] = useState(false);

  // Estado para envío de aviso a todos los alumnos de un grupo
  const [loadingAvisarATodos, setLoadingAvisarATodos] = useState(false);

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
   * Copia el código del grupo al portapapeles.
   * Muestra feedback usando el sistema de mensajes existente.
   */
  const handleCopiarCodigo = async (codigo) => {
    try {
      await navigator.clipboard.writeText(codigo);
      setMensaje('Código copiado correctamente.');
      setTipoMensaje('success');
    } catch (error) {
      console.error('Error al copiar código:', error);
      setMensaje('No se pudo copiar el código. Inténtalo manualmente.');
      setTipoMensaje('error');
    }
  };

  /**
   * Copia un mensaje de invitación listo para enviar a los alumnos.
   * Incluye instrucciones y el código del grupo.
   * Muestra feedback usando el sistema de mensajes existente.
   */
  const handleCopiarInvitacion = async (codigo) => {
    const textoInvitacion = `Hola, entra en enviaeso.com, escribe tu nombre y tu correo, y usa este código de grupo: ${codigo}`;
    try {
      await navigator.clipboard.writeText(textoInvitacion);
      setMensaje('Invitación copiada correctamente.');
      setTipoMensaje('success');
    } catch (error) {
      console.error('Error al copiar invitación:', error);
      setMensaje('No se pudo copiar la invitación. Inténtalo manualmente.');
      setTipoMensaje('error');
    }
  };

  /**
   * Carga los alumnos de un grupo específico.
   * Trae id, nombre y email (uso interno para envío, no se muestra en UI).
   * El email se mantiene en memoria lógica pero nunca se renderiza.
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
    setAlumnoSeleccionado(null); // Limpiar selección previa

    try {
      const { data, error } = await supabase
        .from('alumnos')
        .select('id, nombre, email')
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

  /**
   * Recarga los alumnos del grupo actualmente abierto (sin toggle).
   * Usado por el botón de actualización manual.
   */
  const recargarAlumnosAbierto = async () => {
    if (!grupoAlumnosAbierto) return;

    setLoadingAlumnos(true);
    try {
      const { data, error } = await supabase
        .from('alumnos')
        .select('id, nombre')
        .eq('grupo_id', grupoAlumnosAbierto)
        .order('nombre', { ascending: true });

      if (error) {
        throw error;
      }

      setAlumnos(data || []);
    } catch (error) {
      console.error('Error al recargar alumnos:', error);
      setMensaje('No se pudieron actualizar los alumnos.');
      setTipoMensaje('error');
    } finally {
      setLoadingAlumnos(false);
    }
  };

  /**
   * Actualiza manualmente toda la información del panel:
   * - Recarga los grupos y contadores
   * - Si hay una vista de alumnos abierta, la recarga también
   */
  const handleActualizar = async () => {
    setMensaje('');
    setTipoMensaje('');

    // Recargar grupos y contadores
    await cargarGrupos();

    // Si hay alumnos abiertos, recargarlos también
    if (grupoAlumnosAbierto) {
      await recargarAlumnosAbierto();
    }

    setMensaje('Información actualizada.');
    setTipoMensaje('success');
  };

  // ============================================================================
  // FUNCIONES PARA GESTIÓN DE MATERIALES
  // ============================================================================

  /**
   * Carga los materiales de un grupo específico.
   * Se ejecuta al expandir la sección de materiales.
   */
  const cargarMateriales = async (grupoId) => {
    setLoadingMateriales((prev) => ({ ...prev, [grupoId]: true }));
    setErrorMateriales((prev) => ({ ...prev, [grupoId]: null })); // Limpiar error previo
    
    try {
      const { data, error } = await listarMaterialesPorGrupo(grupoId);
      if (error) {
        throw new Error(error);
      }
      setMaterialesPorGrupo((prev) => ({ ...prev, [grupoId]: data || [] }));
      console.log(`[Materiales] Cargados ${data?.length || 0} materiales para grupo ${grupoId}`);
    } catch (error) {
      console.error('[Materiales] Error al cargar materiales:', error);
      console.error('[Materiales] Detalle:', error.message, error.stack);
      
      // Guardar error para mostrar inline, pero NO bloquear la UI
      setErrorMateriales((prev) => ({ 
        ...prev, 
        [grupoId]: error.message || 'Error al cargar materiales' 
      }));
      
      // Inicializar array vacío para que la sección se muestre igual
      setMaterialesPorGrupo((prev) => ({ ...prev, [grupoId]: [] }));
    } finally {
      setLoadingMateriales((prev) => ({ ...prev, [grupoId]: false }));
    }
  };

  /**
   * Maneja la selección y subida de un archivo.
   * Se activa cuando el usuario selecciona un archivo en el input.
   */
  const handleSubirArchivo = async (grupoId, archivo) => {
    if (!archivo) return;

    setSubiendoArchivo(grupoId);
    setMensaje('');
    setTipoMensaje('');

    try {
      const { data, error } = await subirMaterial(grupoId, archivo);
      if (error) {
        throw new Error(error);
      }

      // Actualizar lista de materiales en estado
      setMaterialesPorGrupo((prev) => ({
        ...prev,
        [grupoId]: [data, ...(prev[grupoId] || [])],
      }));

      setMensaje(`Archivo "${archivo.name}" subido correctamente.`);
      setTipoMensaje('success');
    } catch (error) {
      console.error('Error al subir archivo:', error);
      setMensaje(error.message || 'No se pudo subir el archivo.');
      setTipoMensaje('error');
    } finally {
      setSubiendoArchivo(null);
    }
  };

  /**
   * Elimina un material del grupo.
   * Pide confirmación antes de eliminar.
   */
  const handleEliminarMaterial = async (grupoId, material) => {
    const confirmacion = window.confirm(
      `¿Estás seguro de que quieres eliminar "${material.nombre_archivo}"?`
    );

    if (!confirmacion) {
      return;
    }

    setMensaje('');
    setTipoMensaje('');

    try {
      const { success, error } = await eliminarMaterial(
        material.id,
        material.url_storage
      );

      if (!success) {
        throw new Error(error);
      }

      // Actualizar lista de materiales en estado
      setMaterialesPorGrupo((prev) => ({
        ...prev,
        [grupoId]: (prev[grupoId] || []).filter((m) => m.id !== material.id),
      }));

      setMensaje('Archivo eliminado correctamente.');
      setTipoMensaje('success');
    } catch (error) {
      console.error('Error al eliminar material:', error);
      setMensaje(error.message || 'No se pudo eliminar el archivo.');
      setTipoMensaje('error');
    }
  };

  // Referencias para inputs file (una por grupo)
  const fileInputRefs = useRef({});

  /**
   * Envía un email de prueba a la dirección indicada.
   * Usa la Edge Function send-test-email mediante enviarCorreoReal.
   */
  const handleEnviarEmailPrueba = async (e) => {
    e.preventDefault();
    
    const email = emailPrueba.trim();
    
    if (!email) {
      setMensaje('Introduce un email para enviar la prueba.');
      setTipoMensaje('error');
      return;
    }

    setLoadingEmailPrueba(true);
    setMensaje('');
    setTipoMensaje('');

    const resultado = await enviarCorreoReal({
      to: email,
      subject: 'Prueba de EnviaEso',
      html: '<p>¡Hola! Este es un email de prueba enviado desde <strong>EnviaEso</strong>.</p><p>Si lo recibes, significa que la configuración de email está funcionando correctamente.</p><p>---<br>Enviado desde EnviaEso</p>',
      text: '¡Hola! Este es un email de prueba enviado desde EnviaEso. Si lo recibes, significa que la configuración de email está funcionando correctamente. --- Enviado desde EnviaEso'
    });

    if (resultado.success) {
      setMensaje(`Email de prueba enviado correctamente a ${email}. ID: ${resultado.messageId}`);
      setTipoMensaje('success');
      setEmailPrueba('');
    } else {
      setMensaje(`Error al enviar email: ${resultado.error}`);
      setTipoMensaje('error');
    }

    setLoadingEmailPrueba(false);
  };

  /**
   * Envía un aviso real a un alumno específico seleccionado.
   * Usa el email almacenado internamente (no visible en UI) para enviar el correo.
   * El profesor nunca ve el email del alumno.
   */
  const handleEnviarAvisoAlumno = async () => {
    if (!alumnoSeleccionado) {
      setMensaje('Selecciona un alumno primero.');
      setTipoMensaje('error');
      return;
    }

    setLoadingAvisoAlumno(true);
    setMensaje('');
    setTipoMensaje('');

    const resultado = await enviarCorreoReal({
      to: alumnoSeleccionado.email,
      subject: 'Aviso de tu grupo en EnviaEso',
      html: `<p>Hola ${alumnoSeleccionado.nombre},</p><p>Este es un mensaje de aviso enviado por tu profesor desde <strong>EnviaEso</strong>.</p><p>Revisa tu grupo para ver si hay novedades o materiales disponibles.</p><p>---<br>Enviado desde EnviaEso</p>`,
      text: `Hola ${alumnoSeleccionado.nombre},\n\nEste es un mensaje de aviso enviado por tu profesor desde EnviaEso.\n\nRevisa tu grupo para ver si hay novedades o materiales disponibles.\n\n---\nEnviado desde EnviaEso`
    });

    if (resultado.success) {
      setMensaje(`Aviso enviado correctamente a ${alumnoSeleccionado.nombre}. ID: ${resultado.messageId}`);
      setTipoMensaje('success');
      setAlumnoSeleccionado(null); // Deseleccionar después de enviar
    } else {
      setMensaje(`Error al enviar aviso: ${resultado.error}`);
      setTipoMensaje('error');
    }

    setLoadingAvisoAlumno(false);
  };

  /**
   * Envía un aviso a todos los alumnos del grupo actualmente visible.
   * Pide confirmación previa indicando cuántos alumnos recibirán el aviso.
   * Envío secuencial con pausa breve entre cada email para no saturar.
   * Muestra resumen al finalizar: total, enviados, errores.
   * Los emails nunca se muestran en pantalla, solo los nombres.
   */
  const handleAvisarATodos = async () => {
    if (alumnos.length === 0) {
      setMensaje('No hay alumnos en este grupo para enviar avisos.');
      setTipoMensaje('error');
      return;
    }

    // Confirmación previa
    const confirmacion = window.confirm(
      `¿Estás seguro de que quieres enviar un aviso a todos los alumnos de este grupo?\n\n` +
      `Total de destinatarios: ${alumnos.length} alumno${alumnos.length !== 1 ? 's' : ''}\n\n` +
      `Se enviará un email a cada alumno usando su dirección registrada.`
    );

    if (!confirmacion) {
      return;
    }

    setLoadingAvisarATodos(true);
    setMensaje('Enviando avisos... Esto puede tardar unos segundos.');
    setTipoMensaje('');

    let enviados = 0;
    let errores = 0;
    const erroresDetalle = [];

    // Envío secuencial con pausa breve entre cada email
    for (const alumno of alumnos) {
      try {
        const resultado = await enviarCorreoReal({
          to: alumno.email,
          subject: 'Aviso de tu grupo en EnviaEso',
          html: `<p>Hola ${alumno.nombre},</p><p>Este es un mensaje de aviso enviado por tu profesor desde <strong>EnviaEso</strong>.</p><p>Revisa tu grupo para ver si hay novedades o materiales disponibles.</p><p>---<br>Enviado desde EnviaEso</p>`,
          text: `Hola ${alumno.nombre},\n\nEste es un mensaje de aviso enviado por tu profesor desde EnviaEso.\n\nRevisa tu grupo para ver si hay novedades o materiales disponibles.\n\n---\nEnviado desde EnviaEso`
        });

        if (resultado.success) {
          enviados++;
        } else {
          errores++;
          erroresDetalle.push(`${alumno.nombre}: ${resultado.error}`);
          console.error(`Error al enviar a ${alumno.nombre}:`, resultado.error);
        }

        // Pausa breve de 300ms entre envíos para no saturar Resend
        if (alumnos.indexOf(alumno) < alumnos.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      } catch (error) {
        errores++;
        erroresDetalle.push(`${alumno.nombre}: ${error.message}`);
        console.error(`Error inesperado al enviar a ${alumno.nombre}:`, error);
      }
    }

    // Resumen final
    let mensajeResumen = `Envío completado: ${enviados} enviado${enviados !== 1 ? 's' : ''}`;
    if (errores > 0) {
      mensajeResumen += `, ${errores} error${errores !== 1 ? 'es' : ''}`;
      console.error('Detalle de errores:', erroresDetalle);
    }
    mensajeResumen += ` de ${alumnos.length} total.`;

    setMensaje(mensajeResumen);
    setTipoMensaje(errores === 0 ? 'success' : 'error');
    setLoadingAvisarATodos(false);
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

      {/* Sección de prueba de email */}
      <section
        style={{
          marginTop: '24px',
          padding: '16px',
          backgroundColor: '#eff6ff',
          borderRadius: '12px',
          border: '1px solid #bfdbfe',
        }}
      >
        <h2 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e40af' }}>
          🧪 Prueba de email
        </h2>
        <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#3b82f6' }}>
          Envía un email de prueba para verificar que la configuración funciona.
        </p>
        <form onSubmit={handleEnviarEmailPrueba} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <input
            type="email"
            placeholder="tu-email@ejemplo.com"
            value={emailPrueba}
            onChange={(e) => setEmailPrueba(e.target.value)}
            disabled={loadingEmailPrueba}
            style={{
              flex: '1',
              minWidth: '200px',
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1px solid #bfdbfe',
              font: 'inherit',
            }}
          />
          <button
            type="submit"
            disabled={loadingEmailPrueba}
            style={{
              padding: '10px 16px',
              fontSize: '14px',
              minWidth: 'auto',
              backgroundColor: '#3b82f6',
              color: '#ffffff',
              border: '1px solid #2563eb',
            }}
          >
            {loadingEmailPrueba ? 'Enviando...' : 'Enviar prueba'}
          </button>
        </form>
      </section>

      <section style={{ marginTop: '32px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '16px',
          }}
        >
          <h2 style={{ margin: 0 }}>Tus grupos</h2>
          <button
            onClick={handleActualizar}
            disabled={loadingGrupos}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              minWidth: 'auto',
              backgroundColor: '#f2f4f7',
              color: '#344054',
              border: '1px solid #d0d5dd',
            }}
          >
            {loadingGrupos ? 'Actualizando...' : 'Actualizar'}
          </button>
        </div>

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
                      <strong>Código:</strong> {grupo.codigo}{' '}
                      <button
                        onClick={() => handleCopiarCodigo(grupo.codigo)}
                        disabled={loadingBorrado === grupo.id}
                        style={{
                          padding: '2px 8px',
                          fontSize: '12px',
                          minWidth: 'auto',
                          backgroundColor: '#f2f4f7',
                          color: '#344054',
                          border: '1px solid #d0d5dd',
                          borderRadius: '6px',
                          marginLeft: '4px',
                        }}
                      >
                        Copiar código
                      </button>
                      <button
                        onClick={() => handleCopiarInvitacion(grupo.codigo)}
                        disabled={loadingBorrado === grupo.id}
                        style={{
                          padding: '2px 8px',
                          fontSize: '12px',
                          minWidth: 'auto',
                          backgroundColor: '#e0f2fe',
                          color: '#0369a1',
                          border: '1px solid #7dd3fc',
                          borderRadius: '6px',
                          marginLeft: '8px',
                        }}
                      >
                        Copiar invitación
                      </button>
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

                            {/* Envío de aviso a todos los alumnos del grupo */}
                            <div
                              style={{
                                marginTop: '12px',
                                padding: '12px',
                                backgroundColor: '#fefce8',
                                borderRadius: '6px',
                                border: '1px solid #fde047',
                              }}
                            >
                              <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#854d0e' }}>
                                📢 Enviar aviso a todos:
                              </p>
                              <button
                                onClick={handleAvisarATodos}
                                disabled={loadingAvisarATodos}
                                style={{
                                  padding: '8px 16px',
                                  fontSize: '13px',
                                  minWidth: 'auto',
                                  backgroundColor: '#eab308',
                                  color: '#ffffff',
                                  border: '1px solid #ca8a04',
                                  borderRadius: '6px',
                                  width: '100%',
                                }}
                              >
                                {loadingAvisarATodos 
                                  ? 'Enviando a todos...' 
                                  : `Avisar a todos (${alumnos.length} alumno${alumnos.length !== 1 ? 's' : ''})`
                                }
                              </button>
                              <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#a16207' }}>
                                ⚠️ Se enviará un email a cada alumno usando su dirección registrada
                              </p>
                            </div>

                            {/* Envío de aviso a alumno individual (privacidad: solo nombre visible) */}
                            <div
                              style={{
                                marginTop: '12px',
                                padding: '12px',
                                backgroundColor: '#ffffff',
                                borderRadius: '6px',
                                border: '1px solid #d0d5dd',
                              }}
                            >
                              <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#667085' }}>
                                📧 Enviar aviso individual:
                              </p>
                              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                <select
                                  value={alumnoSeleccionado?.id || ''}
                                  onChange={(e) => {
                                    const alumno = alumnos.find((a) => a.id === e.target.value);
                                    setAlumnoSeleccionado(alumno || null);
                                  }}
                                  disabled={loadingAvisoAlumno || loadingAvisarATodos}
                                  style={{
                                    flex: '1',
                                    minWidth: '150px',
                                    padding: '8px 12px',
                                    borderRadius: '6px',
                                    border: '1px solid #d0d5dd',
                                    font: 'inherit',
                                    fontSize: '14px',
                                  }}
                                >
                                  <option value="">Seleccionar alumno...</option>
                                  {alumnos.map((alumno) => (
                                    <option key={alumno.id} value={alumno.id}>
                                      {alumno.nombre}
                                    </option>
                                  ))}
                                </select>
                                <button
                                  onClick={handleEnviarAvisoAlumno}
                                  disabled={!alumnoSeleccionado || loadingAvisoAlumno || loadingAvisarATodos}
                                  style={{
                                    padding: '8px 16px',
                                    fontSize: '13px',
                                    minWidth: 'auto',
                                    backgroundColor: '#3b82f6',
                                    color: '#ffffff',
                                    border: '1px solid #2563eb',
                                    borderRadius: '6px',
                                  }}
                                >
                                  {loadingAvisoAlumno ? 'Enviando...' : 'Enviar aviso'}
                                </button>
                              </div>
                              {alumnoSeleccionado && (
                                <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#059669' }}>
                                  ✓ Se enviará aviso a: {alumnoSeleccionado.nombre}
                                </p>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    {/* Botón Ver materiales */}
                    <button
                      onClick={() => {
                        if (grupoMaterialesAbierto === grupo.id) {
                          // Cerrar sección
                          setGrupoMaterialesAbierto(null);
                        } else {
                          // Abrir sección y cargar datos
                          setGrupoMaterialesAbierto(grupo.id);
                          cargarMateriales(grupo.id);
                        }
                      }}
                      disabled={loadingBorrado === grupo.id}
                      style={{
                        marginTop: '8px',
                        padding: '6px 12px',
                        fontSize: '13px',
                        minWidth: 'auto',
                        backgroundColor: '#f0fdf4',
                        color: '#166534',
                        border: '1px solid #86efac',
                      }}
                    >
                      {grupoMaterialesAbierto === grupo.id ? 'Ocultar materiales' : 'Ver materiales'}
                    </button>

                    {/* Sección expandible de materiales */}
                    {grupoMaterialesAbierto === grupo.id && (
                      <div
                        style={{
                          marginTop: '12px',
                          padding: '12px',
                          backgroundColor: '#f0fdf4',
                          borderRadius: '8px',
                          border: '1px solid #bbf7d0',
                        }}
                      >
                        <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#166534' }}>
                          Materiales de {grupo.nombre}
                        </h4>

                        {/* Input file oculto */}
                        <input
                          type="file"
                          ref={(el) => (fileInputRefs.current[grupo.id] = el)}
                          onChange={(e) => {
                            const archivo = e.target.files?.[0];
                            if (archivo) {
                              handleSubirArchivo(grupo.id, archivo);
                            }
                            e.target.value = '';
                          }}
                          style={{ display: 'none' }}
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                        />

                        {/* Botón subir archivo */}
                        <button
                          onClick={() => fileInputRefs.current[grupo.id]?.click()}
                          disabled={subiendoArchivo === grupo.id || loadingBorrado === grupo.id}
                          style={{
                            padding: '6px 12px',
                            fontSize: '13px',
                            minWidth: 'auto',
                            backgroundColor: '#ffffff',
                            color: '#166534',
                            border: '1px solid #86efac',
                            marginBottom: '12px',
                          }}
                        >
                          {subiendoArchivo === grupo.id ? 'Subiendo...' : '+ Subir archivo'}
                        </button>

                        {/* Mensaje de error inline */}
                        {errorMateriales[grupo.id] && (
                          <div
                            style={{
                              marginBottom: '12px',
                              padding: '8px 12px',
                              backgroundColor: '#fef2f2',
                              border: '1px solid #fecaca',
                              borderRadius: '6px',
                              color: '#dc2626',
                              fontSize: '13px',
                            }}
                          >
                            ⚠️ {errorMateriales[grupo.id]}
                            <br />
                            <span style={{ fontSize: '12px', color: '#991b1b' }}>
                              Puedes intentar subir archivos de todos modos.
                            </span>
                          </div>
                        )}

                        {/* Lista de materiales */}
                        {loadingMateriales[grupo.id] ? (
                          <p style={{ margin: 0, fontSize: '14px', color: '#667085' }}>
                            Cargando materiales...
                          </p>
                        ) : materialesPorGrupo[grupo.id]?.length === 0 ? (
                          <p style={{ margin: 0, fontSize: '14px', color: '#667085' }}>
                            Aún no hay materiales en este grupo.
                          </p>
                        ) : (
                          <ul
                            style={{
                              margin: 0,
                              padding: 0,
                              listStyle: 'none',
                              fontSize: '14px',
                            }}
                          >
                            {materialesPorGrupo[grupo.id]?.map((material) => (
                              <li
                                key={material.id}
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  padding: '8px 0',
                                  borderBottom: '1px solid #bbf7d0',
                                }}
                              >
                                <span style={{ color: '#344054' }}>
                                  📄 {material.nombre_archivo}{' '}
                                  <span style={{ color: '#6b7280', fontSize: '12px' }}>
                                    ({formatearTamaño(material.tamaño_bytes)})
                                  </span>
                                </span>
                                <button
                                  onClick={() => handleEliminarMaterial(grupo.id, material)}
                                  disabled={loadingBorrado === grupo.id}
                                  style={{
                                    padding: '4px 8px',
                                    fontSize: '12px',
                                    minWidth: 'auto',
                                    backgroundColor: '#fef2f2',
                                    color: '#dc2626',
                                    border: '1px solid #fecaca',
                                    borderRadius: '4px',
                                  }}
                                >
                                  Eliminar
                                </button>
                              </li>
                            ))}
                          </ul>
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