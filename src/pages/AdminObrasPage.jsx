import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useCatalog from '../hooks/useCatalog'
import Modal from '../components/ui/Modal'
import Toast from '../components/ui/Toast'
import useToast from '../hooks/useToast'
import useDocumentTitle from '../hooks/useDocumentTitle'
import { GENEROS } from '../data/catalogo'
import { MAX, enteroEnRango, limpiarMultilinea, limpiarTexto } from '../utils/validacion'

const EMPTY_FORM = {
  titulo: '',
  elenco: '',
  genero: 'Teatro • Comedia',
  salaId: 1,
  precio: 30000,
  vip: 39000,
  duracion: 90,
  schedule: 'Función a confirmar',
  sinopsis: '',
  img: '',
  afiche: '',
  publicada: true,
  preventa: true,
}

function estadoObra(obra) {
  if (!obra.publicada) return { label: 'Pausada', className: 'bg-tertiary-container text-tertiary' }
  if (!obra.preventa) {
    return {
      label: 'Sin preventa',
      className: 'bg-surface-dark border border-panel-border text-on-surface-muted',
    }
  }
  return { label: 'En cartelera', className: 'bg-primary-container text-primary border border-primary/30' }
}

export default function AdminObrasPage() {
  useDocumentTitle('Gestión de Obras')
  const {
    obras,
    salas,
    funciones,
    getSala,
    asientos,
    addObra,
    updateObra,
    deleteObra,
    formatARS,
  } = useCatalog()
  const navigate = useNavigate()
  const { message, tone, showToast } = useToast()

  const [search, setSearch] = useState('')
  const [genero, setGenero] = useState('')
  const [salaFiltro, setSalaFiltro] = useState('')
  const [estadoFiltro, setEstadoFiltro] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState('')
  const [imageError, setImageError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [selectedId, setSelectedId] = useState(null)
  const [nowIso] = useState(() => new Date().toISOString().slice(0, 16))

  const salaDeObra = (obra) => getSala(obra.salaId) || getSala(funciones.find((f) => f.obraId === obra.id)?.salaId)

  const calcularOcupacion = (obra) => {
    const propias = funciones.filter((funcion) => funcion.obraId === obra.id)
    if (!propias.length) return { porcentaje: 0, vendidas: 0, total: 0 }
    let total = 0
    let vendidas = 0
    propias.forEach((funcion) => {
      const mapa = asientos(funcion.id)
      total += mapa.length
      vendidas += mapa.filter((asiento) => asiento.estado === 'ocupado').length
    })
    return {
      porcentaje: total ? Math.round((vendidas / total) * 100) : 0,
      vendidas,
      total,
    }
  }

  const filtradas = obras.filter((obra) => {
    const term = search.trim().toLowerCase()
    const matchTerm =
      !term ||
      `${obra.titulo} ${obra.elenco} ${obra.sinopsis} ${obra.genero}`
        .toLowerCase()
        .includes(term)
    const matchGenero =
      !genero ||
      (genero === 'comedia'
        ? obra.genero.toLowerCase().includes('comedia')
        : obra.categoria === genero)
    const sala = salaDeObra(obra)
    const matchSala = !salaFiltro || String(sala?.id) === String(salaFiltro)
    const matchEstado =
      !estadoFiltro || (estadoFiltro === 'publicadas' ? obra.publicada : !obra.publicada)
    return matchTerm && matchGenero && matchSala && matchEstado
  })

  const obrasActivas = obras.filter((obra) => obra.publicada).length
  const funcionesFuturas = funciones.filter(
    (funcion) => `${funcion.fecha}T${funcion.hora}` >= nowIso,
  ).length
  const butacasEnVenta = salas.reduce((acc, sala) => acc + sala.capacidad, 0)

  const abrirNueva = () => {
    setEditing(null)
    setForm({ ...EMPTY_FORM, salaId: salas[0]?.id || 1 })
    setFormError('')
    setImageError('')
    setModalOpen(true)
  }

  const abrirEdicion = (obra) => {
    setEditing(obra)
    setForm({
      titulo: obra.titulo,
      elenco: obra.elenco,
      genero: obra.genero,
      salaId: obra.salaId || salas[0]?.id || 1,
      precio: obra.precio,
      vip: obra.vip,
      duracion: obra.duracion,
      schedule: obra.schedule || 'Función a confirmar',
      sinopsis: obra.sinopsis,
      img: obra.img || obra.afiche || '',
      afiche: obra.afiche || obra.img || '',
      publicada: obra.publicada !== false,
      preventa: obra.preventa !== false,
    })
    setFormError('')
    setImageError('')
    setModalOpen(true)
  }

  const seleccionarImagen = (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setImageError('El archivo debe ser una imagen (JPG, PNG, WEBP o SVG).')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setImageError('La imagen no puede superar los 2 MB.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : ''
      if (!dataUrl) {
        setImageError('No pudimos leer la imagen. Probá con otro archivo.')
        return
      }
      setImageError('')
      setForm((prev) => ({ ...prev, img: dataUrl, afiche: dataUrl }))
    }
    reader.onerror = () => {
      setImageError('No pudimos leer la imagen. Probá con otro archivo.')
    }
    reader.readAsDataURL(file)
  }

  const guardar = (event) => {
    event.preventDefault()
    const titulo = limpiarTexto(form.titulo, MAX.titulo).trim()
    if (!titulo) {
      setFormError('Ingresá el título de la obra.')
      return
    }
    if (titulo.length < 3) {
      setFormError('El título debe tener al menos 3 caracteres.')
      return
    }
    if (!enteroEnRango(form.precio, 0, 10000000) || !enteroEnRango(form.vip, 0, 10000000)) {
      setFormError('Las tarifas deben ser números enteros entre 0 y 10.000.000.')
      return
    }
    if (!enteroEnRango(form.duracion, 30, 600)) {
      setFormError('La duración debe ser un número entero entre 30 y 600 minutos.')
      return
    }
    const payload = {
      ...form,
      titulo,
      elenco: limpiarTexto(form.elenco, MAX.elenco).trim() || 'Compañía independiente',
      sinopsis:
        limpiarMultilinea(form.sinopsis, MAX.sinopsis).trim() || 'Sinopsis a confirmar.',
      schedule: limpiarTexto(form.schedule, MAX.schedule).trim() || 'Función a confirmar',
      salaId: Number(form.salaId),
    }
    if (!payload.img) {
      delete payload.img
      delete payload.afiche
    }
    if (editing) {
      updateObra(editing.id, payload)
      showToast(`Obra "${payload.titulo}" actualizada correctamente.`)
    } else {
      addObra(payload)
      showToast(`Obra "${payload.titulo}" creada y publicada en cartelera.`)
    }
    setModalOpen(false)
    setEditing(null)
  }

  const confirmarBaja = () => {
    if (!deleteTarget) return
    const titulo = deleteTarget.titulo
    deleteObra(deleteTarget.id)
    setDeleteTarget(null)
    setSelectedId(null)
    showToast(`La obra "${titulo}" fue dada de baja. Se cancelaron sus funciones futuras.`)
  }

  const exportar = () => {
    const rows = filtradas.map((obra) => {
      const sala = salaDeObra(obra)
      return [
        obra.titulo,
        obra.genero,
        sala ? `${sala.teatro} - ${sala.nombre}` : 'Sin sala',
        `${obra.precio};${obra.vip}`,
        obra.publicada ? 'Publicada' : 'Pausada',
      ].join(';')
    })
    const csv = ['Obra;Género;Sala;Platea;VIP;Estado', ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'cartelera-multiteatro.csv'
    link.click()
    URL.revokeObjectURL(url)
    showToast('Informe de cartelera exportado en CSV.')
  }

  const limpiarFiltros = () => {
    setSearch('')
    setGenero('')
    setSalaFiltro('')
    setEstadoFiltro('')
  }

  return (
    <div className="w-full px-4 md:px-8 py-8 flex flex-col gap-8 max-w-[1536px] mx-auto">
      <section className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider text-on-surface-muted">
            <span className="text-secondary">Multiteatro Flores</span>
            <span>/</span>
            <span>Panel Administrativo</span>
            <span>/</span>
            <span className="text-on-surface">Gestión de Cartelera &amp; Espectáculos</span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-2 border-b border-panel-border/60">
          <div className="flex flex-col gap-1.5 max-w-3xl">
            <h1 className="text-2xl md:text-3xl font-bold text-on-surface tracking-tight">
              Gestión de Cartelera &amp; Espectáculos
            </h1>
            <p className="text-sm text-on-surface-muted leading-relaxed">
              Administración centralizada del catálogo teatral, salas asignadas, precios de
              plateas, aforos y programación semanal en la Ciudad de Buenos Aires.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <Link
                to="/admin/obras"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-container border border-primary/30 text-primary text-xs font-bold"
              >
                <span className="material-symbols-outlined text-base">edit_note</span>
                Obras y cartelera
              </Link>
              <Link
                to="/admin/funciones"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-card border border-panel-border text-on-surface-muted hover:text-secondary text-xs font-semibold transition-colors"
              >
                <span className="material-symbols-outlined text-base">event_seat</span>
                Funciones y aforo
              </Link>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={exportar}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-surface-card border border-panel-border hover:bg-surface-elevated text-on-surface text-xs font-semibold tracking-wide transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-[1.2rem] text-secondary">
                file_download
              </span>
              <span>Exportar Reporte</span>
            </button>
            <button
              type="button"
              onClick={abrirNueva}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-secondary hover:bg-secondary-hover text-[#071510] text-xs font-bold uppercase tracking-wider transition-all shadow-md"
            >
              <span className="material-symbols-outlined text-[1.25rem]">add_circle</span>
              <span>Nueva Obra / Espectáculo</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            ['Obras Activas', obrasActivas, `${obras.length - obrasActivas} pausadas`, 'theater_comedy', 'text-secondary'],
            ['Funciones Programadas', funcionesFuturas, `${funciones.length} en total`, 'calendar_today', 'text-primary'],
            ['Butacas en Venta', butacasEnVenta.toLocaleString('es-AR'), `${salas.length} salas conectadas`, 'event_seat', 'text-secondary'],
            ['Recaudación Estimada', '$28.450.000', '+18.4% vs mes anterior', 'payments', 'text-primary'],
          ].map(([label, value, detail, icon, color]) => (
            <div key={label} className="flex flex-col p-5 rounded-xl bg-surface-card border border-panel-border shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-on-surface-muted uppercase tracking-wider">
                  {label}
                </span>
                <span className="p-2 rounded-lg bg-surface-elevated border border-panel-border">
                  <span className={`material-symbols-outlined text-[1.25rem] ${color}`}>{icon}</span>
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-on-surface">{value}</span>
              </div>
              <p className="mt-1 text-xs text-on-surface-muted">{detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-4 rounded-xl bg-surface-card border border-panel-border shadow-sm">
        <div className="relative flex-1 min-w-[240px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-muted text-[1.2rem]">
            search
          </span>
          <input
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-surface-dark border border-panel-border text-xs text-on-surface placeholder:text-on-surface-muted/60 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
            placeholder="Buscar por título de obra, autor, director o elenco..."
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Buscar obras"
          />
        </div>
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
          <select
            value={genero}
            onChange={(event) => setGenero(event.target.value)}
            className="select-arrow w-full sm:w-44 px-3.5 py-2.5 rounded-lg bg-surface-dark border border-panel-border text-xs text-on-surface focus:outline-none focus:border-secondary cursor-pointer"
            aria-label="Filtrar por género"
          >
            <option value="">Género: Todos</option>
            <option value="teatro">Teatro Clásico / Drama</option>
            <option value="standup">Ciclo Stand-Up</option>
            <option value="conciertos">Concierto / Música</option>
            <option value="comedia">Comedia</option>
          </select>
          <select
            value={salaFiltro}
            onChange={(event) => setSalaFiltro(event.target.value)}
            className="select-arrow w-full sm:w-48 px-3.5 py-2.5 rounded-lg bg-surface-dark border border-panel-border text-xs text-on-surface focus:outline-none focus:border-secondary cursor-pointer"
            aria-label="Filtrar por sala"
          >
            <option value="">Sala: Todas las Salas</option>
            {salas.map((sala) => (
              <option key={sala.id} value={sala.id}>
                {sala.teatro} — {sala.nombre} ({sala.capacidad})
              </option>
            ))}
          </select>
          <select
            value={estadoFiltro}
            onChange={(event) => setEstadoFiltro(event.target.value)}
            className="select-arrow w-full sm:w-40 px-3.5 py-2.5 rounded-lg bg-surface-dark border border-panel-border text-xs text-on-surface focus:outline-none focus:border-secondary cursor-pointer"
            aria-label="Filtrar por estado"
          >
            <option value="">Estado: Todos</option>
            <option value="publicadas">Publicadas</option>
            <option value="pausadas">Pausadas</option>
          </select>
          <button
            type="button"
            onClick={limpiarFiltros}
            className="p-2.5 rounded-lg bg-surface-dark border border-panel-border hover:bg-surface-elevated text-on-surface-muted hover:text-secondary transition-colors shrink-0"
            title="Restablecer filtros"
            aria-label="Restablecer filtros"
          >
            <span className="material-symbols-outlined text-[1.25rem]">filter_alt_off</span>
          </button>
        </div>
      </section>

      <section className="flex flex-col gap-4 w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-bold text-on-surface">Programación de Obras</h2>            
          </div>
        </div>

        <div className="w-full overflow-x-auto rounded-xl bg-surface-card border border-panel-border shadow-lg">
          <table className="w-full text-left border-collapse min-w-[820px]">
            <thead>
              <tr className="bg-surface-dark/80 border-b border-panel-border text-on-surface-muted text-[0.7rem] uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Espectáculo &amp; Dirección</th>
                <th className="py-3 px-3">Género</th>
                <th className="py-3 px-3">Sala / Aforo</th>
                <th className="py-3 px-3">Tarifas</th>
                <th className="py-3 px-3">Ocupación</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-panel-border/60 text-xs">
              {filtradas.map((obra) => {
                const sala = salaDeObra(obra)
                const ocupacion = calcularOcupacion(obra)
                const estado = estadoObra(obra)
                const selected = selectedId === obra.id
                return (
                  <tr
                    key={obra.id}
                    onClick={() => setSelectedId(obra.id)}
                    className={`transition-colors cursor-pointer ${
                      selected ? 'is-selected-row bg-primary-container/30' : 'hover:bg-surface-elevated/40'
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          className="w-12 h-16 object-cover rounded border border-panel-border shadow shrink-0"
                          src={obra.afiche || obra.img}
                          alt={`Afiche de ${obra.titulo}`}
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm text-on-surface font-semibold truncate">
                            {obra.titulo}
                          </span>
                          <span className="text-xs text-on-surface-muted truncate">
                            {obra.elenco}
                          </span>
                          <span className="text-[0.7rem] text-secondary font-medium mt-0.5">
                            {obra.schedule}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="inline-flex whitespace-nowrap px-2 py-0.5 rounded bg-surface-dark border border-panel-border text-secondary text-[0.7rem] uppercase tracking-wider font-semibold">
                          {obra.genero}
                        </span>
                        <span
                          className={`inline-flex whitespace-nowrap px-2 py-0.5 rounded text-[0.65rem] uppercase font-bold ${estado.className}`}
                        >
                          {estado.label}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="flex flex-col">
                        <span className="text-on-surface font-medium">{sala?.nombre || 'Sin sala'}</span>
                        <span className="text-[0.7rem] text-on-surface-muted">
                          {sala ? `${sala.capacidad} butacas` : 'Aforo a confirmar'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="flex flex-col">
                        <span className="text-on-surface font-semibold">
                          {formatARS(obra.precio)} - {formatARS(obra.vip)}
                        </span>
                        <span className="text-[0.7rem] text-on-surface-muted">ARS • Platea / VIP</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="flex flex-col gap-1 w-28">
                        <div className="flex justify-between text-[0.75rem]">
                          <span className="text-primary font-bold">{ocupacion.porcentaje}%</span>
                          <span className="text-on-surface-muted">
                            {ocupacion.vendidas}/{ocupacion.total}
                          </span>
                        </div>
                        <div className="w-full bg-surface-dark rounded-full h-1.5 overflow-hidden border border-panel-border/40">
                          <div
                            className="bg-primary h-full rounded-full"
                            style={{ width: `${ocupacion.porcentaje}%` }}
                          />
                        </div>
                        <span className="text-[0.7rem] text-secondary font-medium">
                          {ocupacion.total ? 'Butacas ocupadas' : 'Sin funciones'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            abrirEdicion(obra)
                          }}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-surface-dark border border-panel-border hover:bg-secondary hover:text-[#071510] text-on-surface-muted transition-colors leading-none"
                          title="Editar espectáculo"
                          aria-label={`Editar ${obra.titulo}`}
                        >
                          <span className="material-symbols-outlined text-[1.15rem] leading-none">edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            navigate(`/admin/funciones?obra=${obra.id}`)
                          }}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-surface-dark border border-panel-border hover:bg-surface-elevated text-on-surface transition-colors leading-none"
                          title="Ver funciones y plateas"
                          aria-label={`Ver funciones de ${obra.titulo}`}
                        >
                          <span className="material-symbols-outlined text-[1.15rem] leading-none">visibility</span>
                        </button>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            setDeleteTarget(obra)
                          }}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-surface-dark border border-panel-border hover:bg-danger-bg text-on-surface-muted hover:text-danger transition-colors leading-none"
                          title="Dar de baja"
                          aria-label={`Dar de baja ${obra.titulo}`}
                        >
                          <span className="material-symbols-outlined text-[1.15rem] leading-none">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {!filtradas.length ? (
                <tr>
                  <td colSpan={6} className="py-10 px-4 text-center text-on-surface-muted text-sm">
                    No hay obras que coincidan con los filtros seleccionados.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Editar obra' : 'Nueva obra'}
        description="Completá los datos de la obra y su publicación en cartelera."
        labelledBy="obra-modal-title"
      >
        <form className="flex flex-col gap-3.5" onSubmit={guardar} noValidate>
          <div className="flex flex-col sm:flex-row gap-4 rounded-lg border border-panel-border bg-surface-dark p-3">
            <div className="w-20 h-24 shrink-0 rounded-lg overflow-hidden border border-panel-border bg-surface-card flex items-center justify-center">
              {form.img || form.afiche ? (
                <img
                  className="w-full h-full object-cover"
                  src={form.img || form.afiche}
                  alt="Previsualización del afiche"
                />
              ) : (
                <span className="material-symbols-outlined text-2xl text-on-surface-muted">
                  image
                </span>
              )}
            </div>
            <div className="flex flex-col gap-2 min-w-0">
              <span className="admin-label">Imagen / afiche de la obra</span>
              <div className="flex flex-wrap items-center gap-2">
                <label
                  htmlFor="obra-imagen"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-secondary hover:bg-secondary-hover text-[#071510] text-[11px] font-extrabold uppercase tracking-wider cursor-pointer transition-colors"
                >
                  <span className="material-symbols-outlined text-base">upload</span>
                  {form.img ? 'Cambiar imagen' : 'Subir imagen'}
                </label>
                <input
                  id="obra-imagen"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={seleccionarImagen}
                />
              </div>
              <p className="text-[11px] text-on-surface-muted leading-relaxed">
                JPG, PNG, WEBP o SVG de hasta 2 MB. La vista previa se actualiza al instante y la
                imagen se guarda junto con la obra.
              </p>
              {imageError ? (
                <p className="text-[11px] text-tertiary" role="alert">
                  {imageError}
                </p>
              ) : null}
            </div>
          </div>
          <div className="admin-field">
            <label className="admin-label" htmlFor="obra-titulo">
              Título de la obra *
            </label>
            <input
              id="obra-titulo"
              className="admin-input"
              maxLength={MAX.titulo}
              value={form.titulo}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, titulo: limpiarTexto(event.target.value, MAX.titulo) }))
              }
              autoFocus
            />
          </div>
          <div className="admin-field">
            <label className="admin-label" htmlFor="obra-elenco">
              Autoría / dirección / compañía
            </label>
            <input
              id="obra-elenco"
              className="admin-input"
              maxLength={MAX.elenco}
              value={form.elenco}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, elenco: limpiarTexto(event.target.value, MAX.elenco) }))
              }
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="admin-field">
              <label className="admin-label" htmlFor="obra-genero">
                Género
              </label>
              <select
                id="obra-genero"
                className="admin-input"
                value={form.genero}
                onChange={(event) => setForm((prev) => ({ ...prev, genero: event.target.value }))}
              >
                {GENEROS.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </div>
            <div className="admin-field">
              <label className="admin-label" htmlFor="obra-sala">
                Sala asignada
              </label>
              <select
                id="obra-sala"
                className="admin-input"
                value={form.salaId}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, salaId: event.target.value }))
                }
              >
                {salas.map((sala) => (
                  <option key={sala.id} value={sala.id}>
                    {sala.teatro} — {sala.nombre} ({sala.capacidad})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="admin-field">
              <label className="admin-label" htmlFor="obra-precio">
                Platea ($ ARS)
              </label>
              <input
                id="obra-precio"
                className="admin-input"
                type="number"
                min="0"
                max="10000000"
                step="100"
                value={form.precio}
                onChange={(event) => setForm((prev) => ({ ...prev, precio: event.target.value }))}
              />
            </div>
            <div className="admin-field">
              <label className="admin-label" htmlFor="obra-vip">
                VIP ($ ARS)
              </label>
              <input
                id="obra-vip"
                className="admin-input"
                type="number"
                min="0"
                max="10000000"
                step="100"
                value={form.vip}
                onChange={(event) => setForm((prev) => ({ ...prev, vip: event.target.value }))}
              />
            </div>
            <div className="admin-field">
              <label className="admin-label" htmlFor="obra-duracion">
                Duración (min)
              </label>
              <input
                id="obra-duracion"
                className="admin-input"
                type="number"
                min="30"
                max="600"
                step="5"
                value={form.duracion}
                onChange={(event) => setForm((prev) => ({ ...prev, duracion: event.target.value }))}
              />
            </div>
          </div>
          <div className="admin-field">
            <label className="admin-label" htmlFor="obra-schedule">
              Días y horarios
            </label>
            <input
              id="obra-schedule"
              className="admin-input"
              maxLength={MAX.schedule}
              value={form.schedule}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  schedule: limpiarTexto(event.target.value, MAX.schedule),
                }))
              }
              placeholder="Ej.: Vie &amp; Sáb 21:00 hs"
            />
          </div>
          <div className="admin-field">
            <label className="admin-label" htmlFor="obra-sinopsis">
              Sinopsis
            </label>
            <textarea
              id="obra-sinopsis"
              rows={3}
              maxLength={MAX.sinopsis}
              className="admin-input resize-none"
              value={form.sinopsis}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  sinopsis: limpiarMultilinea(event.target.value, MAX.sinopsis),
                }))
              }
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="flex items-center justify-between gap-2 rounded-lg border border-panel-border bg-surface-dark p-3 text-xs cursor-pointer">
              <span>Publicar en cartelera</span>
              <input
                type="checkbox"
                className="accent-[#efbf69]"
                checked={form.publicada}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, publicada: event.target.checked }))
                }
              />
            </label>
            <label className="flex items-center justify-between gap-2 rounded-lg border border-panel-border bg-surface-dark p-3 text-xs cursor-pointer">
              <span>Habilitar preventa</span>
              <input
                type="checkbox"
                className="accent-[#efbf69]"
                checked={form.preventa}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, preventa: event.target.checked }))
                }
              />
            </label>
          </div>
          {formError ? (
            <p className="text-xs text-tertiary bg-tertiary-container/30 border border-tertiary/40 rounded-lg px-3 py-2" role="alert">
              {formError}
            </p>
          ) : null}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-panel-border">
            <button type="button" className="admin-btn-ghost" onClick={() => setModalOpen(false)}>
              Cancelar
            </button>
            <button type="submit" className="admin-btn-primary">
              <span className="material-symbols-outlined text-base">save</span>
              Guardar obra
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title={deleteTarget ? `¿Confirmás la baja de "${deleteTarget.titulo}"?` : ''}
        description="Esta acción retirará la obra de la cartelera pública y cancelará las funciones futuras programadas."
        labelledBy="delete-obra-title"
        maxWidth="max-w-xl"
      >
        <div className="rounded-lg border border-tertiary/40 bg-tertiary-container/20 p-3 text-xs text-tertiary flex items-start gap-2">
          <span className="material-symbols-outlined text-base">warning</span>
          <span>
            En el prototipo la obra y sus funciones se eliminan del estado local. No se pueden
            recuperar.
          </span>
        </div>
        <div className="flex items-center justify-end gap-2 pt-4 mt-2 border-t border-panel-border">
          <button type="button" className="admin-btn-ghost" onClick={() => setDeleteTarget(null)}>
            Cancelar
          </button>
          <button
            type="button"
            onClick={confirmarBaja}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-danger-bg border border-danger/40 text-danger text-[11px] font-bold uppercase tracking-wider hover:bg-[#4a1d18] transition-colors"
          >
            <span className="material-symbols-outlined text-base">delete</span>
            Dar de baja
          </button>
        </div>
      </Modal>

      <Toast message={message} tone={tone} />
    </div>
  )
}
