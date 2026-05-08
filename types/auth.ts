import type {} from 'next-auth/jwt'

export type UserRole = string

export type Role = {
  id: number
  name: string
  description: string | null
  is_default: boolean
}

export type UserProfile = {
  id: string
  email: string
  name: string | null
  role_id: number
  role_name: string
  created_at: string
}

export type RolePermission = {
  role_id: number
  module: string
  can_view: boolean
  can_create: boolean
  can_edit: boolean
  can_delete: boolean
}

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
      role_id: number
    }
  }

  interface User {
    id: string
    email: string
    name: string
    role: string
    role_id: number
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string
    role_id: number
  }
}
