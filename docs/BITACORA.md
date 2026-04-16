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

**Total de sesiones registradas:** 5  
**Última actualización:** 15 de abril de 2025
