import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getModulePermisos } from '@/lib/permisos'
import { supabaseAdmin } from '@/services/supabase-admin'
import ServiciosRadarClient from './ServiciosRadarClient'

export const metadata = { title: 'Servicios - Radar | MGA Dashboard' }

export default async function ServiciosRadarPage() {
  const session = await auth()
  if (!session) redirect('/auth/signin')

  const permisos = await getModulePermisos(session.user.role_id, session.user.role, 'radar')
  if (!permisos.can_view) redirect('/dashboard')

  const { data: servicios } = await supabaseAdmin
    .from('prospect_services')
    .select('*')
    .eq('user_id', session.user.id)
    .order('name')

  return <ServiciosRadarClient initialServicios={servicios ?? []} permisos={permisos} />
}
