import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import useCatalog from '../hooks/useCatalog'
import useDocumentTitle from '../hooks/useDocumentTitle'

const ESTADO_CLASS = {
  Confirmada: 'bg-primary-container text-primary border border-primary/30',
  Usada: 'bg-surface-dark border border-panel-border text-on-surface-muted',
  Cancelada: 'bg-tertiary-container text-tertiary border border-tertiary/30',
}

function fechaCompra(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default function ComprasPage() {
  useDocumentTitle('Mis Compras')
  const { user } = useAuth()
  const { compras, formatARS, formatFecha } = useCatalog()

  const misCompras = useMemo(
    () => compras.filter((compra) => compra.usuarioEmail === user?.email),
    [compras, user],
  )

  const totalEntradas = misCompras.reduce((acc, compra) => acc + compra.butacas.length, 0)
  const totalAbonado = misCompras.reduce((acc, compra) => acc + compra.total, 0)

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-8 py-10 flex flex-col gap-8 page-enter">
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-on-surface-muted">
          <span className="text-secondary">Mi cuenta</span>
          <span>/</span>
          <span>Historial de compras</span>
        </div>
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="flex flex-col gap-1.5 max-w-2xl">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-on-surface">
              Mis compras
            </h1>
            <p className="text-sm text-on-surface-muted leading-relaxed">
              Consultá todas las entradas que compraste, revisá el detalle de cada operación y
              accedé a tu código QR de ingreso.
            </p>
          </div>
          <Link
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-secondary hover:bg-secondary-hover text-[#071510] text-xs font-extrabold uppercase tracking-wider transition-colors shrink-0"
            to="/#cartelera"
          >
            <span className="material-symbols-outlined text-base">theater_comedy</span>
            Comprar entradas
          </Link>
        </div>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4" aria-label="Resumen de compras">
        {[
          ['Compras realizadas', misCompras.length, 'receipt_long', 'text-secondary'],
          [
            'Entradas adquiridas',
            totalEntradas,
            'confirmation_number',
            'text-primary',
          ],
          ['Total abonado', formatARS(totalAbonado), 'payments', 'text-tertiary'],
        ].map(([label, value, icon, color]) => (
          <div
            key={label}
            className="flex items-center gap-4 rounded-xl border border-panel-border bg-surface-card p-4"
          >
            <span className="w-11 h-11 rounded-lg bg-surface-dark border border-panel-border flex items-center justify-center shrink-0">
              <span className={`material-symbols-outlined text-[1.35rem] ${color}`}>{icon}</span>
            </span>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-muted">
                {label}
              </span>
              <span className="text-xl font-extrabold text-on-surface truncate">{value}</span>
            </div>
          </div>
        ))}
      </section>

      {misCompras.length ? (
        <section className="flex flex-col gap-4" aria-label="Listado de compras">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-bold text-on-surface">Compras registradas</h2>
            <span className="text-xs text-on-surface-muted">
              {misCompras.length} {misCompras.length === 1 ? 'operación' : 'operaciones'}
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {misCompras.map((compra) => (
              <Link
                key={compra.id}
                to={`/compras/${compra.id}`}
                className="group flex flex-col sm:flex-row gap-4 rounded-xl border border-panel-border bg-surface-card p-4 hover:border-secondary/60 hover:bg-surface-elevated/60 transition-colors"
              >
                <img
                  className="w-full sm:w-20 h-28 sm:h-24 object-cover rounded-lg border border-panel-border shrink-0"
                  src={compra.obraImg}
                  alt={`Afiche de ${compra.obraTitulo}`}
                />
                <div className="flex flex-1 flex-col gap-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-muted">
                      Compra {compra.codigo}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        ESTADO_CLASS[compra.estado] || ESTADO_CLASS.Confirmada
                      }`}
                    >
                      {compra.estado}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-on-surface group-hover:text-secondary transition-colors truncate">
                    {compra.obraTitulo}
                  </h3>
                  <p className="text-xs font-semibold text-secondary">
                    {formatFecha(compra.fechaFuncion, {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                    })}{' '}
                    • {compra.horaFuncion} hs
                  </p>
                  <p className="text-xs text-on-surface-muted truncate">
                    {compra.teatro} • {compra.salaNombre}
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-on-surface-muted mt-1">
                    <span className="inline-flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">event_seat</span>
                      {compra.butacas.length}{' '}
                      {compra.butacas.length === 1 ? 'entrada' : 'entradas'} • {compra.tipoLabel}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">calendar_month</span>
                      Compra del {fechaCompra(compra.creada)}
                    </span>
                  </div>
                </div>
                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 sm:min-w-[140px] shrink-0">
                  <span className="text-lg font-extrabold text-secondary">
                    {formatARS(compra.total)}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-on-surface-muted group-hover:text-secondary transition-colors">
                    Ver detalle
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : (
        <section className="rounded-xl border border-panel-border bg-surface-card p-10 text-center flex flex-col items-center">
          <span className="material-symbols-outlined text-4xl text-secondary">receipt_long</span>
          <h2 className="mt-3 text-base font-bold text-on-surface">
            Todavía no realizaste ninguna compra
          </h2>
          <p className="mt-1 text-xs text-on-surface-muted max-w-md leading-relaxed">
            Cuando confirmes una compra, tu entrada digital y el detalle de la operación van a
            aparecer en esta sección.
          </p>
          <Link
            className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-secondary hover:bg-secondary-hover text-[#071510] text-xs font-extrabold uppercase tracking-wider transition-colors"
            to="/#cartelera"
          >
            <span className="material-symbols-outlined text-base">theater_comedy</span>
            Ver cartelera
          </Link>
        </section>
      )}

      <p className="text-[11px] text-on-surface-muted flex items-start gap-1.5">
        <span className="material-symbols-outlined text-sm text-secondary shrink-0">info</span>
        En este prototipo las compras se guardan en la memoria de la sesión y se reinician al
        recargar la página.
      </p>
    </div>
  )
}
