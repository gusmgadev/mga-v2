import { NextRequest, NextResponse } from 'next/server'
import { isSuperadminAuthenticated } from '@/lib/superadmin-auth'
import { supabaseMaster } from '@/services/supabase-master'

type Ctx = { params: Promise<{ id: string }> }

export async function PUT(req: NextRequest, { params }: Ctx) {
  if (!await isSuperadminAuthenticated())
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params
  const { nombre, descripcion, activo, orden } = await req.json()

  const { data, error } = await supabaseMaster
    .from('modulos')
    .update({
      nombre: nombre?.trim().toLowerCase(),
      descripcion: descripcion || null,
      activo,
      orden,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  if (!await isSuperadminAuthenticated())
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params
  const { error } = await supabaseMaster.from('modulos').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
