import { z } from 'zod'

export const serviceCreateSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional().default(''),
  target_categories: z.array(z.string()).optional().default([]),
  target_keywords: z.array(z.string()).optional().default([]),
  problems_solved: z.array(z.string()).optional().default([]),
  is_active: z.boolean().optional().default(true),
})

export const serviceUpdateSchema = serviceCreateSchema.partial()

export const searchCreateSchema = z.object({
  province: z.string().optional(),
  city: z.string().optional(),
  category: z.string().min(1, 'El rubro es requerido'),
  keywords: z.array(z.string()).optional().default([]),
  radiusKm: z.coerce.number().int().min(0).optional(),
  maxResults: z.coerce.number().int().min(1).max(200).optional().default(50),
  serviceId: z.coerce.number().int().optional(),
  websiteFilter: z.enum(['all', 'with_website', 'without_website']).optional().default('all'),
  phoneRequired: z.coerce.boolean().optional().default(false),
  emailRequired: z.coerce.boolean().optional().default(false),
  minRating: z.coerce.number().min(0).max(5).optional(),
  minReviewCount: z.coerce.number().int().min(0).optional(),
  businessStatus: z.enum(['all', 'operational']).optional().default('all'),
})

export type ServiceCreateInput = z.infer<typeof serviceCreateSchema>
export type ServiceUpdateInput = z.infer<typeof serviceUpdateSchema>
export type SearchCreateInput = z.infer<typeof searchCreateSchema>

export const commercialStatusValues = [
  'new', 'reviewed', 'to_contact', 'contacted', 'interested',
  'meeting', 'proposal_sent', 'won', 'lost', 'discarded', 'do_not_contact',
  'existing_customer',
] as const

export const commercialStatusUpdateSchema = z.object({
  commercial_status: z.enum(commercialStatusValues),
  email: z.string().email().nullable().optional(),
  whatsapp: z.string().nullable().optional(),
})

export const convertToClientSchema = z.object({
  cliente_id: z.number().int().positive('Seleccioná un cliente'),
  notas: z.string().optional().default(''),
  servicio: z.object({
    titulo: z.string().min(2, 'Mínimo 2 caracteres'),
    descripcion: z.string().optional().default(''),
    valor: z.number().min(0).default(0),
    fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  }).nullable().optional(),
  presupuesto: z.object({
    titulo: z.string().min(2, 'Mínimo 2 caracteres'),
    descripcion: z.string().optional().default(''),
    fecha_vencimiento: z.string().nullable().optional(),
  }).nullable().optional(),
})

export const interactionCreateSchema = z.object({
  interaction_type: z.enum(['telefono', 'whatsapp', 'mail', 'presencial', 'otro']),
  channel: z.string().optional().default(''),
  notes: z.string().optional().default(''),
  interaction_date: z.string().min(1, 'La fecha es requerida'),
  next_follow_up_at: z.string().nullable().optional(),
})
