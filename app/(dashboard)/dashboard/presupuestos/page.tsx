import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/services/supabase-admin'
import { getModulePermisos } from '@/lib/permisos'
import { fetchAllClientes, fetchAllActivos } from '@/lib/fetchAllClientes'
import PresupuestosClient from './PresupuestosClient'

export default async function PresupuestosPage({
  searchParams,
}: {
  searchParams: Promise<{ cliente_id?: string; estado?: string }>
}) {
  const session = await auth()
  if (!session) redirect('/auth/signin')

  const permisos = await getModulePermisos(session.user.role_id, session.user.role, 'presupuestos')
  if (!permisos.can_view) redirect('/dashboard')

  const sp = await searchParams
  const clienteId = sp.cliente_id ? Number(sp.cliente_id) : null
  const estado = sp.estado ?? null

  let query = supabaseAdmin
    .from('presupuestos')
    .select('*, clientes(nombre), activos(nombre), presupuesto_items(id, cantidad, precio_unitario)')
    .order('created_at', { ascending: false })

  if (clienteId) query = query.eq('cliente_id', clienteId)
  if (estado) query = query.eq('estado', estado)

  const [{ data: presupuestos }, clientes, activos] = await Promise.all([
    query,
    fetchAllClientes(),
    fetchAllActivos(),
  ])

  return (
    <PresupuestosClient
      initialPresupuestos={presupuestos ?? []}
      clientes={clientes}
      activos={activos}
      filtros={{ cliente_id: clienteId, estado }}
      permisos={permisos}
    />
  )
}
