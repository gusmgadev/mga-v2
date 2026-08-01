import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/services/supabase-admin'
import { commercialStatusUpdateSchema } from '@/lib/radar/validations'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const parsed = commercialStatusUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const updateFields: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

  if (parsed.data.commercial_status) {
    updateFields.commercial_status = parsed.data.commercial_status
  }

  if (parsed.data.email !== undefined) {
    updateFields.email = parsed.data.email
  }

  if (parsed.data.whatsapp !== undefined) {
    updateFields.whatsapp = parsed.data.whatsapp
  }

  const { data, error } = await supabaseAdmin
    .from('prospects')
    .update(updateFields)
    .eq('id', id)
    .eq('user_id', session.user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
