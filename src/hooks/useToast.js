import { useCallback, useEffect, useRef, useState } from 'react'

/* Hook que concentra el estado y el ciclo de vida de las notificaciones.
   - useState guarda el mensaje y el tono.
   - useRef conserva el id del timeout sin provocar renders.
   - useCallback memoiza showToast para no recrear el temporizador en cada render.
   - useEffect limpia el timeout al desmontar (clave con React 19 StrictMode). */
export default function useToast(duration = 3400) {
  const [message, setMessage] = useState('')
  const [tone, setTone] = useState('success')
  const timer = useRef(null)

  const showToast = useCallback(
    (text, variant = 'success') => {
      setMessage(text)
      setTone(variant)
      if (timer.current) window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => setMessage(''), duration)
    },
    [duration],
  )

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current)
    },
    [],
  )

  return { message, tone, showToast }
}
