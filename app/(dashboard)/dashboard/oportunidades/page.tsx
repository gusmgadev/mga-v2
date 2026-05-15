import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getModulePermisos } from '@/lib/permisos'
import { supabaseAdmin } from '@/services/supabase-admin'
import OportunidadesClient from './OportunidadesClient'

export const metadata = { title: 'Oportunidades | MGA Dashboard' }

export default async function OportunidadesPage() {
  const session = await auth()
  if (!session) redirect('/auth/signin')

  const permisos = await getModulePermisos(session.user.role_id, session.user.role, 'oportunidades')
  if (!permisos.can_view) redirect('/dashboard')

  const [{ data: oportunidades }, { data: clientes }] = await Promise.all([
    supabaseAdmin.from('oportunidades').select('*').order('created_at', { ascending: false }),
    supabaseAdmin.from('clientes').select('id, nombre').eq('activo', true).order('nombre'),
  ])

  return (
    <OportunidadesClient
      initialOportunidades={oportunidades ?? []}
      clientes={clientes ?? []}
      permisos={permisos}
    />
  )
}
