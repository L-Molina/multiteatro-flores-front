import { Link } from 'react-router-dom'
import useCatalog from '../../../hooks/useCatalog'

export default function ResumenStep({
  obra,
  sala,
  funcion,
  tipo,
  seats,
  holder,
  payLabel,
  totals,
  acceptTerms,
  setAcceptTerms,
  termsError,
}) {
  const { formatARS, formatFecha } = useCatalog()
  const tipoLabel = tipo === 'vip' ? 'VIP' : 'Estándar'
  const unitPrice = tipo === 'vip' ? obra?.vip || 0 : obra?.precio || 0

  return (
    <section className="wizard-step rounded-xl border border-outline-border bg-surface-dark p-5 sm:p-6 flex flex-col gap-5" aria-label="Resumen y confirmación">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-secondary">fact_check</span>
        <h2 className="text-base font-bold">Revisá tu compra antes de pagar</h2>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between rounded-lg border border-outline-border bg-surface-card p-3 text-xs">
          <span className="text-ivory-muted">
            {totals.n} entrada(s) {tipoLabel} • {totals.n} x {formatARS(unitPrice)}
          </span>
          <span className="font-bold text-ivory-text">{formatARS(totals.subtotal)}</span>
        </div>
        <div className="flex items-center justify-between text-xs text-ivory-muted px-1">
          <span>Costo de servicio ({totals.n} x {formatARS(900)})</span>
          <span>{formatARS(totals.service)}</span>
        </div>
        {totals.discount ? (
          <div className="flex items-center justify-between text-xs text-primary px-1">
            <span>Descuento por transferencia</span>
            <span>-{formatARS(totals.discount)}</span>
          </div>
        ) : null}
        <div className="flex items-center justify-between border-t border-outline-border pt-3 mt-1">
          <span className="text-sm font-bold uppercase tracking-wide">Total</span>
          <span className="text-xl font-extrabold text-secondary">{formatARS(totals.total)}</span>
        </div>
      </div>

      <div className="rounded-lg border border-outline-border bg-surface-card p-4 text-xs text-ivory-muted flex flex-col gap-2">
        <p className="flex justify-between gap-4">
          <span>Obra</span>
          <strong className="text-ivory-text text-right">{obra?.titulo || '—'}</strong>
        </p>
        <p className="flex justify-between gap-4">
          <span>Teatro y sala</span>
          <strong className="text-ivory-text text-right">
            {sala ? `${sala.teatro} • ${sala.nombre}` : '—'}
          </strong>
        </p>
        <p className="flex justify-between gap-4">
          <span>Función</span>
          <strong className="text-ivory-text text-right">
            {funcion ? `${formatFecha(funcion.fecha)} • ${funcion.hora} hs` : '—'}
          </strong>
        </p>
        <p className="flex justify-between gap-4">
          <span>Tipo de entrada</span>
          <strong className="text-ivory-text text-right">
            {tipoLabel} — {formatARS(unitPrice)}
          </strong>
        </p>
        <p className="flex justify-between gap-4">
          <span>Butacas</span>
          <strong className="text-ivory-text text-right">
            {seats.length ? seats.map((seat) => seat.replace('-', ' ')).join(', ') : '—'}
          </strong>
        </p>
        <p className="flex justify-between gap-4">
          <span>Titular</span>
          <strong className="text-ivory-text text-right">
            {holder.nombre ? `${holder.nombre} • DNI ${holder.dni}` : '—'}
          </strong>
        </p>
        <p className="flex justify-between gap-4">
          <span>Medio de pago</span>
          <strong className="text-ivory-text text-right">{payLabel}</strong>
        </p>
      </div>

      <label className="flex items-start gap-2.5 text-xs text-ivory-muted cursor-pointer leading-relaxed">
        <input
          id="accept-terms"
          className="mt-0.5 shrink-0 accent-[#efbf69]"
          type="checkbox"
          checked={acceptTerms}
          onChange={(event) => setAcceptTerms(event.target.checked)}
          aria-invalid={Boolean(termsError)}
          aria-describedby={termsError ? 'terms-error' : undefined}
        />
        <span>
          Acepto los términos de compra, la política de puntualidad de sala y el canje digital del
          QR. Entiendo que esta es una simulación de prototipo. Tratamos tus datos según la{' '}
          <Link className="text-secondary hover:underline" to="/privacidad">
            política de privacidad
          </Link>
          .
        </span>
      </label>
      {termsError ? (
        <p
          id="terms-error"
          className="text-xs text-tertiary bg-tertiary-container/30 border border-tertiary/40 rounded-lg px-3 py-2"
          role="alert"
        >
          {termsError}
        </p>
      ) : null}
    </section>
  )
}
