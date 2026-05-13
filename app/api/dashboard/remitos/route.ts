import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/services/supabase-admin'
import { z } from 'zod'

const createSchema = z.object({
  tipo: z.enum(['entrada', 'salida']),
  numero_tipo: z.enum(['automatico', 'manual', 'proveedor']).default('automatico'),
  numero: z.string().optional(),
  fecha: z.string().min(1),
  origen_destino_id: z.string().uuid().nullable().optional(),
  origen_destino_texto: z.string().nullable().optional(),
  observaciones: z.string().nullable().optional(),
})

async function requireSession() {
  const session = await auth()
  if (!session) return null
  return session
}

async function generarNumeroAutomatico(): Promise<string> {
  const { count } = await supabaseAdmin
    .from('remitos')
    .select('*', { count: 'exact', head: true })
  return `REM-${String((count ?? 0) + 1).padStart(4, '0')}`
}

export async function GET(req: Request) {
  const session = await requireSession()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const tipo = searchParams.get('tipo')
  const estado = searchParams.get('estado')

  let query = supabaseAdmin
    .from('remitos')
    .select('*, origenes_destinos(id, nombre, tipo), remito_items(id)')
    .order('created_at', { ascending: false })

  if (tipo) query = query.eq('tipo', tipo)
  if (estado) query = query.eq('estado', estado)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const session = await requireSession()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })

  let numero = parsed.data.numero ?? ''
  if (parsed.data.numero_tipo === 'automatico') {
    numero = await generarNumeroAutomatico()
  }
  if (!numero) return NextResponse.json({ error: 'El número de remito es requerido' }, { status: 400 })

  const { data, error } = await supabaseAdmin
    .from('remitos')
    .insert({
      ...parsed.data,
      numero,
      usuario_id: session.user.id,
      estado: 'borrador',
    })
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
