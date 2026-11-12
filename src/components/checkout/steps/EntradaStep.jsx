import useCatalog from '../../../hooks/useCatalog'

export default function EntradaStep({ obra, tipo, onSelect }) {
  const { formatARS } = useCatalog()

  const opciones = [
    {
      key: 'estandar',
      titulo: 'Entrada Estándar',
      precio: obra.precio,
      detalle: 'Platea central y laterales. Visibilidad completa del escenario.',
      icon: 'event_seat',
    },
    {
      key: 'vip',
      titulo: 'Entrada VIP',
      precio: obra.vip,
      detalle: 'Primeras filas y palcos laterales. Acceso prioritario a la sala.',
      icon: 'workspace_premium',
    },
  ]

  return (
    <section className="wizard-step" aria-label="Elegir tipo de entrada">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {opciones.map((opcion) => {
          const active = tipo === opcion.key
          return (
            <button
              key={opcion.key}
              type="button"
              onClick={() => onSelect(opcion.key)}
              aria-pressed={active}
              className={`text-left rounded-xl border bg-surface-dark p-5 flex flex-col gap-3 transition-all ${
                active
                  ? 'border-secondary ring-2 ring-secondary/30'
                  : 'border-outline-border hover:border-secondary/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="w-11 h-11 rounded-lg bg-surface-card border border-outline-border flex items-center justify-center">
                  <span className="material-symbols-outlined text-secondary">{opcion.icon}</span>
                </span>
                <span className="text-lg font-extrabold text-secondary">
                  {formatARS(opcion.precio)}{' '}
                  <span className="text-[10px] font-normal text-ivory-muted">ARS</span>
                </span>
              </div>
              <span className="text-sm font-bold">{opcion.titulo}</span>
              <span className="text-[11px] text-ivory-muted leading-relaxed">{opcion.detalle}</span>
              <span
                className={`text-[11px] font-semibold ${
                  active ? 'text-secondary' : 'text-ivory-muted'
                }`}
              >
                {active ? '✓ Seleccionada' : 'Seleccionar'}
              </span>
            </button>
          )
        })}
      </div>
      <p className="text-xs text-ivory-muted mt-4 flex items-start gap-2">
        <span className="material-symbols-outlined text-secondary text-base">info</span>
        Las butacas VIP se ubican en las primeras filas y palcos laterales. El tipo elegido aplica a
        todas las butacas de esta compra.
      </p>
    </section>
  )
}
