import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import useCatalog from '../hooks/useCatalog'
import useAuth from '../hooks/useAuth'
import Stepper from '../components/checkout/Stepper'
import SummaryPanel from '../components/checkout/SummaryPanel'
import SuccessPanel from '../components/checkout/SuccessPanel'
import ObraStep from '../components/checkout/steps/ObraStep'
import TeatroStep from '../components/checkout/steps/TeatroStep'
import HorarioStep from '../components/checkout/steps/HorarioStep'
import EntradaStep from '../components/checkout/steps/EntradaStep'
import ButacasStep from '../components/checkout/steps/ButacasStep'
import TitularStep from '../components/checkout/steps/TitularStep'
import PagoStep from '../components/checkout/steps/PagoStep'
import ResumenStep from '../components/checkout/steps/ResumenStep'
import Toast from '../components/ui/Toast'
import useToast from '../hooks/useToast'
import useDocumentTitle from '../hooks/useDocumentTitle'
import {
  MAX,
  formatearDni,
  formatearTarjeta,
  formatearVencimiento,
  limpiarTexto,
  localidadValida,
  luhnValido,
  nombreValido,
  normalizarEmail,
  quitarControlChars,
  soloDigitos,
  telefonoValido,
  vencimientoValido,
  cvvValido,
  dniValido,
  emailValido,
} from '../utils/validacion'

const SERVICE_FEE = 900
const MAX_SEATS = 6

const TITLES = [
  [
    'Elegí una obra',
    'Seleccioná la obra que querés ver. Después vas a elegir teatro, horario, entrada y butaca.',
  ],
  [
    'Elegí el teatro',
    'Estos son los teatros donde se presenta la obra. Cada uno tiene salas y funciones propias.',
  ],
  [
    'Elegí día y horario',
    'Funciones disponibles en la sala seleccionada. Las butacas se liberan en tiempo real.',
  ],
  [
    'Elegí el tipo de entrada',
    'Estándar o VIP. El precio se aplica a cada butaca que selecciones.',
  ],
  [
    'Elegí tus butacas',
    'Hacé clic en las butacas disponibles. Podés elegir hasta 6 del mismo tipo.',
  ],
  [
    'Datos del titular',
    'Las entradas quedan a nombre de esta persona. El QR se envía al correo indicado.',
  ],
  [
    'Método de pago',
    'Elegí cómo querés pagar. Esta es una simulación: no se realizan cargos reales.',
  ],
  ['Resumen y confirmación', 'Revisá todos los datos antes de emitir las entradas.'],
]

const HOLDER_INITIAL = {
  nombre: '',
  dni: '',
  email: '',
  tel: '',
  localidad: '',
  news: true,
}

const CARD_INITIAL = {
  number: '4517 0000 0000 8829',
  name: 'FACUNDO N MORALES',
  exp: '09 / 28',
  cvv: '842',
}

export default function CheckoutPage() {
  useDocumentTitle('Compra de Entradas')
  const { user } = useAuth()
  const {
    obras,
    getObra,
    getSala,
    getFuncion,
    asientos,
    precioDe,
    formatARS,
    formatFecha,
    addCompra,
  } = useCatalog()
  const [searchParams] = useSearchParams()
  const preselected = Number(searchParams.get('obra'))

  const [step, setStep] = useState(1)
  const [obraId, setObraId] = useState(() =>
    obras.some((obra) => obra.id === preselected) ? preselected : null,
  )
  const [salaId, setSalaId] = useState(null)
  const [funcionId, setFuncionId] = useState(null)
  const [tipo, setTipo] = useState(null)
  const [seats, setSeats] = useState([])
  const [holder, setHolder] = useState(() => ({
    ...HOLDER_INITIAL,
    nombre: user?.nombre || '',
    dni: user?.dni || '',
    email: user?.email || '',
    tel: user?.tel || '',
    localidad: user?.localidad || '',
  }))
  const [holderErrors, setHolderErrors] = useState({})
  const [pay, setPay] = useState('tarjeta')
  const [card, setCard] = useState(CARD_INITIAL)
  const [payErrors, setPayErrors] = useState({})
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [termsError, setTermsError] = useState('')
  const [success, setSuccess] = useState(null)
  const [seconds, setSeconds] = useState(12 * 60)
  const { message, tone, showToast } = useToast()

  const obra = getObra(obraId)
  const sala = getSala(salaId)
  const funcion = getFuncion(funcionId)
  const asientosFuncion = funcion ? asientos(funcion.id) : []
  const unitPrice = obra && tipo ? precioDe(obra, tipo) : 0

  const totals = useMemo(() => {
    const n = seats.length
    const subtotal = n * unitPrice
    const service = n * SERVICE_FEE
    const discount = pay === 'transferencia' ? Math.round(subtotal * 0.05) : 0
    return { n, subtotal, service, discount, total: subtotal + service - discount }
  }, [seats.length, unitPrice, pay])

  const payLabel =
    pay === 'mercadopago'
      ? 'Mercado Pago'
      : pay === 'transferencia'
        ? 'Transferencia bancaria'
        : 'Tarjeta de crédito (3 cuotas)'

  useEffect(() => {
    if (success) return undefined
    const interval = window.setInterval(() => {
      setSeconds((prev) => Math.max(0, prev - 1))
    }, 1000)
    return () => window.clearInterval(interval)
  }, [success])

  useEffect(() => {
    window.scrollTo({ top: 120, behavior: 'smooth' })
  }, [step, success])

  const timerText =
    seconds <= 0
      ? 'Expirado'
      : `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(
          seconds % 60,
        ).padStart(2, '0')}`

  const selectObra = (id) => {
    if (obraId !== id) {
      setSalaId(null)
      setFuncionId(null)
      setTipo(null)
      setSeats([])
    }
    setObraId(id)
  }

  const selectSala = (id) => {
    if (salaId !== id) {
      setFuncionId(null)
      setTipo(null)
      setSeats([])
    }
    setSalaId(id)
  }

  const selectFuncion = (id) => {
    if (funcionId !== id) setSeats([])
    setFuncionId(id)
  }

  const selectTipo = (value) => {
    if (tipo !== value) setSeats([])
    setTipo(value)
  }

  const toggleSeat = (id) => {
    setSeats((prev) => {
      if (prev.includes(id)) return prev.filter((seat) => seat !== id)
      if (prev.length >= MAX_SEATS) {
        showToast(`Podés seleccionar hasta ${MAX_SEATS} butacas por compra.`, 'error')
        return prev
      }
      return [...prev, id]
    })
  }

  const changeHolder = (name, value) => {
    const sanitized =
      name === 'dni'
        ? formatearDni(value)
        : name === 'email'
          ? quitarControlChars(value, { angles: false }).slice(0, MAX.email)
          : name === 'tel'
            ? quitarControlChars(value, { angles: false })
                .replace(/[^\d+()\s.-]/g, '')
                .slice(0, MAX.telefono)
            : limpiarTexto(value, name === 'nombre' ? MAX.nombre : MAX.localidad)
    setHolder((prev) => ({ ...prev, [name]: sanitized }))
    setHolderErrors((prev) => {
      if (!prev[name]) return prev
      const next = { ...prev }
      delete next[name]
      return next
    })
  }

  const changeCard = (name, value) => {
    const sanitized =
      name === 'number'
        ? formatearTarjeta(value)
        : name === 'exp'
          ? formatearVencimiento(value)
          : name === 'cvv'
            ? soloDigitos(value, MAX.cvv)
            : limpiarTexto(value, MAX.nombre).toUpperCase()
    setCard((prev) => ({ ...prev, [name]: sanitized }))
    setPayErrors((prev) => {
      if (!prev[name]) return prev
      const next = { ...prev }
      delete next[name]
      return next
    })
  }

  const validateHolder = () => {
    const errors = {}
    const nombre = holder.nombre.trim()
    const dni = holder.dni.trim()
    const email = normalizarEmail(holder.email)
    if (!nombreValido(nombre)) {
      errors.nombre = 'Ingresá nombre y apellido reales (solo letras, sin números).'
    }
    if (!dniValido(dni)) {
      errors.dni = 'Ingresá un DNI válido de 7 u 8 dígitos.'
    }
    if (!emailValido(email)) {
      errors.email = 'Ingresá un correo electrónico válido (ej.: nombre@dominio.com).'
    }
    if (!telefonoValido(holder.tel)) {
      errors.tel = 'Ingresá un teléfono válido de 8 a 15 dígitos.'
    }
    if (!localidadValida(holder.localidad)) {
      errors.localidad = 'La localidad solo admite letras, números y espacios.'
    }
    setHolderErrors(errors)
    return errors
  }

  const validatePayment = () => {
    if (pay !== 'tarjeta') {
      setPayErrors({})
      return {}
    }
    const errors = {}
    if (!luhnValido(card.number)) {
      errors.number = 'El número de tarjeta no es válido (falla la verificación Luhn).'
    }
    if (!nombreValido(card.name, 5)) {
      errors.name = 'Ingresá el nombre del titular tal como figura en el plástico.'
    }
    if (!vencimientoValido(card.exp)) {
      errors.exp = 'Ingresá un vencimiento MM / AA válido y no vencido.'
    }
    if (!cvvValido(card.cvv)) {
      errors.cvv = 'El código de seguridad debe tener 3 o 4 dígitos.'
    }
    setPayErrors(errors)
    return errors
  }

  const validateCurrent = () => {
    if (step === 1 && !obraId) {
      showToast('Elegí una obra para continuar.', 'error')
      return false
    }
    if (step === 2 && !salaId) {
      showToast('Elegí un teatro para continuar.', 'error')
      return false
    }
    if (step === 3 && !funcionId) {
      showToast('Elegí una función para continuar.', 'error')
      return false
    }
    if (step === 4 && !tipo) {
      showToast('Elegí el tipo de entrada para continuar.', 'error')
      return false
    }
    if (step === 5 && !seats.length) {
      showToast('Seleccioná al menos una butaca para continuar.', 'error')
      return false
    }
    if (step === 6) {
      const errors = validateHolder()
      const first = Object.values(errors)[0]
      if (first) {
        showToast(first, 'error')
        return false
      }
    }
    if (step === 7) {
      const errors = validatePayment()
      const first = Object.values(errors)[0]
      if (first) {
        showToast(first, 'error')
        return false
      }
    }
    return true
  }

  const confirmPurchase = () => {
    setTermsError('')
    if (!acceptTerms) {
      setTermsError('Tenés que aceptar los términos de compra para confirmar.')
      showToast('Aceptá los términos de compra para confirmar.', 'error')
      return
    }
    const holderErrorsCheck = validateHolder()
    if (Object.keys(holderErrorsCheck).length) {
      setStep(6)
      showToast(Object.values(holderErrorsCheck)[0], 'error')
      return
    }
    const paymentErrorsCheck = validatePayment()
    if (Object.keys(paymentErrorsCheck).length) {
      setStep(7)
      showToast(Object.values(paymentErrorsCheck)[0], 'error')
      return
    }

    const code = `MTF-${Date.now().toString(36).toUpperCase().slice(-6)}`
    const tipoLabel = tipo === 'vip' ? 'VIP' : 'Estándar'
    const email = normalizarEmail(holder.email)
    const compra = addCompra({
      codigo: code,
      obraId: obra.id,
      obraTitulo: obra.titulo,
      obraImg: obra.img || obra.afiche,
      genero: obra.genero,
      salaId: sala.id,
      teatro: sala.teatro,
      salaNombre: sala.nombre,
      direccion: sala.direccion,
      localidad: sala.localidad,
      funcionId: funcion.id,
      fechaFuncion: funcion.fecha,
      horaFuncion: funcion.hora,
      duracion: funcion.duracion || obra.duracion,
      tipo,
      tipoLabel,
      unitPrice,
      butacas: [...seats],
      titular: {
        nombre: holder.nombre,
        dni: holder.dni,
        email,
        tel: holder.tel,
        localidad: holder.localidad,
      },
      pago: pay,
      pagoLabel: payLabel,
      subtotal: totals.subtotal,
      servicio: totals.service,
      descuento: totals.discount,
      total: totals.total,
      email,
      usuarioEmail: user?.email || email,
    })
    setSuccess({
      id: compra.id,
      code,
      email,
      funcion: `${obra.titulo} • ${formatFecha(funcion.fecha, {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      })} ${funcion.hora} hs`,
      butacas: `${seats.map((seat) => seat.replace('-', ' ')).join(' • ')} — ${sala.teatro}`,
      total: formatARS(totals.total),
    })
  }

  const onNext = () => {
    if (success) return
    if (step === 8) {
      confirmPurchase()
      return
    }
    if (!validateCurrent()) return
    setStep((prev) => Math.min(8, prev + 1))
  }

  return (
    <div className="w-full">
      <section className="w-full bg-surface-dark border-b border-outline-border py-3.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5 text-xs text-ivory-muted">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            <span className="font-semibold tracking-wider text-secondary uppercase">
              Boletería Oficial • Checkout Directo
            </span>
            <span className="text-ivory-muted/40">•</span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm text-primary">timer</span>
              Tiempo restante:{' '}
              <strong className="text-ivory-text font-bold">{timerText}</strong>
            </span>
            <span className="text-ivory-muted/40">•</span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm text-secondary">
                shopping_cart_off
              </span>
              Una función por compra · hasta 6 butacas
            </span>
          </div>
          {!success ? <Stepper step={step} /> : null}
        </div>
      </section>

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 flex flex-col gap-6 min-w-0">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-ivory-text tracking-tight">
              {success ? 'Compra finalizada' : TITLES[step - 1][0]}
            </h1>
            <p className="text-sm text-ivory-muted">
              {success
                ? 'Tus entradas digitales ya están disponibles.'
                : `Paso ${step} de 8 • ${TITLES[step - 1][1]}`}
            </p>
          </div>

          {success ? (
            <SuccessPanel
              ticket={success}
              onDownload={() =>
                showToast(
                  'Comprobante simulado generado. En la versión final se descarga el PDF con el QR.',
                )
              }
            />
          ) : (
            <>
              {step === 1 ? (
                <ObraStep obras={obras.filter((item) => item.publicada !== false)} selectedId={obraId} onSelect={selectObra} />
              ) : null}
              {step === 2 ? (
                <TeatroStep obraId={obraId} selectedSalaId={salaId} onSelect={selectSala} />
              ) : null}
              {step === 3 ? (
                <HorarioStep
                  obraId={obraId}
                  salaId={salaId}
                  selectedFuncionId={funcionId}
                  onSelect={selectFuncion}
                />
              ) : null}
              {step === 4 && obra ? (
                <EntradaStep obra={obra} tipo={tipo} onSelect={selectTipo} />
              ) : null}
              {step === 5 && funcion && tipo ? (
                <ButacasStep
                  asientos={asientosFuncion}
                  tipo={tipo}
                  seats={seats}
                  onToggle={toggleSeat}
                />
              ) : null}
              {step === 6 ? (
                <TitularStep
                  holder={holder}
                  onChange={changeHolder}
                  onToggleNews={(news) => setHolder((prev) => ({ ...prev, news }))}
                  errors={holderErrors}
                />
              ) : null}
              {step === 7 ? (
                <PagoStep
                  pay={pay}
                  onChangePay={setPay}
                  card={card}
                  onChangeCard={changeCard}
                  errors={payErrors}
                />
              ) : null}
              {step === 8 ? (
                <ResumenStep
                  obra={obra}
                  sala={sala}
                  funcion={funcion}
                  tipo={tipo}
                  seats={seats}
                  holder={holder}
                  payLabel={payLabel}
                  totals={totals}
                  acceptTerms={acceptTerms}
                  setAcceptTerms={(value) => {
                    setAcceptTerms(value)
                    if (value) setTermsError('')
                  }}
                  termsError={termsError}
                />
              ) : null}

              <div className="flex items-center justify-between gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setStep((prev) => Math.max(1, prev - 1))}
                  disabled={step === 1}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-outline-border bg-surface-card hover:bg-surface-elevated text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-lg">arrow_back</span>
                  Atrás
                </button>
                <button
                  type="button"
                  onClick={onNext}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-secondary hover:bg-secondary-hover text-canvas-root text-xs font-extrabold uppercase tracking-wider transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {step === 8 ? (
                    <>
                      <span className="material-symbols-outlined text-lg">lock</span>
                      Confirmar y pagar
                    </>
                  ) : (
                    <>
                      Continuar
                      <span className="material-symbols-outlined text-lg">arrow_forward</span>
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>

        <aside className="lg:col-span-4 lg:sticky lg:top-24 flex flex-col gap-5">
          <SummaryPanel
            obra={obra}
            sala={sala}
            funcion={funcion}
            tipo={tipo}
            seats={seats}
            unitPrice={unitPrice}
            totals={totals}
            pay={pay}
          />
          <div className="bg-surface-dark border border-outline-border rounded-xl p-4 flex flex-col gap-3">
            <span className="text-[11px] uppercase tracking-wider text-ivory-muted font-bold">
              Garantía Multiteatro Flores
            </span>
            <div className="grid grid-cols-1 gap-2.5 text-xs text-ivory-muted">
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-primary text-base shrink-0">
                  event_available
                </span>
                <span>Reprogramación sin costo hasta 24 hs antes.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-secondary text-base shrink-0">
                  accessible
                </span>
                <span>Butacas accesibles en todas las salas.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-primary text-base shrink-0">
                  support_agent
                </span>
                <span>Soporte por WhatsApp de 10 a 22 hs.</span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <Toast message={message} tone={tone} />
    </div>
  )
}
