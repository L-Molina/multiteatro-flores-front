# Multiteatro Flores — Frontend

SPA de venta de entradas y gestión de cartelera para teatros independientes de la Ciudad de
Buenos Aires. Reúne obras, teatros, salas, funciones numeradas y un checkout de 8 pasos, más un
panel de administración con permisos por rol.

> **Alcance del TP:** esta entrega es solo frontend. No hay llamadas al backend ni persistencia
> real: el catálogo, los usuarios y las compras viven en memoria y se reinician al recargar. La
> rúbrica de la materia no exige integración full stack en esta instancia.

## Stack

- React 19 + Vite 8
- React Router 7 (`react-router-dom`)
- Tailwind CSS 3 (tema oscuro, breakpoints propios en `tailwind.config.js`)
- Oxlint para análisis estático

## Puesta en marcha

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # build de producción en dist/
npm run lint     # análisis estático
npm run preview  # sirve el build
```

Requiere Node.js 20 o superior.

## Cómo probar los roles
Las cuentas se crean desde **Crear cuenta** (`/register`) y se pierden al recargar la página.

| Rol | Puede hacer | No puede hacer |
| --- | --- | --- |
| **Usuario común** | Comprar entradas, suscribirse al boletín, ver su historial | Entrar al panel de gestión |
| **Dueño de teatro** | Gestionar funciones y aforo de las salas de su teatro; comprar en cualquier sala | Gestionar obras, ni salas de otros teatros |
| **Superadmin** | Ver y gestionar todas las obras, funciones y salas de todos los teatros | — |

Al registrarse, el Dueño elige un teatro existente o crea uno nuevo. Un teatro nuevo se crea con
3 salas de 25 butacas (`5 × 5`, fila A VIP) listas para programar funciones.

Rutas posteriores al registro:

- Superadmin y Dueño → `/admin/funciones`
- Usuario común → `/compras`

## Rutas

| Ruta | Página | Acceso |
| --- | --- | --- |
| `/` | Cartelera con hero, filtros y buscador | Público |
| `/obras/:obraId` | Detalle de obra y funciones | Público |
| `/login` | Inicio de sesión | Público |
| `/register` | Registro con selección de rol | Público |
| `/checkout` | Compra en 8 pasos | Sesión iniciada |
| `/compras` | Historial de compras del usuario | Sesión iniciada |
| `/compras/:compraId` | Detalle de compra con QR | Sesión iniciada (dueño de la compra) |
| `/admin/obras` | ABM de obras | Superadmin |
| `/admin/funciones` | Funciones, aforo y mapa de butacas | Superadmin y Dueño |
| `/acceso-denegado` | Pantalla de permisos insuficientes | Público |
| `/quienes-somos`, `/preguntas-frecuentes`, `/contacto`, `/privacidad` | Institucionales | Público |
| `*` | 404 | Público |

## Estructura

```
src/
├── components/
│   ├── checkout/          Stepper, SummaryPanel, SuccessPanel, SeatMap, QrCanvas
│   │   └── steps/         Un componente por paso del checkout (Obra, Teatro, ...)
│   ├── home/              ObraCard, TrendCarousel, AboutSection
│   ├── layout/            Header, Footer, Layout, ProtectedRoute, ScrollToTop
│   └── ui/                Modal, Toast, LoadingScreen
├── context/
│   ├── AuthContext.jsx    Usuarios, sesión y permisos (en memoria)
│   ├── CatalogContext.jsx Obras, teatros, salas, funciones y compras
│   ├── auth-context.js    Constantes de roles y objeto de contexto
│   └── catalog-context.js Objeto de contexto del catálogo
├── data/
│   ├── catalogo.js        10 obras, 6 teatros, 18 salas y 36 funciones de ejemplo
│   └── compras.js         2 compras demo
├── hooks/                 useAuth, useCatalog, useToast, useDocumentTitle
├── pages/                 Una página por ruta
├── utils/validacion.js    Sanitización y validaciones (email, DNI, tarjeta, etc.)
├── App.jsx                Definición de rutas
├── main.jsx               Providers + BrowserRouter
└── index.css              Tokens visuales y utilidades del tema
```

## Decisiones de arquitectura

- **Estado global con Context + hooks.** `CatalogContext` es la única fuente de verdad del
  catálogo y las compras; `AuthContext` maneja la sesión y los permisos. Los componentes consumen
  `useCatalog()` y `useAuth()` en lugar de recibir props por todo el árbol.
- **Estado local para formularios y pasos.** El checkout mantiene en `useState` el paso actual,
  la obra, la función, las butacas y los datos del titular. `SeatMap` recibe esos datos por props
  y devuelve la selección con `onToggle` (*lifting state up*).
- **Capa de datos aislada.** `src/data/` y `CatalogContext` concentran los datos simulados; migrar
  a una API real implica reemplazar esa capa, no las páginas.
- **Rutas protegidas por sesión y rol.** `ProtectedRoute` recibe `roles` y redirige al login
  (guardando el destino) o a `/acceso-denegado`.
- **Validación centralizada.** `utils/validacion.js` sanitiza entrada y valida email, DNI,
  teléfono, tarjeta (Luhn), vencimiento y CVV. Los errores se muestran por campo y se vinculan con
  `aria-describedby`.
- **Accesibilidad.** HTML semántico, un `h1` por página, labels asociados, `alt` en imágenes,
  `aria-live` en toasts, `role="dialog"` + `aria-modal` en modales, cierre con `Escape`, foco
  inicial y navegación por teclado.
- **Estados de espera.** `Layout` muestra `LoadingScreen` en cada cambio de ruta (900 ms en
  `/admin/*`, 480 ms en el resto) y el checkout tiene su propio temporizador de sesión.

## Datos simulados

- 10 obras publicadas, 6 teatros y 18 salas (todas se llaman "Sala 1/2/3", por eso la gestión
  muestra siempre el teatro como contexto).
- 36 funciones con fechas relativas a hoy, para que la temporada siempre quede futura.
- Las compras nuevas se asocian al email de la cuenta y cada usuario ve solo su historial.
- Todo el estado se reinicia al recargar: es una decisión del prototipo, no un bug.
