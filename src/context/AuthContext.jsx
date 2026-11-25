import { useCallback, useMemo, useRef, useState } from 'react'
import { AuthContext, ROLES, ROLES_GESTION, roleLabel } from './auth-context'
import { api, setToken } from '../api/client'
import { mapUsuario } from '../api/mappers'
import { normalizarEmail } from '../utils/validacion'

/* Sesión real contra POST /api/auth/login.

   El backend devuelve { token, usuario } y el token se manda como
   Authorization: Bearer en cada request. La sesión vive en memoria: al
   recargar la página hay que volver a ingresar, igual que en el backend
   (SesionService también guarda los tokens en memoria).

   El backend solo permite registrarse como CLIENTE. Las cuentas de gestión
   (ADMIN / SUPERADMIN) se crean por administración o vienen en script.sql. */

const TEATROS_PUBLICOS = '/teatros'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [emailsRegistrados, setEmailsRegistrados] = useState([])
  const perfiles = useRef({})

  const completarPerfil = useCallback(async (usuarioBackend) => {
    const extra = perfiles.current[normalizarEmail(usuarioBackend.email)] || {}
    const base = mapUsuario(usuarioBackend, extra)

    // Un ADMIN no trae teatroId: se deriva del teatro público que lo tiene
    // como administrador. Es un dato de presentación para el panel.
    if (base.rol === ROLES.DUENO && base.teatroId == null) {
      try {
        const teatros = await api.get(TEATROS_PUBLICOS, { auth: false })
        const propio = (teatros || []).find(
          (teatro) => Number(teatro.admin?.id) === Number(base.id),
        )
        if (propio) {
          base.teatroId = Number(propio.id)
          base.teatroNombre = propio.nombre
        }
      } catch {
        // Si falla la consulta, el panel muestra "Sin teatro" y el backend
        // sigue aplicando sus permisos.
      }
    }

    setUser(base)
    return base
  }, [])

  const login = useCallback(
    async (email, password) => {
      const cleanEmail = normalizarEmail(email)
      try {
        const data = await api.post(
          '/auth/login',
          { email: cleanEmail, password: String(password || '') },
          { auth: false },
        )
        setToken(data.token)
        const sesion = await completarPerfil(data.usuario)
        return { ok: true, user: sesion }
      } catch (error) {
        const mensaje =
          error?.status === 401
            ? 'Correo o contraseña incorrectos. Verificá los datos e intentá de nuevo.'
            : error?.message || 'No pudimos iniciar sesión.'
        return { ok: false, error: mensaje }
      }
    },
    [completarPerfil],
  )

  const register = useCallback(
    async (payload) => {
      const cleanEmail = normalizarEmail(payload.email)
      try {
        const data = await api.post(
          '/auth/register',
          {
            name: payload.nombre,
            email: cleanEmail,
            password: String(payload.password || ''),
          },
          { auth: false },
        )

        perfiles.current[cleanEmail] = {
          dni: payload.dni || '',
          tel: payload.tel || '',
          localidad: payload.localidad || '',
        }
        setEmailsRegistrados((prev) =>
          prev.includes(cleanEmail) ? prev : [...prev, cleanEmail],
        )
        setToken(data.token)
        const sesion = await completarPerfil(data.usuario)
        return { ok: true, user: sesion }
      } catch (error) {
        const esDuplicado =
          error?.status === 409 ||
          /existe|duplicad|duplicate|unique/i.test(String(error?.message || ''))
        const mensaje = esDuplicado
          ? 'Ya existe una cuenta con ese correo electrónico.'
          : error?.message || 'No pudimos crear la cuenta.'
        return {
          ok: false,
          field: esDuplicado ? 'email' : undefined,
          error: mensaje,
        }
      }
    },
    [completarPerfil],
  )

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout')
    } catch {
      // El token puede haber vencido; igual se limpia la sesión local.
    }
    setToken(null)
    setUser(null)
  }, [])

  const emailEnUso = useCallback(
    (email) => emailsRegistrados.includes(normalizarEmail(email)),
    [emailsRegistrados],
  )

  const value = useMemo(
    () => ({
      user,
      users: [],
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
    [user, emailEnUso, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
