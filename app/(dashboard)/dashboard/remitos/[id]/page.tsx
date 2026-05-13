import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/services/supabase-admin'
import { getModulePermisos } from '@/lib/permisos'
import RemitoDetalleClient from './RemitoDetalleClient'

export default async function RemitoDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) redirect('/auth/signin')

  const permisos = await getModulePermisos(session.user.role_id, session.user.role, 'remitos')
  if (!permisos.can_view) redirect('/dashboard')

  const { id } = await params

  const [{ data: remito }, { data: origenes }, { data: productos }] = await Promise.all([
    supabaseAdmin
      .from('remitos')
      .select('*, origenes_destinos(*), remito_items(*, productos(*))')
      .eq('id', id)
      .single(),
    supabaseAdmin
      .from('origenes_destinos')
      .select('*')
      .eq('activo', true)
      .order('nombre'),
    supabaseAdmin
      .from('productos')
      .select('*')
      .eq('activo', true)
      .order('nombre'),
  ])

  if (!remito) redirect('/dashboard/remitos')

  return (
    <RemitoDetalleClient
      remito={remito}
      origenes={origenes ?? []}
      productos={productos ?? []}
      permisos={permisos}
    />
  )
}
