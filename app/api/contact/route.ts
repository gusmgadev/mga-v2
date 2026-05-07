import { Resend } from "resend"

const TO_EMAIL = "consultas@mgadigital.com.ar"

export async function POST(request: Request) {
  const resend = new Resend(process.env.RESEND_API_KEY)
  const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "noreply@mgadigital.com.ar"
  const body = await request.json()
  const { name, email, phone, message } = body as {
    name: string
    email: string
    phone?: string
    message: string
  }

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return Response.json({ error: "Campos requeridos incompletos." }, { status: 400 })
  }

  const { error } = await resend.emails.send({
    from:     `MGA Informática <${FROM_EMAIL}>`,
    to:       TO_EMAIL,
    replyTo:  email,
    subject:  `Nueva consulta de ${name} — mgadigital.com.ar`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#333">
        <div style="background:#1A237E;padding:24px 32px;border-radius:8px 8px 0 0">
          <h2 style="color:#fff;margin:0;font-size:18px">Nueva consulta desde mgadigital.com.ar</h2>
        </div>
        <div style="background:#f9f9f9;padding:24px 32px;border-radius:0 0 8px 8px;border:1px solid #e0e0e0;border-top:none">
          <table style="width:100%;border-collapse:collapse">
            <tr>
              <td style="padding:8px 0;color:#666;width:100px;vertical-align:top">Nombre</td>
              <td style="padding:8px 0;font-weight:600">${name}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#666;vertical-align:top">Email</td>
              <td style="padding:8px 0">
                <a href="mailto:${email}" style="color:#1A237E">${email}</a>
              </td>
            </tr>
            ${phone ? `
            <tr>
              <td style="padding:8px 0;color:#666;vertical-align:top">Teléfono</td>
              <td style="padding:8px 0">${phone}</td>
            </tr>` : ""}
            <tr>
              <td style="padding:8px 0;color:#666;vertical-align:top">Mensaje</td>
              <td style="padding:8px 0;white-space:pre-wrap">${message}</td>
            </tr>
          </table>
          <div style="margin-top:24px;padding-top:16px;border-top:1px solid #e0e0e0">
            <a href="mailto:${email}"
               style="display:inline-block;background:#1A237E;color:#fff;padding:10px 24px;border-radius:99px;text-decoration:none;font-weight:600;font-size:14px">
              Responder a ${name}
            </a>
          </div>
        </div>
        <p style="color:#aaa;font-size:11px;text-align:center;margin-top:16px">
          MGA Informática · mgadigital.com.ar
        </p>
      </div>
    `,
  })

  if (error) {
    console.error("[contact] Resend error:", error)
    return Response.json({ error: "No se pudo enviar el mensaje. Intentá de nuevo." }, { status: 500 })
  }

  return Response.json({ ok: true })
}
