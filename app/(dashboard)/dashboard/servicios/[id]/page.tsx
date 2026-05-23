import { auth } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { supabaseAdmin } from '@/services/supabase-admin'
import { getModulePermisos } from '@/lib/permisos'
import { fetchAllClientes, fetchAllActivos } from '@/lib/fetchAllClientes'
import ServicioDetalleClient from './ServicioDetalleClient'

export default async function ServicioDetallePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session) redirect('/auth/signin')

  const permisos = await getModulePermisos(session.user.role_id, session.user.role, 'servicios')
  if (!permisos.can_view) redirect('/dashboard')

  const { id } = await params

  const { data: servicio, error } = await supabaseAdmin
    .from('servicios')
    .select('*, clientes(nombre), activos(nombre), servicio_tareas(*)')
    .eq('id', id)
    .single()

  if (error || !servicio) notFound()

  const [clientes, activos, { data: pagosServicio }, { data: pagosACuenta }] =
    await Promise.all([
      fetchAllClientes(),
      fetchAllActivos(),
      supabaseAdmin
        .from('cobranzas')
        .select('*')
        .eq('servicio_id', Number(id))
        .eq('tipo', 'PAGO')
        .order('fecha', { ascending: false }),
      supabaseAdmin
        .from('cobranzas')
        .select('*')
        .eq('cliente_id', servicio.cliente_id)
        .is('servicio_id', null)
        .eq('tipo', 'PAGO')
        .order('fecha', { ascending: false }),
    ])

  return (
    <ServicioDetalleClient
      initialServicio={servicio}
      initialPagos={pagosServicio ?? []}
      pagosACuenta={pagosACuenta ?? []}
      clientes={clientes}
      activos={activos}
      permisos={permisos}
    />
  )
}
