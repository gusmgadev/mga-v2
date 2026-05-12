import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/services/supabase-admin'
import { getModulePermisos } from '@/lib/permisos'
import CobranzasClient from './CobranzasClient'

export default async function CobranzasPage({
  searchParams,
}: {
  searchParams: Promise<{ cliente_id?: string; tipo?: string }>
}) {
  const session = await auth()
  if (!session) redirect('/auth/signin')

  const permisos = await getModulePermisos(session.user.role_id, session.user.role, 'cobranzas')
  if (!permisos.can_view) redirect('/dashboard')

  const { cliente_id, tipo } = await searchParams

  const { data: clientes } = await supabaseAdmin
    .from('clientes')
    .select('id, name')
    .eq('active', true)
    .order('name')

  const { data: servicios } = await supabaseAdmin
    .from('servicios')
    .select('id, titulo, cliente_id')
    .order('created_at', { ascending: false })

  let query = supabaseAdmin
    .from('cobranzas')
    .select('*, clientes(name), servicios(titulo)')
    .order('fecha', { ascending: false })
    .order('created_at', { ascending: false })

  if (cliente_id) query = query.eq('cliente_id', Number(cliente_id))
  if (tipo) query = query.eq('tipo', tipo)

  const { data: cobranzas } = await query

  return (
    <CobranzasClient
      initialCobranzas={cobranzas ?? []}
      clientes={clientes ?? []}
      servicios={servicios ?? []}
      filtros={{ cliente_id: cliente_id ? Number(cliente_id) : null, tipo: tipo ?? null }}
      permisos={permisos}
    />
  )
}
