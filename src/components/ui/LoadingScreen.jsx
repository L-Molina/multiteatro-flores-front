import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

function copyFor(_pathname) {
  return {
    title: 'Cargando...',
    icon: 'local_activity',
  }
}

/* Pantalla breve que se muestra en cada cambio de ruta.
   Layout la mantiene montada unos milisegundos y después la desvanece. */
export default function LoadingScreen({ visible }) {
  const { pathname } = useLocation()
  const [mounted, setMounted] = useState(visible)
  const [lastVisible, setLastVisible] = useState(visible)
  const copy = copyFor(pathname)

  if (visible !== lastVisible) {
    setLastVisible(visible)
    if (visible) setMounted(true)
  }

  useEffect(() => {
    if (visible) return undefined
    const timer = window.setTimeout(() => setMounted(false), 260)
    return () => window.clearTimeout(timer)
  }, [visible])

  if (!visible && !mounted) return null

  return (
    <div
      className={`loading-screen ${visible ? 'is-visible' : 'is-leaving'}`}
      role="status"
      aria-live="polite"
      aria-label={copy.title}
    >
      <div className="loading-emblem">
        <span className="loading-ring" aria-hidden="true" />
        <span className="material-symbols-outlined text-secondary text-3xl">{copy.icon}</span>
      </div>
      <div className="px-6 text-center">
        <p className="text-sm font-bold text-ivory-text">{copy.title}</p>
      </div>
      <div className="loading-bar" aria-hidden="true">
        <span />
      </div>
      <span className="sr-only">Cargando…</span>
    </div>
  )
}
