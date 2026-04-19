/**
 * Propósito:
 * Pantalla del panel del profesor para crear, editar, borrar y visualizar grupos.
 * Incluye vista de alumnos por grupo respetando privacidad (sin mostrar emails).
 * Muestra contador de alumnos por grupo visible en cada tarjeta.
 * Permite enviar avisos por email a alumnos individuales sin exponer sus direcciones.
 * Permite enviar avisos a todos los alumnos de un grupo ("Avisar a todos").
 *
 * Alcance:
 * Panel profesional para gestión completa de grupos y materiales.
 *
 * Decisiones:
 * - Usa autenticación real de Supabase Auth
 * - Genera un código automáticamente al crear grupo
 * - Lista los grupos del profesor autenticado
 * - Permite guardar una nota interna opcional por grupo
 * - Permite editar nombre y nota_interna de grupos existentes
 * - Permite borrar grupos con confirmación
 * - Permite ver alumnos de cada grupo sin exponer emails (solo nombre)
 * - Muestra contador de alumnos visible en cada tarjeta de grupo
 * - Permite enviar avisos reales a alumnos seleccionados por nombre (email oculto)
 * - Permite enviar avisos a todos los alumnos de un grupo ("Avisar a todos")
 * - Trazabilidad completa de envíos en BD
 * - Enlaces de acceso en emails usan VITE_APP_URL (con fallback a window.location.origin)
 *
 * Limitaciones:
 * - No se permite editar el código de grupo
 * - Vista de alumnos es de solo lectura
 * - El contador de alumnos se carga junto con los grupos (no en tiempo real)
 * - Envío grupal secuencial sin rate-limiting avanzado
 * - No hay tracking de aperturas ni descargas
 */

import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { generarCodigoGrupo } from '../utils/generarCodigoGrupo';
import {
  subirMaterial,
  eliminarMaterial,
  listarMaterialesPorGrupo,
  formatearTamaño,
} from '../services/storage';
import { 
  logoutProfesor, 
  obtenerUsuarioActual, 
  obtenerOCrearPerfilProfesor,
  actualizarPerfilProfesor,
} from '../services/auth';
import { enviarCorreoReal } from '../services/email';

export default function Panel() {
  const navigate = useNavigate();
  
  // Estado para el profesor autenticado
  const [profesor, setProfesor] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
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
  const [errorMateriales, setErrorMateriales] = useState({});
  const [subiendoArchivo, setSubiendoArchivo] = useState(null);
  
  // Estado separado para controlar visibilidad de la sección de materiales
  const [grupoMaterialesAbierto, setGrupoMaterialesAbierto] = useState(null);

  // Estado para envío de aviso a alumno individual
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState(null);
  const [loadingAvisoAlumno, setLoadingAvisoAlumno] = useState(false);

  // Estado para envío de aviso a todos los alumnos de un grupo
  const [loadingAvisarATodos, setLoadingAvisarATodos] = useState(false);

  // Estado para modal de confirmación de envío masivo
  const [modalConfirmacion, setModalConfirmacion] = useState({
    visible: false,
    titulo: '',
    mensaje: '',
    onConfirmar: null,
    onCancelar: null,
  });

  // Estado para último envío del grupo (trazabilidad mínima)
  const [ultimoEnvioGrupo, setUltimoEnvioGrupo] = useState({});

  // Estado para edición de perfil
  const [editandoPerfil, setEditandoPerfil] = useState(false);
  const [nombreEditado, setNombreEditado] = useState('');
  const [guardandoPerfil, setGuardandoPerfil] = useState(false);
  const [errorPerfil, setErrorPerfil] = useState(null);

  // Verificar autenticación al cargar y cargar datos del profesor desde BD
  useEffect(() => {
    const verificarAuth = async () => {
      const { user, error } = await obtenerUsuarioActual();
      
      if (error || !user) {
        console.log('[Panel] No hay sesión activa, redirigiendo a login');
        navigate('/login');
        return;
      }
      
      console.log('[Panel] Usuario autenticado:', user.id);
      
      // Usar la función de consistencia: obtener o crear perfil automáticamente
      const { data: perfilData, error: perfilError } = await obtenerOCrearPerfilProfesor(
        user.id, 
        user.email,
        user.user_metadata?.nombre || null
      );
      
      if (perfilError) {
        console.error('[Panel] Error al obtener/crear perfil:', perfilError.message);
        setErrorPerfil('No se pudo cargar tu perfil. Intenta recargar la página.');
        // Aún así permitimos acceso básico con datos de auth
        setProfesor({ ...user, nombre: null });
      } else {
        console.log('[Panel] Perfil cargado:', perfilData?.nombre || '(sin nombre)');
        // Combinar datos de auth con datos del perfil
        setProfesor({ ...user, ...perfilData });
      }
      
      setLoadingAuth(false);
    };
    
    verificarAuth();
  }, [navigate]);

  // Cargar grupos cuando tengamos el profesor
  useEffect(() => {
    if (profesor) {
      cargarGrupos();
    }
  }, [profesor]);

  const cargarGrupos = async () => {
    setLoadingGrupos(true);

    try {
      // Verificar que tenemos el profesor autenticado
      if (!profesor) {
        throw new Error('No hay profesor autenticado');
      }

      // 1. Cargar grupos del profesor autenticado
      const { data: gruposData, error: gruposError } = await supabase
        .from('grupos')
        .select('id, nombre, codigo, nota_interna, created_at')
        .eq('profesor_id', profesor.id)
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
      // Verificar que tenemos el profesor autenticado
      if (!profesor) {
        throw new Error('No hay profesor autenticado');
      }

      const codigo = generarCodigoGrupo();

      const { data, error } = await supabase
        .from('grupos')
        .insert([
          {
            profesor_id: profesor.id,
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

      setMensaje(`Grupo creado correctamente. Código: ${data.codigo}`);
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
        .eq('profesor_id', profesor?.id);

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
        .eq('profesor_id', profesor?.id);

      if (error) {
        throw error;
      }

      setMensaje('Grupo borrado correctamente.');
      setTipoMensaje('success');

      if (grupoEditando === grupo.id) {
        setGrupoEditando(null);
        setEditNombre('');
        setEditNota('');
      }

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

  const cargarAlumnos = async (grupoId) => {
    if (grupoAlumnosAbierto === grupoId) {
      setGrupoAlumnosAbierto(null);
      setAlumnos([]);
      return;
    }

    setGrupoAlumnosAbierto(grupoId);
    setLoadingAlumnos(true);
    setAlumnos([]);
    setAlumnoSeleccionado(null);

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
      await cargarUltimoEnvio(grupoId);
    } catch (error) {
      console.error('Error al cargar alumnos:', error);
      setMensaje('No se pudieron cargar los alumnos.');
      setTipoMensaje('error');
      setGrupoAlumnosAbierto(null);
      setAlumnos([]);
    } finally {
      setLoadingAlumnos(false);
    }
  };

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

  const handleActualizar = async () => {
    setMensaje('');
    setTipoMensaje('');
    await cargarGrupos();
    if (grupoAlumnosAbierto) {
      await recargarAlumnosAbierto();
    }
    setMensaje('Información actualizada.');
    setTipoMensaje('success');
  };

  const cargarMateriales = async (grupoId) => {
    setLoadingMateriales((prev) => ({ ...prev, [grupoId]: true }));
    setErrorMateriales((prev) => ({ ...prev, [grupoId]: null }));
    
    try {
      const { data, error } = await listarMaterialesPorGrupo(grupoId);
      if (error) {
        throw new Error(error);
      }
      setMaterialesPorGrupo((prev) => ({ ...prev, [grupoId]: data || [] }));
      console.log(`[Materiales] Cargados ${data?.length || 0} materiales para grupo ${grupoId}`);
    } catch (error) {
      console.error('[Materiales] Error al cargar materiales:', error);
      setErrorMateriales((prev) => ({ 
        ...prev, 
        [grupoId]: error.message || 'Error al cargar materiales' 
      }));
      setMaterialesPorGrupo((prev) => ({ ...prev, [grupoId]: [] }));
    } finally {
      setLoadingMateriales((prev) => ({ ...prev, [grupoId]: false }));
    }
  };

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

  const fileInputRefs = useRef({});

  const generarEnlaceAcceso = (codigoGrupo, emailAlumno) => {
    const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;
    const params = new URLSearchParams({
      codigo: codigoGrupo,
      email: emailAlumno,
    });
    return `${baseUrl}/acceso-alumno?${params.toString()}`;
  };

  const generarContenidoEmail = (nombreAlumno, nombreGrupo, nombreProfesor, codigoGrupo, emailAlumno) => {
    const enlaceAcceso = generarEnlaceAcceso(codigoGrupo, emailAlumno);
    
    const html = `
      <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <h2 style="color: #1570ef; margin-bottom: 20px;">📚 Hay nuevo material disponible</h2>
        
        <p>Hola ${nombreAlumno},</p>
        
        <p><strong>${nombreProfesor}</strong> ha compartido nuevo material en tu grupo <strong>"${nombreGrupo}"</strong> a través de <strong>EnviaEso</strong>.</p>
        
        <div style="background: #f0f9ff; border-left: 4px solid #1570ef; padding: 16px; margin: 20px 0;">
          <p style="margin: 0 0 12px 0;">Puedes acceder a tus materiales aquí:</p>
          <a href="${enlaceAcceso}" style="display: inline-block; background: #1570ef; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 500;">Ver mis materiales</a>
        </div>
        
        <p style="color: #667085; font-size: 14px;">O copia y pega este enlace en tu navegador:<br>${enlaceAcceso}</p>
        
        <hr style="border: none; border-top: 1px solid #e4e7ec; margin: 24px 0;">
        
        <p style="color: #667085; font-size: 13px; margin: 0;">
          Enviado desde EnviaEso • <a href="${import.meta.env.VITE_APP_URL || window.location.origin}" style="color: #1570ef;">enviaeso.com</a>
        </p>
      </div>
    `;

    const text = `Hola ${nombreAlumno},

${nombreProfesor} ha compartido nuevo material en tu grupo "${nombreGrupo}" a través de EnviaEso.

Puedes acceder a tus materiales aquí:
${enlaceAcceso}

---
Enviado desde EnviaEso • enviaeso.com`;

    return { html, text, enlaceAcceso };
  };

  const handleEnviarAvisoAlumno = async () => {
    if (!alumnoSeleccionado) {
      setMensaje('Selecciona un alumno primero.');
      setTipoMensaje('error');
      return;
    }

    const grupoActual = grupos.find(g => g.id === grupoAlumnosAbierto);
    if (!grupoActual) {
      setMensaje('Error: no se encontró el grupo.');
      setTipoMensaje('error');
      return;
    }

    setLoadingAvisoAlumno(true);
    setMensaje('');
    setTipoMensaje('');

    let trazabilidadOk = false;
    let errorTrazabilidad = null;

    try {
      const { html, text } = generarContenidoEmail(
        alumnoSeleccionado.nombre,
        grupoActual.nombre,
        profesor?.nombre || 'Tu profesor',
        grupoActual.codigo,
        alumnoSeleccionado.email
      );

      const resultado = await enviarCorreoReal({
        to: alumnoSeleccionado.email,
        subject: `Nuevo material en ${grupoActual.nombre} - EnviaEso`,
        html,
        text
      });

      try {
        console.log('[Trazabilidad Individual] Intentando registrar envío...');
        console.log('[Trazabilidad Individual] Éxito del envío:', resultado.success);
        
        const { data: envioCreado, error: envioError } = await supabase
          .from('envios')
          .insert({
            grupo_id: grupoAlumnosAbierto,
            descripcion_opcional: `Envío individual: ${resultado.success ? 'ok' : 'error'}`,
            fecha_envio: new Date().toISOString(),
          })
          .select()
          .single();

        if (envioError) {
          console.error('[Trazabilidad Individual] Error al insertar en envios:', envioError);
          throw envioError;
        }

        console.log('[Trazabilidad Individual] Envío creado con ID:', envioCreado?.id);

        const estadoValor = resultado.success ? 'enviado' : 'error';
        console.log('[Trazabilidad Individual] Valor de estado a insertar:', estadoValor);
        
        const { error: destinatarioError } = await supabase
          .from('envios_alumnos')
          .insert({
            envio_id: envioCreado.id,
            alumno_id: alumnoSeleccionado.id,
            estado: estadoValor,
          });

        if (destinatarioError) {
          console.error('[Trazabilidad Individual] Error al insertar en envios_alumnos:', destinatarioError);
          throw destinatarioError;
        }

        trazabilidadOk = true;
        console.log('[Trazabilidad Individual] ✓ Registrado correctamente');
        
        await cargarUltimoEnvio(grupoAlumnosAbierto);
      } catch (errorTraz) {
        errorTrazabilidad = errorTraz;
        console.error('[Trazabilidad Individual] ✗ Error:', errorTraz);
      }

      if (resultado.success) {
        setMensaje(`Aviso enviado correctamente a ${alumnoSeleccionado.nombre}. ID: ${resultado.messageId}${trazabilidadOk ? ' ✓ Registrado en BD.' : ' ⚠️ Error al registrar en BD.'}`);
        setTipoMensaje('success');
        setAlumnoSeleccionado(null);
      } else {
        setMensaje(`Error al enviar aviso: ${resultado.error}${errorTrazabilidad ? ' | Error BD: ' + errorTrazabilidad.message : ''}`);
        setTipoMensaje('error');
      }
    } catch (error) {
      console.error('[handleEnviarAvisoAlumno] Error inesperado:', error);
      setMensaje('Error inesperado al enviar el aviso. Inténtalo de nuevo.');
      setTipoMensaje('error');
    } finally {
      setLoadingAvisoAlumno(false);
    }
  };

  const cargarUltimoEnvio = async (grupoId) => {
    try {
      console.log(`[Trazabilidad] Cargando último envío para grupo ${grupoId}...`);
      
      const { data: envioData, error: envioError } = await supabase
        .from('envios')
        .select('id, fecha_envio, descripcion_opcional')
        .eq('grupo_id', grupoId)
        .order('fecha_envio', { ascending: false })
        .limit(1)
        .single();

      if (envioError) {
        if (envioError.code === 'PGRST116') {
          console.log(`[Trazabilidad] No hay envíos registrados para grupo ${grupoId}`);
        } else {
          console.error('[Trazabilidad] Error al cargar último envío:', envioError);
        }
        setUltimoEnvioGrupo((prev) => ({ ...prev, [grupoId]: null }));
        return;
      }

      console.log(`[Trazabilidad] Último envío encontrado: ${envioData.id}`);

      const { count: totalDestinatarios, error: countError } = await supabase
        .from('envios_alumnos')
        .select('*', { count: 'exact', head: true })
        .eq('envio_id', envioData.id);

      if (countError) {
        console.error('[Trazabilidad] Error al contar destinatarios:', countError);
      }

      setUltimoEnvioGrupo((prev) => ({
        ...prev,
        [grupoId]: {
          ...envioData,
          totalDestinatarios: totalDestinatarios || 0,
        },
      }));
    } catch (error) {
      console.error('[Trazabilidad] Error inesperado al cargar último envío:', error);
      setUltimoEnvioGrupo((prev) => ({ ...prev, [grupoId]: null }));
    }
  };

  // Función para mostrar modal de confirmación
  const mostrarModalConfirmacion = (titulo, mensaje, onConfirmar) => {
    setModalConfirmacion({
      visible: true,
      titulo,
      mensaje,
      onConfirmar,
      onCancelar: () => setModalConfirmacion(prev => ({ ...prev, visible: false })),
    });
  };

  // Función para cerrar modal
  const cerrarModalConfirmacion = () => {
    setModalConfirmacion(prev => ({ ...prev, visible: false }));
  };

  const handleAvisarATodos = async () => {
    if (alumnos.length === 0) {
      setMensaje('No hay alumnos en este grupo para enviar avisos.');
      setTipoMensaje('error');
      return;
    }

    const grupoActual = grupos.find(g => g.id === grupoAlumnosAbierto);
    if (!grupoActual) {
      setMensaje('Error: no se encontró el grupo.');
      setTipoMensaje('error');
      return;
    }

    // Mostrar modal de confirmación en lugar de window.confirm
    mostrarModalConfirmacion(
      'Confirmar envío masivo',
      `Vas a enviar un aviso a todos los alumnos de este grupo.\n\n` +
      `Grupo: ${grupoActual.nombre}\n` +
      `Total de destinatarios: ${alumnos.length} alumno${alumnos.length !== 1 ? 's' : ''}\n\n` +
      `Se enviará un email personalizado a cada alumno con un enlace directo a sus materiales.`,
      () => {
        cerrarModalConfirmacion();
        ejecutarEnvioMasivo(grupoActual);
      }
    );
  };

  const ejecutarEnvioMasivo = async (grupoActual) => {
    setLoadingAvisarATodos(true);
    setMensaje('Enviando avisos... Esto puede tardar unos segundos.');
    setTipoMensaje('');

    let enviados = 0;
    let errores = 0;
    const erroresDetalle = [];
    const resultadosPorAlumno = [];

    for (const alumno of alumnos) {
      try {
        const { html, text } = generarContenidoEmail(
          alumno.nombre,
          grupoActual.nombre,
          profesor?.nombre || 'Tu profesor',
          grupoActual.codigo,
          alumno.email
        );

        const resultado = await enviarCorreoReal({
          to: alumno.email,
          subject: `Nuevo material en ${grupoActual.nombre} - EnviaEso`,
          html,
          text
        });

        resultadosPorAlumno.push({
          alumnoId: alumno.id,
          exito: resultado.success,
          error: resultado.error || null,
        });

        if (resultado.success) {
          enviados++;
        } else {
          errores++;
          erroresDetalle.push(`${alumno.nombre}: ${resultado.error}`);
        }

        if (alumnos.indexOf(alumno) < alumnos.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      } catch (error) {
        errores++;
        resultadosPorAlumno.push({
          alumnoId: alumno.id,
          exito: false,
          error: error.message,
        });
        erroresDetalle.push(`${alumno.nombre}: ${error.message}`);
      }
    }

    let trazabilidadOk = false;
    let errorTrazabilidad = null;
    
    try {
      const grupoId = grupoAlumnosAbierto;
      
      const { data: envioCreado, error: envioError } = await supabase
        .from('envios')
        .insert({
          grupo_id: grupoId,
          descripcion_opcional: `Envío grupal: ${enviados} ok, ${errores} errores`,
          fecha_envio: new Date().toISOString(),
        })
        .select()
        .single();

      if (envioError) {
        throw new Error(`Error en tabla envios: ${envioError.message}`);
      }

      const registrosAlumnos = resultadosPorAlumno.map((resultado) => ({
        envio_id: envioCreado.id,
        alumno_id: resultado.alumnoId,
        estado: resultado.exito ? 'enviado' : 'error',
      }));

      const { error: destinatariosError } = await supabase
        .from('envios_alumnos')
        .insert(registrosAlumnos);

      if (destinatariosError) {
        throw new Error(`Error en tabla envios_alumnos: ${destinatariosError.message}`);
      }

      await cargarUltimoEnvio(grupoId);
      
      trazabilidadOk = true;
    } catch (error) {
      errorTrazabilidad = error;
      console.error('[Trazabilidad] Error:', error);
    } finally {
      setLoadingAvisarATodos(false);
    }

    let mensajeResumen = `Envío completado: ${enviados} enviado${enviados !== 1 ? 's' : ''}`;
    if (errores > 0) {
      mensajeResumen += `, ${errores} error${errores !== 1 ? 'es' : ''}`;
    }
    mensajeResumen += ` de ${alumnos.length} total.`;
    
    if (trazabilidadOk) {
      mensajeResumen += ' ✓ Registrado en BD.';
    } else if (errorTrazabilidad) {
      mensajeResumen += ' ⚠️ Error al registrar en BD.';
    }

    setMensaje(mensajeResumen);
    setTipoMensaje(errores === 0 && trazabilidadOk ? 'success' : 'error');
  };

  const handleLogout = async () => {
    const { error } = await logoutProfesor();
    if (!error) {
      navigate('/login');
    }
  };

  const handleEditarPerfil = () => {
    setNombreEditado(profesor?.nombre || '');
    setEditandoPerfil(true);
    setErrorPerfil(null);
  };

  const handleCancelarEdicionPerfil = () => {
    setEditandoPerfil(false);
    setNombreEditado('');
    setErrorPerfil(null);
  };

  const handleGuardarPerfil = async () => {
    const nombreNormalizado = nombreEditado.trim();
    
    if (!nombreNormalizado) {
      setErrorPerfil('El nombre no puede estar vacío.');
      return;
    }

    setGuardandoPerfil(true);
    setErrorPerfil(null);

    const { data, error } = await actualizarPerfilProfesor(profesor.id, {
      nombre: nombreNormalizado,
    });

    if (error) {
      setErrorPerfil('No se pudo guardar el perfil. Inténtalo de nuevo.');
    } else {
      setProfesor((prev) => ({ ...prev, nombre: data.nombre }));
      setEditandoPerfil(false);
      setMensaje('Perfil actualizado correctamente.');
      setTipoMensaje('success');
    }

    setGuardandoPerfil(false);
  };

  if (loadingAuth) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '48px' }}>
        <p>Cargando...</p>
      </div>
    );
  }

  if (errorPerfil && !profesor) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '48px' }}>
        <h1>Error al cargar perfil</h1>
        <p style={{ color: '#b42318' }}>{errorPerfil}</p>
        <button onClick={handleLogout} style={{ marginTop: '16px' }}>
          Cerrar sesión y reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '900px' }}>
      {/* Header */}
      <div
        style={{
          marginBottom: '32px',
          padding: '24px',
          backgroundColor: '#f0f9ff',
          borderRadius: '16px',
          border: '1px solid #bae6fd',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '8px',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: '#1570ef',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                }}
              >
                👨‍🏫
              </div>
              <div>
                <h1 style={{ margin: '0 0 4px 0', fontSize: '24px', fontWeight: '700', color: '#101828' }}>
                  Panel del profesor
                </h1>
                <p style={{ margin: 0, color: '#667085', fontSize: '14px' }}>
                  Gestiona tus grupos y materiales
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              padding: '10px 20px',
              fontSize: '14px',
              minWidth: 'auto',
              backgroundColor: '#ffffff',
              color: '#344054',
              border: '1px solid #d0d5dd',
            }}
          >
            Cerrar sesión
          </button>
        </div>

        {/* Saludo y perfil */}
        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #bae6fd' }}>
          {editandoPerfil ? (
            <div
              style={{
                display: 'flex',
                gap: '12px',
                flexWrap: 'wrap',
                alignItems: 'center',
              }}
            >
              <input
                type="text"
                value={nombreEditado}
                onChange={(e) => setNombreEditado(e.target.value)}
                placeholder="Tu nombre"
                disabled={guardandoPerfil}
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #d0d5dd',
                  fontSize: '14px',
                  minWidth: '200px',
                }}
              />
              <button
                onClick={handleGuardarPerfil}
                disabled={guardandoPerfil}
                style={{ padding: '10px 20px', fontSize: '14px' }}
              >
                {guardandoPerfil ? 'Guardando...' : 'Guardar'}
              </button>
              <button
                onClick={handleCancelarEdicionPerfil}
                disabled={guardandoPerfil}
                style={{
                  padding: '10px 20px',
                  fontSize: '14px',
                  backgroundColor: '#f2f4f7',
                  color: '#344054',
                }}
              >
                Cancelar
              </button>
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                flexWrap: 'wrap',
              }}
            >
              <p style={{ margin: 0, color: '#344054', fontSize: '16px' }}>
                {profesor?.nombre ? (
                  <>
                    Hola, <strong>{profesor.nombre}</strong>. Bienvenido a tu panel.
                  </>
                ) : (
                  'Bienvenido. Completa tu perfil para personalizar los emails.'
                )}
              </p>
              <button
                onClick={handleEditarPerfil}
                style={{
                  padding: '6px 14px',
                  fontSize: '13px',
                  minWidth: 'auto',
                  backgroundColor: 'transparent',
                  color: '#1570ef',
                  border: '1px solid #1570ef',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                {profesor?.nombre ? 'Editar perfil' : 'Completar perfil'}
              </button>
            </div>
          )}
          {errorPerfil && (
            <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#b42318' }}>
              {errorPerfil}
            </p>
          )}
        </div>
      </div>

      {/* Mensaje de feedback global */}
      {mensaje && (
        <div
          style={{
            marginBottom: '24px',
            padding: '16px 20px',
            borderRadius: '12px',
            backgroundColor: tipoMensaje === 'error' ? '#fef2f2' : '#f0fdf4',
            border: `1px solid ${tipoMensaje === 'error' ? '#fecaca' : '#86efac'}`,
          }}
        >
          <p
            style={{
              margin: 0,
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

      {/* Formulario crear grupo */}
      <div
        style={{
          marginBottom: '32px',
          padding: '24px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e4e7ec',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        }}
      >
        <h2 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600', color: '#101828' }}>
          Crear nuevo grupo
        </h2>
        <p style={{ margin: '0 0 20px 0', color: '#667085', fontSize: '14px' }}>
          Crea un grupo para tus alumnos. Se generará un código único automáticamente.
        </p>

        <form onSubmit={handleCrearGrupo}>
          <div style={{ marginBottom: '16px' }}>
            <label
              htmlFor="nombreGrupo"
              style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#344054',
              }}
            >
              Nombre del grupo
            </label>
            <input
              id="nombreGrupo"
              type="text"
              placeholder="Ej: 2º Bachillerato - Matemáticas"
              value={nombreGrupo}
              onChange={(e) => setNombreGrupo(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label
              htmlFor="notaInterna"
              style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#344054',
              }}
            >
              Nota interna <span style={{ color: '#667085', fontWeight: '400' }}>(opcional)</span>
            </label>
            <textarea
              id="notaInterna"
              placeholder="Notas para ti sobre este grupo..."
              value={notaInterna}
              onChange={(e) => setNotaInterna(e.target.value)}
              rows={3}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '8px',
                border: '1px solid #d0d5dd',
                resize: 'vertical',
                font: 'inherit',
              }}
            />
          </div>

          <button type="submit" disabled={loading} style={{ padding: '12px 24px' }}>
            {loading ? 'Creando grupo...' : 'Crear grupo'}
          </button>
        </form>
      </div>

      {/* Lista de grupos */}
      <section>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '20px',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: '#101828' }}>
            Tus grupos
          </h2>
          <button
            onClick={handleActualizar}
            disabled={loadingGrupos}
            style={{
              padding: '10px 20px',
              fontSize: '14px',
              minWidth: 'auto',
              backgroundColor: '#f9fafb',
              color: '#344054',
              border: '1px solid #d0d5dd',
            }}
          >
            {loadingGrupos ? 'Actualizando...' : '↻ Actualizar'}
          </button>
        </div>

        {loadingGrupos ? (
          <div style={{ textAlign: 'center', padding: '48px' }}>
            <p style={{ color: '#667085' }}>Cargando grupos...</p>
          </div>
        ) : grupos.length === 0 ? (
          <div
            style={{
              padding: '48px 24px',
              backgroundColor: '#f9fafb',
              borderRadius: '16px',
              textAlign: 'center',
              border: '1px solid #e4e7ec',
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📚</div>
            <p style={{ color: '#344054', fontSize: '18px', fontWeight: '500', margin: '0 0 8px 0' }}>
              Aún no tienes grupos
            </p>
            <p style={{ color: '#667085', fontSize: '14px', margin: 0 }}>
              Crea tu primer grupo arriba para empezar.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {grupos.map((grupo) => (
              <div
                key={grupo.id}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  border: '1px solid #e4e7ec',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                  overflow: 'hidden',
                }}
              >
                {/* Header de la tarjeta */}
                <div
                  style={{
                    padding: '20px',
                    backgroundColor: grupoEditando === grupo.id ? '#f0f9ff' : '#ffffff',
                    borderLeft: grupoEditando === grupo.id ? '4px solid #1570ef' : 'none',
                  }}
                >
                  {grupoEditando === grupo.id ? (
                    // Modo edición
                    <div>
                      <div style={{ marginBottom: '12px' }}>
                        <label
                          style={{
                            display: 'block',
                            marginBottom: '4px',
                            fontSize: '13px',
                            fontWeight: '500',
                            color: '#344054',
                          }}
                        >
                          Nombre
                        </label>
                        <input
                          type="text"
                          value={editNombre}
                          onChange={(e) => setEditNombre(e.target.value)}
                          placeholder="Nombre del grupo"
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            borderRadius: '8px',
                            border: '1px solid #d0d5dd',
                            font: 'inherit',
                            fontWeight: '500',
                          }}
                        />
                      </div>

                      <div style={{ marginBottom: '16px' }}>
                        <label
                          style={{
                            display: 'block',
                            marginBottom: '4px',
                            fontSize: '13px',
                            fontWeight: '500',
                            color: '#344054',
                          }}
                        >
                          Nota interna
                        </label>
                        <textarea
                          value={editNota}
                          onChange={(e) => setEditNota(e.target.value)}
                          placeholder="Nota interna opcional"
                          rows={2}
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            borderRadius: '8px',
                            border: '1px solid #d0d5dd',
                            resize: 'vertical',
                            font: 'inherit',
                          }}
                        />
                      </div>

                      <p
                        style={{
                          margin: '0 0 16px 0',
                          color: '#667085',
                          fontSize: '14px',
                        }}
                      >
                        <strong>Código:</strong>{' '}
                        <code
                          style={{
                            backgroundColor: '#f2f4f7',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '13px',
                          }}
                        >
                          {grupo.codigo}
                        </code>
                      </p>

                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => handleGuardarEdicion(grupo.id)}
                          disabled={loadingEdicion}
                          style={{ padding: '10px 20px', fontSize: '14px' }}
                        >
                          {loadingEdicion ? 'Guardando...' : 'Guardar cambios'}
                        </button>
                        <button
                          onClick={handleCancelarEdicion}
                          disabled={loadingEdicion}
                          style={{
                            padding: '10px 20px',
                            fontSize: '14px',
                            backgroundColor: '#f2f4f7',
                            color: '#344054',
                          }}
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Modo visualización
                    <div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          gap: '12px',
                          flexWrap: 'wrap',
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h3
                            style={{
                              margin: '0 0 8px 0',
                              fontSize: '18px',
                              fontWeight: '600',
                              color: '#101828',
                            }}
                          >
                            {grupo.nombre}
                          </h3>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              flexWrap: 'wrap',
                              marginBottom: '8px',
                            }}
                          >
                            <span
                              style={{
                                backgroundColor: '#f0f9ff',
                                color: '#0369a1',
                                padding: '4px 10px',
                                borderRadius: '20px',
                                fontSize: '13px',
                                fontWeight: '500',
                              }}
                            >
                              {conteoAlumnos[grupo.id] || 0} alumno{(conteoAlumnos[grupo.id] || 0) !== 1 ? 's' : ''}
                            </span>
                            <code
                              style={{
                                backgroundColor: '#f2f4f7',
                                color: '#344054',
                                padding: '4px 10px',
                                borderRadius: '6px',
                                fontSize: '13px',
                              }}
                            >
                              Código: {grupo.codigo}
                            </code>
                          </div>
                          {grupo.nota_interna && (
                            <p
                              style={{
                                margin: '8px 0 0 0',
                                color: '#667085',
                                fontSize: '14px',
                                fontStyle: 'italic',
                              }}
                            >
                              📝 {grupo.nota_interna}
                            </p>
                          )}
                        </div>

                        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                          <button
                            onClick={() => handleEditarClick(grupo)}
                            disabled={loadingBorrado === grupo.id}
                            style={{
                              padding: '8px 16px',
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
                              padding: '8px 16px',
                              fontSize: '13px',
                              minWidth: 'auto',
                              backgroundColor: '#fef3f2',
                              color: '#b42318',
                              border: '1px solid #fda29b',
                            }}
                          >
                            {loadingBorrado === grupo.id ? 'Borrando...' : 'Borrar'}
                          </button>
                        </div>
                      </div>

                      {/* Botones de acción */}
                      <div
                        style={{
                          marginTop: '16px',
                          paddingTop: '16px',
                          borderTop: '1px solid #e4e7ec',
                          display: 'flex',
                          gap: '8px',
                          flexWrap: 'wrap',
                        }}
                      >
                        <button
                          onClick={() => handleCopiarCodigo(grupo.codigo)}
                          disabled={loadingBorrado === grupo.id}
                          style={{
                            padding: '8px 16px',
                            fontSize: '13px',
                            minWidth: 'auto',
                            backgroundColor: '#f2f4f7',
                            color: '#344054',
                            border: '1px solid #d0d5dd',
                          }}
                        >
                          📋 Copiar código
                        </button>
                        <button
                          onClick={() => handleCopiarInvitacion(grupo.codigo)}
                          disabled={loadingBorrado === grupo.id}
                          style={{
                            padding: '8px 16px',
                            fontSize: '13px',
                            minWidth: 'auto',
                            backgroundColor: '#e0f2fe',
                            color: '#0369a1',
                            border: '1px solid #7dd3fc',
                          }}
                        >
                          📨 Copiar invitación
                        </button>
                        <button
                          onClick={() => cargarAlumnos(grupo.id)}
                          disabled={loadingBorrado === grupo.id}
                          style={{
                            padding: '8px 16px',
                            fontSize: '13px',
                            minWidth: 'auto',
                            backgroundColor: grupoAlumnosAbierto === grupo.id ? '#f0f9ff' : '#f9fafb',
                            color: grupoAlumnosAbierto === grupo.id ? '#0369a1' : '#344054',
                            border: '1px solid #d0d5dd',
                          }}
                        >
                          {grupoAlumnosAbierto === grupo.id ? 'Ocultar alumnos' : 'Ver alumnos'}
                        </button>
                        <button
                          onClick={() => {
                            if (grupoMaterialesAbierto === grupo.id) {
                              setGrupoMaterialesAbierto(null);
                            } else {
                              setGrupoMaterialesAbierto(grupo.id);
                              cargarMateriales(grupo.id);
                            }
                          }}
                          disabled={loadingBorrado === grupo.id}
                          style={{
                            padding: '8px 16px',
                            fontSize: '13px',
                            minWidth: 'auto',
                            backgroundColor: grupoMaterialesAbierto === grupo.id ? '#f0fdf4' : '#f9fafb',
                            color: grupoMaterialesAbierto === grupo.id ? '#166534' : '#344054',
                            border: '1px solid #d0d5dd',
                          }}
                        >
                          {grupoMaterialesAbierto === grupo.id ? 'Ocultar materiales' : 'Ver materiales'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Sección expandible de alumnos */}
                {grupoAlumnosAbierto === grupo.id && (
                  <div
                    style={{
                      padding: '20px',
                      backgroundColor: '#f9fafb',
                      borderTop: '1px solid #e4e7ec',
                    }}
                  >
                    <h4
                      style={{
                        margin: '0 0 16px 0',
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#344054',
                      }}
                    >
                      👥 Alumnos de {grupo.nombre}
                    </h4>

                    {loadingAlumnos ? (
                      <p style={{ color: '#667085' }}>Cargando alumnos...</p>
                    ) : alumnos.length === 0 ? (
                      <div
                        style={{
                          padding: '24px',
                          backgroundColor: '#ffffff',
                          borderRadius: '12px',
                          textAlign: 'center',
                        }}
                      >
                        <p style={{ color: '#667085', margin: 0 }}>
                          Aún no hay alumnos en este grupo.
                        </p>
                        <p style={{ color: '#667085', fontSize: '13px', margin: '8px 0 0 0' }}>
                          Comparte el código del grupo para que se unan.
                        </p>
                      </div>
                    ) : (
                      <>
                        <p
                          style={{
                            margin: '0 0 16px 0',
                            fontSize: '14px',
                            color: '#667085',
                          }}
                        >
                          Total: <strong>{alumnos.length}</strong> alumno{alumnos.length !== 1 ? 's' : ''}
                        </p>

                        {/* Lista de alumnos */}
                        <div
                          style={{
                            display: 'grid',
                            gap: '8px',
                            marginBottom: '20px',
                          }}
                        >
                          {alumnos.map((alumno) => (
                            <div
                              key={alumno.id}
                              style={{
                                padding: '12px 16px',
                                backgroundColor: '#ffffff',
                                borderRadius: '8px',
                                border: '1px solid #e4e7ec',
                              }}
                            >
                              <span style={{ color: '#344054' }}>{alumno.nombre}</span>
                            </div>
                          ))}
                        </div>

                        {/* Último envío */}
                        {ultimoEnvioGrupo[grupo.id] && (
                          <div
                            style={{
                              marginBottom: '20px',
                              padding: '16px',
                              backgroundColor: '#f0f9ff',
                              borderRadius: '8px',
                              border: '1px solid #bae6fd',
                            }}
                          >
                            <p
                              style={{
                                margin: '0 0 8px 0',
                                fontSize: '13px',
                                color: '#0369a1',
                                fontWeight: '500',
                              }}
                            >
                              📨 Último envío
                            </p>
                            <p
                              style={{
                                margin: '0 0 4px 0',
                                fontSize: '14px',
                                color: '#0c4a6e',
                              }}
                            >
                              {new Date(ultimoEnvioGrupo[grupo.id].fecha_envio).toLocaleString('es-ES', {
                                day: 'numeric',
                                month: 'long',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                            <p style={{ margin: 0, fontSize: '13px', color: '#075985' }}>
                              {ultimoEnvioGrupo[grupo.id].descripcion_opcional} •{' '}
                              {ultimoEnvioGrupo[grupo.id].totalDestinatarios} destinatario
                              {ultimoEnvioGrupo[grupo.id].totalDestinatarios !== 1 ? 's' : ''}
                            </p>
                          </div>
                        )}

                        {/* Envío grupal */}
                        <div
                          style={{
                            marginBottom: '20px',
                            padding: '16px',
                            backgroundColor: '#fefce8',
                            borderRadius: '8px',
                            border: '1px solid #fde047',
                          }}
                        >
                          <p
                            style={{
                              margin: '0 0 12px 0',
                              fontSize: '14px',
                              color: '#854d0e',
                              fontWeight: '500',
                            }}
                          >
                            📢 Enviar aviso a todos
                          </p>
                          <button
                            onClick={handleAvisarATodos}
                            disabled={loadingAvisarATodos}
                            style={{
                              width: '100%',
                              padding: '12px 20px',
                              fontSize: '14px',
                              fontWeight: '600',
                              backgroundColor: '#eab308',
                              color: '#ffffff',
                              border: '1px solid #ca8a04',
                            }}
                          >
                            {loadingAvisarATodos
                              ? 'Enviando...'
                              : `Avisar a todos (${alumnos.length} alumno${alumnos.length !== 1 ? 's' : ''})`}
                          </button>
                          <p
                            style={{
                              margin: '12px 0 0 0',
                              fontSize: '12px',
                              color: '#a16207',
                            }}
                          >
                            Se enviará un email personalizado a cada alumno.
                          </p>
                        </div>

                        {/* Envío individual */}
                        <div
                          style={{
                            padding: '16px',
                            backgroundColor: '#ffffff',
                            borderRadius: '8px',
                            border: '1px solid #e4e7ec',
                          }}
                        >
                          <p
                            style={{
                              margin: '0 0 12px 0',
                              fontSize: '14px',
                              color: '#344054',
                              fontWeight: '500',
                            }}
                          >
                            📧 Enviar aviso individual
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
                                padding: '10px 14px',
                                borderRadius: '8px',
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
                                padding: '10px 20px',
                                fontSize: '14px',
                                minWidth: 'auto',
                              }}
                            >
                              {loadingAvisoAlumno ? 'Enviando...' : 'Enviar'}
                            </button>
                          </div>
                          {alumnoSeleccionado && (
                            <p
                              style={{
                                margin: '12px 0 0 0',
                                fontSize: '13px',
                                color: '#059669',
                              }}
                            >
                              ✓ Se enviará aviso a: <strong>{alumnoSeleccionado.nombre}</strong>
                            </p>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Sección expandible de materiales */}
                {grupoMaterialesAbierto === grupo.id && (
                  <div
                    style={{
                      padding: '20px',
                      backgroundColor: '#f0fdf4',
                      borderTop: '1px solid #e4e7ec',
                    }}
                  >
                    <h4
                      style={{
                        margin: '0 0 16px 0',
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#166534',
                      }}
                    >
                      📦 Materiales de {grupo.nombre}
                    </h4>

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

                    <button
                      onClick={() => fileInputRefs.current[grupo.id]?.click()}
                      disabled={subiendoArchivo === grupo.id || loadingBorrado === grupo.id}
                      style={{
                        marginBottom: '16px',
                        padding: '10px 20px',
                        fontSize: '14px',
                        minWidth: 'auto',
                        backgroundColor: '#ffffff',
                        color: '#166534',
                        border: '1px solid #86efac',
                      }}
                    >
                      {subiendoArchivo === grupo.id ? 'Subiendo...' : '+ Subir archivo'}
                    </button>

                    {errorMateriales[grupo.id] && (
                      <div
                        style={{
                          marginBottom: '16px',
                          padding: '12px 16px',
                          backgroundColor: '#fef2f2',
                          border: '1px solid #fecaca',
                          borderRadius: '8px',
                          color: '#dc2626',
                          fontSize: '13px',
                        }}
                      >
                        ⚠️ {errorMateriales[grupo.id]}
                      </div>
                    )}

                    {loadingMateriales[grupo.id] ? (
                      <p style={{ color: '#667085' }}>Cargando materiales...</p>
                    ) : materialesPorGrupo[grupo.id]?.length === 0 ? (
                      <div
                        style={{
                          padding: '24px',
                          backgroundColor: '#ffffff',
                          borderRadius: '12px',
                          textAlign: 'center',
                        }}
                      >
                        <p style={{ color: '#667085', margin: 0 }}>
                          Aún no hay materiales en este grupo.
                        </p>
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gap: '8px' }}>
                        {materialesPorGrupo[grupo.id]?.map((material) => (
                          <div
                            key={material.id}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '12px 16px',
                              backgroundColor: '#ffffff',
                              borderRadius: '8px',
                              border: '1px solid #e4e7ec',
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
                                padding: '6px 12px',
                                fontSize: '12px',
                                minWidth: 'auto',
                                backgroundColor: '#fef2f2',
                                color: '#dc2626',
                                border: '1px solid #fecaca',
                                borderRadius: '6px',
                              }}
                            >
                              Eliminar
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Modal de confirmación */}
      {modalConfirmacion.visible && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            zIndex: 1000,
          }}
          onClick={cerrarModalConfirmacion}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '420px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                margin: '0 0 16px 0',
                fontSize: '18px',
                fontWeight: '600',
                color: '#101828',
              }}
            >
              {modalConfirmacion.titulo}
            </h3>
            <p
              style={{
                margin: '0 0 24px 0',
                fontSize: '14px',
                color: '#344054',
                lineHeight: '1.6',
                whiteSpace: 'pre-line',
              }}
            >
              {modalConfirmacion.mensaje}
            </p>
            <div
              style={{
                display: 'flex',
                gap: '12px',
                flexDirection: 'column',
              }}
            >
              <button
                onClick={modalConfirmacion.onConfirmar}
                disabled={loadingAvisarATodos}
                style={{
                  width: '100%',
                  padding: '12px 20px',
                  fontSize: '14px',
                  fontWeight: '600',
                  backgroundColor: '#eab308',
                  color: '#ffffff',
                  border: '1px solid #ca8a04',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              >
                {loadingAvisarATodos ? 'Enviando...' : 'Confirmar envío'}
              </button>
              <button
                onClick={cerrarModalConfirmacion}
                disabled={loadingAvisarATodos}
                style={{
                  width: '100%',
                  padding: '12px 20px',
                  fontSize: '14px',
                  fontWeight: '500',
                  backgroundColor: '#f9fafb',
                  color: '#344054',
                  border: '1px solid #d0d5dd',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
