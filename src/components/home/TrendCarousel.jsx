import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import useCatalog from '../../hooks/useCatalog'

const AUTOPLAY_MS = 6500

export default function TrendCarousel() {
  const { obras } = useCatalog()
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const playing = true

  const lista = useMemo(() => {
    const publicadas = obras.filter((obra) => obra.publicada !== false)
    const destacadas = publicadas.filter((obra) => obra.destacada)
    const resto = publicadas.filter((obra) => !obra.destacada)
    return destacadas.concat(resto).slice(0, 6)
  }, [obras])

  useEffect(() => {
    if (!playing || paused || lista.length < 2) return undefined
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (media.matches) return undefined
    const timer = window.setInterval(() => {
      setActive((prev) => (prev + 1) % lista.length)
    }, AUTOPLAY_MS)
    return () => window.clearInterval(timer)
  }, [playing, paused, lista.length])

  if (!lista.length) return null

  const safeActive = Math.min(active, lista.length - 1)
  const obra = lista[safeActive]
  const go = (dir) => setActive((prev) => (prev + dir + lista.length) % lista.length)

  return (
    <section
      id="tendencias"
      className="relative w-full h-[calc(100svh-5rem)] min-h-[540px] overflow-hidden bg-canvas-root"
      aria-roledescription="carrusel"
      aria-label="Obras destacadas en tendencia"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div key={obra.id} className="hero-slide absolute inset-0">
        <img
          className="absolute inset-0 w-full h-full object-cover object-center"
          src={obra.img}
          alt=""
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#071510] via-[#071510]/30 to-[#071510]/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#071510] via-[#071510]/5 to-[#071510]/35" />
      </div>

      <h1 className="sr-only">
        Multiteatro Flores — cartelera de teatro, stand-up y conciertos en la Ciudad de Buenos Aires
      </h1>

      <div className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-8 flex flex-col justify-end pb-8 sm:pb-12">
        <div className="max-w-3xl flex flex-col items-start gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#071510]/85 backdrop-blur border border-[#1b4234] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-secondary">
              <span className="material-symbols-outlined text-[0.95rem]">
                local_fire_department
              </span>
              #{safeActive + 1} en tendencia
            </span>
            <span className="inline-flex rounded-full bg-secondary text-[#071510] px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wider">
              {obra.genero.split('•')[0].trim()}
            </span>
          </div>

          <h2
            className="text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-extrabold tracking-tight leading-[0.95] text-white drop-shadow-2xl"
          >
            {obra.titulo}
          </h2>

          <Link
            className="mt-2 inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-secondary hover:bg-secondary-hover text-[#071510] text-xs sm:text-sm font-extrabold uppercase tracking-wider transition-colors shadow-xl"
            to={`/obras/${obra.id}`}
          >
            Ver más
            <span className="material-symbols-outlined text-lg">arrow_forward</span>
          </Link>
        </div>

        <div className="mt-8 sm:mt-10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 sm:gap-2" role="group" aria-label="Elegir obra destacada">
            {lista.map((item, index) => (
              <button
                key={item.id}
                type="button"
                className={`trend-dot ${index === safeActive ? 'is-active' : ''}`}
                aria-label={`Ver ${item.titulo} (${index + 1} de ${lista.length})`}
                aria-current={index === safeActive ? 'true' : undefined}
                onClick={() => setActive(index)}
              >
                <span className="trend-dot-mark" aria-hidden="true" />
              </button>
            ))}
            <span className="ml-2 hidden sm:inline text-[11px] font-semibold uppercase tracking-wider text-white/70">
              {safeActive + 1} / {lista.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Obra anterior"
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#071510]/80 backdrop-blur border border-[#1b4234] hover:border-secondary/60 hover:text-secondary text-white flex items-center justify-center transition-colors"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Obra siguiente"
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#071510]/80 backdrop-blur border border-[#1b4234] hover:border-secondary/60 hover:text-secondary text-white flex items-center justify-center transition-colors"
            >
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
