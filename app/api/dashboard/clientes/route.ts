import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/services/supabase-admin'
import { z } from 'zod'

const createSchema = z.object({
  nombre: z.string().min(2, 'Mínimo 2 caracteres'),
  tipo: z.enum(['PARTICULAR', 'EMPRESA', 'COMERCIO']),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  telefono: z.string().optional(),
  direccion: z.string().optional(),
  cuit: z.string().optional(),
  rubro: z.string().optional(),
  localidad: z.string().optional(),
  notas: z.string().optional(),
  activo: z.boolean(),
  imagen: z.string().optional(),
  pagina_web: z.string().url('URL inválida').optional().or(z.literal('')),
  mostrar_en_landing: z.boolean(),
})

async function requireSession() {
  const session = await auth()
  if (!session) return null
  return session
}

export async function GET() {
  if (!(await requireSession())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  const { data, error } = await supabaseAdmin
    .from('clientes')
    .select('*')
    .order('nombre')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  if (!(await requireSession())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 })
  }
  const { data, error } = await supabaseAdmin
    .from('clientes')
    .insert(parsed.data)
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
