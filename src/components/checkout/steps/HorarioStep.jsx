import useCatalog from '../../../hooks/useCatalog'

export default function HorarioStep({ obraId, salaId, selectedFuncionId, onSelect }) {
  const { funcionesDeObra, getSala, asientos, formatFecha } = useCatalog()
  const funciones = funcionesDeObra(obraId).filter((funcion) => funcion.salaId === salaId)

  if (!funciones.length) {
    return (
      <section className="wizard-step rounded-xl border border-outline-border bg-surface-dark p-6 text-sm text-ivory-muted">
        No hay funciones disponibles en esta sala. Volvé al paso anterior y elegí otro teatro.
      </section>
    )
  }

  return (
    <section className="wizard-step flex flex-col gap-4" aria-label="Elegir día y horario">
      {funciones.map((funcion) => {
        const active = selectedFuncionId === funcion.id
        const sala = getSala(funcion.salaId)
        const libres = asientos(funcion.id).filter((a) => a.estado === 'disponible').length
        return (
          <button
            key={funcion.id}
            type="button"
            onClick={() => onSelect(funcion.id)}
            aria-pressed={active}
            className={`text-left rounded-xl border bg-surface-dark p-4 sm:p-5 transition-all ${
              active
                ? 'border-secondary ring-2 ring-secondary/30'
                : 'border-outline-border hover:border-secondary/50'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-lg bg-surface-card border border-outline-border flex flex-col items-center justify-center shrink-0 leading-none">
                  <span className="text-[10px] uppercase text-ivory-muted">
                    {formatFecha(funcion.fecha, { month: 'short' })}
                  </span>
                  <span className="text-lg font-extrabold text-secondary">
                    {Number(funcion.fecha.slice(8, 10))}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold">{formatFecha(funcion.fecha)}</span>
                  <span className="text-xs text-ivory-muted">
                    {funcion.hora} hs • {sala?.nombre} • {sala?.teatro}
                  </span>
                  <span className="text-[11px] text-primary mt-0.5">
                    {libres} butacas disponibles
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${
                    funcion.estado === 'Últimas'
                      ? 'bg-tertiary-container/50 text-tertiary border-tertiary/30'
                      : 'bg-primary-container text-primary border-primary/30'
                  }`}
                >
                  {funcion.estado}
                </span>
                <span className="material-symbols-outlined text-secondary">
                  {active ? 'radio_button_checked' : 'radio_button_unchecked'}
                </span>
              </div>
            </div>
          </button>
        )
      })}
    </section>
  )
}
