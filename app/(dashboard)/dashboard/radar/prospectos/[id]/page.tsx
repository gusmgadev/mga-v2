import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getModulePermisos } from '@/lib/permisos'
import { supabaseAdmin } from '@/services/supabase-admin'
import ProspectoDetalleClient from './ProspectoDetalleClient'

export const metadata = { title: 'Prospecto - Radar | MGA Dashboard' }

export default async function ProspectoDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) redirect('/auth/signin')

  const permisos = await getModulePermisos(session.user.role_id, session.user.role, 'radar')
  if (!permisos.can_view) redirect('/dashboard')

  const { id } = await params

  const { data: prospect } = await supabaseAdmin
    .from('prospects')
    .select('*')
    .eq('id', id)
    .eq('user_id', session.user.id)
    .single()

  if (!prospect) redirect('/dashboard/radar')

  const { data: analysis } = await supabaseAdmin
    .from('website_analyses')
    .select('*')
    .eq('prospect_id', id)
    .order('analyzed_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const { data: interactions } = await supabaseAdmin
    .from('prospect_interactions')
    .select('*')
    .eq('prospect_id', id)
    .order('interaction_date', { ascending: false })

  return (
    <ProspectoDetalleClient
      prospect={prospect}
      websiteAnalysis={analysis ?? null}
      interactions={interactions ?? []}
      permisos={permisos}
    />
  )
}
