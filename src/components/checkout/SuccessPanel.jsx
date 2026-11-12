import { Link } from 'react-router-dom'
import QrCanvas from './QrCanvas'

export default function SuccessPanel({ ticket, onDownload }) {
  return (
    <section className="wizard-step rounded-2xl border border-primary/40 bg-surface-dark p-6 sm:p-8 flex flex-col items-center text-center gap-4">
      <div className="w-16 h-16 rounded-full bg-primary-container border border-primary/40 flex items-center justify-center">
        <span className="material-symbols-outlined text-primary text-3xl">check_circle</span>
      </div>
      <div>
        <h2 className="text-2xl font-extrabold">¡Compra confirmada!</h2>
        <p className="text-sm text-ivory-muted mt-1">
          Tus entradas ya están disponibles. Te enviamos el código QR a{' '}
          <strong className="text-ivory-text">{ticket.email}</strong>.
        </p>
        <p className="text-[11px] text-secondary mt-2 flex items-center justify-center gap-1.5">
          <span className="material-symbols-outlined text-sm">shopping_cart_off</span>
          ¿Querés ver otra función? Iniciá una nueva compra: esta operación cubre una sola función.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl text-left">
        <div className="rounded-xl border border-outline-border bg-surface-card p-4">
          <span className="text-[10px] uppercase tracking-wider text-ivory-muted">
            Código de compra
          </span>
          <p className="text-sm font-bold text-secondary font-mono mt-1">{ticket.code}</p>
          <p className="text-[11px] text-ivory-muted mt-2">Total abonado</p>
          <p className="text-sm font-bold text-ivory-text">{ticket.total}</p>
        </div>
        <div className="rounded-lg bg-white p-2 flex items-center justify-center col-span-1">
          <QrCanvas code={ticket.code} />
        </div>
        <div className="rounded-xl border border-outline-border bg-surface-card p-4">
          <span className="text-[10px] uppercase tracking-wider text-ivory-muted">Función</span>
          <p className="text-sm font-bold text-ivory-text mt-1">{ticket.funcion}</p>
          <p className="text-[11px] text-ivory-muted mt-0.5">{ticket.butacas}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <Link
          className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-secondary hover:bg-secondary-hover text-canvas-root text-xs font-extrabold uppercase tracking-wider transition-colors"
          to={`/compras/${ticket.id}`}
        >
          <span className="material-symbols-outlined text-lg">receipt_long</span>
          Ver detalle de la compra
        </Link>
        <Link
          className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border border-outline-border bg-surface-card hover:bg-surface-elevated text-xs font-bold uppercase tracking-wider transition-colors"
          to="/"
        >
          <span className="material-symbols-outlined text-lg text-secondary">theater_comedy</span>
          Volver a la cartelera
        </Link>
        <button
          type="button"
          onClick={onDownload}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border border-outline-border bg-surface-card hover:bg-surface-elevated text-xs font-bold uppercase tracking-wider transition-colors"
        >
          <span className="material-symbols-outlined text-lg text-secondary">download</span>
          Descargar comprobante
        </button>
      </div>
    </section>
  )
}
