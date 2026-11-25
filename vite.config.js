import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// La coordinación de butacas y la bandeja de novedades viven ahora en el
// backend Spring Boot (OcupacionService y AvisoService), no en el dev server.
// El frontend las consume directamente contra VITE_API_URL.
export default defineConfig({
  plugins: [react()],
})
