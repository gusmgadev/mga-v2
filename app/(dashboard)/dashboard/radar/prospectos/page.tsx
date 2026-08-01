import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getModulePermisos } from '@/lib/permisos'
import { supabaseAdmin } from '@/services/supabase-admin'
import type { Prospect } from '@/types/radar'
import ProspectosClient from './ProspectosClient'

export const metadata = { title: 'Prospectos | Radar | MGA Dashboard' }

export default async function ProspectosPage() {
  const session = await auth()
  if (!session) redirect('/auth/signin')

  const permisos = await getModulePermisos(session.user.role_id, session.user.role, 'radar')
  if (!permisos.can_view) redirect('/dashboard')

  const { data: prospects } = await supabaseAdmin
    .from('prospects')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })
    .range(0, 49)

  const { count: total } = await supabaseAdmin
    .from('prospects')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', session.user.id)

  return (
    <ProspectosClient
      initialProspects={(prospects ?? []) as Prospect[]}
      total={total ?? 0}
      permisos={permisos}
    />
  )
}
