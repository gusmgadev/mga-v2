-- Tabla: oportunidades comerciales (mails de Zoologic CRM)
CREATE TABLE IF NOT EXISTS oportunidades (
  id SERIAL PRIMARY KEY,
  nro_tarea INTEGER,
  nro_oportunidad INTEGER,
  titulo TEXT,
  registrada_por TEXT,
  fecha_inicio DATE,
  fecha_vencimiento DATE,
  tipo_tarea TEXT,
  cliente_codigo TEXT,
  cliente_nombre TEXT,
  origen TEXT,
  tipo_oportunidad TEXT,
  zona_gestion TEXT,
  primer_nombre TEXT,
  apellido TEXT,
  empresa TEXT,
  provincia_ciudad TEXT,
  telefono TEXT,
  email_contacto TEXT,
  comentarios TEXT,
  email_subject TEXT,
  email_from TEXT,
  email_fecha TIMESTAMPTZ,
  email_message_id TEXT UNIQUE,
  estado TEXT DEFAULT 'NUEVA',
  notas TEXT,
  servicio_id INTEGER REFERENCES servicios(id) ON DELETE SET NULL,
  presupuesto_id INTEGER REFERENCES presupuestos(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Permisos por rol
INSERT INTO role_permissions (role_id, module, can_view, can_create, can_edit, can_delete)
VALUES
  (1, 'oportunidades', true, true, true, true),
  (2, 'oportunidades', true, true, true, false)
ON CONFLICT (role_id, module) DO NOTHING;
