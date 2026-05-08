import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/services/supabase-admin'
import ClientesClient from './ClientesClient'

export default async function ClientesPage() {
  const session = await auth()
  if (!session) redirect('/auth/signin')

  const { data: clientes } = await supabaseAdmin
    .from('clientes')
    .select('*')
    .order('name')

  return <ClientesClient initialClientes={clientes ?? []} />
}
