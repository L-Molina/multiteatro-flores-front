import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import useCatalog from '../hooks/useCatalog'
import useAuth from '../hooks/useAuth'
import { CATEGORIAS } from '../data/catalogo'
import useDocumentTitle from '../hooks/useDocumentTitle'
import { MAX, emailValido, normalizarEmail, quitarControlChars } from '../utils/validacion'
import AboutSection from '../components/home/AboutSection'
import ObraCard from '../components/home/ObraCard'
import TrendCarousel from '../components/home/TrendCarousel'

export default function HomePage() {
  useDocumentTitle('Cartelera Oficial')
  const { obras } = useCatalog()
  const { user } = useAuth()
  const [params, setParams] = useSearchParams()
  const [email, setEmail] = useState('')
  const [newsletterError, setNewsletterError] = useState('')
  const [subscribedFor, setSubscribedFor] = useState(null)
  const subscribed = Boolean(user) && subscribedFor === user.email

  const categoria = params.get('categoria') || 'todos'
  const buscar = (params.get('buscar') || '').trim()

  const publicadas = useMemo(() => obras.filter((obra) => obra.publicada !== false), [obras])

  const counts = useMemo(() => {
    const base = { todos: publicadas.length, teatro: 0, standup: 0, conciertos: 0 }
    publicadas.forEach((obra) => {
      if (base[obra.categoria] != null) base[obra.categoria] += 1
    })
    return base
  }, [publicadas])

  const filtradas = useMemo(() => {
    const term = buscar.toLowerCase()
    return publicadas.filter((obra) => {
      const matchCategoria = categoria === 'todos' || obra.categoria === categoria
      const matchBuscar =
        !term ||
        `${obra.titulo} ${obra.genero} ${obra.elenco} ${obra.sinopsis}`
          .toLowerCase()
          .includes(term)
      return matchCategoria && matchBuscar
    })
  }, [publicadas, categoria, buscar])

  const cambiarCategoria = (key) => {
    const next = new URLSearchParams(params)
    if (key === 'todos') next.delete('categoria')
    else next.set('categoria', key)
    setParams(next, { replace: false })
  }

  const limpiarBusqueda = () => {
    const next = new URLSearchParams(params)
    next.delete('buscar')
    setParams(next)
  }

  const enviarNewsletter = (event) => {
    event.preventDefault()
    const value = normalizarEmail(email)
    if (!value) {
      setNewsletterError('Ingresá tu correo electrónico para suscribirte.')
      return
    }
    if (!emailValido(value)) {
      setNewsletterError('Ingresá un correo electrónico válido (ej.: nombre@dominio.com).')
      return
    }
    setNewsletterError('')
    setSubscribedFor(user?.email || '')
    setEmail('')
  }

  return (
    <div className="flex flex-col w-full">
      <TrendCarousel />

      <div className="w-full bg-[#0e241c] border-y border-[#1b4234] py-3 overflow-hidden whitespace-nowrap flex items-center gap-8 text-on-surface-variant text-xs font-medium uppercase tracking-wider">
        <div className="flex items-center gap-8 px-4">
          {[
            ['bg-secondary', '6 teatros asociados en la Ciudad de Buenos Aires'],
            ['bg-primary', '18 salas conectadas con disponibilidad en tiempo real'],
            ['bg-secondary', 'Butacas numeradas y plano real en cada compra'],
            ['bg-primary', 'Entrada digital con QR anti-fraude, sin imprimir nada'],
          ].map(([dot, text]) => (
            <span key={text} className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${dot}`} />
              {text}
            </span>
          ))}
        </div>
      </div>

      <section className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-16 scroll-mt-24" id="cartelera">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-5 bg-secondary rounded-full" />
              <span className="text-xs font-bold uppercase tracking-widest text-secondary">
                Programación Principal
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Las Obras De La Semana
            </h2>
            <p className="text-sm text-on-surface-variant max-w-xl">
              Seleccioná tu butaca numerada en tiempo real. Boletos directos a tu smartphone con
              código QR seguro.
            </p>
            <p className="flex items-start gap-1.5 text-xs text-secondary/90 max-w-xl">
              <span className="material-symbols-outlined text-base shrink-0">shopping_cart_off</span>
              Sin carrito: cada compra es para una sola función y permite hasta 6 butacas.
            </p>
            {buscar ? (
              <p className="text-xs text-secondary mt-1">
                Resultados para “{buscar}”.{' '}
                <button type="button" className="underline" onClick={limpiarBusqueda}>
                  Limpiar búsqueda
                </button>
              </p>
            ) : null}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1" role="group" aria-label="Filtrar cartelera por categoría">
            {CATEGORIAS.map((cat) => {
              const active = categoria === cat.key
              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => cambiarCategoria(cat.key)}
                  aria-pressed={active}
                  className={`whitespace-nowrap px-3.5 py-1.5 rounded-lg text-xs transition-colors ${
                    active
                      ? 'bg-secondary text-[#071510] font-bold shadow-sm'
                      : 'bg-[#0e241c] hover:bg-[#133025] border border-[#1b4234] text-on-surface font-medium'
                  }`}
                >
                  {cat.label} ({counts[cat.key]})
                </button>
              )
            })}
          </div>
        </div>

        {filtradas.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filtradas.map((obra) => (
              <ObraCard key={obra.id} obra={obra} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-[#1b4234] bg-[#0e241c] p-10 text-center">
            <span className="material-symbols-outlined text-4xl text-secondary">search_off</span>
            <p className="mt-3 text-sm font-bold text-white">No encontramos obras con ese filtro.</p>
            <p className="mt-1 text-xs text-on-surface-variant">
              Probá con otra categoría o limpiá la búsqueda.
            </p>
            <button
              type="button"
              onClick={() => {
                setParams({})
              }}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-secondary text-[#071510] text-xs font-extrabold uppercase tracking-wider"
            >
              Ver toda la cartelera
            </button>
          </div>
        )}

        <div className="mt-8 p-4 rounded-xl bg-[#0e241c] border border-[#1b4234] flex flex-col sm:flex-row items-center justify-between gap-3 text-on-surface-variant text-xs">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[1.25rem]">info</span>
            <span>
              ¿Buscás ubicaciones para personas con movilidad reducida o palcos preferenciales?
            </span>
          </div>
          <a
            className="text-secondary font-semibold hover:underline flex items-center gap-1"
            href="tel:01146319200"
          >
            Llamar a Boletería Directa →
          </a>
        </div>
      </section>

      <AboutSection />

      <section className="w-full bg-canvas-root border-t border-[#1b4234] py-16">
        <div className="max-w-4xl mx-auto px-4 lg:px-8 text-center flex flex-col items-center">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-secondary">
            Multiteatro Flores
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1 mb-2">
            Unite a la comunidad!
          </h2>
          <p className="text-sm text-on-surface-variant max-w-lg mb-6 leading-relaxed">
            Sumate a nuestro boletín semanal: recibí descuentos del 20%, acceso a ensayos abiertos y
            estrenos exclusivos antes del lanzamiento al público masivo.
          </p>
          {user ? (
            <>
              <form
                className="w-full max-w-md flex flex-col sm:flex-row gap-2"
                onSubmit={enviarNewsletter}
                noValidate
              >
                <label className="sr-only" htmlFor="newsletter-email">
                  Correo electrónico
                </label>
                <input
                  id="newsletter-email"
                  className={`flex-1 px-4 py-2.5 rounded-lg bg-[#0e241c] border text-xs text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:border-secondary ${
                    newsletterError ? 'form-error border-tertiary' : 'border-[#1b4234]'
                  }`}
                  placeholder="Tu correo electrónico..."
                  type="email"
                  maxLength={MAX.email}
                  autoComplete="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(quitarControlChars(event.target.value).slice(0, MAX.email))
                    setNewsletterError('')
                  }}
                  aria-describedby={newsletterError ? 'newsletter-error' : undefined}
                />
                <button
                  className={`px-5 py-2.5 rounded-lg text-xs font-bold tracking-wider uppercase transition-all shadow-md cursor-pointer whitespace-nowrap ${
                    subscribed
                      ? 'bg-primary text-[#071510]'
                      : 'bg-tertiary-btn hover:bg-tertiary-hover text-white'
                  }`}
                  type="submit"
                >
                  {subscribed ? '¡Registrado!' : 'Suscribirme'}
                </button>
              </form>
              {newsletterError ? (
                <p id="newsletter-error" className="field-error mt-2">
                  {newsletterError}
                </p>
              ) : null}
              {subscribed ? (
                <p className="text-xs text-primary mt-2" role="status">
                  ¡Gracias! Te vamos a escribir con las novedades de la temporada.
                </p>
              ) : null}
            </>
          ) : (
            <div className="w-full max-w-md rounded-xl border border-[#1b4234] bg-[#0e241c]/80 p-4 flex flex-col gap-3">
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Para suscribirte al boletín necesitás una cuenta. Creá tu usuario o iniciá sesión:
                es gratis y también te permite comprar entradas y ver tu historial.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Link
                  className="inline-flex flex-1 items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-secondary hover:bg-secondary-hover text-[#071510] text-xs font-extrabold uppercase tracking-wider transition-colors"
                  to="/register"
                >
                  <span className="material-symbols-outlined text-base">person_add</span>
                  Crear cuenta
                </Link>
                <Link
                  className="inline-flex flex-1 items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-[#1b4234] text-xs font-bold uppercase tracking-wider text-on-surface-variant hover:text-secondary hover:border-secondary/50 transition-colors"
                  to="/login"
                >
                  <span className="material-symbols-outlined text-base">login</span>
                  Iniciar sesión
                </Link>
              </div>
            </div>
          )}
          <span className="text-[11px] text-on-surface-variant mt-3 flex items-center gap-1">
            <span className="material-symbols-outlined text-[0.875rem]">lock</span>
            Respetamos tu privacidad. Sin spam.
          </span>
        </div>
      </section>
    </div>
  )
}
