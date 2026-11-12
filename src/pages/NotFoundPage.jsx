import { Link } from 'react-router-dom'
import useDocumentTitle from '../hooks/useDocumentTitle'

export default function NotFoundPage() {
  useDocumentTitle('Página no encontrada')
  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-8 py-20 flex flex-col items-center text-center page-enter">
      <span className="material-symbols-outlined text-5xl text-secondary">theater_comedy</span>
      <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.25em] text-secondary">
        Error 404
      </p>
      <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight">
        Esta función no está en cartelera
      </h1>
      <p className="mt-3 text-sm text-ivory-muted max-w-lg leading-relaxed">
        La página que buscás no existe o cambió de dirección. Volvé a la cartelera para elegir tu
        próxima obra, teatro y butaca.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link
          className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-secondary hover:bg-secondary-hover text-[#071510] text-xs font-extrabold uppercase tracking-wider transition-colors"
          to="/"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Volver a la cartelera
        </Link>
        <Link
          className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border border-[#1e4d3a] bg-[#0c211a] hover:border-secondary/60 text-xs font-bold uppercase tracking-wider transition-colors"
          to="/contacto"
        >
          <span className="material-symbols-outlined text-lg text-secondary">support_agent</span>
          Contactar soporte
        </Link>
      </div>
    </div>
  )
}
