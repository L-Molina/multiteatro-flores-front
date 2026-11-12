import { Link } from 'react-router-dom'
import useDocumentTitle from '../hooks/useDocumentTitle'

const GRUPOS = [
  {
    icon: 'confirmation_number',
    title: 'Compra y entradas',
    items: [
      [
        '¿Cómo compro una entrada?',
        'Elegí una obra en la cartelera, seleccioná el teatro y el horario disponible, el tipo de entrada (Estándar o VIP) y tu butaca exacta. Luego completás los datos del titular, el método de pago y confirmás la compra. El proceso se hace página por página y podés volver atrás antes de pagar.',
      ],
      [
        '¿Puedo comprar entradas para varias funciones a la vez?',
        'No. La plataforma no tiene carrito acumulable: cada compra corresponde a una única función y permite hasta 6 butacas, todas del mismo tipo de entrada. Si querés ver dos obras distintas (o la misma obra en dos horarios), completá una compra y después iniciá otra por separado.',
      ],
      [
        '¿Qué diferencia hay entre entrada Estándar y VIP?',
        'La entrada Estándar corresponde a las filas centrales y laterales de platea. La entrada VIP incluye las primeras filas y los palcos laterales, con acceso prioritario a la sala y precio diferencial. El precio final se muestra siempre antes de pagar.',
      ],
      [
        '¿Puedo elegir mi butaca?',
        'Sí. En el paso de butacas vas a ver el plano real de la sala con las butacas libres, ocupadas y bloqueadas. Podés seleccionar hasta 6 butacas por compra, todas del mismo tipo de entrada.',
      ],
      [
        '¿Necesito imprimir la entrada?',
        'No. Tus entradas se emiten como un código QR dinámico que se activa en tu celular antes de la apertura de puertas. Se escanea una sola vez en el acceso de la sala.',
      ],
    ],
  },
  {
    icon: 'payments',
    title: 'Pagos y facturación',
    items: [
      [
        '¿Qué medios de pago aceptan?',
        'Tarjetas de crédito y débito Visa, Mastercard y Cabal; Mercado Pago; y transferencia bancaria con alias (5% de descuento adicional). En el prototipo podés simular los tres métodos sin cargar datos reales.',
      ],
      [
        '¿Cómo funcionan las cuotas?',
        'Las compras con tarjeta de crédito pueden abonarse en 3 cuotas sin interés. El resumen de pago muestra el valor de cada cuota antes de confirmar.',
      ],
      [
        '¿El costo de servicio es reembolsable?',
        'Si la función se suspende por causas atribuibles al teatro, se devuelve el 100% del valor de las entradas y del costo de servicio. Si cancelás por decisión personal con más de 24 horas de anticipación, se reembolsa el valor de las entradas.',
      ],
    ],
  },
  {
    icon: 'event_busy',
    title: 'Cambios y cancelaciones',
    items: [
      [
        '¿Puedo cambiar mi entrada por otra función?',
        'Sí, hasta 24 horas antes de la función, sujeto a disponibilidad de la nueva fecha y a diferencia de tarifa. Escribinos desde la página de contacto indicando el código de compra.',
      ],
      [
        '¿Qué pasa si no puedo asistir?',
        'Podés transferir tu entrada a otra persona: el QR no está nominado y se valida en la puerta. También podés solicitar la cancelación con al menos 24 horas de anticipación.',
      ],
      [
        '¿Los teatros tienen accesibilidad?',
        'Todas las salas asociadas cuentan con butacas para movilidad reducida y baños accesibles. En el plano de butacas se identifican con el ícono de accesibilidad y se pueden seleccionar como cualquier otra localidad.',
      ],
    ],
  },
  {
    icon: 'privacy_tip',
    title: 'Datos y privacidad',
    items: [
      [
        '¿Qué hacen con mis datos personales?',
        'Usamos el nombre, DNI, correo, teléfono y los datos de la compra únicamente para emitir la entrada, enviarte el código QR y responder tus consultas. No vendemos ni cedemos tus datos a terceros con fines publicitarios. Si marcaste la opción del boletín, podés darte de baja cuando quieras.',
      ],
      [
        '¿Dónde puedo leer la política de privacidad completa?',
        'La política completa está disponible en la página Política de Privacidad, accesible desde el pie de página y desde los formularios de login, contacto y checkout. Ahí se detallan los datos que recopilamos, su finalidad, el plazo de conservación y cómo ejercer tus derechos de acceso, rectificación y supresión.',
      ],
      [
        '¿El prototipo guarda mis datos en un servidor?',
        'No. Esta versión académica funciona sin backend: los datos viven en la memoria del navegador y se pierden al recargar la página. Aun así, aplicamos validación estricta y minimización de datos para que el flujo sea seguro cuando se conecte al backend real.',
      ],
    ],
  },
]

export default function FaqPage() {
  useDocumentTitle('Preguntas Frecuentes')
  return (
    <div className="flex flex-col w-full">
      <section className="border-b border-[#1b4234] bg-[#0e241c]">
        <div className="max-w-4xl mx-auto px-4 sm:px-8 py-14 page-enter text-center">
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-secondary">
            Ayuda
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-2">
            Preguntas Frecuentes
          </h1>
          <p className="text-sm text-ivory-muted mt-3 max-w-2xl mx-auto">
            Todo lo que necesitás saber acerca de nuestra plataforma.
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-8 py-10 flex flex-col gap-8 w-full">
        {GRUPOS.map((grupo) => (
          <div key={grupo.title}>
            <h2 className="text-sm font-bold uppercase tracking-wider text-secondary mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">{grupo.icon}</span>
              {grupo.title}
            </h2>
            <div className="flex flex-col gap-3">
              {grupo.items.map(([question, answer], index) => (
                <details
                  key={question}
                  className="faq-item rounded-xl border border-[#1b4234] bg-[#0c211a] px-5 py-4 group"
                  open={grupo.title === 'Compra y entradas' && index === 0}
                >
                  <summary className="flex items-center justify-between gap-4 text-sm font-semibold list-none cursor-pointer">
                    {question}
                    <span className="material-symbols-outlined faq-chevron text-secondary transition-transform">
                      expand_more
                    </span>
                  </summary>
                  <p className="text-xs text-ivory-muted leading-relaxed mt-3">{answer}</p>
                </details>
              ))}
            </div>
          </div>
        ))}

        <div className="rounded-xl border border-[#1e4d3a] bg-[#0e241c] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold">¿Te quedó una duda?</p>
            <p className="text-xs text-ivory-muted mt-1">
              Nuestro equipo responde de lunes a domingo de 10 a 22 hs.
            </p>
          </div>
          <Link
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-secondary hover:bg-secondary-hover text-[#071510] text-xs font-extrabold uppercase tracking-wider transition-colors"
            to="/contacto"
          >
            <span className="material-symbols-outlined text-base">mail</span>
            Escribirnos
          </Link>
        </div>
      </section>
    </div>
  )
}
