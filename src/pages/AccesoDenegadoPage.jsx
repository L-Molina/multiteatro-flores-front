import { Link, useLocation } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import useDocumentTitle from '../hooks/useDocumentTitle'
import { ROLES, roleLabel } from '../context/auth-context'

export default function AccesoDenegadoPage() {
  useDocumentTitle('Acceso restringido')
  const { user } = useAuth()
  const location = useLocation()
  const roles = location.state?.roles || []
  const rolesTexto = roles.map(roleLabel).join(' o ')

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-8 py-20 flex flex-col items-center text-center page-enter">
      <span className="material-symbols-outlined text-5xl text-tertiary">lock_person</span>
      <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.25em] text-tertiary">
        Acceso restringido
      </p>
      <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight">
        No tenés permiso para entrar acá
      </h1>
      <p className="mt-3 text-sm text-ivory-muted max-w-lg leading-relaxed">
        {rolesTexto
          ? `Esta sección está reservada para ${rolesTexto}.`
          : 'Esta sección está reservada para cuentas con permisos de gestión.'}
        {user
          ? ` Tu cuenta es ${roleLabel(user.rol)}${
              user.rol === ROLES.DUENO && user.teatroNombre ? ` (${user.teatroNombre})` : ''
            }; podés seguir comprando entradas y consultando tu historial.`
          : ' Iniciá sesión con una cuenta habilitada para continuar.'}
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link
          className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-secondary hover:bg-secondary-hover text-[#071510] text-xs font-extrabold uppercase tracking-wider transition-colors"
          to="/"
        >
          <span className="material-symbols-outlined text-lg">theater_comedy</span>
          Volver a la cartelera
        </Link>
        {user ? (
          <Link
            className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border border-[#1e4d3a] bg-[#0c211a] hover:border-secondary/60 text-xs font-bold uppercase tracking-wider transition-colors"
            to={user.rol === ROLES.USUARIO ? '/compras' : '/admin/funciones'}
          >
            <span className="material-symbols-outlined text-lg text-secondary">
              {user.rol === ROLES.USUARIO ? 'receipt_long' : 'event_seat'}
            </span>
            {user.rol === ROLES.USUARIO ? 'Mis compras' : 'Funciones y aforo'}
          </Link>
        ) : (
          <Link
            className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border border-[#1e4d3a] bg-[#0c211a] hover:border-secondary/60 text-xs font-bold uppercase tracking-wider transition-colors"
            to="/login"
          >
            <span className="material-symbols-outlined text-lg text-secondary">login</span>
            Iniciar sesión
          </Link>
        )}
      </div>
    </div>
  )
}
