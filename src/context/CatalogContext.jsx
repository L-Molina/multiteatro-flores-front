import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CatalogContext } from "./catalog-context";
import useAuth from "../hooks/useAuth";
import { api, ApiError } from "../api/client";
import {
  categoriaDesdeGenero,
  mapAsiento,
  mapCompra,
  mapFuncion,
  mapObra,
  mapSala,
  mapTeatro,
  tipoDesdeGenero,
} from "../api/mappers";
import {
  filaLetra,
  formatARS,
  formatFecha,
  normalizarButaca,
  precioDe,
} from "../data/catalogo";

/* Catálogo real: obras, funciones y teatros públicos desde Spring Boot;
   salas, butacas, compras y entradas después del login (el backend las
   protege con Bearer token). Los campos que la base no guarda (imagen,
   elenco, género, flags, layout) se completan localmente en los mappers. */

const resumenHorario = (funciones) => {
  const dias = [
    ...new Set(
      funciones.slice(0, 3).map(
        (funcion) =>
          `${formatFecha(funcion.fecha, {
            weekday: "short",
            day: "numeric",
            month: "short",
          })} ${funcion.hora} hs`
      )
    ),
  ];
  return dias.length ? dias.join(" • ") : "Función a confirmar";
};

export function CatalogProvider({ children }) {
  const { user } = useAuth();
  const [rawObras, setRawObras] = useState([]);
  const [rawFunciones, setRawFunciones] = useState([]);
  const [rawTeatros, setRawTeatros] = useState([]);
  const [rawSalas, setRawSalas] = useState([]);
  const [rawAsientos, setRawAsientos] = useState([]);
  const [rawCompras, setRawCompras] = useState([]);
  const [rawEntradas, setRawEntradas] = useState([]);
  const [overlayObras, setOverlayObras] = useState({});
  const [asientosPorFuncion, setAsientosPorFuncion] = useState(() => {
    const cache = {};
    return Object.fromEntries(Object.entries(cache));
  });
  const cacheAsientos = useRef({});
  const [loadingPublico, setLoadingPublico] = useState(true);
  const [loadingPrivado, setLoadingPrivado] = useState(false);
  const [error, setError] = useState("");

  const guardarAsientos = useCallback((entradas) => {
    cacheAsientos.current = { ...cacheAsientos.current, ...entradas };
    setAsientosPorFuncion(cacheAsientos.current);
  }, []);

  const cargarPublico = useCallback(async () => {
    setLoadingPublico(true);
    setError("");
    try {
      const [obras, funciones, teatros] = await Promise.all([
        api.get("/obras", { auth: false }),
        api.get("/funciones", { auth: false }),
        api.get("/teatros", { auth: false }),
      ]);
      setRawObras(obras || []);
      setRawFunciones(funciones || []);
      setRawTeatros(teatros || []);
    } catch (err) {
      setError(err?.message || "No pudimos cargar la cartelera.");
    } finally {
      setLoadingPublico(false);
    }
  }, []);

  const cargarPrivado = useCallback(async () => {
    setLoadingPrivado(true);
    setError("");
    try {
      const [salas, asientos, compras, entradas] = await Promise.all([
        api.get("/salas"),
        api.get("/asientos"),
        api.get("/compras"),
        api.get("/entradas"),
      ]);
      setRawSalas(salas || []);
      setRawAsientos(asientos || []);
      setRawCompras(compras || []);
      setRawEntradas(entradas || []);
    } catch (err) {
      setError(err?.message || "No pudimos cargar los datos de tu cuenta.");
    } finally {
      setLoadingPrivado(false);
    }
  }, []);

  const recargarCompras = useCallback(async () => {
    const [compras, entradas] = await Promise.all([
      api.get("/compras"),
      api.get("/entradas"),
    ]);
    setRawCompras(compras || []);
    setRawEntradas(entradas || []);
    return { compras: compras || [], entradas: entradas || [] };
  }, []);

  const recargarSalas = useCallback(async () => {
    const [salas, asientos] = await Promise.all([
      api.get("/salas"),
      api.get("/asientos"),
    ]);
    setRawSalas(salas || []);
    setRawAsientos(asientos || []);
    return { salas: salas || [], asientos: asientos || [] };
  }, []);

  useEffect(() => {
    cargarPublico();
  }, [cargarPublico]);

  useEffect(() => {
    if (user) {
      cargarPrivado();
    } else {
      setRawSalas([]);
      setRawAsientos([]);
      setRawCompras([]);
      setRawEntradas([]);
      cacheAsientos.current = {};
      setAsientosPorFuncion({});
    }
  }, [user, cargarPrivado]);

  const funciones = useMemo(() => rawFunciones.map(mapFuncion), [rawFunciones]);

  const obras = useMemo(
    () =>
      rawObras.map((obra) => {
        const base = mapObra(obra);
        const extra = overlayObras[base.id] || {};
        const propias = funciones
          .filter(
            (funcion) =>
              funcion.obraId === base.id && funcion.estado !== "Finalizada"
          )
          .sort((a, b) =>
            `${a.fecha}${a.hora}`.localeCompare(`${b.fecha}${b.hora}`)
          );
        return {
          ...base,
          ...extra,
          categoria: extra.genero
            ? categoriaDesdeGenero(extra.genero)
            : base.categoria,
          schedule: extra.schedule || resumenHorario(propias),
        };
      }),
    [rawObras, overlayObras, funciones]
  );

  const teatros = useMemo(() => rawTeatros.map(mapTeatro), [rawTeatros]);

  /* /api/salas exige token. Para el visitante anónimo la cartelera pública
     ya trae la sala y el teatro dentro de cada función, así que se derivan
     de ahí. Con sesión iniciada se usan las salas reales (con sus butacas). */
  const salas = useMemo(() => {
    const base = rawSalas.length
      ? rawSalas
      : rawFunciones.map((funcion) => funcion.sala).filter(Boolean);
    const unicas = new Map();
    base.forEach((sala) => {
      if (sala?.id != null && !unicas.has(Number(sala.id))) {
        unicas.set(Number(sala.id), sala);
      }
    });
    return [...unicas.values()].map((sala) => {
      const butacas = rawAsientos.filter(
        (asiento) => Number(asiento.sala?.id) === Number(sala.id)
      );
      return mapSala(sala, butacas);
    });
  }, [rawSalas, rawAsientos, rawFunciones]);

  const compras = useMemo(
    () => rawCompras.map((compra) => mapCompra(compra, rawEntradas)),
    [rawCompras, rawEntradas]
  );

  const getObra = useCallback(
    (id) => obras.find((obra) => obra.id === Number(id)) || null,
    [obras]
  );
  const getSala = useCallback(
    (id) => salas.find((sala) => sala.id === Number(id)) || null,
    [salas]
  );
  const getTeatro = useCallback(
    (id) => teatros.find((teatro) => teatro.id === Number(id)) || null,
    [teatros]
  );
  const getFuncion = useCallback(
    (id) => funciones.find((funcion) => funcion.id === Number(id)) || null,
    [funciones]
  );
  const getCompra = useCallback(
    (id) => compras.find((compra) => compra.id === Number(id)) || null,
    [compras]
  );

  const funcionesDeObra = useCallback(
    (obraId) =>
      funciones
        .filter(
          (funcion) =>
            funcion.obraId === Number(obraId) && funcion.estado !== "Finalizada"
        )
        .sort((a, b) =>
          `${a.fecha}${a.hora}`.localeCompare(`${b.fecha}${b.hora}`)
        ),
    [funciones]
  );

  const teatrosDeObra = useCallback(
    (obraId) => {
      const ids = [
        ...new Set(funcionesDeObra(obraId).map((funcion) => funcion.salaId)),
      ];
      return ids
        .map((id) => salas.find((sala) => sala.id === id))
        .filter(Boolean);
    },
    [funcionesDeObra, salas]
  );

  const asientos = useCallback(
    (funcionId) => asientosPorFuncion[String(funcionId)] || [],
    [asientosPorFuncion]
  );

  const cargarAsientos = useCallback(
    async (funcionId, { force = false } = {}) => {
      if (!funcionId) return [];
      const key = String(funcionId);
      if (!force && cacheAsientos.current[key])
        return cacheAsientos.current[key];
      const data = await api.get(`/funciones/${funcionId}/asientos`);
      const planos = (data || []).map(mapAsiento);
      guardarAsientos({ [key]: planos });
      return planos;
    },
    [guardarAsientos]
  );

  const cargarAsientosDeFunciones = useCallback(
    async (ids, { force = false } = {}) => {
      const pendientes = [...new Set((ids || []).map(String))].filter(
        (id) => force || !cacheAsientos.current[id]
      );
      if (!pendientes.length) return;
      const resultados = await Promise.allSettled(
        pendientes.map(async (id) => {
          const data = await api.get(`/funciones/${id}/asientos`);
          return [id, (data || []).map(mapAsiento)];
        })
      );
      const nuevas = {};
      resultados.forEach((resultado) => {
        if (resultado.status === "fulfilled") {
          const [id, planos] = resultado.value;
          nuevas[id] = planos;
        }
      });
      if (Object.keys(nuevas).length) guardarAsientos(nuevas);
    },
    [guardarAsientos]
  );

  const extrasObra = (payload) => ({
    genero: payload.genero,
    categoria: categoriaDesdeGenero(payload.genero),
    elenco: payload.elenco,
    img: payload.img,
    afiche: payload.afiche,
    vip: payload.vip != null ? Number(payload.vip) : undefined,
    publicada: payload.publicada !== false,
    preventa: payload.preventa !== false,
    schedule: payload.schedule,
  });

  const addObra = useCallback(
    async (payload) => {
      const creada = await api.post("/obras", {
        titulo: payload.titulo,
        tipo: tipoDesdeGenero(payload.genero),
        precio: Number(payload.precio) || 0,
        clasificacion: payload.clasificacion || "ATP",
        descripcion: payload.sinopsis || "",
        duracionMinutos: Number(payload.duracion) || 90,
      });
      setOverlayObras((prev) => ({
        ...prev,
        [creada.id]: extrasObra(payload),
      }));
      await cargarPublico();
      return creada;
    },
    [cargarPublico]
  );

  const updateObra = useCallback(
    async (id, payload) => {
      const actualizada = await api.put(`/obras/${id}`, {
        titulo: payload.titulo,
        tipo: tipoDesdeGenero(payload.genero),
        precio: Number(payload.precio) || 0,
        clasificacion: payload.clasificacion || "ATP",
        descripcion: payload.sinopsis || "",
        duracionMinutos: Number(payload.duracion) || 90,
      });
      setOverlayObras((prev) => ({ ...prev, [id]: extrasObra(payload) }));
      await cargarPublico();
      return actualizada;
    },
    [cargarPublico]
  );

  const deleteObra = useCallback(
    async (id) => {
      const propias = rawFunciones.filter(
        (funcion) => Number(funcion.obra?.id) === Number(id)
      );
      for (const funcion of propias) {
        await api.delete(`/funciones/${funcion.id}`);
      }
      await api.delete(`/obras/${id}`);
      await cargarPublico();
    },
    [rawFunciones, cargarPublico]
  );

  const addFuncion = useCallback(
    async (payload) => {
      const creada = await api.post("/funciones", {
        fechaHora: `${payload.fecha}T${payload.hora}:00`,
        precio: Number(payload.precio) || 0,
        obra: { id: Number(payload.obraId) },
        sala: { id: Number(payload.salaId) },
      });
      await cargarPublico();
      return creada;
    },
    [cargarPublico]
  );

  const updateFuncion = useCallback(
    async (id, payload) => {
      const actualizada = await api.put(`/funciones/${id}`, {
        fechaHora: `${payload.fecha}T${payload.hora}:00`,
        precio: Number(payload.precio) || 0,
        obra: { id: Number(payload.obraId) },
        sala: { id: Number(payload.salaId) },
      });
      await cargarPublico();
      return actualizada;
    },
    [cargarPublico]
  );

  const deleteFuncion = useCallback(
    async (id) => {
      await api.delete(`/funciones/${id}`);
      await cargarPublico();
    },
    [cargarPublico]
  );

  const sincronizarButacas = useCallback(
    async (salaId, filas, columnas, vipFilas) => {
      const [tipos, asientosBackend] = await Promise.all([
        api.get("/tipos-asiento"),
        api.get("/asientos"),
      ]);
      const vip = tipos.find((tipo) =>
        String(tipo.nombre || "")
          .toLowerCase()
          .includes("vip")
      );
      const normal = tipos.find((tipo) => tipo.id !== vip?.id);
      if (!normal || !vip) {
        throw new Error(
          "El backend no tiene los tipos de butaca Normal y VIP."
        );
      }

      const actuales = asientosBackend.filter(
        (asiento) => Number(asiento.sala?.id) === Number(salaId)
      );
      const actualesPorClave = new Map(
        actuales.map((asiento) => [
          `${asiento.fila}-${asiento.numero}`,
          asiento,
        ])
      );
      const objetivo = new Map();
      for (let f = 0; f < filas; f += 1) {
        const fila = filaLetra(f);
        for (let numero = 1; numero <= columnas; numero += 1) {
          objetivo.set(`${fila}-${numero}`, {
            fila,
            numero,
            tipoAsientoId: f < vipFilas ? vip.id : normal.id,
          });
        }
      }

      for (const [clave, butaca] of objetivo) {
        const actual = actualesPorClave.get(clave);
        if (!actual) {
          await api.post("/asientos", {
            fila: butaca.fila,
            numero: butaca.numero,
            sala: { id: Number(salaId) },
            tipoAsiento: { id: Number(butaca.tipoAsientoId) },
          });
        } else if (
          Number(actual.tipoAsiento?.id) !== Number(butaca.tipoAsientoId)
        ) {
          await api.put(`/asientos/${actual.id}`, {
            fila: butaca.fila,
            numero: butaca.numero,
            tipoAsiento: { id: Number(butaca.tipoAsientoId) },
          });
        }
      }

      for (const [clave, butaca] of actualesPorClave) {
        if (!objetivo.has(clave)) {
          await api.delete(`/asientos/${butaca.id}`);
        }
      }
    },
    []
  );

  const updateSala = useCallback(
    async (id, payload) => {
      const sala = salas.find((item) => item.id === Number(id));
      if (!sala) throw new Error("Sala no encontrada");
      const filas = Number(payload.filas) || sala.filas;
      const columnas = Number(payload.columnas) || sala.columnas;
      const vipFilas =
        payload.vipFilas != null ? Number(payload.vipFilas) : sala.vipFilas;
      const capacidad = filas * columnas;

      await api.put(`/salas/${id}`, {
        nombre: payload.nombre || sala.nombre,
        capacidad,
      });
      await sincronizarButacas(id, filas, columnas, vipFilas);
      await recargarSalas();
      // Los mapas de butacas cacheados quedaron viejos: se vuelven a pedir.
      const funcionesDeSala = rawFunciones
        .filter((funcion) => Number(funcion.sala?.id) === Number(id))
        .map((funcion) => funcion.id);
      if (funcionesDeSala.length) {
        await cargarAsientosDeFunciones(funcionesDeSala, { force: true }).catch(
          () => {}
        );
      }
      return { ...sala, filas, columnas, vipFilas, capacidad };
    },
    [
      salas,
      sincronizarButacas,
      recargarSalas,
      rawFunciones,
      cargarAsientosDeFunciones,
    ]
  );

  const addTeatro = useCallback(
    async (payload) => {
      const teatro = await api.post("/teatros", {
        nombre: payload.nombre,
        direccion: payload.direccion,
        admin: user ? { id: user.id } : null,
      });
      await cargarPublico();
      return teatro;
    },
    [user, cargarPublico]
  );

  const addCompra = useCallback(
    async ({ funcionId, asientoIds, meta }) => {
      const key = String(funcionId);
      let mapa = cacheAsientos.current[key];
      if (!mapa) {
        mapa = await cargarAsientos(funcionId);
      }

      const pedidos = [...new Set((asientoIds || []).map(String))];
      const elegidos = pedidos.map((id) =>
        mapa.find(
          (asiento) =>
            String(asiento.id) === id || String(asiento.backendId) === id
        )
      );
      if (elegidos.some((asiento) => !asiento?.backendId)) {
        throw new ApiError(
          "Alguna de las butacas elegidas ya no está disponible. Actualizá el mapa e intentá de nuevo.",
          409,
          null
        );
      }
      if (elegidos.some((asiento) => asiento.estado === "ocupado")) {
        throw new ApiError(
          "Otra persona compró una de esas butacas. Elegí otra ubicación.",
          409,
          null
        );
      }

      const compra = await api.post("/compras", {
        funcionId: Number(funcionId),
        asientoIds: elegidos.map((asiento) => Number(asiento.backendId)),
        titular: meta?.titular
          ? {
              nombre: meta.titular.nombre,
              dni: meta.titular.dni,
              email: meta.titular.email,
              telefono: meta.titular.tel,
              localidad: meta.titular.localidad,
            }
          : undefined,
        pago: meta
          ? {
              metodo: meta.pago,
              comprobanteNombre: meta.comprobante?.name || null,
            }
          : undefined,
      });

      // El comprobante se sube después de crear la compra porque el endpoint
      // necesita el id. Si la subida falla, la compra ya está confirmada: se
      // informa el problema sin romper el flujo de éxito.
      let comprobanteError = null;
      if (meta?.comprobante?.file) {
        try {
          await api.upload(`/compras/${compra.id}/comprobante`, meta.comprobante.file);
        } catch (error) {
          comprobanteError =
            error?.message || "No pudimos subir el comprobante de la transferencia.";
        }
      }

      await cargarAsientos(funcionId, { force: true }).catch(() => {});
      const { compras: lista, entradas } = await recargarCompras();
      const guardada =
        lista.find((item) => Number(item.id) === Number(compra.id)) || compra;
      const mapeada = mapCompra(guardada, entradas);
      return comprobanteError ? { ...mapeada, comprobanteError } : mapeada;
    },
    [cargarAsientos, recargarCompras]
  );

  const resetCatalogo = useCallback(async () => {
    setOverlayObras({});
    cacheAsientos.current = {};
    setAsientosPorFuncion({});
    await cargarPublico();
    if (user) await cargarPrivado();
  }, [user, cargarPublico, cargarPrivado]);

  const value = useMemo(
    () => ({
      obras,
      salas,
      teatros,
      funciones,
      compras,
      getObra,
      getSala,
      getTeatro,
      getFuncion,
      getCompra,
      funcionesDeObra,
      teatrosDeObra,
      asientos,
      cargarAsientos,
      cargarAsientosDeFunciones,
      precioDe,
      addObra,
      updateObra,
      deleteObra,
      addFuncion,
      updateFuncion,
      deleteFuncion,
      updateSala,
      addTeatro,
      addCompra,
      recargarCompras,
      recargarSalas,
      resetCatalogo,
      formatARS,
      formatFecha,
      cargandoPublico: loadingPublico,
      cargandoPrivado: loadingPrivado,
      cargandoCompras: loadingPrivado,
      errorCatalogo: error,
      normalizarButaca,
    }),
    [
      obras,
      salas,
      teatros,
      funciones,
      compras,
      getObra,
      getSala,
      getTeatro,
      getFuncion,
      getCompra,
      funcionesDeObra,
      teatrosDeObra,
      asientos,
      cargarAsientos,
      cargarAsientosDeFunciones,
      addObra,
      updateObra,
      deleteObra,
      addFuncion,
      updateFuncion,
      deleteFuncion,
      updateSala,
      addTeatro,
      addCompra,
      recargarCompras,
      recargarSalas,
      resetCatalogo,
      loadingPublico,
      loadingPrivado,
      error,
    ]
  );

  if (loadingPublico && !rawObras.length) {
    return (
      <div className="min-h-screen bg-canvas-root flex flex-col items-center justify-center gap-4 text-center px-6">
        <span className="material-symbols-outlined text-5xl text-secondary animate-pulse">
          local_activity
        </span>
        <p className="text-sm font-bold text-ivory-text">
          Cargando cartelera desde el servidor…
        </p>
        <p className="text-xs text-ivory-muted">
          Backend: {import.meta.env.VITE_API_URL || "http://localhost:8080/api"}
        </p>
      </div>
    );
  }

  if (error && !rawObras.length) {
    return (
      <div className="min-h-screen bg-canvas-root flex flex-col items-center justify-center gap-4 text-center px-6">
        <span className="material-symbols-outlined text-5xl text-tertiary">
          cloud_off
        </span>
        <p className="text-base font-bold text-ivory-text">
          No pudimos cargar la cartelera
        </p>
        <p className="text-xs text-ivory-muted max-w-md">{error}</p>
        <button
          type="button"
          onClick={cargarPublico}
          className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-secondary text-canvas-root text-xs font-extrabold uppercase tracking-wider"
        >
          <span className="material-symbols-outlined text-base">refresh</span>
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
  );
}
