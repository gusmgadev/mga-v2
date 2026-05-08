import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/services/supabase-admin'
import { getModulePermisos } from '@/lib/permisos'
import ServiciosClient from './ServiciosClient'

export default async function ServiciosPage({
  searchParams,
}: {
  searchParams: Promise<{ cliente_id?: string; estado?: string; estado_pago?: string }>
}) {
  const session = await auth()
  if (!session) redirect('/auth/signin')

  const permisos = await getModulePermisos(session.user.role_id, session.user.role, 'servicios')
  if (!permisos.can_view) redirect('/dashboard')

  const { cliente_id, estado, estado_pago } = await searchParams

  const { data: clientes } = await supabaseAdmin
    .from('clientes')
    .select('id, name')
    .eq('active', true)
    .order('name')

  const { data: activos } = await supabaseAdmin
    .from('activos')
    .select('id, nombre, cliente_id')
    .eq('activo', true)
    .order('nombre')

  let query = supabaseAdmin
    .from('servicios')
    .select('*, clientes(name), activos(nombre)')
    .order('created_at', { ascending: false })

  if (cliente_id) query = query.eq('cliente_id', Number(cliente_id))
  if (estado) query = query.eq('estado', estado)
  if (estado_pago) query = query.eq('estado_pago', estado_pago)

  const { data: servicios } = await query

  return (
    <ServiciosClient
      initialServicios={servicios ?? []}
      clientes={clientes ?? []}
      activos={activos ?? []}
      filtros={{ cliente_id: cliente_id ? Number(cliente_id) : null, estado: estado ?? null, estado_pago: estado_pago ?? null }}
      permisos={permisos}
    />
  )
}
