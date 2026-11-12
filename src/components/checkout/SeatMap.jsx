export default function SeatMap({ asientos, tipo, seats, onToggle }) {
  const rows = {}
  asientos.forEach((asiento) => {
    if (!rows[asiento.fila]) rows[asiento.fila] = []
    rows[asiento.fila].push(asiento)
  })

  return (
    <div className="min-w-[760px] flex flex-col items-center gap-1.5">
      {Object.entries(rows).map(([fila, rowSeats]) => {
        const isVip = rowSeats[0] && rowSeats[0].tipo === 'vip'
        return (
          <div key={fila} className="flex items-center gap-2">
            <span
              className={`w-12 text-right text-[10px] font-bold ${
                isVip ? 'text-secondary' : 'text-ivory-muted'
              }`}
            >
              {fila}
              {isVip ? ' • VIP' : ''}
            </span>
            <div className="flex gap-1">
              {rowSeats.map((asiento) => {
                const selected = seats.includes(asiento.id)
                const wrongType = asiento.tipo !== tipo
                let cls
                if (asiento.estado !== 'disponible') {
                  cls =
                    asiento.estado === 'ocupado'
                      ? 'bg-[#1b4234] text-transparent cursor-not-allowed'
                      : 'bg-tertiary-container/50 border border-tertiary/30 text-tertiary/50 cursor-not-allowed'
                } else if (wrongType) {
                  cls =
                    'bg-surface-elevated/40 border border-outline-border/60 text-ivory-muted/30 cursor-not-allowed'
                } else if (selected) {
                  cls =
                    'bg-secondary text-canvas-root border border-secondary shadow-[0_0_8px_rgba(239,191,105,0.5)]'
                } else {
                  cls =
                    'bg-surface-elevated border border-outline-border hover:bg-secondary/30 hover:border-secondary/60 text-ivory-muted'
                }
                const typeLabel = asiento.tipo === 'vip' ? 'VIP' : 'Estándar'
                return (
                  <button
                    key={asiento.id}
                    type="button"
                    className={`seat-btn ${cls}`}
                    onClick={() => onToggle(asiento.id)}
                    disabled={asiento.estado !== 'disponible' || wrongType}
                    aria-pressed={selected}
                    aria-label={`Fila ${asiento.fila}, butaca ${asiento.numero}, ${typeLabel}, ${asiento.estado}`}
                    title={`Fila ${asiento.fila} • Butaca ${asiento.numero} (${typeLabel}) — ${asiento.estado}`}
                  >
                    {asiento.numero}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
