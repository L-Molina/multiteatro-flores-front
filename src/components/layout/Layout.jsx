import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Footer from './Footer'
import Header from './Header'
import LoadingScreen from '../ui/LoadingScreen'

export default function Layout() {
  const { pathname } = useLocation()
  const [loadedPath, setLoadedPath] = useState(null)
  const loading = loadedPath !== pathname

  /* La pantalla de carga se muestra en cada cambio de ruta. Las páginas de
     gestión/ABM tienen una duración apenas mayor para que la transición se
     perciba como una sincronización real del panel. */
  useEffect(() => {
    const duration = pathname.startsWith('/admin') ? 900 : 480
    const timer = window.setTimeout(() => setLoadedPath(pathname), duration)
    return () => window.clearTimeout(timer)
  }, [pathname])

  return (
    <div className="min-h-screen flex flex-col bg-canvas-root text-ivory-text">
      <Header />
      <main className="w-full pt-20 flex-1" aria-busy={loading}>
        <Outlet />
      </main>
      <Footer />
      <LoadingScreen visible={loading} />
    </div>
  )
}
