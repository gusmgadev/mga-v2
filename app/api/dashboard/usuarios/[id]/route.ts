import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/services/supabase-admin'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const updateSchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres'),
  email: z.string().email('Email inválido'),
  role_id: z.number().int().positive(),
  password: z.string().min(8).optional().or(z.literal('')),
})

async function requireAdmin() {
  const session = await auth()
  if (!session || session.user.role !== 'Administrador') return null
  return session
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 })
  }

  const { name, email, role_id, password } = parsed.data

  // Update auth user (email and optionally password)
  const authUpdate: Record<string, string> = { email }
  if (password) authUpdate.password = password

  const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(id, authUpdate)
  if (authError) return NextResponse.json({ error: authError.message }, { status: 500 })

  // Update profile
  const { data, error: profileError } = await supabaseAdmin
    .from('users')
    .update({ name, email, role_id, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('id, email, name, role_id, created_at, roles(name)')
    .single()

  if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params

  if (id === session.user.id) {
    return NextResponse.json({ error: 'No podés eliminar tu propia cuenta' }, { status: 400 })
  }

  const { error } = await supabaseAdmin.auth.admin.deleteUser(id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
