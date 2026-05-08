import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { theme } from '@/lib/theme'

export default async function DashboardPage() {
  const session = await auth()
  if (!session) redirect('/auth/signin')

  return (
    <div>
      <h1
        style={{
          fontSize: theme.fontSizes.xl,
          fontWeight: theme.fontWeights.bold,
          color: theme.colors.text,
          marginBottom: theme.spacing.sm,
        }}
      >
        Dashboard
      </h1>
      <p style={{ fontSize: theme.fontSizes.base, color: theme.colors.textMuted }}>
        Bienvenido, <strong>{session.user.name}</strong>
      </p>
      <p style={{ fontSize: theme.fontSizes.sm, color: theme.colors.textMuted, marginTop: theme.spacing.xs }}>
        Rol: {session.user.role}
      </p>
    </div>
  )
}
