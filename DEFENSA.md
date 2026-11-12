# Defensa del frontend — Multiteatro Flores

Guía corta para preparar la exposición y responder las preguntas técnicas. Todo lo que aparece
acá existe en el código; los paths son relativos a `src/`.

---

## 0. Checklist 10 minutos antes

- [ ] `npm run dev` y abrir `http://localhost:5173` (o `127.0.0.1:5173`).
- [ ] Recargar la página: el prototipo arranca sin sesión y sin usuarios (todo es en memoria).
- [ ] Tener a mano `npm run build` y `npm run lint` (ambos pasan).
- [ ] Abrir dos ventanas del navegador: cada pestaña tiene su propia memoria, así se puede mostrar
      el panel de Superadmin en una y la compra como Usuario en la otra.
- [ ] Tener esta guía y el editor abiertos en `App.jsx`, `CatalogContext.jsx`, `CheckoutPage.jsx`,
      `Modal.jsx` y `useToast.js`.

> Decir al inicio: “El catálogo, las cuentas y las compras están simulados en memoria; al recargar
> se reinician. La consigna de esta instancia no exige backend.”

---

## 1. Guion de demo (6–7 minutos)

1. **Cartelera (30 s).** Home con hero, filtros por categoría y buscador. Mostrar que la URL
   refleja el filtro (`/?categoria=teatro`, `/?buscar=...`) y que el botón “Ver toda la cartelera”
   limpia los parámetros.
2. **Detalle de obra (30 s).** Entrar a una obra: sinopsis, elenco, teatro, sala, funciones y
   precios. Como visitante, el CTA dice **“Ingresar para comprar”** y lleva al login.
3. **Restricciones del visitante (30 s).** Ir a `/compras` o `/checkout`: redirige a
   `/login?next=...`. En la home, el boletín muestra el bloque “Crear cuenta / Iniciar sesión”.
4. **Registro como Superadmin (1 min).** `/register` → completar datos → elegir rol Superadmin →
   crear cuenta. Cae en **Funciones y aforo** con las 36 funciones de las 18 salas. Filtrar por
   teatro y después por sala: las métricas (capacidad, funciones, ocupación) se recalculan.
5. **ABM (1,5 min).** Ir a **Obras y cartelera** (`/admin/obras`): crear o editar una obra en el
   modal, validar campos y guardar. Volver a funciones y **programar una función** nueva.
6. **Dueño de teatro (1 min).** Cerrar sesión → registrar un Dueño con un teatro existente. Solo ve
   las 3 salas de su teatro; `/admin/obras` lo deriva a **Acceso restringido**. Aclarar que puede
   comprar como cualquier usuario.
7. **Usuario común y compra (1,5 min).** Cerrar sesión → registrar un Usuario. Entrar a una obra,
   comprar: los 8 pasos del checkout (obra → teatro → horario → tipo de entrada → butacas →
   titular → pago → resumen), aceptar términos y confirmar. Mostrar el QR y el historial en
   `/compras`, con la compra recién hecha y sin las compras de otros usuarios.
8. **Cierre (30 s).** Mobile: achicar la ventana y mostrar menú hamburguesa, grillas y checkout
   adaptados. Mencionar accesibilidad y validaciones.

### Versión corta (3 minutos)

Home → detalle con CTA bloqueado → registro de Usuario → compra completa → historial → registro de
Dueño → panel limitado a su teatro → acceso denegado a obras.

---

## 2. Rúbrica → evidencia en el código

| Criterio | Dónde se ve |
| --- | --- |
| **1. Adecuación al negocio (15)** | Cartelera, detalle de obra, selección de teatro/sala/función, butacas numeradas, checkout, QR, historial y panel de gestión. Roles con permisos reales (Superadmin, Dueño, Usuario). |
| **2. Estructura (10)** | `pages/` vs `components/`; `components/{layout,home,checkout,ui}`; `context/`, `hooks/`, `data/`, `utils/`; `App.jsx` solo declara rutas. |
| **3. Semántica y accesibilidad (15)** | `header/nav/main/footer`, un `h1` por página, `label` + `htmlFor`, `alt` en imágenes, `aria-live` en toasts, `role="dialog"` + `aria-modal` + `aria-labelledby` en modales, cierre con `Escape`, foco inicial, `aria-describedby` en errores, `aria-pressed` en selectores. |
| **4. Diseño visual (15)** | Tema oscuro consistente, jerarquía tipográfica, estados hover/focus/disabled, chips de estado, skeletons de carga y toasts. |
| **5. Adaptabilidad (10)** | Tailwind mobile-first: grillas `sm/md/lg/xl`, menú hamburguesa, tablas/planos con scroll horizontal, checkout en una columna en mobile. |
| **6. Interacción (15)** | Filtros, buscador, menú de cuenta, modales ABM, mapa de butacas, stepper de 8 pasos, temporizador de compra, toasts, redirecciones por rol. |
| **7. Formularios y estados (10)** | `utils/validacion.js`; errores por campo; estados de carga (`LoadingScreen`), éxito (`SuccessPanel`), error (toasts) y vacío (historial, búsqueda sin resultados). |
| **8. Calidad técnica (10)** | Context + hooks, componentes reutilizables, capa de datos aislada, sin `any`/TS, lint y build limpios, nombres descriptivos y comentarios donde aportan. |

---

## 3. Preguntas probables y respuestas

### “¿Qué hooks usaron y para qué?”

| Hook | Uso concreto |
| --- | --- |
| `useState` | Paso del checkout, butacas, formularios, filtros, modales, toasts. |
| `useEffect` | Temporizador del checkout, pantalla de carga por ruta, `document.title`, scroll al cambiar de ruta, listeners de teclado/click. |
| `useMemo` | Funciones filtradas y métricas del panel; obras filtradas de la cartelera; totales del checkout. |
| `useCallback` | Acciones del `CatalogContext` (`addObra`, `addFuncion`, `addCompra`, etc.) y `showToast`. |
| `useRef` | Nodo del modal (foco), referencia al `onClose`, id del timeout del toast, contenedor del menú (click afuera). |
| `useContext` | Dentro de los hooks propios `useAuth()` y `useCatalog()`. |
| Router | `useNavigate`, `useParams`, `useSearchParams`, `useLocation`. |

**Ejemplo `useState` — checkout** (`pages/CheckoutPage.jsx`):

```jsx
const [step, setStep] = useState(1)
const [obraId, setObraId] = useState(() =>
  obras.some((obra) => obra.id === preselected) ? preselected : null,
)
const [seats, setSeats] = useState([])
const [success, setSuccess] = useState(null)
```

El estado inicial es una función cuando depende de props/contexto (evita recalcular en cada render).

**Ejemplo `useEffect` con limpieza — temporizador** (`pages/CheckoutPage.jsx`):

```jsx
useEffect(() => {
  if (success) return undefined
  const interval = window.setInterval(() => {
    setSeconds((prev) => Math.max(0, prev - 1))
  }, 1000)
  return () => window.clearInterval(interval)
}, [success])
```

Al confirmar la compra (`success`) se corta el intervalo; el `return` limpia al desmontar.

**Ejemplo `useEffect` con evento global — menú de cuenta** (`components/layout/Header.jsx`):

```jsx
useEffect(() => {
  if (!menu) return undefined
  const onPointerDown = (event) => {
    if (!actionsRef.current?.contains(event.target)) setMenu(null)
  }
  const onKeyDown = (event) => {
    if (event.key === 'Escape') setMenu(null)
  }
  document.addEventListener('mousedown', onPointerDown)
  document.addEventListener('keydown', onKeyDown)
  return () => {
    document.removeEventListener('mousedown', onPointerDown)
    document.removeEventListener('keydown', onKeyDown)
  }
}, [menu])
```

**Ejemplo `useMemo` — métricas del panel** (`pages/AdminFuncionesPage.jsx`): se filtran las
funciones por teatro/sala/obra y se calculan ocupación y recaudación solo cuando cambian las
dependencias.

**Hooks propios:**

```jsx
// hooks/useAuth.js
export default function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return context
}
```

`useCatalog`, `useToast` y `useDocumentTitle` siguen la misma idea: encapsular una lógica y
exponer una API mínima.

---

### “Mostrame props”

Las props son datos/funciones que un componente recibe del padre. Ejemplos reales:

```jsx
// components/home/ObraCard.jsx
export default function ObraCard({ obra }) { ... }
```

```jsx
// pages/HomePage.jsx
{filtradas.map((obra) => (
  <ObraCard key={obra.id} obra={obra} />
))}
```

```jsx
// components/checkout/SeatMap.jsx
export default function SeatMap({ asientos, tipo, seats, onToggle }) { ... }
```

Acá se ve el *lifting state up*: el padre (`CheckoutPage`) guarda las butacas y le pasa la lista y
la función `onToggle` al mapa; el hijo no muta nada, solo notifica.

```jsx
// components/layout/ProtectedRoute.jsx
export default function ProtectedRoute({ children, roles }) { ... }
```

```jsx
// components/ui/Modal.jsx
<Modal
  open={functionModalOpen}
  onClose={() => setFunctionModalOpen(false)}
  title={editingFuncion ? 'Editar función' : 'Programar nueva función'}
  description="La función se agrega a la grilla de la sala y queda disponible para la venta."
>
  {/* formulario */}
</Modal>
```

```jsx
// components/ui/Toast.jsx
export default function Toast({ message, tone = 'success' }) { ... }
```

`tone` tiene valor por defecto; si el padre no lo pasa, es `success`.

---

### “¿Qué es el Modal y para qué lo usás?”

`components/ui/Modal.jsx` es un componente reutilizable para los ABM y confirmaciones del panel.
Se abre con `open` y se cierra con `onClose`, ambos controlados por el padre con `useState`.
Resuelve:

- **Foco:** al abrir, enfoca el primer campo (o la tarjeta) con `useRef`.
- **Teclado:** `Escape` cierra; el listener se registra y se limpia en el `useEffect`.
- **Scroll:** bloquea el scroll del `body` mientras está abierto y lo restaura al cerrar.
- **Click afuera:** cierra si el click es sobre el fondo.
- **Accesibilidad:** `role="dialog"`, `aria-modal="true"`, `aria-labelledby` y botón de cierre con
  `aria-label`.
- **Detalle fino:** `onClose` se guarda en un ref para que el efecto no se re-ejecute en cada
  tecla del formulario. Antes eso hacía perder el foco al escribir.

Se usa en `AdminObrasPage`, `AdminFuncionesPage` (crear/editar función, configurar sala, confirmar
baja) y en el checkout para confirmaciones.

---

### “¿Qué es el Toast y cómo funciona?”

`components/ui/Toast.jsx` es la notificación no bloqueante (arriba de la pantalla) que confirma
una acción o muestra un error. La lógica vive en `hooks/useToast.js`:

```jsx
const [message, setMessage] = useState('')
const [tone, setTone] = useState('success')
const timer = useRef(null)

const showToast = useCallback((text, variant = 'success') => {
  setMessage(text)
  setTone(variant)
  if (timer.current) window.clearTimeout(timer.current)
  timer.current = window.setTimeout(() => setMessage(''), 3400)
}, [3400])
```

- `useRef` guarda el id del timeout sin provocar renders.
- `useCallback` evita recrear la función en cada render.
- `useEffect` limpia el timeout al desmontar (importante con StrictMode en React 19).
- El componente usa `role="status"` y `aria-live="polite"` para que un lector de pantalla anuncie
  el mensaje.

Se usa en el panel (guardados, bajas, errores de validación) y en el checkout (términos, pago).

---

### “¿Cómo usaron renderizado condicional?”

Tres formas, con ejemplos:

1. **Ternario** — panel según rol (`pages/AdminFuncionesPage.jsx`):

```jsx
{esSuperadmin ? (
  <Link to="/admin/obras">Obras y cartelera</Link>
) : (
  <div>Teatro asignado: {user?.teatroNombre}</div>
)}
```

2. **`&&`** — mostrar solo si hay sesión (`components/layout/Header.jsx`):

```jsx
{user ? <NavLink to="/compras">Mis compras</NavLink> : null}
```

3. **Early return** — detalle de obra inexistente (`pages/ObraDetallePage.jsx`):

```jsx
if (!obra) {
  return <div>...Esa obra no está en cartelera...</div>
}
```

4. **Lista vacía** — historial sin compras (`pages/ComprasPage.jsx`) y búsqueda sin resultados
   (`pages/HomePage.jsx`):

```jsx
{misCompras.length ? (
  <section>...listado...</section>
) : (
  <div>Todavía no realizaste ninguna compra</div>
)}
```

5. **Pasos del checkout:** se renderiza un componente distinto según `step` (1 a 8) con un `switch`
   o mapa de pasos; el `Stepper` muestra el avance.

---

### “¿Cómo usaron React Router?”

- `App.jsx` declara todas las rutas dentro de `<Routes>`, con `Layout` como ruta padre.
- `Layout` renderiza `Header`, `<Outlet />` y `Footer`: el layout no se repite en cada página.
- `ProtectedRoute` envuelve las rutas privadas:
  - sin sesión → `<Navigate to="/login?next=..." replace />`;
  - rol incorrecto → `<Navigate to="/acceso-denegado" replace state={{ roles }} />`.
- `Link`/`NavLink` para navegación SPA; `NavLink` aporta `isActive` para el estado activo.
- `useParams()` obtiene `obraId` y `compraId`.
- `useSearchParams()` maneja filtros y el `next` del login (URL compartible).
- `useNavigate()` redirige después de login, registro, logout y compra.
- `ScrollToTop` escucha `pathname`/`hash` y hace scroll al inicio o al ancla.
- Ruta `*` → `NotFoundPage`.

Rutas con permisos:

```jsx
<Route path="admin/obras" element={
  <ProtectedRoute roles={[ROLES.SUPERADMIN]}><AdminObrasPage /></ProtectedRoute>
} />
<Route path="admin/funciones" element={
  <ProtectedRoute roles={[ROLES.SUPERADMIN, ROLES.DUENO]}><AdminFuncionesPage /></ProtectedRoute>
} />
<Route path="compras" element={
  <ProtectedRoute><ComprasPage /></ProtectedRoute>
} />
```

---

### “¿Usaron fetch?”

**Respuesta honesta:** en esta entrega no, porque la consigna evalúa el frontend y permite datos
simulados. El catálogo y las compras viven en `src/data/` + `CatalogContext`, y la sesión en
`AuthContext` (memoria). Eso permite mostrar todos los flujos sin servidor.

**Cómo se integraría (si preguntan “¿y si tuvieras que conectar la API?”):**

```jsx
useEffect(() => {
  const controller = new AbortController()

  async function cargar() {
    setLoading(true)
    try {
      const res = await fetch('/api/obras', { signal: controller.signal })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setObras(data)
    } catch (error) {
      if (error.name !== 'AbortError') setError('No pudimos cargar la cartelera.')
    } finally {
      setLoading(false)
    }
  }

  cargar()
  return () => controller.abort()
}, [])
```

Puntos a mencionar: `await` + `res.ok`, manejo de error, estado de carga, `AbortController` para
cancelar si el componente se desmonta, y que el reemplazo sería **solo en `CatalogContext`**, no en
las páginas. Lo mismo aplica a `POST /compras` en `addCompra`.

Si el docente insiste con el fetch “de la clase”, se puede mostrar el mismo patrón aplicado a
`/api/obras` y aclarar que el contrato ya está modelado en `src/data/catalogo.js`.

---

### Otras preguntas frecuentes

**¿Por qué Context y no Redux?**
El catálogo y la sesión se necesitan en muchas pantallas y cambian con poca frecuencia. Context +
hooks evita prop drilling con mucho menos boilerplate; Redux sería útil con un estado mucho más
grande o time-travel.

**¿Cómo evitaron re-renders innecesarios?**
`useMemo` para listas y métricas, `useCallback` para acciones del contexto, y el `value` de cada
provider está memoizado con `useMemo`.

**¿Dónde está el estado de las butacas?**
En `CheckoutPage` (`seats`). `SeatMap` recibe `seats` y `onToggle`; al hacer click notifica al
padre, que actualiza el estado y vuelve a renderizar el mapa y el resumen.

**¿Cómo validan los formularios?**
Doble capa: al escribir se sanitiza (`quitarControlChars`, `limpiarTexto`, `formatearDni`,
`formatearTarjeta`) y al enviar se valida con `utils/validacion.js` (email, DNI, teléfono,
localidad, Luhn de tarjeta, vencimiento, CVV). Los errores se guardan por campo en un objeto y se
muestran debajo del input con `aria-describedby`.

**¿Qué pasa si recargo?**
Se pierde todo: usuarios, sesión, catálogo editado y compras. Es una decisión del prototipo para no
depender de un backend.

**¿Cómo resolvieron el responsive?**
Tailwind mobile-first: una columna en mobile, grillas en `sm/md/lg/xl`; menú hamburguesa; el plano
de butacas tiene scroll horizontal; el checkout apila resumen y formulario.

**¿Qué mejoras harían con más tiempo?**
Persistencia real, tests con Vitest/Testing Library, code splitting (el build avisa un chunk de
~513 kB), i18n y un mapa de butacas con zoom.

**¿Por qué Vite?**
Servidor de desarrollo con HMR, build rápido y configuración mínima; React no lo necesita en
producción, pero sí para desarrollar.

---

## 4. Frases de cierre

- “La app cubre el recorrido completo: descubrir una obra, elegir función y butaca, pagar y
  recibir la entrada, más un panel de gestión con permisos por rol.”
- “El código está separado en páginas, componentes, contextos, hooks y datos; cambiar la fuente de
  datos no obliga a tocar las pantallas.”
- “Todo el estado es simulada y se reinicia al recargar, tal como permite la consigna.”

---

## 5. Mapa rápido de archivos

| Tema | Archivo |
| --- | --- |
| Rutas y permisos | `src/App.jsx`, `components/layout/ProtectedRoute.jsx` |
| Sesión y roles | `context/AuthContext.jsx`, `context/auth-context.js` |
| Catálogo y compras | `context/CatalogContext.jsx`, `data/catalogo.js`, `data/compras.js` |
| Checkout | `pages/CheckoutPage.jsx`, `components/checkout/**` |
| ABM de obras | `pages/AdminObrasPage.jsx` |
| Funciones y aforo | `pages/AdminFuncionesPage.jsx` |
| Modal / Toast / Carga | `components/ui/{Modal,Toast,LoadingScreen}.jsx`, `hooks/useToast.js` |
| Validaciones | `utils/validacion.js` |
| Registro y login | `pages/RegisterPage.jsx`, `pages/LoginPage.jsx` |
| Historial | `pages/ComprasPage.jsx`, `pages/CompraDetallePage.jsx` |
