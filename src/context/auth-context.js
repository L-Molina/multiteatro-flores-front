import { createContext } from 'react'

/* Roles disponibles en el prototipo. El rol define qué módulos puede usar
   cada cuenta: el Superadmin gestiona todo, el Dueño solo su teatro y el
   Usuario común únicamente la experiencia de compra y su historial. */
export const ROLES = {
  SUPERADMIN: 'superadmin',
  DUENO: 'dueno',
  USUARIO: 'usuario',
}

export const ROLE_LABELS = {
  [ROLES.SUPERADMIN]: 'Superadmin',
  [ROLES.DUENO]: 'Dueño de teatro',
  [ROLES.USUARIO]: 'Usuario común',
}

export const ROLE_OPTIONS = [
  {
    value: ROLES.SUPERADMIN,
    label: ROLE_LABELS[ROLES.SUPERADMIN],
    icon: 'admin_panel_settings',
    description: 'Gestiona obras, funciones y aforo de todas las salas y teatros.',
  },
  {
    value: ROLES.DUENO,
    label: ROLE_LABELS[ROLES.DUENO],
    icon: 'storefront',
    description: 'Gestiona solo las salas y funciones del teatro del que es dueño.',
  },
  {
    value: ROLES.USUARIO,
    label: ROLE_LABELS[ROLES.USUARIO],
    icon: 'person',
    description: 'Compra entradas, recibe el boletín y consulta su historial de compras.',
  },
]

export const ROLES_GESTION = [ROLES.SUPERADMIN, ROLES.DUENO]

export const roleLabel = (rol) => ROLE_LABELS[rol] || 'Usuario'

/* Contexto de autenticación: expone la sesión y las acciones de login,
   registro y logout a cualquier componente sin pasar props por todo el árbol. */
export const AuthContext = createContext(null)
