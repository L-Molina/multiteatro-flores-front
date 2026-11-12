import useCatalog from '../../../hooks/useCatalog'

export default function TeatroStep({ obraId, selectedSalaId, onSelect }) {
  const { teatrosDeObra, funcionesDeObra, formatFecha } = useCatalog()
  const teatros = teatrosDeObra(obraId)

  if (!teatros.length) {
    return (
      <section className="wizard-step rounded-xl border border-outline-border bg-surface-dark p-6 text-sm text-ivory-muted">
        Esta obra todavía no tiene teatros ni funciones programadas. Volvé al paso anterior y elegí
        otra obra.
      </section>
    )
  }

  return (
    <section className="wizard-step flex flex-col gap-4" aria-label="Elegir teatro">
      {teatros.map((sala) => {
        const active = selectedSalaId === sala.id
        const funciones = funcionesDeObra(obraId).filter((funcion) => funcion.salaId === sala.id)
        const next = funciones[0]
        return (
          <button
            key={sala.id}
            type="button"
            onClick={() => onSelect(sala.id)}
            aria-pressed={active}
            className={`text-left rounded-xl border bg-surface-dark p-4 sm:p-5 transition-all ${
              active
                ? 'border-secondary ring-2 ring-secondary/30'
                : 'border-outline-border hover:border-secondary/50'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-lg bg-surface-card border border-outline-border flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-secondary">meeting_room</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold">{sala.teatro}</span>
                  <span className="text-xs text-secondary font-semibold">{sala.nombre}</span>
                  <span className="text-[11px] text-ivory-muted flex items-center gap-1 mt-0.5">
                    <span className="material-symbols-outlined text-[0.85rem]">location_on</span>
                    {sala.direccion}
                  </span>
                </div>
              </div>
              <div className="flex sm:flex-col items-start sm:items-end gap-2 text-[11px] text-ivory-muted">
                <span className="px-2 py-0.5 rounded bg-surface-card border border-outline-border">
                  {sala.capacidad} butacas
                </span>
                <span>
                  {funciones.length} funciones •{' '}
                  {next
                    ? formatFecha(next.fecha, { weekday: 'short', day: 'numeric', month: 'short' })
                    : 'sin fecha'}
                </span>
              </div>
            </div>
          </button>
        )
      })}
    </section>
  )
}
