/**
 * Propósito:
 * Pantalla temporal del panel del profesor para crear grupos.
 *
 * Alcance:
 * MVP puente sin autenticación real.
 *
 * Decisiones:
 * - Usa un profesor_id temporal fijo para validar el flujo
 * - Genera un código automáticamente
 *
 * Limitaciones:
 * - Aún no hay login oficial
 * - Aún no lista grupos creados
 */

import { useState } from 'react';
import { supabase } from '../services/supabase';
import { generarCodigoGrupo } from '../utils/generarCodigoGrupo';

// TODO: Reemplazar por el profesor autenticado cuando implementemos login real
const PROFESOR_ID_TEMPORAL = '8f3de77b-11e4-4fd6-a45c-068368e540a9';

export default function Panel() {
  const [nombreGrupo, setNombreGrupo] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [tipoMensaje, setTipoMensaje] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCrearGrupo = async (e) => {
    e.preventDefault();

    setMensaje('');
    setTipoMensaje('');
    setLoading(true);

    const nombreNormalizado = nombreGrupo.trim();

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

        <button type="submit" disabled={loading}>
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
    </div>
  );
}