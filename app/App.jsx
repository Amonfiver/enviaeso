/*
================================================================================
PROPOSITO DEL ARCHIVO
================================================================================
Componente raíz de la aplicación. Actúa como contenedor principal y gestiona
la estructura de alto nivel de la app. Actualmente renderiza la página Home
directamente ya que el MVP comienza con una sola página.

================================================================================
ALCANCE
================================================================================
- Renderizar estructura base de la aplicación
- Importar y mostrar el componente de página principal
- Punto de extensión futuro para routing, providers, layouts, etc.

================================================================================
DECISIONES IMPORTANTES ACTUALES
================================================================================
- MVP inicia con una sola página (Home), sin router
- Estructura simple y directa, sin abstracciones innecesarias
- Preparado para añadir React Router cuando se necesiten múltiples páginas

================================================================================
LIMITACIONES O ESTADO TEMPORAL
================================================================================
- Sin sistema de routing (se añadirá cuando se necesiten más páginas)
- Sin providers de contexto (autenticación, tema, etc.) - MVP no los requiere
- Sin layout complejo (header/footer) - se añadirá si el diseño lo requiere
================================================================================
*/

import React from 'react'
import Home from './pages/Home'

function App() {
  return <Home />
}

export default App