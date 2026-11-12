import { Link } from 'react-router-dom'
import useDocumentTitle from '../hooks/useDocumentTitle'

const SECCIONES = [
  {
    id: 'responsable',
    titulo: '1. Responsable del tratamiento',
    contenido: [
      'Multiteatro Flores es la plataforma digital que reúne la cartelera de teatros independientes de la Ciudad de Buenos Aires. Para consultas sobre privacidad podés escribirnos a hola@multiteatroflores.com.',
      'Este documento describe qué datos personales recopilamos, con qué finalidad, cómo los protegemos y qué derechos podés ejercer. Se aplica a la cartelera, al proceso de compra, al formulario de contacto y al boletín de novedades.',
    ],
  },
  {
    id: 'datos',
    titulo: '2. Qué datos recopilamos',
    contenido: [
      'Datos de identificación y contacto del titular de la compra: nombre y apellido, DNI, correo electrónico, teléfono y localidad.',
      'Datos de la compra: obra, teatro, función, tipo de entrada, butacas seleccionadas, importe y estado de la operación.',
      'Datos de pago simulados en este prototipo: número de tarjeta, titular, vencimiento y código de seguridad. En la versión final estos datos deben procesarse directamente en la pasarela de pagos y nunca almacenarse en nuestros servidores.',
      'Datos de navegación mínimos y preferencias guardadas en el navegador, como la sesión activa del prototipo.',
    ],
  },
  {
    id: 'finalidad',
    titulo: '3. Para qué usamos los datos',
    contenido: [
      'Gestionar la compra, emitir la entrada digital con código QR y enviarla al correo indicado.',
      'Responder consultas enviadas desde el formulario de contacto y brindar soporte por compras o funciones.',
      'Enviar novedades de cartelera y preventas únicamente si marcaste la opción correspondiente. Podés darte de baja en cualquier momento.',
      'Cumplir obligaciones legales, contables y de defensa del consumidor cuando corresponda.',
      'No vendemos, alquilamos ni cedemos tus datos a terceros con fines publicitarios.',
    ],
  },
  {
    id: 'base',
    titulo: '4. Base legal y consentimiento',
    contenido: [
      'Tratamos los datos necesarios para ejecutar la compra y para responder tus consultas. El envío de novedades se basa en tu consentimiento expreso, que otorgás al tildar la casilla del boletín o del checkout.',
      'Podés retirar el consentimiento en cualquier momento sin que eso afecte las compras ya realizadas.',
    ],
  },
  {
    id: 'conservacion',
    titulo: '5. Conservación y seguridad',
    contenido: [
      'Conservamos los datos de la compra durante el plazo necesario para la gestión administrativa y legal. Los mensajes de contacto se eliminan cuando la consulta queda resuelta.',
      'Aplicamos medidas técnicas y organizativas razonables: validación estricta de los datos de entrada, acceso restringido al panel de gestión y comunicaciones cifradas mediante HTTPS en la versión productiva.',
      'Este prototipo académico no envía datos a un servidor real: la información que ingresás queda en la memoria del navegador y se pierde al recargar la página.',
    ],
  },
  {
    id: 'derechos',
    titulo: '6. Tus derechos',
    contenido: [
      'Podés solicitar el acceso, la rectificación, la actualización o la supresión de tus datos personales, así como oponerte a su tratamiento, escribiendo a hola@multiteatroflores.com.',
      'También podés solicitar la baja del boletín desde el mismo correo o desde el enlace de baja incluido en cada envío.',
      'Si considerás que tus derechos no fueron atendidos, podés presentar un reclamo ante la autoridad de aplicación en materia de protección de datos personales.',
    ],
  },
  {
    id: 'cookies',
    titulo: '7. Cookies y almacenamiento local',
    contenido: [
      'Usamos almacenamiento local del navegador para mantener la sesión del prototipo y recordar preferencias básicas. No utilizamos cookies de publicidad ni rastreadores de terceros.',
      'Podés borrar estos datos desde la configuración de tu navegador. Si lo hacés, se cerrará la sesión activa.',
    ],
  },
  {
    id: 'cambios',
    titulo: '8. Cambios en esta política',
    contenido: [
      'Podemos actualizar esta política para reflejar cambios en el servicio o en la normativa aplicable. Publicaremos la versión vigente en esta misma página e indicaremos la fecha de última actualización.',
      'Última actualización: noviembre de 2026.',
    ],
  },
]

export default function PrivacidadPage() {
  useDocumentTitle('Política de Privacidad')

  return (
    <div className="flex flex-col w-full">
      <section className="w-full border-b border-[#1b4234] bg-[#0e241c]">
        <div className="max-w-4xl mx-auto px-4 sm:px-8 py-10 lg:py-14 page-enter">
          <Link
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-ivory-muted hover:text-secondary transition-colors"
            to="/"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            Volver a la cartelera
          </Link>
          <span className="mt-6 block text-xs font-bold uppercase tracking-widest text-secondary">
            Legales
          </span>
          <h1 className="mt-2 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.1]">
            Política de Privacidad
          </h1>
          <p className="mt-4 text-sm sm:text-base text-ivory-muted leading-relaxed max-w-2xl">
            Cómo recopilamos, usamos y protegemos tus datos cuando comprás entradas, te suscribís
            al boletín o nos escribís desde el formulario de contacto.
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto w-full px-4 sm:px-8 py-10">
        <div className="flex flex-col gap-7">
          {SECCIONES.map((seccion) => (
            <article key={seccion.id} id={seccion.id} className="scroll-mt-24">
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-ivory-text">
                {seccion.titulo}
              </h2>
              <ul className="mt-3 flex flex-col gap-2.5">
                {seccion.contenido.map((parrafo) => (
                  <li
                    key={parrafo.slice(0, 40)}
                    className="flex items-start gap-2 text-sm text-ivory-muted leading-relaxed"
                  >
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-secondary shrink-0" />
                    <span>{parrafo}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="mt-10 rounded-xl border border-[#1b4234] bg-[#0e241c] p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-ivory-text">¿Tenés dudas sobre tus datos?</p>
            <p className="text-xs text-ivory-muted mt-1">
              Escribinos a hola@multiteatroflores.com y te respondemos a la brevedad.
            </p>
          </div>
          <Link
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-secondary hover:bg-secondary-hover text-[#071510] text-xs font-extrabold uppercase tracking-wider transition-colors"
            to="/contacto"
          >
            <span className="material-symbols-outlined text-base">mail</span>
            Contacto
          </Link>
        </div>
      </section>
    </div>
  )
}
