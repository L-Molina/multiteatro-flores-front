import { Navigate, useLocation } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'

/* Guard de rutas por sesión y por rol. Si no hay sesión, manda al login
   conservando el destino; si el rol no tiene permiso, muestra la pantalla
   de acceso restringido. */
export default function ProtectedRoute({ children, roles }) {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    const next = encodeURIComponent(`${location.pathname}${location.search}`)
    return <Navigate to={`/login?next=${next}`} replace />
  }

  if (roles?.length && !roles.includes(user.rol)) {
    return (
      <Navigate
        to="/acceso-denegado"
        replace
        state={{ from: `${location.pathname}${location.search}`, roles }}
      />
    )
  }

  return children
}
