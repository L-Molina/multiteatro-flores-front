import { useCallback, useMemo, useState } from 'react'
import { AuthContext, ROLES, ROLES_GESTION, roleLabel } from './auth-context'
import { normalizarEmail } from '../utils/validacion'

const nextId = (list) => (list.length ? Math.max(...list.map((item) => item.id)) + 1 : 1)

/* Cuenta semilla para probar el panel sin pasar por el registro. */
const SEED_USER = {
  id: 1,
  nombre: 'Lautaro',
  email: 'superadmin@multiteatroflores.com',
  dni: '30111222',
  tel: '1122334455',
  localidad: 'CABA',
  password: 'superadmin123',
  rol: ROLES.SUPERADMIN,
  teatroId: null,
  teatroNombre: null,
  createdAt: new Date().toISOString(),
}

function sesionDe(user) {
  return {
    id: user.id,
    nombre: user.nombre,
    email: user.email,
    dni: user.dni,
    tel: user.tel,
    localidad: user.localidad,
    rol: user.rol,
    teatroId: user.teatroId ?? null,
    teatroNombre: user.teatroNombre ?? null,
    since: new Date().toISOString(),
  }
}

/* Los usuarios se mantienen en memoria. No hay llamadas al backend. */
export function AuthProvider({ children }) {
  const [users, setUsers] = useState([SEED_USER])
  const [user, setUser] = useState(null)

  const emailEnUso = useCallback(
    (email) => {
      const cleanEmail = normalizarEmail(email)
      return users.some((item) => item.email === cleanEmail)
    },
    [users],
  )

  const login = useCallback(
    (email, password) => {
      const cleanEmail = normalizarEmail(email)
      const found = users.find((item) => item.email === cleanEmail)

      if (!found) {
        return {
          ok: false,
          error:
            'No encontramos una cuenta con ese correo en esta sesión. Creá tu usuario para ingresar al prototipo.',
        }
      }

      if (found.password !== String(password || '')) {
        return {
          ok: false,
          error: 'La contraseña no coincide con la cuenta indicada.',
        }
      }

      const session = sesionDe(found)
      setUser(session)
      return { ok: true, user: session }
    },
    [users],
  )

  const register = useCallback(
    (payload) => {
      const cleanEmail = normalizarEmail(payload.email)

      if (emailEnUso(cleanEmail)) {
        return {
          ok: false,
          field: 'email',
          error: 'Ya existe una cuenta con ese correo en esta sesión.',
        }
      }

      const rol = Object.values(ROLES).includes(payload.rol) ? payload.rol : ROLES.USUARIO
      const nuevo = {
        id: nextId(users),
        nombre: payload.nombre,
        email: cleanEmail,
        dni: payload.dni,
        tel: payload.tel,
        localidad: payload.localidad || '',
        password: String(payload.password || ''),
        rol,
        teatroId: rol === ROLES.DUENO ? Number(payload.teatroId) || null : null,
        teatroNombre: rol === ROLES.DUENO ? payload.teatroNombre || '' : null,
        createdAt: new Date().toISOString(),
      }

      setUsers((prev) => [...prev, nuevo])
      const session = sesionDe(nuevo)
      setUser(session)
      return { ok: true, user: session }
    },
    [emailEnUso, users],
  )

  const logout = useCallback(() => {
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      users,
      isAuthenticated: Boolean(user),
      isSuperadmin: user?.rol === ROLES.SUPERADMIN,
      isDueno: user?.rol === ROLES.DUENO,
      isUsuario: user?.rol === ROLES.USUARIO,
      puedeGestionar: ROLES_GESTION.includes(user?.rol),
      roleLabel,
      emailEnUso,
      login,
      register,
      logout,
    }),
    [user, users, emailEnUso, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
