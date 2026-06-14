import React, { useRef, useState, useEffect, useCallback } from 'react'
import { publicApi } from '../utils/api'

const COLORS = ['#4f8ef7','#34d399','#f97316','#e879f9','#fbbf24','#60a5fa','#a78bfa','#fb7185']
const getColor = (idx) => COLORS[idx % COLORS.length]
const hexAlpha = (hex, a) => {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16)
  return `rgba(${r},${g},${b},${a})`
}

export function PageViewer({ page, epaperId, onRegionClick }) {
  const imgRef       = useRef(null)
  const canvasRef    = useRef(null)
  const containerRef = useRef(null)
  const [imgLoaded, setImgLoaded]         = useState(false)
  const [naturalSize, setNaturalSize]     = useState({ w: 1, h: 1 })
  const [hoveredId, setHoveredId]         = useState(null)
  const [tooltip, setTooltip]             = useState(null)
  const [zoom, setZoom]                   = useState(1)
  const [pan, setPan]                     = useState({ x: 0, y: 0 })
  const [dragging, setDragging]           = useState(false)
  const dragStart = useRef(null)
  const lastClick = useRef(0)

  useEffect(() => { setZoom(1); setPan({ x: 0, y: 0 }); setImgLoaded(false); setHoveredId(null) }, [page?.page_num])

  // Draw overlays
  const drawOverlays = useCallback((hid) => {
    const canvas = canvasRef.current
    const img    = imgRef.current
    if (!canvas || !img || !imgLoaded) return
    const dw = img.clientWidth, dh = img.clientHeight
    canvas.width = dw; canvas.height = dh
    canvas.style.width = dw + 'px'; canvas.style.height = dh + 'px'
    const sx = dw / naturalSize.w, sy = dh / naturalSize.h
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, dw, dh)
    if (!page?.mappings?.length) return

    page.mappings.forEach(m => {
      const col = getColor(m.color_idx ?? 0)
      const isHov = m.id === hid
      const rx = m.x * sx, ry = m.y * sy, rw = m.w * sx, rh = m.h * sy

      // Always draw a faint border so user knows regions exist
      ctx.strokeStyle = hexAlpha(col, isHov ? 0.9 : 0.3)
      ctx.fillStyle   = hexAlpha(col, isHov ? 0.22 : 0.04)
      ctx.lineWidth   = isHov ? 2 : 1
      ctx.setLineDash(isHov ? [] : [4, 3])
      ctx.beginPath(); ctx.rect(rx, ry, rw, rh); ctx.fill(); ctx.stroke()
      ctx.setLineDash([])

      if (isHov) {
        // Label badge above the region
        ctx.font = '600 11px Inter, sans-serif'
        const tw  = ctx.measureText(m.label).width
        const bx  = rx
        const by  = ry > 22 ? ry - 22 : ry + rh + 4
        ctx.fillStyle = col
        ctx.beginPath(); ctx.roundRect(bx, by, tw + 14, 20, 5); ctx.fill()
        ctx.fillStyle = '#fff'
        ctx.fillText(m.label, bx + 7, by + 14)
      }
    })
  }, [page, imgLoaded, naturalSize])

  useEffect(() => { drawOverlays(hoveredId) }, [hoveredId, drawOverlays, zoom])

  useEffect(() => {
    const ro = new ResizeObserver(() => drawOverlays(hoveredId))
    if (imgRef.current) ro.observe(imgRef.current)
    return () => ro.disconnect()
  }, [drawOverlays, hoveredId])

  const getImgPos = useCallback((e) => {
    const img = imgRef.current; if (!img) return null
    const rect = img.getBoundingClientRect()
    const sx = naturalSize.w / img.clientWidth, sy = naturalSize.h / img.clientHeight
    return { x: (e.clientX - rect.left) * sx, y: (e.clientY - rect.top) * sy }
  }, [naturalSize])

  const findMapping = useCallback((x, y) => {
    if (!page?.mappings) return null
    for (let i = page.mappings.length - 1; i >= 0; i--) {
      const m = page.mappings[i]
      if (x >= m.x && x <= m.x + m.w && y >= m.y && y <= m.y + m.h) return m
    }
    return null
  }, [page])

  const onMouseMove = useCallback((e) => {
    if (dragging) {
      if (!dragStart.current) return
      setPan({ x: dragStart.current.px + (e.clientX - dragStart.current.mx), y: dragStart.current.py + (e.clientY - dragStart.current.my) })
      return
    }
    const pos = getImgPos(e); if (!pos) return
    const hit = findMapping(pos.x, pos.y)
    setHoveredId(hit?.id ?? null)
    if (hit) {
      const rect = canvasRef.current?.getBoundingClientRect()
      setTooltip({ label: hit.label, x: e.clientX - (rect?.left ?? 0), y: e.clientY - (rect?.top ?? 0) })
    } else {
      setTooltip(null)
    }
  }, [dragging, getImgPos, findMapping])

  const onMouseLeave = () => { setHoveredId(null); setTooltip(null) }

  const onMouseDown = (e) => {
    if (zoom > 1) { e.preventDefault(); setDragging(true); dragStart.current = { mx: e.clientX, my: e.clientY, px: pan.x, py: pan.y } }
  }

  const onMouseUp = (e) => {
    const wasDragging = dragging
    setDragging(false); dragStart.current = null
    if (wasDragging) return
    const now = Date.now()
    if (now - lastClick.current < 300) return   // debounce double-click
    lastClick.current = now
    const pos = getImgPos(e); if (!pos) return
    const hit = findMapping(pos.x, pos.y)
    if (hit) onRegionClick(hit)
  }

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const handleWheel = (e) => {
      e.preventDefault()
      const delta = e.deltaY < 0 ? 0.12 : -0.12
      setZoom(z => {
        const nz = Math.max(1, Math.min(5, z + delta))
        if (nz === 1) setPan({ x: 0, y: 0 })
        return nz
      })
    }
    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [])

  if (!page) return null
  const imgUrl = publicApi.pageImageUrl(epaperId, page.page_num)

  return (
    <div style={{ position: 'relative', display: 'inline-block', maxWidth: '100%', lineHeight: 0, boxShadow: '0 8px 48px rgba(0,0,0,0.7)', borderRadius: 4, overflow: 'hidden', background: '#111' }}>
      <div
        ref={containerRef} onMouseDown={onMouseDown} onMouseUp={onMouseUp}
        onMouseMove={onMouseMove} onMouseLeave={onMouseLeave}
        style={{ overflow: 'hidden', cursor: zoom > 1 ? (dragging ? 'grabbing' : 'grab') : (hoveredId ? 'pointer' : 'default'), userSelect: 'none', lineHeight: 0 }}
      >
        {!imgLoaded && (
          <div style={{ width: 580, height: 760, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111' }}>
            <div style={{ width: 32, height: 32, border: '3px solid #333', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
          </div>
        )}
        <img
          ref={imgRef}
          src={imgUrl}
          alt={`Page ${page.page_num}`}
          draggable={false}
          onLoad={e => { setNaturalSize({ w: e.target.naturalWidth, h: e.target.naturalHeight }); setImgLoaded(true) }}
          style={{
            display: imgLoaded ? 'block' : 'none',
            maxWidth: '100%', maxHeight: 'calc(100vh - 240px)',
            transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
            transformOrigin: 'center center',
            transition: dragging ? 'none' : 'transform 0.05s',
          }}
        />
      </div>

      {/* Overlay canvas */}
      {imgLoaded && (
        <canvas ref={canvasRef} style={{
          position: 'absolute', top: 0, left: 0, pointerEvents: 'none',
          transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
          transformOrigin: 'center center',
        }} />
      )}

      {/* Hover tooltip */}
      {tooltip && !dragging && (
        <div style={{
          position: 'absolute',
          left: Math.min(tooltip.x + 12, (imgRef.current?.clientWidth ?? 400) - 160),
          top: Math.max(0, tooltip.y - 38),
          background: 'rgba(0,0,0,0.88)', color: '#fff',
          fontSize: 11, fontWeight: 500,
          padding: '5px 10px', borderRadius: 6,
          pointerEvents: 'none', whiteSpace: 'nowrap',
          border: '1px solid rgba(255,255,255,0.1)', zIndex: 10,
          backdropFilter: 'blur(4px)',
        }}>
          🖱 {tooltip.label} — click to open
        </div>
      )}

      {/* Zoom badge */}
      {zoom > 1 && (
        <div style={{
          position: 'absolute', bottom: 10, right: 10,
          background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.15)',
          color: 'var(--accent)', fontSize: 11, fontWeight: 600,
          padding: '3px 8px', borderRadius: 20, pointerEvents: 'none',
        }}>{Math.round(zoom * 100)}%</div>
      )}

      {/* Region hint badge — only when mappings exist */}
      {imgLoaded && page.mappings?.length > 0 && zoom === 1 && (
        <div style={{
          position: 'absolute', top: 10, left: 10,
          background: 'rgba(0,0,0,0.65)', border: '1px solid rgba(255,255,255,0.1)',
          color: 'rgba(255,255,255,0.65)', fontSize: 10,
          padding: '3px 8px', borderRadius: 20, pointerEvents: 'none',
          backdropFilter: 'blur(4px)',
        }}>
          {page.mappings.length} region{page.mappings.length !== 1 ? 's' : ''} — hover to explore
        </div>
      )}
    </div>
  )
}
