import { NextRequest, NextResponse } from 'next/server'
import { isSuperadminAuthenticated } from '@/lib/superadmin-auth'
import { supabaseMaster } from '@/services/supabase-master'

type Ctx = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Ctx) {
  if (!await isSuperadminAuthenticated())
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params
  const { data, error } = await supabaseMaster
    .from('empresas')
    .select('*, empresa_modulos(*)')
    .eq('id', id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json(data)
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  if (!await isSuperadminAuthenticated())
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const {
    nombre, codigo, activo,
    supabase_url, supabase_anon_key, supabase_service_key,
    razon_social, cuit, telefono, email, direccion, localidad,
    plan, fecha_inicio, fecha_vencimiento, estado_implementacion, notas,
  } = body

  const { data, error } = await supabaseMaster
    .from('empresas')
    .update({
      nombre, codigo: codigo?.toUpperCase(), activo,
      supabase_url, supabase_anon_key, supabase_service_key,
      razon_social, cuit, telefono, email, direccion, localidad,
      plan, fecha_inicio, fecha_vencimiento, estado_implementacion, notas,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
