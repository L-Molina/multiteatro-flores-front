import { useEffect, useState } from 'react'

/* Novedades compartidas entre sesiones.

   La bandeja arranca vacía y se alimenta desde /api/notificaciones (registro en
   memoria del dev server, ver vite.config.js). El gestor publica un aviso cuando
   programa la primera función de una obra; el resto de las sesiones lo recibe
   por polling, incluso en una ventana de incógnito. */

const API = '/api/notificaciones'
const POLL_MS = 5000

export default function useNotificaciones() {
  const [notificaciones, setNotificaciones] = useState([])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const res = await fetch(API, { cache: 'no-store' })
        if (!res.ok) return
        const data = await res.json()
        if (!cancelled) setNotificaciones(data.notificaciones || [])
      } catch {
        // Sin endpoint (build estático): la bandeja queda vacía.
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
