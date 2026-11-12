import useCatalog from '../../../hooks/useCatalog'

export default function ObraStep({ obras, selectedId, onSelect }) {
  const { formatARS } = useCatalog()

  return (
    <section className="wizard-step grid grid-cols-1 sm:grid-cols-2 gap-4" aria-label="Elegir obra">
      {obras.map((obra) => {
        const active = selectedId === obra.id
        return (
          <button
            key={obra.id}
            type="button"
            onClick={() => onSelect(obra.id)}
            aria-pressed={active}
            className={`group text-left rounded-xl border bg-surface-dark overflow-hidden transition-all duration-300 ${
              active
                ? 'border-secondary ring-2 ring-secondary/30'
                : 'border-outline-border hover:border-secondary/50 hover:-translate-y-0.5'
            }`}
          >
            <div className="flex gap-3 p-3">
              <div className="relative w-20 h-28 shrink-0 rounded-lg overflow-hidden border border-outline-border">
                <img className="w-full h-full object-cover" src={obra.img} alt={obra.titulo} />
                {active ? (
                  <span className="absolute inset-0 bg-secondary/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-secondary text-3xl drop-shadow">
                      check_circle
                    </span>
                  </span>
                ) : null}
              </div>
              <div className="flex flex-col min-w-0 flex-1 gap-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">
                  {obra.genero}
                </span>
                <span className="text-sm font-bold leading-tight">{obra.titulo}</span>
                <span className="text-[11px] text-ivory-muted line-clamp-2 leading-relaxed">
                  {obra.sinopsis}
                </span>
                <span className="text-[11px] text-ivory-muted mt-auto">
                  {obra.duracion} min • Desde{' '}
                  <strong className="text-secondary">{formatARS(obra.precio)}</strong>
                </span>
              </div>
            </div>
          </button>
        )
      })}
    </section>
  )
}
