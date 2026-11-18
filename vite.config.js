import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

/* Registro en memoria de butacas compartidas entre sesiones.

   El proyecto no tiene backend: los datos viven en el navegador. Para que una
   segunda cuenta (incluso en una ventana de incógnito) vea las butacas que otra
   persona está reservando o ya compró, el dev server expone /api/ocupacion.
   - GET  /api/ocupacion?funcionId=1&sessionId=abc
   - POST /api/ocupacion { sessionId, funcionId, butacas, accion? }
     accion: "reservar" (por defecto) o "vender".
   Las reservas vencen solas si la pestaña deja de renovarlas (heartbeat). */

const HOLD_TTL_MS = 20000

const normalizar = (id) => String(id).replace(/[^a-z0-9]/gi, '').toUpperCase()

function apiOcupacion() {
  const reservas = new Map() // "funcionId|sessionId" -> { funcionId, sessionId, butacas, expira }
  const ventas = new Map() // funcionId -> Set de butacas vendidas

  const limpiar = () => {
    const ahora = Date.now()
    reservas.forEach((reserva, key) => {
      if (reserva.expira < ahora) reservas.delete(key)
    })
  }

  const snapshot = (funcionId, sessionId) => {
    limpiar()
    const reservasDeLaFuncion = []
    reservas.forEach((reserva) => {
      if (reserva.funcionId !== funcionId) return
      if (reserva.sessionId === sessionId) return
      reservasDeLaFuncion.push({
        sessionId: reserva.sessionId,
        butacas: [...reserva.butacas],
      })
    })
    return {
      ventas: [...(ventas.get(funcionId) || [])],
      reservas: reservasDeLaFuncion,
    }
  }

  const responder = (res, status, body) => {
    res.statusCode = status
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.setHeader('Cache-Control', 'no-store')
    res.end(JSON.stringify(body))
  }

  const leerBody = (req) =>
    new Promise((resolve) => {
      let data = ''
      req.on('data', (chunk) => {
        data += chunk
        if (data.length > 100000) req.destroy()
      })
      req.on('end', () => {
        try {
          resolve(JSON.parse(data || '{}'))
        } catch {
          resolve(null)
        }
      })
      req.on('error', () => resolve(null))
    })

  return {
    name: 'multiteatro-ocupacion',
    configureServer(server) {
      server.middlewares.use('/api/ocupacion', async (req, res) => {
        const url = new URL(req.url || '/', 'http://localhost')
        const funcionId = Number(url.searchParams.get('funcionId'))

        if (req.method === 'GET') {
          if (!Number.isFinite(funcionId)) {
            responder(res, 400, { error: 'funcionId inválido' })
            return
          }
          const sessionId = url.searchParams.get('sessionId') || ''
          responder(res, 200, snapshot(funcionId, sessionId))
          return
        }

        if (req.method !== 'POST') {
          responder(res, 405, { error: 'Método no soportado' })
          return
        }

        const data = await leerBody(req)
        if (!data) {
          responder(res, 400, { error: 'JSON inválido' })
          return
        }
        const fid = Number(data.funcionId)
        const sid = String(data.sessionId || '')
        const butacas = Array.isArray(data.butacas)
          ? [...new Set(data.butacas.map(normalizar))].filter(Boolean)
          : []
        if (!Number.isFinite(fid) || !sid) {
          responder(res, 400, { error: 'Datos incompletos' })
          return
        }

        // Una butaca no se puede tomar si ya la vendió o reservó otra sesión.
        const ocupadasPorOtros = new Set(ventas.get(fid) || [])
        limpiar()
        reservas.forEach((reserva) => {
          if (reserva.funcionId !== fid || reserva.sessionId === sid) return
          reserva.butacas.forEach((butaca) => ocupadasPorOtros.add(butaca))
        })
        const rechazadas = butacas.filter((butaca) => ocupadasPorOtros.has(butaca))
        const aceptadas = butacas.filter((butaca) => !ocupadasPorOtros.has(butaca))

        if (data.accion === 'vender') {
          const vendidas = ventas.get(fid) || new Set()
          aceptadas.forEach((butaca) => vendidas.add(butaca))
          ventas.set(fid, vendidas)
          reservas.delete(`${fid}|${sid}`)
        } else {
          const key = `${fid}|${sid}`
          if (!aceptadas.length) {
            reservas.delete(key)
          } else {
            reservas.set(key, {
              funcionId: fid,
              sessionId: sid,
              butacas: aceptadas,
              expira: Date.now() + HOLD_TTL_MS,
            })
          }
        }

        responder(res, 200, { ...snapshot(fid, sid), rechazadas })
      })
    },
  }
}

/* Bandeja de novedades compartida entre sesiones.

   El frontend no tiene backend: el dev server guarda en memoria los avisos que
   genera el gestor (por ejemplo, una función nueva para una obra que no tenía
   fechas). Cualquier pestaña, incluida una de incógnito, los consulta por
   polling. La bandeja arranca vacía y se reinicia con el servidor. */

function apiNotificaciones() {
  const novedades = []
  let nextId = 1

  const responder = (res, status, body) => {
    res.statusCode = status
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.setHeader('Cache-Control', 'no-store')
    res.end(JSON.stringify(body))
  }

  const leerBody = (req) =>
    new Promise((resolve) => {
      let data = ''
      req.on('data', (chunk) => {
        data += chunk
        if (data.length > 100000) req.destroy()
      })
      req.on('end', () => {
        try {
          resolve(JSON.parse(data || '{}'))
        } catch {
          resolve(null)
        }
      })
      req.on('error', () => resolve(null))
    })

  return {
    name: 'multiteatro-notificaciones',
    configureServer(server) {
      server.middlewares.use('/api/notificaciones', async (req, res) => {
        if (req.method === 'GET') {
          responder(res, 200, { notificaciones: novedades })
          return
        }
        if (req.method !== 'POST') {
          responder(res, 405, { error: 'Método no soportado' })
          return
        }
        const data = await leerBody(req)
        const obraId = Number(data?.obraId)
        const obraTitulo = String(data?.obraTitulo || '').trim()
        if (!data || !Number.isFinite(obraId) || !obraTitulo) {
          responder(res, 400, { error: 'Datos incompletos' })
          return
        }
        const novedad = {
          id: nextId++,
          creada: new Date().toISOString(),
          tipo: 'funcion',
          obraId,
          obraTitulo,
          obraImg: String(data.obraImg || ''),
          genero: String(data.genero || ''),
          fecha: String(data.fecha || ''),
          hora: String(data.hora || ''),
          sala: String(data.sala || ''),
        }
        novedades.unshift(novedad)
        if (novedades.length > 50) novedades.length = 50
        responder(res, 201, { notificacion: novedad })
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), apiOcupacion(), apiNotificaciones()],
})
