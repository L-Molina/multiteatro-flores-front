import { Link } from 'react-router-dom'
import SocialLinks from '../layout/SocialLinks'

const CARDS = [
  ['devices', '100% digital', 'Reservá desde el celular, la computadora o la tablet. Sin llamados, sin filas y sin horarios de boletería.'],
  ['theater_comedy', 'Cartelera curada', 'Teatro clásico, stand-up, conciertos acústicos y teatro de cámara seleccionados por nuestro equipo en cada temporada.'],
  ['handshake', 'Salas asociadas', 'Cada teatro administra su cartelera, sus funciones y su aforo. Nosotros ponemos la tecnología para que el público llegue a la butaca.'],
]

const CRITICAS = [
  ['“La primera plataforma de la Ciudad que trata al teatro independiente con la seriedad de un gran circuito.”', 'Revista Escena Sur'],
  ['“Compré dos localidades un domingo a la noche en menos de tres minutos, desde el colectivo.”', 'Suplemento Cultura • La Voz del Barrio'],
  ['“Un puente real entre las salas de la Ciudad y el público, sin perder la calidez del teatro.”', 'Portal Teatro Abierto'],
]

export default function AboutSection() {
  return (
    <section className="w-full bg-canvas-root border-t border-[#1b4234] py-16" id="quienes-somos">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 flex flex-col gap-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="w-2 h-5 bg-secondary rounded-full" />
              <span className="text-xs font-bold uppercase tracking-widest text-secondary">
                Quiénes somos
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-2">
              Multiteatro Flores
            </h2>
            <p className="text-sm text-on-surface-variant leading-relaxed mt-3">
              Somos una plataforma digital que reúne la cartelera de teatros independientes de
              la Ciudad de Buenos Aires: Teatro de Las Nobles Bestias, Otromundo, Horizonte,
              Mandorla, Teatro en la Bruma y Teatro Urbano. Elegí obra, teatro, horario y butaca exacta en un solo flujo. 
              Pagás online y recibís el QR en el celular.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {CARDS.map(([icon, title, text]) => (
            <article
              key={title}
              className="about-card rounded-xl border border-[#1b4234] bg-[#0c211a] p-5 flex flex-col gap-3"
            >
              <div className="flex items-center gap-2 text-secondary">
                <span className="material-symbols-outlined text-xl">{icon}</span>
                <span className="text-[11px] font-bold uppercase tracking-wider">{title}</span>
              </div>
              <p className="text-sm text-on-surface-variant leading-relaxed">{text}</p>
            </article>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="rounded-xl border border-[#1b4234] bg-[#0e241c] p-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">format_quote</span>
                Opiniones de críticos
              </h3>
            </div>
            <div className="flex flex-col gap-4">
              {CRITICAS.map(([quote, author]) => (
                <blockquote key={author} className="border-l-2 border-secondary pl-4">
                  <p className="text-sm text-white leading-relaxed">{quote}</p>
                  <footer className="text-[11px] font-bold uppercase tracking-wider text-secondary mt-1.5">
                    {author}
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-base font-bold text-white mb-2">Nuestras Redes</h3>
            <SocialLinks size="lg" className="mb-2 -ml-2" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                ['help', 'Preguntas Frecuentes', '/preguntas-frecuentes'],
                ['support_agent', 'Contactanos', '/contacto'],
                ['history_edu', 'Conoce Más', '/quienes-somos'],
              ].map(([icon, label, to]) => (
                <Link
                  key={label}
                  className="about-card rounded-xl border border-[#1b4234] bg-[#0c211a] p-4 flex flex-col gap-2 hover:bg-[#112c22]"
                  to={to}
                >
                  <span className="material-symbols-outlined text-secondary text-2xl">{icon}</span>
                  <span className="text-xs font-bold text-white">{label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
