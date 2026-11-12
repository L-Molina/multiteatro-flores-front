import { Link, useParams } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import useCatalog from '../hooks/useCatalog'
import useDocumentTitle from '../hooks/useDocumentTitle'
import useToast from '../hooks/useToast'
import QrCanvas from '../components/checkout/QrCanvas'
import Toast from '../components/ui/Toast'

const ESTADO_CLASS = {
  Confirmada: 'bg-primary-container text-primary border border-primary/30',
  Usada: 'bg-surface-dark border border-panel-border text-on-surface-muted',
  Cancelada: 'bg-tertiary-container text-tertiary border border-tertiary/30',
}

function fechaCompra(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function Dato({ label, children }) {
  return (
    <p className="flex justify-between gap-4 text-xs">
      <span className="text-on-surface-muted shrink-0">{label}</span>
      <strong className="text-on-surface text-right break-words">{children}</strong>
    </p>
  )
}

export default function CompraDetallePage() {
  const { compraId } = useParams()
  const { user } = useAuth()
  const { getCompra, formatARS, formatFecha } = useCatalog()
  const compraEncontrada = getCompra(compraId)
  const compra =
    compraEncontrada && compraEncontrada.usuarioEmail === user?.email
      ? compraEncontrada
      : null
  useDocumentTitle(compra ? `Compra ${compra.codigo}` : 'Compra no encontrada')
  const { message, tone, showToast } = useToast()

  if (!compra) {
    return (
      <div className="w-full max-w-3xl mx-auto px-4 sm:px-8 py-20 flex flex-col items-center text-center page-enter">
        <span className="material-symbols-outlined text-5xl text-secondary">receipt_long</span>
        <h1 className="mt-4 text-2xl sm:text-3xl font-extrabold tracking-tight">
          No encontramos esa compra
        </h1>
        <p className="mt-3 text-sm text-ivory-muted max-w-lg leading-relaxed">
          El código puede estar incompleto o la compra ya no está disponible en esta sesión.
        </p>
        <Link
          className="mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-secondary hover:bg-secondary-hover text-[#071510] text-xs font-extrabold uppercase tracking-wider transition-colors"
          to="/compras"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Volver a mis compras
        </Link>
      </div>
    )
  }

  const cantidad = compra.butacas.length

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-8 py-10 flex flex-col gap-6 page-enter">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-ivory-muted hover:text-secondary transition-colors"
          to="/compras"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Volver a mis compras
        </Link>
        <span
          className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
            ESTADO_CLASS[compra.estado] || ESTADO_CLASS.Confirmada
          }`}
        >
          {compra.estado}
        </span>
      </div>

      <header className="flex flex-col gap-1.5">
        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-secondary">
          Entrada digital
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-on-surface">
          Detalle de tu compra
        </h1>
        <p className="text-sm text-on-surface-muted">
          Código <strong className="text-on-surface font-mono">{compra.codigo}</strong> • Compra
          realizada el {fechaCompra(compra.creada)}
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 flex flex-col gap-5">
          <section className="rounded-xl border border-panel-border bg-surface-card p-5 flex flex-col sm:flex-row gap-5">
            <img
              className="w-full sm:w-32 h-44 sm:h-40 object-cover rounded-lg border border-panel-border shrink-0"
              src={compra.obraImg}
              alt={`Afiche de ${compra.obraTitulo}`}
            />
            <div className="flex flex-col gap-2 min-w-0">
              <span className="inline-flex w-fit px-2 py-0.5 rounded bg-surface-dark border border-panel-border text-secondary text-[10px] font-bold uppercase tracking-wider">
                {compra.genero}
              </span>
              <h2 className="text-xl font-extrabold text-on-surface">{compra.obraTitulo}</h2>
              <p className="text-sm font-semibold text-secondary">
                {formatFecha(compra.fechaFuncion)} • {compra.horaFuncion} hs
              </p>
              <p className="text-xs text-on-surface-muted">
                {compra.duracion} minutos • Entrada {compra.tipoLabel}
              </p>
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="rounded-lg border border-panel-border bg-surface-dark px-3 py-2">
                  <span className="block text-[10px] uppercase tracking-wider text-on-surface-muted font-bold">
                    Teatro
                  </span>
                  <span className="block text-on-surface mt-0.5">{compra.teatro}</span>
                  <span className="block text-on-surface-muted">{compra.salaNombre}</span>
                </div>
                <div className="rounded-lg border border-panel-border bg-surface-dark px-3 py-2">
                  <span className="block text-[10px] uppercase tracking-wider text-on-surface-muted font-bold">
                    Dirección
                  </span>
                  <span className="block text-on-surface mt-0.5">{compra.direccion}</span>
                  <span className="block text-on-surface-muted">{compra.localidad}</span>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-panel-border bg-surface-card p-5 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">event_seat</span>
              <h2 className="text-sm font-bold text-on-surface">Ubicaciones asignadas</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {compra.butacas.map((butaca) => (
                <span
                  key={butaca}
                  className="inline-flex items-center gap-2 rounded-lg border border-secondary/40 bg-secondary/10 px-3 py-2 text-xs font-bold text-secondary"
                >
                  <span className="material-symbols-outlined text-base">chair</span>
                  Butaca {butaca.replace('-', ' • N° ')}
                </span>
              ))}
            </div>
            <p className="text-[11px] text-on-surface-muted leading-relaxed">
              {cantidad} {cantidad === 1 ? 'entrada' : 'entradas'} de tipo {compra.tipoLabel}. Las
              butacas son numeradas y quedan reservadas a nombre del titular.
            </p>
          </section>

          <section className="rounded-xl border border-panel-border bg-surface-card p-5 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">badge</span>
              <h2 className="text-sm font-bold text-on-surface">Datos del titular</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
              <Dato label="Nombre y apellido">{compra.titular.nombre}</Dato>
              <Dato label="DNI">{compra.titular.dni}</Dato>
              <Dato label="Correo">{compra.titular.email}</Dato>
              <Dato label="Teléfono">{compra.titular.tel}</Dato>
              <Dato label="Localidad">{compra.titular.localidad}</Dato>
              <Dato label="Medio de pago">{compra.pagoLabel}</Dato>
            </div>
            <p className="text-[11px] text-on-surface-muted leading-relaxed">
              Los datos del titular deben coincidir con el documento que se presentará en la puerta
              si el personal de sala lo solicita. El QR se envía al correo indicado.
            </p>
          </section>
        </div>

        <aside className="lg:col-span-4 flex flex-col gap-4 lg:sticky lg:top-24">
          <section className="rounded-xl border border-primary/40 bg-surface-dark p-5 flex flex-col items-center text-center gap-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-secondary">
              Tu entrada digital
            </span>
            <div className="rounded-xl bg-white p-3">
              <QrCanvas code={compra.codigo} size={168} />
            </div>
            <p className="font-mono text-sm font-bold text-on-surface">{compra.codigo}</p>
            <p className="text-[11px] text-on-surface-muted leading-relaxed">
              Presentá este QR desde el celular al ingresar. Se valida una sola vez y no es
              necesario imprimirlo.
            </p>
          </section>

          <section className="rounded-xl border border-panel-border bg-surface-card p-5 flex flex-col gap-2.5 text-xs text-on-surface-muted">
            <h2 className="text-sm font-bold text-on-surface mb-1">Resumen de pago</h2>
            <div className="flex justify-between gap-4">
              <span>
                Entradas ({cantidad} x {formatARS(compra.unitPrice || 0)})
              </span>
              <span className="text-on-surface font-semibold">{formatARS(compra.subtotal)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span>Costo de servicio</span>
              <span className="text-on-surface font-semibold">{formatARS(compra.servicio)}</span>
            </div>
            {compra.descuento > 0 ? (
              <div className="flex justify-between gap-4 text-primary">
                <span>Descuento transferencia (-5%)</span>
                <span className="font-semibold">-{formatARS(compra.descuento)}</span>
              </div>
            ) : null}
            <div className="h-px bg-panel-border my-1" />
            <div className="flex justify-between items-baseline gap-4">
              <span className="text-sm font-bold uppercase tracking-wide text-on-surface">
                Total abonado
              </span>
              <span className="text-xl font-extrabold text-secondary">
                {formatARS(compra.total)}
              </span>
            </div>
          </section>

          <button
            type="button"
            onClick={() =>
              showToast(
                'Comprobante simulado generado. En la versión final se descarga el PDF con el QR.',
              )
            }
            className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-panel-border bg-surface-card hover:bg-surface-elevated text-xs font-bold uppercase tracking-wider transition-colors"
          >
            <span className="material-symbols-outlined text-base text-secondary">download</span>
            Descargar comprobante
          </button>
          <Link
            className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-secondary hover:bg-secondary-hover text-[#071510] text-xs font-extrabold uppercase tracking-wider transition-colors"
            to={`/checkout?obra=${compra.obraId}`}
          >
            <span className="material-symbols-outlined text-base">confirmation_number</span>
            Comprar otra función
          </Link>
        </aside>
      </div>

      <Toast message={message} tone={tone} />
    </div>
  )
}
