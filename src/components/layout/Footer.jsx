import { Link } from 'react-router-dom'
import SocialLinks from './SocialLinks'

export default function Footer() {
  return (
    <footer className="w-full bg-[#050f0c] border-t border-[#1b4234] text-on-surface-variant mt-16">
      <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div className="flex flex-col gap-4">
            <Link to="/" className="h-10 w-32 overflow-hidden block">
              <img
                alt="Multiteatro Flores"
                className="h-full w-full object-contain object-left"
                src="/assets/logo-multiteatro-2.png"
              />
            </Link>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Plataforma digital que reúne la cartelera de teatros independientes de la Ciudad de
              Buenos Aires. Elegí obra, teatro, horario y butaca exacta, y recibí tu entrada QR sin
              imprimir nada.
            </p>
            <div className="flex items-center gap-2 text-secondary">
              <span className="material-symbols-outlined text-[1.1rem]">stars</span>
              <span className="text-[11px] font-bold uppercase tracking-wider">
                Temporada 2026 Declarada de Interés Cultural
              </span>
            </div>
            <SocialLinks />
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-sm font-bold text-white">Atención digital</span>
            <a className="flex items-start gap-2 text-xs hover:text-secondary transition-colors" href="mailto:hola@multiteatroflores.com">
              <span className="material-symbols-outlined text-secondary text-[1rem] mt-0.5">mail</span>
              <span>hola@multiteatroflores.com</span>
            </a>
            <div className="flex items-start gap-2 text-xs">
              <span className="material-symbols-outlined text-secondary text-[1rem] mt-0.5">schedule</span>
              <span>Lunes a domingos de 10:00 a 22:00 hs.</span>
            </div>
            <div className="flex items-start gap-2 text-xs">
              <span className="material-symbols-outlined text-secondary text-[1rem] mt-0.5">call</span>
              <span>(011) 4631-9200 • WhatsApp +54 9 11 5842-9912</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-sm font-bold text-white">Medios de Pago y Promos</span>
            <p className="text-xs text-on-surface-variant">
              Aceptamos todas las tarjetas a través de nuestro checkout digital:
            </p>
            <div className="flex flex-wrap gap-1.5 text-xs text-white">
              {['Mercado Pago', '3 y 6 Cuotas', 'Visa / Mastercard', 'Banco Ciudad 20% OFF'].map(
                (item) => (
                  <span key={item} className="px-2 py-1 rounded border border-[#1b4234]">
                    {item}
                  </span>
                ),
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-sm font-bold text-white">Navegación y Legales</span>
            <ul className="flex flex-col gap-1.5 text-xs">
              {[
                ['Cartelera General', '/#cartelera'],
                ['Obras de Teatro', '/?categoria=teatro#cartelera'],
                ['Ciclo Stand-Up', '/?categoria=standup#cartelera'],
                ['Recitales y Conciertos', '/?categoria=conciertos#cartelera'],
                ['Preguntas frecuentes', '/preguntas-frecuentes'],
                ['Quiénes somos', '/quienes-somos'],
                ['Política de privacidad', '/privacidad'],
              ].map(([label, to]) => (
                <li key={label} className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[0.875rem] text-secondary">
                    chevron_right
                  </span>
                  <Link className="inline-flex items-center min-h-[24px] py-1 hover:text-secondary transition-colors" to={to}>
                    {label}
                  </Link>
                </li>
              ))}
              <li className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[0.875rem] text-secondary">
                  chevron_right
                </span>
                <Link className="inline-flex items-center min-h-[24px] py-1 hover:text-secondary transition-colors" to="/login">
                  Iniciar sesión
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-[#1b4234] flex flex-col sm:flex-row items-center justify-between gap-4 text-on-surface-variant text-xs">
          <p>
            © 2026 Multiteatro Flores • Plataforma digital de teatro. Todos los derechos
            reservados. CABA, República Argentina.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[1rem] text-secondary">
                verified_user
              </span>
              Compra Segura SSL
            </span>
            <span>Defensa de las y los Consumidores CABA</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
