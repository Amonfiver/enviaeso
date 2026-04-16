/**
 * Propósito:
 * Pantalla temporal del panel del profesor para crear y visualizar grupos.
 *
 * Alcance:
 * MVP puente sin autenticación real.
 *
 * Decisiones:
 * - Usa un profesor_id temporal fijo para validar el flujo
 * - Genera un código automáticamente
 * - Lista los grupos ya creados del profesor
 * - Permite guardar una nota interna opcional por grupo
 *
 * Limitaciones:
 * - Aún no hay login oficial
 * - Aún no permite editar ni borrar grupos
 * - Aún no hay detalle de alumnos por grupo
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

  const cargarGrupos = async () => {
    setLoadingGrupos(true);

    try {
      const { data, error } = await supabase
        .from('grupos')
        .select('id, nombre, codigo, nota_interna, created_at')
        .eq('profesor_id', PROFESOR_ID_TEMPORAL)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setGrupos(data || []);
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
                }}
              >
                <h3 style={{ margin: '0 0 8px 0' }}>{grupo.nombre}</h3>

                <p style={{ margin: '0 0 4px 0' }}>
                  <strong>Código:</strong> {grupo.codigo}
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

                <p style={{ margin: 0, color: '#667085', fontSize: '14px' }}>
                  Creado: {new Date(grupo.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}