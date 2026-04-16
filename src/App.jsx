/*
================================================================================
PROPOSITO DEL ARCHIVO
================================================================================
Componente raíz de la aplicación EnviaEso. Actúa como contenedor principal
y gestiona la estructura de alto nivel de la app.

================================================================================
ALCANCE
================================================================================
- Renderizar estructura base de la aplicación
- Importar y mostrar el componente de página principal (Home)
- Punto de extensión futuro para routing, providers, layouts, etc.

================================================================================
DECISIONES IMPORTANTES ACTUALES
================================================================================
- MVP inicia con una sola página (Home), sin router
- Estructura simple y directa, sin abstracciones innecesarias
- Preparado para añadir React Router cuando se necesiten múltiples páginas
- Mantiene test de conexión Supabase en useEffect para verificación

================================================================================
LIMITACIONES O ESTADO TEMPORAL
================================================================================
- Sin sistema de routing (se añadirá cuando se necesiten más páginas)
- Sin providers de contexto (autenticación, tema, etc.) - MVP no los requiere
- Home.jsx es temporal/base visual, se refactorizará con lógica real
================================================================================
*/

import { useEffect } from 'react'
import { supabase } from './services/supabase'
import Home from './pages/Home'

function App() {
  // Test de conexión con Supabase - temporal para verificación
  useEffect(() => {
    const testConnection = async () => {
      const { data, error } = await supabase
        .from('grupos')
        .select('*')
        .limit(1)

      if (error) {
        console.error('❌ Error conectando con Supabase:', error)
      } else {
        console.log('✅ Conexión correcta, datos:', data)
      }
    }

    testConnection()
  }, [])

  return <Home />
}

export default App