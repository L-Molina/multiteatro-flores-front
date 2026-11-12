import { Link } from 'react-router-dom'

const FIELDS = [
  {
    name: 'nombre',
    label: 'Nombre y apellido del titular *',
    placeholder: 'Ej.: Facundo Morales',
    autoComplete: 'name',
    colSpan: true,
    type: 'text',
    maxLength: 80,
  },
  {
    name: 'dni',
    label: 'DNI / Documento *',
    placeholder: 'Ej.: 32.456.789',
    inputMode: 'numeric',
    type: 'text',
    maxLength: 10,
  },
  {
    name: 'email',
    label: 'Correo electrónico *',
    placeholder: 'titular@email.com',
    autoComplete: 'email',
    type: 'email',
    maxLength: 254,
  },
  {
    name: 'tel',
    label: 'Teléfono / WhatsApp *',
    placeholder: '+54 9 11 ...',
    autoComplete: 'tel',
    type: 'tel',
    maxLength: 20,
  },
  {
    name: 'localidad',
    label: 'Localidad',
    placeholder: 'Ej.: Flores, CABA',
    autoComplete: 'address-level2',
    type: 'text',
    maxLength: 60,
  },
]

export default function TitularStep({ holder, onChange, onToggleNews, errors }) {
  return (
    <section className="wizard-step rounded-xl border border-outline-border bg-surface-dark p-5 sm:p-6 flex flex-col gap-4" aria-label="Datos del titular">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {FIELDS.map((field) => (
          <div
            key={field.name}
            className={`flex flex-col gap-1.5 ${field.colSpan ? 'sm:col-span-2' : ''}`}
          >
            <label className="form-label" htmlFor={`holder-${field.name}`}>
              {field.label}
            </label>
            <input
              id={`holder-${field.name}`}
              name={field.name}
              className={`form-input ${errors[field.name] ? 'form-error' : ''}`}
              type={field.type}
              inputMode={field.inputMode}
              placeholder={field.placeholder}
              autoComplete={field.autoComplete}
              maxLength={field.maxLength}
              value={holder[field.name]}
              onChange={(event) => onChange(field.name, event.target.value)}
              aria-invalid={Boolean(errors[field.name])}
              aria-describedby={errors[field.name] ? `error-${field.name}` : undefined}
            />
            {errors[field.name] ? (
              <p id={`error-${field.name}`} className="field-error">
                {errors[field.name]}
              </p>
            ) : null}
          </div>
        ))}
      </div>

      <label className="flex items-start gap-2 text-xs text-ivory-muted cursor-pointer">
        <input
          id="holder-news"
          className="mt-0.5 accent-[#efbf69]"
          type="checkbox"
          checked={holder.news}
          onChange={(event) => onToggleNews(event.target.checked)}
        />
        Quiero recibir novedades de cartelera y preventas de Multiteatro Flores.
      </label>
      <p className="text-[11px] text-ivory-muted/70">
        Los datos del titular deben coincidir con el documento que se presentará en la puerta si el
        personal de sala lo solicita. No se imprimen entradas: el QR se envía al correo indicado.
        Solo usamos estos datos para gestionar la compra. Ver{' '}
        <Link className="text-secondary hover:underline" to="/privacidad">
          política de privacidad
        </Link>
        .
      </p>
    </section>
  )
}
