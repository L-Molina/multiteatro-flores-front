import { Link, useParams } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import useCatalog from '../hooks/useCatalog'
import useDocumentTitle from '../hooks/useDocumentTitle'

const ESTADO_CLASS = {
  'En Venta': 'bg-primary-container text-primary border border-primary/40',
  Últimas: 'bg-tertiary-btn text-white',
  Agotada: 'bg-[#3a1610] text-[#ffb4a4] border border-[#761200]',
  'En Curso': 'bg-secondary text-[#071510]',
}

export default function ObraDetallePage() {
  const { obraId } = useParams()
  const { user } = useAuth()
  const { getObra, funcionesDeObra, getSala, formatARS, formatFecha } = useCatalog()
  const obra = getObra(obraId)
  useDocumentTitle(obra ? obra.titulo : 'Obra no encontrada')

  if (!obra) {
    return (
      <div className="w-full max-w-3xl mx-auto px-4 sm:px-8 py-20 flex flex-col items-center text-center page-enter">
        <span className="material-symbols-outlined text-5xl text-secondary">theater_comedy</span>
        <h1 className="mt-4 text-2xl sm:text-3xl font-extrabold tracking-tight">
          Esa obra no está en cartelera
        </h1>
        <p className="mt-3 text-sm text-ivory-muted max-w-lg leading-relaxed">
          Puede que haya terminado su temporada o que el enlace esté incompleto. Volvé a la
          cartelera para elegir otra función.
        </p>
        <Link
          className="mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-secondary hover:bg-secondary-hover text-[#071510] text-xs font-extrabold uppercase tracking-wider transition-colors"
          to="/#cartelera"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Volver a la cartelera
        </Link>
      </div>
    )
  }

  const funciones = funcionesDeObra(obra.id)
  const checkoutDestino = `/checkout?obra=${obra.id}`
  const compraDestino = user
    ? checkoutDestino
    : `/login?next=${encodeURIComponent(checkoutDestino)}`

  return (
    <div className="flex flex-col w-full">
      <section className="relative overflow-hidden border-b border-[#1b4234] bg-[#0e241c]">
        <div className="absolute inset-0">
          <img className="w-full h-full object-cover opacity-20" src={obra.img} alt="" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#071510] via-[#071510]/92 to-[#071510]/60" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-8 py-10 lg:py-14">
          <Link
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-ivory-muted hover:text-secondary transition-colors"
            to="/#cartelera"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            Volver a la cartelera
          </Link>

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 lg:gap-12 items-start">
            <img
              className="w-full max-w-[280px] aspect-[3/4] object-cover rounded-xl border border-[#1e4d3a] shadow-2xl"
              src={obra.img}
              alt={`Afiche de ${obra.titulo}`}
            />

            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex rounded-full bg-secondary text-[#071510] px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wider">
                  {obra.genero.split('•')[0].trim()}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#071510]/80 border border-[#1b4234] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-ivory-muted">
                  <span className="material-symbols-outlined text-[0.95rem] text-secondary">
                    schedule
                  </span>
                  {obra.duracion} min
                </span>
                {obra.preventa ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#071510]/80 border border-[#1b4234] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-primary">
                    <span className="material-symbols-outlined text-[0.95rem]">
                      local_activity
                    </span>
                    Preventa activa
                  </span>
                ) : null}
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-[1.05]">
                {obra.titulo}
              </h1>

              <p className="text-sm sm:text-base text-ivory-muted leading-relaxed max-w-2xl">
                {obra.sinopsis}
              </p>

              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl text-sm">
                <div className="rounded-lg border border-[#1b4234] bg-[#071510]/70 px-4 py-3">
                  <dt className="text-[11px] uppercase tracking-wider text-ivory-muted font-bold">
                    Elenco / Dirección
                  </dt>
                  <dd className="text-ivory-text mt-1">{obra.elenco || 'A confirmar'}</dd>
                </div>
                <div className="rounded-lg border border-[#1b4234] bg-[#071510]/70 px-4 py-3">
                  <dt className="text-[11px] uppercase tracking-wider text-ivory-muted font-bold">
                    Días y horarios
                  </dt>
                  <dd className="text-ivory-text mt-1">{obra.schedule || 'Función a confirmar'}</dd>
                </div>
              </dl>

              <div className="flex flex-wrap items-end gap-x-6 gap-y-4 pt-2">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-ivory-muted font-bold">
                    Platea desde
                  </span>
                  <p className="text-2xl font-extrabold text-secondary">
                    {formatARS(obra.precio)}{' '}
                    <span className="text-xs font-normal text-ivory-muted">ARS</span>
                  </p>
                  <p className="text-[11px] text-ivory-muted">
                    VIP desde {formatARS(obra.vip)} ARS
                  </p>
                </div>
                <Link
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-secondary hover:bg-secondary-hover text-[#071510] text-xs sm:text-sm font-extrabold uppercase tracking-wider transition-colors shadow-lg"
                  to={compraDestino}
                >
                  <span className="material-symbols-outlined text-lg">
                    {user ? 'confirmation_number' : 'login'}
                  </span>
                  {user ? 'Comprar entradas' : 'Ingresar para comprar'}
                </Link>
              </div>

              <p className="text-[11px] text-ivory-muted flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base text-secondary">
                  shopping_cart_off
                </span>
                Sin carrito: cada compra es para una única función y permite hasta 6 butacas.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-secondary">
              Programación
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mt-1">
              Próximas funciones
            </h2>
          </div>
          <p className="text-xs text-ivory-muted">
            {funciones.length} {funciones.length === 1 ? 'función disponible' : 'funciones disponibles'}
          </p>
        </div>

        {funciones.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {funciones.map((funcion) => {
              const sala = getSala(funcion.salaId)
              const estadoClass = ESTADO_CLASS[funcion.estado] || ESTADO_CLASS['En Venta']
              return (
                <article
                  key={funcion.id}
                  className="rounded-xl border border-[#1b4234] bg-[#0c211a] p-5 flex flex-col gap-3 justify-between"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-white">
                        {formatFecha(funcion.fecha)}
                      </p>
                      <p className="text-xs text-secondary font-semibold mt-0.5">
                        {funcion.hora} hs • {funcion.duracion} min
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${estadoClass}`}
                    >
                      {funcion.estado}
                    </span>
                  </div>

                  <div className="text-xs text-ivory-muted flex items-start gap-1.5">
                    <span className="material-symbols-outlined text-base text-secondary">
                      location_on
                    </span>
                    <span>
                      <span className="block text-ivory-text font-semibold">{sala?.teatro}</span>
                      {sala?.nombre}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-1 border-t border-[#1b4234]/70">
                    <span className="text-sm font-bold text-secondary">
                      {formatARS(funcion.precio)}{' '}
                      <span className="text-[10px] font-normal text-ivory-muted">ARS</span>
                    </span>
                    <Link
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#761200] hover:bg-[#8f1a05] border border-[#ffb4a4]/20 px-3.5 py-2 text-[11px] font-bold uppercase tracking-wider text-[#ffb4a4] transition-colors"
                      to={compraDestino}
                    >
                      {user ? 'Comprar' : 'Ingresar'}
                      <span className="material-symbols-outlined text-base">arrow_forward</span>
                    </Link>
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-[#1b4234] bg-[#0e241c] p-10 text-center">
            <span className="material-symbols-outlined text-4xl text-secondary">
              event_busy
            </span>
            <p className="mt-3 text-sm font-bold text-white">
              No hay funciones programadas por ahora.
            </p>
            <p className="mt-1 text-xs text-ivory-muted">
              Escribinos desde la página de contacto para consultar la próxima temporada.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}
