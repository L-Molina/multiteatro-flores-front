import { Link } from 'react-router-dom'
import SocialLinks from '../components/layout/SocialLinks'
import useDocumentTitle from '../hooks/useDocumentTitle'

const PILARES = [
  {
    icon: 'devices',
    title: '100% digital',
    text: 'Sin filas ni boletería: elegí función, butaca y pagá desde el celular en pocos minutos.',
  },
  {
    icon: 'event_seat',
    title: 'Elegí tu butaca',
    text: 'Cada sala publica su plano real y su disponibilidad en tiempo real.',
  }
]

const GALERIA = [
  { src: '/assets/obras/LA-FUNCION-QUE-SALE-MAL.jpg', alt: 'La Función Que Sale Mal en escena' },
  { src: '/assets/obras/turco-naim.webp', alt: 'Turco Naim, stand-up' },
  { src: '/assets/obras/barrio-privado.webp', alt: 'Barrio Privado en escena' },
  { src: '/assets/obras/Jammin-2.jpeg', alt: 'Jammin en vivo' },
]

const CRITICAS = [
  [
    '“La primera plataforma de la Ciudad que trata al teatro independiente con la seriedad de un gran circuito. El mapa de butacas es un lujo.”',
    'Revista Escena Sur',
  ],
  [
    '“Compré dos localidades para un domingo a la noche en menos de tres minutos, desde el colectivo. Eso antes era impensable.”',
    'Suplemento Cultura / La Voz del Barrio',
  ],
  [
    '“Un puente real entre los teatros de la Ciudad y el público. La digitalización no le quitó calidez a la experiencia.”',
    'Portal Teatro Abierto',
  ],
]

export default function QuienesSomosPage() {
  useDocumentTitle('Quiénes Somos')
  return (
    <div className="flex flex-col w-full">
      <section className="relative overflow-hidden border-b border-[#1b4234] bg-[#0e241c]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-14 lg:py-20 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center page-enter">
          <div className="flex flex-col gap-5">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-secondary">
              Nuestra historia
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-[1.1]">
              Una plataforma digital con <span className="text-secondary">alma de teatro</span>
            </h1>
            <p className="text-sm sm:text-base text-ivory-muted leading-relaxed max-w-xl">
              Multiteatro Flores nació para que el teatro independiente de la Ciudad de Buenos Aires
              deje de depender de una boletería física y de un mapa de butacas dibujado a mano.
              Somos una plataforma digital que conecta obras, salas y públicos de toda la ciudad.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <Link
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-secondary hover:bg-secondary-hover text-[#071510] text-xs font-extrabold uppercase tracking-wider transition-colors"
                to="/#cartelera"
              >
                <span className="material-symbols-outlined text-lg">theater_comedy</span>
                Ver cartelera
              </Link>
              <Link
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-[#0c211a] border border-[#1e4d3a] hover:border-secondary/60 text-xs font-bold uppercase tracking-wider transition-colors"
                to="/contacto"
              >
                <span className="material-symbols-outlined text-lg text-secondary">mail</span>
                Contactarnos
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {GALERIA.map((foto, index) => (
              <img
                key={foto.src}
                className={`w-full h-44 sm:h-56 object-cover rounded-xl border border-[#1e4d3a] ${
                  index % 2 === 1 ? 'mt-6' : ''
                }`}
                src={foto.src}
                alt={foto.alt}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-14 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {PILARES.map((pilar) => (
          <article
            key={pilar.title}
            className="about-card rounded-xl border border-[#1b4234] bg-[#0c211a] p-6 flex flex-col gap-2"
          >
            <span className="material-symbols-outlined text-2xl text-secondary">{pilar.icon}</span>
            <h2 className="text-base font-bold">{pilar.title}</h2>
            <p className="text-xs text-ivory-muted leading-relaxed">{pilar.text}</p>
          </article>
        ))}
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-8 pb-14">
        <div className="rounded-2xl border border-[#1b4234] bg-[#0e241c] p-6 sm:p-10">
          <div className="max-w-3xl">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-secondary">
              Nuestra Historia
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold mt-2 mb-5">
              De un cuaderno de boletería a una red de teatros
            </h2>
            <div className="flex flex-col gap-4 text-sm text-ivory-muted leading-relaxed">
              <p>
                En 1987, la familia Ferreyra abrió un galpón de chapa sobre Rivadavia al 6800 con
                cuarenta sillas prestadas por un cine de barrio. La primera temporada tuvo una sola
                obra, <em>El jardín de los cerezos</em>, y un cuaderno rayado donde se anotaban las
                reservas a lápiz. El público de Flores llegaba caminando; el de otros barrios, en
                subte y colectivo.
              </p>
              <p>
                Diez años después, el galpón ya era una sala con butacas de terciopelo restauradas
                y una acústica que los vecinos comparaban con la de los teatros de la calle
                Corrientes. En 2004 se sumó una segunda sala, pensada para recitales de cámara, y en
                2012 una tercera, con un escenario reversible que permitió abrir el ciclo de stand-up
                más popular de la zona.
              </p>
              <p>
                La pandemia de 2020 obligó a cerrar las puertas durante once meses. En ese tiempo,
                el equipo de boletería —tres personas y una planilla de cálculo— empezó a transmitir
                funciones por streaming y a tomar reservas por WhatsApp. La experiencia dejó una
                certeza: el teatro no se detiene, pero la forma de venderlo tenía que cambiar.
              </p>
              <p>
                En 2023 nació <strong className="text-ivory-text">Multiteatro Flores</strong> como
                plataforma digital independiente. La idea fue simple y ambiciosa a la vez: reunir en
                un solo lugar la cartelera de teatros independientes de la Ciudad de Buenos Aires,
                con un mapa de butacas real, pago online y entradas digitales. Hoy la red reúne seis
                teatros, dieciocho salas y cuatrocientas cincuenta butacas activas.
              </p>
              <p>
                No tenemos una sede física propia ni vendemos entradas en una ventanilla: somos una
                plataforma que trabaja codo a codo con cada teatro. Cada sala administra su propia
                cartelera, sus funciones y su aforo; nosotros ponemos la tecnología para que el
                público llegue a la butaca sin fricción. Esa es nuestra forma de defender el teatro
                independiente: hacerlo más fácil de encontrar, de elegir y de disfrutar.
              </p>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              ['6', 'Teatros asociados'],
              ['18', 'Salas conectadas'],
              ['+450', 'Butacas disponibles'],
            ].map(([value, label]) => (
              <div key={label} className="rounded-xl border border-[#1b4234] bg-[#071510] p-5">
                <p className="text-3xl font-extrabold text-secondary">{value}</p>
                <p className="text-xs uppercase tracking-wider text-ivory-muted mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          <div className="rounded-2xl border border-[#1b4234] bg-[#0c211a] p-6 sm:p-8">
            <h2 className="text-xl font-bold mb-2">Lo que dice la crítica</h2>
            <p className="text-xs text-ivory-muted mb-5">
              Opiniones de medios y periodistas culturales sobre la plataforma.
            </p>
            <div className="flex flex-col gap-4">
              {CRITICAS.map(([quote, author]) => (
                <blockquote key={author} className="border-l-2 border-secondary pl-4">
                  <p className="text-sm text-ivory-text leading-relaxed">{quote}</p>
                  <footer className="text-[11px] text-secondary font-bold uppercase tracking-wider mt-2">
                    {author}
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-[#1b4234] bg-[#0e241c] p-6 sm:p-8 flex flex-col gap-5">
            <div>
              <h2 className="text-xl font-bold mb-2">Seguinos y conocé más</h2>
              <p className="text-xs text-ivory-muted leading-relaxed">
                Novedades de cartelera, preventas y detrás de escena en nuestras redes. También podés
                escribirnos o resolver tus dudas antes de comprar.
              </p>
            </div>
            <SocialLinks />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {[
                ['help', 'Preguntas Frecuentes', '/preguntas-frecuentes'],
                ['support_agent', 'Contacto', '/contacto'],
                ['history_edu', 'Quiénes Somos', '/quienes-somos'],
              ].map(([icon, label, to]) => (
                <Link
                  key={label}
                  className="flex flex-col items-center gap-2 rounded-xl border border-[#1b4234] bg-[#071510] hover:border-secondary/60 p-4 text-center transition-colors"
                  to={to}
                >
                  <span className="material-symbols-outlined text-2xl text-secondary">{icon}</span>
                  <span className="text-xs font-bold">{label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
