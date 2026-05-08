'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import { theme } from '@/lib/theme'

const schema = z
  .object({
    nombre: z.string().min(3, 'Mínimo 3 caracteres'),
    email: z.string().email('Email inválido'),
    password: z
      .string()
      .min(8, 'Mínimo 8 caracteres')
      .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
      .regex(/[0-9]/, 'Debe contener al menos un número'),
    confirmar: z.string(),
  })
  .refine((data) => data.password === data.confirmar, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmar'],
  })

type FormData = z.infer<typeof schema>

function getPasswordStrength(password: string): { level: number; label: string; color: string } {
  if (!password) return { level: 0, label: '', color: theme.colors.border }
  const hasUpper = /[A-Z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const isLong = password.length >= 8
  if (isLong && hasUpper && hasNumber) return { level: 3, label: 'Fuerte', color: theme.colors.success }
  if ((hasUpper || hasNumber) && password.length >= 6) return { level: 2, label: 'Media', color: theme.colors.warning }
  return { level: 1, label: 'Débil', color: theme.colors.error }
}

export default function RegistroPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmar, setShowConfirmar] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const passwordValue = watch('password') ?? ''
  const strength = getPasswordStrength(passwordValue)

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    setError(null)

    const res = await fetch('/api/auth/registro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: data.nombre, email: data.email, password: data.password }),
    })

    const json = await res.json()
    setIsSubmitting(false)

    if (!res.ok) {
      setError(json.error ?? 'Error al crear la cuenta')
      return
    }

    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div style={{ textAlign: 'center', padding: `${theme.spacing.lg} 0` }}>
        <CheckCircle
          size={56}
          style={{ color: theme.colors.success, margin: '0 auto', display: 'block', marginBottom: theme.spacing.md }}
        />
        <h2 style={{ fontSize: theme.fontSizes.xl, fontWeight: theme.fontWeights.bold, color: theme.colors.text, marginBottom: theme.spacing.sm }}>
          ¡Cuenta creada!
        </h2>
        <p style={{ fontSize: theme.fontSizes.base, color: theme.colors.textMuted, marginBottom: theme.spacing.xl }}>
          Tu cuenta fue creada exitosamente. Ya podés iniciar sesión.
        </p>
        <Link
          href="/auth/signin"
          style={{
            display: 'inline-block',
            padding: '12px 32px',
            backgroundColor: theme.colors.primary,
            color: '#ffffff',
            borderRadius: theme.radii.sm,
            textDecoration: 'none',
            fontWeight: theme.fontWeights.medium,
            fontSize: theme.fontSizes.base,
          }}
        >
          Ir al login
        </Link>
      </div>
    )
  }

  return (
    <div>
      <h1
        style={{
          fontSize: theme.fontSizes.xl,
          fontWeight: theme.fontWeights.bold,
          color: theme.colors.text,
          marginBottom: theme.spacing.xs,
        }}
      >
        Crear cuenta
      </h1>
      <p style={{ fontSize: theme.fontSizes.sm, color: theme.colors.textMuted, marginBottom: theme.spacing.xl }}>
        Completá tus datos para registrarte
      </p>

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
        <div>
          <label htmlFor="nombre" style={{ display: 'block', fontSize: theme.fontSizes.sm, fontWeight: theme.fontWeights.medium, color: theme.colors.text, marginBottom: theme.spacing.xs }}>
            Nombre completo
          </label>
          <input
            id="nombre"
            type="text"
            placeholder="Juan García"
            autoComplete="name"
            {...register('nombre')}
            style={{
              width: '100%',
              padding: '10px 14px',
              fontSize: theme.fontSizes.base,
              border: `1px solid ${errors.nombre ? theme.colors.error : theme.colors.border}`,
              borderRadius: theme.radii.sm,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          {errors.nombre && (
            <p style={{ marginTop: theme.spacing.xs, fontSize: theme.fontSizes.sm, color: theme.colors.error }}>{errors.nombre.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" style={{ display: 'block', fontSize: theme.fontSizes.sm, fontWeight: theme.fontWeights.medium, color: theme.colors.text, marginBottom: theme.spacing.xs }}>
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="tu@email.com"
            autoComplete="email"
            {...register('email')}
            style={{
              width: '100%',
              padding: '10px 14px',
              fontSize: theme.fontSizes.base,
              border: `1px solid ${errors.email ? theme.colors.error : theme.colors.border}`,
              borderRadius: theme.radii.sm,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          {errors.email && (
            <p style={{ marginTop: theme.spacing.xs, fontSize: theme.fontSizes.sm, color: theme.colors.error }}>{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" style={{ display: 'block', fontSize: theme.fontSizes.sm, fontWeight: theme.fontWeights.medium, color: theme.colors.text, marginBottom: theme.spacing.xs }}>
            Contraseña
          </label>
          <div style={{ position: 'relative' }}>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              {...register('password')}
              style={{
                width: '100%',
                padding: '10px 44px 10px 14px',
                fontSize: theme.fontSizes.base,
                border: `1px solid ${errors.password ? theme.colors.error : theme.colors.border}`,
                borderRadius: theme.radii.sm,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: theme.colors.textMuted, padding: 0, display: 'flex', alignItems: 'center' }}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {passwordValue && (
            <div style={{ marginTop: theme.spacing.sm }}>
              <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: '4px',
                      borderRadius: '2px',
                      backgroundColor: i <= strength.level ? strength.color : theme.colors.border,
                      transition: theme.transitions.fast,
                    }}
                  />
                ))}
              </div>
              <p style={{ fontSize: theme.fontSizes.xs, color: strength.color }}>{strength.label}</p>
            </div>
          )}
          {errors.password && (
            <p style={{ marginTop: theme.spacing.xs, fontSize: theme.fontSizes.sm, color: theme.colors.error }}>{errors.password.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="confirmar" style={{ display: 'block', fontSize: theme.fontSizes.sm, fontWeight: theme.fontWeights.medium, color: theme.colors.text, marginBottom: theme.spacing.xs }}>
            Confirmar contraseña
          </label>
          <div style={{ position: 'relative' }}>
            <input
              id="confirmar"
              type={showConfirmar ? 'text' : 'password'}
              autoComplete="new-password"
              {...register('confirmar')}
              style={{
                width: '100%',
                padding: '10px 44px 10px 14px',
                fontSize: theme.fontSizes.base,
                border: `1px solid ${errors.confirmar ? theme.colors.error : theme.colors.border}`,
                borderRadius: theme.radii.sm,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <button
              type="button"
              onClick={() => setShowConfirmar((v) => !v)}
              style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: theme.colors.textMuted, padding: 0, display: 'flex', alignItems: 'center' }}
              aria-label={showConfirmar ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showConfirmar ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.confirmar && (
            <p style={{ marginTop: theme.spacing.xs, fontSize: theme.fontSizes.sm, color: theme.colors.error }}>{errors.confirmar.message}</p>
          )}
        </div>

        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: theme.spacing.sm,
              padding: '12px 14px',
              backgroundColor: `${theme.colors.error}14`,
              border: `1px solid ${theme.colors.error}`,
              borderRadius: theme.radii.sm,
              color: theme.colors.error,
              fontSize: theme.fontSizes.sm,
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: isSubmitting ? `${theme.colors.primary}99` : theme.colors.primary,
            color: '#ffffff',
            fontSize: theme.fontSizes.base,
            fontWeight: theme.fontWeights.medium,
            border: 'none',
            borderRadius: theme.radii.sm,
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: theme.spacing.sm,
            transition: theme.transitions.fast,
            marginTop: theme.spacing.sm,
          }}
        >
          {isSubmitting && <Loader2 size={16} className="animate-spin" />}
          {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>

        <p style={{ textAlign: 'center', fontSize: theme.fontSizes.sm, color: theme.colors.textMuted }}>
          ¿Ya tenés cuenta?{' '}
          <Link href="/auth/signin" style={{ color: theme.colors.primary, fontWeight: theme.fontWeights.medium, textDecoration: 'none' }}>
            Ingresá
          </Link>
        </p>
      </form>
    </div>
  )
}
