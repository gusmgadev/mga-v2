import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/services/supabase-admin'
import { NextResponse } from 'next/server'

async function requireAdmin() {
  const session = await auth()
  if (!session || session.user.role !== 'Administrador') return null
  return session
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const [{ data: roles }, { data: permisos }] = await Promise.all([
    supabaseAdmin.from('roles').select('id, name').order('id'),
    supabaseAdmin.from('role_permissions').select('*').order('role_id'),
  ])

  return NextResponse.json({ roles: roles ?? [], permisos: permisos ?? [] })
}

export async function PUT(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const body: Array<{
    role_id: number
    module: string
    can_view: boolean
    can_create: boolean
    can_edit: boolean
    can_delete: boolean
  }> = await req.json()

  const { error } = await supabaseAdmin.from('role_permissions').upsert(body, {
    onConflict: 'role_id,module',
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
