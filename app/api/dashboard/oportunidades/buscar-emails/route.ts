import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { ImapFlow } from 'imapflow'
import { simpleParser, type ParsedMail } from 'mailparser'

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const imapUser = process.env.GMAIL_IMAP_USER
  const imapPass = process.env.GMAIL_IMAP_PASSWORD
  if (!imapUser || !imapPass) {
    return NextResponse.json(
      { error: 'GMAIL_IMAP_USER y GMAIL_IMAP_PASSWORD no están configurados en el servidor.' },
      { status: 503 }
    )
  }

  const { desde, hasta, remitente, asunto, palabrasClave } = await req.json()

  const criteria: Record<string, unknown> = {}
  if (desde) criteria.since = new Date(desde)
  if (hasta) criteria.before = new Date(new Date(hasta).getTime() + 86400000)
  if (remitente) criteria.from = remitente
  if (asunto) criteria.subject = asunto
  if (palabrasClave) criteria.body = palabrasClave

  if (Object.keys(criteria).length === 0) {
    return NextResponse.json({ error: 'Ingresá al menos un criterio de búsqueda' }, { status: 400 })
  }

  const client = new ImapFlow({
    host: 'imap.gmail.com',
    port: 993,
    secure: true,
    auth: { user: imapUser, pass: imapPass },
    logger: false,
  })

  try {
    await client.connect()

    // Find the "All Mail" mailbox regardless of language using \All special-use flag
    const mailboxes = await client.list()
    const allMailBox = mailboxes.find(
      (mb) => (mb as { specialUse?: string }).specialUse === '\\All'
    )
    const mailboxPath = allMailBox?.path ?? 'INBOX'
    await client.mailboxOpen(mailboxPath)

    const searchResult = await client.search(criteria, { uid: true })
    const uids: number[] = Array.isArray(searchResult) ? searchResult : []
    const limitedUids = uids.slice(-50)

    const emails: {
      uid: number
      messageId: string
      subject: string
      from: string
      date: string
      snippet: string
      body: string
    }[] = []

    if (limitedUids.length > 0) {
      for await (const msg of client.fetch(limitedUids, { source: true }, { uid: true })) {
        try {
          if (!msg.source) continue
          const parsed = await (simpleParser(msg.source) as Promise<ParsedMail>)

          const extractText = (p: ParsedMail): string => {
            const rawText = (p.text ?? '').trim()
            const htmlText = (p.html || '')
              .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
              .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
              .replace(/<[^>]+>/g, ' ')
              .replace(/&nbsp;/gi, ' ')
              .replace(/&[a-z]+;/gi, ' ')
              .replace(/\s+/g, ' ')
              .trim()
            return htmlText.length >= rawText.length ? htmlText : rawText
          }

          let body = extractText(parsed)

          // Bitdefender wraps the original email as a message/rfc822 attachment — parse it recursively
          if (body.length < 300 && parsed.attachments?.length) {
            for (const att of parsed.attachments) {
              if (att.contentType === 'message/rfc822' && att.content) {
                try {
                  const inner = await (simpleParser(att.content) as Promise<ParsedMail>)
                  const innerBody = extractText(inner)
                  if (innerBody.length > body.length) body = innerBody
                } catch { /* ignore */ }
              }
            }
          }

          emails.push({
            uid: msg.uid,
            messageId: parsed.messageId ?? `uid-${msg.uid}`,
            subject: parsed.subject ?? '(sin asunto)',
            from: parsed.from?.text ?? '',
            date: parsed.date?.toISOString() ?? '',
            snippet: body.slice(0, 400),
            body,
          })
        } catch {
          // skip malformed email
        }
      }
    }

    await client.logout()

    // Deduplicate: Bitdefender delivers both the original and its scanned wrapper as separate
    // emails in Gmail. Both have the same task number in the body — keep the one with more content.
    const deduped = new Map<string, typeof emails[0]>()
    for (const email of emails) {
      const taskMatch = email.body.match(/tarea\s+n[uú]mero\s+(\d+)/i)
      const key = taskMatch ? `task-${taskMatch[1]}` : `uid-${email.uid}`
      const existing = deduped.get(key)
      if (!existing || email.body.length > existing.body.length) {
        deduped.set(key, email)
      }
    }
    const deduplicatedEmails = Array.from(deduped.values())
    deduplicatedEmails.sort((a, b) => (b.date > a.date ? 1 : -1))

    return NextResponse.json({ emails: deduplicatedEmails, total: deduplicatedEmails.length })
  } catch (err) {
    try { await client.logout() } catch { /* ignore */ }
    const msg = err instanceof Error ? err.message : 'Error de conexión IMAP'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
