/* Catálogo mock compartido por la cartelera, el checkout y los paneles de administración.
   Los datos replican el esquema y la carga de prueba del backend real (multiteatro_db):
   10 obras, 6 teatros, 18 salas de 25 butacas y 36 funciones.
   Al no haber persistencia real, el estado vive en CatalogContext durante la sesión. */

const DAY = 24 * 60 * 60 * 1000

export function isoFromNow(days) {
  const d = new Date()
  d.setHours(12, 0, 0, 0)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export function formatFecha(iso, opts) {
  if (!iso) return ''
  const d = new Date(`${iso}T12:00:00`)
  const options = opts || { weekday: 'long', day: 'numeric', month: 'long' }
  const txt = d.toLocaleDateString('es-AR', options)
  return txt.charAt(0).toUpperCase() + txt.slice(1)
}

export function formatARS(n) {
  return `$${Number(n || 0).toLocaleString('es-AR')}`
}

export const filaLetra = (i) => String.fromCharCode(65 + i)

export const CATEGORIAS = [
  { key: 'todos', label: 'Todos' },
  { key: 'teatro', label: 'Teatro' },
  { key: 'standup', label: 'Stand-Up' },
  { key: 'conciertos', label: 'Música' },
]

export const GENEROS = [
  'Teatro • Comedia',
  'Teatro • Comedia de enredos',
  'Teatro • Aventura',
  'Teatro • Drama',
  'Stand-Up',
  'Concierto • Pop Rock',
  'Concierto • Rock Alternativo',
  'Concierto • Tributo',
  'Teatro Infantil',
  'Concierto Acústico',
]

/* Datos base tomados de Query_3.sql (tabla obra).
   El precio VIP respeta el multiplicador 1.3 de tipo_asiento. */
const OBRAS_BASE = [
  {
    id: 1,
    titulo: 'Toc Toc',
    tipo: 'TEATRAL',
    genero: 'Teatro • Comedia',
    categoria: 'teatro',
    clasificacion: 'ATP',
    duracion: 90,
    elenco: 'De Laurent Baffie • Comedia',
    sinopsis:
      'Comedia de Laurent Baffie sobre un grupo de pacientes con TOC en la sala de espera de un psiquiatra.',
    img: '/assets/obras/toc-toc.jpg',
    afiche: '/assets/obras/toc-toc.jpg',
    precio: 30000,
    vip: 39000,
    destacada: false,
    publicada: true,
    preventa: true,
    salaId: 1,
  },
  {
    id: 2,
    titulo: 'La Función Que Sale Mal',
    tipo: 'TEATRAL',
    genero: 'Teatro • Comedia de enredos',
    categoria: 'teatro',
    clasificacion: '+13',
    duracion: 110,
    elenco: 'De Henry Lewis, Jonathan Sayer y Henry Shields',
    sinopsis:
      'Comedia de enredos donde nada sale como estaba previsto y el público forma parte del desastre.',
    img: '/assets/obras/LA-FUNCION-QUE-SALE-MAL.jpg',
    afiche: '/assets/obras/LA-FUNCION-QUE-SALE-MAL.jpg',
    precio: 30000,
    vip: 39000,
    destacada: true,
    publicada: true,
    preventa: true,
    salaId: 2,
  },
  {
    id: 3,
    titulo: 'Odisea de Florencio Varela',
    tipo: 'TEATRAL',
    genero: 'Teatro • Aventura',
    categoria: 'teatro',
    clasificacion: '+13',
    duracion: 100,
    elenco: 'Dir. Mariano Bragan',
    sinopsis:
      'Aventura teatral inspirada en el viaje de Ulises, trasladada al conurbano bonaerense.',
    img: '/assets/obras/la-odisea-de-florencio-varela.jpg',
    afiche: '/assets/obras/la-odisea-de-florencio-varela.jpg',
    precio: 30000,
    vip: 39000,
    destacada: true,
    publicada: true,
    preventa: true,
    salaId: 3,
  },
  {
    id: 4,
    titulo: 'Barrio Privado',
    tipo: 'TEATRAL',
    genero: 'Teatro • Drama',
    categoria: 'teatro',
    clasificacion: '+16',
    duracion: 105,
    elenco: 'De Alicia Fuentes',
    sinopsis:
      'Drama intenso sobre vínculos, deudas y el peso del pasado en un pueblo del interior.',
    img: '/assets/obras/barrio-privado.webp',
    afiche: '/assets/obras/barrio-privado.webp',
    precio: 30000,
    vip: 39000,
    destacada: true,
    publicada: true,
    preventa: true,
    salaId: 4,
  },
  {
    id: 5,
    titulo: 'Pablo Picotto',
    tipo: 'STAND_UP',
    genero: 'Stand-Up',
    categoria: 'standup',
    clasificacion: '+18',
    duracion: 75,
    elenco: 'Stand-up de observación',
    sinopsis:
      'Stand-up de observación sobre la vida cotidiana, la familia y los pequeños fracasos.',
    img: '/assets/obras/pablo-picotto.webp',
    afiche: '/assets/obras/pablo-picotto.webp',
    precio: 20000,
    vip: 26000,
    destacada: false,
    publicada: true,
    preventa: true,
    salaId: 1,
  },
  {
    id: 6,
    titulo: 'Julian Bellese',
    tipo: 'STAND_UP',
    genero: 'Stand-Up',
    categoria: 'standup',
    clasificacion: '+18',
    duracion: 70,
    elenco: 'Stand-up comedy',
    sinopsis:
      'Stand-up con historias personales, redes sociales y anécdotas de gira.',
    img: '/assets/obras/julian-bellese.webp',
    afiche: '/assets/obras/julian-bellese.webp',
    precio: 20000,
    vip: 26000,
    destacada: false,
    publicada: true,
    preventa: true,
    salaId: 4,
  },
  {
    id: 7,
    titulo: 'Turco Naim',
    tipo: 'STAND_UP',
    genero: 'Stand-Up',
    categoria: 'standup',
    clasificacion: '+18',
    duracion: 75,
    elenco: 'Un turco suelto!',
    sinopsis:
      'Stand-up sobre costumbres, identidad y convivencia en Buenos Aires.',
    img: '/assets/obras/turco-naim.webp',
    afiche: '/assets/obras/turco-naim.webp',
    precio: 20000,
    vip: 26000,
    destacada: false,
    publicada: true,
    preventa: true,
    salaId: 6,
  },
  {
    id: 8,
    titulo: 'Jammin',
    tipo: 'CONCIERTO',
    genero: 'Concierto • Pop Rock',
    categoria: 'conciertos',
    clasificacion: 'ATP',
    duracion: 120,
    elenco: 'Banda de pop-rock',
    sinopsis:
      'Concierto de pop-rock en formato banda completa.',
    img: '/assets/obras/Jammin-1.jpeg',
    afiche: '/assets/obras/Jammin-2.jpeg',
    precio: 12500,
    vip: 16250,
    destacada: true,
    publicada: true,
    preventa: true,
    salaId: 2,
  },
  {
    id: 9,
    titulo: 'Niño Salvaje',
    tipo: 'CONCIERTO',
    genero: 'Concierto • Rock Alternativo',
    categoria: 'conciertos',
    clasificacion: 'ATP',
    duracion: 100,
    elenco: 'Rock alternativo • AFTERTINA',
    sinopsis:
      'Show de rock alternativo novedoso.',
    img: '/assets/obras/nino-salvaje-1.jpeg',
    afiche: '/assets/obras/nino-salvaje-2.jpeg',
    precio: 12500,
    vip: 16250,
    destacada: true,
    publicada: true,
    preventa: true,
    salaId: 5,
  },
  {
    id: 10,
    titulo: 'Experiencia Beatle',
    tipo: 'CONCIERTO',
    genero: 'Concierto • Tributo',
    categoria: 'conciertos',
    clasificacion: 'ATP',
    duracion: 110,
    elenco: 'Tributo a The Beatles',
    sinopsis:
      'Tributo al repertorio de The Beatles.',
    img: '/assets/obras/beatles-2.jpeg',
    afiche: '/assets/obras/beatles-1.jpeg',
    precio: 12500,
    vip: 16250,
    destacada: true,
    publicada: true,
    preventa: true,
    salaId: 3,
  },
]

/* Teatros y salas de Query_3.sql. Cada teatro tiene 3 salas de 5 × 5 butacas:
   fila A VIP (5 butacas) y filas B-E normales (20 butacas). */
const TEATROS = [
  {
    id: 1,
    nombre: 'Teatro de Las Nobles Bestias',
    direccion: 'Av. Rivadavia 1234, CABA',
    localidad: 'Monserrat • CABA',
  },
  {
    id: 2,
    nombre: 'Otromundo Teatro',
    direccion: 'Av. Corrientes 2345, CABA',
    localidad: 'Balvanera • CABA',
  },
  {
    id: 3,
    nombre: 'Teatro Horizonte',
    direccion: 'Av. Santa Fe 3456, CABA',
    localidad: 'Palermo • CABA',
  },
  {
    id: 4,
    nombre: 'Mandorla Teatro',
    direccion: 'Av. Belgrano 4567, CABA',
    localidad: 'Almagro • CABA',
  },
  {
    id: 5,
    nombre: 'Teatro en la Bruma',
    direccion: 'Av. Callao 5678, CABA',
    localidad: 'Villa Crespo • CABA',
  },
  {
    id: 6,
    nombre: 'Teatro Urbano',
    direccion: 'Av. San Juan 6789, CABA',
    localidad: 'Boedo • CABA',
  },
]

export const SALAS_INICIALES = TEATROS.flatMap((teatro) =>
  [1, 2, 3].map((numero) => ({
    id: (teatro.id - 1) * 3 + numero,
    teatroId: teatro.id,
    teatro: teatro.nombre,
    nombre: `Sala ${numero}`,
    direccion: teatro.direccion,
    localidad: teatro.localidad,
    capacidad: 25,
    filas: 5,
    columnas: 5,
    vipFilas: 1,
    layout: 'Platea central',
  })),
)

/* Grilla de funciones de Query_3.sql: [obraId, salaId, días desde hoy, hora, estado].
   Se conservan los mismos días de la semana y horarios que la carga real, desplazados
   una semana para que toda la temporada quede disponible en la demo. */
const PLANTILLA = [
  [1, 1, 6, '20:00', 'En Venta'],
  [5, 1, 7, '21:00', 'Últimas'],
  [2, 2, 6, '20:30', 'En Venta'],
  [8, 2, 8, '21:00', 'Últimas'],
  [3, 3, 7, '20:00', 'En Venta'],
  [10, 3, 9, '20:00', 'En Venta'],
  [4, 4, 13, '20:00', 'En Venta'],
  [6, 4, 14, '21:00', 'En Venta'],
  [9, 5, 13, '21:00', 'En Venta'],
  [1, 5, 15, '20:00', 'En Venta'],
  [2, 6, 14, '20:00', 'Últimas'],
  [7, 6, 16, '21:00', 'En Venta'],
  [3, 7, 20, '20:00', 'En Venta'],
  [10, 7, 21, '21:00', 'En Venta'],
  [4, 8, 20, '21:00', 'En Venta'],
  [5, 8, 22, '21:00', 'En Venta'],
  [1, 9, 21, '20:00', 'Últimas'],
  [8, 9, 23, '20:00', 'En Venta'],
  [2, 10, 27, '20:00', 'En Venta'],
  [6, 10, 28, '21:00', 'En Venta'],
  [3, 11, 27, '21:00', 'En Venta'],
  [9, 11, 29, '21:00', 'En Venta'],
  [4, 12, 28, '20:00', 'En Venta'],
  [7, 12, 30, '21:00', 'Últimas'],
  [1, 13, 34, '20:00', 'En Venta'],
  [5, 13, 35, '21:00', 'En Venta'],
  [2, 14, 34, '21:00', 'En Venta'],
  [8, 14, 36, '20:00', 'En Venta'],
  [3, 15, 35, '20:00', 'En Venta'],
  [10, 15, 37, '20:00', 'Últimas'],
  [4, 16, 41, '20:00', 'En Venta'],
  [6, 16, 42, '21:00', 'En Venta'],
  [9, 17, 41, '21:00', 'En Venta'],
  [1, 17, 43, '20:00', 'En Venta'],
  [2, 18, 42, '20:00', 'En Venta'],
  [7, 18, 43, '21:00', 'En Venta'],
]

export const FUNCIONES_INICIALES = PLANTILLA.map((f, i) => {
  const obra = OBRAS_BASE.find((o) => o.id === f[0])
  return {
    id: i + 1,
    obraId: f[0],
    salaId: f[1],
    fecha: isoFromNow(f[2]),
    hora: f[3],
    estado: f[4],
    enCurso: false,
    duracion: obra ? obra.duracion : 90,
    precio: obra ? obra.precio : 0,
  }
})

/* "Días y horarios" se calcula con las funciones reales de cada obra. */
function resumenHorarios(obraId) {
  const dias = [
    ...new Set(
      FUNCIONES_INICIALES.filter((funcion) => funcion.obraId === obraId)
        .sort((a, b) => `${a.fecha}${a.hora}`.localeCompare(`${b.fecha}${b.hora}`))
        .map((funcion) =>
          `${formatFecha(funcion.fecha, { weekday: 'short', day: 'numeric', month: 'short' })} ${funcion.hora}`,
        ),
    ),
  ]
  return dias.length ? `${dias.slice(0, 3).join(' hs • ')} hs` : 'Función a confirmar'
}

export const OBRAS_INICIALES = OBRAS_BASE.map((obra) => ({
  ...obra,
  schedule: resumenHorarios(obra.id),
}))

/**
 * Devuelve el plano de butacas de una función.
 * La ocupación es determinística para que el prototipo sea estable entre pasos.
 */
export function asientosDeFuncion(funcion, sala) {
  if (!funcion || !sala) return []
  const asientos = []
  let n = 0
  const filas = Math.max(1, Number(sala.filas) || 1)
  const columnas = Math.max(1, Number(sala.columnas) || 1)
  const vipFilas = Math.max(0, Number(sala.vipFilas) || 0)
  for (let f = 0; f < filas; f++) {
    for (let c = 0; c < columnas; c++) {
      n++
      const fila = filaLetra(f)
      const numero = c + 1
      const tipo = f < vipFilas ? 'vip' : 'estandar'
      const seed = (funcion.id * 7919 + n * 104729 + f * 31 + c * 17) % 100
      let estado = 'disponible'
      if (seed < 18) estado = 'ocupado'
      else if (seed === 42) estado = 'bloqueado'
      asientos.push({ id: `${fila}-${numero}`, fila, numero, tipo, estado })
    }
  }
  return asientos
}

export function precioDe(obra, tipo) {
  if (!obra) return 0
  return tipo === 'vip' ? obra.vip : obra.precio
}

export function getSalaDeFuncion(funcion, salas) {
  if (!funcion) return null
  return salas.find((s) => s.id === Number(funcion.salaId)) || null
}

export { DAY }
