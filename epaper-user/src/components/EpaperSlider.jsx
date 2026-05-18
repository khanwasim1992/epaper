import React, { useState, useEffect, useCallback, useRef } from 'react'
import { PageViewer } from './PageViewer'
import { RegionModal } from './RegionModal'
import { PageStrip } from './PageStrip'

export function EpaperSlider({ epaper }) {
  const [currentPage, setCurrentPage]       = useState(1)
  const [selectedRegion, setSelectedRegion] = useState(null)
  const [transitioning, setTransitioning]   = useState(false)
  const totalPages = epaper.pages.length
  const page = epaper.pages.find(p => p.page_num === currentPage)
  const touchStart = useRef(null)

  const goTo = useCallback((num) => {
    if (num < 1 || num > totalPages || transitioning) return
    setTransitioning(true)
    setTimeout(() => { setCurrentPage(num); setTransitioning(false) }, 120)
  }, [totalPages, transitioning])

  const prev = useCallback(() => goTo(currentPage - 1), [currentPage, goTo])
  const next = useCallback(() => goTo(currentPage + 1), [currentPage, goTo])

  useEffect(() => {
    const h = (e) => {
      if (selectedRegion) return
      if (e.key === 'ArrowLeft')  prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [prev, next, selectedRegion])

  const onTouchStart = (e) => { touchStart.current = e.touches[0].clientX }
  const onTouchEnd   = (e) => {
    if (touchStart.current === null) return
    const dx = e.changedTouches[0].clientX - touchStart.current
    if (Math.abs(dx) > 50) dx < 0 ? next() : prev()
    touchStart.current = null
  }

  const NavBtn = ({ onClick, disabled, children, side }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        flexShrink: 0, width: 44, height: 44, borderRadius: '50%',
        background: !disabled ? 'rgba(255,255,255,0.07)' : 'transparent',
        border: '1px solid rgba(255,255,255,0.08)',
        color: !disabled ? 'var(--text)' : 'var(--text3)',
        fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: !disabled ? 'pointer' : 'not-allowed', transition: 'all 0.15s', zIndex: 10,
        position: 'relative',
      }}
      onMouseEnter={e => !disabled && (e.currentTarget.style.background = 'rgba(255,255,255,0.14)')}
      onMouseLeave={e => (e.currentTarget.style.background = !disabled ? 'rgba(255,255,255,0.07)' : 'transparent')}
    >{children}</button>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      {/* Thumbnail strip */}
      <PageStrip epaper={epaper} currentPage={currentPage} onSelect={goTo} />

      {/* Viewer */}
      <div
        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '28px 16px', gap: 16, position: 'relative', overflow: 'hidden' }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <NavBtn onClick={prev} disabled={currentPage <= 1}>‹</NavBtn>

        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          maxWidth: 900, minWidth: 0,
          opacity: transitioning ? 0 : 1,
          transform: transitioning ? 'scale(0.98)' : 'scale(1)',
          transition: 'opacity 0.12s ease, transform 0.12s ease',
        }}>
          {page && (
            <PageViewer
              key={`${epaper.id}-${page.page_num}`}
              page={page}
              epaperId={epaper.id}
              onRegionClick={setSelectedRegion}
            />
          )}
        </div>

        <NavBtn onClick={next} disabled={currentPage >= totalPages}>›</NavBtn>
      </div>

      {/* Bottom bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14,
        padding: '10px 20px',
        background: 'var(--header)', borderTop: '1px solid #2a2a2a',
        flexShrink: 0, flexWrap: 'wrap',
      }}>
        {/* Dot indicators */}
        <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
          {epaper.pages.slice(0, 20).map(pg => (
            <button
              key={pg.page_num}
              onClick={() => goTo(pg.page_num)}
              style={{
                width: pg.page_num === currentPage ? 20 : 7, height: 7,
                borderRadius: 4, padding: 0,
                background: pg.page_num === currentPage ? 'var(--accent)' : 'rgba(255,255,255,0.15)',
                border: 'none', cursor: 'pointer', transition: 'all 0.2s ease',
              }}
            />
          ))}
          {totalPages > 20 && (
            <span style={{ fontSize: 10, color: 'var(--text3)', marginLeft: 2 }}>+{totalPages - 20}</span>
          )}
        </div>

        <span style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 500 }}>
          Page <strong style={{ color: 'var(--accent)' }}>{currentPage}</strong> / {totalPages}
        </span>

        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {['←', '→'].map(k => (
            <kbd key={k} style={{
              background: 'var(--surface2)', border: '1px solid var(--border)',
              borderRadius: 4, padding: '1px 5px', fontSize: 10, color: 'var(--text2)',
              fontFamily: 'monospace',
            }}>{k}</kbd>
          ))}
          <span style={{ fontSize: 11, color: 'var(--text3)', marginLeft: 2 }}>navigate · scroll to zoom</span>
        </div>
      </div>

      {selectedRegion && (
        <RegionModal
          region={selectedRegion}
          epaper={epaper}
          pageNum={currentPage}
          onClose={() => setSelectedRegion(null)}
        />
      )}
    </div>
  )
}
