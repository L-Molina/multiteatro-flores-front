import SeatMap from '../SeatMap'

export default function ButacasStep({ asientos, tipo, seats, onToggle }) {
  return (
    <section className="wizard-step rounded-xl border border-outline-border bg-surface-dark p-4 sm:p-6 flex flex-col gap-5" aria-label="Elegir butacas">
      <div className="w-full rounded-lg border border-outline-border bg-surface-card py-2.5 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-secondary flex items-center justify-center gap-2">
        <span className="material-symbols-outlined text-base">theater_comedy</span>
        Escenario • Pantalla de sala
      </div>
      <div className="overflow-x-auto pb-2">
        <SeatMap asientos={asientos} tipo={tipo} seats={seats} onToggle={onToggle} />
      </div>
      <div className="flex flex-wrap items-center gap-4 text-[11px] text-ivory-muted border-t border-outline-border pt-3">
        <span className="flex items-center gap-1.5">
          <span className="legend-seat bg-surface-elevated border border-outline-border" />
          Disponible
        </span>
        <span className="flex items-center gap-1.5">
          <span className="legend-seat bg-secondary" />
          Seleccionada
        </span>
        <span className="flex items-center gap-1.5">
          <span className="legend-seat bg-[#1b4234] opacity-70" />
          Ocupada
        </span>
        <span className="flex items-center gap-1.5">
          <span className="legend-seat bg-tertiary-container/60 border border-tertiary/40" />
          No disponible
        </span>
        <span className="ml-auto font-bold text-ivory-text">
          Butacas elegidas: <span className="text-secondary">{seats.length}</span> / 6
        </span>
      </div>
    </section>
  )
}
