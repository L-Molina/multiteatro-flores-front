import { useState } from 'react'
import { Link } from 'react-router-dom'
import useToast from '../hooks/useToast'
import Toast from '../components/ui/Toast'
import useDocumentTitle from '../hooks/useDocumentTitle'
import {
  MAX,
  emailValido,
  limpiarMultilinea,
  limpiarTexto,
  nombreValido,
  quitarControlChars,
} from '../utils/validacion'

const MOTIVOS = [
  'Consulta sobre una compra',
  'Cambio o cancelación de función',
  'Accesibilidad',
  'Alianzas con teatros',
  'Otro',
]

const INITIAL = {
  nombre: '',
  email: '',
  motivo: MOTIVOS[0],
  mensaje: '',
}

export default function ContactoPage() {
  useDocumentTitle('Contacto')
  const [form, setForm] = useState(INITIAL)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const { message, tone, showToast } = useToast()

  const update = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }))
    setError('')
  }

  const onSubmit = (event) => {
    event.preventDefault()
    const nombre = form.nombre.trim()
    const email = form.email.trim()
    const mensaje = form.mensaje.trim()

    if (!nombre || !email || !mensaje) {
      setError('Completá nombre, correo y mensaje para continuar.')
      return
    }
    if (!nombreValido(nombre)) {
      setError('Ingresá un nombre real (solo letras, sin números ni símbolos).')
      return
    }
    if (!emailValido(email)) {
      setError('Ingresá un correo electrónico válido (ej.: nombre@dominio.com).')
      return
    }
    if (mensaje.length < 10) {
      setError('Contanos un poco más: el mensaje debe tener al menos 10 caracteres.')
      return
    }

    setForm(INITIAL)
    setSent(true)
    showToast('¡Consulta enviada! Te responderemos a la brevedad.')
  }

  return (
    <div className="flex flex-col w-full">
      <section className="max-w-5xl mx-auto px-4 sm:px-8 py-10 grid grid-cols-1 lg:grid-cols-5 gap-8 items-start w-full">
        <form
          id="contact-form"
          className="lg:col-span-3 rounded-2xl border border-[#1b4234] bg-[#0c211a] p-6 sm:p-8 flex flex-col gap-4"
          onSubmit={onSubmit}
          noValidate
        >
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-2">Contacto</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="form-label" htmlFor="contacto-nombre">
                Nombre y apellido
              </label>
              <input
                id="contacto-nombre"
                className={`form-input ${error && !form.nombre.trim() ? 'form-error' : ''}`}
                placeholder="Tu nombre"
                maxLength={MAX.nombre}
                value={form.nombre}
                onChange={(event) => update('nombre', limpiarTexto(event.target.value, MAX.nombre))}
                autoComplete="name"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="form-label" htmlFor="contacto-email">
                Correo electrónico
              </label>
              <input
                id="contacto-email"
                type="email"
                className={`form-input ${error && !emailValido(form.email) ? 'form-error' : ''}`}
                placeholder="tu@email.com"
                maxLength={MAX.email}
                value={form.email}
                onChange={(event) =>
                  update('email', quitarControlChars(event.target.value).slice(0, MAX.email))
                }
                autoComplete="email"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="form-label" htmlFor="contacto-motivo">
              Motivo
            </label>
            <select
              id="contacto-motivo"
              className="form-input"
              value={form.motivo}
              onChange={(event) => update('motivo', event.target.value)}
            >
              {MOTIVOS.map((motivo) => (
                <option key={motivo}>{motivo}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="form-label" htmlFor="contacto-mensaje">
              Mensaje
            </label>
            <textarea
              id="contacto-mensaje"
              rows={5}
              maxLength={MAX.mensaje}
              className={`form-input resize-none ${error && !form.mensaje.trim() ? 'form-error' : ''}`}
              placeholder="Contanos en qué te podemos ayudar. Si es por una compra, incluí el código de reserva."
              value={form.mensaje}
              onChange={(event) =>
                update('mensaje', limpiarMultilinea(event.target.value, MAX.mensaje))
              }
            />
          </div>
          {error ? (
            <p
              className="text-xs text-tertiary bg-[#761200]/30 border border-[#761200]/50 rounded-lg px-3 py-2"
              role="alert"
            >
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            className="self-start inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-secondary hover:bg-secondary-hover text-[#071510] text-xs font-extrabold uppercase tracking-wider transition-colors"
          >
            <span className="material-symbols-outlined text-lg">send</span>
            Enviar consulta
          </button>
          {sent ? (
            <p className="text-xs text-primary" role="status">
              ¡Gracias! Recibimos tu consulta y te responderemos por correo.
            </p>
          ) : null}
          <p className="text-[11px] text-ivory-muted/70">
            Prototipo: el formulario no envía datos reales, solo simula la confirmación. Tus datos
            se usan únicamente para responderte. Ver{' '}
            <Link className="text-secondary hover:underline" to="/privacidad">
              política de privacidad
            </Link>
            .
          </p>
        </form>

        <aside className="lg:col-span-2 flex flex-col gap-4 w-full">
          <div className="rounded-xl border border-[#1b4234] bg-[#0c211a] p-5 flex flex-col gap-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-secondary">
              Canales directos
            </h2>
            <a
              className="flex items-start gap-3 text-sm hover:text-secondary transition-colors"
              href="mailto:hola@multiteatroflores.com"
            >
              <span className="material-symbols-outlined text-secondary">mail</span>
              <span>
                <span className="block font-semibold">Correo</span>
                <span className="text-xs text-ivory-muted">hola@multiteatroflores.com</span>
              </span>
            </a>
            <a
              className="flex items-start gap-3 text-sm hover:text-secondary transition-colors"
              href="tel:+541146319200"
            >
              <span className="material-symbols-outlined text-secondary">call</span>
              <span>
                <span className="block font-semibold">Teléfono</span>
                <span className="text-xs text-ivory-muted">(011) 4631-9200</span>
              </span>
            </a>
            <div className="flex items-start gap-3 text-sm">
              <span className="material-symbols-outlined text-secondary">chat</span>
              <span>
                <span className="block font-semibold">WhatsApp</span>
                <span className="text-xs text-ivory-muted">+54 9 11 5842-9912</span>
              </span>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <span className="material-symbols-outlined text-secondary">schedule</span>
              <span>
                <span className="block font-semibold">Horario de atención</span>
                <span className="text-xs text-ivory-muted">Lunes a domingo, 10:00 a 22:00 hs</span>
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-[#1b4234] bg-[#0e241c] p-5 text-xs text-ivory-muted leading-relaxed">
            <p className="text-sm font-bold text-ivory-text mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-base text-secondary">info</span>
              Importante
            </p>
            <p>
              Multiteatro Flores es una plataforma 100% digital y no cuenta con sede física. Las
              funciones se realizan en los teatros asociados de la Ciudad de Buenos Aires.
            </p>
            <Link
              className="inline-flex items-center gap-1 text-secondary font-semibold mt-3 hover:underline"
              to="/preguntas-frecuentes"
            >
              Ver preguntas frecuentes
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
        </aside>
      </section>

      <Toast message={message} tone={tone} />
    </div>
  )
}
