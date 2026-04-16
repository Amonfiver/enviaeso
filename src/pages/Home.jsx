/**
 * Propósito:
 * Pantalla principal para que el alumno se apunte a un grupo mediante código.
 *
 * Alcance:
 * MVP inicial conectado a Supabase para validar código de grupo y guardar alumnos.
 *
 * Decisiones:
 * - Código solo se usa en alta inicial
 * - Email será clave para accesos futuros
 * - Si el alumno ya existe en ese grupo, se informa sin duplicar
 *
 * Limitaciones:
 * - Aún no envía emails
 * - Aún no hay acceso mágico
 * - Aún no hay flujo de profesor
 */

import { useState } from 'react';
import { supabase } from '../services/supabase';

export default function Home() {
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
      const { error: errorAlumno } = await supabase
        .from('alumnos')
        .insert([
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

      setMensaje(
        `Te has apuntado correctamente al grupo "${grupo.nombre}".`
      );
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
    <div className="container">
      <h1>EnviaEso 🚀</h1>
      <p>Introduce el código de tu clase para recibir la documentación</p>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Código del grupo"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Tu nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="Tu email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Apuntando...' : 'Estoy en la lista'}
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