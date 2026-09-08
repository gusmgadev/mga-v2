-- Historial de pagos por gasto (permite ver, editar y eliminar pagos individuales)
CREATE TABLE gastos_pagos (
  id SERIAL PRIMARY KEY,
  gasto_id INTEGER NOT NULL REFERENCES gastos(id) ON DELETE CASCADE,
  monto NUMERIC NOT NULL CHECK (monto > 0),
  fecha_pago DATE,
  metodo_pago TEXT CHECK (metodo_pago IN ('EFECTIVO','TRANSFERENCIA','TARJETA','CHEQUE','OTRO')),
  tarjeta_id INTEGER REFERENCES tarjetas(id) ON DELETE SET NULL,
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_gastos_pagos_gasto_id ON gastos_pagos(gasto_id);

-- Backfill: registrar un pago por cada gasto que ya tenía monto pagado
INSERT INTO gastos_pagos (gasto_id, monto, fecha_pago, metodo_pago, tarjeta_id)
SELECT id, monto_pagado, fecha_pago, metodo_pago, tarjeta_id
FROM gastos
WHERE COALESCE(monto_pagado, 0) > 0;