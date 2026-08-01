import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getModulePermisos } from '@/lib/permisos'
import { supabaseAdmin } from '@/services/supabase-admin'
import RadarClient from './RadarClient'

export const metadata = { title: 'Radar de Oportunidades | MGA Dashboard' }

export default async function RadarPage() {
  const session = await auth()
  if (!session) redirect('/auth/signin')

  const permisos = await getModulePermisos(session.user.role_id, session.user.role, 'radar')
  if (!permisos.can_view) redirect('/dashboard')

  const [{ data: searches }, { count: totalProspects }, { count: highOpportunities }] = await Promise.all([
    supabaseAdmin
      .from('prospect_searches')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(10),
    supabaseAdmin
      .from('prospects')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', session.user.id),
    supabaseAdmin
      .from('prospects')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', session.user.id)
      .gte('opportunity_score', 65),
  ])

  return (
    <RadarClient
      initialSearches={searches ?? []}
      totalProspects={totalProspects ?? 0}
      highOpportunities={highOpportunities ?? 0}
      permisos={permisos}
    />
  )
}
