import React, { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { epaperApi } from '../utils/api'
import { useMapCanvas, getColor } from '../hooks/useMapCanvas'
import { MappingModal } from '../components/ui/MappingModal'
import { ToastContainer } from '../components/ui/ToastContainer'
import { useToast } from '../hooks/useToast'

export default function MapPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toasts, toast } = useToast()

  const [epaper, setEpaper]       = useState(null)
  const [pages, setPages]         = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [mappings, setMappings]   = useState([])
  const [mode, setMode]           = useState('draw')
  const [modalData, setModalData] = useState(null)
  const [imgLoaded, setImgLoaded] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [canvasAreaWidth, setCanvasAreaWidth] = useState(0)

  const colorCountRef = useRef(0)
  const canvasAreaRef = useRef(null)

  // Load epaper + pages once
  useEffect(() => {
    (async () => {
      try {
        const [ep, pgs] = await Promise.all([epaperApi.get(id), epaperApi.pages(id)])
        setEpaper(ep)
        setPages(pgs)
      } catch (e) { toast.error(e.message) }
    })()
  }, [id])

  // Load mappings whenever page changes
  useEffect(() => {
    if (!id) return
    ;(async () => {
      try {
        const data = await epaperApi.getMappings(id, currentPage)
        setMappings(data)
        colorCountRef.current = data.length
      } catch (e) { toast.error(e.message) }
    })()
  }, [id, currentPage])

  const { bgRef, drawRef, loadImage, onDown, onMove, onUp, hasPendingCorner, cancelDrawing, imageSize } = useMapCanvas({
    mappings,
    onDrawn: (rect) => {
      const colorIdx = colorCountRef.current
      colorCountRef.current++
      setModalData({ ...rect, color_idx: colorIdx, label: `Wachak Lokshahicha ${mappings.length + 1}`, link_url: '', notes: '' })
    },
    onSelect: (m) => setModalData(m),
    mode,
  })

  // Load image when page changes
  useEffect(() => {
    if (!epaper || pages.length === 0) return
    setImgLoaded(false)
    setZoom(1)
    loadImage(epaperApi.pageImageUrl(id, currentPage)).then(() => setImgLoaded(true))
  }, [epaper, pages, currentPage, id])

  useEffect(() => {
    const el = canvasAreaRef.current
    if (!el) return

    const updateWidth = () => setCanvasAreaWidth(el.clientWidth)
    updateWidth()

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', updateWidth)
      return () => window.removeEventListener('resize', updateWidth)
    }

    const observer = new ResizeObserver(updateWidth)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const handleSaved = useCallback((saved, isNew) => {
    setMappings(prev => isNew ? [...prev, saved] : prev.map(m => m.id === saved.id ? saved : m))
    setModalData(null)
    toast.success(isNew ? 'Mapping added' : 'Mapping updated')
  }, [])

  const handleDeleted = useCallback((mid) => {
    setMappings(prev => prev.filter(m => m.id !== mid))
    setModalData(null)
    toast.success('Mapping deleted')
  }, [])

  const handlePublish = async () => {
    setPublishing(true)
    try {
      const updated = await epaperApi.publish(id)
      setEpaper(updated)
      toast.success(updated.is_published ? 'ePaper published!' : 'ePaper unpublished')
    } catch (e) { toast.error(e.message) }
    finally { setPublishing(false) }
  }

  const totalMappings = mappings.length

  if (!epaper) return (
    <div style={{ padding: 40, display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text2)' }}>
      <span className="spinner" />Loading…
    </div>
  )

  const page = pages.find(p => p.page_num === currentPage)
  const fitWidth = imageSize
    ? Math.min(imageSize.width, Math.max(1, canvasAreaWidth - 48))
    : 0
  const displayWidth = fitWidth ? Math.round(fitWidth * zoom) : undefined
  const zoomPct = Math.round(zoom * 100)
  const zoomIn = () => setZoom(z => Math.min(4, Number((z + 0.25).toFixed(2))))
  const zoomOut = () => setZoom(z => Math.max(0.5, Number((z - 0.25).toFixed(2))))
  const resetZoom = () => setZoom(1)

  return (
    <div className="map-page">
      <ToastContainer toasts={toasts} />

      {/* Top bar */}
      <div className="map-toolbar">
        <button className="btn btn-sm" onClick={() => navigate('/epapers')}>← Back</button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {epaper.title}
          </span>
          <span style={{ fontSize: 12, color: 'var(--text3)', marginLeft: 8 }}>{epaper.edition_date}</span>
        </div>

        {/* Mode toggle */}
        <div style={{ display: 'flex', background: 'var(--surface2)', borderRadius: 'var(--radius)', padding: 3, border: '1px solid var(--border)', gap: 2 }}>
          {['draw', 'select'].map(m => (
            <button key={m} className="btn btn-sm"
              style={{ border: 'none', background: mode === m ? 'var(--accent)' : 'transparent', color: mode === m ? '#fff' : 'var(--text2)', textTransform: 'capitalize' }}
              onClick={() => setMode(m)}>
              {m === 'draw' ? '✏ Draw' : '↖ Select'}
            </button>
          ))}
        </div>

        {/* Page nav */}
        {pages.length > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button className="btn btn-sm" disabled={currentPage <= 1} onClick={() => setCurrentPage(p => p - 1)}>‹</button>
            <span style={{ fontSize: 12, color: 'var(--text2)', fontFamily: 'var(--mono)', minWidth: 56, textAlign: 'center' }}>
              {currentPage} / {pages.length}
            </span>
            <button className="btn btn-sm" disabled={currentPage >= pages.length} onClick={() => setCurrentPage(p => p + 1)}>›</button>
          </div>
        )}

        {/* Zoom controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button className="btn btn-sm" disabled={zoom <= 0.5} onClick={zoomOut} title="Zoom out">-</button>
          <button className="btn btn-sm" onClick={resetZoom} title="Reset zoom" style={{ minWidth: 58, justifyContent: 'center' }}>
            {zoomPct}%
          </button>
          <button className="btn btn-sm" disabled={zoom >= 4} onClick={zoomIn} title="Zoom in">+</button>
        </div>

        {/* Publish */}
        <button
          className={`btn btn-sm ${epaper.is_published ? 'btn-danger' : 'btn-success'}`}
          onClick={handlePublish} disabled={publishing}
        >
          {publishing
            ? <><span className="spinner" style={{ width: 12, height: 12 }} /> …</>
            : epaper.is_published ? '⊘ Unpublish' : '✓ Publish ePaper'}
        </button>
      </div>

      {/* Body */}
      <div className="map-body">

        {/* Canvas area */}
        <div className="map-canvas-area" ref={canvasAreaRef}>
          {!imgLoaded && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#888', paddingTop: 60 }}>
              <span className="spinner" style={{ borderColor: '#555', borderTopColor: '#aaa' }} />
              Loading page…
            </div>
          )}
          <div
            style={{
              position: 'relative',
              display: imgLoaded ? 'inline-block' : 'none',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              width: '100%',
              maxWidth: 'none',
              flexShrink: 0,
              margin: '0 auto',
            }}
          >
            <canvas ref={bgRef} style={{ display: 'block', width: '100%', maxWidth: 'none' }} />
            <canvas
              ref={drawRef}
              style={{
                position: 'absolute',
                inset: 0,
                cursor: mode === 'draw' ? 'crosshair' : 'default',
                width: '100%',
                height: '100%',
                maxWidth: 'none',
                touchAction: mode === 'draw' ? 'pan-x pan-y' : 'manipulation',
              }}
              onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp}
              onTouchStart={onDown} onTouchMove={onMove} onTouchEnd={onUp}
              onTouchCancel={cancelDrawing}
            />
          </div>
          {mode === 'draw' && (
            <div className="map-mobile-drawbar">
              <span>{hasPendingCorner ? 'Tap opposite corner to finish' : 'Tap two corners or drag to add region'}</span>
              {hasPendingCorner && (
                <button className="btn btn-sm" onClick={cancelDrawing}>Cancel</button>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="map-side-panel">
          {/* Sidebar header */}
          <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text3)' }}>
              Mappings
            </span>
            <span style={{ fontSize: 11, background: 'var(--accent-bg)', color: 'var(--accent-t)', padding: '1px 7px', borderRadius: 20, fontWeight: 500 }}>
              {totalMappings}
            </span>
          </div>

          {/* Mappings list */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {mappings.length === 0 ? (
              <div style={{ padding: 20, textAlign: 'center', fontSize: 12, color: 'var(--text3)', lineHeight: 1.7 }}>
                No mappings on this page.<br />Switch to <strong>Draw</strong> mode and drag to add one.
              </div>
            ) : mappings.map(m => (
              <div key={m.id}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background 0.1s' }}
                onClick={() => setModalData(m)}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: getColor(m.color_idx), flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.label}</div>
                  <div style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>
                    {Math.round(m.w)}×{Math.round(m.h)}
                    {m.link_url && ' · 🔗'}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Page info */}
          {page && (
            <div style={{ padding: '10px 14px', borderTop: '1px solid var(--border)', fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>
              {page.width} × {page.height} px
            </div>
          )}
        </div>
      </div>

      {/* Status bar */}
      <div className="map-status">
        <span>{mode === 'draw' ? 'Drag to draw a mapping region' : 'Click a region to edit'}</span>
        <span>·</span>
        <span>{totalMappings} mapping{totalMappings !== 1 ? 's' : ''} on this page</span>
        <span>·</span>
        <span style={{ color: epaper.is_published ? 'var(--success)' : 'var(--text3)' }}>
          {epaper.is_published ? '● Published' : '○ Draft'}
        </span>
        <span style={{ marginLeft: 'auto' }}>D = draw  ·  S = select  ·  Esc = close modal</span>
      </div>

      <MappingModal
        mapping={modalData}
        epaperId={Number(id)}
        pageNum={currentPage}
        onClose={() => setModalData(null)}
        onSaved={handleSaved}
        onDeleted={handleDeleted}
      />
    </div>
  )
}
