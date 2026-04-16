/**
 * Propósito:
 * Componente raíz de la aplicación EnviaEso.
 *
 * Alcance:
 * Define las rutas base públicas y del panel temporal del profesor.
 *
 * Decisiones:
 * - "/" para el flujo del alumno
 * - "/panel" para el flujo del profesor
 *
 * Limitaciones:
 * - Aún no hay protección de rutas
 * - El panel todavía no tiene login oficial
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Panel from './pages/Panel';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/panel" element={<Panel />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;