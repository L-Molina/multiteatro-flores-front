import { formatearDni } from "../utils/validacion";
import { OBRAS_INICIALES, SALAS_INICIALES } from "../data/catalogo";
import { ROLES } from "../context/auth-context";

const metaObra = (id) =>
  OBRAS_INICIALES.find((obra) => obra.id === Number(id)) || null;
const metaSala = (id) =>
  SALAS_INICIALES.find((sala) => sala.id === Number(id)) || null;

const GENERO_POR_TIPO = {
  TEATRAL: "Teatro • Comedia",
  STAND_UP: "Stand-Up",
  CONCIERTO: "Concierto • Pop Rock",
};

const CATEGORIA_POR_TIPO = {
  TEATRAL: "teatro",
  STAND_UP: "standup",
  CONCIERTO: "conciertos",
};

export function generoDesdeTipo(tipo) {
  return GENERO_POR_TIPO[tipo] || "Teatro • Comedia";
}

export function categoriaDesdeGenero(genero = "") {
  const value = genero.toLowerCase();
  if (value.includes("stand")) return "standup";
  if (
    value.includes("concierto") ||
    value.includes("música") ||
    value.includes("musica")
  ) {
    return "conciertos";
  }
  return "teatro";
}

export function tipoDesdeGenero(genero = "") {
  const categoria = categoriaDesdeGenero(genero);
  if (categoria === "standup") return "STAND_UP";
  if (categoria === "conciertos") return "CONCIERTO";
  return "TEATRAL";
}

export function mapRol(rol) {
  if (rol === "SUPERADMIN") return ROLES.SUPERADMIN;
  if (rol === "ADMIN") return ROLES.DUENO;
  return ROLES.USUARIO;
}

export function mapUsuario(usuario, extra = {}) {
  if (!usuario) return null;
  return {
    id: usuario.id,
    nombre: usuario.nombre,
    email: usuario.email,
    rol: mapRol(usuario.rol),
    dni: formatearDni(extra.dni || usuario.dni || ''),
    tel: extra.tel || "",
    localidad: extra.localidad || "",
    teatroId: extra.teatroId ?? null,
    teatroNombre: extra.teatroNombre ?? null,
    since: new Date().toISOString(),
  };
}

export function mapObra(obra) {
  if (!obra) return null;
  const meta = metaObra(obra.id) || {};
  const tipo = obra.tipo || meta.tipo || "TEATRAL";
  const precio = Number(obra.precio ?? meta.precio ?? 0);
  return {
    id: Number(obra.id),
    titulo: obra.titulo,
    tipo,
    genero: meta.genero || generoDesdeTipo(tipo),
    categoria: meta.categoria || CATEGORIA_POR_TIPO[tipo] || "teatro",
    clasificacion: obra.clasificacion || meta.clasificacion || "ATP",
    duracion: Number(obra.duracionMinutos ?? meta.duracion) || 90,
    elenco: meta.elenco || "Compañía independiente",
    sinopsis: obra.descripcion || meta.sinopsis || "Sinopsis a confirmar.",
    img: meta.img || "/assets/obras/toc-toc.jpg",
    afiche: meta.afiche || meta.img || "/assets/obras/toc-toc.jpg",
    precio,
    vip: precio > 0 ? Math.round(precio * 1.3) : Number(meta.vip) || 0,
    destacada: Boolean(meta.destacada),
    publicada: true,
    preventa: true,
    schedule: meta.schedule || "Función a confirmar",
  };
}

export function mapTeatro(teatro) {
  if (!teatro) return null;
  const sala = SALAS_INICIALES.find(
    (item) => item.teatroId === Number(teatro.id)
  );
  return {
    id: Number(teatro.id),
    nombre: teatro.nombre,
    direccion: teatro.direccion || "",
    localidad: sala?.localidad || "",
    adminId: teatro.admin?.id ?? null,
  };
}

/* filas/columnas/vipFilas se derivan de las butacas reales de la sala para
   que el mapa de la UI y la capacidad del backend nunca se contradigan. */
export function mapSala(sala, butacasDeSala = []) {
  if (!sala) return null;
  const meta = metaSala(sala.id) || {};
  const teatro = sala.teatro || {};
  const filas = [
    ...new Set(butacasDeSala.map((butaca) => butaca.fila).filter(Boolean)),
  ].sort();
  const columnas = butacasDeSala.reduce(
    (max, butaca) => Math.max(max, Number(butaca.numero) || 0),
    0
  );
  const vipPorFila = new Map();
  butacasDeSala.forEach((butaca) => {
    const esVip = String(butaca.tipoAsiento?.nombre || "")
      .toLowerCase()
      .includes("vip");
    vipPorFila.set(
      butaca.fila,
      (vipPorFila.get(butaca.fila) || 0) + (esVip ? 1 : 0)
    );
  });
  const vipFilas = filas.filter(
    (fila) => (vipPorFila.get(fila) || 0) > 0
  ).length;

  return {
    id: Number(sala.id),
    nombre: sala.nombre,
    capacidad: butacasDeSala.length || Number(sala.capacidad) || 0,
    teatroId: Number(teatro.id ?? meta.teatroId),
    teatro: teatro.nombre || meta.teatro || "Teatro",
    direccion: teatro.direccion || meta.direccion || "",
    localidad: meta.localidad || "",
    filas: filas.length || Number(meta.filas) || 5,
    columnas: columnas || Number(meta.columnas) || 5,
    vipFilas: butacasDeSala.length ? vipFilas : Number(meta.vipFilas) || 0,
    layout: meta.layout || "Platea central",
  };
}

export function estadoFuncion(fechaHora, duracionMinutos = 120) {
  if (!fechaHora) return "En Venta";
  const inicio = new Date(fechaHora);
  if (Number.isNaN(inicio.getTime())) return "En Venta";
  const ahora = new Date();
  if (ahora < inicio) return "En Venta";
  const fin = new Date(
    inicio.getTime() + Number(duracionMinutos || 120) * 60000
  );
  return ahora <= fin ? "En Curso" : "Finalizada";
}

function partirFechaHora(fechaHora) {
  if (!fechaHora) return { fecha: "", hora: "" };
  const [fecha, resto = ""] = String(fechaHora).split("T");
  return { fecha, hora: resto.slice(0, 5) };
}

export function mapFuncion(funcion) {
  if (!funcion) return null;
  const { fecha, hora } = partirFechaHora(funcion.fechaHora);
  const obra = funcion.obra || {};
  const sala = funcion.sala || {};
  return {
    id: Number(funcion.id),
    obraId: Number(obra.id),
    salaId: Number(sala.id),
    fecha,
    hora,
    fechaHora: funcion.fechaHora,
    estado: estadoFuncion(funcion.fechaHora, obra.duracionMinutos),
    enCurso:
      estadoFuncion(funcion.fechaHora, obra.duracionMinutos) === "En Curso",
    duracion: Number(obra.duracionMinutos) || 90,
    precio: Number(funcion.precio) || 0,
  };
}

export function esFuncionFutura(funcion) {
  return funcion?.estado !== "Finalizada";
}

export function mapAsiento(asiento) {
  const tipo = String(asiento.tipoAsiento || "")
    .toLowerCase()
    .includes("vip")
    ? "vip"
    : "estandar";
  return {
    id: `${asiento.fila}-${asiento.numero}`,
    backendId: Number(asiento.id),
    fila: asiento.fila,
    numero: Number(asiento.numero),
    tipo,
    estado: asiento.ocupado ? "ocupado" : "disponible",
    precio: Number(asiento.precio) || 0,
  };
}

export function mapCompra(compra, entradas = []) {
  if (!compra) return null;
  const propias = entradas.filter(
    (entrada) => Number(entrada.compra?.id) === Number(compra.id)
  );
  propias.sort(
    (a, b) => Number(a.asiento?.id || 0) - Number(b.asiento?.id || 0)
  );
  const primera = propias[0] || null;
  const funcion = primera?.funcion || {};
  const obra = funcion.obra || {};
  const sala = funcion.sala || {};
  const teatro = sala.teatro || {};
  const meta = metaObra(obra.id) || {};
  const metaDeSala = metaSala(sala.id) || {};
  const tipo = String(primera?.asiento?.tipoAsiento?.nombre || "")
    .toLowerCase()
    .includes("vip")
    ? "vip"
    : "estandar";
  const butacas = propias.map(
    (entrada) =>
      `${entrada.asiento?.fila || ""}-${entrada.asiento?.numero || ""}`
  );
  const { fecha, hora } = partirFechaHora(funcion.fechaHora);
  const total = Number(compra.total ?? compra.montoTotal ?? 0);
  const subtotalEntradas = propias.reduce(
    (acc, entrada) => acc + Number(entrada.precioPagado || 0),
    0
  );
  const todasCanceladas =
    propias.length > 0 &&
    propias.every((entrada) => entrada.estado === "CANCELADA");
  const estado =
    compra.estado === "CANCELADA" || todasCanceladas
      ? "Cancelada"
      : propias.some((entrada) => entrada.estado === "USADA")
      ? "Usada"
      : "Confirmada";
  // El backend guarda solo dígitos; se muestran con puntos. Un DNI enmascarado
  // para una vista administrativa (****1234) se deja tal cual.
  const dniCrudo = compra.titularDni || "";
  const dniMostrado = /^\d+$/.test(dniCrudo)
    ? formatearDni(dniCrudo)
    : dniCrudo;

  return {
    id: Number(compra.id),
    codigo: primera?.codigo || `MTF-${compra.id}`,
    creada: compra.fecha,
    estado,
    estadoBackend: compra.estado,
    obraId: Number(obra.id) || 0,
    obraTitulo: obra.titulo || "Compra",
    obraImg: meta.img || "/assets/obras/toc-toc.jpg",
    genero: meta.genero || generoDesdeTipo(obra.tipo),
    salaId: Number(sala.id) || 0,
    teatro: teatro.nombre || "Teatro",
    salaNombre: sala.nombre || "Sala",
    direccion: teatro.direccion || "",
    localidad: metaDeSala.localidad || "",
    funcionId: Number(funcion.id) || 0,
    fechaFuncion: fecha,
    horaFuncion: hora,
    duracion: Number(obra.duracionMinutos) || meta.duracion || 90,
    tipo,
    tipoLabel: tipo === "vip" ? "VIP" : "Estándar",
    unitPrice: propias.length
      ? Number(primera?.precioPagado || 0)
      : total / Math.max(1, butacas.length),
    butacas,
    titular: {
      nombre: compra.titularNombre || compra.usuario?.nombre || "",
      dni: dniMostrado,
      email: compra.titularEmail || compra.usuario?.email || "",
      tel: compra.titularTelefono || "",
      localidad: compra.titularLocalidad || "",
    },
    pago: compra.metodoPago || "tarjeta",
    pagoLabel: compra.pagoLabel || "Pago online",
    comprobante: compra.comprobanteUrl
      ? {
          name: compra.comprobanteNombre || "Comprobante",
          url: compra.comprobanteUrl,
        }
      : null,
    subtotal: subtotalEntradas || total,
    servicio: 0,
    descuento: 0,
    total,
    email: compra.usuario?.email || "",
    usuarioEmail: compra.usuario?.email || "",
    entradas: propias,
  };
}
