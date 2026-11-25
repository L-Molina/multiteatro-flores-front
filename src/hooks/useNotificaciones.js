import { useEffect, useState } from 'react'
import { api } from '../api/client'

/* Novedades de cartelera compartidas entre sesiones.

   La bandeja arranca vacía y se alimenta desde GET /api/notificaciones del
   backend Spring Boot. El gestor publica un aviso cuando programa la primera
   función de una obra; las demás sesiones lo reciben por polling, incluso en
   una ventana de incógnito. La bandeja vive en memoria del backend y se
   reinicia cuando se reinicia Spring. */

const POLL_MS = 5000

export default function useNotificaciones() {
  const [notificaciones, setNotificaciones] = useState([])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const data = await api.get('/notificaciones', { auth: false })
        if (!cancelled) setNotificaciones(data?.notificaciones || [])
      } catch {
        // Si el backend no está disponible, la bandeja queda vacía.
      }
    }
    load()
    const id = window.setInterval(load, POLL_MS)
    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [])

  return notificaciones
}
