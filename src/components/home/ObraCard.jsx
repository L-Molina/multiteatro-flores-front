import { Link } from 'react-router-dom'
import useCatalog from '../../hooks/useCatalog'

export default function ObraCard({ obra }) {
  const { funcionesDeObra, getSala, formatFecha, formatARS } = useCatalog()
  const funciones = funcionesDeObra(obra.id)
  const proxima = funciones[0]
  const sala = proxima ? getSala(proxima.salaId) : null
  const ultimas = funciones.some((funcion) => funcion.estado === 'Últimas')
  const horario = proxima
    ? `${formatFecha(proxima.fecha, { weekday: 'long' })} • ${proxima.hora} hs`
    : obra.schedule || 'Función a confirmar'

  return (
    <article className="obra-card group flex flex-col bg-[#0e241c] border border-[#1b4234] rounded-xl overflow-hidden shadow-lg hover:shadow-2xl hover:border-secondary/50 hover:-translate-y-1 transition-all duration-300">
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#071510]">
        <img
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          src={obra.img}
          alt={`Afiche de ${obra.titulo}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0e241c] via-transparent to-transparent" />
        <div className="absolute top-3 left-3 right-3 flex flex-wrap gap-1.5">
          <span className="px-2 py-0.5 rounded bg-[#071510]/80 backdrop-blur-md border border-[#1b4234] text-secondary text-[11px] font-bold uppercase tracking-wider">
            {obra.genero}
          </span>
          {ultimas ? (
            <span className="px-2 py-0.5 rounded bg-tertiary-btn text-white text-[11px] font-semibold">
              Últimas funciones
            </span>
          ) : null}
        </div>
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-on-surface">
          <span className="flex items-center gap-1 text-[11px] font-medium bg-[#071510]/80 border border-[#1b4234] px-2 py-1 rounded">
            <span className="material-symbols-outlined text-[0.95rem] text-secondary">
              domain
            </span>
            {sala ? sala.nombre : 'Sala a confirmar'}
          </span>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1 justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 text-secondary text-xs font-semibold">
            <span className="material-symbols-outlined text-[1rem]">calendar_today</span>
            <span>{horario}</span>
          </div>
          <h3 className="obra-title text-base font-bold text-white leading-tight">
            {obra.titulo}
          </h3>
          <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
            {obra.sinopsis}
          </p>
        </div>

        <div className="pt-2 flex flex-col gap-2.5 border-t border-[#1b4234]/60">
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-on-surface-variant">Platea desde</span>
            <span className="text-base text-secondary font-bold">
              {formatARS(obra.precio)}{' '}
              <span className="text-[10px] font-normal text-on-surface-variant">ARS</span>
            </span>
          </div>
          <Link
            to={`/checkout?obra=${obra.id}`}
            className="w-full py-2 px-3 rounded-lg bg-tertiary-btn hover:bg-tertiary-hover text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
          >
            <span className="material-symbols-outlined text-[1.1rem]">event_seat</span>
            Comprar Entradas
          </Link>
        </div>
      </div>
    </article>
  )
}
