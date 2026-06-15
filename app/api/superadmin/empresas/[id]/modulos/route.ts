import { NextRequest, NextResponse } from 'next/server'
import { isSuperadminAuthenticated } from '@/lib/superadmin-auth'
import { supabaseMaster } from '@/services/supabase-master'

type Ctx = { params: Promise<{ id: string }> }

export async function PUT(req: NextRequest, { params }: Ctx) {
  if (!await isSuperadminAuthenticated())
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params
  const { modulos } = await req.json()

  const { data: catalogo, error: catError } = await supabaseMaster
    .from('modulos')
    .select('nombre')
    .order('orden')

  if (catError) return NextResponse.json({ error: catError.message }, { status: 500 })

  const upserts = catalogo.map(m => ({
    empresa_id: id,
    modulo: m.nombre,
    activo: (modulos as string[]).includes(m.nombre),
  }))

  const { error } = await supabaseMaster
    .from('empresa_modulos')
    .upsert(upserts, { onConflict: 'empresa_id,modulo' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
