import React, { useRef, useEffect } from 'react'
import { publicApi } from '../utils/api'

export function PageStrip({ epaper, currentPage, onSelect }) {
  const stripRef = useRef(null)
  const activeRef = useRef(null)

  useEffect(() => {
    if (activeRef.current && stripRef.current) {
      activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }
  }, [currentPage])

  if (!epaper) return null

  return (
    <div style={{
      background: 'var(--header)',
      borderBottom: '1px solid #2a2a2a',
      padding: '8px 16px',
    }}>
      <div
        ref={stripRef}
        style={{
          maxWidth: 1200, margin: '0 auto',
          display: 'flex', gap: 8, overflowX: 'auto',
          paddingBottom: 4, scrollbarWidth: 'thin',
        }}
      >
        {epaper.pages.map(pg => (
          <button
            key={pg.page_num}
            ref={pg.page_num === currentPage ? activeRef : null}
            onClick={() => onSelect(pg.page_num)}
            style={{
              flexShrink: 0, width: 52,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              padding: '4px 4px 6px',
              borderRadius: 6,
              border: `2px solid ${pg.page_num === currentPage ? 'var(--accent)' : 'transparent'}`,
              background: pg.page_num === currentPage ? 'rgba(232,160,32,0.08)' : 'transparent',
              cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            <div style={{
              width: 44, height: 58, borderRadius: 3, overflow: 'hidden',
              border: `1px solid ${pg.page_num === currentPage ? 'var(--accent)' : 'var(--border)'}`,
              background: 'var(--surface)',
            }}>
              <img
                src={publicApi.pageImageUrl(epaper.id, pg.page_num)}
                alt={`Page ${pg.page_num}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                loading="lazy"
              />
            </div>
            <span style={{
              fontSize: 9,
              fontWeight: pg.page_num === currentPage ? 600 : 400,
              color: pg.page_num === currentPage ? 'var(--accent)' : 'var(--text3)',
            }}>
              {pg.page_num}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
