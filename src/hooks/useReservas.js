import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { normalizarButaca } from '../data/catalogo'

/* Reservas temporales de butacas compartidas entre pestañas y cuentas.

   El frontend es estático y guarda todo en memoria, así que para que dos
   sesiones (por ejemplo, una ventana normal y otra de incógnito) vean las
   mismas butacas ocupadas hace falta un punto en común: el dev server de Vite
   expone /api/ocupacion con un registro en memoria (ver vite.config.js).

   Cada pestaña tiene un sessionId propio:
   - publica las butacas que eligió (POST) y las renueva con un heartbeat;
   - consulta cada 2 s las butacas vendidas y las reservadas por otras sesiones;
   - si el servidor rechaza una butaca (otra sesión la tomó primero), avisa
     para que se deseleccione.
   Si el endpoint no existe (build estático), el checkout sigue funcionando
   solo con el estado local. */

const API = '/api/ocupacion'
const POLL_MS = 2000
const HEARTBEAT_MS = 6000

export default function useReservas(funcionId, seats, onPerdidas) {
  const sessionId = useRef(
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `s-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  )
  const seatsRef = useRef(seats)
  seatsRef.current = seats
  const onPerdidasRef = useRef(onPerdidas)
  onPerdidasRef.current = onPerdidas
  const [estado, setEstado] = useState({ ventas: [], reservas: [] })

  const enviar = useCallback(async (payload, keepalive = false) => {
    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: sessionId.current, ...payload }),
        keepalive,
      })
      if (!res.ok) return null
      return await res.json()
    } catch {
      return null
    }
  }, [])

  // Trae las butacas vendidas y las reservadas por otras sesiones.
  useEffect(() => {
    if (!funcionId) {
      setEstado({ ventas: [], reservas: [] })
      return undefined
    }
    let cancelled = false
    const load = async () => {
      try {
        const res = await fetch(
          `${API}?funcionId=${funcionId}&sessionId=${encodeURIComponent(sessionId.current)}`,
          { cache: 'no-store' },
        )
        if (!res.ok) return
        const data = await res.json()
        if (!cancelled) {
          setEstado({ ventas: data.ventas || [], reservas: data.reservas || [] })
        }
      } catch {
        // Sin endpoint (build estático): se mantiene el estado local.
      }
    }
    load()
    const id = window.setInterval(load, POLL_MS)
    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [funcionId])

  // Publica mis butacas y libera las de la función anterior al cambiarla.
  const funcionAnterior = useRef(funcionId)
  const firma = seats.join(',')
  useEffect(() => {
    const anterior = funcionAnterior.current
    funcionAnterior.current = funcionId
    if (anterior && anterior !== funcionId) {
      enviar({ funcionId: anterior, butacas: [] })
    }
    if (!funcionId) return undefined
    let activo = true
    const publicar = async () => {
      const data = await enviar({ funcionId, butacas: seatsRef.current })
      if (activo && data?.rechazadas?.length) {
        onPerdidasRef.current?.(data.rechazadas)
      }
    }
    publicar()
    return () => {
      activo = false
    }
  }, [funcionId, firma, enviar])

  // Renueva la reserva mientras haya butacas elegidas.
  useEffect(() => {
    if (!funcionId || !seats.length) return undefined
    const id = window.setInterval(() => {
      enviar({ funcionId, butacas: seatsRef.current })
    }, HEARTBEAT_MS)
    return () => window.clearInterval(id)
  }, [funcionId, seats.length, enviar])

  // Al cerrar o recargar la pestaña, libera las butacas reservadas.
  // (Al navegar dentro de la SPA la reserva vence sola por TTL.)
  useEffect(() => {
    if (!funcionId) return undefined
    const liberar = () => {
      const body = JSON.stringify({
        funcionId,
        sessionId: sessionId.current,
        butacas: [],
      })
      if (navigator.sendBeacon) {
        navigator.sendBeacon(API, new Blob([body], { type: 'application/json' }))
        return
      }
      enviar({ funcionId, butacas: [] }, true)
    }
    window.addEventListener('pagehide', liberar)
    return () => window.removeEventListener('pagehide', liberar)
  }, [funcionId, enviar])

  const ocupadas = useMemo(() => {
    const set = new Set()
    ;(estado.ventas || []).forEach((id) => set.add(normalizarButaca(id)))
    ;(estado.reservas || []).forEach((reserva) => {
      ;(reserva.butacas || []).forEach((id) => set.add(normalizarButaca(id)))
    })
    return set
  }, [estado])

  const confirmarVenta = useCallback(async () => {
    if (!funcionId) return
    await enviar({ accion: 'vender', funcionId, butacas: seatsRef.current })
  }, [funcionId, enviar])

  return { ocupadas, confirmarVenta }
}
