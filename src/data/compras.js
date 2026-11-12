/* Historial de compras mock. En memoria durante la sesión y se reinicia al
   recargar. Las compras nuevas se agregan desde el checkout. */

import {
  DAY,
  FUNCIONES_INICIALES,
  OBRAS_INICIALES,
  SALAS_INICIALES,
} from './catalogo'

const TITULAR_DEMO = {
  nombre: 'Facundo N Morales',
  dni: '32.456.789',
  email: 'facundo.morales@email.com',
  tel: '+54 9 11 5555-2048',
  localidad: 'Flores, CABA',
}

const TITULAR_DEMO_2 = {
  nombre: 'Lucía Fernández',
  dni: '28.904.331',
  email: 'lucia.fernandez@email.com',
  tel: '+54 9 11 4444-8790',
  localidad: 'Caballito, CABA',
}

function crearCompraDemo({
  id,
  codigo,
  obraId,
  funcionId,
  tipo,
  butacas,
  diasAtras,
  pago,
  pagoLabel,
  estado = 'Confirmada',
  titular = TITULAR_DEMO,
}) {
  const obra = OBRAS_INICIALES.find((item) => item.id === obraId)
  const funcion = FUNCIONES_INICIALES.find((item) => item.id === funcionId)
  const sala = SALAS_INICIALES.find((item) => item.id === funcion?.salaId)
  const unitPrice = tipo === 'vip' ? obra.vip : obra.precio
  const subtotal = unitPrice * butacas.length
  const servicio = 900 * butacas.length
  const descuento = pago === 'transferencia' ? Math.round(subtotal * 0.05) : 0
  const creada = new Date(Date.now() - diasAtras * DAY)

  return {
    id,
    codigo,
    creada: creada.toISOString(),
    estado,
    obraId,
    obraTitulo: obra.titulo,
    obraImg: obra.img,
    genero: obra.genero,
    salaId: sala.id,
    teatro: sala.teatro,
    salaNombre: sala.nombre,
    direccion: sala.direccion,
    localidad: sala.localidad,
    funcionId,
    fechaFuncion: funcion.fecha,
    horaFuncion: funcion.hora,
    duracion: funcion.duracion,
    tipo,
    tipoLabel: tipo === 'vip' ? 'VIP' : 'Estándar',
    unitPrice,
    butacas,
    titular,
    pago,
    pagoLabel,
    subtotal,
    servicio,
    descuento,
    total: subtotal + servicio - descuento,
    email: titular.email,
    usuarioEmail: titular.email,
  }
}

export const COMPRAS_INICIALES = [
  crearCompraDemo({
    id: 1,
    codigo: 'MTF-DEMO21',
    obraId: 4,
    funcionId: 31,
    tipo: 'estandar',
    butacas: ['B1', 'B2'],
    diasAtras: 6,
    pago: 'tarjeta',
    pagoLabel: 'Tarjeta de crédito (3 cuotas)',
  }),
  crearCompraDemo({
    id: 2,
    codigo: 'MTF-DEMO08',
    obraId: 8,
    funcionId: 5,
    tipo: 'vip',
    butacas: ['A3'],
    diasAtras: 17,
    pago: 'transferencia',
    pagoLabel: 'Transferencia bancaria',
    titular: TITULAR_DEMO_2,
  }),
]
