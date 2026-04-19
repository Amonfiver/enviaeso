<!--
================================================================================
PROPÓSITO DEL ARCHIVO
================================================================================
Resumen operativo vivo del proyecto EnviaEso. Documento de entrada rápida para
arrancar sesiones de trabajo sin necesidad de leer toda la bitácora histórica.

================================================================================
ALCANCE
================================================================================
- Estado actual del sistema (qué funciona ahora mismo)
- Stack técnico vigente
- Estructura real de datos
- Decisiones de producto vigentes
- Problemas abiertos conocidos
- Próximos pasos recomendados

================================================================================
NOTA SObre DOCUMENTACIÓN
================================================================================
- Este archivo: resumen operativo (entrada rápida)
- docs/BITACORA.md: histórico completo de todas las sesiones
- docs/ARCHITECTURE.md: arquitectura y modelo de datos
- docs/DECISIONES.md: registro de decisiones técnicas y de producto
- docs/SPEC.md: especificación funcional completa
================================================================================
-->

# ESTADO ACTUAL - EnviaEso

## Qué es EnviaEso

Plataforma para compartir documentación, materiales y archivos de forma organizada. Dos perfiles principales: quienes **envían** (gestionan grupos y materiales) y quienes **reciben** (se apuntan a grupos y acceden a sus documentos). MVP en evolución.

---

## Stack Actual

| Capa | Tecnología | Estado |
|------|------------|--------|
| Frontend | Vite + React + React Router | ✅ Funcionando |
| Estilos | CSS vanilla (variables globales) | ✅ Funcionando |
| Backend/BaaS | Supabase (Auth, DB, Storage) | ✅ Funcionando |
| Email | Resend vía Edge Function | ✅ Funcionando |
| Hosting | Vercel (pendiente deploy real) | 🟡 Local/dev |

---

## Flujos que Ya Funcionan

### Flujo Recibir (antes "Alumno")
1. Landing en `/` con dos caminos: Recibir / Enviar
2. Apuntarse a un grupo con código, nombre y email
3. Acceder a materiales en `/acceso-alumno` con código + email
4. Recibe emails cuando el emisor avisa (vía Resend)

### Flujo Enviar (antes "Profesor")
1. Acceso en `/login` con autenticación Supabase Auth
2. Panel en `/panel` para gestión completa
3. Crear/editar/borrar grupos
4. Ver receptores por grupo (solo nombres, no emails)
5. Subir materiales a grupos (Supabase Storage)
6. Enviar avisos individuales o grupales
7. **Trazabilidad mínima**: registra envíos en tabla `envios` + `envios_alumnos`

---

## Estructura Real de Tablas Importantes

### `profesores` (emisores)
| Campo | Tipo | Notas |
|-------|------|-------|
| id | UUID (PK) | Generado por Supabase Auth |
| email | VARCHAR | Para login |
| created_at | TIMESTAMP | Automático |

*Nota: En UX se usa "Enviar", en BD se mantiene `profesores`.*

### `grupos`
| Campo | Tipo | Notas |
|-------|------|-------|
| id | UUID (PK) | |
| profesor_id | UUID (FK) | ID del emisor |
| nombre | VARCHAR | Nombre del grupo |
| codigo | VARCHAR | Código único para receptores |
| nota_interna | TEXT | Notas internas |
| created_at | TIMESTAMP | |

### `alumnos` (receptores)
| Campo | Tipo | Notas |
|-------|------|-------|
| id | UUID (PK) | |
| grupo_id | UUID (FK) | |
| nombre | VARCHAR | Visible en UI |
| email | VARCHAR | **Oculto en UI**, usado para envíos |
| acepta_privacidad | BOOLEAN NOT NULL DEFAULT false | Consentimiento obligatorio |
| acepta_comunicaciones | BOOLEAN NOT NULL DEFAULT false | Consentimiento opcional |
| fecha_acepta_privacidad | TIMESTAMP WITH TIME ZONE | Cuando aceptó privacidad |
| fecha_acepta_comunicaciones | TIMESTAMP WITH TIME ZONE | Cuando aceptó comunicaciones |
| version_legal | VARCHAR(20) | Versión de los términos (actual: "v1") |
| created_at | TIMESTAMP | |

*Nota: En UX se usa "Recibir", en BD se mantiene `alumnos`. Los consentimientos legales se persisten desde el formulario público.*

### `materiales`
| Campo | Tipo | Notas |
|-------|------|-------|
| id | UUID (PK) | |
| grupo_id | UUID (FK) | |
| nombre_archivo | VARCHAR | |
| url_storage | TEXT | Ruta en Supabase Storage |
| tamaño_bytes | INTEGER | |
| created_at | TIMESTAMP | |

### `envios`
| Campo | Tipo | Notas |
|-------|------|-------|
| id | UUID (PK) | |
| grupo_id | UUID (FK) | |
| fecha_envio | TIMESTAMP | |
| descripcion_opcional | TEXT | Resumen del envío (ej: "5 ok, 0 errores") |
| created_at | TIMESTAMP | |

### `envios_alumnos`
| Campo | Tipo | Notas |
|-------|------|-------|
| id | UUID (PK) | |
| envio_id | UUID (FK) | |
| alumno_id | UUID (FK) | |
| estado | VARCHAR | "enviado" o "error" |
| created_at | TIMESTAMP | |

---

## Decisiones de Producto Vigentes

| ID | Decisión | Estado |
|----|----------|--------|
| P006 | Panel de gestión incluido en MVP | ✅ Activa |
| P007 | Emisor gestiona múltiples grupos | ✅ Activa |
| P008 | Receptores se asocian mediante códigos | ✅ Activa |
| P009 | Materiales se sirven desde plataforma | ✅ Activa |
| P010 | Email es canal de aviso, no transporte | ✅ Activa |
| P012 | Trazabilidad completa (mínima ahora) | ✅ Activa |
| P014 | Código de grupo solo para alta inicial | ✅ Activa |
| P015 | UX generalista: Recibir/Enviar | ✅ Activa |

---

## Estado Actual del Envío y Trazabilidad

### Funciona
- Envío real de emails vía Resend (Edge Function `send-test-email`)
- Aviso individual y grupal desde el panel
- Pausa de 300ms entre envíos para no saturar
- Registro en `envios` con descripción y fecha
- Registro en `envios_alumnos` con estado por receptor
- Visualización del último envío en la UI del panel

### Limitaciones actuales
- Sin tracking de aperturas de emails
- Sin tracking de descargas de materiales
- Solo se muestra el último envío (no histórico completo)
- Sin estadísticas agregadas (tasas, etc.)

---

## Problemas Abiertos

| Prioridad | Problema | Impacto |
|-----------|----------|---------|
| 🟡 Media | RLS permisivas (deuda técnica) | Seguridad superficial |
| 🟡 Media | Nombres de tablas no alineados con UX (profesores/alumnos vs enviar/recibir) | Deuda técnica futura |
| 🟢 Baja | Sin rate-limiting en envío de emails | Riesgo de spam si se expone |

*Nota: Autenticación real implementada. Home.jsx reorganizado con enfoque Recibir/Enviar. Consentimientos legales ya persisten en BD.*

### Variables de Entorno Importantes

| Variable | Propósito | Valor en Producción |
|----------|-----------|---------------------|
| `VITE_APP_URL` | URL base para enlaces en emails y redirecciones auth | `https://tudominio.com` (sin trailing slash) |
| `VITE_SUPABASE_URL` | Endpoint de Supabase | Desde dashboard |
| `VITE_SUPABASE_ANON_KEY` | Key anónima de Supabase | Desde dashboard |

*Notas:*
- Si `VITE_APP_URL` no está definida, el sistema usa `window.location.origin` como fallback (útil en desarrollo)
- **Crítico para auth:** El email de confirmación de registro redirige a `${VITE_APP_URL}/login`. Sin esta variable en producción, el email redirigirá a localhost.

### FIXES Recientes (Producción Netlify)
1. ✅ **Rutas SPA en Netlify:** Añadido `public/_redirects` para resolver rutas internas correctamente
2. ✅ **Descarga forzada:** URLs firmadas con 5min validez + atributo `download` + fallback `_blank`
3. ✅ **Modal de confirmación:** Reemplazado `window.confirm` por modal React integrado en Panel
4. ✅ **Consentimiento legal:** Checkboxes de privacidad (obligatorio) y comunicaciones (opcional) en formulario

---

## Próximos Pasos Recomendados

### Inmediato (siguiente bloque)
1. Recuperación de contraseña
2. Mejorar UX de carga y estados de error
3. Implementar cierre de sesión explícito

### Siguiente
4. Historial completo de envíos en el panel
5. Tracking de aperturas de emails
6. Renombrar tablas (opcional): `profesores`→`emisores`, `alumnos`→`receptores`

*Nota: Home.jsx ya está rediseñado como portal dual (Recibir/Enviar). Autenticación implementada.*

---

## Archivos Clave del Proyecto

| Archivo | Propósito |
|---------|-----------|
| `src/pages/Panel.jsx` | Panel de gestión (emisores) |
| `src/pages/Home.jsx` | Landing unificada (Recibir/Enviar) |
| `src/pages/AccesoAlumno.jsx` | Acceso para receptores |
| `src/pages/LoginProfesor.jsx` | Login/registro para emisores |
| `src/services/supabase.js` | Cliente Supabase configurado |
| `src/services/email.js` | Envío de emails vía Edge Function |
| `src/services/storage.js` | Gestión de materiales en Storage |
| `supabase/functions/send-test-email/index.ts` | Edge Function para Resend |
| `docs/ESTADO_ACTUAL.md` | Este archivo (resumen operativo) |
| `docs/BITACORA.md` | Histórico completo de sesiones |

---

**Última actualización:** 19 de abril de 2026 (bloque: consentimientos legales + VITE_APP_URL)  
**Versión del sistema:** MVP funcional, home unificada Recibir/Enviar, consentimientos persistidos en BD
