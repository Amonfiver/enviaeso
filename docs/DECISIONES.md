<!--
================================================================================
PROPOSITO DEL ARCHIVO
================================================================================
Registro de decisiones técnicas y de producto tomadas durante el desarrollo
de EnviaEso. Permite entender el porqué de las elecciones actuales y evita
re-discutir asuntos ya cerrados. Cada entrada debe incluir contexto, opciones
consideradas y justificación de la decisión.

================================================================================
ALCANCE
================================================================================
- Decisiones de producto (funcionalidad, alcance, prioridades)
- Decisiones de metodología (cómo trabajamos)
- Decisiones técnicas ya tomadas (stack, arquitectura, herramientas)
- Decisiones diferidas (lo que decidimos NO decidir aún)

================================================================================
DECISIONES IMPORTANTES ACTUALES
================================================================================
- Formato de registro: tabla con fecha, decisión, contexto y estado
- Estado de decisión: FIRMADA (no se revierte sin discusión) / REVISABLE
- Las decisiones técnicas de implementación aún están por tomar

================================================================================
LIMITACIONES O ESTADO TEMPORAL
================================================================================
- Este archivo se actualiza continuamente conforme se toman nuevas decisiones
- Las decisiones marcadas como "REVISABLE" pueden cambiar durante el desarrollo
- Decisiones antiguas no se borran, se marcan como obsoletas si cambian
================================================================================
-->

# DECISIONES - Registro de Decisiones: EnviaEso

## Cómo usar este documento

Cada decisión registrada incluye:
- **Fecha**: Cuándo se tomó
- **Categoría**: Producto, Metodología, Técnica
- **Decisión**: Qué se decidió
- **Contexto**: Por qué se tomó esta decisión
- **Alternativas**: Qué otras opciones se consideraron
- **Estado**: FIRMADA / REVISABLE / OBSOLETA

---

## Decisiones de Producto

| # | Fecha | Decisión | Contexto | Estado |
|---|-------|----------|----------|--------|
| P001 | 15/04/2026 | **Nombre del proyecto: EnviaEso** | Nombre corto, memorable, acción clara (enviar), público objetivo implícito (estudiantes españoles). Alternativas: "EntregaRápida", "MandaTarea", "EnvioProfe". | FIRMADA |
| P002 | 15/04/2026 | **Enfoque MVP primero** | Validar la idea con un profesor real antes de invertir en funcionalidades avanzadas. Priorizar velocidad sobre completitud. | FIRMADA |
| P003 | 15/04/2026 | **Alumno sin registro obligatorio** | Eliminar fricción máxima en el flujo principal. El alumno accede por código sin password. | REVISADA: sigue válida pero ahora se registra en grupo |
| P004 | 15/04/2026 | **Demo real con profesor el lunes como objetivo inmediato** | Fecha concreta fuerza priorización y evita perfeccionismo prematuro. El feedback real es más valioso que especulaciones. | FIRMADA |
| P005 | 15/04/2026 | **Panel de profesor fuera de alcance para MVP** | ~~El profesor recibe entregas por email. Un panel web se añadirá solo si el feedback lo justifica.~~ | ✅ **REVISADA Y CAMBIADA** - Ver P006 |
| P006 | 15/04/2026 | **Panel de profesor INCLUIDO en MVP** | El profesor necesita gestionar grupos, códigos y materiales. Sin panel no hay producto viable. La complejidad se justifica por ser el núcleo del flujo. | FIRMADA (sustituye a P005) |
| P007 | 15/04/2026 | **El profesor gestiona múltiples grupos/listas** | Un profesor puede tener varias clases/asignaturas, cada una con su código y alumnos independientes. | FIRMADA |
| P008 | 15/04/2026 | **Los alumnos se asocian a grupos mediante códigos** | Código único por grupo que el profesor comparte. El alumno introduce el código para unirse. | FIRMADA |
| P009 | 15/04/2026 | **Los materiales se sirven desde la plataforma** | Los archivos se almacenan en Supabase Storage y se acceden desde la web. NO se envían como adjuntos por email. | FIRMADA |
| P010 | 15/04/2026 | **El email es canal de aviso/acceso, no transporte de archivos** | El email notifica y contiene enlace a la plataforma. El archivo pesado se descarga desde la web. | FIRMADA |
| P011 | 15/04/2026 | **El tráfico de retorno a la plataforma es deseable** | El alumno debe volver a la web para descargar. Esto permite trazabilidad y engagement. | FIRMADA |
| P012 | 15/04/2026 | **Trazabilidad completa de envíos y accesos** | Registrar quién recibió qué, cuándo lo abrió y cuándo lo descargó. Esto es valor diferencial para el profesor. | FIRMADA |
| P013 | 15/04/2026 | **No prometer "sin límite" como claim técnico literal** | En esta fase se establecen límites explícitos (tamaño de archivo, número de grupos, etc.) para gestionar expectativas y recursos. | FIRMADA |

---

## Decisiones de Metodología

| # | Fecha | Decisión | Contexto | Estado |
|---|-------|----------|----------|--------|
| M001 | 15/04/2026 | **Spec Driven Development (SDD)** | Documentar QUÉ se construye antes de construirlo. Reduce malentendidos y permite validar el enfoque antes de código. | FIRMADA |
| M002 | 15/04/2026 | **Trabajo incremental y cambios pequeños** | Iteraciones cortas, revisables fácilmente. Evita grandes PRs imposibles de revisar. Cada cambio debe tener un propósito claro. | FIRMADA |
| M003 | 15/04/2026 | **Documentación viva obligatoria** | Los documentos en `docs/` se actualizan junto con el código. No hay "documentación desfasada". | FIRMADA |
| M004 | 15/04/2026 | **Cabeceras descriptivas en todos los archivos** | Cada archivo de código o documento debe incluir en su cabecera: propósito, alcance, decisiones actuales, limitaciones. Facilita que cualquier agente entienda el contexto rápidamente. | FIRMADA |
| M005 | 15/04/2026 | **Bitácora obligatoria de cambios** | Cada sesión de trabajo se registra en `docs/BITACORA.md` con fecha, acciones realizadas y archivos modificados. Trazabilidad completa del desarrollo. | FIRMADA |
| M006 | 15/04/2026 | **Cline como agente de desarrollo** | Uso de agentes de IA (Cline) para implementación siguiendo especificaciones. El humano define QUÉ, el agente propone CÓMO. | FIRMADA |

---

## Decisiones Técnicas

| # | Fecha | Decisión | Contexto | Estado |
|---|-------|----------|----------|--------|
| T001 | 15/04/2026 | **Arquitectura monolítica inicial** | Sin microservicios ni separación excesiva para el MVP. Un único despliegue simple. | REVISABLE si escala |
| T002 | 15/04/2026 | ~~Sin base de datos compleja para MVP~~ | Evaluar si el email puede ser el único almacenamiento inicial. | ✅ **OBSOLETA** - Ver T006 |
| T003 | 15/04/2026 | **Principio de simplicidad absoluta** | Elegir siempre la solución más simple que funcione. "Menos es más" como guía técnica. | FIRMADA |
| T004 | 15/04/2026 | **Dos frontends: público (alumno) + privado (profesor)** | Separación clara de responsabilidades. El alumno no necesita auth compleja, el profesor sí. | FIRMADA |
| T005 | 15/04/2026 | **Supabase como BaaS completo** | Auth, PostgreSQL y Storage en una plataforma. RLS para seguridad. Reduce infraestructura propia. | FIRMADA |
| T006 | 15/04/2026 | **Supabase Storage para almacenamiento de archivos** | Materiales se almacenan aquí, no se envían como adjuntos. URLs firmadas para acceso controlado. | FIRMADA |
| T007 | 15/04/2026 | **Resend solo para notificaciones, no transporte de archivos** | El email avisa, el archivo se descarga de la plataforma. Evita límites de tamaño de adjuntos. | FIRMADA |
| T008 | 15/04/2026 | **Trazabilidad mediante base de datos** | Tablas de auditoría para registrar envíos, aperturas, descargas. No depender de logs externos. | FIRMADA |

---

## Decisiones Técnicas adicionales (Iteración 4)

| # | Fecha | Decisión | Contexto | Estado |
|---|-------|----------|----------|--------|
| T009 | 15/04/2026 | **Un solo frontend con rutas separadas** | "/" para alumno, "/panel/*" para profesor. Un solo proyecto React con React Router. Simplifica despliegue y comparte componentes. | FIRMADA |
| T010 | 15/04/2026 | **Enlace mágico para acceso de alumnos** | Token en URL (ej: /acceso?token=xyz) permite acceso sin login ni código. El alumno hace click y entra directamente a sus materiales. | FIRMADA |
| T011 | 15/04/2026 | **Trazabilidad simplificada en MVP** | Solo estado "enviado" en tabla envios_alumnos. Estados "abierto" y "descargado" quedan para post-MVP. | FIRMADA |

---

## Decisiones revisadas (Iteración 5)

| # | Fecha | Decisión | Contexto | Estado |
|---|-------|----------|----------|--------|
| P014 | 15/04/2026 | **Código de grupo solo para alta inicial** | El código se usa **una sola vez** durante la inscripción del alumno. No se permite usar el código para recuperar acceso posteriormente. | FIRMADA |
| P015 | 15/04/2026 | **Recuperación de acceso solo por email** | Si el alumno pierde el acceso, debe solicitar al profesor que reenvíe la notificación. No hay flujo de recuperación autónomo. | FIRMADA |
| T012 | 15/04/2026 | **Tabla envios_materiales para vinculación explícita** | Relación muchos-a-muchos entre envíos y materiales. Permite seleccionar qué materiales específicos incluir en cada envío. | FIRMADA |
| T013 | 15/04/2026 | **Alumnos como inscripciones por grupo (no identidad global)** | En MVP, la tabla alumnos representa una inscripción específica a un grupo, no una persona única. El mismo email puede estar en múltiples grupos como registros separados. | FIRMADA |

---

## Decisiones Diferidas (pendientes de resolver)

Estas decisiones se tomarán durante la implementación:

| # | Tema | Opciones en consideración | Cuándo decidir |
|---|------|---------------------------|----------------|
| D001 | ¿Cómo generar tokens de enlace mágico? | JWT con alumno_id / Token aleatorio con lookup en BD / UUID simple | Implementación de acceso alumno |
| D002 | Generación de códigos de grupo | UUID corto / NanoID / Secuencial numérico | UX del alumno (qué es más fácil recordar) |
| D003 | URLs de Storage: firmadas siempre o públicas con RLS | Firmadas time-limited / Públicas con control de acceso en BD | Balance seguridad/UX |
| D004 | Edge Functions para procesamiento de emails | Sí (más control) / No (llamada directa a Resend desde frontend) | Complejidad vs control |

---

## Decisiones Rechazadas (registro de opciones descartadas)

| Fecha | Opción | Razón de rechazo | Alternativa elegida |
|-------|--------|------------------|---------------------|
| 15/04/2026 | Autenticación completa para alumnos (login/password) | Añade fricción innecesaria para el problema que resolvemos | Flujo anónimo sin registro |
| 15/04/2026 | Panel web para profesor en MVP | Aumenta complejidad y tiempo de desarrollo significativamente | Email como interfaz inicial |
| 15/04/2026 | Base de datos relacional desde el inicio | Infraestructura adicional no justificada para validación inicial | Evaluar necesidad real durante MVP |
| 15/04/2026 | Diseño de arquitectura completa antes de empezar | Parálisis por análisis, validación lenta | Arquitectura emergente, decidir sobre la marcha |

---

## Plantilla para nuevas decisiones

```
### DEC-XXX: [Título de la decisión]

**Fecha:** [DD/MM/YYYY]  
**Categoría:** [Producto / Metodología / Técnica]  
**Estado:** [FIRMADA / REVISABLE / OBSOLETA]

**Decisión:**
[Descripción clara de qué se decidió]

**Contexto:**
[Por qué se tomó esta decisión, qué problema resuelve]

**Alternativas consideradas:**
- [Opción A]: [por qué se rechazó]
- [Opción B]: [por qué se rechazó]

**Consecuencias:**
[Qué implica esta decisión para el desarrollo futuro]

**Referencias:**
[Links a documentos, discusiones, etc.]
```

---

**Versión:** 0.1 (Decisiónes iniciales)  
**Última actualización:** 15 de abril de 2026  
**Total decisiones registradas:** 10 FIRMADAS, 3 REVISABLES, 6 DIFERIDAS

> **Nota:** Este documento es de consulta obligatoria antes de proponer cambios que contradigan decisiones previas.