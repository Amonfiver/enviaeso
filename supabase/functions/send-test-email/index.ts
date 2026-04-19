/**
 * ================================================================================
 * PROPOSITO DEL ARCHIVO
 * ================================================================================
 * Edge Function de Supabase para envío real de correos electrónicos usando Resend.
 * Punto de entrada server-side seguro que protege la API key de Resend y expone
 * una interfaz simple para enviar emails de prueba desde el proyecto EnviaEso.
 *
 * ================================================================================
 * ALCANCE
 * ================================================================================
 * - Endpoint POST /send-test-email
 * - Lee RESEND_API_KEY desde variables de entorno (server-side only)
 * - Acepta payload JSON con: to, subject, html o text
 * - Envía correo mediante API de Resend
 * - Devuelve respuesta JSON con resultado claro (éxito/error)
 * - Validaciones básicas de campos requeridos
 *
 * ================================================================================
 * DECISIONES TECNICAS IMPORTANTES
 * ================================================================================
 * 1. SUPABASE EDGE FUNCTIONS:
 *    - Elección: Serverless functions integradas en Supabase
 *    - Justificación: Mismo ecosistema, sin servidor propio, deploy simple
 *    - Alternativas consideradas: Vercel Functions, Cloudflare Workers
 *
 * 2. SEGURIDAD - PROTECCION DE API KEY:
 *    - RESEND_API_KEY solo existe en variables de entorno de Supabase
 *    - Nunca expuesta al cliente, ni en código fuente
 *    - Rotación simple mediante dashboard de Supabase
 *
 * 3. VALIDACION MINIMA:
 *    - Solo verifica presencia de campos requeridos
 *    - Resend valida formato de emails y rechaza los inválidos
 *    - No se implementa rate-limiting en este bloque (pendiente)
 *
 * 4. FORMATO DE RESPUESTA:
 *    - Siempre JSON, siempre status 200 en caso de éxito
 *    - En errores: status 4xx/5xx con { success: false, error: string }
 *    - En éxito: { success: true, messageId: string }
 *
 * ================================================================================
 * LIMITACIONES O ESTADO TEMPORAL
 * ================================================================================
 * - NO incluye autenticación ni autorización (cualquiera puede llamar al endpoint)
 * - NO incluye rate-limiting (vulnerable a spam si se expone públicamente)
 * - NO incluye logging persistente (solo logs de Supabase Dashboard)
 * - Solo envía correos de prueba, NO implementa plantillas ni envíos masivos
 *
 * ================================================================================
 * CONFIGURACION REQUERIDA
 * ================================================================================
 * 1. En Supabase Dashboard → Edge Functions → Variables de entorno:
 *    - Añadir RESEND_API_KEY con tu API key de Resend
 *    - Añadir EMAIL_FROM con la dirección remitente verificada
 *      (ejemplo: noreply@mail.enviaeso.com)
 *
 * 2. En Resend Dashboard:
 *    - Verificar dominio remitente (mail.enviaeso.com debe estar verificado)
 *
 * 3. Para deploy local:
 *    - supabase functions serve
 *    - Requiere CLI de Supabase instalada y proyecto vinculado
 *
 * ================================================================================
 * USO ESPERADO
 * ================================================================================
 * POST https://<project-ref>.supabase.co/functions/v1/send-test-email
 * Content-Type: application/json
 *
 * {
 *   "to": "destinatario@ejemplo.com",
 *   "subject": "Asunto del correo",
 *   "html": "<p>Contenido HTML</p>",
 *   "text": "Contenido texto plano (opcional, fallback de html)"
 * }
 *
 * ================================================================================
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Interfaz del payload esperado
interface EmailPayload {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}

// Interfaz de respuesta de Resend
interface ResendResponse {
  id?: string;
  error?: {
    message: string;
  };
}

// Handler principal
serve(async (req: Request) => {
  // Solo permitir POST
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({
        success: false,
        error: `Método ${req.method} no permitido. Usa POST.`,
      }),
      { status: 405, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    // Parsear body JSON
    let payload: EmailPayload;
    try {
      payload = await req.json();
    } catch (_e) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Body inválido. Se espera JSON válido.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validar campos requeridos
    const { to, subject, html, text } = payload;

    if (!to || typeof to !== "string" || to.trim() === "") {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Campo 'to' es requerido y debe ser un email válido.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!subject || typeof subject !== "string" || subject.trim() === "") {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Campo 'subject' es requerido.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Debe tener al menos html o text
    if ((!html || html.trim() === "") && (!text || text.trim() === "")) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Debe proporcionar 'html' o 'text' como contenido del correo.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Obtener secrets desde variables de entorno
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("[send-test-email] RESEND_API_KEY no configurada");
      return new Response(
        JSON.stringify({
          success: false,
          error: "Error de configuración del servidor: RESEND_API_KEY no configurada.",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const from = Deno.env.get("EMAIL_FROM");
    if (!from) {
      console.error("[send-test-email] EMAIL_FROM no configurada");
      return new Response(
        JSON.stringify({
          success: false,
          error: "Error de configuración del servidor: EMAIL_FROM no configurada.",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const resendBody: Record<string, string> = {
      from,
      to: to.trim(),
      subject: subject.trim(),
    };

    if (html && html.trim() !== "") {
      resendBody.html = html.trim();
    }

    if (text && text.trim() !== "") {
      resendBody.text = text.trim();
    }

    // Llamar a API de Resend
    console.log(`[send-test-email] Enviando correo a: ${to}`);
    
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(resendBody),
    });

    const resendData: ResendResponse = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error("[send-test-email] Error de Resend:", resendData);
      return new Response(
        JSON.stringify({
          success: false,
          error: resendData.error?.message || "Error al enviar correo via Resend",
        }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    // Éxito
    console.log(`[send-test-email] Correo enviado. ID: ${resendData.id}`);
    
    return new Response(
      JSON.stringify({
        success: true,
        messageId: resendData.id,
        to: to.trim(),
        subject: subject.trim(),
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[send-test-email] Error inesperado:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: "Error interno del servidor",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});