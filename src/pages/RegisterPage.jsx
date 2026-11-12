import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import useCatalog from '../hooks/useCatalog'
import useDocumentTitle from '../hooks/useDocumentTitle'
import { ROLE_LABELS, ROLE_OPTIONS, ROLES } from '../context/auth-context'
import {
  MAX,
  dniValido,
  emailValido,
  formatearDni,
  limpiarTexto,
  localidadValida,
  nombreValido,
  normalizarEmail,
  quitarControlChars,
  telefonoValido,
} from '../utils/validacion'

const FORM_INICIAL = {
  nombre: '',
  email: '',
  dni: '',
  tel: '',
  localidad: '',
  password: '',
  confirm: '',
  rol: ROLES.USUARIO,
  origenTeatro: 'existente',
  teatroId: '',
  teatroNombre: '',
  teatroDireccion: '',
  teatroLocalidad: '',
  acepta: false,
}

function ErrorCampo({ id, children }) {
  if (!children) return null
  return (
    <p id={id} className="field-error">
      {children}
    </p>
  )
}

export default function RegisterPage() {
  useDocumentTitle('Crear cuenta')
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, register, logout, emailEnUso } = useAuth()
  const { teatros, addTeatro } = useCatalog()
  const nextParam = searchParams.get('next') || ''
  const safeNext =
    nextParam && nextParam.startsWith('/') && !nextParam.startsWith('//') ? nextParam : ''
  const [form, setForm] = useState(FORM_INICIAL)
  const [errors, setErrors] = useState({})
  const [generalError, setGeneralError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const esDueno = form.rol === ROLES.DUENO

  const update = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }))
    setGeneralError('')
    setErrors((prev) => {
      if (!prev[name]) return prev
      const next = { ...prev }
      delete next[name]
      return next
    })
  }

  const onRoleChange = (rol) => {
    setForm((prev) => ({
      ...prev,
      rol,
      ...(rol !== ROLES.DUENO
        ? {
            origenTeatro: 'existente',
            teatroId: '',
            teatroNombre: '',
            teatroDireccion: '',
            teatroLocalidad: '',
          }
        : {}),
    }))
    setGeneralError('')
    setErrors({})
  }

  const cambiarOrigenTeatro = (origen) => {
    setForm((prev) => ({ ...prev, origenTeatro: origen }))
    setGeneralError('')
    setErrors((prev) => {
      const next = { ...prev }
      delete next.teatroId
      delete next.teatroNombre
      delete next.teatroDireccion
      delete next.teatroLocalidad
      return next
    })
  }

  const validar = () => {
    const nextErrors = {}

    if (!nombreValido(form.nombre, 3)) {
      nextErrors.nombre = 'Ingresá tu nombre y apellido reales (solo letras, sin números).'
    }
    if (!dniValido(form.dni)) {
      nextErrors.dni = 'Ingresá un DNI válido de 7 u 8 dígitos.'
    }
    if (!emailValido(form.email)) {
      nextErrors.email = 'Ingresá un correo electrónico válido (ej.: nombre@dominio.com).'
    }
    if (!telefonoValido(form.tel)) {
      nextErrors.tel = 'Ingresá un teléfono válido de 8 a 15 dígitos.'
    }
    if (!localidadValida(form.localidad)) {
      nextErrors.localidad = 'La localidad solo admite letras, números y espacios.'
    }
    if (form.password.length < 6) {
      nextErrors.password = 'La contraseña debe tener al menos 6 caracteres.'
    }
    if (form.confirm !== form.password) {
      nextErrors.confirm = 'Las contraseñas no coinciden.'
    }
    if (!Object.values(ROLES).includes(form.rol)) {
      nextErrors.rol = 'Elegí un rol válido.'
    }

    if (esDueno) {
      if (form.origenTeatro === 'existente') {
        if (!form.teatroId) {
          nextErrors.teatroId = 'Seleccioná el teatro del que sos dueño.'
        }
      } else {
        const nombreTeatro = limpiarTexto(form.teatroNombre, MAX.titulo)
        if (nombreTeatro.length < 3 || !/[a-záéíóúüñ]/i.test(nombreTeatro)) {
          nextErrors.teatroNombre = 'Ingresá el nombre del teatro (mínimo 3 letras).'
        } else if (
          teatros.some(
            (teatro) => teatro.nombre.toLowerCase() === nombreTeatro.toLowerCase(),
          )
        ) {
          nextErrors.teatroNombre = 'Ya existe un teatro con ese nombre.'
        }
        if (limpiarTexto(form.teatroDireccion, 120).length < 5) {
          nextErrors.teatroDireccion = 'Ingresá la dirección del teatro.'
        }
        if (!localidadValida(form.teatroLocalidad)) {
          nextErrors.teatroLocalidad = 'La localidad solo admite letras, números y espacios.'
        }
      }
    }

    if (!form.acepta) {
      nextErrors.acepta = 'Tenés que aceptar la política de privacidad para crear la cuenta.'
    }

    if (emailEnUso(form.email)) {
      nextErrors.email = 'Ya existe una cuenta con ese correo en esta sesión.'
    }

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      setGeneralError('Revisá los datos marcados para poder crear la cuenta.')
      return false
    }
    return true
  }

  const onSubmit = (event) => {
    event.preventDefault()
    setGeneralError('')
    if (!validar()) return

    let teatroId = null
    let teatroNombre = null

    if (esDueno) {
      if (form.origenTeatro === 'existente') {
        const teatro = teatros.find((item) => item.id === Number(form.teatroId))
        teatroId = teatro?.id ?? null
        teatroNombre = teatro?.nombre ?? null
      } else {
        const nuevo = addTeatro({
          nombre: limpiarTexto(form.teatroNombre, MAX.titulo),
          direccion: limpiarTexto(form.teatroDireccion, 120),
          localidad: limpiarTexto(form.teatroLocalidad, MAX.localidad),
        })
        teatroId = nuevo.id
        teatroNombre = nuevo.nombre
      }
    }

    const result = register({
      nombre: limpiarTexto(form.nombre, MAX.nombre),
      email: normalizarEmail(form.email),
      dni: form.dni,
      tel: form.tel,
      localidad: limpiarTexto(form.localidad, MAX.localidad),
      password: form.password,
      rol: form.rol,
      teatroId,
      teatroNombre,
    })

    if (!result.ok) {
      setGeneralError(result.error)
      if (result.field) setErrors((prev) => ({ ...prev, [result.field]: result.error }))
      return
    }

    navigate(
      safeNext || (result.user.rol === ROLES.USUARIO ? '/compras' : '/admin/funciones'),
      { replace: true },
    )
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-8 py-10 lg:py-14 page-enter">
      <div className="grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-8 items-start">
        <section className="flex flex-col gap-6 lg:sticky lg:top-28">
          <div className="inline-flex items-center gap-2 self-start px-3 py-1.5 rounded-full bg-[#0c211a] border border-[#1e4d3a]">
            <span className="w-2 h-2 rounded-full bg-secondary" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-secondary">
              Cuenta de prototipo
            </span>
          </div>
          <div className="flex flex-col gap-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-[1.1]">
              Crear cuenta
            </h1>
            <p className="text-sm text-[#b8c7bf] leading-relaxed max-w-lg">
              Registrate para comprar entradas, suscribirte al boletín y acceder a tu historial.
              También podés elegir un rol de gestión para recorrer el panel según tus permisos.
            </p>
          </div>

          <div className="rounded-xl border border-[#1e4d3a] bg-[#0c211a] p-4">
            <p className="text-xs font-bold text-white mb-3 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base text-secondary">
                verified_user
              </span>
              Roles disponibles
            </p>
            <div className="flex flex-col gap-3">
              {ROLE_OPTIONS.map((option) => (
                <div key={option.value} className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-secondary text-lg mt-0.5">
                    {option.icon}
                  </span>
                  <div>
                    <p className="text-xs font-bold text-white">{option.label}</p>
                    <p className="text-[11px] text-[#b8c7bf] leading-relaxed">
                      {option.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-[11px] text-[#b8c7bf]/80 leading-relaxed">
            Este prototipo no envía datos a un servidor. Las cuentas nuevas se guardan en memoria
            y se reinician al recargar la página. Consultá nuestra{' '}
            <Link className="text-secondary hover:underline" to="/privacidad">
              política de privacidad
            </Link>
            .
          </p>
        </section>

        <section className="w-full rounded-2xl border border-[#1e4d3a] bg-[#0c211a] shadow-2xl p-5 sm:p-7">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-xl bg-[#143327] border border-[#1e4d3a] flex items-center justify-center">
              <span className="material-symbols-outlined text-secondary">person_add</span>
            </div>
            <div>
              <h2 className="text-lg font-bold">Datos de la cuenta</h2>
              <p className="text-xs text-[#b8c7bf]">Todos los campos son obligatorios.</p>
            </div>
          </div>

          {user ? (
            <div className="rounded-lg border border-[#2d6a4f] bg-[#143327]/60 p-4 text-xs text-[#b8c7bf]">
              <p>
                Ya hay una sesión activa como{' '}
                <strong className="text-white">{user.nombre}</strong> (
                {ROLE_LABELS[user.rol] || 'Usuario'}).
              </p>
              <p className="mt-2">
                Para crear otra cuenta, cerrá la sesión actual y volvé a esta pantalla.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <Link
                  className="px-3 py-1.5 rounded bg-secondary text-[#071510] font-bold"
                  to="/"
                >
                  Ir a la cartelera
                </Link>
                <button
                  type="button"
                  className="px-3 py-1.5 rounded border border-[#1e4d3a] hover:bg-[#143327]"
                  onClick={logout}
                >
                  Cerrar sesión
                </button>
              </div>
            </div>
          ) : (
            <form className="flex flex-col gap-5" onSubmit={onSubmit} noValidate>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="form-label" htmlFor="register-nombre">
                    Nombre y apellido *
                  </label>
                  <input
                    id="register-nombre"
                    className={`form-input ${errors.nombre ? 'form-error' : ''}`}
                    type="text"
                    autoComplete="name"
                    maxLength={MAX.nombre}
                    value={form.nombre}
                    onChange={(event) => update('nombre', limpiarTexto(event.target.value, MAX.nombre))}
                    aria-invalid={Boolean(errors.nombre)}
                    aria-describedby={errors.nombre ? 'error-register-nombre' : undefined}
                  />
                  <ErrorCampo id="error-register-nombre">{errors.nombre}</ErrorCampo>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="form-label" htmlFor="register-dni">
                    DNI *
                  </label>
                  <input
                    id="register-dni"
                    className={`form-input ${errors.dni ? 'form-error' : ''}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={10}
                    value={form.dni}
                    onChange={(event) => update('dni', formatearDni(event.target.value))}
                    aria-invalid={Boolean(errors.dni)}
                    aria-describedby={errors.dni ? 'error-register-dni' : undefined}
                  />
                  <ErrorCampo id="error-register-dni">{errors.dni}</ErrorCampo>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="form-label" htmlFor="register-tel">
                    Teléfono *
                  </label>
                  <input
                    id="register-tel"
                    className={`form-input ${errors.tel ? 'form-error' : ''}`}
                    type="tel"
                    autoComplete="tel"
                    maxLength={MAX.telefono}
                    value={form.tel}
                    onChange={(event) =>
                      update(
                        'tel',
                        quitarControlChars(event.target.value, { angles: false })
                          .replace(/[^\d+()\s.-]/g, '')
                          .slice(0, MAX.telefono),
                      )
                    }
                    aria-invalid={Boolean(errors.tel)}
                    aria-describedby={errors.tel ? 'error-register-tel' : undefined}
                  />
                  <ErrorCampo id="error-register-tel">{errors.tel}</ErrorCampo>
                </div>

                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="form-label" htmlFor="register-localidad">
                    Localidad
                  </label>
                  <input
                    id="register-localidad"
                    className={`form-input ${errors.localidad ? 'form-error' : ''}`}
                    type="text"
                    autoComplete="address-level2"
                    maxLength={MAX.localidad}
                    placeholder="Ej.: Flores, CABA"
                    value={form.localidad}
                    onChange={(event) =>
                      update('localidad', limpiarTexto(event.target.value, MAX.localidad))
                    }
                    aria-invalid={Boolean(errors.localidad)}
                    aria-describedby={errors.localidad ? 'error-register-localidad' : undefined}
                  />
                  <ErrorCampo id="error-register-localidad">{errors.localidad}</ErrorCampo>
                </div>

                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="form-label" htmlFor="register-email">
                    Correo electrónico *
                  </label>
                  <input
                    id="register-email"
                    className={`form-input ${errors.email ? 'form-error' : ''}`}
                    type="email"
                    autoComplete="email"
                    maxLength={MAX.email}
                    value={form.email}
                    onChange={(event) =>
                      update(
                        'email',
                        quitarControlChars(event.target.value, { angles: false }).slice(
                          0,
                          MAX.email,
                        ),
                      )
                    }
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? 'error-register-email' : undefined}
                  />
                  <ErrorCampo id="error-register-email">{errors.email}</ErrorCampo>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="form-label" htmlFor="register-password">
                    Contraseña *
                  </label>
                  <div className="relative flex items-center">
                    <input
                      id="register-password"
                      className={`form-input pr-11 ${errors.password ? 'form-error' : ''}`}
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      maxLength={64}
                      value={form.password}
                      onChange={(event) =>
                        update(
                          'password',
                          quitarControlChars(event.target.value, { angles: false }).slice(0, 64),
                        )
                      }
                      aria-invalid={Boolean(errors.password)}
                      aria-describedby={errors.password ? 'error-register-password' : undefined}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-2 w-7 h-7 rounded flex items-center justify-center text-[#b8c7bf] hover:text-secondary"
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      <span className="material-symbols-outlined text-base">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                  <ErrorCampo id="error-register-password">{errors.password}</ErrorCampo>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="form-label" htmlFor="register-confirm">
                    Repetir contraseña *
                  </label>
                  <input
                    id="register-confirm"
                    className={`form-input ${errors.confirm ? 'form-error' : ''}`}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    maxLength={64}
                    value={form.confirm}
                    onChange={(event) =>
                      update(
                        'confirm',
                        quitarControlChars(event.target.value, { angles: false }).slice(0, 64),
                      )
                    }
                    aria-invalid={Boolean(errors.confirm)}
                    aria-describedby={errors.confirm ? 'error-register-confirm' : undefined}
                  />
                  <ErrorCampo id="error-register-confirm">{errors.confirm}</ErrorCampo>
                </div>
              </div>

              <fieldset className="flex flex-col gap-2.5">
                <legend className="form-label mb-1">Rol dentro de la aplicación *</legend>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {ROLE_OPTIONS.map((option) => {
                    const activo = form.rol === option.value
                    return (
                      <label
                        key={option.value}
                        className={`flex flex-col gap-1.5 rounded-xl border p-3 cursor-pointer transition-colors ${
                          activo
                            ? 'border-secondary/80 bg-[#143327]'
                            : 'border-[#1e4d3a] bg-[#071510] hover:border-secondary/40'
                        }`}
                      >
                        <input
                          type="radio"
                          name="rol"
                          value={option.value}
                          checked={activo}
                          onChange={() => onRoleChange(option.value)}
                          className="sr-only"
                        />
                        <span className="flex items-center gap-2">
                          <span
                            className={`material-symbols-outlined text-lg ${
                              activo ? 'text-secondary' : 'text-[#b8c7bf]'
                            }`}
                          >
                            {option.icon}
                          </span>
                          <span className="text-xs font-bold text-white">{option.label}</span>
                          <span
                            className={`ml-auto w-3.5 h-3.5 rounded-full border ${
                              activo
                                ? 'border-secondary bg-secondary'
                                : 'border-[#1e4d3a] bg-transparent'
                            }`}
                            aria-hidden="true"
                          />
                        </span>
                        <span className="text-[11px] text-[#b8c7bf] leading-relaxed">
                          {option.description}
                        </span>
                      </label>
                    )
                  })}
                </div>
                <ErrorCampo id="error-register-rol">{errors.rol}</ErrorCampo>
              </fieldset>

              {esDueno ? (
                <div className="rounded-xl border border-[#1e4d3a] bg-[#071510]/60 p-4 flex flex-col gap-3">
                  <div>
                    <p className="text-xs font-bold text-white">Teatro del que sos dueño</p>
                    <p className="text-[11px] text-[#b8c7bf] leading-relaxed mt-0.5">
                      Solo vas a poder gestionar las funciones y el aforo de las salas de este
                      teatro. El resto del sitio queda disponible para comprar como cualquier
                      usuario.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {[
                      ['existente', 'Teatro existente', 'domain'],
                      ['nuevo', 'Teatro nuevo', 'add_business'],
                    ].map(([value, label, icon]) => (
                      <button
                        key={value}
                        type="button"
                        aria-pressed={form.origenTeatro === value}
                        onClick={() => cambiarOrigenTeatro(value)}
                        className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border text-[11px] font-bold transition-colors ${
                          form.origenTeatro === value
                            ? 'border-secondary bg-[#143327] text-secondary'
                            : 'border-[#1e4d3a] text-[#b8c7bf] hover:border-secondary/40'
                        }`}
                      >
                        <span className="material-symbols-outlined text-base">{icon}</span>
                        {label}
                      </button>
                    ))}
                  </div>

                  {form.origenTeatro === 'existente' ? (
                    <div className="flex flex-col gap-1.5">
                      <label className="form-label" htmlFor="register-teatro">
                        Teatro *
                      </label>
                      <select
                        id="register-teatro"
                        className={`form-input ${errors.teatroId ? 'form-error' : ''}`}
                        value={form.teatroId}
                        onChange={(event) => update('teatroId', event.target.value)}
                        aria-invalid={Boolean(errors.teatroId)}
                        aria-describedby={errors.teatroId ? 'error-register-teatro' : undefined}
                      >
                        <option value="">Seleccioná un teatro...</option>
                        {teatros.map((teatro) => (
                          <option key={teatro.id} value={teatro.id}>
                            {teatro.nombre} — {teatro.localidad}
                          </option>
                        ))}
                      </select>
                      <ErrorCampo id="error-register-teatro">{errors.teatroId}</ErrorCampo>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1.5 sm:col-span-2">
                        <label className="form-label" htmlFor="register-teatro-nombre">
                          Nombre del teatro *
                        </label>
                        <input
                          id="register-teatro-nombre"
                          className={`form-input ${errors.teatroNombre ? 'form-error' : ''}`}
                          type="text"
                          maxLength={MAX.titulo}
                          value={form.teatroNombre}
                          onChange={(event) =>
                            update('teatroNombre', limpiarTexto(event.target.value, MAX.titulo))
                          }
                          aria-invalid={Boolean(errors.teatroNombre)}
                          aria-describedby={
                            errors.teatroNombre ? 'error-register-teatro-nombre' : undefined
                          }
                        />
                        <ErrorCampo id="error-register-teatro-nombre">
                          {errors.teatroNombre}
                        </ErrorCampo>
                      </div>
                      <div className="flex flex-col gap-1.5 sm:col-span-2">
                        <label className="form-label" htmlFor="register-teatro-direccion">
                          Dirección *
                        </label>
                        <input
                          id="register-teatro-direccion"
                          className={`form-input ${errors.teatroDireccion ? 'form-error' : ''}`}
                          type="text"
                          maxLength={120}
                          value={form.teatroDireccion}
                          onChange={(event) =>
                            update('teatroDireccion', limpiarTexto(event.target.value, 120))
                          }
                          aria-invalid={Boolean(errors.teatroDireccion)}
                          aria-describedby={
                            errors.teatroDireccion ? 'error-register-teatro-direccion' : undefined
                          }
                        />
                        <ErrorCampo id="error-register-teatro-direccion">
                          {errors.teatroDireccion}
                        </ErrorCampo>
                      </div>
                      <div className="flex flex-col gap-1.5 sm:col-span-2">
                        <label className="form-label" htmlFor="register-teatro-localidad">
                          Localidad
                        </label>
                        <input
                          id="register-teatro-localidad"
                          className={`form-input ${errors.teatroLocalidad ? 'form-error' : ''}`}
                          type="text"
                          maxLength={MAX.localidad}
                          placeholder="Ej.: Flores, CABA"
                          value={form.teatroLocalidad}
                          onChange={(event) =>
                            update(
                              'teatroLocalidad',
                              limpiarTexto(event.target.value, MAX.localidad),
                            )
                          }
                          aria-invalid={Boolean(errors.teatroLocalidad)}
                          aria-describedby={
                            errors.teatroLocalidad ? 'error-register-teatro-localidad' : undefined
                          }
                        />
                        <ErrorCampo id="error-register-teatro-localidad">
                          {errors.teatroLocalidad}
                        </ErrorCampo>
                      </div>
                      <p className="sm:col-span-2 text-[11px] text-[#b8c7bf] leading-relaxed">
                        El teatro nuevo se crea con 3 salas de 25 butacas, listas para configurar
                        desde el módulo de funciones y aforo.
                      </p>
                    </div>
                  )}
                </div>
              ) : null}

              <label className="flex items-start gap-2 text-xs text-[#b8c7bf] cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-0.5 accent-[#efbf69]"
                  checked={form.acepta}
                  onChange={(event) => update('acepta', event.target.checked)}
                  aria-invalid={Boolean(errors.acepta)}
                  aria-describedby={errors.acepta ? 'error-register-acepta' : undefined}
                />
                <span>
                  Acepto la{' '}
                  <Link className="text-secondary hover:underline" to="/privacidad">
                    política de privacidad
                  </Link>{' '}
                  y el uso de mis datos para gestionar la cuenta y las compras del prototipo.
                </span>
              </label>
              <ErrorCampo id="error-register-acepta">{errors.acepta}</ErrorCampo>

              {generalError ? (
                <p
                  className="text-xs text-tertiary bg-tertiary-container/30 border border-tertiary/50 rounded-lg px-3 py-2"
                  role="alert"
                >
                  {generalError}
                </p>
              ) : null}

              <button
                type="submit"
                className="w-full py-3 rounded-lg bg-secondary hover:bg-secondary-hover text-[#071510] text-sm font-extrabold uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">person_add</span>
                Crear cuenta
              </button>

              <p className="text-xs text-center text-[#b8c7bf]">
                ¿Ya tenés una cuenta?{' '}
                <Link className="text-secondary font-bold hover:underline" to="/login">
                  Iniciar sesión
                </Link>
              </p>
            </form>
          )}
        </section>
      </div>
    </div>
  )
}
