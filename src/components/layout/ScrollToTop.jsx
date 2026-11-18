import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default function ScrollToTop() {
  const { pathname, hash, key } = useLocation()

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, behavior: 'auto' })
      return
    }

    const id = decodeURIComponent(hash.slice(1))
    let intentos = 0
    let timer

    const buscar = () => {
      const target = document.getElementById(id)
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      } else if (intentos < 10) {
        intentos += 1
        timer = setTimeout(buscar, 100) // reintenta hasta 1 segundo
      } else {
        window.scrollTo({ top: 0, behavior: 'auto' }) // no apareció: comportamiento anterior
      }
    }

    buscar()
    return () => clearTimeout(timer)
  }, [pathname, hash, key])

  return null
}