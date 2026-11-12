const STEPS = ['Obra', 'Teatro', 'Horario', 'Entrada', 'Butacas', 'Titular', 'Pago', 'Resumen']

export default function Stepper({ step }) {
  return (
    <nav
      aria-label="Progreso de compra"
      className="flex items-center gap-1.5 sm:gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0"
    >
      {STEPS.map((label, index) => {
        const number = index + 1
        const active = number === step
        const done = number < step
        const circleClass = active
          ? 'bg-secondary text-canvas-root'
          : done
            ? 'bg-primary-container text-primary border border-primary/40'
            : 'bg-surface-card text-ivory-muted border border-outline-border'
        const textClass = active
          ? 'text-secondary font-semibold'
          : done
            ? 'text-primary'
            : 'text-ivory-muted'
        return (
          <div
            key={label}
            className={`flex items-center gap-1.5 shrink-0 ${textClass}`}
            aria-current={active ? 'step' : undefined}
          >
            <span
              className={`w-5 h-5 rounded-full font-bold flex items-center justify-center text-[10px] ${circleClass}`}
            >
              {done ? '✓' : number}
            </span>
            <span className="text-[11px] hidden sm:inline">{label}</span>
            {number < STEPS.length ? (
              <span
                className={`w-3 sm:w-5 h-0.5 ${done ? 'bg-primary/60' : 'bg-outline-border'}`}
                aria-hidden="true"
              />
            ) : null}
          </div>
        )
      })}
    </nav>
  )
}
