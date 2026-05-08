import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/services/supabase-admin'

const schema = z.object({
  name: z.string().min(3, 'Nombre mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Contraseña mínima 8 caracteres'),
})

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Solicitud inválida' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? 'Datos inválidos'
    return NextResponse.json({ error: message }, { status: 400 })
  }

  const { name, email, password } = parsed.data

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authError || !authData.user) {
    const msg = authError?.message ?? ''
    if (
      msg.toLowerCase().includes('already') ||
      msg.toLowerCase().includes('exists') ||
      authError?.status === 422
    ) {
      return NextResponse.json(
        { error: 'Este email ya está registrado' },
        { status: 409 }
      )
    }
    return NextResponse.json({ error: 'Error al crear el usuario' }, { status: 500 })
  }

  const userId = authData.user.id

  const { data: defaultRole } = await supabaseAdmin
    .from('roles')
    .select('id')
    .eq('is_default', true)
    .single()

  if (!defaultRole) {
    await supabaseAdmin.auth.admin.deleteUser(userId)
    return NextResponse.json(
      { error: 'Error en configuración del sistema' },
      { status: 500 }
    )
  }

  const { error: profileError } = await supabaseAdmin.from('users').insert({
    id: userId,
    email,
    name,
    role_id: (defaultRole as { id: number }).id,
  })

  if (profileError) {
    await supabaseAdmin.auth.admin.deleteUser(userId)
    return NextResponse.json({ error: 'Error al crear el perfil' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
