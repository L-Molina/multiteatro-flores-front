import { useCallback, useMemo, useState } from 'react'
import { CatalogContext } from './catalog-context'
import {
  FUNCIONES_INICIALES,
  OBRAS_INICIALES,
  SALAS_INICIALES,
  asientosDeFuncion,
  formatARS,
  formatFecha,
  precioDe,
} from '../data/catalogo'
import { COMPRAS_INICIALES } from '../data/compras'


const nextId = (list) => (list.length ? Math.max(...list.map((item) => item.id)) + 1 : 1)

function normalizarCategoria(genero = '') {
  const value = genero.toLowerCase()
  if (value.includes('stand')) return 'standup'
  if (value.includes('concierto') || value.includes('música') || value.includes('musica')) {
    return 'conciertos'
  }
  return 'teatro'
}

export function CatalogProvider({ children }) {
  const [obras, setObras] = useState(OBRAS_INICIALES)
  const [salas, setSalas] = useState(SALAS_INICIALES)
  const [funciones, setFunciones] = useState(FUNCIONES_INICIALES)
  const [compras, setCompras] = useState(COMPRAS_INICIALES)

  const teatros = useMemo(() => {
    const map = new Map()
    salas.forEach((sala) => {
      if (!map.has(sala.teatroId)) {
        map.set(sala.teatroId, {
          id: sala.teatroId,
          nombre: sala.teatro,
          direccion: sala.direccion,
          localidad: sala.localidad,
        })
      }
    })
    return [...map.values()].sort((a, b) => a.id - b.id)
  }, [salas])

  const getObra = useCallback(
    (id) => obras.find((obra) => obra.id === Number(id)) || null,
    [obras],
  )
  const getSala = useCallback(
    (id) => salas.find((sala) => sala.id === Number(id)) || null,
    [salas],
  )
  const getTeatro = useCallback(
    (id) => teatros.find((teatro) => teatro.id === Number(id)) || null,
    [teatros],
  )
  const getFuncion = useCallback(
    (id) => funciones.find((funcion) => funcion.id === Number(id)) || null,
    [funciones],
  )
  const getCompra = useCallback(
    (id) => compras.find((compra) => compra.id === Number(id)) || null,
    [compras],
  )

  const funcionesDeObra = useCallback(
    (obraId) =>
      funciones
        .filter((funcion) => funcion.obraId === Number(obraId))
        .sort((a, b) => `${a.fecha}${a.hora}`.localeCompare(`${b.fecha}${b.hora}`)),
    [funciones],
  )

  const teatrosDeObra = useCallback(
    (obraId) => {
      const ids = [...new Set(funcionesDeObra(obraId).map((funcion) => funcion.salaId))]
      return ids.map((id) => salas.find((sala) => sala.id === id)).filter(Boolean)
    },
    [funcionesDeObra, salas],
  )

  const asientos = useCallback(
    (funcionId) => {
      const funcion = getFuncion(funcionId)
      const sala = funcion ? getSala(funcion.salaId) : null
      return asientosDeFuncion(funcion, sala)
    },
    [getFuncion, getSala],
  )

  const addObra = useCallback((payload) => {
    setObras((prev) => {
      const obra = {
        id: nextId(prev),
        titulo: payload.titulo,
        genero: payload.genero || 'Teatro Clásico',
        categoria: payload.categoria || normalizarCategoria(payload.genero),
        duracion: Number(payload.duracion) || 90,
        elenco: payload.elenco || 'Compañía independiente',
        sinopsis: payload.sinopsis || 'Sinopsis a confirmar.',
        img: payload.img || '/assets/obras/toc-toc.svg',
        afiche: payload.afiche || '/assets/obras/toc-toc.svg',
        precio: Number(payload.precio) || 0,
        vip: Number(payload.vip) || 0,
        destacada: false,
        publicada: payload.publicada !== false,
        preventa: payload.preventa !== false,
        salaId: Number(payload.salaId) || 1,
        schedule: payload.schedule || 'Función a confirmar',
      }
      return [...prev, obra]
    })
  }, [])

  const updateObra = useCallback((id, payload) => {
    setObras((prev) =>
      prev.map((obra) =>
        obra.id === Number(id)
          ? {
              ...obra,
              ...payload,
              genero: payload.genero ?? obra.genero,
              categoria: payload.genero
                ? normalizarCategoria(payload.genero)
                : obra.categoria,
              precio: payload.precio != null ? Number(payload.precio) : obra.precio,
              vip: payload.vip != null ? Number(payload.vip) : obra.vip,
              duracion:
                payload.duracion != null ? Number(payload.duracion) : obra.duracion,
              salaId: payload.salaId != null ? Number(payload.salaId) : obra.salaId,
            }
          : obra,
      ),
    )
  }, [])

  const deleteObra = useCallback((id) => {
    setObras((prev) => prev.filter((obra) => obra.id !== Number(id)))
    setFunciones((prev) => prev.filter((funcion) => funcion.obraId !== Number(id)))
  }, [])

  const addFuncion = useCallback(
    (payload) => {
      setFunciones((prev) => {
        const obra = obras.find((item) => item.id === Number(payload.obraId))
        const funcion = {
          id: nextId(prev),
          obraId: Number(payload.obraId),
          salaId: Number(payload.salaId),
          fecha: payload.fecha,
          hora: payload.hora,
          estado: payload.estado || 'En Venta',
          enCurso: payload.estado === 'En Curso',
          duracion: Number(payload.duracion) || (obra ? obra.duracion : 90),
          precio: Number(payload.precio) || (obra ? obra.precio : 0),
        }
        return [...prev, funcion]
      })
    },
    [obras],
  )

  const updateFuncion = useCallback((id, payload) => {
    setFunciones((prev) =>
      prev.map((funcion) =>
        funcion.id === Number(id)
          ? {
              ...funcion,
              ...payload,
              obraId: payload.obraId != null ? Number(payload.obraId) : funcion.obraId,
              salaId: payload.salaId != null ? Number(payload.salaId) : funcion.salaId,
              duracion:
                payload.duracion != null ? Number(payload.duracion) : funcion.duracion,
              precio: payload.precio != null ? Number(payload.precio) : funcion.precio,
              enCurso: payload.estado
                ? payload.estado === 'En Curso'
                : funcion.enCurso,
            }
          : funcion,
      ),
    )
  }, [])

  const deleteFuncion = useCallback((id) => {
    setFunciones((prev) => prev.filter((funcion) => funcion.id !== Number(id)))
  }, [])

  const updateSala = useCallback((id, payload) => {
    setSalas((prev) =>
      prev.map((sala) =>
        sala.id === Number(id)
          ? {
              ...sala,
              capacidad: Number(payload.capacidad) || sala.capacidad,
              filas: Number(payload.filas) || sala.filas,
              columnas: Number(payload.columnas) || sala.columnas,
              vipFilas:
                payload.vipFilas != null ? Number(payload.vipFilas) : sala.vipFilas,
              layout: payload.layout || sala.layout,
            }
          : sala,
      ),
    )
  }, [])

  const addTeatro = useCallback(
    (payload) => {
      const nextTeatroId = salas.length
        ? Math.max(...salas.map((sala) => sala.teatroId)) + 1
        : 1
      const baseSalaId = salas.length ? Math.max(...salas.map((sala) => sala.id)) + 1 : 1
      const teatro = {
        id: nextTeatroId,
        nombre: payload.nombre,
        direccion: payload.direccion,
        localidad: payload.localidad || 'CABA',
      }
      const nuevasSalas = [1, 2, 3].map((numero, index) => ({
        id: baseSalaId + index,
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
      }))
      setSalas((prev) => [...prev, ...nuevasSalas])
      return teatro
    },
    [salas],
  )

  const addCompra = useCallback(
    (payload) => {
      const compra = {
        id: nextId(compras),
        creada: new Date().toISOString(),
        estado: 'Confirmada',
        ...payload,
      }
      setCompras((prev) => [compra, ...prev])
      return compra
    },
    [compras],
  )

  const resetCatalogo = useCallback(() => {
    setObras(OBRAS_INICIALES)
    setSalas(SALAS_INICIALES)
    setFunciones(FUNCIONES_INICIALES)
    setCompras(COMPRAS_INICIALES)
  }, [])

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
      resetCatalogo,
      formatARS,
      formatFecha,
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
      addObra,
      updateObra,
      deleteObra,
      addFuncion,
      updateFuncion,
      deleteFuncion,
      updateSala,
      addTeatro,
      addCompra,
      resetCatalogo,
    ],
  )

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
}
