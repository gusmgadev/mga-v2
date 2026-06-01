import { NextRequest, NextResponse } from 'next/server'
import { isSuperadminAuthenticated } from '@/lib/superadmin-auth'
import { supabaseMaster } from '@/services/supabase-master'

type Ctx = { params: Promise<{ id: string }> }

const MODULOS_VALIDOS = ['ventas', 'inventario', 'caja', 'contactos', 'finanzas', 'administracion']

export async function PUT(req: NextRequest, { params }: Ctx) {
  if (!await isSuperadminAuthenticated())
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params
  const { modulos } = await req.json()

  const upserts = MODULOS_VALIDOS.map(m => ({
    empresa_id: id,
    modulo: m,
    activo: (modulos as string[]).includes(m),
  }))

  const { error } = await supabaseMaster
    .from('empresa_modulos')
    .upsert(upserts, { onConflict: 'empresa_id,modulo' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
