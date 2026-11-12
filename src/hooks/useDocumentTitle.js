import { useEffect } from 'react'

const SUFFIX = 'Multiteatro Flores'

export default function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} — ${SUFFIX}` : `${SUFFIX} — Cartelera Oficial`
  }, [title])
}
