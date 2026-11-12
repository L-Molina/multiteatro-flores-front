import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import useDocumentTitle from '../hooks/useDocumentTitle'
import { ROLE_LABELS, ROLES, roleLabel } from '../context/auth-context'
import { emailValido, normalizarEmail, quitarControlChars } from '../utils/validacion'

const HOME_POR_ROL = {
  [ROLES.SUPERADMIN]: '/admin/funciones',
  [ROLES.DUENO]: '/admin/funciones',
  [ROLES.USUARIO]: '/',
}

export default function LoginPage() {
  useDocumentTitle('Iniciar sesión')
  const { user, login, logout } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const nextParam = params.get('next') || ''
  const safeNext =
    nextParam && nextParam.startsWith('/') && !nextParam.startsWith('//') ? nextParam : ''

  const onSubmit = (event) => {
    event.preventDefault()
    setError('')
    const cleanEmail = normalizarEmail(email)
    const cleanPassword = quitarControlChars(password, { angles: false }).slice(0, 64)
    if (!cleanEmail || !cleanPassword) {
      setError('Completá correo electrónico y contraseña para ingresar.')
      return
    }
    if (!emailValido(cleanEmail)) {
      setError('Ingresá un correo electrónico válido (ej.: usuario@dominio.com).')
      return
    }
    if (cleanPassword.length < 6 || cleanPassword.length > 64) {
      setError('La contraseña debe tener entre 6 y 64 caracteres.')
      return
    }
    const result = login(cleanEmail, cleanPassword)
    if (!result.ok) {
      setError(result.error)
      return
    }
    navigate(safeNext || HOME_POR_ROL[result.user.rol] || '/', { replace: true })
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] w-full">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-8 py-10 lg:py-16 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center page-enter">
        <section className="flex flex-col gap-6">
          <div className="inline-flex items-center gap-2 self-start px-3 py-1.5 rounded-full bg-[#0c211a] border border-[#1e4d3a]">
            <span className="w-2 h-2 rounded-full bg-secondary" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-secondary">
              Entorno de prototipo
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.1]">
            Iniciar Sesión
          </h1>
          <p className="text-sm sm:text-base text-[#b8c7bf] leading-relaxed max-w-lg">
            Ingresá con la cuenta que creaste en este prototipo. Según tu rol vas a poder comprar
            entradas, consultar tu historial o gestionar la cartelera y las funciones de tus salas.
          </p>
          <ul className="flex flex-col gap-3 text-sm text-[#b8c7bf]">
            {[
              [
                'confirmation_number',
                'Usuario común: compra entradas, recibe el boletín y ve su historial.',
              ],
              [
                'storefront',
                'Dueño de teatro: gestiona solo las funciones y el aforo de su teatro.',
              ],
              [
                'admin_panel_settings',
                'Superadmin: administra obras, funciones y salas de todos los teatros.',
              ],
            ].map(([icon, text]) => (
              <li key={icon} className="flex items-start gap-3">
                <span className="material-symbols-outlined text-secondary text-xl">{icon}</span>
                <span>{text}</span>
              </li>
            ))}
          </ul>
          <div className="rounded-xl border border-[#1e4d3a] bg-[#0c211a] p-4 text-xs text-[#b8c7bf]">
            <p className="font-bold text-[#fdfbf7] mb-1 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base text-secondary">person_add</span>
              ¿Todavía no tenés cuenta?
            </p>
            <p className="leading-relaxed">
              Creá un usuario y elegí el rol con el que querés recorrer el prototipo. Podés
              registrarte como Superadmin, Dueño de teatro o Usuario común.
            </p>
            <Link
              className="inline-flex items-center gap-1.5 mt-3 px-3 py-2 rounded-lg border border-secondary/50 text-secondary text-[11px] font-bold uppercase tracking-wider hover:bg-[#143327] transition-colors"
              to={safeNext ? `/register?next=${encodeURIComponent(safeNext)}` : '/register'}
            >
              Crear cuenta
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>
          </div>
        </section>

        <section className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto">
          <div className="rounded-2xl border border-[#1e4d3a] bg-[#0c211a] shadow-2xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-xl bg-[#143327] border border-[#1e4d3a] flex items-center justify-center">
                <span className="material-symbols-outlined text-secondary">login</span>
              </div>
              <div>
                <h2 className="text-lg font-bold">Iniciar sesión</h2>
                <p className="text-xs text-[#b8c7bf]">Acceso a tu cuenta del prototipo</p>
              </div>
            </div>

            {user ? (
              <div className="flex flex-col gap-4">
                <div className="rounded-lg border border-[#2d6a4f] bg-[#143327]/60 p-4 text-xs text-[#b8c7bf]">
                  <p className="flex flex-wrap items-center gap-2">
                    Ya hay una sesión activa como{' '}
                    <strong className="text-white">{user.nombre}</strong>
                    <span className="px-2 py-0.5 rounded bg-[#0c211a] border border-[#1e4d3a] text-secondary text-[10px] font-bold uppercase tracking-wider">
                      {ROLE_LABELS[user.rol] || roleLabel(user.rol)}
                    </span>
                  </p>
                  <p className="mt-1 truncate">{user.email}</p>
                  {user.rol === ROLES.DUENO && user.teatroNombre ? (
                    <p className="mt-1">
                      Teatro: <strong className="text-white">{user.teatroNombre}</strong>
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-col gap-2">
                  <Link
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-secondary hover:bg-secondary-hover text-[#071510] text-xs font-extrabold uppercase tracking-wider transition-colors"
                    to="/"
                  >
                    <span className="material-symbols-outlined text-base">theater_comedy</span>
                    Ir a la cartelera
                  </Link>
                  {user.rol === ROLES.USUARIO ? (
                    <Link
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-[#1e4d3a] text-xs font-bold uppercase tracking-wider text-[#e4e8e5] hover:bg-[#143327] transition-colors"
                      to="/compras"
                    >
                      <span className="material-symbols-outlined text-base">receipt_long</span>
                      Mis compras
                    </Link>
                  ) : (
                    <Link
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-[#1e4d3a] text-xs font-bold uppercase tracking-wider text-[#e4e8e5] hover:bg-[#143327] transition-colors"
                      to="/admin/funciones"
                    >
                      <span className="material-symbols-outlined text-base">event_seat</span>
                      Panel de gestión
                    </Link>
                  )}
                  <button
                    type="button"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-[#1e4d3a] text-xs font-bold uppercase tracking-wider text-tertiary hover:bg-[#143327] transition-colors"
                    onClick={logout}
                  >
                    <span className="material-symbols-outlined text-base">logout</span>
                    Cerrar sesión
                  </button>
                </div>
              </div>
            ) : (
              <form className="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
                <div className="flex flex-col gap-1.5">
                  <label
                    className="text-[11px] font-bold uppercase tracking-wider text-[#b8c7bf]"
                    htmlFor="email"
                  >
                    Correo electrónico
                  </label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3 text-[#b8c7bf]/70 text-base">
                      mail
                    </span>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="username"
                      maxLength={254}
                      required
                      className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-[#071510] border border-[#1e4d3a] text-sm text-[#fdfbf7] focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/40"
                      value={email}
                      onChange={(event) => {
                        setEmail(event.target.value.slice(0, 254))
                        setError('')
                      }}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label
                    className="text-[11px] font-bold uppercase tracking-wider text-[#b8c7bf]"
                    htmlFor="password"
                  >
                    Contraseña
                  </label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3 text-[#b8c7bf]/70 text-base">
                      lock
                    </span>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      maxLength={64}
                      required
                      className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-[#071510] border border-[#1e4d3a] text-sm text-[#fdfbf7] focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/40"
                      value={password}
                      onChange={(event) => {
                        setPassword(event.target.value.slice(0, 64))
                        setError('')
                      }}
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
                </div>

                {error ? (
                  <p
                    className="text-xs text-tertiary bg-tertiary-container/30 border border-tertiary/50 rounded-lg px-3 py-2"
                    role="alert"
                  >
                    {error}
                  </p>
                ) : null}

                <button
                  type="submit"
                  className="w-full py-3 rounded-lg bg-secondary hover:bg-secondary-hover text-[#071510] text-sm font-extrabold uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-lg">login</span>
                  Ingresar
                </button>

                <p className="text-xs text-center text-[#b8c7bf]">
                  ¿No tenés cuenta?{' '}
                  <Link
                    className="text-secondary font-bold hover:underline"
                    to={safeNext ? `/register?next=${encodeURIComponent(safeNext)}` : '/register'}
                  >
                    Crear cuenta
                  </Link>
                </p>
              </form>
            )}

            <p className="mt-5 text-[11px] leading-relaxed text-[#b8c7bf]/80 text-center">
              Prototipo académico. No se envían datos a un servidor: las cuentas y la sesión se
              reinician al recargar la página. Consultá nuestra{' '}
              <Link className="text-secondary hover:underline" to="/privacidad">
                política de privacidad
              </Link>
              .
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
