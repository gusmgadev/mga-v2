import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/services/supabase-admin'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const createSchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  role_id: z.number().int().positive(),
})

async function requireAdmin() {
  const session = await auth()
  if (!session) return null
  if (session.user.role !== 'Administrador') return null
  return session
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id, email, name, role_id, created_at, roles(name)')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 })
  }

  const { name, email, password, role_id } = parsed.data

  const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authError) {
    const status = authError.message.toLowerCase().includes('already') ? 409 : 500
    return NextResponse.json({ error: authError.message }, { status })
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('users')
    .insert({ id: authUser.user.id, email, name, role_id })
    .select('id, email, name, role_id, created_at, roles(name)')
    .single()

  if (profileError) {
    await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
    return NextResponse.json({ error: profileError.message }, { status: 500 })
  }

  return NextResponse.json(profile, { status: 201 })
}
