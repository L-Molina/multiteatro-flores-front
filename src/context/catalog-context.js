import { createContext } from 'react'

/* Contexto del catálogo: centraliza obras, salas, funciones y sus operaciones
   para que cartelera, checkout y panel de administración compartan una única
   fuente de verdad durante la sesión. */
export const CatalogContext = createContext(null)
