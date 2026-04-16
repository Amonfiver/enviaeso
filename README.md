<!--
================================================================================
PROPOSITO DEL ARCHIVO
================================================================================
Punto de entrada principal del proyecto. Resume qué es EnviaEso, qué problema
resuelve, su propuesta de valor y cómo se está desarrollando. Sirve para que
cualquier persona (incluido otro agente) entienda el contexto rápidamente.

================================================================================
ALCANCE
================================================================================
- Información de alto nivel del proyecto
- Estado actual y objetivo inmediato
- Metodología de trabajo (SDD + Cline)
- NO incluye especificaciones técnicas detalladas (ver docs/)
- NO incluye instrucciones de instalación ni uso (aún no aplica)

================================================================================
DECISIONES IMPORTANTES ACTUALES
================================================================================
- Metodología: Spec Driven Development (SDD) con trabajo incremental
- Objetivo inmediato: validación rápida con demo real para profesor (lunes)
- Documentación viva: todos los archivos deben mantenerse actualizados
- Cabeceras descriptivas obligatorias en todos los archivos

================================================================================
LIMITACIONES O ESTADO TEMPORAL
================================================================================
- Este archivo evolucionará conforme el proyecto avance
- Las secciones de instalación y uso se añadirán cuando haya algo funcional
- El estado actual es "fase inicial / definición de especificaciones"
================================================================================
-->

# EnviaEso

## Resumen

EnviaEso es una aplicación web que permite a los alumnos enviar sus trabajos académicos a los profesores de forma sencilla, sin necesidad de registrarse ni crear cuentas.

## Problema que resuelve

Los estudiantes a menudo necesitan entregar trabajos, ejercicios o documentos a sus profesores. El proceso actual suele implicar:
- Crear cuentas en plataformas complejas
- Recordar múltiples credenciales
- Navegar por interfaces sobrecargadas
- Depender de servicios de correo personal

EnviaEso elimina esta fricción proporcionando un canal directo y simple de entrega.

## Propuesta de valor

1. **Sin registro**: El alumno completa un formulario simple sin crear cuenta
2. **Directo al profesor**: El trabajo llega directamente al destinatario indicado
3. **Rápido y simple**: Flujo mínimo de pasos para completar la entrega
4. **Validación por código**: El profesor puede identificar y organizar entregas fácilmente

## Estado actual

| Aspecto | Estado |
|---------|--------|
| Fase | Inicial - Definición de especificaciones |
| Objetivo inmediato | Validación rápida con demo real para profesor |
| Fecha objetivo | Lunes (próximo) |
| Código funcional | Aún no implementado |

## Forma de trabajo: SDD + Cline

Este proyecto sigue el enfoque **Spec Driven Development**:

1. **Especificación primero**: Definimos qué queremos construir antes de escribir código
2. **Iteraciones pequeñas**: Cambios acotados y revisables fácilmente
3. **Documentación viva**: Los documentos se actualizan junto con el código
4. **Bitácora continua**: Registro de decisiones y cambios en cada iteración

Cline actúa como agente de desarrollo, trabajando sobre las especificaciones definidas en `docs/`.

## Estructura del proyecto

```
enviaeso/
├── README.md           # Este archivo - punto de entrada
├── docs/
│   ├── SPEC.md         # Especificación funcional detallada
│   ├── ARCHITECTURE.md # Decisiones de arquitectura técnica
│   ├── DECISIONES.md   # Registro de decisiones tomadas
│   └── BITACORA.md     # Historial de cambios e iteraciones
└── [código - por crear]
```

## Documentación relevante

- [Especificación funcional](docs/SPEC.md) - Qué debe hacer el sistema
- [Arquitectura](docs/ARCHITECTURE.md) - Cómo está organizado técnicamente
- [Decisiones](docs/DECISIONES.md) - Por qué se tomaron ciertas decisiones
- [Bitácora](docs/BITACORA.md) - Historial de cambios

---

> **Nota**: Este proyecto está en fase inicial. La documentación y el código evolucionarán rápidamente durante las primeras iteraciones.