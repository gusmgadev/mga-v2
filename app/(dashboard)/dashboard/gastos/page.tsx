import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/services/supabase-admin'
import { getModulePermisos } from '@/lib/permisos'
import GastosClient from './GastosClient'

export default async function GastosPage() {
  const session = await auth()
  if (!session) redirect('/auth/signin')

  const permisos = await getModulePermisos(session.user.role_id, session.user.role, 'gastos')
  if (!permisos.can_view) redirect('/dashboard')

  const now = new Date()
  const mes = now.getMonth() + 1
  const anio = now.getFullYear()

  const [{ data: gastos }, { data: plantillas }, { data: tarjetas }] = await Promise.all([
    supabaseAdmin
      .from('gastos')
      .select('*, tarjetas(id, nombre, tipo, banco)')
      .eq('mes', mes)
      .eq('anio', anio)
      .order('categoria')
      .order('created_at'),
    supabaseAdmin
      .from('gastos_plantilla')
      .select('*')
      .order('orden')
      .order('created_at'),
    supabaseAdmin
      .from('tarjetas')
      .select('*')
      .order('nombre'),
  ])

  return (
    <GastosClient
      initialGastos={gastos ?? []}
      initialPlantillas={plantillas ?? []}
      initialTarjetas={tarjetas ?? []}
      initialMes={mes}
      initialAnio={anio}
      permisos={permisos}
    />
  )
}
