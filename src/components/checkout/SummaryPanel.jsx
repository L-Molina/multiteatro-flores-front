import useCatalog from '../../hooks/useCatalog'

export default function SummaryPanel({ obra, sala, funcion, tipo, seats, unitPrice, totals, pay }) {
  const { formatARS, formatFecha } = useCatalog()
  const tipoLabel = tipo === 'vip' ? 'VIP' : 'Estándar'
  const count = seats.length

  const installments =
    pay === 'tarjeta' && totals.total > 0
      ? `3 cuotas sin interés de ${formatARS(Math.round(totals.total / 3))}`
      : pay === 'transferencia'
        ? '5% de descuento aplicado'
        : 'Pago directo'

  return (
    <div className="bg-surface-dark border border-outline-border rounded-xl p-5 shadow-xl flex flex-col gap-4">
      <div className="flex items-center justify-between pb-3 border-b border-outline-border">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary text-lg">receipt_long</span>
          <span className="text-base font-bold">Resumen de tu compra</span>
        </div>
        <span className="px-2 py-0.5 rounded bg-secondary/15 text-secondary text-xs font-bold">
          {count} {count === 1 ? 'entrada' : 'entradas'}
        </span>
      </div>

      <p className="text-[11px] text-ivory-muted leading-relaxed -mt-2 flex items-start gap-1.5">
        <span className="material-symbols-outlined text-sm text-secondary shrink-0">
          shopping_cart_off
        </span>
        Sin carrito: esta compra corresponde a una única función y hasta 6 butacas.
      </p>

      {!obra ? (
        <div className="flex flex-col items-center text-center gap-2 py-4 text-ivory-muted">
          <span className="material-symbols-outlined text-3xl text-outline-border">
            confirmation_number
          </span>
          <p className="text-xs">
            Todavía no elegiste ninguna función. Empezá por la obra que quieras ver.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 bg-surface-card border border-outline-border p-3 rounded-lg">
            <div className="w-14 h-16 rounded overflow-hidden shrink-0 border border-outline-border">
              <img className="w-full h-full object-cover" src={obra.img} alt="" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold leading-tight">{obra.titulo}</span>
              <span className="text-xs text-secondary font-medium mt-0.5">
                {funcion
                  ? `${formatFecha(funcion.fecha, {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                    })} • ${funcion.hora} hs`
                  : 'Elegí una función'}
              </span>
              <span className="text-[11px] text-ivory-muted truncate">
                {sala ? `${sala.teatro} • ${sala.nombre}` : 'Elegí un teatro'}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[11px] uppercase tracking-wider text-ivory-muted font-bold">
              Ubicaciones asignadas
            </span>
            <div className="flex flex-col gap-1.5">
              {seats.length ? (
                seats.map((id) => (
                  <div
                    key={id}
                    className="flex items-center justify-between gap-2 rounded bg-surface-card border border-outline-border px-2.5 py-1.5 text-xs"
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-secondary" />
                      <span className="text-ivory-text font-medium">
                        Butaca {id.replace('-', ' • N° ')}
                      </span>
                      <span className="text-[10px] text-secondary bg-secondary/10 px-1.5 py-0.5 rounded font-bold">
                        {tipoLabel}
                      </span>
                    </span>
                    <span className="text-ivory-text font-bold">{formatARS(unitPrice)}</span>
                  </div>
                ))
              ) : (
                <span className="text-xs text-ivory-muted">
                  Todavía no elegiste butacas.
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-1 text-xs text-ivory-muted">
            <div className="flex justify-between">
              <span>
                Subtotal entradas
                {count ? ` (${count} x ${formatARS(unitPrice)})` : ''}
              </span>
              <span className="text-ivory-text font-semibold">{formatARS(totals.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Costo de servicio digital</span>
              <span className="text-ivory-text font-semibold">{formatARS(totals.service)}</span>
            </div>
            {totals.discount > 0 ? (
              <div className="flex justify-between text-primary font-medium">
                <span>Descuento transferencia (-5%)</span>
                <span>-{formatARS(totals.discount)}</span>
              </div>
            ) : null}
            <div className="my-1 h-px bg-outline-border" />
            <div className="flex justify-between items-baseline">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-ivory-text uppercase tracking-wide">
                  Total a pagar
                </span>
                <span className="text-[11px] text-secondary font-medium">{installments}</span>
              </div>
              <span className="text-xl font-extrabold text-secondary">
                {formatARS(totals.total)}{' '}
                <span className="text-xs text-ivory-muted font-normal">ARS</span>
              </span>
            </div>
          </div>

          <div className="bg-surface-card border border-outline-border p-3 rounded-lg flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 text-primary text-xs font-bold">
              <span className="material-symbols-outlined text-base">qr_code_2</span>
              Ingreso directo con QR
            </div>
            <p className="text-[11px] text-ivory-muted leading-relaxed">
              No imprimas nada. El QR se activa en tu celular antes de la apertura de puertas y se
              valida una sola vez.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
