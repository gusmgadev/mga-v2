import { auth } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { supabaseAdmin } from '@/services/supabase-admin'
import { getModulePermisos } from '@/lib/permisos'
import PresupuestoDetalleClient from './PresupuestoDetalleClient'

export default async function PresupuestoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session) redirect('/auth/signin')

  const permisos = await getModulePermisos(session.user.role_id, session.user.role, 'presupuestos')
  if (!permisos.can_view) redirect('/dashboard')

  const serviciosPermisos = await getModulePermisos(session.user.role_id, session.user.role, 'servicios')

  const { id } = await params

  const { data: presupuesto, error } = await supabaseAdmin
    .from('presupuestos')
    .select('*, clientes(nombre), activos(nombre), presupuesto_items(*)')
    .eq('id', id)
    .single()

  if (error || !presupuesto) notFound()

  const { data: activos } = await supabaseAdmin
    .from('activos')
    .select('id, nombre, cliente_id')
    .eq('activo', true)
    .order('nombre')

  const { data: servicioAsociado } = await supabaseAdmin
    .from('servicios')
    .select('id, titulo')
    .eq('presupuesto_id', parseInt(id))
    .maybeSingle()

  return (
    <PresupuestoDetalleClient
      initialPresupuesto={presupuesto}
      activos={activos ?? []}
      permisos={permisos}
      serviciosPermisos={serviciosPermisos}
      servicioAsociado={servicioAsociado ?? null}
    />
  )
}
