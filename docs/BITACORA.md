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

## 2026-04-19 - Pulido visual y UX de todas las pantallas

**Objetivo:** Hacer que EnviaEso se vea más limpio, claro y profesional sin rediseño extremo, mejorando la experiencia del profesor y del alumno.  
**Estado:** ✅ Completado

### Cambios realizados

**1. `src/pages/LoginProfesor.jsx` - Acceso profesional:**
- Añadido header con icono 📚 y mejor jerarquía visual
- Card principal con sombra y bordes redondeados
- Labels en todos los inputs con mejor tipografía
- Separador visual entre login/registro
- Mensajes de feedback en cajas destacadas con iconos (⚠️ / ✓)
- Botón toggle más visible y profesional
- Mejor espaciado y padding consistente

**2. `src/pages/AccesoAlumno.jsx` - Acceso para alumnos:**
- Header con icono 🎓 y colores distintivos (verde)
- Card principal con sombra y bordes redondeados
- Indicador visual cuando hay auto-acceso desde enlace ("🔗 Accediendo...")
- Labels en todos los inputs
- Caja de privacidad destacada con icono 🔒 y explicación clara
- Mejor feedback visual con iconos

**3. `src/pages/MisMateriales.jsx` - Materiales del alumno:**
- Header mejorado con icono 📚 y saludo personalizado
- Caja informativa verde con datos del grupo
- Lista de materiales con iconos 📄 y mejor espaciado
- Fecha formateada en español ("12 de abril de 2026")
- Caja de ayuda amarilla con nota sobre descarga (Ctrl+S)
- Footer mejorado con opción de "Acceder con otro código"
- Estados vacíos más amigables con iconos grandes

**4. `src/pages/Panel.jsx` - Panel del profesor:**
- Header completo con icono 👨‍🏫 y caja azul destacada
- Perfil del profesor editable inline con mejor diseño
- Mensaje global de feedback con caja destacada
- Formulario de crear grupo en card blanca con sombra
- Lista de grupos con mejor jerarquía visual
- Tarjetas de grupo con sombra, bordes redondeados y mejor organización
- Badges visuales para conteo de alumnos (azul) y código (gris)
- Botones de acción con iconos (📋 📨 👥 📦)
- Sección de alumnos expandible con fondo gris claro
- Sección de materiales expandible con fondo verde claro
- Último envío destacado en caja azul
- Envío grupal en caja amarilla destacada
- Envío individual con selector mejorado

### Principios aplicados
- **Jerarquía visual clara:** títulos, subtítulos, labels consistentes
- **Cards y contenedores:** sombras suaves, bordes redondeados, separación clara
- **Colores semánticos:** azul para profesor, verde para alumno, amarillo para alertas, rojo para errores
- **Iconos informativos:** emojis para reconocimiento rápido de funciones
- **Feedback visual:** mensajes en cajas destacadas con iconos
- **Espaciado consistente:** padding y margins uniformes
- **Estados vacíos amigables:** mensajes útiles cuando no hay datos
- **Mantenida privacidad:** jamás se muestran emails en UI

### Archivos modificados
| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `src/pages/LoginProfesor.jsx` | Modificado | Pulido visual completo, mejor jerarquía, cards, feedback visual |
| `src/pages/AccesoAlumno.jsx` | Modificado | Pulido visual, header mejorado, caja de privacidad, auto-acceso visual |
| `src/pages/MisMateriales.jsx` | Modificado | Header mejorado, lista de materiales pulida, caja de ayuda, footer mejorado |
| `src/pages/Panel.jsx` | Modificado | Rediseño completo del panel, tarjetas mejoradas, secciones expandibles pulidas |

### Cómo probar manualmente cada pantalla

**1. LoginProfesor:**
- Ir a `/login`
- Verificar que aparece el icono 📚 y título destacado
- Probar toggle entre login y registro
- Verificar que los mensajes de error/éxito aparecen en cajas destacadas

**2. AccesoAlumno:**
- Ir a `/acceso-alumno`
- Verificar header con icono 🎓
- Probar acceso con query params (`?codigo=ABC&email=test@test.com`)
- Verificar que aparece la caja de privacidad
- Comprobar mensajes de feedback visual

**3. MisMateriales:**
- Acceder con un alumno válido
- Verificar header verde con saludo personalizado
- Comprobar lista de materiales con iconos
- Probar descarga y verificar mensaje de ayuda amarillo

**4. Panel:**
- Iniciar sesión como profesor
- Verificar header azul con saludo
- Crear un grupo nuevo
- Verificar tarjeta del grupo con badges de alumnos y código
- Probar expandir alumnos y verificar sección con fondo gris
- Probar expandir materiales y verificar sección con fondo verde
- Verificar que el último envío aparece en caja azul

### Ajustes pendientes detectados (no implementados en este bloque)
- Añadir animaciones suaves en transiciones de expandir/colapsar
- Implementar modo oscuro (dark mode)
- Añadir tooltips en botones de acción
- Mejorar experiencia en móvil (algunas tablas pueden necesitar scroll horizontal)

---

## 2026-04-19 - Fix: Cierre de trazabilidad de envíos - valores de estado correctos

**Objetivo:** Cerrar el fix parcial de trazabilidad. Corregir valores de estado en `envios_alumnos` que seguían violando la constraint `envios_alumnos_estado_check`.  
**Estado:** ✅ Completado

### Causa raíz exacta y concreta
El fix anterior (2026-04-19 - "Fix: Corrección de valores de estado en trazabilidad de envíos") fue parcial porque **cambió los valores en el código fuente pero mantuvo valores incorrectos según la constraint real de la BD**.

La documentación `docs/ESTADO_ACTUAL.md` indica que el campo `estado` en `envios_alumnos` debe ser `"enviado"` o `"error"`, pero el código estaba usando `'sent'` y `'failed'` después del fix anterior.

**Discrepancia identificada:**
| Fuente | Valor éxito | Valor error |
|--------|-------------|-------------|
| `docs/ESTADO_ACTUAL.md` | `"enviado"` | `"error"` |
| Código post-fix anterior | `'sent'` | `'failed'` |

### Cambios realizados

**1. Unificación de valores en español en `Panel.jsx`:**

- **`handleEnviarAvisoAlumno`** (envío individual):
  - Antes: `'sent'` / `'failed'`
  - Después: `'enviado'` / `'error'`

- **`handleAvisarATodos`** (envío grupal):
  - Antes: `'sent'` / `'failed'`
  - Después: `'enviado'` / `'error'`

**2. Logs temporales actualizados:**
- Los logs en consola ahora muestran: `[Trazabilidad] Valor de estado a insertar: 'enviado'` o `'error'`
- Esto facilita verificar en desarrollo qué valores exactos se envían a la BD

**3. Mantenido el reset de loading states:**
- `setLoadingAvisoAlumno(false)` en bloque `finally` (individual)
- `setLoadingAvisarATodos(false)` en bloque `finally` (grupal)

### Archivos modificados
| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `src/pages/Panel.jsx` | Modificado | Valores de estado cambiados a español `'enviado'`/`'error'` en ambas funciones de envío, logs actualizados |

### Payload final exacto que se inserta ahora en `envios_alumnos`

```javascript
// Éxito individual:
{ envio_id: 'uuid', alumno_id: 'uuid', estado: 'enviado' }

// Error individual:
{ envio_id: 'uuid', alumno_id: 'uuid', estado: 'error' }

// Éxito grupal (array):
[
  { envio_id: 'uuid', alumno_id: 'uuid1', estado: 'enviado' },
  { envio_id: 'uuid', alumno_id: 'uuid2', estado: 'enviado' },
  ...
]

// Error grupal (array):
[
  { envio_id: 'uuid', alumno_id: 'uuid1', estado: 'error' },
  { envio_id: 'uuid', alumno_id: 'uuid2', estado: 'enviado' }, // mixto
  ...
]
```

### Qué valor usaba mal antes y en qué rama estaba
- **Valor malo:** `'sent'` (en lugar de `'enviado'`) y `'failed'` (en lugar de `'error'`)
- **Ubicación:** En `handleEnviarAvisoAlumno` (línea ~742) y `handleAvisarATodos` (línea ~975)
- **Problema:** El fix anterior asumió que la constraint esperaba valores en inglés, pero la documentación y la constraint real esperan valores en español

### Cómo probar manualmente individual y grupal

**1. Envío individual:**
- Ir a `/panel` → seleccionar grupo con alumnos → "Ver alumnos"
- Seleccionar un alumno del dropdown → "Enviar aviso"
- Verificar que aparece: `"Aviso enviado correctamente a {nombre}. ID: ... ✓ Registrado en BD."`
- Verificar que el botón vuelve a decir "Enviar aviso" (no se queda en "Enviando...")

**2. Envío grupal:**
- En el mismo grupo, pulsar "Avisar a todos (N alumnos)"
- Confirmar en el diálogo
- Esperar a que termine
- Verificar que aparece: `"Envío completado: N enviados de X total. ✓ Registrado en BD."`
- Verificar que el botón vuelve a su estado normal

**3. Verificación en Supabase Dashboard:**
- Ir a la tabla `envios` → verificar que el envío se registró
- Ir a la tabla `envios_alumnos` → verificar que los registros tienen `estado` = `'enviado'` o `'error'`

### Confirmación de que ya no aparece el mensaje de error
Tras este fix, el mensaje `"⚠️ Error al registrar en BD"` debe desaparecer cuando la constraint se cumple correctamente. Si persiste, revisar la consola del navegador para ver los logs de estado exactos que se intentan insertar.

---

## 2026-04-19 - Consistencia de datos del profesor y CRUD básico de perfil

**Objetivo:** Resolver la desincronización entre Supabase Auth y tabla `profesores`, e implementar CRUD básico de perfil del profesor.  
**Estado:** ✅ Completado

### Causa exacta del problema de consistencia
Existía una **desincronización entre Supabase Auth y la tabla `profesores`**:
- Si un profesor existía en Auth pero se borraba manualmente su fila en `profesores`, el sistema quedaba en estado inconsistente
- El profesor podía seguir accediendo (auth válido) pero sin datos de negocio (nombre, relaciones)
- Esto provocaba fallos funcionales: no mostraba nombre, errores al crear grupos, etc.

### Solución implementada

**1. Función de consistencia automática (`auth.js`):**
- Nueva función `obtenerOCrearPerfilProfesor(userId, email, nombre)`:
  - Intenta obtener el perfil de la tabla `profesores`
  - Si existe → lo devuelve
  - Si no existe → **lo crea automáticamente** con los datos mínimos (id, email, nombre opcional)
  - Esto garantiza que nunca haya un usuario autenticado sin perfil asociado

**2. CRUD básico de perfil:**
- Nueva función `actualizarPerfilProfesor(userId, datos)` para actualizar datos del profesor
- En el panel, ahora hay un botón "Editar perfil" / "Completar perfil" junto al saludo
- Al hacer clic, aparece un formulario inline para editar el nombre
- Validación: el nombre no puede estar vacío
- Feedback visual de éxito/error

**3. Manejo de errores críticos:**
- Si falla la carga/creación del perfil, se muestra un mensaje claro: "No se pudo cargar tu perfil. Intenta recargar la página."
- Se permite acceso básico con datos de auth mínimos (sin romper la app)
- Botón para "Cerrar sesión y reintentar"

### Archivos modificados
| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `src/services/auth.js` | Modificado | Nuevas funciones `obtenerOCrearPerfilProfesor` y `actualizarPerfilProfesor` |
| `src/pages/Panel.jsx` | Modificado | Uso de consistencia automática, estados y handlers para edición de perfil, UI inline |

### Cómo se comporta ahora el panel si falta la fila en `profesores`
1. Usuario hace login → auth válido
2. Al entrar a `/panel`, se ejecuta `obtenerOCrearPerfilProfesor()`
3. Si no existe la fila → **se crea automáticamente** con:
   - `id`: del usuario auth
   - `email`: del usuario auth
   - `nombre`: null (o el que venga de user_metadata si existe)
4. El panel carga normalmente, mostrando "Bienvenido." (sin nombre hasta que lo complete)
5. Aparece botón "Completar perfil" para que el profesor añada su nombre

### Cómo se edita ahora el nombre del profesor
1. En el panel, junto al saludo hay un botón pequeño:
   - Si tiene nombre: "Editar perfil"
   - Si no tiene nombre: "Completar perfil"
2. Al hacer clic, aparece un formulario inline (fondo azul claro) con:
   - Input de texto con el nombre actual (o vacío)
   - Botón "Guardar" / "Guardando..."
   - Botón "Cancelar"
3. Al guardar:
   - Se valida que no esté vacío
   - Se actualiza en la tabla `profesores`
   - Se actualiza el estado local del panel
   - Se muestra mensaje de éxito
   - El saludo se actualiza inmediatamente

### Qué haría falta para borrado completo de cuenta de forma segura

**Arquitectura recomendada (no implementada en este bloque):**

1. **Borrado de datos de negocio (soft delete):**
   - Marcar profesor como `eliminado: true` en tabla `profesores`
   - Opcionalmente anonimizar datos: cambiar nombre a "(usuario eliminado)", email a hash
   - Mantener grupos/alumnos/materiales para integridad histórica, o borrarlos en cascada según necesidad

2. **Borrado de Auth (requiere backend seguro):**
   - No se puede hacer desde frontend de forma segura (requiere service_role key)
   - Opciones:
     - a) **Edge Function de Supabase** con service_role key que borre el usuario de Auth
     - b) **Proceso manual** por admin en Supabase Dashboard
     - c) **Cola de borrado** programado que ejecute un job de limpieza periódico

3. **Flujo recomendado:**
   - Usuario solicita borrado en UI → marca `solicitud_borrado: true` en `profesores`
   - Sistema deja de enviar emails, desactiva funcionalidades
   - Admin/Job procesa la cola y borra de Auth de forma segura
   - Se envía confirmación de "derecho al olvido" completado

**Nota:** No se implementó borrado desde frontend porque requiere privilegios de admin que no deben exponerse al cliente.

### Cómo probar manualmente todo esto

**1. Probar consistencia automática:**
   - En Supabase Dashboard, borrar manualmente el registro de un profesor de la tabla `profesores`
   - Hacer login con ese profesor en `/login`
   - Al entrar a `/panel`, verificar que:
     - No hay errores
     - Se muestra "Bienvenido." (sin nombre)
     - El panel funciona normalmente
   - Verificar en Supabase Dashboard que la fila se ha recreado automáticamente

**2. Probar edición de perfil:**
   - En el panel, hacer clic en "Completar perfil"
   - Escribir un nombre, guardar
   - Verificar que:
     - El saludo cambia a "Hola, {nombre}."
     - El botón cambia a "Editar perfil"
     - En Supabase Dashboard el nombre está guardado
   - Recargar la página y verificar que persiste el nombre

**3. Probar error crítico (simulado):**
   - Modificar temporalmente RLS para bloquear acceso a `profesores`
   - Intentar entrar al panel
   - Verificar que aparece mensaje de error amigable
   - Verificar que hay botón para cerrar sesión

---

## 2026-04-19 - Fix: Carga del nombre del profesor en el panel

**Objetivo:** Corregir que el nombre del profesor no se mostraba en el panel aunque existía en la tabla `profesores`.  
**Estado:** ✅ Completado

### Causa exacta del fallo
El `Panel.jsx` estaba usando solo el objeto `user` devuelto por `obtenerUsuarioActual()` (de Supabase Auth), que contiene `id`, `email` y `user_metadata`, pero **no consultaba la tabla `profesores`** donde realmente se guarda el `nombre`. Además, el render estaba apuntando a `profesor?.user_metadata?.nombre` en lugar del campo correcto.

### Acciones realizadas
- [x] **Modificado `useEffect` de verificación de auth** en `Panel.jsx`:
  - Después de obtener el `user` de Supabase Auth, ahora consulta la tabla `profesores` con `.select('id, email, nombre').eq('id', user.id).single()`
  - Combinar datos de auth con datos de la tabla: `setProfesor({ ...user, ...profesorData })`
  - Si falla la carga de la tabla, fallback a `{ ...user, nombre: null }` para no romper nada
- [x] **Corregido el render del saludo**:
  - Antes: `profesor?.user_metadata?.nombre` (campo inexistente)
  - Después: `profesor?.nombre` (campo correcto de la tabla `profesores`)
  - Fallback: si no hay nombre, muestra "Bienvenido." en lugar de cadena vacía

### Archivos modificados
| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `src/pages/Panel.jsx` | Modificado | Carga explícita desde tabla `profesores`, combinación de datos auth+BD, corrección del campo en render |

### Cómo queda ahora la carga del profesor en panel
1. Se verifica autenticación con `obtenerUsuarioActual()` → obtiene `user` de Supabase Auth
2. Se consulta tabla `profesores` filtrando por `user.id` → obtiene `nombre` (y otros datos)
3. Se combinan ambos objetos: `{ ...userAuth, ...userBD }`
4. El estado `profesor` ahora tiene acceso a: `id`, `email`, `nombre`, y todos los campos de auth
5. El saludo muestra: "Hola, {nombre}. " si existe, o "Bienvenido. " si no

### Cómo probar manualmente que el nombre ya se muestra
1. Asegurarse de que el registro del profesor en tabla `profesores` tiene el campo `nombre` relleno (verificar en Supabase Dashboard)
2. Hacer login en `/login` con ese profesor
3. Al entrar en `/panel`, debe aparecer el saludo: "Hola, {nombre}. Crea un grupo..."
4. Si el nombre está vacío o no existe el registro, debe aparecer: "Bienvenido. Crea un grupo..."

---

## 2026-04-19 - Autenticación real del profesor: eliminado PROFESOR_ID_TEMPORAL

**Objetivo:** Eliminar el ID temporal del profesor y conectar el panel con la identidad real del usuario autenticado. Guardar nombre del profesor y mejorar mensajes de error en registro.  
**Estado:** ✅ Completado

### Acciones realizadas
- [x] **Eliminado `PROFESOR_ID_TEMPORAL`** de `Panel.jsx`
- [x] **Panel.jsx ahora usa `profesor.id`** del usuario autenticado vía `obtenerUsuarioActual()`
- [x] **Agregada verificación de autenticación** al cargar el panel (redirige a `/login` si no hay sesión)
- [x] **Actualizado `registrarProfesor()`** en `auth.js` para aceptar y guardar `nombre`
- [x] **Creado registro en tabla `profesores`** con `id`, `email` y `nombre` del profesor
- [x] **Agregada protección contra duplicados** al registrar (verifica si ya existe antes de insertar)
- [x] **Mejorado mensaje de error** cuando el email ya existe: "Ya existe una cuenta con este email. ¿Quieres iniciar sesión?"
- [x] **Detectado caso de usuario existente** en Supabase (respuesta con `identities.length === 0`)
- [x] **LoginProfesor.jsx ahora pide nombre** en el formulario de registro
- [x] **El panel muestra el nombre del profesor** en el saludo si está disponible

### Archivos modificados
| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `src/services/auth.js` | Modificado | `registrarProfesor` ahora recibe `nombre`, guarda en tabla `profesores`, maneja duplicados y mejora mensajes de error |
| `src/pages/LoginProfesor.jsx` | Modificado | Agregado campo `nombre` en registro, validación, detección de email existente, cambio automático a modo login |
| `src/pages/Panel.jsx` | Modificado | Eliminado `PROFESOR_ID_TEMPORAL`, usa `profesor.id` real, verifica autenticación, muestra nombre del profesor |

### Notas para sesiones futuras
- **Estructura de la tabla `profesores`**:
  - `id` (UUID, PK) - mismo que Supabase Auth `user.id`
  - `email` (VARCHAR)
  - `nombre` (VARCHAR) - nuevo, agregado manualmente en Supabase
  - `created_at` (TIMESTAMP)
- **Flujo de autenticación actual**:
  1. Usuario accede a `/login`
  2. Si ya tiene sesión, redirige automáticamente a `/panel`
  3. En registro: pide nombre, email, contraseña → crea auth user + registro en `profesores`
  4. En login: valida credenciales → redirige a `/panel`
  5. Panel verifica sesión con `obtenerUsuarioActual()` → si no hay, redirige a `/login`
  6. Todas las operaciones de grupos usan `profesor.id` del usuario autenticado
- **Cómo probar manualmente**:
  1. **Registro nuevo**: Ir a `/login` → "Regístrate" → completar nombre, email, contraseña → debe crear cuenta y redirigir
  2. **Email ya existente**: Intentar registrar con email usado → mensaje claro + cambio automático a login
  3. **Acceso a `/panel`**: Sin login debe redirigir a `/login`; con login debe mostrar grupos del profesor
  4. **Creación de grupo**: En panel, crear grupo → debe aparecer en "Tus grupos" asociado al profesor actual
  5. **Carga de grupos**: Solo deben aparecer los grupos creados por el profesor logueado
  6. **Logout**: Botón "Cerrar sesión" debe limpiar sesión y redirigir a `/login`

---

## 2026-04-19 - Fix: Trazabilidad usando columna correcta `descripcion_opcional`

**Objetivo:** Corregir el nombre de columna en la tabla `envios` para que la trazabilidad funcione realmente.  
**Estado:** ✅ Completado

### Acciones realizadas
- [x] **Identificación del problema real**: La columna en la tabla `envios` se llama `descripcion_opcional`, no `descripcion`
- [x] **Corrección quirúrgica en `Panel.jsx`**:
  - Inserción en `envios`: cambiado `descripcion` → `descripcion_opcional`
  - Select en `cargarUltimoEnvio()`: cambiado `descripcion` → `descripcion_opcional`
  - Renderizado en UI: cambiado `descripcion` → `descripcion_opcional`
- [x] **Mantenido todo el manejo de errores transparente** añadido previamente
- [x] **No se muestran emails en la UI** (privacidad mantenida)

### Archivos modificados
| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `src/pages/Panel.jsx` | Modificado | Sustituido `descripcion` por `descripcion_opcional` en 3 lugares: insert, select y renderizado |

### Notas para sesiones futuras
- **Estructura real de la tabla `envios`**:
  - `id`, `grupo_id`, `fecha_envio`, `descripcion_opcional`, `created_at`
- **Cómo probar manualmente**:
  1. Ir a `/panel` → seleccionar grupo con alumnos → "Ver alumnos"
  2. Pulsar "Avisar a todos" y confirmar
  3. Esperar a que termine el envío
  4. **Mensaje esperado si todo sale bien**:  
     `Envío completado: N enviados de X total. ✓ Registrado en BD.`
  5. Verificar que aparece el resumen azul "📨 Último envío" con la descripción
  6. Verificar en Supabase Dashboard que la tabla `envios` tiene el registro
- **Si falla**: El mensaje mostrará `⚠️ ERROR al registrar en BD:` con el detalle del error

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
  - Señalado explícitamente para rediseño en próxima iteración de implementación

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

## 2026-04-19 - Trazabilidad mínima de envíos grupales en base de datos

**Objetivo:** Registrar los envíos grupales en base de datos y mostrar en el panel un resumen simple del último envío realizado por grupo.  
**Estado:** ✅ Completado

### Acciones realizadas
- [x] **Añadido estado `ultimoEnvioGrupo`**: almacena el último envío por grupo_id con fecha, descripción y conteo de destinatarios

- [x] **Creada función `cargarUltimoEnvio(grupoId)`**:
  - Consulta la tabla `envios` filtrando por grupo_id, ordenado por fecha descendente
  - Obtiene el envío más reciente (si existe)
  - Cuenta destinatarios en `envios_alumnos` para ese envío
  - Actualiza el estado local con los datos del último envío

- [x] **Modificada función `handleAvisarATodos()`**:
  - Durante el envío, guarda resultados por alumno (id, éxito/error) en array `resultadosPorAlumno`
  - Al finalizar el envío, crea registro en tabla `envios` con:
    - `grupo_id`: grupo actual
    - `descripcion`: resumen del resultado (ej. "Envío grupal: 5 ok, 1 error")
    - `fecha_envio`: timestamp ISO
  - Inserta registros en `envios_alumnos` para cada destinatario:
    - `envio_id`: id del envío creado
    - `alumno_id`: id del alumno
    - `estado`: "enviado" o "error" según resultado
  - Actualiza estado local llamando a `cargarUltimoEnvio()`

- [x] **Modificada función `cargarAlumnos()`**:
  - Ahora también carga el último envío del grupo cuando se abre la vista de alumnos
  - Mantiene la funcionalidad existente de cargar lista de alumnos

- [x] **Añadida UI de resumen del último envío**:
  - Sección azul claro (`#f0f9ff`) en la vista de alumnos
  - Muestra: fecha/hora formateada, descripción del resultado, número de destinatarios
  - Solo aparece si hay envíos previos para el grupo
  - Icono 📨 para identificar visualmente

- [x] **Actualizada cabecera de `Panel.jsx`**:
  - Eliminada limitación obsoleta: "No se registra trazabilidad de envíos en tabla envios/envios_alumnos"
  - Añadida nueva limitación: "No hay tracking de aperturas ni descargas"

### Archivos modificados
| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `src/pages/Panel.jsx` | Modificado | Estado `ultimoEnvioGrupo`, función `cargarUltimoEnvio`, lógica de registro en `handleAvisarATodos`, carga de último envío en `cargarAlumnos`, UI de resumen, cabecera actualizada |

### Notas para sesiones futuras
- **Privacidad mantenida**: El resumen del envío no muestra emails, solo conteos y resultados agregados
- **Estructura de datos utilizada**:
  - Tabla `envios`: id, grupo_id, descripcion, fecha_envio
  - Tabla `envios_alumnos`: id, envio_id, alumno_id, estado ("enviado"/"error")
- **Flujo de registro**:
  1. Enviar emails a todos los alumnos
  2. Crear registro en `envios` con resumen
  3. Crear registros en `envios_alumnos` con estado individual
  4. Recargar último envío para mostrar en UI
- **Para probar desde la UI**:
  1. Ir a `/panel`
  2. En un grupo con alumnos, pulsar "Ver alumnos"
  3. Si hay envíos previos, ver resumen azul "📨 Último envío"
  4. Pulsar "Avisar a todos" y completar el envío
  5. Ver que el resumen azul se actualiza automáticamente con el nuevo envío
  6. Verificar en Supabase Dashboard que las tablas `envios` y `envios_alumnos` tienen los registros
- **Qué falta para evolucionar a seguimiento más inteligente**:
  - Tracking de aperturas: requiere pixel de seguimiento o enlaces trackeados en emails
  - Tracking de descargas: requiere registrar accesos a materiales
  - Dashboard completo: lista de todos los envíos históricos, no solo el último
  - Estadísticas agregadas: tasa de apertura, clics, etc.
  - Notificaciones de error: alertar al profesor si hay fallos de envío

---

## 2026-04-19 - Fix: Corrección de valores de estado en trazabilidad de envíos

**Objetivo:** Corregir el error de constraint `envios_alumnos_estado_check` y asegurar que los loading states siempre se reseteen.  
**Estado:** ✅ Completado

### Causa raíz exacta
El código insertaba valores `'enviado'` y `'error'` en el campo `estado` de `envios_alumnos`, pero la constraint de la base de datos esperaba valores en inglés: `'sent'` y `'failed'`.

### Cambios realizados

**1. Corrección de valores en `Panel.jsx`:**
- Cambiado `'enviado'` → `'sent'`
- Cambiado `'error'` → `'failed'`
- Aplicado en ambas funciones: `handleEnviarAvisoAlumno` y `handleAvisarATodos`

**2. Añadida trazabilidad al envío individual:**
- Antes: `handleEnviarAvisoAlumno` no registraba en BD
- Ahora: registra en `envios` y `envios_alumnos` igual que el envío masivo

**3. Asegurado reset de loading states en `finally`:**
- `handleEnviarAvisoAlumno`: `setLoadingAvisoAlumno(false)` en bloque `finally`
- `handleAvisarATodos`: `setLoadingAvisarATodos(false)` en bloque `finally`
- La UI ya no se queda bloqueada si falla la trazabilidad

**4. Logs temporales de diagnóstico:**
- Añadidos logs en desarrollo para mostrar qué valores se intentan insertar
- Facilitan debug si la constraint sigue fallando

### Archivos modificados
| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `src/pages/Panel.jsx` | Modificado | Valores de estado cambiados a 'sent'/'failed', trazabilidad en envío individual, loading states en finally, logs de diagnóstico |

### Valores de estado
| Antes | Después |
|-------|---------|
| `'enviado'` | `'sent'` |
| `'error'` | `'failed'` |

### Cómo probar manualmente

**1. Aviso individual:**
- Ir a `/panel` → seleccionar grupo → "Ver alumnos"
- Seleccionar alumno → "Enviar aviso"
- Verificar que el email se envía y el mensaje muestra "✓ Registrado en BD."
- Verificar que el botón deja de decir "Enviando..."

**2. Avisar a todos:**
- En el mismo grupo, pulsar "Avisar a todos"
- Confirmar envío
- Verificar mensaje de éxito con "✓ Registrado en BD."
- Verificar que el botón vuelve a su estado normal

**3. Caso de error sin bloqueo:**
- Si la constraint sigue fallando, el mensaje mostrará "⚠️ ERROR al registrar en BD"
- El botón debe volver a su estado normal (no quedarse en "Enviando...")
- La consola del navegador mostrará logs detallados del error

### Logs temporales añadidos
- `[Trazabilidad Individual] Valor de estado a insertar:`
- `[Trazabilidad] Estado para alumno X:`
- `[Trazabilidad] Valores de estado a insertar:`
- Estos logs aparecen en la consola del navegador en modo desarrollo

---

## 2026-04-19 - Cierre del círculo: email con enlace, acceso auto y descarga mejorada

**Objetivo:** Cerrar el círculo real del producto: que el email lleve un enlace útil de vuelta, que el acceso del alumno sea más cómodo, y mejorar la descarga.  
**Estado:** ✅ Completado

### A. Mejorar el acceso desde email para el alumno

**Modificado `src/pages/AccesoAlumno.jsx`:**
- Ahora acepta query params: `codigo` y `email`
- Usa `useSearchParams` de React Router para leer los parámetros
- Si ambos parámetros existen en la URL:
  - Rellena automáticamente el formulario
  - Intenta acceso automático tras cargar
- Si faltan o son inválidos, mantiene el flujo manual normal
- Ejemplo de URL: `/acceso-alumno?codigo=ABC123&email=alumno@correo.com`

**Comportamiento:**
1. Alumno recibe email con enlace
2. Al pulsar el enlace, llega a `/acceso-alumno?codigo=X&email=Y`
3. El formulario se rellena automáticamente
4. Se intenta acceso automático
5. Si es válido, redirige directamente a `/mis-materiales`
6. Si falla, muestra error y permite intentar manualmente

### B. Enlazar el correo real con el flujo mejorado

**Modificado `src/pages/Panel.jsx`:**
- Nuevas funciones:
  - `generarEnlaceAcceso(codigoGrupo, emailAlumno)`: genera URL completa con parámetros
  - `generarContenidoEmail(...)`: crea HTML y texto del email personalizado
- URL base configurable via `VITE_APP_URL` o fallback a `window.location.origin`
- El enlace incluye código y email: `/acceso-alumno?codigo=...&email=...`

### C. Personalizar el contenido del email

**Nuevo formato del email:**
- **Asunto:** `Nuevo material en {nombreGrupo} - EnviaEso`
- **HTML:**
  - Título: "📚 Hay nuevo material disponible"
  - Saludo personalizado con nombre del alumno
  - Mensaje con nombre del profesor y nombre del grupo
  - Botón destacado: "Ver mis materiales" (azul, con padding)
  - Enlace alternativo como texto plano debajo
  - Footer con marca EnviaEso
- **Texto plano:** Versión limpia para clientes que no soportan HTML
- Ambas versiones incluyen el enlace directo

**En ambos envíos (individual y masivo):**
- Se usa el mismo formato personalizado
- Se incluye nombre del profesor (desde el perfil)
- Se incluye nombre del grupo
- Asunto dinámico con nombre del grupo

### D. Mejorar la descarga de materiales

**Modificado `src/pages/MisMateriales.jsx`:**
- Cambiado el tiempo de validez de la URL: de 60s a 300s (5 minutos)
- Nueva estrategia de descarga más natural:
  - Antes: `window.open(url, '_blank')` (podía abrir en navegador)
  - Ahora: crea un enlace `<a>` temporal con atributo `download`
  - Fuerza la descarga con el nombre original del archivo
  - Limpia el DOM después de la descarga
- Feedback visual: "Descargando..." mientras se procesa
- Mensaje de confirmación tras iniciar la descarga

### Archivos modificados
| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `src/pages/AccesoAlumno.jsx` | Modificado | Acepta query params, auto-relleno, auto-acceso |
| `src/pages/Panel.jsx` | Modificado | Generador de enlaces, generador de contenido de email, email personalizado |
| `src/pages/MisMateriales.jsx` | Modificado | Descarga forzada con nombre de archivo, URL válida 5 minutos |

### Cómo queda ahora el enlace dentro del correo

**Formato:**
```
https://enviaeso.com/acceso-alumno?codigo=ABC123&email=alumno%40ejemplo.com
```

**Componentes:**
- Base: `VITE_APP_URL` (o `window.location.origin` en desarrollo)
- Path: `/acceso-alumno`
- Query params: `codigo` y `email` (URL-encoded)

**Ejemplo real:**
```html
<a href="https://enviaeso.com/acceso-alumno?codigo=ABC123&email=maria%40gmail.com" 
   style="display: inline-block; background: #1570ef; color: white; padding: 12px 24px; 
          text-decoration: none; border-radius: 8px; font-weight: 500;">
  Ver mis materiales
</a>
```

### Cómo se comporta `AccesoAlumno` si recibe query params

**Caso 1: Params válidos (`?codigo=ABC&email=maria@test.com`)**
1. Los inputs se rellenan automáticamente
2. Se intenta validación automática
3. Si es válido: redirige a `/mis-materiales` sin interacción
4. Si es inválido: muestra error y permite intentar manualmente

**Caso 2: Params incompletos (`?codigo=ABC`)**
1. Se rellena solo el código
2. El email queda vacío
3. El usuario debe completar y pulsar el botón

**Caso 3: Sin params**
1. Formulario vacío normal
2. Flujo manual estándar

**Caso 4: Params inválidos**
1. Se rellenan los inputs con los valores recibidos
2. Al intentar validar, muestra error específico
3. El usuario puede corregir y reintentar

### Cómo queda el contenido del email

**Versión HTML:**
```html
📚 Hay nuevo material disponible

Hola {nombreAlumno},

{nombreProfesor} ha compartido nuevo material en tu grupo "{nombreGrupo}" 
a través de EnviaEso.

[Botón azul: Ver mis materiales] -> enlace con params

O copia y pega este enlace en tu navegador:
https://enviaeso.com/acceso-alumno?codigo=...&email=...

---
Enviado desde EnviaEso • enviaeso.com
```

**Versión texto plano:**
```
Hola {nombreAlumno},

{nombreProfesor} ha compartido nuevo material en tu grupo "{nombreGrupo}" 
a través de EnviaEso.

Puedes acceder a tus materiales aquí:
https://enviaeso.com/acceso-alumno?codigo=...&email=...

---
Enviado desde EnviaEso • enviaeso.com
```

### Qué se hizo para mejorar la descarga

**Antes:**
- URL firmada de 60 segundos
- `window.open(url, '_blank')`
- El navegador decidía si descargar o previsualizar
- Algunos archivos se abrían en pestaña en lugar de descargar

**Después:**
- URL firmada de 5 minutos (300 segundos) - más margen
- Enlace temporal `<a download="nombre_archivo.pdf">`
- Atributo `download` fuerza la descarga con nombre sugerido
- El archivo se descarga directamente sin abrir pestañas
- Feedback inmediato: "Descargando..." y luego mensaje de éxito

### Cómo probarlo manualmente

**1. Preparar el escenario:**
- Profesor con nombre en perfil
- Grupo con alumnos y materiales subidos

**2. Probar envío de email:**
- Ir a `/panel` → seleccionar grupo → "Ver alumnos"
- Enviar aviso individual a un alumno
- Verificar en inbox que el email tiene:
  - Nombre del profesor
  - Nombre del grupo
  - Botón "Ver mis materiales"
  - Enlace alternativo como texto

**3. Probar acceso desde email:**
- Copiar el enlace del email (o simularlo)
- Pegar en navegador incógnito
- Verificar que:
  - El formulario se rellena automáticamente
  - Se redirige a `/mis-materiales` (o muestra error si datos inválidos)

**4. Probar descarga:**
- En `/mis-materiales`, pulsar "Descargar"
- Verificar que el archivo se descarga directamente (no se abre en pestaña)
- Verificar que el nombre del archivo es el original

### Qué queda pendiente después de este bloque

**Corto plazo:**
- Configurar variable de entorno `VITE_APP_URL` para producción
- Verificar dominio en Resend para evitar spam filters
- Testing real con profesor y alumnos

**Medio plazo:**
- Diseño HTML profesional del email (plantilla completa)
- Tracking de aperturas y clics en emails (pixel + enlaces trackeados)
- Indicador de "nuevos materiales" vs "ya vistos" para alumnos

**Largo plazo:**
- Magic links reales con tokens JWT para alumnos
- Notificaciones push (si se convierte en PWA)
- App móvil nativa

---

## 2026-04-19 - Flujo de acceso del alumno y eliminación de prueba de email

**Objetivo:** Quitar el bloque de prueba de email del panel y crear un flujo mínimo pero real para que los alumnos puedan acceder y descargar sus materiales.  
**Estado:** ✅ Completado

### A. Limpiar la UI del panel profesor
- [x] **Eliminado el bloque de "Prueba de email"** del `Panel.jsx`:
  - Eliminado import de `enviarCorreoReal` (ya no se usa en panel)
  - Eliminados estados `emailPrueba` y `loadingEmailPrueba`
  - Eliminado handler `handleEnviarEmailPrueba`
  - Eliminada sección completa de la UI (fondo azul claro con formulario)
  - El panel ahora está más limpio y enfocado en acciones reales del producto

### B. Crear flujo de acceso del alumno
**1. Nueva página `src/pages/AccesoAlumno.jsx`:**
- Formulario de acceso con dos campos: código de grupo y email
- Validación de que ambos campos están completos
- Lógica de identificación:
  1. Busca el grupo por código (normalizado a mayúsculas)
  2. Verifica que existe un alumno con ese email en ese grupo
  3. Si coincide, redirige a `/mis-materiales` con los datos necesarios
  4. Si no coincide, muestra mensaje de error claro
- Sin exponer datos de otros alumnos
- Sin autenticación persistente (sesión por navegación)

**2. Nueva página `src/pages/MisMateriales.jsx`:**
- Recibe datos del alumno y grupo vía `location.state`
- Si no hay datos de acceso, redirige a `/acceso-alumno`
- Carga y muestra los materiales del grupo usando `listarMaterialesPorGrupo()`
- Cada material muestra: nombre, tamaño formateado, fecha de subida
- Botón "Descargar" que genera URL firmada y abre en nueva pestaña
- Mensaje amigable si no hay materiales disponibles
- Botón "Salir / Cambiar de grupo" para volver al acceso

**3. Actualización de `src/services/storage.js`:**
- Nueva función `obtenerUrlDescarga(filePath, expiresIn)`:
  - Genera URL firmada de Supabase Storage
  - Validez configurable (default 60 segundos)
  - Para descarga segura de archivos

**4. Actualización de `src/App.jsx`:**
- Nuevas importaciones: `AccesoAlumno` y `MisMateriales`
- Nuevas rutas:
  - `/acceso-alumno` → página de identificación del alumno
  - `/mis-materiales` → página de materiales del alumno

### C. Privacidad mantenida
- El alumno solo ve su propio nombre y los materiales de su grupo
- No se exponen listados de otros alumnos
- No se muestran emails ajenos
- El código de grupo solo valida, no revela información

### Archivos modificados
| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `src/pages/Panel.jsx` | Modificado | Eliminado bloque de prueba de email (import, estados, handler, UI) |
| `src/pages/AccesoAlumno.jsx` | Creado | Página de acceso para alumnos con código + email |
| `src/pages/MisMateriales.jsx` | Creado | Página de visualización y descarga de materiales |
| `src/services/storage.js` | Modificado | Nueva función `obtenerUrlDescarga()` |
| `src/App.jsx` | Modificado | Nuevas rutas `/acceso-alumno` y `/mis-materiales` |

### Cómo queda ahora el flujo del alumno

**Acceso:**
1. El alumno va a `/acceso-alumno`
2. Introduce su código de grupo (ej. ABC123) y su email
3. El sistema valida que el email pertenece a ese grupo
4. Si es válido, redirige a `/mis-materiales`

**Visualización:**
1. Muestra saludo personalizado con el nombre del alumno
2. Muestra el nombre del grupo
3. Lista todos los materiales disponibles con nombre, tamaño y fecha
4. Cada material tiene botón "Descargar"

**Descarga:**
1. Al pulsar "Descargar", se genera URL firmada de 60 segundos
2. Se abre en nueva pestaña para descargar el archivo
3. Si hay error, se muestra mensaje informativo

### Cómo se identifica el alumno
- **Código de grupo**: identifica el grupo (público, se comparte)
- **Email**: identifica al alumno dentro del grupo (privado)
- Ambos deben coincidir en la tabla `alumnos` para permitir acceso
- Sin contraseña adicional (acceso simple basado en datos ya existentes)

### Cómo se muestran y descargan los materiales
- Lista con tarjetas limpias (nombre, tamaño formateado, fecha)
- Botón de descarga por cada archivo
- URL firmada de Supabase Storage (segura, expira en 60s)
- Descarga en nueva pestaña para no interrumpir la experiencia

### Qué quitaste del bloque de prueba de email
- Sección completa con fondo azul claro (`#eff6ff`)
- Título "🧪 Prueba de email"
- Descripción explicativa
- Formulario con input de email y botón "Enviar prueba"
- Handler `handleEnviarEmailPrueba` con lógica de envío
- Estados `emailPrueba` y `loadingEmailPrueba`
- Import de `enviarCorreoReal` (ya no se usa en panel)
- Mensajes de éxito/error específicos del envío de prueba

### Cómo probarlo manualmente

**1. Preparar el escenario:**
- Crear un grupo en el panel del profesor
- Añadir alumnos al grupo (si no hay, insertar manualmente en tabla `alumnos`)
- Subir algunos materiales al grupo

**2. Probar acceso del alumno:**
- Ir a `/acceso-alumno`
- Introducir código del grupo y email de un alumno existente
- Verificar que redirige a `/mis-materiales`

**3. Probar visualización:**
- Verificar que aparece el nombre del alumno y del grupo
- Verificar que se listan los materiales subidos
- Verificar tamaño formateado y fecha

**4. Probar descarga:**
- Pulsar "Descargar" en un material
- Verificar que se abre en nueva pestaña y se descarga
- Verificar que la URL es firmada (tiene parámetros de token)

**5. Probar errores:**
- Código de grupo incorrecto → mensaje de error
- Email que no existe en el grupo → mensaje de error
- Grupo sin materiales → mensaje "Aún no hay materiales"

### Qué queda pendiente para enlazarlo desde el correo real

Para que el email de aviso lleve al alumno directamente a sus materiales, hay varias opciones:

**Opción A (Magic Link simple):**
- Incluir en el email: `https://enviaeso.com/acceso-alumno?codigo=ABC123&email=alumno@email.com`
- La página `/acceso-alumno` leería los query params y autocompletaría el formulario
- El alumno solo tendría que pulsar un botón para acceder

**Opción B (Token de acceso temporal):**
- Generar token JWT corto en Edge Function al enviar el email
- Incluir en el email: `https://enviaeso.com/acceso-directo?token=xyz`
- Validar token y redirigir directamente a `/mis-materiales`

**Opción C (Magic Link completo con Supabase Auth):**
- Crear usuarios de auth para alumnos (más complejo)
- Usar sistema de magic links nativo de Supabase

**Recomendación:** Opción A es la más simple y suficiente para MVP. Solo requiere:
- Modificar `AccesoAlumno.jsx` para leer query params
- Modificar el email de aviso para incluir el enlace con parámetros
- El alumno llega con los datos pre-rellenos, un clic y entra

---

## 2026-04-19 - Bloque: Autenticación base del profesor con Supabase Auth

**Objetivo:** Preparar la base mínima de autenticación real del profesor con Supabase Auth, incluyendo login/registro, detección de sesión, protección de rutas y logout.  
**Estado:** ✅ Completado

### Acciones realizadas
- [x] **Creado `docs/ESTADO_ACTUAL.md`**: Documento vivo y corto con resumen operativo del sistema (stack, flujos funcionando, estructura de tablas, decisiones vigentes, problemas abiertos, próximos pasos). Sirve como entrada rápida sin leer toda la bitácora histórica.

- [x] **Creado `src/services/auth.js`**: Servicio completo de autenticación con funciones:
  - `registrarProfesor(email, password)` - registro con creación automática en tabla `profesores`
  - `loginProfesor(email, password)` - inicio de sesión
  - `logoutProfesor()` - cierre de sesión
  - `obtenerSesion()` - obtener sesión actual
  - `obtenerUsuarioActual()` - obtener usuario autenticado
  - `suscribirCambiosAuth(callback)` - escuchar cambios de auth en tiempo real
  - `haySesionActiva()` - verificar si hay sesión

- [x] **Creado `src/pages/LoginProfesor.jsx`**: Página de login/registro unificada con:
  - Toggle entre modo login y registro
  - Validaciones básicas (email, contraseña mínimo 6 caracteres)
  - Feedback de errores y éxito
  - Redirección automática al panel tras login exitoso
  - Redirección al panel si ya hay sesión activa
  - Enlace para volver al inicio

- [x] **Actualizado `src/App.jsx`**: Router con protección de rutas:
  - `/` - Home (flujo alumno, público)
  - `/login` - LoginProfesor (redirige a `/panel` si ya está logueado)
  - `/panel` - Panel (protegido, requiere auth)
  - Detección global de sesión con `useEffect`
  - Suscripción a cambios de auth en tiempo real
  - Componentes `RutaProtegida` y `RutaPublicaProfesor` para control de acceso

- [x] **Actualizado `src/pages/Panel.jsx`**:
  - Añadido botón "Cerrar sesión" en el header
  - Handler `handleLogout` que cierra sesión y redirige a `/login`
  - Import de `useNavigate` y `logoutProfesor`

### Archivos creados/modificados
| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `docs/ESTADO_ACTUAL.md` | Creado | Resumen operativo vivo del sistema |
| `src/services/auth.js` | Creado | Servicio de autenticación completo con Supabase Auth |
| `src/pages/LoginProfesor.jsx` | Creado | Página de login/registro unificada |
| `src/App.jsx` | Modificado | Router con protección de rutas y detección de sesión |
| `src/pages/Panel.jsx` | Modificado | Botón de logout y handler de cierre de sesión |

### Notas para sesiones futuras
- **Flujo de autenticación funcionando**:
  1. Usuario no logueado intenta acceder a `/panel` → redirige a `/login`
  2. En `/login` puede crear cuenta o iniciar sesión
  3. Tras login exitoso → redirige a `/panel`
  4. En el panel puede usar "Cerrar sesión" para salir
  5. Si cierra sesión, al recargar `/panel` se redirige a `/login`

- **Limitaciones conocidas**:
  - El panel sigue usando `PROFESOR_ID_TEMPORAL` fijo (pendiente: usar ID real del usuario autenticado)
  - Sin recuperación de contraseña
  - Sin confirmación de email obligatoria
  - RLS permisivas (deuda técnica de seguridad)

- **Cómo probar manualmente**:
  1. Ir a `/login` → crear una cuenta con email y contraseña (mín. 6 chars)
  2. Verificar mensaje "Cuenta creada correctamente. Redirigiendo..."
  3. Debería aparecer el panel del profesor
  4. Probar cerrar sesión con el botón superior derecho
  5. Intentar acceder a `/panel` sin estar logueado → debería redirigir a `/login`
  6. Iniciar sesión con las credenciales creadas → debería redirigir al panel

- **Próximo paso prioritario**: Actualizar el panel para usar el ID real del profesor autenticado (reemplazar `PROFESOR_ID_TEMPORAL` por `user.id` de Supabase Auth) para que los grupos se asocien al usuario correcto.

---

**Total de sesiones registradas:** 23  
**Última actualización:** 19 de abril de 2026
