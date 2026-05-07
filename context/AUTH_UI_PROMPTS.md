# AUTH_UI_PROMPTS.md — Interfaces de Auth y Dashboard (MGA SaaS)

Usá este archivo junto a AUTH_CONTEXT.md y lib/theme.ts.
Adjuntalos los tres al inicio de cada chat de UI.
Todos los valores visuales se importan desde lib/theme.ts.

---

## Cómo usar estos prompts

1. Abrís un **chat nuevo** por cada sección
2. Adjuntás `AUTH_CONTEXT.md` + `lib/theme.ts` + el archivo indicado en `[Adjuntar: X]`
3. Copiás el prompt completo y lo pegás en Cursor
4. Revisás el código antes de aplicarlo
5. Hacés commit antes de pasar al siguiente

---

## SECCIÓN 1 — Páginas de Autenticación

---

### 1.1 — Layout base de auth

Primero se crea el layout compartido que usan todas las páginas de auth.
Así el fondo, el logo y la card son consistentes en login, registro y reseteo.

```
[Adjuntar: AUTH_CONTEXT.md + lib/theme.ts + app/auth/layout.tsx]

Creá el layout base para todas las páginas de auth en app/auth/layout.tsx.

ESPECIFICACIONES:
- Fondo: blanco (#FFFFFF), height 100vh
- Contenido centrado vertical y horizontal
- Logo: Next/Image path=theme.logo.path (versión oscura, sobre fondo blanco)
  width=theme.auth.logo.width height=theme.auth.logo.height
  centrado arriba de la card
- Card blanca:
  bg=#FFFFFF
  width 50vw, min-width 380px, max-width 700px
  border-radius=theme.radii.md
  box-shadow: 0 4px 24px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)
  border: 1px solid #E8E8E8
  padding 48px
- Debajo de la card: link de volver al inicio → href='/'
  color=theme.colors.textMuted, font-size=theme.fontSizes.sm
- Mobile (<640px): card sin border-radius, width 100%, sin sombra
  border solo arriba y abajo

Este layout lo heredan automáticamente todas las páginas
en app/auth/**/page.tsx
```

---

### 1.2 — Página de Login

```
[Adjuntar: AUTH_CONTEXT.md + lib/theme.ts + app/auth/signin/page.tsx + app/auth/layout.tsx]

Creá la página de login en app/auth/signin/page.tsx.

NOTA: el fondo y la card los maneja el layout base (app/auth/layout.tsx).
Esta página solo define el contenido interno de la card.

CONTENIDO DE LA CARD:
- Título: 'Iniciar sesión', font-weight bold, color=theme.colors.text
- Subtítulo: 'Ingresá con tu cuenta', color=theme.colors.textMuted
  font-size=theme.fontSizes.sm

CAMPOS:
- Email: label 'Email', type email, placeholder 'tu@email.com'
- Password: label 'Contraseña', type password
  Toggle ojo para mostrar/ocultar con ícono Lucide Eye/EyeOff

VALIDACIÓN React Hook Form + Zod:
- email: requerido, formato válido
- password: requerido, mínimo 6 caracteres
- Mensajes de error debajo de cada campo, color=theme.colors.error
  font-size=theme.fontSizes.sm

BOTÓN PRINCIPAL:
- Texto 'Entrar', width 100%
- bg=theme.colors.primary, color blanco
- border-radius=theme.radii.sm
- hover: bg levemente más oscuro
- transition=theme.transitions.fast
- Spinner Lucide Loader2 mientras procesa, botón disabled

ERROR GENERAL:
- Si falla el login → alerta roja debajo del botón
  bg rgba(error,0.08), border 1px solid error
  ícono Lucide AlertCircle + mensaje en español

LINKS DEBAJO DEL BOTÓN:
- '¿Olvidaste tu contraseña?' → /auth/reset
  color=theme.colors.primary, font-size=theme.fontSizes.sm
- '¿No tenés cuenta? Registrate' → /auth/registro
  color=theme.colors.textMuted, highlight en primary

LÓGICA:
- signIn('credentials', { email, password, redirect: false })
- Si ok → router.push(theme.auth.redirectAfterLogin)
- Usar use client + React Hook Form + Zod + NextAuth signIn
```

---

### 1.3 — Página de Registro

```
[Adjuntar: AUTH_CONTEXT.md + lib/theme.ts + app/auth/registro/page.tsx]

Creá la página de registro en app/auth/registro/page.tsx.

CONTENIDO DE LA CARD:
- Título: 'Crear cuenta'
- Subtítulo: 'Completá tus datos para registrarte'

CAMPOS:
- Nombre completo: label 'Nombre completo', placeholder 'Juan García'
- Email: label 'Email', type email
- Contraseña: label 'Contraseña', type password + toggle ojo
- Confirmar contraseña: label 'Confirmar contraseña', type password + toggle ojo

VALIDACIÓN Zod:
- nombre: requerido, mínimo 3 chars
- email: formato válido
- password: mínimo 8 chars, debe tener al menos una mayúscula y un número
- confirmar: debe coincidir con password exactamente
- Mensajes de error debajo de cada campo en español

INDICADOR DE FORTALEZA DE CONTRASEÑA:
- Barra debajo del campo password
- 3 niveles: Débil (rojo) / Media (naranja) / Fuerte (verde)
- Se actualiza en tiempo real mientras escribe

BOTÓN PRINCIPAL:
- Texto 'Crear cuenta', mismo estilo que login

MENSAJE DE ÉXITO:
- Si el registro ok → mostrar card de éxito en lugar del form
  ícono Lucide CheckCircle en verde
  Título: '¡Cuenta creada!'
  Texto: 'Revisá tu email para verificar tu cuenta.'
  Botón: 'Ir al login' → /auth/signin

ERROR GENERAL:
- Si email duplicado → 'Este email ya está registrado'
- Mismo estilo de alerta que el login

LINK:
- '¿Ya tenés cuenta? Ingresá' → /auth/signin

LÓGICA:
- POST a /api/auth/registro
- Usar use client + React Hook Form + Zod
```

---

### 1.4 — Página de Reseteo de Clave (olvidé mi contraseña)

```
[Adjuntar: AUTH_CONTEXT.md + lib/theme.ts + app/auth/reset/page.tsx]

Creá la página de reseteo de clave en app/auth/reset/page.tsx.

CONTENIDO DE LA CARD:
- Título: 'Recuperar contraseña'
- Subtítulo: 'Ingresá tu email y te enviamos un link para restablecer tu clave'

CAMPO:
- Email: label 'Email', type email, placeholder 'tu@email.com'

VALIDACIÓN Zod:
- email: requerido, formato válido

BOTÓN PRINCIPAL:
- Texto 'Enviar link de recuperación', width 100%
- Spinner mientras procesa

ESTADO ENVIADO (reemplaza el form):
- ícono Lucide Mail en primary
- Título: '¡Email enviado!'
- Texto: 'Si el email existe en el sistema, vas a recibir un link en los próximos minutos.'
- Nota: 'Revisá también tu carpeta de spam.'
- Link: 'Volver al login' → /auth/signin

NOTA DE SEGURIDAD:
- Siempre mostrar el estado de éxito aunque el email no exista
  (no revelar si un email está registrado o no)

LÓGICA:
- supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + '/auth/nueva-clave'
  })
- Usar use client + React Hook Form + Zod + supabase client
```

---

### 1.5 — Página de Nueva Clave (link del email)

```
[Adjuntar: AUTH_CONTEXT.md + lib/theme.ts + app/auth/nueva-clave/page.tsx]

Creá la página de nueva clave en app/auth/nueva-clave/page.tsx.
Esta página se abre desde el link que llega por email.

CONTENIDO DE LA CARD:
- Título: 'Nueva contraseña'
- Subtítulo: 'Ingresá tu nueva contraseña'

CAMPOS:
- Nueva contraseña: label 'Nueva contraseña', type password + toggle ojo
- Confirmar: label 'Confirmar contraseña', type password + toggle ojo

VALIDACIÓN Zod:
- password: mínimo 8 chars, al menos una mayúscula y un número
- confirmar: debe coincidir

INDICADOR DE FORTALEZA: igual que en registro

ESTADO ÉXITO (reemplaza el form):
- ícono Lucide CheckCircle verde
- Título: '¡Contraseña actualizada!'
- Botón: 'Ir al login' → /auth/signin

ESTADO ERROR (link expirado o inválido):
- ícono Lucide XCircle rojo
- Título: 'Link inválido o expirado'
- Texto: 'Pedí un nuevo link de recuperación.'
- Botón: 'Volver a recuperar contraseña' → /auth/reset

LÓGICA:
- Al cargar: supabase.auth.getSession() para verificar que el token del link es válido
- Si no hay sesión válida → mostrar estado de error directamente
- Al enviar: supabase.auth.updateUser({ password: nuevaClave })
- Si ok → mostrar estado de éxito + signOut para limpiar la sesión temporal
- Usar use client + useEffect + React Hook Form + Zod + supabase client
```

---

### 1.6 — Página de Verificación de Email

```
[Adjuntar: AUTH_CONTEXT.md + lib/theme.ts + app/auth/verificar/page.tsx]

Creá la página de verificación de email en app/auth/verificar/page.tsx.
Se muestra cuando el usuario hace click en el link de verificación del email.

ESTADOS POSIBLES:

CARGANDO:
- Spinner centrado
- Texto: 'Verificando tu email...'

ÉXITO:
- ícono Lucide CheckCircle en theme.colors.accent
- Título: '¡Email verificado!'
- Texto: 'Tu cuenta está activa. Ya podés iniciar sesión.'
- Botón: 'Ir al login' → /auth/signin
- Auto-redirect a /auth/signin después de 3 segundos con countdown visible

ERROR:
- ícono Lucide XCircle en theme.colors.error
- Título: 'No se pudo verificar el email'
- Texto: 'El link puede haber expirado o ya fue usado.'
- Botón: 'Volver al inicio' → /

LÓGICA:
- useEffect al montar: supabase.auth.getSession()
- Si hay sesión con email_confirmed_at → estado éxito
- Si no → estado error
- Usar use client + useEffect + supabase client
```

---

## SECCIÓN 2 — Componentes del Dashboard

---

### 2.1 — Layout del Dashboard

```
[Adjuntar: AUTH_CONTEXT.md + lib/theme.ts + app/(dashboard)/layout.tsx]

Creá el layout del dashboard en app/(dashboard)/dashboard/layout.tsx.

ESTRUCTURA:
- Sidebar fijo a la izquierda: width=theme.dashboard.sidebarWidth
- Área de contenido: ocupa el resto del ancho
- Header fijo arriba del contenido: height=theme.dashboard.headerHeight

SIDEBAR:
- bg=theme.colors.dark
- Logo arriba: Next/Image path=theme.logo.pathWhite
  padding 20px, centrado
- Separador sutil rgba(255,255,255,0.08)
- Navegación: ver prompt 2.2
- En el fondo del sidebar: nombre + email del usuario + botón logout

HEADER:
- bg=theme.colors.background
  border-bottom 1px solid theme.colors.border
- Izquierda: breadcrumb de la sección actual
- Derecha: nombre del usuario + avatar con inicial

CONTENIDO:
- padding 32px
- bg #F5F7FA (fondo levemente gris)
- overflow-y auto

MOBILE (<768px):
- Sidebar se oculta por defecto
- Botón hamburguesa en el header para abrir sidebar como drawer
- Drawer con overlay oscuro, cierra al hacer click fuera

Usar useSession de NextAuth para datos del usuario.
Usar use client + useState para el drawer mobile.
```

---

### 2.2 — Sidebar con menú condicionado por rol

```
[Adjuntar: AUTH_CONTEXT.md + lib/theme.ts + components/dashboard/sidebar.tsx + hooks/usePermissions.ts]

Creá el componente Sidebar del dashboard.

ITEMS DEL MENÚ:
Definir como array con: { label, href, icon (Lucide), module }

Items base (todos los usuarios):
- Dashboard    → /dashboard           ícono LayoutDashboard
- Clientes     → /dashboard/clientes  ícono Users
- Servicios    → /dashboard/servicios ícono Briefcase
- Cobranzas    → /dashboard/cobranzas ícono DollarSign
- Mi perfil    → /dashboard/perfil    ícono UserCircle

Items solo Administrador (session.user.role === 'Administrador'):
- Separador con label 'ADMINISTRACIÓN'
- Usuarios     → /dashboard/admin/usuarios  ícono UserCog
- Roles        → /dashboard/admin/roles     ícono Shield
- Permisos     → /dashboard/admin/permisos  ícono Lock

ESTILO DE CADA ITEM:
- Inactivo: color rgba(255,255,255,0.55), ícono rgba(255,255,255,0.40)
- Hover: bg rgba(255,255,255,0.06), color blanco
- Activo: bg=theme.colors.primary, color blanco, ícono blanco
  border-radius=theme.radii.sm
- Detectar activo con usePathname()
- transition=theme.transitions.fast

CONDICIONAR POR PERMISOS:
- Usar usePermissions(module) para cada item
- Si canView es false → no renderizar el item
- Mostrar loading skeleton mientras cargan los permisos

PERFIL EN EL FONDO:
- Avatar circular con inicial del nombre, bg=theme.colors.primary
- Nombre del usuario: color blanco
- Email: color rgba(255,255,255,0.45), font-size=theme.fontSizes.xs
- Botón logout: ícono Lucide LogOut, tooltip 'Cerrar sesión'
  Confirmar con AlertDialog antes de ejecutar

Usar useSession + usePathname + usePermissions.
```

---

### 2.3 — Header del Dashboard

```
[Adjuntar: AUTH_CONTEXT.md + lib/theme.ts + components/dashboard/header.tsx]

Creá el componente Header del dashboard.

LADO IZQUIERDO:
- Botón hamburguesa (solo mobile): ícono Lucide Menu
  onClick → abre el drawer del sidebar
- Breadcrumb: sección actual basada en usePathname()
  Formato: Dashboard / Clientes / Nuevo cliente
  color=theme.colors.textMuted, separador '/'
  Último item en bold, color=theme.colors.text

LADO DERECHO:
- Avatar circular con inicial del nombre
  bg=theme.colors.primary, color blanco
  font-weight bold
- Al hacer click → dropdown con opciones:
  'Mi perfil' → /dashboard/perfil
  Separador
  'Cerrar sesión' → AlertDialog de confirmación

ALERTDIALOG DE LOGOUT:
- Título: '¿Cerrar sesión?'
- Descripción: 'Se cerrará tu sesión actual.'
- Botones: Cancelar / Cerrar sesión
- signOut({ callbackUrl: theme.auth.redirectAfterLogout })

Usar useSession + usePathname + use client.
```

---

### 2.4 — Página de Perfil del Usuario

```
[Adjuntar: AUTH_CONTEXT.md + lib/theme.ts + app/(dashboard)/dashboard/perfil/page.tsx + lib/supabase.ts]

Creá la página de perfil del usuario en /dashboard/perfil.

LAYOUT:
- Título de página: 'Mi perfil'
- Dos secciones en cards separadas

CARD 1 — Datos personales:
- Avatar grande con inicial, bg=theme.colors.primary
- Campos editables:
    Nombre completo
    Email (solo lectura — no se puede cambiar)
- Botón 'Guardar cambios'
- Al guardar: PATCH /api/perfil
  Toast de éxito/error
- Validación Zod: nombre mínimo 3 chars

CARD 2 — Seguridad:
- Título 'Cambiar contraseña'
- Campos:
    Contraseña actual
    Nueva contraseña (con indicador de fortaleza)
    Confirmar nueva contraseña
- Botón 'Actualizar contraseña'
- Validación Zod: mismas reglas que el registro
- Al guardar: supabase.auth.updateUser({ password })
  Toast de éxito, limpiar los campos

INFO DE CUENTA (solo lectura):
- Rol actual: badge con el nombre del rol
  bg=theme.colors.primary + opacity, color=theme.colors.primary
- Miembro desde: fecha formateada en español
- No puede cambiar su propio rol (solo el Admin puede)

ENDPOINT /api/perfil/route.ts:
- PATCH: actualiza name en public.users
  Requiere sesión activa
  Solo puede editar su propio perfil

Usar useSession + React Hook Form + Zod + use client.
```

---

## SECCIÓN 3 — Paneles de Administración

---

### 3.1 — Panel: Gestión de Usuarios

```
[Adjuntar: AUTH_CONTEXT.md + lib/theme.ts + app/(dashboard)/dashboard/admin/usuarios/page.tsx + lib/supabase.ts]

Creá la página de gestión de usuarios.

HEADER DE PÁGINA:
- Título 'Usuarios'
- Badge con el total de usuarios
- Botón 'Invitar usuario' (placeholder, sin funcionalidad por ahora)

FILTROS:
- Input de búsqueda: busca por nombre o email, ícono Lucide Search
- Select de rol: cargado dinámicamente desde public.roles
  Opción default: 'Todos los roles'

TABLA:
Columnas: Avatar+Nombre, Email, Rol, Fecha de registro, Acciones

- Avatar: círculo con inicial, bg generado por hash del nombre
- Nombre: bold, email debajo en textMuted
- Rol: badge coloreado
  Administrador: bg primary claro, text primary
  Usuario: bg gris claro, text textMuted
  Otros roles futuros: bg accent claro, text accent
- Fecha: formato 'dd/MM/yyyy' en español
- Acciones: dropdown con ícono Lucide MoreHorizontal
    Items por cada rol disponible (cargados desde public.roles)
    Ocultar el rol que ya tiene el usuario
    Separador
    'Ver detalles' (placeholder)
    No mostrar opción de cambiar su propio rol

PAGINACIÓN:
- 20 usuarios por página
- Botones Anterior / Siguiente
- Texto '1-20 de 47 usuarios'

CAMBIO DE ROL:
- AlertDialog de confirmación:
  '¿Cambiar el rol de [nombre] a [nuevo rol]?'
  Esta acción se puede revertir en cualquier momento.
- PATCH /api/admin/usuarios/[id] con { role_id }
- Toast de éxito/error
- Actualizar la tabla sin recargar la página

ESTADO VACÍO:
- Si no hay usuarios con el filtro aplicado:
  ícono Lucide Users, texto 'No se encontraron usuarios'

Solo accesible si session.user.role === 'Administrador'.
Usar useSession + use client + useState para filtros y paginación.
```

---

### 3.2 — Panel: Gestión de Roles

```
[Adjuntar: AUTH_CONTEXT.md + lib/theme.ts + app/(dashboard)/dashboard/admin/roles/page.tsx + lib/supabase.ts]

Creá la página de gestión de roles.

HEADER DE PÁGINA:
- Título 'Roles'
- Botón 'Nuevo rol' → abre el drawer

TABLA:
Columnas: Nombre, Descripción, Default, Usuarios, Acciones

- Nombre: bold con ícono Lucide Shield
- Default: badge 'Por defecto' en accent si is_default=true, vacío si no
- Usuarios: número de usuarios con ese rol
- Acciones: dropdown
    'Editar' → abre drawer con datos precargados
    'Eliminar' → AlertDialog
    Deshabilitar 'Eliminar' si tiene usuarios o es el único default

DRAWER CREAR/EDITAR (desliza desde la derecha):
- Título: 'Nuevo rol' / 'Editar rol'
- Campo Nombre: requerido, mínimo 2 chars
- Campo Descripción: opcional, textarea
- Toggle 'Rol por defecto':
    Label: 'Asignar como rol por defecto para nuevos usuarios'
    Advertencia si se activa: 'Esto va a desactivar el rol por defecto actual'
    color=theme.colors.warning
- Botones: Cancelar / Guardar
- POST /api/admin/roles (nuevo)
- PATCH /api/admin/roles/[id] (editar)

ELIMINAR:
- AlertDialog:
    '¿Eliminar el rol [nombre]?'
    'Esta acción no se puede deshacer.'
- Si tiene usuarios: deshabilitar botón con tooltip
    'No se puede eliminar un rol con usuarios asignados'
- DELETE /api/admin/roles/[id]

Solo accesible si session.user.role === 'Administrador'.
```

---

### 3.3 — Panel: Gestión de Permisos

```
[Adjuntar: AUTH_CONTEXT.md + lib/theme.ts + app/(dashboard)/dashboard/admin/permisos/page.tsx + lib/supabase.ts]

Creá la página de gestión de permisos.

HEADER DE PÁGINA:
- Título 'Permisos'
- Subtítulo: 'Configurá qué puede hacer cada rol en cada módulo'

TABS:
- Un tab por cada rol en public.roles, cargados dinámicamente
- Tab Administrador: badge 'Fijo' en textMuted

TABLA DE PERMISOS (una por tab):
Columnas: Módulo, Ver, Crear, Editar, Eliminar

- Módulo: nombre capitalizado con ícono
    clientes  → ícono Users
    servicios → ícono Briefcase
    cobranzas → ícono DollarSign
    admin     → ícono Shield
- Cada permiso: Toggle switch
    ON: bg=theme.colors.accent
    OFF: bg=theme.colors.border
    transition=theme.transitions.fast
- Tab Administrador: todos los switches ON + disabled
  con tooltip 'El Administrador siempre tiene acceso total'

AL CAMBIAR UN SWITCH:
- PATCH /api/admin/permisos inmediato
  Body: { role_id, module, action, value }
- Toast discreto: 'Permiso actualizado'
- Si falla: revertir el switch al estado anterior + toast de error

BOTÓN RESTAURAR:
- 'Restaurar permisos por defecto' al pie de la tabla
  Solo visible en tabs que no sean Administrador
- AlertDialog:
    '¿Restaurar los permisos de [rol] a los valores por defecto?'
    'Esto va a revertir todos los cambios que hayas hecho.'
- POST /api/admin/permisos/restaurar con { role_id }

ESTADO LOADING:
- Skeleton de la tabla mientras cargan los permisos

Solo accesible si session.user.role === 'Administrador'.
```

---

## Prompts de verificación de UI

### Revisar consistencia visual

```
[Adjuntar: lib/theme.ts + components/dashboard/ + app/auth/]

Revisá todos los componentes de auth y dashboard y verificá:
- Todos los colores vienen de theme.colors (ninguno hardcodeado)
- Todas las transiciones usan theme.transitions
- Todos los border-radius usan theme.radii
- Los mensajes de error están en español
- Los spinners de carga están presentes en todos los botones de submit
- Los estados vacíos están manejados en todas las tablas
```

### Si un componente no carga bien

```
[Adjuntar: AUTH_CONTEXT.md + lib/theme.ts + archivo con el error]

Tengo este problema visual o de carga:
[DESCRIBÍ EL PROBLEMA]

El componente es: [ruta/al/componente.tsx]

Analizá la causa y proponé la solución
manteniendo la consistencia con theme.ts.
```

---

*MGA Informática | 2026 | Auth UI Prompts v1.0*
