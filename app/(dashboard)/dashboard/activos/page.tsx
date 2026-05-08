import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/services/supabase-admin'
import { getModulePermisos } from '@/lib/permisos'
import ActivosClient from './ActivosClient'

export default async function ActivosPage({
  searchParams,
}: {
  searchParams: Promise<{ cliente_id?: string }>
}) {
  const session = await auth()
  if (!session) redirect('/auth/signin')

  const permisos = await getModulePermisos(session.user.role_id, session.user.role, 'activos')
  if (!permisos.can_view) redirect('/dashboard')

  const { cliente_id } = await searchParams

  const { data: clientes } = await supabaseAdmin
    .from('clientes')
    .select('id, name')
    .eq('active', true)
    .order('name')

  let query = supabaseAdmin.from('activos').select('*').order('nombre')
  if (cliente_id) query = query.eq('cliente_id', Number(cliente_id))
  const { data: activos } = await query

  return (
    <ActivosClient
      initialActivos={activos ?? []}
      clientes={clientes ?? []}
      clienteIdFilter={cliente_id ? Number(cliente_id) : null}
      permisos={permisos}
    />
  )
}
