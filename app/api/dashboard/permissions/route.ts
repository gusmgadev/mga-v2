import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/services/supabase-admin'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  if (session.user.role === 'Administrador') {
    return NextResponse.json(
      ['clientes', 'activos', 'servicios', 'presupuestos', 'cobranzas', 'productos', 'remitos'].map((m) => ({
        module: m,
        can_view: true,
        can_create: true,
        can_edit: true,
        can_delete: true,
      }))
    )
  }

  const { data } = await supabaseAdmin
    .from('role_permissions')
    .select('module, can_view, can_create, can_edit, can_delete')
    .eq('role_id', session.user.role_id)

  return NextResponse.json(data ?? [])
}
