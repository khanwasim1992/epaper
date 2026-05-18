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

  const colorCountRef = useRef(0)

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

  const { bgRef, drawRef, loadImage, onDown, onMove, onUp } = useMapCanvas({
    mappings,
    onDrawn: (rect) => {
      const colorIdx = colorCountRef.current
      colorCountRef.current++
      setModalData({ ...rect, color_idx: colorIdx, label: `Region ${mappings.length + 1}`, link_url: '', notes: '' })
    },
    onSelect: (m) => setModalData(m),
    mode,
  })

  // Load image when page changes
  useEffect(() => {
    if (!epaper || pages.length === 0) return
    setImgLoaded(false)
    loadImage(epaperApi.pageImageUrl(id, currentPage)).then(() => setImgLoaded(true))
  }, [epaper, pages, currentPage, id])

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

  return (
    <div style={{ display: 'flex', height: '100vh', flexDirection: 'column' }}>
      <ToastContainer toasts={toasts} />

      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '0 20px', height: 52,
        background: 'var(--surface)', borderBottom: '1px solid var(--border)',
        flexShrink: 0, flexWrap: 'wrap',
      }}>
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
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Canvas area */}
        <div style={{ flex: 1, overflow: 'auto', background: '#2a2a28', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 24 }}>
          {!imgLoaded && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#888', paddingTop: 60 }}>
              <span className="spinner" style={{ borderColor: '#555', borderTopColor: '#aaa' }} />
              Loading page…
            </div>
          )}
          <div style={{ position: 'relative', display: imgLoaded ? 'inline-block' : 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', maxWidth: '100%' }}>
            <canvas ref={bgRef} style={{ display: 'block', maxWidth: '100%' }} />
            <canvas
              ref={drawRef}
              style={{ position: 'absolute', inset: 0, cursor: mode === 'draw' ? 'crosshair' : 'default', maxWidth: '100%' }}
              onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp}
              onTouchStart={onDown} onTouchMove={onMove} onTouchEnd={onUp}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div style={{
          width: 250, flexShrink: 0, background: 'var(--surface)',
          borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}>
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
      <div style={{ height: 26, background: 'var(--surface)', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 16px', gap: 16, fontSize: 11, color: 'var(--text3)', flexShrink: 0 }}>
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
