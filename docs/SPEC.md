<!--
================================================================================
PROPOSITO DEL ARCHIVO
================================================================================
Especificación funcional del producto. Define QUÉ debe hacer el sistema desde
la perspectiva del usuario, sin entrar en detalles técnicos de implementación.
Sirve como contrato entre stakeholders y desarrollo.

================================================================================
ALCANCE
================================================================================
- Visión general del producto (actualizada a modelo de gestión de grupos)
- Actores principales: Profesor, Alumno, Sistema
- Flujos principales de cada actor
- Modelo conceptual de entidades
- Restricciones del MVP actualizado
- Features fuera de alcance inmediato

================================================================================
DECISIONES IMPORTANTES ACTUALES
================================================================================
- TRES actores: Profesor (gestor), Alumno (consumidor), Sistema (automatiza)
- El profesor TIENE panel de administración para gestionar grupos y materiales
- Los materiales se alojan en la plataforma, NO se envían como adjuntos pesados
- El email es canal de notificación/aviso, NO transporte principal de archivos
- Los alumnos acceden a la web para descargar materiales (tráfico de retorno)
- Trazabilidad completa: quién recibió qué y cuándo

================================================================================
LIMITACIONES O ESTADO TEMPORAL
================================================================================
- Esta es una REALINEACIÓN CONCEPTUAL del producto (versión 0.2)
- Contradice parcialmente la versión anterior (0.1) que enfocaba envío directo
- El flujo del alumno en Home.jsx actual está DESALINEADO con esta especificación
- Se mantiene el enfoque MVP pero con alcance revisado
================================================================================
-->

# SPEC - Especificación Funcional: EnviaEso

## 1. Visión general del producto

EnviaEso es una plataforma de gestión y distribución de materiales educativos que conecta profesores con sus alumnos mediante grupos organizados.

**Propósito actual:** Permitir a los profesores gestionar grupos de clase, distribuir materiales de forma estructurada y mantener trazabilidad de quién ha recibido qué contenidos, eliminando la dispersión de archivos por email y centralizando el acceso.

**Principio rector:** El profesor gestiona, el sistema notifica, el alumno accede. Todo queda registrado.

> **⚠️ Nota de realineación:** Esta especificación (v0.2) representa un cambio de enfoque respecto a la versión anterior. Antes: envío directo de trabajos. Ahora: gestión de grupos con distribución de materiales desde plataforma.

---

## 2. Actores principales

### 2.1 Profesor (Gestor)
- **Objetivo:** Organizar grupos de clase y distribuir materiales de forma controlada
- **Contexto:** Necesita una herramienta para gestionar múltiples grupos, sin depender de enviar archivos por email uno a uno
- **Necesidades:**
  - Crear y administrar grupos/listas de clase
  - Generar códigos de acceso para los alumnos
  - Ver quién está en cada grupo
  - Subir materiales y publicarlos a grupos específicos
  - Consultar historial y estado de distribución
  - Trazabilidad de entregas y accesos

### 2.2 Alumno (Consumidor)
- **Objetivo:** Acceder a los materiales de su clase de forma sencilla
- **Contexto:** No tiene cuenta previa, usa un código proporcionado por el profesor
- **Necesidades:**
  - Acceder mediante código simple
  - Darse de alta con nombre y email
  - Recibir notificación cuando hay nuevos materiales
  - Acceder a una página web con los materiales disponibles
  - Descargar o consultar archivos desde la plataforma
  - Saber que su acceso queda registrado

### 2.3 Sistema (Automatizador)
- **Objetivo:** Orquestar la comunicación y mantener registro de todas las operaciones
- **Funciones:**
  - Generar y validar códigos de grupo
  - Gestionar el almacenamiento de materiales
  - Enviar notificaciones por email (aviso, NO adjunto pesado)
  - Registrar trazabilidad (quién accedió a qué y cuándo)
  - Controlar permisos de acceso

---

## 3. Flujo principal del profesor

### 3.1 Registro y acceso
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ 1. Accede a     │───→│ 2. Registra     │───→│ 3. Accede a     │
│    plataforma   │    │    cuenta       │    │    panel        │
│                 │    │    (email/pass) │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 3.2 Gestión de grupos
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Crea nuevo      │───→│ Define nombre   │───→│ Recibe código   │
│ grupo/lista     │    │ y descripción   │    │ único generado  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                 │
                        ┌────────────────────────┘
                        ▼
                ┌─────────────────┐
                │ Comparte código │
                │ con alumnos     │
                └─────────────────┘
```

### 3.3 Visualización de alumnos
- Accede a grupo específico
- Ve listado de alumnos inscritos (nombre, email, fecha de alta)
- Estado de cada alumno: activo, materiales recibidos, último acceso

### 3.4 Subida y publicación de materiales
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Selecciona      │───→│ Adjunta         │───→│ Selecciona      │
│ grupo destino   │    │ archivo(s)      │    │ opciones de     │
│                 │    │                 │    │ publicación     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                 │
                        ┌────────────────────────┘
                        ▼
                ┌─────────────────┐
                │ Publica:        │
                │ - Guarda en     │
                │   plataforma    │
                │ - Notifica por  │
                │   email         │
                │ - Registra en   │
                │   historial     │
                └─────────────────┘
```

### 3.5 Consulta de historial y estado
- Historial de materiales publicados por grupo
- Estado de envíos: enviado, abierto, descargado
- Fechas y trazabilidad completa

---

## 4. Flujo principal del alumno

### 4.1 Acceso mediante código
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ 1. Recibe       │───→│ 2. Accede a     │───→│ 3. Introduce    │
│    código del   │    │    enviaeso.com │    │    código       │
│    profesor     │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 4.2 Alta en el grupo
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Completa        │───→│ Sistema valida  │───→│ Confirma        │
│ nombre + email  │    │ código y datos  │    │ inscripción     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                 │
                        ┌────────────────────────┘
                        ▼
                ┌─────────────────┐
                │ Recibe email    │
                │ de confirmación │
                │ y bienvenida    │
                └─────────────────┘
```

### 4.3 Recepción de notificaciones (Enlace mágico)

- Email de aviso cuando el profesor publica nuevos materiales
- Contenido del email:
  - **Asunto descriptivo:** indica qué hay disponible
  - **Contexto breve:** de qué grupo se trata
  - **ENLACE MÁGICO:** botón prominente que lleva directo a los materiales
- **NO incluye adjunto pesado:** solo enlace de acceso
- **El enlace incluye token:** permite acceder sin introducir código de nuevo

### 4.4 Acceso mediante enlace mágico (flujo principal)

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Alumno recibe   │───→│ Click en enlace │───→│ Accede          │
│ email con       │    │ del email       │    │ AUTOMÁTICAMENTE │
│ enlace mágico   │    │                 │    │ (sin login)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                         │
        ┌────────────────────────────────────────────────┘
        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Ve lista de     │───→│ Visualiza o     │───→│ Descarga        │
│ materiales del  │    │ previsualiza    │    │ archivos        │
│ grupo           │    │ archivos        │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

**Características del enlace mágico:**
- URL única con token temporal (ej: `/acceso?token=xyz123`)
- No requiere introducir código de grupo (ya está codificado en el token)
- Acceso inmediato sin pantalla intermedia
- Validez: suficiente para la duración del curso/acceso frecuente

### 4.5 Recuperación de acceso (solo por email)

Si el alumno pierde el email o necesita acceder nuevamente:

- **NO hay acceso alternativo con código** una vez inscrito
- El alumno debe solicitar al profesor que reenvíe la notificación
- O contactar al profesor para que genere un nuevo envío/email

> **Nota importante:** El código de grupo solo se utiliza **una vez** durante el alta inicial. Después, todo el acceso es mediante los enlaces mágicos enviados por email.

---

## 5. Modelo conceptual de entidades

### 5.1 Profesor
**Qué representa:** Usuario gestor con capacidad de crear grupos y publicar materiales

**Para qué sirve:**
- Autenticación en el sistema
- Creación y administración de grupos
- Subida y publicación de materiales
- Consulta de trazabilidad

**Relaciones principales:**
- Tiene muchos **Grupos**
- Publica muchos **Materiales**
- Genera muchos **Envíos**

### 5.2 Grupo
**Qué representa:** Una lista o clase de alumnos que reciben los mismos materiales

**Para qué sirve:**
- Agrupar alumnos por asignatura, curso o proyecto
- Controlar quién tiene acceso a qué materiales
- Organizar la distribución de contenidos

**Relaciones principales:**
- Pertenece a un **Profesor**
- Contiene muchos **Alumnos**
- Recibe muchos **Materiales** (publicaciones)
- Tiene un código de acceso único

### 5.3 Alumno
**Qué representa:** Persona inscrita en un grupo que consume materiales

**Para qué sirve:**
- Acceder a los materiales de su grupo
- Recibir notificaciones
- Mantener historial de accesos

**Relaciones principales:**
- Pertenece a un **Grupo**
- Tiene muchos **Envíos** (notificaciones recibidas)
- Genera eventos de acceso y descarga

### 5.4 Material (Archivo)
**Qué representa:** Documento o recurso subido por el profesor para distribución

**Para qué sirve:**
- Almacenar el contenido a distribuir
- Mantener versión y metadatos (nombre, tamaño, tipo, fecha)
- Servir como elemento de la publicación

**Relaciones principales:**
- Subido por un **Profesor**
- Publicado en uno o varios **Grupos** (vía Envío)
- Almacenado en el sistema de archivos

### 5.5 Envío
**Qué representa:** Registro de la publicación de un material a un alumno específico

**Para qué sirve:**
- Trazabilidad: qué material se envió a quién y cuándo
- Estado de entrega: enviado, abierto, descargado
- Métricas y control para el profesor

**Relaciones principales:**
- Un **Material** enviado
- A un **Alumno** específico
- Dentro de un **Grupo**
- Por un **Profesor**

**Estados posibles:**
- `enviado`: notificación enviada por email
- `abierto`: alumno accedió a la web (visto)
- `descargado`: alumno descargó el archivo

---

## 6. Distribución de materiales: Email vs Plataforma

| Aspecto | Email tradicional | Modelo EnviaEso |
|---------|-------------------|-----------------|
| **Transporte de archivo** | Adjunto en email | Almacenado en plataforma |
| **Notificación** | Email con contenido | Email con enlace de acceso |
| **Tamaño límite** | Restricciones del servidor | Mayor capacidad |
| **Trazabilidad** | Limitada o nula | Completa (enviado→visto→descargado) |
| **Reenvíos** | Múltiples copias | Siempre acceso al original |
| **Revocación** | Imposible | Posible (eliminar acceso) |
| **Analytics** | Ninguno | Estadísticas de acceso |

**Prioridad del producto:** Centralizar en la plataforma, usar email como canal de aviso.

---

## 7. Restricciones del MVP actualizado

| Aspecto | Restricción MVP | Justificación |
|---------|-----------------|---------------|
| **Autenticación profesor** | Email + contraseña básica | Necesario para gestionar grupos |
| **Autenticación alumno** | Sin password, acceso por código + email | Reducir fricción, mantener trazabilidad |
| **Grupos por profesor** | Máximo 3-5 grupos | Limitar complejidad inicial |
| **Alumnos por grupo** | Máximo ~50 | Validar escala gradualmente |
| **Materiales por grupo** | Máximo ~10 publicaciones iniciales | Validar uso antes de escalar |
| **Tamaño de archivos** | Hasta 10-25 MB | Límites razonables para MVP |
| **Tipos de archivo** | PDF, imágenes, documentos Office | Evitar ejecutables, priorizar seguridad |
| **Notificaciones** | Email únicamente | Sin push, SMS ni otros canales |
| **Vigencia de materiales** | Sin fecha de caducidad | Simplificar MVP |

---

## 8. Features fuera de alcance inmediato

Estas funcionalidades se considerarán tras validar el MVP:

- **Calendario de publicación:** programar materiales para fecha futura
- **Límites de tiempo de acceso:** materiales con fecha de caducidad
- **Niveles de permiso:** co-profesores, ayudantes, etc.
- **Foros o comentarios:** comunicación alumno-profesor en plataforma
- **Estadísticas avanzadas:** gráficos, análisis de engagement
- **Integraciones LMS:** Moodle, Google Classroom, etc.
- **App móvil nativa:** solo web responsive por ahora
- **Autenticación alternativa:** Google, Microsoft, etc.
- **Múltiples archivos por publicación:** un material = un archivo en MVP
- **Versionado de materiales:** reemplazar archivo manteniendo historial

---

## 9. Criterios de éxito del MVP actualizado

1. [ ] Profesor puede crear cuenta y su primer grupo en menos de 2 minutos
2. [ ] Profesor puede subir un material y publicarlo a un grupo
3. [ ] Alumno puede inscribirse con código y recibir notificación por email
4. [ ] Alumno puede acceder a la web y descargar el material
5. [ ] Profesor puede ver listado de alumnos inscritos y estado de envíos
6. [ ] Todo queda registrado: alta de alumno, envío, apertura, descarga

---

## 10. Preguntas pendientes de resolver

1. ¿El alumno puede pertenecer a múltiples grupos simultáneamente?
2. ¿Un material puede publicarse en múltiples grupos a la vez?
3. ¿Cómo se maneja la baja de un alumno de un grupo?
4. ¿Se permite reenvío de notificación si el alumno no abrió?
5. ¿Qué pasa si un alumno pierde acceso a su email registrado?
6. ¿Hay límite de almacenamiento total por profesor?

---

## 11. Contradicciones resueltas respecto a versión anterior

| Aspecto | Versión 0.1 (anterior) | Versión 0.2 (actual) |
|---------|------------------------|----------------------|
| **Panel profesor** | Fuera de alcance MVP | **Incluido en MVP**, esencial para gestión |
| **Email** | Transporte principal (con adjuntos) | **Canal de notificación** (con enlaces) |
| **Alumno** | Solo emisor de trabajos | **Consumidor de materiales** |
| **Dirección del flujo** | Alumno → Profesor | **Profesor → Alumno** (distribución) |
| **Persistencia** | Temporal/vía email | **Plataforma centralizada** con trazabilidad |
| **Home.jsx actual** | Formulario de "envío" | **Desalineado:** necesita rediseño como portal de acceso |

> **Nota sobre UI actual:** El archivo `app/pages/Home.jsx` implementa un formulario de "envío" que no corresponde con el flujo actual definido en esta especificación. Debe ser actualizado o sustituido en la siguiente iteración de desarrollo frontend.

---

**Versión:** 0.2 (Realineación conceptual)  
**Última actualización:** 15 de abril de 2026  
**Estado:** Especificación base para desarrollo