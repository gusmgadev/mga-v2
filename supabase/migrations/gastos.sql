-- Plantilla de gastos fijos (se replica cada mes)
CREATE TABLE gastos_plantilla (
  id SERIAL PRIMARY KEY,
  categoria TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  monto_estimado NUMERIC,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  orden INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gastos del mes (copia de plantilla + gastos ad-hoc)
CREATE TABLE gastos (
  id SERIAL PRIMARY KEY,
  plantilla_id INTEGER REFERENCES gastos_plantilla(id) ON DELETE SET NULL,
  mes SMALLINT NOT NULL CHECK (mes BETWEEN 1 AND 12),
  anio SMALLINT NOT NULL,
  categoria TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  monto_estimado NUMERIC,
  monto_real NUMERIC,
  pagado BOOLEAN NOT NULL DEFAULT FALSE,
  fecha_pago DATE,
  metodo_pago TEXT CHECK (metodo_pago IN ('EFECTIVO','TRANSFERENCIA','TARJETA','CHEQUE','OTRO')),
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_gastos_mes_anio ON gastos(anio, mes);

-- Permisos por rol
INSERT INTO role_permissions (role_id, module, can_view, can_create, can_edit, can_delete)
SELECT id, 'gastos', true, true, true, true FROM roles WHERE name = 'Administrador';

INSERT INTO role_permissions (role_id, module, can_view, can_create, can_edit, can_delete)
SELECT id, 'gastos', true, true, true, false FROM roles WHERE name = 'Usuario';

-- Plantilla inicial de gastos fijos
INSERT INTO gastos_plantilla (categoria, descripcion, monto_estimado, orden) VALUES
('PRESTAMOS',     'PRESTAMO SILVIA',          3300,     10),
('PRESTAMOS',     'PRESTAMO HIPOTECARIO',     1900,     20),
('PRESTAMOS',     'MANTNIMIENTO CTAS',         NULL,    30),
('PRESTAMOS',     'MERCADO PAGO',                 0,   40),
('PRESTAMOS',     'TARJETA LA ANONIMA',       169000,   50),
('PRESTAMOS',     'TARJETA NARANJA',          180000,   60),
('PRESTAMOS',     'TARJETA VISA SANTANDER',  1910000,   70),
('SERVICIOS',     'AGUA CASA',                84000,   80),
('SERVICIOS',     'LUZ CASA',                125000,   90),
('SERVICIOS',     'IMP INOMB TERRENO',        124000,  100),
('SERVICIOS',     'GAS CASA',                  NULL,  110),
('SERVICIOS',     'MONOTRIBU',               104000,  120),
('SERVICIOS',     'SCPL INTERNET',            30400,  130),
('SERVICIOS',     'CELULAR',                  39400,  140),
('SERVICIOS',     'PRESTAMO',                 78000,  150),
('SEGUROS',       'SEGURO PARTNER Y MOTO',     NULL,  160),
('SEGUROS',       'PATENTE OROCH',            39000,  170),
('SEGUROS',       'PATENTE MOTO',              1300,  180),
('PLAN AHORRO',   'TOYOTA PLAN',               NULL,  190),
('GASTO GUILLE',  'ALQUILER GUILLE',          150000,  200),
('GASTO',         'CUOTA 5 MULTA',            28300,  210),
('GASTO TIZI',    'VIAJE CHENQUE',            92500,  220),
('GASTO TIZI',    'VIAJE EGRESO',            100000,  230),
('GASTO TIZI',    'FIESTA EGRESO',           100000,  240);
