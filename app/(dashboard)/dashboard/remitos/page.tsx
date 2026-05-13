import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/services/supabase-admin'
import { getModulePermisos } from '@/lib/permisos'
import RemitosClient from './RemitosClient'

export default async function RemitosPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string; estado?: string }>
}) {
  const session = await auth()
  if (!session) redirect('/auth/signin')

  const permisos = await getModulePermisos(session.user.role_id, session.user.role, 'remitos')
  if (!permisos.can_view) redirect('/dashboard')

  const { tipo, estado } = await searchParams

  let query = supabaseAdmin
    .from('remitos')
    .select('*, origenes_destinos(id, nombre, tipo), remito_items(id)')
    .order('created_at', { ascending: false })

  if (tipo) query = query.eq('tipo', tipo)
  if (estado) query = query.eq('estado', estado)

  const { data: remitos } = await query

  return (
    <RemitosClient
      initialRemitos={remitos ?? []}
      filtros={{ tipo: tipo ?? null, estado: estado ?? null }}
      permisos={permisos}
    />
  )
}
