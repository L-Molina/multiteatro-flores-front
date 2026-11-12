import { useContext } from 'react'
import { CatalogContext } from '../context/catalog-context'

export default function useCatalog() {
  const context = useContext(CatalogContext)
  if (!context) throw new Error('useCatalog debe usarse dentro de CatalogProvider')
  return context
}
