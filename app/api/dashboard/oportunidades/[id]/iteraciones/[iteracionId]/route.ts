import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/services/supabase-admin'

async function requireSession() {
  const session = await auth()
  if (!session) return null
  return session
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; iteracionId: string }> }
) {
  if (!(await requireSession())) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id, iteracionId } = await params
  const { error } = await supabaseAdmin
    .from('oportunidad_iteraciones')
    .delete()
    .eq('id', Number(iteracionId))
    .eq('oportunidad_id', Number(id))

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
