<!--
================================================================================
PROPOSITO DEL ARCHIVO
================================================================================
Describe la arquitectura técnica propuesta para EnviaEso. Define CÓMO se
construirá el sistema a alto nivel, identificando componentes principales y
sus interacciones. Actualizado a modelo de gestión de grupos con distribución
desde plataforma (no envío de adjuntos por email).

================================================================================
ALCANCE
================================================================================
- Visión de arquitectura a alto nivel (actualizada a modelo dual frontend)
- Componentes principales: frontend público, frontend privado, backend/BaaS,
  almacenamiento, notificaciones, trazabilidad
- Decisiones técnicas provisionales con justificación MVP
- Principios de arquitectura alineados al caso de uso actual
- Riesgos y decisiones pendientes

================================================================================
DECISIONES IMPORTANTES ACTUALES
================================================================================
- Dos frontends separados: público (alumno) y privado (profesor/panel)
- Supabase como BaaS completo: auth, base de datos, storage
- Supabase Storage para almacenamiento de materiales
- Resend solo para notificaciones, NO para transporte de archivos
- Email como canal de aviso, la plataforma como canal de acceso
- Trazabilidad mediante registros en base de datos (tabla envíos/auditoría)

================================================================================
LIMITACIONES O ESTADO TEMPORAL
================================================================================
- Esta es una REALINEACIÓN de arquitectura tras cambio de modelo de negocio
- El stack (Vite+React, Supabase, Resend, Vercel) se mantiene pero con usos
  diferentes a los inicialmente previstos
- La estructura de datos exacta (esquema SQL) aún no está definida
- La separación de frontends puede ser por rutas o despliegues separados (TBD)
================================================================================
-->

# ARCHITECTURE - Arquitectura Técnica: EnviaEso

## 1. Principios de diseño

Esta arquitectura se rige por los siguientes principios, en orden de prioridad:

| Prioridad | Principio | Aplicación |
|-----------|-----------|------------|
| 1 | **Centralización en plataforma** | Los archivos viven en Supabase Storage, no en emails |
| 2 | **Simplicidad** | La solución más simple que cumpla los requisitos |
| 3 | **Trazabilidad** | Todo evento significativo queda registrado |
| 4 | **Validación rápida** | Priorizar demo funcional sobre diseño perfecto |
| 5 | **Tráfico de retorno** | El alumno debe volver a la web (valor para el profesor) |

> **⚠️ IMPORTANTE:** Esta es una **REALINEACIÓN** de arquitectura tras cambio de modelo. Antes: envío directo de adjuntos. Ahora: gestión de grupos con distribución desde plataforma.

---

## 2. Vista de arquitectura de alto nivel

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              USUARIOS                                       │
│                     ┌─────────────────┐    ┌─────────────────┐              │
│                     │   ALUMNO        │    │   PROFESOR      │              │
│                     │   (público)     │    │   (privado)     │              │
│                     └────────┬────────┘    └────────┬────────┘              │
└──────────────────────────────┼──────────────────────┼──────────────────────┘
                               │                      │
                               └──────────┬───────────┘
                                          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React + Vite)                             │
│                                                                             │
│  ┌─────────────────────────────┐    ┌─────────────────────────────────────┐ │
│  │      RUTA "/"               │    │      RUTA "/panel/*"                │ │
│  │      (acceso alumno)        │    │      (panel profesor)               │ │
│  │                             │    │                                     │ │
│  │  - Acceso por código        │    │  - Login con email/pass             │ │
│  │  - Alta en grupo            │    │  - Gestión de grupos                │ │
│  │  - Listado de materiales    │    │  - Subida de archivos               │ │
│  │  - Descarga de archivos     │    │  - Vista de alumnos                 │ │
│  │                             │    │  - Creación de envíos               │ │
│  │                             │    │                                     │ │
│  └────────────────┬────────────┘    └────────────────────┬────────────────┘ │
│                   │                                      │                  │
│                   └──────────────────┬───────────────────┘                  │
│                                      │                                     │
└──────────────────────────────────────┼─────────────────────────────────────┘
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         BACKEND (Supabase)                                  │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  AUTENTICACIÓN                                                      │   │
│  │  - Solo profesores (email/pass)                                     │   │
│  │  - Alumnos: acceso sin login (enlace mágico/token)                  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  BASE DE DATOS (PostgreSQL)                                         │   │
│  │                                                                     │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌───────────┐  │   │
│  │  │ profesores  │  │   grupos    │  │  alumnos    │  │ materiales│  │   │
│  │  ├─────────────┤  ├─────────────┤  ├─────────────┤  ├───────────┤  │   │
│  │  │ id          │  │ id          │  │ id          │  │ id        │  │   │
│  │  │ email       │  │ profesor_id │  │ grupo_id    │  │ grupo_id  │  │   │
│  │  │ created_at  │  │ nombre      │  │ nombre      │  │ nombre    │  │   │
│  │  └─────────────┘  │ codigo      │  │ email       │  │ archivo   │  │   │
│  │                   │ created_at  │  │ created_at  │  │ created_at│  │   │
│  │                   └─────────────┘  └─────────────┘  └───────────┘  │   │
│  │                                                                     │   │
│  │  ┌─────────────┐  ┌─────────────────────────────────────────────┐  │   │
│  │  │   envios    │  │          envios_alumnos                     │  │   │
│  │  ├─────────────┤  ├─────────────────────────────────────────────┤  │   │
│  │  │ id          │  │ id                                          │  │   │
│  │  │ grupo_id    │  │ envio_id                                    │  │   │
│  │  │ descripcion │  │ alumno_id                                   │  │   │
│  │  │ fecha_envio │  │ estado ("enviado")                          │  │   │
│  │  │ created_at  │  │ created_at                                  │  │   │
│  │  └─────────────┘  └─────────────────────────────────────────────┘  │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  ROW LEVEL SECURITY (RLS)                                           │   │
│  │  - Profesor solo ve sus grupos                                      │   │
│  │  - Alumno solo accede a su grupo                                    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└──────────────────────────┬────────────────────────────────────────────────┘
                           │
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
┌─────────────────┐ ┌──────────────┐ ┌─────────────────┐
│  STORAGE        │ │   RESEND     │ │  EDGE FUNCTIONS │
│                 │ │   (Email)    │ │  (si necesario) │
│  - Bucket       │ │              │ │                 │
│    "materiales" │ │  • Notificar │ │  • Generar      │
│  - Organizado:  │ │    nuevo     │ │    enlaces      │
│    profesor_id/ │ │    envío     │ │    mágicos      │
│    grupo_id/    │ │  • Enlace    │ │  • Procesar     │
│    archivo      │ │    de acceso │ │    post-subida  │
└─────────────────┘ └──────────────┘ └─────────────────┘
```

> **Simplificación MVP:** Un solo frontend React con React Router. Rutas separadas para alumno (público) y panel profesor (protegido).

---

## 3. Componentes principales

### 3.1 Frontend React (Aplicación única)

**Responsabilidad:** Única aplicación React que sirve tanto al flujo de alumno como al panel de profesor mediante rutas separadas.

**Estructura de rutas:**
```
/                    → Portal de acceso para alumnos
  ├── /              → Página principal (introducir código o email)
  ├── /acceder       → Acceso con código de grupo
  ├── /grupo         → Listado de materiales del alumno (protegido por token)
  └── /acceso        → Acceso con enlace mágico (token)

/panel/*             → Panel de administración para profesores (protegido por auth)
  ├── /panel         → Dashboard con resumen de grupos
  ├── /panel/grupos  → Gestión de grupos (CRUD)
  ├── /panel/grupos/:id/alumnos → Listado de alumnos del grupo
  ├── /panel/grupos/:id/materiales → Subida y gestión de materiales
  └── /panel/envios  → Historial de envíos
```

**Características:**
- **Rutas públicas (/):** Acceso para alumnos sin autenticación tradicional
- **Rutas protegidas (/panel/*):** Requieren login de profesor (Supabase Auth)
- **Enlace mágico (/acceso?token=xyz):** Acceso directo del alumno sin login
- **React Router:** Navegación SPA entre todas las rutas

**Funciones - Flujo Alumno:**
- Formulario de acceso por código de grupo
- Registro de alumno (nombre + email) al unirse
- Visualización de materiales disponibles
- Descarga de archivos desde Supabase Storage
- Visualización de estado (enviado)

**Funciones - Panel Profesor:**
- Login con email/contraseña
- Dashboard con resumen de grupos
- CRUD de grupos (crear, editar, eliminar)
- Gestión de códigos de acceso
- Listado de alumnos por grupo
- Subida de archivos a Supabase Storage
- Publicación de materiales a grupos
- Historial y trazabilidad de envíos

**Tecnología:** Vite + React + React Router

---

### 3.3 Backend - Supabase

**Responsabilidad:** Plataforma como servicio que cubre todas las necesidades backend.

**Componentes utilizados:**

| Componente | Uso en EnviaEso |
|------------|-----------------|
| **Auth** | Autenticación de profesores (email/pass) |
| **Database (PostgreSQL)** | Datos estructurados: profesores, grupos, alumnos, materiales, envíos |
| **Storage** | Almacenamiento de archivos subidos por profesores |
| **RLS (Row Level Security)** | Control de acceso: profesores solo ven sus grupos, alumnos solo ven su grupo |
| **Edge Functions** | Opcional: procesamiento post-subida, envío de emails complejos |

---

### 3.4 Almacenamiento - Supabase Storage

**Responsabilidad:** Guardar los materiales/archivos de forma segura y accesible.

**Estructura propuesta (buckets):**
```
materiales/
├── {profesor_id}/
│   ├── {grupo_id}/
│   │   ├── {material_id}_{nombre_archivo}.pdf
│   │   └── ...
│   └── ...
└── ...
```

**Características:**
- URLs firmadas para acceso controlado (time-limited)
- Políticas RLS para que solo alumnos del grupo puedan descargar
- Límite de tamaño configurable por archivo

---

### 3.5 Notificaciones - Resend (o equivalente)

**Responsabilidad:** Enviar emails de aviso (NO transporte de archivos).

**Tipos de email:**

| Tipo | Destinatario | Contenido |
|------|--------------|-----------|
| **Bienvenida** | Alumno | Confirmación de inscripción en grupo, enlace de acceso |
| **Nuevo material** | Alumno | Aviso de publicación, asunto descriptivo, enlace a plataforma |
| **Recordatorio** | Alumno | (Opcional) Si no ha abierto material en X días |
| **Confirmación** | Profesor | Resumen de publicación realizada |

**Formato típico de email:**
- Asunto claro y descriptivo
- Cuerpo breve con contexto
- **Botón/enlace prominente** a la plataforma (CTA)
- Pie con información del grupo/profesor
- **NO incluye adjunto pesado**

---

### 3.6 Trazabilidad

**Responsabilidad:** Registrar todos los eventos significativos para auditabilidad.

**Eventos registrados:**

| Evento | Quién | Qué se registra |
|--------|-------|-----------------|
| `alumno_inscrito` | Alumno | Nombre, email, código usado, timestamp, IP (opcional) |
| `material_publicado` | Profesor | Archivo, grupo destino, timestamp |
| `email_enviado` | Sistema | Tipo, destinatario, timestamp, estado (éxito/error) |
| `material_abierto` | Alumno | Material, alumno, timestamp |
| `material_descargado` | Alumno | Material, alumno, timestamp, éxito |

**Implementación:** Tablas de auditoría en PostgreSQL, posiblemente con triggers.

---

## 4. Flujo de datos actualizado

### 4.1 Publicación de material (profesor)

```
1. Profesor sube archivo en panel
   └── Supabase Storage guarda archivo en bucket
   
2. Profesor selecciona grupo y publica
   └── Database: crea registro en tabla 'materiales'
   └── Database: crea registros en tabla 'envíos' (uno por alumno del grupo)
   
3. Sistema notifica por email
   └── Resend envía email a cada alumno del grupo
   └── Email contiene: asunto, contexto, ENLACE a plataforma
   └── Database: actualiza estado de envío a 'enviado'
   
4. Alumno recibe email y hace click
   └── Accede a frontend público con token/sesión temporal
   └── Database: registra evento 'material_abierto'
   
5. Alumno descarga archivo
   └── Supabase Storage genera URL firmada temporal
   └── Alumno descarga directamente desde Storage
   └── Database: registra evento 'material_descargado'
   └── Database: actualiza estado de envío a 'descargado'
```

### 4.2 Alta de alumno en grupo

```
1. Alumno accede a /acceder e introduce código
   └── Database: valida código de grupo
   
2. Alumno completa nombre y email
   └── Database: crea registro en tabla 'alumnos'
   └── Database: asocia alumno al grupo
   
3. Sistema envía email de bienvenida
   └── Resend: email con confirmación y enlace de acceso
   
4. Alumno queda inscrito y listo para recibir materiales
```

---

## 5. Stack técnico definido

| Componente | Tecnología | Justificación MVP |
|------------|------------|-------------------|
| **Frontend público** | Vite + React | Setup instantáneo, HMR rápido, SPA para experiencia fluida |
| **Frontend privado** | Vite + React + React Router | Misma base, añade routing para navegación de panel |
| **Backend/BaaS** | Supabase | Auth, DB y Storage en una sola plataforma, RLS integrado |
| **Almacenamiento** | Supabase Storage | Integrado, URLs firmadas, políticas de acceso |
| **Notificaciones** | Resend (provisional) | API simple, 3000 emails/mes gratis, buena deliverability |
| **Hosting** | Vercel (provisional) | Deploy automático, preview branches, serverless functions |

### Por qué este stack encaja con el modelo actual

1. **Supabase como núcleo:** Unifica auth, base de datos y storage. RLS simplifica seguridad.
2. **Storage integrado:** Evita configurar S3, Cloudinary, etc. Las URLs firmadas dan control de acceso.
3. **Resend solo para notificaciones:** Uso apropiado, sin forzar límites de adjuntos.
4. **Dos frontends, misma tecnología:** Consistencia de código, posibilidad de compartir componentes.
5. **Trazabilidad nativa:** PostgreSQL permite tablas de auditoría robustas.

---

## 6. Decisiones técnicas pendientes

| # | Decisión | Opciones | Bloquea |
|---|----------|----------|---------|
| 1 | ¿Un solo despliegue o dos? | Rutas (/admin vs /) / Subdominios / Separados | Estructura de proyecto |
| 2 | ¿Esquema exacto de BD? | Diseñar tablas y relaciones | Implementación backend |
| 3 | ¿RLS suficiente o necesita lógica adicional? | Solo RLS / Edge Functions / Backend propio | Seguridad |
| 4 | ¿Cómo generar códigos de grupo? | UUID corto / NanoID / Secuencial | UX del alumno |
| 5 | ¿URLs de Storage públicas o siempre firmadas? | Firmadas siempre / Públicas con RLS | Balance seguridad/UX |
| 6 | ¿Edge Functions para emails? | Sí (más control) / No (usar Resend directo) | Arquitectura de notificaciones |

---

## 7. Riesgos y mitigaciones

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| **Límites de Supabase free tier** | Bloqueo del servicio | Monitoreo, plan de upgrade, o migración a self-hosted |
| **Deliverability de emails** | Emails en spam | Resend tiene buena reputación, SPF/DKIM configurados |
| **URLs firmadas expiradas** | Alumno no puede descargar | Mensaje claro + botón para regenerar enlace |
| **Escalabilidad de Storage** | Coste creciente | Límites de tamaño por archivo, políticas de retención |
| **Complejidad de dos frontends** | Duplicación de código | Componentes compartidos, mono-repo con carpetas separadas |
| **Home.jsx actual desalineado** | Confusión en desarrollo | Documentar como obsoleto, rediseñar en próxima iteración |

---

## 8. Principios arquitectónicos específicos

### 8.1 Evitar adjuntos pesados en email

**Problema:** Los adjuntos grandes superan límites de servidores, saturan bandejas, no permiten revocación.

**Solución:** Email solo con enlace. El archivo vive en Storage bajo control de acceso.

### 8.2 Centralizar materiales en plataforma

**Beneficio:** 
- Un único origen de verdad
- Trazabilidad completa (quién accedió, cuándo, desde dónde)
- Posibilidad de actualizar archivo sin reenviar emails
- Analytics de uso reales

### 8.3 Permitir trazabilidad futura

**Implementación:** Desde el día 0, todo evento significativo queda registrado. No es un "extra" que se añade después.

### 8.4 Tráfico de retorno como valor

**Razón:** El profesor quiere saber que los alumnos realmente acceden. El alumno que visita la web está más comprometido.

**Implementación:** 
- Email mínimo, web completa
- Notificaciones que incentivan el click
- Experiencia web agradable una vez allí

---

## 9. Modelo de datos (MVP)

Definición estructurada de las tablas para implementación en PostgreSQL/Supabase.

### 9.1 Tabla: `profesores`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID (PK) | Identificador único del profesor |
| `email` | VARCHAR(255) | Email del profesor (único, usado para login) |
| `created_at` | TIMESTAMP | Fecha de creación del registro |

**Notas:**
- Autenticación gestionada por Supabase Auth, esta tabla extiende datos si es necesario
- El email debe coincidir con el usuario de Supabase Auth

---

### 9.2 Tabla: `grupos`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID (PK) | Identificador único del grupo |
| `profesor_id` | UUID (FK) | Referencia al profesor creador |
| `nombre` | VARCHAR(255) | Nombre del grupo (ej: "1º Bachillerato A") |
| `codigo` | VARCHAR(20) | Código de acceso único para alumnos |
| `created_at` | TIMESTAMP | Fecha de creación |

**Relaciones:**
- Pertenece a un `profesor`
- Tiene muchos `alumnos`
- Tiene muchos `materiales`

**Restricciones:**
- `codigo` debe ser único en toda la plataforma
- Índice en `codigo` para búsquedas rápidas

---

### 9.3 Tabla: `alumnos`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID (PK) | Identificador único de la inscripción |
| `grupo_id` | UUID (FK) | Referencia al grupo al que pertenece |
| `nombre` | VARCHAR(255) | Nombre completo del alumno |
| `email` | VARCHAR(255) | Email del alumno (para notificaciones) |
| `created_at` | TIMESTAMP | Fecha de inscripción |

**Relaciones:**
- Pertenece a un `grupo`
- Recibe muchos `envios` (vía tabla pivote)

**Notas importantes sobre el modelo MVP:**
- En el MVP, `alumnos` representa una **inscripción por grupo**, no una identidad global única
- El mismo email puede estar en múltiples grupos (como registros diferentes)
- No hay autenticación: el acceso es mediante enlace mágico/token temporal

**Nota sobre evolución futura:**
- Futuro: separar en dos entidades:
  - `personas`: identidad global única (email, datos personales)
  - `inscripciones`: vinculación persona-grupo (rol, estado, fechas)
- Esto permitiría un alumno en múltiples grupos con una sola identidad

---

### 9.4 Tabla: `materiales`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID (PK) | Identificador único del material |
| `grupo_id` | UUID (FK) | Referencia al grupo al que pertenece |
| `nombre_archivo` | VARCHAR(255) | Nombre original del archivo |
| `url_storage` | TEXT | Ruta en Supabase Storage (bucket/path) |
| `created_at` | TIMESTAMP | Fecha de subida |

**Relaciones:**
- Pertenece a un `grupo`
- Puede estar en múltiples `envios`

**Notas:**
- El archivo real está en Supabase Storage, esta tabla es el registro
- `url_storage` almacena la ruta relativa (ej: "profesor_id/grupo_id/archivo.pdf")

---

### 9.5 Tabla: `envios`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID (PK) | Identificador único del envío |
| `grupo_id` | UUID (FK) | Referencia al grupo destino |
| `fecha_envio` | TIMESTAMP | Fecha y hora de publicación |
| `descripcion` | TEXT | Descripción opcional del envío |

**Relaciones:**
- Pertenece a un `grupo`
- Tiene muchos `envios_alumnos` (uno por alumno del grupo)
- Tiene muchos `envios_materiales` (materiales incluidos en el envío)

**Notas MVP:**
- Un envío puede incluir uno o varios materiales (relación explícita vía `envios_materiales`)
- El profesor selecciona qué materiales incluir al crear el envío

---

### 9.6 Tabla: `envios_materiales` (relación envío-material)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID (PK) | Identificador único |
| `envio_id` | UUID (FK) | Referencia al envío |
| `material_id` | UUID (FK) | Referencia al material |
| `created_at` | TIMESTAMP | Fecha de asociación |

**Relaciones:**
- Pertenece a un `envio`
- Pertenece a un `material`

**Propósito:**
- Vincula explícitamente qué materiales concretos forman parte de cada envío
- Permite que un envío incluya múltiples materiales
- Permite que un material aparezca en múltiples envíos (si se reenvía)

**Notas:**
- Tabla pivote para relación muchos-a-muchos entre envíos y materiales
- En MVP, típicamente un envío incluirá todos los materiales del grupo o uno recién subido

---

### 9.7 Tabla: `envios_alumnos` (relación pivote)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID (PK) | Identificador único |
| `envio_id` | UUID (FK) | Referencia al envío |
| `alumno_id` | UUID (FK) | Referencia al alumno |
| `estado` | VARCHAR(20) | Estado actual: "enviado" (MVP) |
| `created_at` | TIMESTAMP | Fecha de creación del registro |

**Relaciones:**
- Pertenece a un `envio`
- Pertenece a un `alumno`

**Estados (MVP simplificado):**
- `enviado`: Email de notificación enviado (único estado en MVP)

**Estados (futuro):**
- `enviado` → `abierto` → `descargado`

**Notas:**
- Tabla de trazabilidad principal
- En MVP solo registramos que se envió, no aperturas ni descargas
- Cada alumno de un grupo tiene un registro por cada envío

---

### 9.8 Diagrama de relaciones

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│  profesores │◄──────┤   grupos    │◄──────┤  alumnos    │
│     (1)     │       │    (N)      │       │    (N)      │
└─────────────┘       └──────┬──────┘       └──────┬──────┘
                             │                     │
                             │              ┌──────┘
                             │              │
                             ▼              ▼
                      ┌─────────────┐  ┌─────────────────┐
                      │  materiales │  │  envios_alumnos │
                      │    (N)      │  │       (N)       │
                      └──────┬──────┘  └────────┬────────┘
                             │                  │
                             │    ┌─────────────┘
                             │    │
                             ▼    ▼
                      ┌─────────────────────────┐
                      │      envios_materiales  │
                      │           (N)           │
                      └───────────┬─────────────┘
                                  │
                                  ▼
                      ┌─────────────────────────┐
                      │         envios          │
                      │          (N)            │
                      └─────────────────────────┘
```

**Nota sobre el enlace mágico:**
- El acceso del alumno se realiza mediante un **token temporal de acceso** o **enlace firmado**
- Este token puede transportarse en la URL (ej: `/acceso?token=xyz`) o gestionarse de otra forma según la implementación
- Lo importante es que permite acceso directo sin introducir código ni realizar login

---

### 9.9 Consideraciones de implementación

**Índices recomendados:**
- `grupos.codigo` (único, búsqueda por código de acceso)
- `alumnos.grupo_id` (listado de alumnos por grupo)
- `alumnos.email` (búsqueda de alumno por email)
- `envios_alumnos.envio_id` (listado de envíos por alumno)
- `envios_alumnos.alumno_id` (listado de envíos del alumno)

**RLS (Row Level Security):**
- Profesores: solo ven grupos donde `profesor_id = su_id`
- Alumnos: solo ven datos de su grupo (vía código o token)

**Políticas de Storage:**
- Ruta: `materiales/{profesor_id}/{grupo_id}/{archivo}`
- Lectura: alumnos del grupo pueden leer
- Escritura: solo el profesor dueño

---

## 10. Trazabilidad en MVP vs Futuro

| Funcionalidad | MVP (actual) | Futuro (post-MVP) |
|---------------|--------------|-------------------|
| **Registro de envío** | ✅ Sí: tabla `envios_alumnos` | ✅ Sí |
| **Estado "enviado"** | ✅ Sí: al crear registro | ✅ Sí |
| **Estado "abierto"** | ❌ No | ✅ Sí: tracking de apertura |
| **Estado "descargado"** | ❌ No | ✅ Sí: tracking de descarga |
| **Analytics** | Básico (conteo) | Avanzado (gráficos, fechas) |
| **IPs y metadatos** | ❌ No | ✅ Sí: geolocalización, dispositivo |

---

## 11. Contradicciones resueltas respecto a versión anterior

| Aspecto | Versión anterior (v0.1) | Versión actual (v0.2) | Iteración 4 (ahora) |
|---------|-------------------------|----------------------|---------------------|
| **Modelo de datos** | Mínimo o ninguno | Completo conceptual | **Tablas definidas para implementación** |
| **Frontend** | Dos proyectos separados | Dos frontends conceptuales | **Un solo frontend con rutas: / y /panel** |
| **Auth alumno** | Sin definir | Enlace mágico idea | **Enlace mágico confirmado para MVP** |
| **Trazabilidad** | Completa (todos los estados) | Completa conceptual | **Simplificada: solo "enviado" en MVP** |
| **Arquitectura** | Conceptual | Diagrama alto nivel | **Modelo de datos detallado** |

---

**Versión:** 0.3 (Modelo de datos definido)  
**Última actualización:** 15 de abril de 2026  
**Estado:** Listo para implementación de base de datos

> **Nota sobre implementación actual:** La estructura de carpetas `/app` creada en iteración 2 y el componente `Home.jsx` están orientados al modelo anterior (formulario de "envío"). Deben ser rediseñados para implementar el flujo de acceso por código + enlace mágico.
