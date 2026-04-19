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

Plataforma mínima para que profesores gestionen grupos de alumnos y envíen avisos con materiales. Sin autenticación real aún (profesor usa ID temporal). MVP en evolución.

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

### Flujo Alumno
1. Accede con código de grupo en `/` (Home.jsx)
2. Se registra con nombre y email
3. Queda asociado al grupo
4. Recibe emails cuando el profesor avisa (vía Resend)

### Flujo Profesor (Panel temporal)
1. Panel en `/panel` sin login real (usa `PROFESOR_ID_TEMPORAL`)
2. Crear/editar/borrar grupos
3. Ver alumnos por grupo (solo nombres, no emails)
4. Subir materiales a grupos (Supabase Storage)
5. Enviar avisos individuales o grupales
6. **Trazabilidad mínima**: registra envíos en tabla `envios` + `envios_alumnos`

---

## Estructura Real de Tablas Importantes

### `profesores`
| Campo | Tipo | Notas |
|-------|------|-------|
| id | UUID (PK) | Generado por Supabase Auth |
| email | VARCHAR | Para login |
| created_at | TIMESTAMP | Automático |

### `grupos`
| Campo | Tipo | Notas |
|-------|------|-------|
| id | UUID (PK) | |
| profesor_id | UUID (FK) | Temporalmente fijo en código |
| nombre | VARCHAR | Nombre del grupo |
| codigo | VARCHAR | Código único para alumnos |
| nota_interna | TEXT | Notas del profesor |
| created_at | TIMESTAMP | |

### `alumnos`
| Campo | Tipo | Notas |
|-------|------|-------|
| id | UUID (PK) | |
| grupo_id | UUID (FK) | |
| nombre | VARCHAR | Visible en UI |
| email | VARCHAR | **Oculto en UI**, usado para envíos |
| created_at | TIMESTAMP | |

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
| P006 | Panel de profesor incluido en MVP | ✅ Activa |
| P007 | Profesor gestiona múltiples grupos | ✅ Activa |
| P008 | Alumnos se asocian mediante códigos | ✅ Activa |
| P009 | Materiales se sirven desde plataforma | ✅ Activa |
| P010 | Email es canal de aviso, no transporte | ✅ Activa |
| P012 | Trazabilidad completa (mínima ahora) | ✅ Activa |
| P014 | Código de grupo solo para alta inicial | ✅ Activa |

---

## Estado Actual del Envío y Trazabilidad

### Funciona
- Envío real de emails vía Resend (Edge Function `send-test-email`)
- Aviso individual y grupal desde el panel
- Pausa de 300ms entre envíos para no saturar
- Registro en `envios` con descripción y fecha
- Registro en `envios_alumnos` con estado por alumno
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
| 🔴 Alta | **Sin autenticación real del profesor** | Cualquiera puede acceder al panel con el ID temporal |
| 🟡 Media | RLS permisivas (deuda técnica) | Seguridad superficial |
| 🟡 Media | Home.jsx desalineado con arquitectura actual | Confusión en desarrollo |
| 🟢 Baja | Sin rate-limiting en envío de emails | Riesgo de spam si se expone |

---

## Próximos Pasos Recomendados

### Inmediato (este bloque)
1. ✅ **Autenticación real del profesor** con Supabase Auth
   - Registro/login
   - Detección de sesión
   - Base para logout
   - Empezar a restringir acceso al panel

### Siguiente
2. Proteger rutas del panel con autenticación
3. Actualizar `PROFESOR_ID_TEMPORAL` para usar el ID real del profesor logueado
4. Rediseñar Home.jsx como portal dual (alumno/profesor)
5. Implementar recuperación de contraseña

---

## Archivos Clave del Proyecto

| Archivo | Propósito |
|---------|-----------|
| `src/pages/Panel.jsx` | Panel del profesor (gestión completa) |
| `src/pages/Home.jsx` | Portal del alumno (acceso por código) |
| `src/services/supabase.js` | Cliente Supabase configurado |
| `src/services/email.js` | Envío de emails vía Edge Function |
| `src/services/storage.js` | Gestión de materiales en Storage |
| `supabase/functions/send-test-email/index.ts` | Edge Function para Resend |
| `docs/ESTADO_ACTUAL.md` | Este archivo (resumen operativo) |
| `docs/BITACORA.md` | Histórico completo de sesiones |

---

**Última actualización:** 19 de abril de 2026  
**Versión del sistema:** MVP funcional, pendiente auth real