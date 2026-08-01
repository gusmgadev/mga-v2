import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getModulePermisos } from '@/lib/permisos'
import { supabaseAdmin } from '@/services/supabase-admin'
import NuevaBusquedaClient from './NuevaBusquedaClient'

export const metadata = { title: 'Nueva Búsqueda - Radar | MGA Dashboard' }

export default async function NuevaBusquedaPage() {
  const session = await auth()
  if (!session) redirect('/auth/signin')

  const permisos = await getModulePermisos(session.user.role_id, session.user.role, 'radar')
  if (!permisos.can_view || !permisos.can_create) redirect('/dashboard')

  const { data: servicios } = await supabaseAdmin
    .from('prospect_services')
    .select('id, name')
    .eq('user_id', session.user.id)
    .eq('is_active', true)
    .order('name')

  return <NuevaBusquedaClient servicios={servicios ?? []} />
}
