/* Cliente HTTP único contra el backend Spring Boot.

   El frontend es una SPA: todas las llamadas salen del navegador y el backend
   tiene CORS habilitado para el origen de Vite. La URL se puede cambiar con
   VITE_API_URL (ver .env.example).

   El token vive solo en memoria, igual que la sesión del backend: al recargar
   la página hay que volver a iniciar sesión. */

export const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api').replace(
  /\/$/,
  '',
)

let token = null

export function setToken(value) {
  token = value || null
}

export function getToken() {
  return token
}

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

/* Los errores de negocio del backend son texto plano; los 500 de Spring son
   JSON. Se intenta JSON y, si no, se conserva el texto. */
async function parseBody(response) {
  const text = await response.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

export async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (auth && token) headers.Authorization = `Bearer ${token}`

  let response
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: 'no-store',
    })
  } catch {
    throw new ApiError(
      'No pudimos conectar con el servidor. Verificá que el backend esté corriendo en el puerto 8080.',
      0,
      null,
    )
  }

  const data = await parseBody(response)

  if (!response.ok) {
    const message =
      (typeof data === 'string' && data.trim()) ||
      data?.message ||
      data?.error ||
      `La operación falló (HTTP ${response.status}).`
    throw new ApiError(message, response.status, data)
  }

  return data
}

export const api = {
  get: (path, options) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
  put: (path, body, options) => request(path, { ...options, method: 'PUT', body }),
  delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
}
