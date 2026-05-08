import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/services/supabase-admin'
import '@/types/auth'

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
      },
      authorize: async (credentials) => {
        const parsed = credentialsSchema.safeParse(credentials)
        if (!parsed.success) return null

        const { email, password } = parsed.data

        const { data: authData, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error || !authData.user) return null

        const { data: profile } = await supabaseAdmin
          .from('users')
          .select('id, email, name, role_id, roles(name)')
          .eq('id', authData.user.id)
          .single()

        if (!profile) return null

        const roleName = (profile.roles as { name: string } | null)?.name ?? 'Usuario'

        return {
          id: profile.id as string,
          email: profile.email as string,
          name: (profile.name as string | null) ?? '',
          role: roleName,
          role_id: profile.role_id as number,
        }
      },
    }),
  ],

  session: { strategy: 'jwt' },
  pages: { signIn: '/auth/signin' },

  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.role_id = user.role_id
      }
      return token
    },
    session({ session, token }) {
      session.user.role = token.role as string
      session.user.role_id = token.role_id as number
      return session
    },
  },
})

export const { GET, POST } = handlers
