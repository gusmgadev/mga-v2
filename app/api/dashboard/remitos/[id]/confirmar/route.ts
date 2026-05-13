import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/services/supabase-admin'

async function requireSession() {
  const session = await auth()
  if (!session) return null
  return session
}

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params

  const { data: remito } = await supabaseAdmin
    .from('remitos')
    .select('estado, remito_items(id)')
    .eq('id', id)
    .single()

  if (!remito) return NextResponse.json({ error: 'Remito no encontrado' }, { status: 404 })
  if (remito.estado !== 'borrador') {
    return NextResponse.json({ error: 'El remito ya fue confirmado o anulado' }, { status: 400 })
  }
  if (!remito.remito_items || remito.remito_items.length === 0) {
    return NextResponse.json({ error: 'El remito no tiene ítems' }, { status: 400 })
  }

  const { error } = await supabaseAdmin.rpc('confirmar_remito', { p_remito_id: id })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
