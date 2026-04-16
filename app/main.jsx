/*
================================================================================
PROPOSITO DEL ARCHIVO
================================================================================
Punto de entrada de la aplicación React. Renderiza el componente raíz App
en el elemento DOM root. Configura el modo estricto de React para detectar
problemas potenciales durante el desarrollo.

================================================================================
ALCANCE
================================================================================
- Importar estilos globales
- Renderizar componente App en el DOM
- Configurar React StrictMode

================================================================================
DECISIONES IMPORTANTES ACTUALES
================================================================================
- Usar React 18+ con createRoot (no ReactDOM.render legacy)
- StrictMode activado para detectar efectos secundarios en desarrollo
- Estilos globales importados aquí para que se apliquen a toda la app

================================================================================
LIMITACIONES O ESTADO TEMPORAL
================================================================================
- Estructura mínima viable, puede extenderse con providers (Router, etc.)
- No incluye manejo de errores global (Error Boundary) aún
================================================================================
*/

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/global.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)