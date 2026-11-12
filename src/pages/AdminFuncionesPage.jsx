import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import useCatalog from '../hooks/useCatalog'
import { ROLES } from '../context/auth-context'
import { isoFromNow } from '../data/catalogo'
import Modal from '../components/ui/Modal'
import Toast from '../components/ui/Toast'
import useToast from '../hooks/useToast'
import useDocumentTitle from '../hooks/useDocumentTitle'
import { enteroEnRango } from '../utils/validacion'

const LAYOUTS = [
  'Platea + palcos',
  'Platea central',
  'Auditorio',
  'Cámara íntima',
  'Escenario reversible',
]

function estadoClass(estado) {
  if (estado === 'En Curso') return 'bg-secondary-container text-[#071510]'
  if (estado === 'En Venta') return 'bg-[#143327] text-secondary'
  if (estado === 'Últimas') return 'bg-tertiary-container text-tertiary'
  return 'bg-surface-elevated text-on-surface-muted'
}

export default function AdminFuncionesPage() {
  useDocumentTitle('Funciones y Aforo')
  const { user } = useAuth()
  const {
    obras,
    salas,
    teatros,
    funciones,
    getObra,
    getSala,
    getFuncion,
    asientos,
    addFuncion,
    updateFuncion,
    deleteFuncion,
    updateSala,
    formatARS,
    formatFecha,
  } = useCatalog()
  const [searchParams] = useSearchParams()
  const { message, tone, showToast } = useToast()

  const [teatroFiltro, setTeatroFiltro] = useState('')
  const [salaFiltro, setSalaFiltro] = useState('')
  const esDueno = user?.rol === ROLES.DUENO
  const esSuperadmin = user?.rol === ROLES.SUPERADMIN
  const teatroPropioId = esDueno ? Number(user?.teatroId) || null : null
  const teatroFiltroEfectivo = esDueno ? String(teatroPropioId || '') : teatroFiltro
  const [obraFiltro, setObraFiltro] = useState(searchParams.get('obra') || '')
  const [selectedIdState, setSelectedFuncionId] = useState(null)
  const [functionModalOpen, setFunctionModalOpen] = useState(false)
  const [editingFuncion, setEditingFuncion] = useState(null)
  const [functionForm, setFunctionForm] = useState(null)
  const [functionError, setFunctionError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [salaModalOpen, setSalaModalOpen] = useState(false)
  const [salaForm, setSalaForm] = useState(null)
  const [salaError, setSalaError] = useState('')

  const salasEnAlcance = useMemo(() => {
    if (esDueno) {
      return salas.filter((sala) => sala.teatroId === teatroPropioId)
    }
    if (teatroFiltroEfectivo) {
      return salas.filter((sala) => sala.teatroId === Number(teatroFiltroEfectivo))
    }
    return salas
  }, [salas, esDueno, teatroPropioId, teatroFiltroEfectivo])

  const salaFiltroEfectiva = salasEnAlcance.some((sala) => sala.id === Number(salaFiltro))
    ? Number(salaFiltro)
    : null

  const funcionesFiltradas = useMemo(() => {
    const idsAlcance = new Set(salasEnAlcance.map((sala) => sala.id))
    return funciones
      .filter((funcion) => idsAlcance.has(funcion.salaId))
      .filter((funcion) =>
        salaFiltroEfectiva ? funcion.salaId === salaFiltroEfectiva : true,
      )
      .filter((funcion) => (!obraFiltro ? true : funcion.obraId === Number(obraFiltro)))
      .sort((a, b) => `${a.fecha}${a.hora}`.localeCompare(`${b.fecha}${b.hora}`))
  }, [funciones, salasEnAlcance, salaFiltroEfectiva, obraFiltro])

  const selectedFuncionId = funcionesFiltradas.some((funcion) => funcion.id === selectedIdState)
    ? selectedIdState
    : funcionesFiltradas[0]?.id ?? null

  const mapas = useMemo(() => {
    const result = {}
    funcionesFiltradas.forEach((funcion) => {
      result[funcion.id] = asientos(funcion.id)
    })
    return result
  }, [funcionesFiltradas, asientos])

  const selectedFuncion = getFuncion(selectedFuncionId)
  const selectedSala = selectedFuncion ? getSala(selectedFuncion.salaId) : null
  const asientosSeleccionados = useMemo(
    () => (selectedFuncionId ? mapas[selectedFuncionId] || asientos(selectedFuncionId) : []),
    [selectedFuncionId, mapas, asientos],
  )

  const metricas = useMemo(() => {
    let ocupadas = 0
    let capacidad = 0
    let recaudacion = 0
    funcionesFiltradas.forEach((funcion) => {
      const mapa = mapas[funcion.id] || []
      const ocupadasFuncion = mapa.filter((asiento) => asiento.estado === 'ocupado').length
      ocupadas += ocupadasFuncion
      capacidad += mapa.length
      const obra = getObra(funcion.obraId)
      recaudacion += ocupadasFuncion * (funcion.precio || obra?.precio || 0)
    })
    return {
      ocupadas,
      capacidad,
      recaudacion,
      promedio: capacidad ? Math.round((ocupadas / capacidad) * 100) : 0,
      libres: asientosSeleccionados.filter((asiento) => asiento.estado === 'disponible').length,
    }
  }, [funcionesFiltradas, mapas, getObra, asientosSeleccionados])

  const salasMetrica = useMemo(
    () =>
      salaFiltroEfectiva
        ? salasEnAlcance.filter((sala) => sala.id === salaFiltroEfectiva)
        : salasEnAlcance,
    [salasEnAlcance, salaFiltroEfectiva],
  )
  const capacidadAlcance = useMemo(
    () => salasMetrica.reduce((acc, sala) => acc + Number(sala.capacidad || 0), 0),
    [salasMetrica],
  )

  const teatroActual = teatros.find((teatro) => teatro.id === Number(teatroFiltroEfectivo))
  const alcanceLabel = salaFiltroEfectiva
    ? `${getSala(salaFiltroEfectiva)?.teatro || ''} • ${getSala(salaFiltroEfectiva)?.nombre || ''}`
    : teatroActual
      ? teatroActual.nombre
      : 'Todas las salas'

  const cambiarTeatro = (value) => {
    setTeatroFiltro(value)
    setSalaFiltro('')
  }

  const teatroNombreDeSala = (salaId) => {
    const sala = getSala(salaId)
    return teatros.find((teatro) => teatro.id === sala?.teatroId)?.nombre || sala?.teatro || ''
  }

  const salaBloqueada = (salaId) =>
    funciones.some(
      (funcion) =>
        funcion.salaId === Number(salaId) && (funcion.estado === 'En Curso' || funcion.enCurso),
    )

  const abrirNuevaFuncion = () => {
    const salaInicial = salaFiltroEfectiva || salasEnAlcance[0]?.id
    if (!salaInicial) {
      showToast('No hay salas disponibles para programar funciones.', 'error')
      return
    }
    setEditingFuncion(null)
    setFunctionForm({
      obraId: obras[0]?.id || 1,
      salaId: Number(salaInicial),
      fecha: isoFromNow(1),
      hora: '21:00',
      duracion: obras[0]?.duracion || 90,
      precio: obras[0]?.precio || 30000,
      estado: 'En Venta',
    })
    setFunctionError('')
    setFunctionModalOpen(true)
  }

  const abrirEdicionFuncion = (funcion) => {
    const obra = getObra(funcion.obraId)
    setEditingFuncion(funcion)
    setFunctionForm({
      obraId: funcion.obraId,
      salaId: funcion.salaId,
      fecha: funcion.fecha,
      hora: funcion.hora,
      duracion: funcion.duracion || obra?.duracion || 90,
      precio: funcion.precio || obra?.precio || 0,
      estado: funcion.estado,
    })
    setFunctionError('')
    setFunctionModalOpen(true)
  }

  const guardarFuncion = (event) => {
    event.preventDefault()
    if (!functionForm) return
    if (!salasEnAlcance.some((sala) => sala.id === Number(functionForm.salaId))) {
      setFunctionError(
        esDueno
          ? 'La sala seleccionada no pertenece a tu teatro.'
          : 'La sala seleccionada no está disponible.',
      )
      return
    }
    if (!functionForm.fecha || !functionForm.hora) {
      setFunctionError('Completá fecha y hora de la función.')
      return
    }
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(functionForm.fecha) ||
      Number.isNaN(Date.parse(`${functionForm.fecha}T12:00:00`))
    ) {
      setFunctionError('La fecha no tiene un formato válido (AAAA-MM-DD).')
      return
    }
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(functionForm.hora)) {
      setFunctionError('La hora debe tener formato de 24 horas (HH:MM).')
      return
    }
    if (!enteroEnRango(functionForm.duracion, 30, 600)) {
      setFunctionError('La duración debe ser un entero entre 30 y 600 minutos.')
      return
    }
    if (!enteroEnRango(functionForm.precio, 0, 10000000)) {
      setFunctionError('El precio base debe ser un entero entre 0 y 10.000.000.')
      return
    }
    if (!editingFuncion && functionForm.fecha < isoFromNow(0)) {
      setFunctionError('La fecha de una nueva función no puede ser anterior a hoy.')
      return
    }
    const duplicate = funciones.some(
      (funcion) =>
        funcion.salaId === Number(functionForm.salaId) &&
        funcion.fecha === functionForm.fecha &&
        funcion.hora === functionForm.hora &&
        funcion.id !== editingFuncion?.id,
    )
    if (duplicate) {
      setFunctionError(
        'Ya existe una función programada en esa sala para la misma fecha y hora.',
      )
      return
    }

    const payload = {
      obraId: Number(functionForm.obraId),
      salaId: Number(functionForm.salaId),
      fecha: functionForm.fecha,
      hora: functionForm.hora,
      duracion: Number(functionForm.duracion),
      precio: Number(functionForm.precio),
      estado: functionForm.estado,
    }
    const obra = getObra(payload.obraId)
    if (editingFuncion) {
      updateFuncion(editingFuncion.id, payload)
      showToast(
        `Función actualizada: ${formatFecha(payload.fecha)} a las ${payload.hora} hs${
          payload.estado === 'En Curso'
            ? '. La sala queda bloqueada para editar aforo y layout.'
            : '.'
        }`,
      )
    } else {
      addFuncion(payload)
      showToast(
        `Función programada: "${obra?.titulo || 'Obra'}" el ${formatFecha(payload.fecha)} a las ${
          payload.hora
        } hs.`,
      )
    }
    setFunctionModalOpen(false)
    setEditingFuncion(null)
  }

  const confirmarBajaFuncion = () => {
    if (!deleteTarget) return
    deleteFuncion(deleteTarget.id)
    setDeleteTarget(null)
    showToast(
      'Función dada de baja. Las butacas disponibles volvieron al aforo de venta.',
    )
  }

  const abrirSala = (sala) => {
    if (!salasEnAlcance.some((item) => item.id === sala.id)) return
    setSalaForm({
      id: sala.id,
      nombre: sala.nombre,
      capacidad: sala.capacidad,
      filas: sala.filas,
      columnas: sala.columnas,
      vipFilas: sala.vipFilas,
      layout: sala.layout,
    })
    setSalaError('')
    setSalaModalOpen(true)
  }

  const guardarSala = (event) => {
    event.preventDefault()
    if (!salaForm) return
    if (salaBloqueada(salaForm.id)) return
    if (!enteroEnRango(salaForm.capacidad, 20, 900)) {
      setSalaError('La sala debe tener entre 20 y 900 butacas.')
      return
    }
    if (!enteroEnRango(salaForm.filas, 2, 30) || !enteroEnRango(salaForm.columnas, 2, 30)) {
      setSalaError('Ingresá entre 2 y 30 filas, y entre 2 y 30 butacas por fila.')
      return
    }
    if (!enteroEnRango(salaForm.vipFilas, 0, Number(salaForm.filas))) {
      setSalaError('Las filas VIP deben ser un entero entre 0 y el total de filas.')
      return
    }
    updateSala(salaForm.id, salaForm)
    setSalaModalOpen(false)
    showToast(
      `Sala "${salaForm.nombre}" actualizada: ${salaForm.capacidad} butacas (${salaForm.filas} × ${salaForm.columnas}).`,
    )
  }

  const salaLocked = salaForm ? salaBloqueada(salaForm.id) : false

  return (
    <div className="w-full max-w-[1400px] mx-auto">
      <header className="w-full px-4 sm:px-8 pt-6 pb-4">
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
          <div className="flex flex-col gap-2 max-w-3xl">
            <div className="flex items-center gap-2 text-secondary">
              <span className="material-symbols-outlined text-[1.2rem]">theater_comedy</span>
              <span className="text-xs uppercase tracking-wider font-bold">
                Módulo Técnico de Boletería y Sala
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
              Gestión de Funciones &amp; Aforo por Sala
            </h1>
            <p className="text-sm text-on-surface-variant max-w-2xl leading-relaxed">
              {esDueno
                ? `Gestionás exclusivamente las funciones y el aforo de las salas de ${user?.teatroNombre || 'tu teatro'}. Podés comprar entradas en cualquier otra sala como un usuario común.`
                : 'Control de grilla horaria, habilitación técnica de butacas, aforos preventivos y estado de ocupación de todas las salas.'}
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              {esSuperadmin ? (
                <Link
                  to="/admin/obras"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-card border border-panel-border text-on-surface-muted hover:text-secondary text-xs font-semibold transition-colors"
                >
                  <span className="material-symbols-outlined text-base">edit_note</span>
                  Obras y cartelera
                </Link>
              ) : null}
              <Link
                to="/admin/funciones"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-container border border-primary/30 text-primary text-xs font-bold"
              >
                <span className="material-symbols-outlined text-base">event_seat</span>
                Funciones y aforo
              </Link>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {esSuperadmin ? (
              <div className="relative min-w-[220px]">
                <label className="sr-only" htmlFor="teatro-selector">
                  Filtrar por teatro
                </label>
                <div className="flex items-center px-3.5 py-2 rounded bg-[#0c211a] border border-[#1e4d3a] hover:border-secondary/60 shadow-sm transition-colors">
                  <span className="material-symbols-outlined text-secondary mr-2 text-[1.2rem]">
                    location_on
                  </span>
                  <div className="flex flex-col flex-1 leading-none min-w-0">
                    <span className="text-[0.65rem] uppercase tracking-wider text-outline font-semibold">
                      Teatro
                    </span>
                    <select
                      id="teatro-selector"
                      value={teatroFiltro}
                      onChange={(event) => cambiarTeatro(event.target.value)}
                      className="select-arrow bg-transparent text-sm text-on-surface font-bold outline-none mt-0.5 cursor-pointer max-w-[190px]"
                    >
                      <option value="" className="bg-surface-card">
                        Todos los teatros
                      </option>
                      {teatros.map((teatro) => (
                        <option key={teatro.id} value={teatro.id} className="bg-surface-card">
                          {teatro.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center px-3.5 py-2 rounded bg-[#0c211a] border border-[#1e4d3a]">
                <span className="material-symbols-outlined text-secondary mr-2 text-[1.2rem]">
                  storefront
                </span>
                <div className="flex flex-col leading-none min-w-0">
                  <span className="text-[0.65rem] uppercase tracking-wider text-outline font-semibold">
                    Teatro asignado
                  </span>
                  <span className="text-sm text-on-surface font-bold mt-0.5 truncate max-w-[190px]">
                    {user?.teatroNombre || 'Sin teatro'}
                  </span>
                </div>
              </div>
            )}

            <div className="relative min-w-[250px]">
              <label className="sr-only" htmlFor="sala-selector">
                Seleccionar Sala
              </label>
              <div className="flex items-center px-3.5 py-2 rounded bg-[#0c211a] border border-[#1e4d3a] hover:border-secondary/60 shadow-sm transition-colors">
                <span className="material-symbols-outlined text-secondary mr-2 text-[1.2rem]">
                  meeting_room
                </span>
                <div className="flex flex-col flex-1 leading-none min-w-0">
                  <span className="text-[0.65rem] uppercase tracking-wider text-outline font-semibold">
                    Sala
                  </span>
                  <select
                    id="sala-selector"
                    value={salaFiltro}
                    onChange={(event) => setSalaFiltro(event.target.value)}
                    className="select-arrow bg-transparent text-sm text-on-surface font-bold outline-none mt-0.5 cursor-pointer max-w-[210px]"
                  >
                    <option value="" className="bg-surface-card">
                      Todas las salas
                    </option>
                    {salasEnAlcance.map((sala) => (
                      <option key={sala.id} value={sala.id} className="bg-surface-card">
                        {teatroFiltroEfectivo
                          ? sala.nombre
                          : `${sala.teatro} — ${sala.nombre}`}
                      </option>
                    ))}
                  </select>
                </div>
                <span className="px-2 py-0.5 rounded bg-[#143327] text-secondary text-xs ml-2 font-bold whitespace-nowrap">
                  {salaFiltroEfectiva
                    ? `${getSala(salaFiltroEfectiva)?.capacidad || 0} BUT.`
                    : `${salasEnAlcance.length} SALAS`}
                </span>
              </div>
            </div>

            <select
              value={obraFiltro}
              onChange={(event) => setObraFiltro(event.target.value)}
              className="select-arrow px-3.5 py-3 rounded bg-[#0c211a] border border-[#1e4d3a] text-on-surface text-xs font-semibold focus:outline-none focus:border-secondary cursor-pointer max-w-[220px]"
              aria-label="Filtrar por obra"
            >
              <option value="">Todas las obras</option>
              {obras.map((obra) => (
                <option key={obra.id} value={obra.id}>
                  {obra.titulo}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => showToast('Manifiesto de sala generado en PDF (simulación del prototipo).')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded bg-[#0c211a] border border-[#1e4d3a] hover:bg-[#112c22] text-on-surface text-xs font-semibold transition-colors"
              title="Exportar Manifiesto de Sala en PDF/Excel"
            >
              <span className="material-symbols-outlined text-primary text-[1.1rem]">download</span>
              <span>Manifiesto</span>
            </button>

            <button
              type="button"
              onClick={abrirNuevaFuncion}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded bg-tertiary-container hover:bg-tertiary-container/90 text-on-tertiary-container text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_16px_rgba(118,18,0,0.35)] hover:shadow-[0_0_22px_rgba(118,18,0,0.5)]"
            >
              <span className="material-symbols-outlined text-[1.15rem]">add_circle</span>
              <span>Programar Nueva Función</span>
            </button>
          </div>
        </div>
      </header>

      <section className="w-full px-4 sm:px-8 py-2">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="flex flex-col p-4 rounded bg-[#0c211a] border border-[#1e4d3a] shadow-sm">
            <div className="flex items-center justify-between text-outline mb-1">
              <span className="text-xs uppercase tracking-wider font-semibold">Capacidad Total</span>
              <span className="material-symbols-outlined text-secondary text-[1.1rem]">chair</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-on-surface">{capacidadAlcance}</span>
              <span className="text-xs text-outline font-medium">butacas</span>
            </div>
            <div className="w-full h-1 bg-[#143327] rounded-full mt-2.5 overflow-hidden">
              <div className="h-full bg-secondary w-full" />
            </div>
            <span className="text-[0.7rem] text-outline mt-2 font-medium">
              {salasMetrica.length} {salasMetrica.length === 1 ? 'sala' : 'salas'} en el alcance
            </span>
          </div>

          <div className="flex flex-col p-4 rounded bg-[#0c211a] border border-[#1e4d3a] shadow-sm">
            <div className="flex items-center justify-between text-outline mb-1">
              <span className="text-xs uppercase tracking-wider font-semibold">En Cartelera</span>
              <span className="material-symbols-outlined text-primary text-[1.1rem]">
                confirmation_number
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-primary">{funcionesFiltradas.length}</span>
              <span className="text-xs text-on-surface-variant font-medium">funciones</span>
            </div>
            <div className="w-full h-1 bg-[#143327] rounded-full mt-2.5 overflow-hidden">
              <div
                className="h-full bg-primary"
                style={{
                  width: `${Math.min(100, funcionesFiltradas.length * 20)}%`,
                }}
              />
            </div>
            <span className="text-[0.7rem] text-primary/80 mt-2 font-medium">
              {obraFiltro
                ? 'Filtradas por obra'
                : salaFiltroEfectiva
                  ? 'Todas las obras de la sala'
                  : teatroActual
                    ? 'Todas las obras del teatro'
                    : 'Todas las salas del alcance'}
            </span>
          </div>

          <div className="flex flex-col p-4 rounded bg-[#0c211a] border border-[#1e4d3a] shadow-sm">
            <div className="flex items-center justify-between text-outline mb-1">
              <span className="text-xs uppercase tracking-wider font-semibold">Ocupación Prom.</span>
              <span className="material-symbols-outlined text-secondary text-[1.1rem]">
                groups
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-secondary">{metricas.promedio}%</span>
              <span className="text-xs text-outline font-medium">
                {metricas.ocupadas} butacas
              </span>
            </div>
            <div className="w-full h-1 bg-[#143327] rounded-full mt-2.5 overflow-hidden">
              <div className="h-full bg-secondary-container" style={{ width: `${metricas.promedio}%` }} />
            </div>
            <span className="text-[0.7rem] text-secondary mt-2 font-medium">
              Sobre {metricas.capacidad} ubicaciones
            </span>
          </div>

          <div className="flex flex-col p-4 rounded bg-[#0c211a] border border-[#1e4d3a] shadow-sm">
            <div className="flex items-center justify-between text-outline mb-1">
              <span className="text-xs uppercase tracking-wider font-semibold">Butacas Libres</span>
              <span className="material-symbols-outlined text-primary text-[1.1rem]">chair_alt</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-on-surface">{metricas.libres}</span>
              <span className="text-xs text-outline font-medium">función elegida</span>
            </div>
            <div className="w-full h-1 bg-[#143327] rounded-full mt-2.5 overflow-hidden">
              <div
                className="h-full bg-primary"
                style={{
                  width: `${
                    asientosSeleccionados.length
                      ? Math.round((metricas.libres / asientosSeleccionados.length) * 100)
                      : 0
                  }%`,
                }}
              />
            </div>
            <span className="text-[0.7rem] text-outline mt-2 font-medium">
              Disponibles online + taquilla
            </span>
          </div>

          <div className="col-span-2 md:col-span-1 flex flex-col p-4 rounded bg-[#0c211a] border border-[#1e4d3a] shadow-sm">
            <div className="flex items-center justify-between text-outline mb-1">
              <span className="text-xs uppercase tracking-wider font-semibold">Recaudación Prox.</span>
              <span className="material-symbols-outlined text-tertiary text-[1.1rem]">payments</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-tertiary truncate">
                {formatARS(metricas.recaudacion)}
              </span>
            </div>
            <div className="w-full h-1 bg-[#143327] rounded-full mt-2.5 overflow-hidden">
              <div className="h-full bg-tertiary-container" style={{ width: `${metricas.promedio}%` }} />
            </div>
            <div className="flex items-center justify-between text-[0.7rem] mt-2 text-on-tertiary-container font-semibold">
              <span>{metricas.promedio}% ocupación</span>
              <span>{metricas.ocupadas} vendidas</span>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full px-4 sm:px-8 pt-4 pb-2">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs uppercase tracking-wider text-secondary font-bold">
                Grilla de Funciones en Cartelera:
              </span>
              <span className="text-sm font-semibold text-on-surface">
                {alcanceLabel} — {funcionesFiltradas.length} funciones
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-outline text-xs font-medium">
              <span>Orden: Cronológico</span>
              <span className="material-symbols-outlined text-[1rem]">tune</span>
            </div>
          </div>

          {funcionesFiltradas.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
              {funcionesFiltradas.map((funcion) => {
                const selected = selectedFuncionId === funcion.id
                const mapa = mapas[funcion.id] || []
                const ocupadas = mapa.filter((asiento) => asiento.estado === 'ocupado').length
                const porcentaje = mapa.length ? Math.round((ocupadas / mapa.length) * 100) : 0
                const obra = getObra(funcion.obraId)
                const salaFuncion = getSala(funcion.salaId)
                return (
                  <div
                    key={funcion.id}
                    onClick={() => setSelectedFuncionId(funcion.id)}
                    className={`function-card relative p-4 rounded cursor-pointer transition-all flex flex-col justify-between ${
                      selected
                        ? 'bg-[#112c22] border-2 border-secondary/80 shadow-md'
                        : 'bg-[#0c211a] border border-[#1e4d3a] hover:bg-[#112c22]'
                    }`}
                  >
                    <div className="absolute top-1.5 right-2 z-10 flex gap-1">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          abrirEdicionFuncion(funcion)
                        }}
                        className="w-7 h-7 rounded-full bg-[#071510] border border-[#1e4d3a] text-secondary hover:bg-[#143327] hover:text-white flex items-center justify-center transition-colors"
                        title="Editar esta función"
                        aria-label={`Editar función del ${formatFecha(funcion.fecha)}`}
                      >
                        <span className="material-symbols-outlined text-[0.95rem]">edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          setDeleteTarget(funcion)
                        }}
                        className="function-delete w-7 h-7 rounded-full bg-[#071510] border border-[#1e4d3a] text-tertiary hover:bg-[#761200] hover:text-white flex items-center justify-center transition-colors"
                        title="Dar de baja esta función"
                        aria-label={`Dar de baja función del ${formatFecha(funcion.fecha)}`}
                      >
                        <span className="material-symbols-outlined text-[0.95rem]">delete</span>
                      </button>
                    </div>

                    <div className="pr-14">
                      <div className="flex items-center gap-1.5 text-secondary font-bold text-base">
                        <span>{formatFecha(funcion.fecha, { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="px-2 py-0.5 rounded bg-[#1c4233] text-on-surface text-xs font-bold">
                          {funcion.hora} HS
                        </span>
                        <span className="text-xs text-on-surface-variant font-medium truncate">
                          {obra?.titulo || 'Función'}
                        </span>
                      </div>
                      <p className="text-[11px] text-on-surface-muted mt-1.5 truncate flex items-center gap-1">
                        <span className="material-symbols-outlined text-[0.9rem] text-secondary">
                          location_on
                        </span>
                        {salaFuncion?.teatro || teatroNombreDeSala(funcion.salaId)} •{' '}
                        {salaFuncion?.nombre || 'Sala'}
                      </p>
                    </div>

                    <div className="mt-4 pt-1 flex items-center justify-between gap-2">
                      <div className="flex flex-col">
                        <span className="text-base font-bold text-on-surface">
                          {ocupadas} / {mapa.length}
                        </span>
                        <span className="text-xs text-outline">Ocupación: {porcentaje}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[0.65rem] uppercase font-bold ${estadoClass(
                            funcion.estado,
                          )}`}
                        >
                          {funcion.estado}
                        </span>
                        <div className="w-8 h-8 rounded-full bg-[#143327] flex items-center justify-center text-outline">
                          <span className="material-symbols-outlined text-[1.1rem]">
                            {selected ? 'radio_button_checked' : 'radio_button_unchecked'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-panel-border bg-surface-card p-8 text-center mt-1">
              <span className="material-symbols-outlined text-4xl text-secondary">event_busy</span>
              <p className="mt-2 text-sm font-bold text-on-surface">
                No hay funciones programadas con estos filtros.
              </p>
              <p className="mt-1 text-xs text-on-surface-muted">
                Programá una nueva función o cambiá la sala/obra seleccionada.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="w-full px-4 sm:px-8 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <section className="lg:col-span-7 rounded-xl border border-panel-border bg-surface-card p-5">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-lg font-bold text-on-surface">Mapa de butacas</h2>
                <p className="text-xs text-on-surface-muted">
                  Vista técnica del plano de sala y ocupación de la función seleccionada.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded bg-surface-dark border border-panel-border text-xs font-semibold text-secondary text-right">
                {selectedSala ? `${selectedSala.teatro} • ${selectedSala.nombre}` : 'Sin sala'}
              </span>
            </div>

            {selectedFuncion ? (
              <>
                <div className="flex flex-wrap items-center gap-3 rounded-lg border border-panel-border bg-surface-dark px-3 py-2.5 mb-4">
                  <span className="text-xs font-bold text-on-surface">
                    {getObra(selectedFuncion.obraId)?.titulo}
                  </span>
                  <span className="text-xs text-secondary font-semibold">
                    {formatFecha(selectedFuncion.fecha)} • {selectedFuncion.hora} hs
                  </span>
                  <span className={`ml-auto px-2 py-0.5 rounded text-[0.65rem] uppercase font-bold ${estadoClass(selectedFuncion.estado)}`}>
                    {selectedFuncion.estado}
                  </span>
                </div>

                <div className="w-full rounded-lg border border-panel-border bg-[#071510] py-2 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-secondary mb-3">
                  Escenario
                </div>

                <div className="max-h-[330px] overflow-auto pr-1 flex flex-col gap-1">
                  {Object.entries(
                    asientosSeleccionados.reduce((rows, asiento) => {
                      if (!rows[asiento.fila]) rows[asiento.fila] = []
                      rows[asiento.fila].push(asiento)
                      return rows
                    }, {}),
                  ).map(([fila, seatRow]) => (
                    <div key={fila} className="flex items-center gap-1.5">
                      <span className="w-8 text-right text-[9px] font-bold text-outline">
                        {fila}
                      </span>
                      <div className="flex gap-0.5 flex-wrap">
                        {seatRow.map((asiento) => (
                          <span
                            key={asiento.id}
                            title={`Fila ${asiento.fila} • Butaca ${asiento.numero} — ${asiento.estado}`}
                            className={`w-2 h-2 rounded-t ${
                              asiento.estado === 'ocupado'
                                ? 'bg-[#1b4234]'
                                : asiento.estado === 'bloqueado'
                                  ? 'bg-tertiary-container'
                                  : asiento.tipo === 'vip'
                                    ? 'bg-secondary/80'
                                    : 'bg-primary/50'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-[11px] text-ivory-muted border-t border-panel-border pt-3 mt-3">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-t bg-primary/50" />
                    Disponible estándar
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-t bg-secondary/80" />
                    Disponible VIP
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-t bg-[#1b4234]" />
                    Ocupada
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-t bg-tertiary-container" />
                    Bloqueada
                  </span>
                </div>
              </>
            ) : (
              <p className="text-sm text-on-surface-muted py-10 text-center">
                Seleccioná una función de la grilla para ver su plano de butacas.
              </p>
            )}
          </section>

          <aside className="lg:col-span-5 flex flex-col gap-4">
            <div className="rounded-xl border border-panel-border bg-surface-card p-5">
              <h3 className="text-sm font-bold text-on-surface mb-3">Salas y aforo</h3>
              <div className="flex flex-col gap-2.5">
                {salasEnAlcance.map((sala) => {
                  const locked = salaBloqueada(sala.id)
                  const cantidadFunciones = funciones.filter((f) => f.salaId === sala.id).length
                  return (
                    <div
                      key={sala.id}
                      className={`rounded-lg border p-3 transition-colors ${
                        sala.id === salaFiltroEfectiva
                          ? 'border-secondary/60 bg-[#112c22]'
                          : 'border-panel-border bg-surface-dark'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-on-surface truncate">{sala.nombre}</p>
                          <p className="text-[10px] text-on-surface-muted truncate">
                            {sala.teatro} • {sala.layout}
                          </p>
                        </div>
                        {locked ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-tertiary-container text-tertiary text-[0.6rem] uppercase font-bold">
                            <span className="material-symbols-outlined text-[0.75rem]">lock</span>
                            En curso
                          </span>
                        ) : null}
                      </div>
                      <div className="flex items-center justify-between gap-2 mt-2">
                        <div className="flex items-center gap-2 text-[10px] text-on-surface-muted">
                          <span className="px-1.5 py-0.5 rounded bg-surface-card border border-panel-border font-semibold">
                            {sala.capacidad} Butacas
                          </span>
                          <span>{cantidadFunciones} funciones</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => abrirSala(sala)}
                          className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-colors ${
                            locked
                              ? 'bg-surface-card border border-panel-border text-on-surface-muted cursor-not-allowed'
                              : 'bg-secondary text-[#071510] hover:bg-secondary-hover'
                          }`}
                          disabled={locked}
                          title={
                            locked
                              ? 'La sala tiene una función en curso'
                              : 'Gestionar capacidad y layout'
                          }
                        >
                          Gestionar
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="rounded-xl border border-panel-border bg-surface-card p-5 text-xs text-on-surface-muted leading-relaxed">
              <p className="text-sm font-bold text-on-surface mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-base text-secondary">info</span>
                Bloqueo de sala
              </p>
              <p>
                Si una sala tiene una función con estado <strong>“En Curso”</strong>, no se puede
                modificar su layout ni la cantidad de butacas hasta que finalice. La validación se
                aplica tanto en el ABM de funciones como en la gestión de salas.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <Modal
        open={functionModalOpen}
        onClose={() => setFunctionModalOpen(false)}
        title={editingFuncion ? 'Editar función' : 'Programar nueva función'}
        description="La función se agrega a la grilla de la sala y queda disponible para la venta."
        labelledBy="function-modal-title"
      >
        {functionForm ? (
          <form className="flex flex-col gap-3.5" onSubmit={guardarFuncion} noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="admin-field">
                <label className="admin-label" htmlFor="funcion-obra">
                  Obra *
                </label>
                <select
                  id="funcion-obra"
                  className="admin-input"
                  value={functionForm.obraId}
                  onChange={(event) => {
                    const obraId = Number(event.target.value)
                    const obra = getObra(obraId)
                    setFunctionForm((prev) => ({
                      ...prev,
                      obraId,
                      duracion: obra?.duracion || prev.duracion,
                      precio: obra?.precio || prev.precio,
                    }))
                  }}
                >
                  {obras.map((obra) => (
                    <option key={obra.id} value={obra.id}>
                      {obra.titulo}
                    </option>
                  ))}
                </select>
              </div>
              <div className="admin-field">
                <label className="admin-label" htmlFor="funcion-sala">
                  Sala *
                </label>
                <select
                  id="funcion-sala"
                  className="admin-input"
                  value={functionForm.salaId}
                  onChange={(event) =>
                    setFunctionForm((prev) => ({ ...prev, salaId: Number(event.target.value) }))
                  }
                >
                  {salasEnAlcance.map((sala) => (
                    <option key={sala.id} value={sala.id}>
                      {sala.teatro} — {sala.nombre} ({sala.capacidad})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="admin-field">
                <label className="admin-label" htmlFor="funcion-fecha">
                  Fecha *
                </label>
                <input
                  id="funcion-fecha"
                  className="admin-input"
                  type="date"
                  min={isoFromNow(0)}
                  value={functionForm.fecha}
                  onChange={(event) =>
                    setFunctionForm((prev) => ({ ...prev, fecha: event.target.value }))
                  }
                />
              </div>
              <div className="admin-field">
                <label className="admin-label" htmlFor="funcion-hora">
                  Hora *
                </label>
                <input
                  id="funcion-hora"
                  className="admin-input"
                  type="time"
                  value={functionForm.hora}
                  onChange={(event) =>
                    setFunctionForm((prev) => ({ ...prev, hora: event.target.value }))
                  }
                />
              </div>
              <div className="admin-field">
                <label className="admin-label" htmlFor="funcion-duracion">
                  Duración (min)
                </label>
                <input
                  id="funcion-duracion"
                  className="admin-input"
                  type="number"
                  min="30"
                  max="600"
                  step="5"
                  value={functionForm.duracion}
                  onChange={(event) =>
                    setFunctionForm((prev) => ({ ...prev, duracion: event.target.value }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="admin-field">
                <label className="admin-label" htmlFor="funcion-precio">
                  Precio base ($ ARS)
                </label>
                <input
                  id="funcion-precio"
                  className="admin-input"
                  type="number"
                  min="0"
                  max="10000000"
                  step="100"
                  value={functionForm.precio}
                  onChange={(event) =>
                    setFunctionForm((prev) => ({ ...prev, precio: event.target.value }))
                  }
                />
              </div>
              <div className="admin-field">
                <label className="admin-label" htmlFor="funcion-estado">
                  Estado
                </label>
                <select
                  id="funcion-estado"
                  className="admin-input"
                  value={functionForm.estado}
                  onChange={(event) =>
                    setFunctionForm((prev) => ({ ...prev, estado: event.target.value }))
                  }
                >
                  <option>En Venta</option>
                  <option>Últimas</option>
                  <option>En Curso</option>
                  <option>Agotada</option>
                </select>
              </div>
            </div>

            <div className="rounded-lg border border-panel-border bg-surface-dark p-3 text-[11px] text-on-surface-muted flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-base">info</span>
              Si la sala tiene una función en curso, la edición de su layout queda bloqueada hasta
              que finalice.
            </div>

            {functionError ? (
              <p
                className="text-xs text-tertiary bg-tertiary-container/30 border border-tertiary/40 rounded-lg px-3 py-2"
                role="alert"
              >
                {functionError}
              </p>
            ) : null}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                className="admin-btn-ghost h-11 justify-center"
                onClick={() => setFunctionModalOpen(false)}
              >
                Cancelar
              </button>
              <button type="submit" className="admin-btn-primary h-11 justify-center sm:w-48">
                <span className="material-symbols-outlined text-base">
                  {editingFuncion ? 'save' : 'event_available'}
                </span>
                {editingFuncion ? 'Guardar cambios' : 'Programar función'}
              </button>
            </div>
          </form>
        ) : null}
      </Modal>

      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title={
          deleteTarget
            ? `¿Confirmás la baja de la función del ${formatFecha(deleteTarget.fecha)}?`
            : ''
        }
        description="Se liberarán las butacas no vendidas y la función saldrá de la cartelera."
        labelledBy="delete-funcion-title"
        maxWidth="max-w-xl"
      >
        <div className="rounded-lg border border-tertiary/40 bg-tertiary-container/20 p-3 text-xs text-tertiary flex items-start gap-2">
          <span className="material-symbols-outlined text-base">warning</span>
          <span>
            En el prototipo la función se elimina del estado local. No se puede recuperar.
          </span>
        </div>
        <div className="flex items-center justify-end gap-2 pt-4 mt-2 border-t border-panel-border">
          <button type="button" className="admin-btn-ghost" onClick={() => setDeleteTarget(null)}>
            Cancelar
          </button>
          <button
            type="button"
            onClick={confirmarBajaFuncion}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-danger-bg border border-danger/40 text-danger text-[11px] font-bold uppercase tracking-wider hover:bg-[#4a1d18] transition-colors"
          >
            <span className="material-symbols-outlined text-base">delete</span>
            Dar de baja
          </button>
        </div>
      </Modal>

      <Modal
        open={salaModalOpen}
        onClose={() => setSalaModalOpen(false)}
        title="Gestionar sala y aforo"
        description="Modificá la cantidad de butacas y el layout solo si la sala no tiene funciones en curso."
        labelledBy="sala-modal-title"
      >
        {salaForm ? (
          <form className="flex flex-col gap-3.5" onSubmit={guardarSala} noValidate>
            {salaLocked ? (
              <div className="rounded-lg border border-tertiary/40 bg-tertiary-container/30 p-3 text-xs text-tertiary flex items-start gap-2">
                <span className="material-symbols-outlined text-base">lock</span>
                <span>
                  La sala tiene una función en curso. No se puede modificar el layout ni la
                  cantidad de butacas hasta que finalice.
                </span>
              </div>
            ) : null}

            <div className="admin-field">
              <label className="admin-label" htmlFor="sala-nombre">
                Sala
              </label>
              <input id="sala-nombre" className="admin-input" value={salaForm.nombre} readOnly />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="admin-field">
                <label className="admin-label" htmlFor="sala-capacidad">
                  Butacas totales
                </label>
                <input
                  id="sala-capacidad"
                  className="admin-input"
                  type="number"
                  min="20"
                  max="900"
                  value={salaForm.capacidad}
                  onChange={(event) =>
                    setSalaForm((prev) => ({ ...prev, capacidad: event.target.value }))
                  }
                  disabled={salaLocked}
                />
              </div>
              <div className="admin-field">
                <label className="admin-label" htmlFor="sala-filas">
                  Filas
                </label>
                <input
                  id="sala-filas"
                  className="admin-input"
                  type="number"
                  min="2"
                  max="30"
                  value={salaForm.filas}
                  onChange={(event) =>
                    setSalaForm((prev) => ({ ...prev, filas: event.target.value }))
                  }
                  disabled={salaLocked}
                />
              </div>
              <div className="admin-field">
                <label className="admin-label" htmlFor="sala-columnas">
                  Butacas por fila
                </label>
                <input
                  id="sala-columnas"
                  className="admin-input"
                  type="number"
                  min="2"
                  max="30"
                  value={salaForm.columnas}
                  onChange={(event) =>
                    setSalaForm((prev) => ({ ...prev, columnas: event.target.value }))
                  }
                  disabled={salaLocked}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="admin-field">
                <label className="admin-label" htmlFor="sala-vip">
                  Filas VIP
                </label>
                <input
                  id="sala-vip"
                  className="admin-input"
                  type="number"
                  min="0"
                  max="10"
                  value={salaForm.vipFilas}
                  onChange={(event) =>
                    setSalaForm((prev) => ({ ...prev, vipFilas: event.target.value }))
                  }
                  disabled={salaLocked}
                />
              </div>
              <div className="admin-field">
                <label className="admin-label" htmlFor="sala-layout">
                  Layout de sala
                </label>
                <select
                  id="sala-layout"
                  className="admin-input"
                  value={salaForm.layout}
                  onChange={(event) =>
                    setSalaForm((prev) => ({ ...prev, layout: event.target.value }))
                  }
                  disabled={salaLocked}
                >
                  {LAYOUTS.map((layout) => (
                    <option key={layout}>{layout}</option>
                  ))}
                </select>
              </div>
            </div>

            {!salaLocked ? (
              <p className="text-[11px] text-on-surface-muted">
                Capacidad sugerida: {Number(salaForm.filas) * Number(salaForm.columnas)} butacas (
                {salaForm.filas} filas × {salaForm.columnas} por fila). Las butacas VIP se asignan a
                las primeras filas.
              </p>
            ) : null}

            {salaError ? (
              <p
                className="text-xs text-tertiary bg-tertiary-container/30 border border-tertiary/40 rounded-lg px-3 py-2"
                role="alert"
              >
                {salaError}
              </p>
            ) : null}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-panel-border">
              <button type="button" className="admin-btn-ghost" onClick={() => setSalaModalOpen(false)}>
                Cancelar
              </button>
              <button
                type="submit"
                className={`admin-btn-primary ${salaLocked ? 'opacity-40 cursor-not-allowed' : ''}`}
                disabled={salaLocked}
                title={salaLocked ? 'La sala tiene una función en curso' : 'Guardar sala'}
              >
                <span className="material-symbols-outlined text-base">save</span>
                Guardar sala
              </button>
            </div>
          </form>
        ) : null}
      </Modal>

      <Toast message={message} tone={tone} />
    </div>
  )
}
