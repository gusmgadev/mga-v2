import { auth } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { supabaseAdmin } from '@/services/supabase-admin'
import { getModulePermisos } from '@/lib/permisos'
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
    .select('*, clientes(nombre), activos(nombre), servicio_tareas(*), servicio_pagos(*)')
    .eq('id', id)
    .single()

  if (error || !servicio) notFound()

  const { data: clientes } = await supabaseAdmin
    .from('clientes')
    .select('id, nombre')
    .eq('activo', true)
    .order('nombre')

  const { data: activos } = await supabaseAdmin
    .from('activos')
    .select('id, nombre, cliente_id')
    .eq('activo', true)
    .order('nombre')

  return (
    <ServicioDetalleClient
      initialServicio={servicio}
      clientes={clientes ?? []}
      activos={activos ?? []}
      permisos={permisos}
    />
  )
}
