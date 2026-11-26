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

/* Subida multipart. No se fija Content-Type: el navegador agrega el boundary
   que corresponde a FormData. */
export async function upload(path, file) {
  const headers = { Accept: 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`

  const form = new FormData()
  form.append('archivo', file)

  let response
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers,
      body: form,
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
      `No pudimos subir el archivo (HTTP ${response.status}).`
    throw new ApiError(message, response.status, data)
  }

  return data
}

/* Descarga autenticada de un archivo (por ejemplo, el comprobante). El token
   viaja en el header, por eso no se puede usar un <a href> directo. */
export async function blob(path) {
  const headers = { Accept: '*/*' }
  if (token) headers.Authorization = `Bearer ${token}`

  let response
  try {
    response = await fetch(`${API_BASE}${path}`, { headers, cache: 'no-store' })
  } catch {
    throw new ApiError(
      'No pudimos conectar con el servidor. Verificá que el backend esté corriendo en el puerto 8080.',
      0,
      null,
    )
  }

  if (!response.ok) {
    const data = await parseBody(response)
    const message =
      (typeof data === 'string' && data.trim()) ||
      data?.message ||
      data?.error ||
      `No pudimos descargar el archivo (HTTP ${response.status}).`
    throw new ApiError(message, response.status, data)
  }

  return response.blob()
}

export const api = {
  get: (path, options) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
  put: (path, body, options) => request(path, { ...options, method: 'PUT', body }),
  delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
  upload,
  blob,
}
