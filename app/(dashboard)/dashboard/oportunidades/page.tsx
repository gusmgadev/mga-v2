import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getModulePermisos } from '@/lib/permisos'
import { supabaseAdmin } from '@/services/supabase-admin'
import { fetchAllClientes } from '@/lib/fetchAllClientes'
import OportunidadesClient from './OportunidadesClient'

export const metadata = { title: 'Oportunidades | MGA Dashboard' }

export default async function OportunidadesPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string; tipo?: string; contacto?: string; empresa?: string }>
}) {
  const session = await auth()
  if (!session) redirect('/auth/signin')

  const permisos = await getModulePermisos(session.user.role_id, session.user.role, 'oportunidades')
  if (!permisos.can_view) redirect('/dashboard')

  const { estado, tipo, contacto, empresa } = await searchParams

  let query = supabaseAdmin.from('oportunidades').select('*').order('created_at', { ascending: false })

  if (estado === '__activas__') {
    query = query.in('estado', ['NUEVA', 'PRIMER_CONTACTO_WS', 'EN_PROCESO', 'PRESUPUESTADA'])
  } else if (estado) {
    query = query.eq('estado', estado)
  }
  if (tipo) query = query.eq('tipo_op', tipo)
  if (contacto) query = query.or(`primer_nombre.ilike.%${contacto}%,apellido.ilike.%${contacto}%,cliente_nombre.ilike.%${contacto}%,email_contacto.ilike.%${contacto}%`)
  if (empresa) query = query.ilike('empresa', `%${empresa}%`)

  const [{ data: oportunidades }, clientes] = await Promise.all([
    query,
    fetchAllClientes(),
  ])

  return (
    <OportunidadesClient
      initialOportunidades={oportunidades ?? []}
      clientes={clientes}
      filtros={{ estado: estado ?? null, tipo: tipo ?? null, contacto: contacto ?? null, empresa: empresa ?? null }}
      permisos={permisos}
    />
  )
}
