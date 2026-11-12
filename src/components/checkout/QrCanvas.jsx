import { useEffect, useRef } from 'react'

export default function QrCanvas({ code, size = 132 }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const cells = 21
    const cell = canvas.width / cells
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#071510'

    let hash = 0
    for (let i = 0; i < code.length; i++) {
      hash = (hash * 31 + code.charCodeAt(i)) & 0xffffffff
    }
    for (let y = 0; y < cells; y++) {
      for (let x = 0; x < cells; x++) {
        const inFinder =
          (x < 7 && y < 7) || (x >= cells - 7 && y < 7) || (x < 7 && y >= cells - 7)
        if (inFinder) continue
        hash = (hash * 1103515245 + 12345) & 0x7fffffff
        if (hash % 3 !== 0) ctx.fillRect(x * cell, y * cell, cell, cell)
      }
    }

    const finder = (px, py) => {
      ctx.fillStyle = '#071510'
      ctx.fillRect(px, py, 7 * cell, 7 * cell)
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(px + cell, py + cell, 5 * cell, 5 * cell)
      ctx.fillStyle = '#071510'
      ctx.fillRect(px + 2 * cell, py + 2 * cell, 3 * cell, 3 * cell)
    }
    finder(0, 0)
    finder((cells - 7) * cell, 0)
    finder(0, (cells - 7) * cell)
  }, [code])

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      role="img"
      aria-label={`Código QR simulado de la compra ${code}`}
      className="max-w-full"
    />
  )
}
