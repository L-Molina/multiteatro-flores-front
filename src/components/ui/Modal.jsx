import { useEffect, useRef } from 'react'

/* Modal reutilizable para los ABM del panel.
   - `open` y `onClose` vienen del componente padre (estado con useState).
   - useRef guarda el nodo de la tarjeta para enfocarlo al abrir.
   - onClose se guarda en un ref para que el efecto no se vuelva a ejecutar en
     cada render del formulario (era lo que hacía perder el foco al escribir).
   - useEffect registra Escape, bloquea el scroll del body y limpia todo al cerrar.
   - role="dialog", aria-modal y aria-labelledby resuelven la accesibilidad. */
export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  maxWidth = 'max-w-2xl',
  labelledBy = 'modal-title',
}) {
  const cardRef = useRef(null)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!open) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onCloseRef.current?.()
    }
    document.addEventListener('keydown', onKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const timer = window.setTimeout(() => {
      const card = cardRef.current
      if (!card) return
      const field = card.querySelector(
        'input:not([type="hidden"]):not([type="file"]):not([disabled]):not([readonly]), select:not([disabled]), textarea:not([disabled])',
      )
      ;(field || card).focus()
    }, 30)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      window.clearTimeout(timer)
    }
  }, [open])

  if (!open) return null

  return (
    <div
      className="admin-modal"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        ref={cardRef}
        className={`admin-modal-card ${maxWidth} outline-none`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
      >
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <h3 id={labelledBy} className="text-lg font-bold text-on-surface">
              {title}
            </h3>
            {description ? (
              <p className="text-xs text-on-surface-muted mt-1">{description}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg border border-panel-border text-on-surface-muted hover:text-white flex items-center justify-center"
            aria-label="Cerrar"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
