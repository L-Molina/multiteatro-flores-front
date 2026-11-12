/* Validación y normalización de datos de entrada.
   Todo lo que el usuario escribe pasa por acá antes de llegar al estado de la app
   (y, en la versión final, antes de viajar al backend). La idea es que ningún
   valor raro, vacío, gigante o con caracteres de control pueda romper la UI ni
   un contrato de API. */

/* Quita caracteres de control (y opcionalmente < y >) sin usar una regex con
   caracteres de control, para no disparar falsos positivos del linter. */
export function quitarControlChars(value, { multiline = false, angles = true } = {}) {
  return Array.from(String(value ?? ''))
    .filter((ch) => {
      const code = ch.codePointAt(0)
      if (code === 127) return false
      if (code < 32) return multiline && (code === 9 || code === 10 || code === 13)
      if (angles && (ch === '<' || ch === '>')) return false
      return true
    })
    .join('')
}

export const MAX = {
  email: 254,
  nombre: 80,
  dni: 8,
  telefono: 20,
  localidad: 60,
  mensaje: 1000,
  titulo: 90,
  elenco: 140,
  sinopsis: 1200,
  schedule: 120,
  tarjeta: 19,
  cvv: 4,
}

/** Quita caracteres de control y etiquetas angulares, colapsa espacios y recorta. */
export function limpiarTexto(value, max = 120) {
  return quitarControlChars(value, { angles: true })
    .replace(/\s+/g, ' ')
    .slice(0, max)
}

/** Igual que limpiarTexto pero conserva saltos de línea (sinopsis, mensajes). */
export function limpiarMultilinea(value, max = MAX.mensaje) {
  return quitarControlChars(value, { multiline: true, angles: true })
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trimStart()
    .slice(0, max)
}

export function soloDigitos(value, max = 30) {
  return String(value ?? '')
    .replace(/\D/g, '')
    .slice(0, max)
}

export function normalizarEmail(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .slice(0, MAX.email)
}

export function formatearTarjeta(value) {
  const digits = soloDigitos(value, MAX.tarjeta)
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ')
}

export function formatearVencimiento(value) {
  const digits = soloDigitos(value, 4)
  if (digits.length <= 2) return digits
  return `${digits.slice(0, 2)} / ${digits.slice(2)}`
}

export function formatearDni(value) {
  const digits = soloDigitos(value, MAX.dni)
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

const EMAIL_RE =
  /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i

export function emailValido(value) {
  const email = normalizarEmail(value)
  if (!email || email.length > MAX.email) return false
  if (email.includes('..') || email.startsWith('.') || email.includes('.@')) return false
  return EMAIL_RE.test(email)
}

/** Nombres: letras (con acentos), espacios, apóstrofes, guiones y puntos. */
export function nombreValido(value, min = 3) {
  const nombre = limpiarTexto(value, MAX.nombre)
  if (nombre.length < min) return false
  if (!/[a-záéíóúüñ]/i.test(nombre)) return false
  return /^[a-záéíóúüñ][a-záéíóúüñ' .-]*$/i.test(nombre)
}

export function dniValido(value) {
  const digits = soloDigitos(value, 9)
  return /^\d{7,8}$/.test(digits)
}

/** Teléfono: admite +, espacios, guiones y paréntesis; entre 8 y 15 dígitos. */
export function telefonoValido(value) {
  const raw = String(value ?? '').trim()
  if (!/^[\d+()\s.-]+$/.test(raw)) return false
  const digits = soloDigitos(raw, 20)
  return /^\d{8,15}$/.test(digits)
}

export function localidadValida(value) {
  const localidad = limpiarTexto(value, MAX.localidad)
  if (!localidad) return true
  return /^[a-záéíóúüñ0-9][a-záéíóúüñ0-9' .,-]*$/i.test(localidad)
}

/** Algoritmo de Luhn: descarta números de tarjeta inventados o mal tipeados. */
export function luhnValido(value) {
  const digits = soloDigitos(value, MAX.tarjeta)
  if (digits.length < 15 || digits.length > 19) return false
  let sum = 0
  let double = false
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = Number(digits[i])
    if (double) {
      n *= 2
      if (n > 9) n -= 9
    }
    sum += n
    double = !double
  }
  return sum % 10 === 0
}

export function vencimientoValido(value, now = new Date()) {
  const match = /^\s*(\d{2})\s*\/\s*(\d{2})\s*$/.exec(String(value ?? ''))
  if (!match) return false
  const month = Number(match[1])
  const year = 2000 + Number(match[2])
  if (month < 1 || month > 12) return false
  // El plástico vence al último día del mes indicado.
  const limit = new Date(year, month, 1)
  return limit > new Date(now.getFullYear(), now.getMonth(), 1)
}

export function cvvValido(value) {
  return /^\d{3,4}$/.test(String(value ?? '').trim())
}

export function enteroEnRango(value, min, max) {
  const n = Number(value)
  if (!Number.isInteger(n)) return false
  return n >= min && n <= max
}

/** Devuelve el primer error del titular o null si está todo bien. */
export function validarTitular(holder) {
  if (!nombreValido(holder.nombre)) return 'nombre'
  if (!dniValido(holder.dni)) return 'dni'
  if (!emailValido(holder.email)) return 'email'
  if (!telefonoValido(holder.tel)) return 'tel'
  if (!localidadValida(holder.localidad)) return 'localidad'
  return null
}

/** Devuelve el primer error de la tarjeta o null si está todo bien. */
export function validarTarjeta(card) {
  if (!luhnValido(card.number)) return 'number'
  if (!nombreValido(card.name, 5)) return 'name'
  if (!vencimientoValido(card.exp)) return 'exp'
  if (!cvvValido(card.cvv)) return 'cvv'
  return null
}
