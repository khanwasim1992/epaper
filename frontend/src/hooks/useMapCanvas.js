import { useRef, useCallback, useEffect } from 'react'

const COLORS = ['#1a56db','#057a55','#c05621','#6c2bd9','#c81e1e','#0694a2','#b45309','#e74694']
export const getColor = (idx) => COLORS[idx % COLORS.length]

function hexAlpha(hex, a) {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16)
  return `rgba(${r},${g},${b},${a})`
}

export function useMapCanvas({ mappings, onDrawn, onSelect, mode }) {
  const bgRef   = useRef(null)
  const drawRef = useRef(null)
  const imgRef  = useRef(null)
  const drawing = useRef(false)
  const start   = useRef({ x: 0, y: 0 })

  const loadImage = useCallback((url) => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        imgRef.current = img
        const bg = bgRef.current; const dr = drawRef.current
        if (!bg || !dr) return
        bg.width = dr.width  = img.naturalWidth
        bg.height = dr.height = img.naturalHeight
        bg.getContext('2d').drawImage(img, 0, 0)
        redraw()
        resolve()
      }
      img.src = url
    })
  }, []) // eslint-disable-line

  const redraw = useCallback((preview = null) => {
    const cv = drawRef.current; if (!cv) return
    const ctx = cv.getContext('2d')
    ctx.clearRect(0, 0, cv.width, cv.height)

    mappings.forEach(m => {
      const col = getColor(m.color_idx)
      ctx.fillStyle = hexAlpha(col, 0.14)
      ctx.strokeStyle = col
      ctx.lineWidth = 1.5
      ctx.setLineDash([])
      ctx.beginPath(); ctx.rect(m.x, m.y, m.w, m.h); ctx.fill(); ctx.stroke()
      // label badge
      ctx.font = '600 11px Inter, sans-serif'
      const tw = ctx.measureText(m.label).width
      const bx = m.x, by = m.y > 18 ? m.y - 18 : m.y + m.h + 2
      ctx.fillStyle = col
      ctx.beginPath(); ctx.roundRect(bx, by, tw + 12, 16, 4); ctx.fill()
      ctx.fillStyle = '#fff'
      ctx.fillText(m.label, bx + 6, by + 11.5)
    })

    if (preview) {
      ctx.fillStyle = 'rgba(26,86,219,0.08)'
      ctx.strokeStyle = '#1a56db'
      ctx.lineWidth = 1.5; ctx.setLineDash([6,3])
      ctx.beginPath(); ctx.rect(preview.x, preview.y, preview.w, preview.h)
      ctx.fill(); ctx.stroke(); ctx.setLineDash([])
    }
  }, [mappings])

  useEffect(() => { redraw() }, [redraw])

  const getPos = (e) => {
    const cv = drawRef.current; const r = cv.getBoundingClientRect()
    const sx = cv.width / r.width, sy = cv.height / r.height
    const cx = e.touches ? e.touches[0].clientX : e.clientX
    const cy = e.touches ? e.touches[0].clientY : e.clientY
    return { x: (cx - r.left) * sx, y: (cy - r.top) * sy }
  }

  const findAt = (x, y) => {
    for (let i = mappings.length - 1; i >= 0; i--) {
      const m = mappings[i]
      if (x >= m.x && x <= m.x + m.w && y >= m.y && y <= m.y + m.h) return m
    }
    return null
  }

  const onDown  = useCallback((e) => {
    e.preventDefault()
    const p = getPos(e)
    if (mode === 'draw') { drawing.current = true; start.current = p }
    else { const hit = findAt(p.x, p.y); if (hit) onSelect(hit) }
  }, [mode, mappings, onSelect])

  const onMove  = useCallback((e) => {
    e.preventDefault()
    if (!drawing.current) return
    const p = getPos(e); const s = start.current
    redraw({ x: s.x, y: s.y, w: p.x - s.x, h: p.y - s.y })
  }, [redraw])

  const onUp    = useCallback((e) => {
    e.preventDefault()
    if (!drawing.current) return
    drawing.current = false
    const cv = drawRef.current; const r = cv.getBoundingClientRect()
    const sx = cv.width / r.width, sy = cv.height / r.height
    const cx = e.changedTouches ? e.changedTouches[0].clientX : e.clientX
    const cy = e.changedTouches ? e.changedTouches[0].clientY : e.clientY
    const x = (cx - r.left) * sx, y = (cy - r.top) * sy
    const s = start.current; const w = x - s.x; const h = y - s.y
    if (Math.abs(w) < 10 || Math.abs(h) < 10) { redraw(); return }
    onDrawn({ x: Math.min(s.x, x), y: Math.min(s.y, y), w: Math.abs(w), h: Math.abs(h) })
  }, [onDrawn, redraw])

  return { bgRef, drawRef, loadImage, onDown, onMove, onUp }
}
