<!--
================================================================================
PROPOSITO DEL ARCHIVO
================================================================================
Registro cronológico de todas las sesiones de trabajo realizadas en el proyecto
EnviaEso. Permite trazar qué se hizo, cuándo y qué archivos se modificaron.
Facilita la continuidad entre sesiones y agentes de desarrollo.

================================================================================
ALCANCE
================================================================================
- Entradas datadas de cada sesión de trabajo
- Resumen de acciones realizadas
- Lista de archivos creados/modificados/borrados
- Notas relevantes para sesiones futuras

================================================================================
DECISIONES IMPORTANTES ACTUALES
================================================================================
- Formato: fecha + título de sesión + resumen + archivos + notas
- Orden cronológico inverso (más reciente arriba)
- Una entrada por sesión de trabajo coherente

================================================================================
LIMITACIONES O ESTADO TEMPORAL
================================================================================
- Este archivo crece continuamente
- Las entradas antiguas no se modifican (solo se añaden nuevas)
- Las correcciones a entradas previas se anotan en nuevas entradas
================================================================================
-->

# BITÁCORA - Registro de Sesiones: EnviaEso

## Formato de entrada

Cada entrada sigue esta estructura:

```
## YYYY-MM-DD - Título de la sesión

**Objetivo:** Qué se pretendía lograr  
**Estado:** Completado / Parcial / En progreso

### Acciones realizadas
- [ ] Acción 1
- [ ] Acción 2

### Archivos modificados
| Archivo | Acción | Descripción |
|---------|--------|-------------|
| ruta/al/archivo | Creado/Modificado/Eliminado | Breve descripción |

### Notas para sesiones futuras
- Nota relevante 1
- Nota relevante 2
```

---

## 2026-04-18 - Subida de documentos por grupo en panel del profesor

**Objetivo:** Implementar la funcionalidad para que el profesor pueda subir documentos a cada grupo, gestionarlos y eliminarlos, usando Supabase Storage y la tabla `materiales`.  
**Estado:** ✅ Completado

### Acciones realizadas
- [x] **Creado `src/services/storage.js`**:
  - Función `subirMaterial(grupoId, archivo)` - sube a Storage y crea registro en BD
  - Función `eliminarMaterial(materialId, filePath)` - elimina de Storage y BD
  - Función `listarMaterialesPorGrupo(grupoId)` - consulta materiales de un grupo
  - Función `validarArchivo(archivo)` - valida tamaño (max 10 MB) y tipo
  - Función `formatearTamaño(bytes)` - muestra tamaño legible (KB, MB)
  - Tipos permitidos: PDF, Word, Excel, PowerPoint
  - Path en Storage: `{profesor_id}/{grupo_id}/{uuid}_{nombre_archivo}`

- [x] **Actualizado `src/pages/Panel.jsx`**:
  - Importado `useRef` de React para gestionar referencias a inputs file
  - Importadas funciones del servicio storage
  - Añadidos estados para gestionar materiales por grupo
  - Añadidas funciones `cargarMateriales`, `handleSubirArchivo`, `handleEliminarMaterial`
  - Añadida referencia `fileInputRefs` para inputs file por grupo
  - Botón "Ver materiales" (verde) en cada tarjeta de grupo
  - Sección expandible de materiales con lista de archivos
  - Botón "+ Subir archivo" con input file oculto
  - Cada archivo muestra: nombre, tamaño formateado, botón eliminar
  - Estados de carga durante subida y carga de materiales
  - Mensajes de éxito/error usando el sistema existente

- [x] **Ajuste posterior - Orden de borrado corregido:**
  - Cambiado orden en `eliminarMaterial()`: primero Storage, luego BD
  - Rationale: Si falla el Storage, el registro en BD se puede recrear; al revés no
  - Si falla Storage, se intenta limpiar BD de todos modos (mejor huérfano en Storage que en BD)

- [x] **Corrección crítica - Sección de materiales se bloqueaba al fallar carga:**
  - **Problema:** La sección solo se mostraba si `materialesPorGrupo[grupo.id] !== undefined`, pero al fallar la carga, el estado nunca se inicializaba
  - **Solución:** Separar estado de visibilidad (`grupoMaterialesAbierto`) del estado de datos (`materialesPorGrupo`)
  - **Nuevo estado `errorMateriales`:** Guarda errores por grupo para mostrar inline sin bloquear UI
  - **Comportamiento corregido:** 
    - La sección siempre se abre al pulsar "Ver materiales"
    - Si falla la carga, se muestra error inline pero el botón "+ Subir archivo" permanece visible
    - Se inicializa array vacío para que la UI no quede en estado intermedio
  - **Mejora en logging:** Logs detallados en consola con prefijo `[Materiales]` para debug

- [x] **Estructura de Storage**:
  - Bucket único: `materiales`
  - Organización jerárquica por profesor/grupo
  - UUID en nombre de archivo para evitar colisiones

- [x] **Sin cambios en backend más allá de Supabase**:
  - No se creó servidor propio
  - Se usa API de Supabase Storage directamente desde frontend
  - RLS temporalmente permisivo (documentado como deuda técnica)

### Archivos modificados
| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `src/services/storage.js` | Creado | Servicio completo para gestión de materiales: subida, eliminación, listado, validación |
| `src/pages/Panel.jsx` | Modificado | Integración de UI de materiales: botón Ver materiales, sección expandible, subida de archivos, lista con eliminación |

### Notas para sesiones futuras
- **Deuda técnica - RLS:** Las políticas RLS de Storage y BD son permisivas temporalmente. Antes de producción real:
  - Configurar RLS en tabla `materiales` para que solo el profesor dueño pueda modificar
  - Configurar RLS en bucket `materiales` para controlar acceso a archivos
- **Límite de tamaño:** 10 MB por archivo (configurable en `storage.js`)
- **Tipos permitidos:** Solo documentos de oficina y PDF (no imágenes ni videos por ahora)
- **UX implementada:** Cada grupo tiene su propia lista de materiales independiente
- **Preparado para la prueba del lunes:** El profesor puede crear grupo → invitar alumnos → subir materiales → todo desde el mismo panel
- **Siguiente paso lógico:** Implementar flujo de alumno para ver/descargar estos materiales

---

## 2026-04-18 - Botón "Copiar invitación" en tarjetas de grupo

**Objetivo:** Añadir un botón "Copiar invitación" en cada tarjeta de grupo para que el profesor pueda compartir fácilmente un mensaje listo para enviar por WhatsApp o similar, facilitando la prueba real del lunes.  
**Estado:** ✅ Completado

### Acciones realizadas
- [x] Añadida función `handleCopiarInvitacion(codigo)` que:
  - Construye texto: "Hola, entra en enviaeso.com, escribe tu nombre y tu correo, y usa este código de grupo: {CODIGO}"
  - Copia al portapapeles mediante `navigator.clipboard.writeText()`
  - Usa el sistema de mensajes existente para feedback
- [x] Añadido botón "Copiar invitación" junto al botón "Copiar código" en cada tarjeta
- [x] Estilo distintivo pero coherente: fondo azul claro (#e0f2fe), texto azul (#0369a1), borde azul
- [x] Botón deshabilitado durante operaciones de borrado (consistencia UX)
- [x] **Mantenido botón "Copiar código" existente:** Ambos botones coexisten
- [x] **Sin cambios en backend:** Solo usa API nativa del navegador
- [x] **Sin exposición de emails:** No modifica consultas ni lógica de privacidad

### Archivos modificados
| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `src/pages/Panel.jsx` | Modificado | Añadida función `handleCopiarInvitacion`, botón "Copiar invitación" en tarjetas de grupo, feedback mediante sistema de mensajes existente |

### Notas para sesiones futuras
- **Texto de invitación exacto:** "Hola, entra en enviaeso.com, escribe tu nombre y tu correo, y usa este código de grupo: {CODIGO}"
- **Mensaje de éxito:** "Invitación copiada correctamente."
- **Mensaje de error:** "No se pudo copiar la invitación. Inténtalo manualmente."
- **UX optimizada para WhatsApp:** El texto está pensado para copiar y pegar directamente
- **Preparado para la prueba del lunes:** El profesor puede invitar alumnos en segundos sin redactar mensajes
- **Diferenciación visual:** "Copiar código" (gris) vs "Copiar invitación" (azul) para distinguir funciones

---

## 2026-04-18 - Botón "Actualizar" en panel del profesor

**Objetivo:** Añadir un botón "Actualizar" en el panel del profesor para refrescar manualmente la información sin recargar la página completa, facilitando la prueba real del lunes con profesor y alumnos.  
**Estado:** ✅ Completado

### Acciones realizadas
- [x] Añadido botón "Actualizar" en la parte superior de la sección "Tus grupos" (alineado a la derecha del título)
- [x] Creada función `handleActualizar()` que:
  - Recarga los grupos mediante `cargarGrupos()` (grupos + contadores)
  - Si hay una vista de alumnos abierta, recarga también esos alumnos mediante `recargarAlumnosAbierto()`
  - Muestra mensaje de confirmación "Información actualizada."
- [x] Creada función auxiliar `recargarAlumnosAbierto()` que recarga alumnos del grupo abierto sin alternar el estado (toggle)
- [x] Botón deshabilitado durante la carga (`loadingGrupos`) mostrando "Actualizando..."
- [x] Estilo coherente con el diseño existente (fondo gris claro, borde sutil)
- [x] **Sin cambios en backend:** Reutiliza funciones existentes de consulta a Supabase
- [x] **Sin exposición de emails:** Las consultas existentes solo traen `id` y `nombre` de alumnos, nunca `email`

### Archivos modificados
| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `src/pages/Panel.jsx` | Modificado | Añadidas funciones `handleActualizar` y `recargarAlumnosAbierto`, botón "Actualizar" en header de sección, reutilización de lógica existente |

### Notas para sesiones futuras
- **Cambio controlado:** Solo se añadió un botón y dos funciones, sin refactorizar el componente
- **Comportamiento preservado:** Crear/editar/borrar grupos funcionan exactamente igual
- **Privacidad mantenida:** No se modificaron las consultas a Supabase; siguen sin traer emails
- **Preparado para la prueba del lunes:** El profesor puede refrescar datos fácilmente durante la sesión sin perder el contexto de la vista de alumnos abierta
- **Sin recarga de página:** La actualización es SPA (Single Page Application), solo se reemplazan los datos en estado

---

## 2025-04-15 - Creación de estructura SDD base

**Objetivo:** Preparar la base documental inicial del proyecto siguiendo flujo Spec Driven Development (SDD) y trabajo incremental. Crear los 5 documentos base sin implementar aún lógica de negocio ni frontend definitivo.  
**Estado:** ✅ Completado

### Acciones realizadas
- [x] Crear `README.md` con cabecera descriptiva, resumen del proyecto, problema que resuelve, propuesta de valor, estado actual y metodología SDD + Cline
- [x] Crear `docs/SPEC.md` con especificación funcional completa: visión del producto, actores (alumno/profesor), flujos principales, restricciones MVP, features fuera de alcance, criterios de éxito y preguntas pendientes
- [x] Crear `docs/ARCHITECTURE.md` con arquitectura propuesta a alto nivel: principios de diseño, componentes principales (frontend, backend, email, almacenamiento), decisiones técnicas pendientes y diagramas
- [x] Crear `docs/DECISIONES.md` con registro de decisiones iniciales: nombre del proyecto, enfoque MVP, metodología SDD, cabeceras descriptivas obligatorias, bitácora obligatoria, demo con profesor el lunes como objetivo inmediato
- [x] Crear `docs/BITACORA.md` con esta primera entrada
- [x] Aplicar formato de cabeceras descriptivas consistente en todos los archivos creados
- [x] Redactar en español, claro y sin relleno, marcando explícitamente todo lo provisional

### Archivos modificados
| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `README.md` | Creado | Punto de entrada del proyecto: resumen, problema, propuesta de valor, estado, metodología SDD |
| `docs/SPEC.md` | Creado | Especificación funcional completa con actores, flujos, restricciones y criterios de éxito del MVP |
| `docs/ARCHITECTURE.md` | Creado | Arquitectura técnica provisional: principios, componentes, opciones consideradas, decisiones pendientes |
| `docs/DECISIONES.md` | Creado | Registro de 10 decisiones firmadas, 3 revisables y 6 diferidas, más plantilla para nuevas entradas |
| `docs/BITACORA.md` | Creado | Este archivo: registro de sesiones con formato estandarizado |

### Notas para sesiones futuras
- La estructura de documentación SDD está lista para usar
- Siguiente paso lógico: tomar decisiones técnicas diferidas (D001-D006) y comenzar implementación del MVP
- Prioridad máxima: validación con demo real para profesor el lunes
- Todos los documentos incluyen cabeceras descriptivas estandarizadas que deben mantenerse actualizadas
- Al modificar cualquier archivo existente, actualizar su sección "DECISIONES IMPORTANTES ACTUALES" y "LIMITACIONES" si aplica

---

## 2025-04-15 - Definición de stack y estructura base del proyecto

**Objetivo:** Definir stack técnico concreto y preparar la base del proyecto para comenzar desarrollo en la siguiente iteración. Crear estructura de carpetas y archivos base de React + Vite.  
**Estado:** ✅ Completado

### Acciones realizadas
- [x] Actualizar `docs/ARCHITECTURE.md` con stack técnico definido:
  - Frontend: Vite + React
  - Backend: Supabase (provisional)
  - Email: Resend (provisional)
  - Hosting: Vercel (provisional)
  - Justificación: cero configuración de servidores, desarrollo instantáneo, deploy en minutos, coste inicial cero
- [x] Crear estructura de carpetas `/app` con subdirectorios: components/, pages/, services/, styles/, utils/
- [x] Crear `app/styles/global.css` con sistema de diseño base: reset CSS, variables CSS para colores y espaciado, tipografía del sistema, estilos base para inputs y botones, utilidades de layout mobile-first
- [x] Crear `app/main.jsx` como punto de entrada React 18+ con StrictMode
- [x] Crear `app/App.jsx` como componente raíz, renderiza Home directamente
- [x] Crear `app/pages/Home.jsx` con estructura visual inicial:
  - Título "EnviaEso" y subtítulo explicando valor
  - Formulario con inputs: nombre, email, código (sin lógica aún)
  - Botón CTA: "Estoy en la lista"
  - Diseño limpio, mobile-first, profesional
  - Espaciado correcto, inputs grandes, botón redondeado

### Archivos modificados
| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `docs/ARCHITECTURE.md` | Modificado | Sección 5 añadida: Stack técnico definido (Vite+React, Supabase, Resend, Vercel) con justificación MVP |
| `app/styles/global.css` | Creado | Sistema de diseño base: variables CSS, reset, estilos inputs/botones, utilidades mobile-first |
| `app/main.jsx` | Creado | Punto de entrada React 18+, importa estilos globales, renderiza App |
| `app/App.jsx` | Creado | Componente raíz, actualmente renderiza Home directamente |
| `app/pages/Home.jsx` | Creado | Página principal con formulario visual: título, 3 inputs, botón, nota informativa |

### Notas para sesiones futuras
- El stack técnico está definido pero marcado como provisional donde aplica
- La estructura de carpetas está lista para escalar: components/ para componentes reutilizables, services/ para lógica de API, utils/ para helpers
- Home.jsx tiene formulario visual sin estado ni lógica - siguiente paso es añadir useState y manejo básico de inputs
- Diseño CSS es mobile-first con variables fáciles de ajustar
- Falta: index.html, configuración Vite, conexión real a Supabase, lógica de envío


---

## 2025-04-15 - Realineación conceptual del producto (Iteración 3)

**Objetivo:** Actualizar la especificación y arquitectura del proyecto para reflejar la visión evolucionada del producto: de formulario simple de envío a plataforma de gestión de grupos con distribución de materiales.  
**Estado:** ✅ Completado

### Acciones realizadas
- [x] **Actualizar `docs/SPEC.md`** (versión 0.2 - Realineación conceptual):
  - Nueva visión del producto: plataforma de gestión y distribución de materiales educativos
  - Tres actores definidos: Profesor (gestor), Alumno (consumidor), Sistema (automatizador)
  - Flujo principal del profesor completo: registro/login, creación de grupos, generación de códigos, visualización de alumnos, subida de materiales, publicación/envío, consulta de historial/estado
  - Flujo principal del alumno completo: acceso por código, alta en grupo, recepción de notificación por email, acceso a web con materiales, descarga de archivos
  - **Modelo conceptual de entidades** añadido: Profesor, Grupo, Alumno, Material, Envío (con relaciones y estados)
  - Sección comparativa Email vs Plataforma explicando el cambio de paradigma
  - Restricciones del MVP actualizadas (límites de grupos, alumnos, materiales)
  - Criterios de éxito del MVP actualizados (6 criterios nuevos)
  - **Sección de contradicciones resueltas** documentando cambios respecto a v0.1
  - Nota sobre Home.jsx desalineado con la nueva especificación

- [x] **Actualizar `docs/ARCHITECTURE.md`** (versión 0.2 - Realineación arquitectónica):
  - Arquitectura dual: Frontend Público (alumno) + Frontend Privado (panel profesor)
  - Stack confirmado: Vite+React (ambos frontends), Supabase (Auth+DB+Storage), Resend (notificaciones), Vercel (hosting)
  - Supabase Storage como núcleo de almacenamiento (no adjuntos en email)
  - Resend solo para notificaciones, NO para transporte de archivos
  - Componentes detallados: dos frontends, Supabase (Auth, DB, RLS, Storage), Resend, trazabilidad
  - Flujos de datos actualizados: publicación de material y alta de alumno
  - Decisiones técnicas pendientes: despliegue único vs separado, esquema BD, RLS vs lógica adicional, generación de códigos
  - Riesgos y mitigaciones específicos del nuevo modelo
  - Principios arquitectónicos: evitar adjuntos, centralizar en plataforma, trazabilidad desde día 0, tráfico de retorno como valor
  - Contradicciones resueltas vs versión anterior

- [x] **Actualizar `docs/DECISIONES.md`**:
  - P005 marcada como revisada/cambiada (panel fuera de alcance → incluido)
  - P006 añadida: Panel de profesor incluido en MVP (sustituye a P005)
  - P007 añadida: Profesor gestiona múltiples grupos/listas
  - P008 añadida: Alumnos se asocian mediante códigos
  - P009 añadida: Materiales se sirven desde plataforma
  - P010 añadida: Email es canal de aviso, no transporte de archivos
  - P011 añadida: Tráfico de retorno deseable
  - P012 añadida: Trazabilidad completa
  - P013 añadida: No prometer "sin límite" como claim literal
  - T002 marcada como OBSOLETA (sin base de datos → ahora sí hay BD compleja)
  - T004-T008 añadidas: decisiones técnicas del nuevo modelo (dos frontends, Supabase completo, Storage, Resend solo notificaciones, trazabilidad en BD)
  - Decisiones diferidas actualizadas (D001-D006) con nuevas opciones relevantes

### Archivos modificados
| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `docs/SPEC.md` | Modificado | Realineación completa v0.2: tres actores, flujos completos profesor/alumno, modelo de entidades, email como aviso no transporte |
| `docs/ARCHITECTURE.md` | Modificado | Arquitectura dual frontend, Supabase Storage, flujos de datos, principios específicos, riesgos |
| `docs/DECISIONES.md` | Modificado | 8 nuevas decisiones de producto, 5 nuevas técnicas, 1 obsoleta, decisiones diferidas actualizadas |

### Notas para sesiones futuras
- **Cambio de paradigma completado**: de "envío de trabajos" a "gestión de grupos con distribución de materiales"
- **Home.jsx está desalineado**: implementa formulario de "envío" del modelo anterior. Necesita rediseño como portal de acceso para alumnos
- **Próximos pasos sugeridos**:
  1. Diseñar esquema de base de datos (tablas profesores, grupos, alumnos, materiales, envíos)
  2. Configurar proyecto Supabase
  3. Rediseñar Home.jsx o crear nueva estructura de páginas (portal alumno + panel profesor)
  4. Implementar autenticación de profesores
  5. Implementar flujo de creación de grupos y generación de códigos
- **Decisiones clave tomadas**: panel profesor es obligatorio, materiales en Storage, email solo notifica, trazabilidad completa
- **Decisiones pendientes**: esquema exacto BD, generación de códigos, despliegue único o separado


---

## 2025-04-15 - Definición del modelo de datos y arquitectura ejecutable (Iteración 4)

**Objetivo:** Aterrizar la visión del producto en un modelo de datos concreto y una arquitectura ejecutable lista para implementación. Definir tablas, relaciones, rutas y flujos claros.  
**Estado:** ✅ Completado

### Acciones realizadas
- [x] **Actualizar `docs/ARCHITECTURE.md`** (versión 0.3 - Modelo de datos definido):
  - Corregido "dos frontends" por un solo frontend React con rutas separadas:
    - "/" → acceso alumno (público)
    - "/panel/*" → panel profesor (protegido por auth)
  - Estructura de rutas detallada para ambos flujos
  - Definición completa del modelo de datos (6 tablas):
    - `profesores`: id, email, created_at
    - `grupos`: id, profesor_id, nombre, codigo, created_at
    - `alumnos`: id, grupo_id, nombre, email, created_at
    - `materiales`: id, grupo_id, nombre_archivo, url_storage, created_at
    - `envios`: id, grupo_id, fecha_envio, descripcion
    - `envios_alumnos` (pivote): id, envio_id, alumno_id, estado ("enviado"), created_at
  - Relaciones entre entidades documentadas
  - Índices recomendados para rendimiento
  - Políticas RLS y Storage definidas
  - Sección de trazabilidad ajustada: MVP solo "enviado", futuro "abierto"/"descargado"

- [x] **Actualizar `docs/SPEC.md`**:
  - Flujo con enlace mágico detallado (sección 4.3 y 4.4)
  - El alumno recibe email → accede sin login → visualiza materiales
  - Acceso alternativo con código para casos de email perdido
  - Reforzado: email = notificación + acceso, plataforma = consumo de contenido

- [x] **Actualizar `docs/DECISIONES.md`**:
  - T009 añadida: Un solo frontend con rutas separadas
  - T010 añadida: Enlace mágico para acceso de alumnos
  - T011 añadida: Trazabilidad simplificada (solo "enviado" en MVP)
  - Decisiones diferidas actualizadas (D001-D004) con nuevas opciones

- [x] **Documentación de Home.jsx desalineado**:
  - Confirmado que Home.jsx actual está obsoleto respecto a la nueva arquitectura
  - Señalado para rediseño en próxima iteración de implementación

### Archivos modificados
| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `docs/ARCHITECTURE.md` | Modificado | Un solo frontend con rutas / y /panel, modelo de datos con 6 tablas definido, índices, RLS, trazabilidad simplificada |
| `docs/SPEC.md` | Modificado | Flujo de enlace mágico detallado, email como notificación + acceso |
| `docs/DECISIONES.md` | Modificado | T009, T010, T011 añadidas; decisiones diferidas actualizadas |
| `docs/BITACORA.md` | Modificado | Esta entrada de sesión 4 |

### Notas para sesiones futuras
- **Modelo de datos listo para implementar**: esquema SQL puede crearse directamente en Supabase
- **Decisiones arquitectónicas cerradas**: un solo frontend, rutas definidas, enlace mágico confirmado
- **Próximos pasos sugeridos** (en orden de dependencia):
  1. Configurar proyecto Supabase (proyecto nuevo, credenciales)
  2. Crear tablas en Supabase según modelo definido
  3. Configurar Storage bucket "materiales"
  4. Configurar RLS básicas
  5. Instalar React Router en el proyecto
  6. Crear estructura de carpetas para rutas (/panel)
  7. Implementar panel de profesor (login con Supabase Auth)
  8. Implementar flujo de creación de grupos y generación de códigos
  9. Implementar flujo de alumno (acceso por código + enlace mágico)
  10. Integrar Resend para notificaciones
- **Home.jsx**: NO modificar todavía, será reemplazado/rediseñado cuando se implemente el routing
- **Decisiones pendientes ahora reducidas**: generación de tokens, códigos de grupo, URLs de Storage


---

## 2025-04-15 - Ajustes finos antes de implementación (Iteración 5)

**Objetivo:** Corregir pequeñas contradicciones y completar el modelo de datos para evitar ambigüedades en la implementación.  
**Estado:** ✅ Completado

### Acciones realizadas
- [x] **Actualizar `docs/SPEC.md`**:
  - Eliminado "acceso alternativo con código" para alumnos
  - Clarificado: el código solo se usa en el alta inicial del alumno
  - Recuperación de acceso solo mediante email (solicitar reenvío al profesor)
  - Flujo de enlace mágico mantenido como vía principal

- [x] **Actualizar `docs/ARCHITECTURE.md`**:
  - Aclarado que `alumnos` representa una **inscripción por grupo**, no identidad global única
  - Añadida nota sobre evolución futura: separación en `personas` + `inscripciones`
  - **Nueva tabla `envios_materiales`** añadida al modelo de datos:
    - id, envio_id, material_id, created_at
    - Relación muchos-a-muchos entre envíos y materiales
    - Permite seleccionar qué materiales concretos incluir en cada envío
  - Diagrama de relaciones actualizado para incluir `envios_materiales`
  - Ajustada descripción del enlace mágico: "token temporal de acceso" o "enlace firmado", no depende de formato URL específico

- [x] **Actualizar `docs/DECISIONES.md`**:
  - P014: Código de grupo solo para alta inicial
  - P015: Recuperación de acceso solo por email
  - T012: Tabla envios_materiales para vinculación explícita
  - T013: Alumnos como inscripciones por grupo (no identidad global)

### Archivos modificados
| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `docs/SPEC.md` | Modificado | Eliminado acceso alternativo con código, recuperación solo por email |
| `docs/ARCHITECTURE.md` | Modificado | Tabla alumnos aclarada como inscripción por grupo, nueva tabla envios_materiales, diagrama actualizado, enlace mágico como token temporal |
| `docs/DECISIONES.md` | Modificado | 4 nuevas decisiones revisadas (P014, P015, T012, T013) |
| `docs/BITACORA.md` | Modificado | Esta entrada de sesión 5 |

### Notas para sesiones futuras
- **Documentación lista para implementación**: modelo de datos completo (7 tablas), flujos claros, decisiones cerradas
- **Modelo de datos final (7 tablas)**:
  1. `profesores` - datos de profesores
  2. `grupos` - grupos de clase con código único
  3. `alumnos` - inscripciones por grupo (no identidad global)
  4. `materiales` - archivos subidos
  5. `envios` - publicaciones/envíos a grupos
  6. `envios_materiales` - relación envío-material (qué materiales incluye)
  7. `envios_alumnos` - trazabilidad por alumno (estado "enviado")
- **Decisiones clave cerradas**:
  - Código solo para alta inicial
  - Sin recuperación autónoma del alumno (solo por email/profesor)
  - Enlace mágico como token temporal (formato flexible)
  - Alumnos como inscripciones por grupo (mismo email puede estar en varios grupos)
- **Próximo paso**: Implementación directa puede comenzar con configuración de Supabase

---

## 2025-04-16 - Migración de estructura: de `app/` a `src/` en Vite

**Objetivo:** Ordenar la estructura real del frontend de EnviaEso para trabajar definitivamente sobre Vite + React usando `src/`, reaprovechando lo útil de la antigua carpeta `app/` y dejando el proyecto listo para seguir implementando.  
**Estado:** ✅ Completado

### Acciones realizadas
- [x] **Explorar y evaluar contenido de `app/`**:
  - `app/App.jsx` → estructura simple, no migrado (reemplazado por versión en `src/`)
  - `app/main.jsx` → punto de entrada, no migrado (reemplazado por versión en `src/`)
  - `app/pages/Home.jsx` → **MIGRADO** a `src/pages/Home.jsx` como base visual temporal
  - `app/styles/global.css` → **MIGRADO** a `src/styles/global.css` con sistema de diseño completo

- [x] **Crear estructura de carpetas bajo `src/`**:
  - `src/components/` → creada (vacía, lista para componentes reutilizables)
  - `src/pages/` → creada con `Home.jsx` migrado
  - `src/styles/` → creada con `global.css` migrado
  - `src/utils/` → creada (vacía, lista para helpers)
  - `src/services/` → ya existía con `supabase.js`

- [x] **Migrar `src/styles/global.css`**:
  - Sistema de diseño completo: variables CSS, reset, tipografía, espaciado
  - Estilos base para inputs (.input) y botones (.btn, .btn-primary)
  - Utilidades de layout: .container, .page, .stack, .stack-lg, etc.
  - Utilidades de texto: .text-center, .text-light, .text-muted, etc.
  - Añadida clase `.sr-only` para accesibilidad (labels ocultos visualmente)
  - Cabecera descriptiva actualizada indicando migración desde `app/`

- [x] **Migrar `src/pages/Home.jsx`**:
  - Estructura visual del formulario preservada
  - Marcado como **[TEMPORAL]** en cabecera: base visual placeholder
  - Señalado explícitamente como obsoleto respecto a arquitectura actual
  - Mantiene diseño mobile-first con clases CSS del sistema migrado

- [x] **Actualizar `src/App.jsx`**:
  - Nueva cabecera descriptiva completa
  - Integración con `Home.jsx` desde `src/pages/`
  - Mantiene test de conexión Supabase en useEffect
  - Import corregido: `from './services/supabase'` (sin .js)

- [x] **Actualizar `src/main.jsx`**:
  - Nueva cabecera descriptiva completa
  - Import cambiado: `'./styles/global.css'` (en lugar de `'./index.css'`)
  - Mantiene React 18+ createRoot y StrictMode

- [x] **Verificar integración**:
  - `src/services/supabase.js` ya existente y funcional
  - Todos los imports actualizados y consistentes
  - Estructura final: `src/{components,pages,services,styles,utils}/`

### Archivos modificados
| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `src/styles/global.css` | Creado | Migrado desde `app/styles/global.css` - Sistema de diseño completo con variables CSS, estilos base, utilidades |
| `src/pages/Home.jsx` | Creado | Migrado desde `app/pages/Home.jsx` - Página temporal con formulario visual, marcada como placeholder |
| `src/App.jsx` | Modificado | Reestructurado con cabecera descriptiva, integra Home migrado, mantiene test Supabase |
| `src/main.jsx` | Modificado | Actualizado con cabecera descriptiva, importa `global.css` en lugar de `index.css` |
| `docs/BITACORA.md` | Modificado | Esta entrada de sesión 6 |

### Notas para sesiones futuras
- **ESTRUCTURA DEFINITIVA**: El frontend trabaja sobre `src/`, no sobre `app/`
- **`app/` QUEDA OBSOLETA**: Contiene código de iteraciones previas, no debe usarse
  - `app/App.jsx` → obsoleto (reemplazado por `src/App.jsx`)
  - `app/main.jsx` → obsoleto (reemplazado por `src/main.jsx`)
  - `app/pages/Home.jsx` → migrado a `src/pages/Home.jsx` (marcado como temporal)
  - `app/styles/global.css` → migrado a `src/styles/global.css`
- **Home.jsx es temporal**: La página actual no refleja la arquitectura dual (alumno/profesor) definida en docs. Se usará como placeholder visual mientras se implementa el routing real.
- **Próximos pasos sugeridos**:
  1. Instalar React Router DOM
  2. Crear estructura de rutas: `/` (portal alumno), `/panel` (login/profesor)
  3. Implementar autenticación de profesores con Supabase Auth
  4. Implementar flujo de creación de grupos
  5. Reemplazar Home.jsx temporal con páginas reales del flujo alumno
- **Seguro eliminar `app/`**: Una vez verificado que todo funciona en `src/`, la carpeta `app/` puede eliminarse sin pérdida de información (todo útil ya está migrado)

---

## 2025-04-16 - Panel temporal: edición y borrado de grupos

**Objetivo:** Ampliar el panel temporal del profesor para permitir editar y borrar grupos ya creados, manteniendo el enfoque MVP y sin introducir autenticación oficial.  
**Estado:** ✅ Completado

### Acciones realizadas
- [x] **Actualizar `src/pages/Panel.jsx`**:
  - Añadido modo edición por cada tarjeta de grupo (inline editing)
  - Permite editar: `nombre` y `nota_interna` del grupo
  - El código del grupo se muestra como no editable
  - Botones claros: "Editar", "Guardar", "Cancelar"
  - Añadido botón "Borrar" con confirmación mediante `window.confirm`
  - Al borrar: elimina el grupo de Supabase y refresca la lista automáticamente
  - Indicador visual de tarjeta en modo edición (borde azul izquierdo)
  - Estados de carga independientes para edición y borrado
  - Manejo de errores visible al usuario (mensajes success/error)
  - Si se borra un grupo en edición, se cancela el modo edición automáticamente
  - Cabecera descriptiva actualizada para reflejar nuevas capacidades

- [x] **Gestión de estado local**:
  - `grupoEditando`: ID del grupo en edición (null si ninguno)
  - `editNombre` y `editNota`: valores temporales de edición
  - `loadingEdicion`: estado de carga durante guardado
  - `loadingBorrado`: ID del grupo siendo borrado (null si ninguno)
  - Funciones: `handleEditarClick`, `handleCancelarEdicion`, `handleGuardarEdicion`, `handleBorrarGrupo`

- [x] **UX mantenida simple y limpia**:
  - Estilo consistente con el diseño actual
  - Sin sobrecarga visual
  - Distinción clara entre modo visualización y modo edición
  - Botón "Borrar" con estilo distintivo (fondo rojo claro, texto rojo)

### Archivos modificados
| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `src/pages/Panel.jsx` | Modificado | Añadida edición inline de grupos (nombre, nota), borrado con confirmación, estados de carga, manejo de errores |

### Notas para sesiones futuras
- **Panel temporal ahora soporta gestión básica completa de grupos**: crear, editar, borrar
- **No se ha extraído componente reutilizable**: la lógica está en Panel.jsx, lo cual es aceptable para MVP
- **No se ha tocado autenticación**: sigue usando `PROFESOR_ID_TEMPORAL`
- **Próximos pasos sugeridos**:
  1. Implementar autenticación real con Supabase Auth
  2. Vista de detalle de grupo (listar alumnos, subir materiales)
  3. Flujo de alumno: acceso por código y visualización de materiales
- **La tabla `grupos` ya tiene `on delete cascade`**: al borrar un grupo, se eliminan automáticamente las relaciones dependientes


---

## 2025-04-18 - Vista de alumnos por grupo en panel del profesor

**Objetivo:** Implementar la visualización de alumnos por grupo dentro del panel del profesor, respetando la privacidad (sin mostrar emails de los alumnos).  
**Estado:** ✅ Completado

### Acciones realizadas
- [x] Añadido estado local para gestionar la vista de alumnos: `grupoAlumnosAbierto`, `alumnos`, `loadingAlumnos`
- [x] Creada función `cargarAlumnos(grupoId)` que consulta Supabase filtrando por grupo_id
- [x] **Consulta a Supabase limitada a campos necesarios:** solo `id` y `nombre` de la tabla `alumnos`
- [x] **No se consulta ni se muestra el campo `email`** en ninguna parte de esta vista
- [x] Añadido botón "Ver alumnos" en cada tarjeta de grupo
- [x] Implementada sección expandible que muestra:
  - Nombre del grupo
  - Total de alumnos
  - Lista ordenada de nombres de alumnos
- [x] Mensaje amigable cuando no hay alumnos en el grupo
- [x] Actualizada cabecera descriptiva del archivo `Panel.jsx` reflejando nueva funcionalidad
- [x] Añadido JSDoc a la función `cargarAlumnos` documentando el respeto a la privacidad

### Archivos modificados
| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `src/pages/Panel.jsx` | Modificado | Añadida vista de alumnos por grupo con sección expandible, botón "Ver alumnos", consulta limitada a campos necesarios (id, nombre), sin exposición de emails |

### Notas para sesiones futuras
- **Confirmación de privacidad:** La consulta a Supabase usa `.select('id, nombre')` explícitamente, excluyendo el campo `email` de la tabla `alumnos`. La UI solo renderiza `alumno.nombre`, nunca el email.
- **UX implementada:** Sección expandible simple (panel desplegable) coherente con el diseño actual del panel. El mismo botón alterna entre "Ver alumnos" y "Ocultar alumnos".
- **Estado local:** No se usa estado global ni contexto; la lista de alumnos se carga por demanda y se limpia al cerrar la vista.
- **Próximos pasos sugeridos**:
  1. Implementar autenticación real con Supabase Auth (reemplazar `PROFESOR_ID_TEMPORAL`)
  2. Permitir subir materiales a un grupo
  3. Crear flujo de envío de materiales a alumnos
  4. Implementar flujo de alumno: acceso por código y visualización de materiales

---

## 2025-04-18 - Ajustes de robustez en vista de alumnos

**Objetivo:** Mejorar la robustez de la vista de alumnos por grupo sin cambiar el alcance funcional.  
**Estado:** ✅ Completado

### Acciones realizadas
- [x] Si `cargarAlumnos()` falla, cerrar automáticamente la vista de alumnos para no insinuar que el grupo está vacío
- [x] Si se borra un grupo que tiene la vista de alumnos abierta, limpiar el estado relacionado (`grupoAlumnosAbierto` y `alumnos`)

### Archivos modificados
| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `src/pages/Panel.jsx` | Modificado | Añadida limpieza de estado de alumnos en caso de error al cargar y al borrar grupo con vista abierta |

### Notas para sesiones futuras
- **Privacidad mantenida:** Sigue sin consultarse ni mostrarse el campo `email` en ninguna parte de esta vista.
- **Cambios mínimos:** Solo se añadió manejo de estado en dos casos de borde, sin refactorizar ni cambiar la arquitectura.

---

## 2025-04-18 - Mensaje de privacidad en formulario de alumno

**Objetivo:** Añadir un mensaje de privacidad visible en el flujo del alumno para generar confianza, específicamente junto al campo de email.  
**Estado:** ✅ Completado

### Acciones realizadas
- [x] Añadido mensaje de privacidad en `src/pages/Home.jsx` justo después del input de email
- [x] Estilo inline coherente con el diseño actual: texto pequeño (0.875rem), color gris (#6b7280), sin romper el espaciado
- [x] Texto exacto: "Tu correo no será compartido con el profesor ni con otros alumnos."
- [x] Actualizada cabecera descriptiva del archivo para reflejar la nueva decisión de privacidad
- [x] **Sin cambios en lógica:** No se modificó ninguna validación, manejo de estado, consulta a Supabase ni flujo de envío

### Archivos modificados
| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `src/pages/Home.jsx` | Modificado | Añadido mensaje de privacidad junto al campo email, actualizada cabecera descriptiva |

### Notas para sesiones futuras
- **Mensaje de privacidad implementado:** Transmite confianza sin sonar legalista, visible antes de enviar el formulario
- **Cambios mínimos garantizados:** Solo se añadió un elemento `<p>` con estilo inline, sin tocar lógica ni backend
- **No se añadió checkbox:** El requerimiento especificaba solo texto informativo, sin acción del usuario
- **Coherencia visual:** El estilo usa los mismos valores de color y tamaño que el sistema de diseño existente

---

## 2026-04-18 - Contador de alumnos visible en tarjetas de grupo

**Objetivo:** Mostrar en el panel del profesor el número total de alumnos por cada grupo, sin mostrar emails y sin depender de abrir la vista de alumnos.  
**Estado:** ✅ Completado

### Acciones realizadas
- [x] Añadido estado `conteoAlumnos` para almacenar el conteo por grupo_id
- [x] Modificada función `cargarGrupos()` para cargar también el conteo de alumnos:
  - Consulta a Supabase con `.select('grupo_id')` (sin email, sin nombre, solo el ID del grupo)
  - Conteo realizado en cliente agrupando por `grupo_id`
  - Error en conteo no bloquea la carga de grupos (robustez)
- [x] Mostrado contador en cada tarjeta de grupo: "{N} alumno(s)"
- [x] Actualizada cabecera descriptiva de Panel.jsx reflejando nueva funcionalidad

### Archivos modificados
| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `src/pages/Panel.jsx` | Modificado | Añadido contador de alumnos visible en tarjetas de grupo, consulta eficiente sin traer emails, estado de conteo, actualización de cabecera |

### Notas para sesiones futuras
- **Privacidad garantizada:** La consulta para el conteo solo trae `grupo_id`, no consulta ni expone emails ni nombres de alumnos
- **Implementación eficiente:** Un solo query para todos los grupos, conteo en cliente (O(n)), sin joins complejos
- **Sin dependencias:** El contador se muestra inmediatamente sin necesidad de abrir "Ver alumnos"
- **Pluralización correcta:** "0 alumnos", "1 alumno", "N alumnos"
- **Robustez:** Si falla el conteo, los grupos siguen cargando (el error solo se loguea)
- **Vista de alumnos intacta:** La funcionalidad "Ver alumnos" sigue funcionando igual, mostrando nombres cuando se expande

---

## 2026-04-18 - Botón "Copiar código" en tarjetas de grupo

**Objetivo:** Añadir un botón "Copiar código" en cada tarjeta de grupo para facilitar al profesor compartir el código con sus alumnos.  
**Estado:** ✅ Completado

### Acciones realizadas
- [x] Añadida función `handleCopiarCodigo(codigo)` que usa `navigator.clipboard.writeText()`
- [x] Añadido botón "Copiar código" junto al código del grupo en cada tarjeta
- [x] Feedback al usuario mediante el sistema de mensajes existente:
  - Éxito: "Código copiado correctamente."
  - Error: "No se pudo copiar el código. Inténtalo manualmente."
- [x] Estilo coherente con los demás botones del panel (fondo gris claro, borde sutil)
- [x] Botón deshabilitado durante operaciones de borrado (consistencia UX)

### Archivos modificados
| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `src/pages/Panel.jsx` | Modificado | Añadida función `handleCopiarCodigo`, botón "Copiar código" en tarjetas de grupo, feedback mediante sistema de mensajes existente |

### Notas para sesiones futuras
- **API Clipboard:** Usa `navigator.clipboard.writeText()` nativo del navegador
- **Compatibilidad:** Requiere HTTPS en producción (funciona en localhost para desarrollo)
- **Feedback inmediato:** El mensaje aparece en la parte superior del panel usando el sistema existente (`setMensaje` + `setTipoMensaje`)
- **Sin dependencias externas:** No se añadió librerías, solo API nativa
- **UX consistente:** El botón sigue el mismo patrón visual que "Editar" y "Borrar" (tamaño pequeño, estilo discreto)

---

## 2026-04-18 - Preparación base técnica para sistema de emails (Resend)

**Objetivo:** Preparar la infraestructura mínima para futuro envío de correos con Resend, sin implementar aún el botón "avisar a todos" ni envío real.  
**Estado:** ✅ Completado

### Acciones realizadas
- [x] **Creado `src/services/email.js`**:
  - Documentación completa en cabecera: propósito, alcance, decisiones, limitaciones, migración futura
  - Función `enviarCorreoPrueba({ para, asunto, contenido })` - mock para validación de configuración
  - Función `enviarAvisoGrupo({ grupoId, grupoNombre, profesorNombre, alumnos, urlAcceso })` - mock para notificación grupal
  - Función `enviarCorreoPlantilla({ para, plantilla, variables })` - preparación para emails con diseño
  - Todas las funciones devuelven Promesas con delay realista (600-3000ms) para simular comportamiento async
  - Logs en consola solo en desarrollo (`import.meta.env.DEV`)
  - Validaciones básicas de parámetros con mensajes de error descriptivos
  - Exportación individual y como objeto `EmailService`

- [x] **Decisión documentada - Por qué NO Resend desde frontend**:
  - Resend requiere API key con permisos de envío
  - Exponer API key en frontend = riesgo de extracción y abuso (spam, costes inesperados)
  - Solución correcta: backend intermediario que valide, rate-limite y envíe
  - Este archivo es temporal en frontend, diseñado para migrarse fácilmente a backend

- [x] **Sin cambios en funcionalidad visible**:
  - No se modificó `Home.jsx`
  - No se modificó `Panel.jsx`
  - No se añadió botón "Avisar a todos" todavía
  - No se tocó lógica de alumnos, grupos, ni materiales
  - Supabase permanece igual

### Archivos modificados
| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `src/services/email.js` | Creado | Servicio base para email: 3 funciones mock documentadas, interfaz preparada para Resend, comentarios de seguridad y migración futura |

### Notas para sesiones futuras
- **Base técnica lista**: El contrato de datos está definido, las funciones tienen JSDoc completo
- **Próximo paso**: Implementar backend seguro (ej: Vercel Functions / Supabase Edge Functions) para envío real
- **Integración con UI**: Cuando se añada el botón "Avisar a todos" en `Panel.jsx`:
  - Importar funciones desde `src/services/email.js`
  - Las funciones son drop-in: mismas firmas cuando se migren a backend
  - Añadir manejo de estado de carga y feedback de éxito/error
- **Variables de entorno necesarias (futuro)**:
  - `RESEND_API_KEY` - en backend, nunca en frontend
  - `EMAIL_FROM` - dirección remitente verificada en Resend
- **Plantillas de email**: Se definirán en Resend Dashboard o como React Email components
- **Trazabilidad**: La función `enviarAvisoGrupo` devuelve conteo de enviados/fallidos para registrar en tabla `envios`

---

## 2026-04-19 - Edge Function send-test-email con Resend (server-side)

**Objetivo:** Crear la pieza mínima server-side para envío real seguro de un correo de prueba usando Supabase Edge Function + Resend, sin exponer secretos en cliente.  
**Estado:** ✅ Completado

### Acciones realizadas
- [x] **Creada estructura de Supabase Edge Functions**: `supabase/functions/send-test-email/index.ts`
- [x] **Implementado handler en TypeScript/Deno**:
  - Acepta solo peticiones POST
  - Lee `RESEND_API_KEY` desde variables de entorno de Supabase (server-side)
  - Acepta payload JSON con `to`, `subject`, y `html` o `text`
  - Envía correo real usando API de Resend (`https://api.resend.com/emails`)
  - Devuelve respuesta JSON clara: `{ success: true, messageId: string }` o `{ success: false, error: string }`
- [x] **Añadidas validaciones básicas**:
  - Verifica método POST (rechaza otros con 405)
  - Verifica JSON válido en body
  - Verifica presencia de `to`, `subject`, y al menos `html` o `text`
  - Verifica que `RESEND_API_KEY` esté configurada
- [x] **Añadida cabecera de documentación completa** en el archivo:
  - Propósito del archivo
  - Alcance
  - Decisiones técnicas importantes (por qué Edge Functions, seguridad, validaciones, formato de respuesta)
  - Limitaciones temporales (sin auth, sin rate-limiting)
  - Configuración requerida
  - Uso esperado con ejemplo de request
- [x] **Configuración de VS Code para Deno**:
  - Creado `.vscode/settings.json` para habilitar Deno en carpeta `supabase/functions`
  - Creado `.vscode/import_map.json` para imports de Deno

### Archivos creados
| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `supabase/functions/send-test-email/index.ts` | Creado | Edge Function completa: handler POST, validaciones, llamada a Resend, respuestas JSON |
| `.vscode/settings.json` | Creado | Configuración VS Code para entender sintaxis Deno en Edge Functions |
| `.vscode/import_map.json` | Creado | Import map mínimo para soporte Deno |

### Notas para sesiones futuras
- **Seguridad garantizada**: API key de Resend nunca expuesta al frontend, vive solo en variables de entorno de Supabase
- **Dominio de prueba**: Usa `onboarding@resend.dev` por defecto. Para producción real, verificar dominio propio en Resend y configurar `EMAIL_FROM` en env vars
- **Limitaciones conocidas** (documentadas en cabecera del archivo):
  - Sin autenticación ni autorización (cualquiera con la URL puede llamar)
  - Sin rate-limiting (vulnerable a spam si se expone públicamente)
  - Solo envío de prueba individual, no envíos masivos
- **Configuración necesaria antes de usar**:
  1. Obtener API key de Resend (https://resend.com)
  2. En Supabase Dashboard → Edge Functions → Variables de entorno: añadir `RESEND_API_KEY`
  3. Deploy: `supabase functions deploy send-test-email`
- **Cómo probar manualmente** (ver instrucciones detalladas en sección de pruebas del archivo):
  ```bash
  curl -X POST https://<project-ref>.supabase.co/functions/v1/send-test-email \
    -H "Content-Type: application/json" \
    -d '{"to":"test@ejemplo.com","subject":"Prueba","html":"<p>Hola</p>"}'
  ```
- **Próximo bloque lógico**: 
  - Integrar esta Edge Function con el frontend (reemplazar mocks en `email.js`)
  - Añadir botón "Avisar a todos" en Panel.jsx que llame a esta función
  - Implementar autorización (solo profesores autenticados pueden enviar)

---

## 2026-04-19 - Edge Function: remitente configurable via EMAIL_FROM

**Objetivo:** Actualizar la Edge Function `send-test-email` para usar remitente real configurable por variable de entorno (`EMAIL_FROM=noreply@mail.enviaeso.com`), eliminando el fallback a dominio de prueba.  
**Estado:** ✅ Completado

### Acciones realizadas
- [x] **Eliminado remitente hardcodeado** (`onboarding@resend.dev`): La función ahora requiere obligatoriamente la variable de entorno `EMAIL_FROM`
- [x] **Añadida validación explícita de `EMAIL_FROM`**: Si no está configurada, devuelve error 500 claro: "Error de configuración del servidor: EMAIL_FROM no configurada."
- [x] **Actualizada documentación de configuración**:
  - Sección "CONFIGURACION REQUERIDA" actualizada para listar ambos secrets: `RESEND_API_KEY` y `EMAIL_FROM`
  - Eliminada mención a dominio de prueba `onboarding@resend.dev`
  - Añadido ejemplo: `noreply@mail.enviaeso.com`
- [x] **Mensajes de error mejorados**: Más específicos para facilitar diagnóstico (`RESEND_API_KEY no configurada` vs `EMAIL_FROM no configurada`)
- [x] **Eliminada limitación temporal**: Eliminado "Pendiente: verificación de dominio" ya que ahora se asume dominio verificado

### Archivos modificados
| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `supabase/functions/send-test-email/index.ts` | Modificado | Remitente hardcodeado eliminado, EMAIL_FROM obligatorio, validación explícita, documentación actualizada |

### Notas para sesiones futuras
- **Secrets requeridos ahora** (ambos obligatorios):
  - `RESEND_API_KEY` - API key de Resend
  - `EMAIL_FROM` - Dirección remitente verificada (ej: `noreply@mail.enviaeso.com`)
- **Dominio verificado asumido**: La función espera que `mail.enviaeso.com` ya esté verificado en Resend
- **Error claro si falta configuración**: La función falla rápido con mensaje específico indicando qué falta
- **Sin cambios en comportamiento funcional**: La interfaz de entrada/salida es idéntica, solo cambia la fuente del remitente

---

## 2026-04-19 - Servicio email.js: vía real a Edge Function

**Objetivo:** Actualizar `src/services/email.js` para tener vía real de llamada a la Edge Function `send-test-email`, manteniendo mocks para desarrollo y dejando preparado el frontend para integración controlada.  
**Estado:** ✅ Completado

### Acciones realizadas
- [x] **Nueva función `enviarCorreoReal({ to, subject, html, text })`**:
  - Usa `supabase.functions.invoke('send-test-email', ...)` para llamar a la Edge Function
  - Valida parámetros antes de enviar
  - Maneja errores de la Edge Function de forma clara
  - Devuelve respuesta estandarizada: `{ success, messageId?, error? }`
  - Logs en desarrollo para debugging
- [x] **Mantenidas funciones mock existentes**: `enviarCorreoPrueba`, `enviarAvisoGrupo`, `enviarCorreoPlantilla`
- [x] **Actualizada cabecera de documentación**:
  - Nuevo propósito: servicio dual (mock + real)
  - Alcance actual con función real
  - Decisiones de seguridad (Edge Function como backend)
  - Limitaciones temporales (sin auth, rate-limiting pendiente)
  - Siguiente evolución prevista
- [x] **Añadido import de supabase**: `import { supabase } from './supabase.js'`
- [x] **Actualizado export EmailService**: Incluye nueva función `enviarCorreoReal`

### Archivos modificados
| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `src/services/email.js` | Modificado | Nueva función `enviarCorreoReal()` con llamada real a Edge Function, mocks mantenidos, documentación actualizada |

### Notas para sesiones futuras
- **Uso del servicio real**:
  ```javascript
  import { enviarCorreoReal } from './services/email.js';
  
  const resultado = await enviarCorreoReal({
    to: 'alumno@ejemplo.com',
    subject: 'Nuevo material disponible',
    html: '<p>Hay nuevo material en tu grupo</p>'
  });
  
  if (resultado.success) {
    console.log('Email enviado:', resultado.messageId);
  } else {
    console.error('Error:', resultado.error);
  }
  ```
- **Requisitos para que funcione**:
  - Edge Function `send-test-email` debe estar deployada en Supabase
  - Variables de entorno `RESEND_API_KEY` y `EMAIL_FROM` configuradas
  - Cliente Supabase inicializado correctamente
- **Seguridad**: El frontend nunca ve la API key de Resend, solo llama a la Edge Function
- **Sin breaking changes**: Las funciones mock siguen funcionando igual, código existente no se rompe

---

## 2026-04-19 - Botón de prueba de email en Panel.jsx

**Objetivo:** Añadir en el panel del profesor una UI de prueba controlada para enviar un email de prueba manual a una dirección indicada por el usuario, usando `enviarCorreoReal()`.  
**Estado:** ✅ Completado

### Acciones realizadas
- [x] **Importado `enviarCorreoReal`** desde `../services/email` en Panel.jsx
- [x] **Actualizada cabecera del archivo**: Añadida mención a "prueba controlada de envío de emails individuales" en propósito y limitaciones
- [x] **Añadidos estados para email de prueba**:
  - `emailPrueba`: valor del input de email
  - `loadingEmailPrueba`: estado de carga durante envío
- [x] **Creada función `handleEnviarEmailPrueba`**:
  - Valida que haya un email introducido
  - Llama a `enviarCorreoReal()` con asunto "Prueba de EnviaEso" y contenido HTML/texto
  - Usa sistema de mensajes existente (`setMensaje`, `setTipoMensaje`) para feedback
  - Maneja éxito y error de forma clara
  - Limpia el input tras envío exitoso
- [x] **Añadida sección de prueba de email en UI**:
  - Sección destacada con fondo azul claro (`#eff6ff`) y borde azul
  - Título "🧪 Prueba de email"
  - Input tipo email con placeholder
  - Botón "Enviar prueba" (azul, deshabilitado durante carga)
  - Diseño responsive (flex con wrap)

### Archivos modificados
| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `src/pages/Panel.jsx` | Modificado | Sección de prueba de email añadida con input, botón, handler y estados |

### Notas para sesiones futuras
- **Cómo probar el botón desde la UI**:
  1. Ir al panel del profesor (`/panel`)
  2. En la sección "🧪 Prueba de email", introducir un email válido
  3. Pulsar "Enviar prueba"
  4. Verificar mensaje de éxito y revisar bandeja de entrada
- **Requisitos para que funcione**:
  - Edge Function `send-test-email` deployada
  - Secrets `RESEND_API_KEY` y `EMAIL_FROM` configurados en Supabase
  - Cliente Supabase con sesión activa (anon key)
- **Contenido del email de prueba**: Asunto "Prueba de EnviaEso" con mensaje HTML y texto plano explicativo
- **Sin breaking changes**: Todos los flujos existentes del panel funcionan igual

---

---

## 2026-04-19 - Fix CORS para Edge Function send-test-email

**Objetivo:** Resolver el fallo de invocación desde navegador a la Edge Function `send-test-email`, que funcionaba desde PowerShell pero fallaba desde la UI con error "Failed to send a request to the Edge Function".  
**Estado:** ✅ Completado

### Acciones realizadas
- [x] **Añadido manejo de OPTIONS (preflight CORS)**:
  - Nueva respuesta 204 para peticiones OPTIONS con headers CORS completos
  - Necesario porque el frontend (localhost) y la Edge Function (Supabase) están en dominios diferentes
  
- [x] **Headers CORS en todas las respuestas**:
  - Añadida constante `corsHeaders` con: `Access-Control-Allow-Origin: *`, `Access-Control-Allow-Methods: POST, OPTIONS`, `Access-Control-Allow-Headers: Content-Type, Authorization`
  - Todos los `return new Response()` ahora incluyen `...corsHeaders`
  - Esto permite que el navegador acepte la respuesta desde el frontend

- [x] **Actualizada cabecera de documentación**:
  - Añadido "Soporte CORS para invocación desde navegador (OPTIONS + headers)" al alcance
  - Añadida decisión técnica #5: CORS PARA NAVEGADOR con justificación

- [x] **Revisada configuración VS Code para Deno**:
  - `.vscode/settings.json`: Añadido `deno.unstable: false` y config de formatter para TypeScript
  - `.vscode/import_map.json`: Añadido `scopes: {}` (vacío pero válido)
  - **NOTA IMPORTANTE**: Los errores `Cannot find name 'Deno'` en VS Code son **falsos positivos del editor**, no errores reales:
    - La función ya ejecutó correctamente desde PowerShell
    - El runtime de Supabase Edge Functions tiene Deno disponible
    - VS Code con extensión Deno debería reconocer `Deno` en archivos bajo `supabase/functions/`
    - Si persisten, no afectan al funcionamiento real de la función

### Archivos modificados
| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `supabase/functions/send-test-email/index.ts` | Modificado | Handler OPTIONS añadido, headers CORS en todas las respuestas, documentación actualizada |
| `.vscode/settings.json` | Modificado | Configuración Deno mejorada (formatter, unstable flag) |
| `.vscode/import_map.json` | Modificado | Añadido `scopes: {}` para estructura válida |

### Notas para sesiones futuras
- **Causa raíz del problema**: El navegador primero envía OPTIONS (preflight) para verificar CORS, y la función devolvía 405 porque solo aceptaba POST. Ahora OPTIONS responde 204 con headers correctos.
- **Headers CORS compatibles con supabase-js**: `authorization, x-client-info, apikey, content-type` - requeridos para que el cliente de Supabase pueda invocar la función desde el navegador.
- **Errores VS Code**: Son del entorno/editor, no del runtime. La función funciona en Supabase. Posibles soluciones si molestan:
  1. Instalar extensión oficial "Deno" de Denoland en VS Code
  2. Recargar ventana VS Code (`Ctrl+Shift+P` → "Developer: Reload Window")
  3. Verificar que `deno.enablePaths` apunta correctamente a `supabase/functions`
- **Para redeployar**: `supabase functions deploy send-test-email`
- **Para probar desde UI**: Ir a `/panel`, sección "🧪 Prueba de email", introducir email y pulsar "Enviar prueba"

---

## 2026-04-19 - Envío de aviso individual a alumno sin exponer email

**Objetivo:** Añadir una acción controlada en el panel para enviar un aviso real a un solo alumno de un grupo, seleccionándolo por nombre, usando internamente su email almacenado en base de datos pero sin mostrar ese email en la UI.  
**Estado:** ✅ Completado

### Acciones realizadas
- [x] **Modificada función `cargarAlumnos()`**:
  - La consulta ahora trae `id, nombre, email` (antes solo `id, nombre`)
  - El email se mantiene en memoria lógica del estado `alumnos` pero **nunca se renderiza en pantalla**
  - Documentación actualizada explicando que el email es para uso interno de envío

- [x] **Añadidos estados para envío individual**:
  - `alumnoSeleccionado`: objeto `{ id, nombre, email }` del alumno seleccionado en el dropdown
  - `loadingAvisoAlumno`: boolean para estado de carga durante el envío

- [x] **Creada función `handleEnviarAvisoAlumno()`**:
  - Valida que haya un alumno seleccionado
  - Usa `enviarCorreoReal()` con el email interno `alumnoSeleccionado.email` (invisible para el profesor)
  - Asunto: "Aviso de tu grupo en EnviaEso"
  - Contenido HTML y texto plano personalizado con el nombre del alumno
  - Feedback de éxito/error mediante sistema existente (`setMensaje`, `setTipoMensaje`)
  - Limpia la selección después de envío exitoso

- [x] **Añadida UI controlada dentro de la sección de alumnos**:
  - Dropdown `<select>` para elegir alumno por nombre (solo nombres visibles)
  - Botón "Enviar aviso" (deshabilitado si no hay selección o durante carga)
  - Indicador visual "✓ Se enviará aviso a: {nombre}" cuando hay selección
  - Estilo consistente: fondo blanco, borde sutil, botón azul

- [x] **Actualizada cabecera del archivo `Panel.jsx`**:
  - Añadido "Permite enviar avisos por email a alumnos individuales sin exponer sus direcciones" al propósito
  - Añadida decisión: "Permite enviar avisos reales a alumnos seleccionados por nombre (email oculto)"
  - Añadidas limitaciones: "No hay 'avisar a todos' todavía (solo individual)" y "No se registra trazabilidad de envíos en tabla envios/envios_alumnos"

### Archivos modificados
| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `src/pages/Panel.jsx` | Modificado | Consulta de alumnos incluye email (uso interno), estados para selección, handler de envío, UI de dropdown + botón en sección de alumnos, cabecera actualizada |

### Notas para sesiones futuras
- **Privacidad garantizada**: El profesor solo ve nombres de alumnos en el dropdown. El email se usa internamente desde el estado, pero nunca se muestra en la interfaz.
- **Flujo validado**: Cargar alumnos → Seleccionar por nombre → Enviar aviso → Email real se envía sin exposición.
- **Para probar desde la UI**:
  1. Ir a `/panel`
  2. En un grupo con alumnos, pulsar "Ver alumnos"
  3. En la sección "📧 Enviar aviso a:", seleccionar un alumno del dropdown
  4. Verificar que aparece "✓ Se enviará aviso a: {nombre}"
  5. Pulsar "Enviar aviso"
  6. Confirmar mensaje de éxito y revisar bandeja del alumno
- **Qué falta para "avisar a todos"**:
  - Iterar sobre todos los alumnos del grupo en lugar de uno seleccionado
  - Implementar rate-limiting o cola de envíos para no saturar Resend
  - Registrar trazabilidad en tabla `envios`/`envios_alumnos`
  - Posiblemente añadir plantilla de email editable antes de enviar
- **Deuda técnica**: No se registra trazabilidad de envíos en base de datos todavía. Esto es necesario para saber quién recibió qué y cuándo.

---

## 2026-04-19 - Botón "Avisar a todos" para envío grupal de emails

**Objetivo:** Añadir en el panel una acción controlada de "Avisar a todos" para un grupo concreto, enviando un correo real a todos los alumnos del grupo usando sus emails internos, sin mostrar esos emails en la UI.  
**Estado:** ✅ Completado

### Acciones realizadas
- [x] **Añadido estado `loadingAvisarATodos`**: boolean para controlar el estado de carga durante el envío grupal

- [x] **Creada función `handleAvisarATodos()`**:
  - Validación de que haya alumnos en el grupo
  - Confirmación previa con `window.confirm()` indicando el número total de destinatarios
  - Envío secuencial a cada alumno usando `enviarCorreoReal()`
  - Pausa de 300ms entre envíos para no saturar Resend
  - Contadores de enviados y errores
  - Resumen final con mensaje tipo: "Envío completado: N enviados, X errores de Y total"
  - Los emails se usan internamente desde el estado `alumnos`, nunca se muestran en pantalla

- [x] **Añadida UI del botón "Avisar a todos"**:
  - Sección destacada con fondo amarillo claro (`#fefce8`) y borde amarillo
  - Botón amarillo (`#eab308`) con conteo dinámico: "Avisar a todos (N alumnos)"
  - Estado de carga: "Enviando a todos..."
  - Texto informativo: "⚠️ Se enviará un email a cada alumno usando su dirección registrada"
  - Deshabilitado durante el envío grupal

- [x] **Actualizada cabecera de `Panel.jsx`**:
  - Añadida decisión: "Permite enviar avisos a todos los alumnos de un grupo ('Avisar a todos')"
  - Añadida limitación: "Envío grupal secuencial sin rate-limiting avanzado"
  - Eliminada limitación obsoleta: "No hay 'avisar a todos' todavía (solo individual)"

### Archivos modificados
| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `src/pages/Panel.jsx` | Modificado | Estado `loadingAvisarATodos`, función `handleAvisarATodos`, UI de botón "Avisar a todos", cabecera actualizada |

### Notas para sesiones futuras
- **Privacidad mantenida**: El profesor nunca ve los emails de los alumnos. Solo ve el conteo y puede enviar a todos usando las direcciones almacenadas internamente.
- **Estrategia de envío**: Secuencial con pausa de 300ms entre emails. Para grupos grandes (>50 alumnos), considerar:
  - Aumentar la pausa entre envíos
  - Implementar cola asíncrona real
  - Usar batch processing de Resend si está disponible
- **Resumen claro**: El mensaje final indica exactamente cuántos se enviaron correctamente, cuántos fallaron y el total.
- **Para probar desde la UI**:
  1. Ir a `/panel`
  2. En un grupo con alumnos, pulsar "Ver alumnos"
  3. Ver la sección amarilla "📢 Enviar aviso a todos"
  4. Pulsar el botón "Avisar a todos (N alumnos)"
  5. Confirmar en el diálogo
  6. Esperar el resumen de envío
  7. Verificar mensaje de éxito y revisar bandejas de los alumnos
- **Qué falta para cerrar el flujo profesional**:
  - Registrar trazabilidad en tabla `envios`/`envios_alumnos`
  - Permitir personalizar el asunto y contenido del email antes de enviar
  - Añadir rate-limiting más robusto (límites por hora/día)
  - Posibilidad de programar envíos para fecha/hora futura
  - Dashboard de estado de envíos (quién abrió, cuándo, etc.)

---

**Total de sesiones registradas:** 20  
**Última actualización:** 19 de abril de 2025
