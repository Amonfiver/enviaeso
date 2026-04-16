/*
================================================================================
PROPOSITO DEL ARCHIVO
================================================================================
Página principal temporal de EnviaEso (MVP en construcción).
Muestra una estructura visual básica con formulario de entrada sin lógica
de negocio conectada. Sirve como placeholder visual mientras se implementa
la funcionalidad real.

MIGRADO desde app/pages/Home.jsx - Base visual aprovechable temporalmente
================================================================================
ALCANCE
================================================================================
- Título y descripción del producto
- Formulario visual con campos: nombre, email, código (sin lógica aún)
- Botón de envío visual
- Diseño responsive, mobile-first, limpio y profesional
- NO incluye: validación, manejo de envío, conexión a backend

================================================================================
DECISIONES IMPORTANTES ACTUALES
================================================================================
- Diseño centrado en el formulario como elemento principal
- Inputs grandes y accesibles para facilitar uso en móvil
- Copy simple y directo: "Estoy en la lista" como CTA
- Sin manejo de estado (useState) aún - se añadirá al conectar lógica

================================================================================
LIMITACIONES O ESTADO TEMPORAL
===============================================================================
- [TEMPORAL] Esta página es una base visual placeholder
- Formulario no funcional: inputs sin estado ni validación
- Sin manejo de archivo adjunto
- Sin feedback post-envío
- Será reemplazada o refactorizada cuando se implemente el flujo real
================================================================================
*/

function Home() {
  return (
    <div className="page">
      <main className="container">
        <div className="stack-lg text-center">
          {/* Header */}
          <header className="stack">
            <h1 className="text-3xl font-semibold">EnviaEso</h1>
            <p className="text-light text-lg">
              Entrega tus trabajos al profe en segundos. 
              <br />
              Sin registros, sin complicaciones.
            </p>
          </header>

          {/* Formulario */}
          <form className="stack" onSubmit={(e) => e.preventDefault()}>
            <div className="stack">
              <label htmlFor="nombre" className="sr-only">
                Tu nombre
              </label>
              <input
                id="nombre"
                type="text"
                className="input"
                placeholder="Tu nombre completo"
                autoComplete="name"
              />

              <label htmlFor="email" className="sr-only">
                Tu email
              </label>
              <input
                id="email"
                type="email"
                className="input"
                placeholder="Tu email"
                autoComplete="email"
              />

              <label htmlFor="codigo" className="sr-only">
                Código de clase
              </label>
              <input
                id="codigo"
                type="text"
                className="input"
                placeholder="Código de la clase"
                autoComplete="off"
              />
            </div>

            <button type="submit" className="btn btn-primary">
              Estoy en la lista
            </button>
          </form>

          {/* Nota informativa */}
          <p className="text-sm text-muted">
            Introduce el código que te ha dado tu profesor para unirte a la lista de entregas.
          </p>
        </div>
      </main>
    </div>
  )
}

export default Home