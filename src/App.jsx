/**
 * Propósito:
 * Comprobar conexión con Supabase leyendo datos de la tabla grupos.
 */

import { useEffect } from 'react';
import { supabase } from './services/supabase';

function App() {
  useEffect(() => {
    const testConnection = async () => {
      const { data, error } = await supabase
        .from('grupos')
        .select('*')
        .limit(1);

      if (error) {
        console.error('❌ Error conectando con Supabase:', error);
      } else {
        console.log('✅ Conexión correcta, datos:', data);
      }
    };

    testConnection();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>EnviaEso 🚀</h1>
      <p>Revisa la consola del navegador</p>
    </div>
  );
}

export default App;