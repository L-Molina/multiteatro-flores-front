import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import useCatalog from '../../hooks/useCatalog'
import { ROLE_LABELS, ROLES } from '../../context/auth-context'

const NAV = [
  { to: '/', label: 'Cartelera', end: true },
  { to: '/quienes-somos', label: 'Quiénes Somos' },
  { to: '/preguntas-frecuentes', label: 'Preguntas Frecuentes' },
  { to: '/contacto', label: 'Contacto' },
]

export default function Header() {
  const { user, logout } = useAuth()
  const { obras } = useCatalog()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [menu, setMenu] = useState(null)
  const [readIds, setReadIds] = useState([])
  const actionsRef = useRef(null)
  const navigate = useNavigate()

  const novedades = useMemo(() => {
    const publicadas = obras.filter((obra) => obra.publicada !== false)
    return [...publicadas].sort((a, b) => b.id - a.id).slice(0, 3)
  }, [obras])

  const unread = novedades.filter((obra) => !readIds.includes(obra.id)).length

  useEffect(() => {
    if (!menu) return undefined
    const onPointerDown = (event) => {
      if (!actionsRef.current?.contains(event.target)) setMenu(null)
    }
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setMenu(null)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [menu])

  const toggleMenu = (key) => setMenu((prev) => (prev === key ? null : key))
  const closeMenus = () => setMenu(null)

  const submitSearch = (event) => {
    event.preventDefault()
    setOpen(false)
    closeMenus()
    const term = query.trim()
    navigate(term ? `/?buscar=${encodeURIComponent(term)}#cartelera` : '/#cartelera')
  }

  const linkClass = ({ isActive }) =>
    `whitespace-nowrap transition-colors ${
      isActive ? 'text-secondary font-semibold' : 'text-on-surface-variant hover:text-white'
    }`

  const logoutAndGoHome = () => {
    closeMenus()
    setOpen(false)
    logout()
    navigate('/')
  }

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50 bg-nav-bg/95 backdrop-blur-md border-b border-nav-border shadow-[0_4px_20px_rgba(0,0,0,0.35)]">
      <div className="h-20 w-full px-4 lg:px-8 max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-6 shrink-0">
          <Link className="flex items-center shrink-0" to="/" onClick={closeMenus}>
            <img
              alt="Multiteatro Flores"
              className="h-9 w-auto object-contain"
              src="/assets/logo-multiteatro.png"
            />
          </Link>
          <div className="hidden 2xl:flex shrink-0 whitespace-nowrap items-center gap-1.5 px-3 py-1 rounded bg-[#0e241c] border border-[#1b4234] text-on-surface-variant">
            <span className="material-symbols-outlined text-secondary text-[1rem]">
              location_on
            </span>
            <span className="text-xs uppercase font-medium text-on-surface">
              CABA • Plataforma digital
            </span>
          </div>
        </div>

        <nav className="hidden xl:flex items-center gap-4 2xl:gap-5 text-[13px]" aria-label="Navegación principal">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              className={linkClass}
              end={item.end}
              to={item.to}
              onClick={closeMenus}
            >
              {item.label}
            </NavLink>
          ))}
          {user ? (
            <NavLink className={linkClass} to="/compras" onClick={closeMenus}>
              Mis compras
            </NavLink>
          ) : null}
        </nav>

        <div ref={actionsRef} className="flex items-center gap-2 sm:gap-2.5">
          <form onSubmit={submitSearch} className="relative hidden sm:flex items-center" role="search">
            <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[1.1rem]">
              search
            </span>
            <input
              className="w-36 xl:w-40 2xl:w-48 pl-9 pr-3 py-1.5 rounded-lg bg-[#0e241c] border border-[#1b4234] text-xs text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:border-secondary transition-all"
              placeholder="Buscar obras..."
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="Buscar obras, elencos o fechas"
            />
          </form>

          <div className="relative">
            <button
              type="button"
              className="relative w-10 h-10 rounded-lg bg-[#0e241c] hover:bg-[#133025] border border-[#1b4234] flex items-center justify-center text-on-surface transition-colors"
              aria-label={
                unread ? `Notificaciones, ${unread} novedades sin leer` : 'Notificaciones'
              }
              aria-haspopup="true"
              aria-expanded={menu === 'notif'}
              aria-controls="notifications-panel"
              onClick={() => toggleMenu('notif')}
            >
              <span className="material-symbols-outlined text-[1.3rem]">notifications</span>
              {unread > 0 ? (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-tertiary-btn text-white text-[10px] font-bold flex items-center justify-center">
                  {unread}
                </span>
              ) : null}
            </button>

            {menu === 'notif' ? (
              <div
                id="notifications-panel"
                className="absolute right-0 top-12 w-[min(20rem,calc(100vw-2rem))] rounded-xl border border-[#1b4234] bg-[#0c211a] shadow-2xl overflow-hidden"
                role="dialog"
                aria-label="Novedades y nuevas obras"
              >
                <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-[#1b4234]">
                  <span className="text-sm font-bold text-white">Novedades</span>
                  <button
                    type="button"
                    className="inline-flex items-center min-h-[28px] text-[11px] font-semibold text-secondary hover:underline disabled:text-on-surface-variant disabled:no-underline"
                    disabled={!unread}
                    onClick={() => setReadIds(novedades.map((obra) => obra.id))}
                  >
                    Marcar leídas
                  </button>
                </div>
                <div className="flex flex-col">
                  {novedades.map((obra) => {
                    const isUnread = !readIds.includes(obra.id)
                    return (
                      <Link
                        key={obra.id}
                        className="flex items-start gap-3 px-4 py-3 hover:bg-[#133025] transition-colors border-b border-[#1b4234]/60 last:border-b-0"
                        to={`/obras/${obra.id}`}
                        onClick={() => {
                          setReadIds((prev) =>
                            prev.includes(obra.id) ? prev : [...prev, obra.id],
                          )
                          closeMenus()
                        }}
                      >
                        <span className="mt-0.5 w-9 h-9 shrink-0 rounded-lg bg-[#071510] border border-[#1b4234] flex items-center justify-center text-secondary">
                          <span className="material-symbols-outlined text-lg">new_releases</span>
                        </span>
                        <span className="min-w-0 flex flex-col">
                          <span className="text-xs font-bold text-white flex items-center gap-1.5">
                            Nueva obra en cartelera
                            {isUnread ? (
                              <span
                                className="w-1.5 h-1.5 rounded-full bg-secondary"
                                aria-label="Sin leer"
                              />
                            ) : null}
                          </span>
                          <span className="text-xs text-secondary font-semibold truncate">
                            {obra.titulo}
                          </span>
                          <span className="text-[11px] text-on-surface-variant">
                            {obra.genero} • Ya disponible
                          </span>
                        </span>
                      </Link>
                    )
                  })}
                  {!novedades.length ? (
                    <p className="px-4 py-6 text-xs text-on-surface-variant text-center">
                      No hay novedades por ahora.
                    </p>
                  ) : null}
                </div>
                <Link
                  className="flex items-center justify-between gap-2 px-4 py-3 bg-[#071510] text-[11px] font-bold uppercase tracking-wider text-secondary hover:bg-[#0e241c] transition-colors"
                  to="/#cartelera"
                  onClick={closeMenus}
                >
                  Ver toda la cartelera
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </Link>
              </div>
            ) : null}
          </div>

          <div className="relative">
            <button
              type="button"
              className={`w-10 h-10 rounded-lg border flex items-center justify-center transition-colors ${
                user
                  ? 'bg-secondary hover:bg-secondary-hover border-secondary text-[#071510]'
                  : 'bg-[#0e241c] hover:bg-[#133025] border-[#1b4234] text-on-surface'
              }`}
              aria-label={user ? 'Mi cuenta' : 'Ingresar o registrarse'}
              aria-haspopup="true"
              aria-expanded={menu === 'account'}
              aria-controls="account-panel"
              onClick={() => toggleMenu('account')}
            >
              <span className="material-symbols-outlined text-[1.3rem]">person</span>
            </button>

            {menu === 'account' ? (
              <div
                id="account-panel"
                className="absolute right-0 top-12 w-[min(18rem,calc(100vw-2rem))] rounded-xl border border-[#1b4234] bg-[#0c211a] shadow-2xl overflow-hidden"
                role="dialog"
                aria-label="Mi cuenta"
              >
                {user ? (
                  <>
                    <div className="px-4 py-4 border-b border-[#1b4234]">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-secondary">
                        Sesión iniciada
                      </p>
                      <p className="text-sm font-bold text-white mt-1">{user.nombre}</p>
                      <p className="text-xs text-on-surface-variant truncate">{user.email}</p>
                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        <span className="px-2 py-0.5 rounded bg-[#071510] border border-[#1b4234] text-secondary text-[10px] font-bold uppercase tracking-wider">
                          {ROLE_LABELS[user.rol] || 'Usuario'}
                        </span>
                        {user.rol === ROLES.DUENO && user.teatroNombre ? (
                          <span className="px-2 py-0.5 rounded bg-[#071510] border border-[#1b4234] text-[10px] text-on-surface-variant truncate max-w-full">
                            {user.teatroNombre}
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex flex-col py-1.5">
                      <Link
                        className="px-4 py-2.5 text-sm text-on-surface hover:bg-[#133025] transition-colors"
                        to="/compras"
                        onClick={closeMenus}
                      >
                        Mis compras
                      </Link>
                      {user.rol === ROLES.SUPERADMIN ? (
                        <Link
                          className="px-4 py-2.5 text-sm text-on-surface hover:bg-[#133025] transition-colors"
                          to="/admin/obras"
                          onClick={closeMenus}
                        >
                          Obras y cartelera
                        </Link>
                      ) : null}
                      {user.rol === ROLES.SUPERADMIN || user.rol === ROLES.DUENO ? (
                        <Link
                          className="px-4 py-2.5 text-sm text-on-surface hover:bg-[#133025] transition-colors"
                          to="/admin/funciones"
                          onClick={closeMenus}
                        >
                          Funciones y aforo
                        </Link>
                      ) : null}
                      <button
                        type="button"
                        className="text-left px-4 py-2.5 text-sm text-tertiary hover:bg-[#133025] transition-colors"
                        onClick={logoutAndGoHome}
                      >
                        Cerrar sesión
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="px-4 py-4 border-b border-[#1b4234]">
                      <p className="text-sm font-bold text-white">Mi cuenta</p>
                      <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                        Ingresá para comprar entradas, suscribirte al boletín y ver tu historial.
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 p-4">
                      <Link
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-secondary hover:bg-secondary-hover text-[#071510] text-xs font-extrabold uppercase tracking-wider transition-colors"
                        to="/login"
                        onClick={closeMenus}
                      >
                        <span className="material-symbols-outlined text-base">login</span>
                        Iniciar sesión
                      </Link>
                      <Link
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-[#1b4234] text-xs font-bold uppercase tracking-wider text-on-surface-variant hover:text-secondary hover:border-secondary/50 transition-colors"
                        to="/register"
                        onClick={closeMenus}
                      >
                        <span className="material-symbols-outlined text-base">person_add</span>
                        Crear cuenta
                      </Link>
                    </div>
                  </>
                )}
              </div>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => {
              closeMenus()
              setOpen((prev) => !prev)
            }}
            className="xl:hidden w-9 h-9 rounded-lg bg-[#0e241c] border border-[#1b4234] flex items-center justify-center text-on-surface"
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={open}
            aria-controls="mobile-nav"
          >
            <span className="material-symbols-outlined">{open ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>

      {open ? (
        <nav
          id="mobile-nav"
          className="xl:hidden border-t border-nav-border bg-[#0e241c] px-4 py-4 flex flex-col gap-1"
          aria-label="Navegación principal móvil"
        >
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              className={({ isActive }) =>
                `px-3 py-2.5 rounded-lg text-sm ${
                  isActive
                    ? 'bg-[#143327] text-secondary font-semibold'
                    : 'text-on-surface-variant hover:bg-[#133025] hover:text-white'
                }`
              }
              end={item.end}
              to={item.to}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
          {user ? (
            <NavLink
              className={({ isActive }) =>
                `px-3 py-2.5 rounded-lg text-sm ${
                  isActive
                    ? 'bg-[#143327] text-secondary font-semibold'
                    : 'text-on-surface-variant hover:bg-[#133025] hover:text-white'
                }`
              }
              to="/compras"
              onClick={() => setOpen(false)}
            >
              Mis compras
            </NavLink>
          ) : null}
          {user?.rol === ROLES.SUPERADMIN ? (
            <NavLink
              className={({ isActive }) =>
                `px-3 py-2.5 rounded-lg text-sm ${
                  isActive
                    ? 'bg-[#143327] text-secondary font-semibold'
                    : 'text-on-surface-variant hover:bg-[#133025] hover:text-white'
                }`
              }
              to="/admin/obras"
              onClick={() => setOpen(false)}
            >
              Obras y cartelera
            </NavLink>
          ) : null}
          {user?.rol === ROLES.SUPERADMIN || user?.rol === ROLES.DUENO ? (
            <NavLink
              className={({ isActive }) =>
                `px-3 py-2.5 rounded-lg text-sm ${
                  isActive
                    ? 'bg-[#143327] text-secondary font-semibold'
                    : 'text-on-surface-variant hover:bg-[#133025] hover:text-white'
                }`
              }
              to="/admin/funciones"
              onClick={() => setOpen(false)}
            >
              Funciones y aforo
            </NavLink>
          ) : null}
          {!user ? (
            <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-[#1b4234]">
              <Link
                className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-secondary text-[#071510] text-xs font-extrabold uppercase tracking-wider"
                to="/login"
                onClick={() => setOpen(false)}
              >
                <span className="material-symbols-outlined text-base">login</span>
                Iniciar sesión
              </Link>
              <Link
                className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-[#1b4234] text-xs font-bold uppercase tracking-wider text-on-surface-variant"
                to="/register"
                onClick={() => setOpen(false)}
              >
                <span className="material-symbols-outlined text-base">person_add</span>
                Crear cuenta
              </Link>
            </div>
          ) : null}
        </nav>
      ) : null}
    </header>
  )
}
