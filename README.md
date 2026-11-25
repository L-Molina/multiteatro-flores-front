# Multiteatro Flores — Frontend

SPA de venta de entradas y gestión de cartelera para teatros independientes de la Ciudad de
Buenos Aires. Reúne obras, teatros, salas, funciones numeradas y un checkout de 8 pasos, más un
panel de administración con permisos por rol.

El frontend consume la API REST del backend Spring Boot ubicado en el repositorio
`multiteatro`. El catálogo, las funciones, las butacas, las compras y las entradas se persisten
en la base MySQL `multiteatro_db`.

## Alcance de la integración

- **Persistido en el backend:** usuarios, obras, teatros, salas, butacas, funciones, compras y
  entradas. El historial de compras se reconstruye desde `/api/compras` y `/api/entradas`.
- **En memoria del backend:** la coordinación de butacas entre sesiones (`/api/ocupacion`) y la
  bandeja de novedades (`/api/notificaciones`). Se reinician al reiniciar Spring.
- **Solo en el frontend:** imagen, elenco, género comercial y flags de publicación se completan
  desde `src/data/catalogo.js` porque la base no los modela. El DNI, teléfono, localidad del
  titular y el comprobante de transferencia se guardan en memoria para mostrarlos en esta sesión.
- **Pago simulado:** los datos de tarjeta no se envían al servidor. El total que se muestra y se
  registra es la suma del precio de cada butaca, sin costo de servicio ni descuentos.

## Stack

- React 19 + Vite 8
- React Router 7 (`react-router-dom`)
- Tailwind CSS 3 (tema oscuro, breakpoints propios en `tailwind.config.js`)
- Oxlint para análisis estático

## Puesta en marcha

1. Iniciar MySQL y el backend Spring Boot (puerto `8080`):

   ```bash
   cd ../multiteatro
   ./mvnw spring-boot:run
   ```

2. Iniciar el frontend:

   ```bash
   npm install
   npm run dev      # http://localhost:5173
   npm run build    # build de producción en dist/
   npm run lint     # análisis estático
   npm run preview  # sirve el build
   ```

Requiere Node.js 20 o superior. La URL del backend se toma de `VITE_API_URL` y por defecto es
`http://localhost:8080/api`; hay un `.env.example` como referencia. El backend habilita CORS para
`localhost:5173` (y otros puertos de desarrollo).

## Cuentas semilla

| Rol | Email | Contraseña |
| --- | --- | --- |
| Superadmin | `superadmin@multiteatroflores.com` | `superadmin123` |
| Dueño de teatro | `claudia@noblesbestias.com` | `admin123` |
| Usuario común | `usuario1@example.com` | `cliente123` |

El registro público (`/register`) siempre crea una cuenta **CLIENTE**. Las cuentas de gestión se
cargan desde la base de datos. La sesión se guarda en memoria: al recargar la página hay que
volver a iniciar sesión.

## Roles

| Rol | Puede hacer | No puede hacer |
| --- | --- | --- |
| **Usuario común** | Comprar entradas, ver su historial y sus códigos QR | Entrar al panel de gestión |
| **Dueño de teatro** | Gestionar funciones y aforo de las salas de su teatro | Gestionar obras ni salas de otros teatros |
| **Superadmin** | Gestionar todas las obras, funciones y salas de todos los teatros | — |

Rutas posteriores al login:

- Superadmin y Dueño → `/admin/funciones`
- Usuario común → `/` (o el destino guardado en `?next=`)

## Rutas

| Ruta | Página | Acceso |
| --- | --- | --- |
| `/` | Cartelera con hero, filtros y buscador | Público |
| `/obras/:obraId` | Detalle de obra y funciones | Público |
| `/login` | Inicio de sesión | Público |
| `/register` | Registro público (solo usuario común) | Público |
| `/checkout` | Compra en 8 pasos | Sesión iniciada |
| `/compras` | Historial de compras del usuario | Sesión iniciada |
| `/compras/:compraId` | Detalle de compra con un QR por entrada | Sesión iniciada |
| `/admin/obras` | ABM de obras | Superadmin |
| `/admin/funciones` | Funciones, aforo y mapa de butacas | Superadmin y Dueño |
| `/acceso-denegado` | Pantalla de permisos insuficientes | Público |
| `/quienes-somos`, `/preguntas-frecuentes`, `/contacto`, `/privacidad` | Institucionales | Público |
| `*` | 404 | Público |

## Estructura

```
src/
├── api/
│   ├── client.js          Cliente HTTP, token Bearer y errores de la API
│   └── mappers.js         Traducción backend ↔ modelo de las pantallas
├── components/
│   ├── checkout/          Stepper, SummaryPanel, SuccessPanel, SeatMap, QrCanvas
│   │   └── steps/         Un componente por paso del checkout (Obra, Teatro, ...)
│   ├── home/              ObraCard, TrendCarousel, AboutSection
│   ├── layout/            Header, Footer, Layout, ProtectedRoute, ScrollToTop
│   └── ui/                Modal, Toast, LoadingScreen
├── context/
│   ├── AuthContext.jsx    Login/registro/logout contra /api/auth
│   ├── CatalogContext.jsx Catálogo, CRUDs, caché de asientos y compras
│   ├── auth-context.js    Constantes de roles y objeto de contexto
│   └── catalog-context.js Objeto de contexto del catálogo
├── data/
│   └── catalogo.js        Metadatos locales (imagen, elenco, género, layout)
├── hooks/                 useAuth, useCatalog, useReservas, useNotificaciones, ...
├── pages/                 Una página por ruta
├── utils/validacion.js    Sanitización y validaciones (email, DNI, tarjeta, etc.)
├── App.jsx                Definición de rutas
├── main.jsx               Providers + BrowserRouter
└── index.css              Tokens visuales y utilidades del tema
```

## Integración con la API

| Necesidad | Endpoint |
| --- | --- |
| Login / registro / logout | `POST /api/auth/login`, `/api/auth/register`, `/api/auth/logout` |
| Cartelera pública | `GET /api/obras`, `GET /api/funciones`, `GET /api/teatros` |
| Salas y butacas (con token) | `GET /api/salas`, `GET /api/asientos`, `GET /api/tipos-asiento` |
| Mapa de una función | `GET /api/funciones/{id}/asientos` |
| Compra | `POST /api/compras` con `{ funcionId, asientoIds }` |
| Historial | `GET /api/compras`, `GET /api/entradas` |
| Reservas en vivo | `GET/POST /api/ocupacion` |
| Novedades de cartelera | `GET/POST /api/notificaciones` |

El checkout pide el mapa real de butacas, valida que las elegidas sigan disponibles y envía los
`id` numéricos de butaca al backend. El backend vuelve a validar contra la tabla `entrada` y
responde `409` si otra persona compró primero. Los precios por tipo salen del mapa de butacas
(`precio de la función × multiplicador del tipo de butaca`), por lo que el total del resumen
coincide con el `total` que devuelve la compra.

Las reservas temporales de butacas se publican cada 6 segundos y vencen a los 20 segundos; el
frontend consulta el estado cada 2 segundos. La bandeja de novedades consulta cada 5 segundos y
las sesiones de gestión publican un aviso al programar la primera función de una obra.

## Decisiones de arquitectura

- **Estado global con Context + hooks.** `CatalogContext` es la única fuente de verdad del
  catálogo, las butacas y las compras; `AuthContext` maneja la sesión y los permisos.
- **Adaptador de datos.** `src/api/mappers.js` traduce los contratos del backend al modelo que ya
  usaban las pantallas. Lo que la base no guarda se completa con metadatos locales.
- **Rutas protegidas por sesión y rol.** `ProtectedRoute` redirige al login (guardando el destino)
  o a `/acceso-denegado`.
- **Validación centralizada.** `utils/validacion.js` sanitiza entrada y valida email, DNI,
  teléfono, tarjeta (Luhn), vencimiento y CVV. Los errores se muestran por campo y se vinculan con
  `aria-describedby`.
- **Accesibilidad.** HTML semántico, un `h1` por página, labels asociados, `alt` en imágenes,
  `aria-live` en toasts, `role="dialog"` + `aria-modal` en modales, cierre con `Escape`, foco
  inicial y navegación por teclado.
- **Estados de espera.** Los formularios de gestión deshabilitan el botón y muestran el progreso
  mientras esperan al backend; el checkout tiene su propio temporizador de sesión.

## Limitaciones conocidas

- El token de sesión vive en memoria: recargar la página cierra la sesión.
- El backend no modela imagen, elenco, género ni flags de publicación; se completan localmente.
- El DNI, teléfono, localidad del titular y el comprobante quedan en memoria del navegador.
- Dar de baja una obra o función con entradas vendidas falla por integridad referencial; el
  backend no elimina en cascada.
- `entrada.codigo` (el que muestra el QR) y `ticket.codigo` (el que se envía por correo) son dos
  identificadores distintos generados por el backend.
