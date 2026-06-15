import { NextRequest, NextResponse } from 'next/server'
import { isSuperadminAuthenticated } from '@/lib/superadmin-auth'
import { supabaseMaster } from '@/services/supabase-master'

export async function GET() {
  if (!await isSuperadminAuthenticated())
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { data, error } = await supabaseMaster
    .from('empresas')
    .select('*, empresa_modulos(*)')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  if (!await isSuperadminAuthenticated())
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const body = await req.json()
  const {
    nombre, codigo, supabase_url, supabase_anon_key, supabase_service_key,
    razon_social, cuit, telefono, email, direccion, localidad,
    plan, fecha_inicio, fecha_vencimiento, estado_implementacion, notas,
    modulos,
  } = body

  if (!nombre?.trim() || !codigo?.trim() || !supabase_url?.trim())
    return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })

  const { data: empresa, error } = await supabaseMaster
    .from('empresas')
    .insert({
      nombre: nombre.trim(),
      codigo: codigo.trim().toUpperCase(),
      supabase_url: supabase_url.trim(),
      supabase_anon_key: supabase_anon_key?.trim(),
      supabase_service_key: supabase_service_key?.trim(),
      razon_social, cuit, telefono, email, direccion, localidad,
      plan, fecha_inicio, fecha_vencimiento, estado_implementacion, notas,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: catalogoModulos } = await supabaseMaster.from('modulos').select('nombre').order('orden')
  const nombresModulos = catalogoModulos?.map(m => m.nombre) ?? []
  const modulosActivos = (modulos ?? nombresModulos) as string[]
  await supabaseMaster.from('empresa_modulos').insert(
    nombresModulos.map(m => ({
      empresa_id: empresa.id,
      modulo: m,
      activo: modulosActivos.includes(m),
    }))
  )

  return NextResponse.json(empresa, { status: 201 })
}
