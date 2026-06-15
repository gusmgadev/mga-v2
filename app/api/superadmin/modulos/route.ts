import { NextRequest, NextResponse } from 'next/server'
import { isSuperadminAuthenticated } from '@/lib/superadmin-auth'
import { supabaseMaster } from '@/services/supabase-master'

export async function GET() {
  if (!await isSuperadminAuthenticated())
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { data, error } = await supabaseMaster
    .from('modulos')
    .select('*')
    .order('orden', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  if (!await isSuperadminAuthenticated())
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { nombre, descripcion, activo, orden } = await req.json()
  if (!nombre?.trim())
    return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 })

  const { data, error } = await supabaseMaster
    .from('modulos')
    .insert({
      nombre: nombre.trim().toLowerCase(),
      descripcion: descripcion || null,
      activo: activo ?? true,
      orden: orden ?? 0,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
