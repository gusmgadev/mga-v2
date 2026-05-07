# CONTEXT.md — [NOMBRE DEL PROYECTO]

> **Cómo usar este archivo:**
> 1. Copiarlo a la raíz de cada proyecto nuevo
> 2. Reemplazar todos los valores entre `[ ]` con los datos reales
> 3. Al iniciar cada chat con la IA, adjuntarlo junto con `lib/theme.ts`
> 4. Al terminar cada sesión, actualizar "Funcionalidades implementadas" y "Pendientes"
>
> **Regla fundamental:** Los valores de colores, tipografía, textos, logos,
> contacto y navegación NO se escriben aquí — todos viven en `lib/theme.ts`.
> Este archivo describe el proyecto. `theme.ts` describe el diseño y los datos.

---

## Descripción general

- **Proyecto:** [Nombre comercial del proyecto]
- **Cliente:** [Nombre del cliente o empresa]
- **Rubro:** [Ej: veterinaria, retail, servicios IT, clínica]
- **Objetivo:** [Qué problema resuelve esta app en una línea]
- **URL producción:** [https://dominio.com — o "sin deploy aún"]
- **Fecha inicio:** [DD/MM/AAAA]
- **Estado:** [Etapa 1 / Etapa 2 / En producción]

---

## Fuente de verdad del diseño y datos

**Todos los valores visuales y de contenido están en `lib/theme.ts`.**
Antes de crear o modificar cualquier componente, adjuntar ese archivo.

| Qué necesitás saber            | Dónde está en theme.ts              |
|-------------------------------|-------------------------------------|
| Colores de la marca            | `theme.colors.*`                    |
| Tipografía y tamaños           | `theme.fonts.*` / `theme.fontSizes.*` |
| Logo (claro y blanco)          | `theme.logo.*`                      |
| Datos de contacto              | `theme.contact.*`                   |
| Textos del Hero                | `theme.hero.*`                      |
| Navegación y CTA del navbar    | `theme.navbar.*`                    |
| Descripción, redes, mapa       | `theme.footer.*`                    |
| Espaciado, radios, sombras     | `theme.spacing.*` / `theme.radii.*` / `theme.shadows.*` |
| Transiciones                   | `theme.transitions.*`               |
| Rutas de auth y dashboard      | `theme.auth.*` / `theme.dashboard.*` |

**Nunca hardcodear colores, fuentes ni textos en los componentes.**
Siempre importar: `import { theme } from '@/lib/theme'`

---

## Stack tecnológico

- **Framework:** Next.js [versión] con App Router
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS [versión]
- **Base de datos:** [Supabase / PostgreSQL / otra]
- **Autenticación:** [NextAuth.js / Clerk / Supabase Auth]
- **Email:** [Resend / SendGrid / no implementado]
- **Animaciones:** [Framer Motion / ninguna]
- **Iconos:** [Lucide React / otra]
- **Formularios:** [React Hook Form + Zod / ninguno]
- **Deploy:** [Vercel / sin configurar]

---

## Estructura de carpetas

```
[nombre-proyecto]/
│
├── app/                          # RUTAS
│   ├── (public)/                 # Zona pública (sin login)
│   │   ├── page.tsx              # Landing
│   │   └── servicios/[slug]/
│   ├── (auth)/                   # Zona autenticación
│   │   └── auth/signin/
│   ├── (dashboard)/              # Zona privada (requiere sesión)
│   │   └── dashboard/
│   │       ├── clientes/
│   │       ├── servicios/
│   │       └── [otros módulos]
│   └── api/                      # BACKEND
│       ├── contact/
│       └── dashboard/
│
├── components/                   # COMPONENTES UI
│   ├── landing/                  # Solo landing
│   ├── dashboard/                # Solo app interna
│   └── shared/                   # Compartidos entre zonas
│
├── lib/                          # LÓGICA Y CONFIG
│   ├── theme.ts                  # ← FUENTE DE VERDAD — colores, textos, datos
│   ├── supabase.ts
│   ├── auth.ts
│   └── constants.ts
│
├── services/                     # APIs EXTERNAS
│   ├── resend.ts
│   └── supabase-admin.ts
│
├── hooks/                        # HOOKS CUSTOM
├── types/                        # TIPOS TYPESCRIPT
├── proxy.ts                      # PROTECCIÓN DE RUTAS
└── public/
    └── images/
        ├── logos/                # logo.png + logo-white.png
        ├── hero/                 # hero-1.jpg, hero-2.jpg, hero-3.jpg
        └── clientes/
```

### Las 4 reglas de esta arquitectura

1. **`lib/theme.ts` es la única fuente de verdad** — colores, textos, datos de contacto, rutas de logos, todo vive ahí
2. **Componentes separados por zona** — `landing/` nunca importa de `dashboard/` y viceversa. Compartido va a `shared/`
3. **Carpeta `services/`** — toda la lógica de APIs externas vive acá. Los endpoints solo llaman estas funciones
4. **Tipos centralizados** — todos los tipos TypeScript en `types/`. Nunca definir tipos inline en componentes

### Qué existe en este proyecto

- `app/(public)/`         → [✓ existe / pendiente]
- `app/(auth)/`           → [✓ existe / pendiente]
- `app/(dashboard)/`      → [✓ existe / pendiente]
- `components/landing/`   → [✓ existe / pendiente]
- `components/dashboard/` → [✓ existe / pendiente]
- `components/shared/`    → [✓ existe / pendiente]
- `lib/theme.ts`          → [✓ existe — es la fuente de verdad del proyecto]
- `services/`             → [✓ existe / pendiente — servicios: ...]
- `hooks/`                → [✓ existe / pendiente — hooks: ...]
- `types/`                → [✓ existe / pendiente — tipos: ...]
- `proxy.ts`              → [✓ existe / pendiente]

---

## Rutas y componentes existentes

### Rutas creadas

- `/` → landing principal
- [agregar las rutas que existen en el proyecto]

### Componentes landing (`components/landing/`)

- `navbar.tsx`       → [descripción breve]
- `hero.tsx`         → [descripción breve]
- `footer.tsx`       → [descripción breve]
- [agregar los componentes que existen]

### Componentes dashboard (`components/dashboard/`)

- [vacío — o listar los que existen]

---

## Funcionalidades implementadas

- [ ] Landing completa con todas las secciones
- [ ] Formulario de contacto con validación frontend
- [ ] Envío de emails
- [ ] Autenticación
- [ ] Protección de rutas privadas con proxy.ts
- [ ] Dashboard funcional
- [ ] SEO base (metadata, sitemap, robots)
- [ ] Deploy
- [marcar con `x` lo que está hecho y agregar las funcionalidades del proyecto]

---

## Pendientes y próximos pasos

### Crítico (antes de salir a producción)

1. [tarea más urgente]
2. [siguiente tarea crítica]

### Próxima sesión

- [en qué se va a trabajar]

### Backlog

- [features planificadas pero no urgentes]

---

## Convenciones del proyecto

- **Idioma del código:** [inglés / español]
- **Idioma de la UI:** español
- **Mensajes de error:** siempre en español
- **Nombres de archivos:** kebab-case (ej: `contact-form.tsx`)
- **Componentes:** PascalCase (ej: `ContactForm`)
- **Variables:** camelCase (ej: `isLoading`)
- **Estilos:** solo Tailwind, sin valores hardcodeados — usar `theme.*`
- **Imports:** absolutos desde raíz con `@/` (ej: `@/lib/theme`)
- **Comentarios:** [en español / en inglés]

---

## Notas especiales del proyecto

- [decisiones de arquitectura tomadas y por qué]
- [librerías o patrones que NO se deben usar]
- [integraciones especiales o particularidades del cliente]
- [problemas conocidos o workarounds activos]

---

**Última actualización:** [DD/MM/AAAA]
**Actualizado por:** [nombre]
