import React, { useState, useEffect, useRef, useCallback } from 'react'
import { publicApi } from '../utils/api'

const COLORS = ['#4f8ef7','#34d399','#f97316','#e879f9','#fbbf24','#60a5fa','#a78bfa','#fb7185']
const getColor = (idx) => COLORS[idx % COLORS.length]

const ACTION_ICONS = {
  facebook: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
    </svg>
  ),
  x: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  whatsapp: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.044L.786 23.267a.5.5 0 00.614.65l4.426-1.419A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.378 0-4.593-.737-6.426-1.993l-.32-.214-3.327 1.067 1.009-3.218-.228-.343A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
    </svg>
  ),
  telegram: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  ),
  linkedin: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.024-3.037-1.85-3.037-1.853 0-2.136 1.447-2.136 2.942v5.664H9.352V9h3.414v1.561h.049c.476-.9 1.637-1.85 3.368-1.85 3.602 0 4.267 2.371 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 110-4.124 2.062 2.062 0 010 4.124zM7.114 20.452H3.558V9h3.556v11.452z" />
    </svg>
  ),
  email: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  ),
  copy: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  ),
  download: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <path d="M7 10l5 5 5-5" />
      <path d="M12 15V3" />
    </svg>
  ),
  print: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 9V2h12v7" />
      <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
      <path d="M6 14h12v8H6z" />
    </svg>
  ),
}

const actionButtonStyle = {
  width: 28,
  height: 28,
  borderRadius: 6,
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  color: 'var(--text2)',
  textDecoration: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'all 0.15s',
}

export function RegionModal({ region, epaper, pageNum, onClose }) {
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const [copied, setCopied] = useState(false)
  const dragStart = useRef(null)
  const imgRef = useRef(null)
  const cropFileRef = useRef(null)
  const touchStartRef = useRef(null)

  useEffect(() => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
    setCopied(false)
    cropFileRef.current = null
    touchStartRef.current = null
  }, [region])

  useEffect(() => {
    const handler = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  if (!region || !epaper) return null

  const cropUrl = publicApi.cropUrl(epaper.id, pageNum, region.x, region.y, region.w, region.h)
  const color = getColor(region.color_idx ?? 0)
  const shareTitle = region.label || epaper.title || 'ePaper news'
  const shareText = region.notes ? `${shareTitle} - ${region.notes}` : shareTitle
  const encodedUrl = encodeURIComponent(cropUrl)
  const shareBody = `${shareText}\n${cropUrl}`
  const encodedText = encodeURIComponent(shareText)
  const encodedShareBody = encodeURIComponent(shareBody)
  const downloadName = `${shareTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'news'}-clip.jpg`
  const shareLinks = [
    { name: 'Facebook', icon: ACTION_ICONS.facebook, fallbackHref: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
    { name: 'X', icon: ACTION_ICONS.x, fallbackHref: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}` },
    { name: 'WhatsApp', icon: ACTION_ICONS.whatsapp, fallbackHref: `https://wa.me/?text=${encodedShareBody}` },
    { name: 'Telegram', icon: ACTION_ICONS.telegram, fallbackHref: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}` },
    { name: 'LinkedIn', icon: ACTION_ICONS.linkedin, fallbackHref: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}` },
    { name: 'Email', icon: ACTION_ICONS.email, fallbackHref: `mailto:?subject=${encodedText}&body=${encodedShareBody}` },
  ]

  const zoomIn  = () => setZoom(z => Math.min(z + 0.25, 4))
  const zoomOut = () => { setZoom(z => { const nz = Math.max(z - 0.25, 0.5); if (nz <= 1) setPan({ x: 0, y: 0 }); return nz }) }
  const zoomReset = () => { setZoom(1); setPan({ x: 0, y: 0 }) }

  const onWheel = useCallback((e) => {
    e.preventDefault()
    const delta = e.deltaY < 0 ? 0.15 : -0.15
    setZoom(z => { const nz = Math.max(0.5, Math.min(4, z + delta)); if (nz <= 1) setPan({ x: 0, y: 0 }); return nz })
  }, [])

  const onMouseDown = (e) => {
    if (zoom <= 1) return
    e.preventDefault()
    setDragging(true)
    dragStart.current = { mx: e.clientX, my: e.clientY, px: pan.x, py: pan.y }
  }
  const onMouseMove = (e) => {
    if (!dragging || !dragStart.current) return
    setPan({
      x: dragStart.current.px + (e.clientX - dragStart.current.mx),
      y: dragStart.current.py + (e.clientY - dragStart.current.my),
    })
  }
  const onMouseUp = () => { setDragging(false); dragStart.current = null }
  const getTouchDistance = (touches) => {
    const dx = touches[0].clientX - touches[1].clientX
    const dy = touches[0].clientY - touches[1].clientY
    return Math.hypot(dx, dy)
  }
  const onTouchStart = (e) => {
    if (e.touches.length === 1) {
      touchStartRef.current = {
        mode: 'pan',
        mx: e.touches[0].clientX,
        my: e.touches[0].clientY,
        px: pan.x,
        py: pan.y,
      }
      setDragging(zoom > 1)
      return
    }
    if (e.touches.length === 2) {
      e.preventDefault()
      touchStartRef.current = {
        mode: 'pinch',
        distance: getTouchDistance(e.touches),
        zoom,
        pan,
      }
      setDragging(false)
    }
  }
  const onTouchMove = (e) => {
    const start = touchStartRef.current
    if (!start) return
    if (start.mode === 'pan' && e.touches.length === 1) {
      if (zoom <= 1) return
      e.preventDefault()
      setPan({
        x: start.px + (e.touches[0].clientX - start.mx),
        y: start.py + (e.touches[0].clientY - start.my),
      })
      return
    }
    if (start.mode === 'pinch' && e.touches.length === 2) {
      e.preventDefault()
      const nextZoom = Math.max(0.5, Math.min(4, start.zoom * (getTouchDistance(e.touches) / start.distance)))
      setZoom(nextZoom)
      if (nextZoom <= 1) setPan({ x: 0, y: 0 })
    }
  }
  const onTouchEnd = () => {
    setDragging(false)
    touchStartRef.current = null
  }
  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(cropUrl)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      window.prompt('Copy news link', cropUrl)
    }
  }
  const getCropFile = async () => {
    if (cropFileRef.current) return cropFileRef.current
    const response = await fetch(cropUrl)
    if (!response.ok) throw new Error('Could not load clipping image')
    const blob = await response.blob()
    const file = new File([blob], downloadName, { type: blob.type || 'image/jpeg' })
    cropFileRef.current = file
    return file
  }
  const openFallbackShare = (href) => {
    if (href.startsWith('mailto:')) {
      window.location.href = href
      return
    }
    window.open(href, '_blank', 'noopener,noreferrer')
  }
  const shareImage = async (item) => {
    try {
      const file = await getCropFile()
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title: shareTitle, text: shareBody, url: cropUrl, files: [file] })
        return
      }
    } catch (error) {
      if (error?.name === 'AbortError') return
    }
    openFallbackShare(item.fallbackHref)
  }
  const nativeShare = async () => {
    try {
      const file = await getCropFile()
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title: shareTitle, text: shareBody, url: cropUrl, files: [file] })
        return
      }
      if (navigator.share) {
        await navigator.share({ title: shareTitle, text: shareBody, url: cropUrl })
        return
      }
    } catch (error) {
      if (error?.name === 'AbortError') return
    }
    copyShareLink()
  }
  const printClip = () => {
    const win = window.open('', '_blank', 'noopener,noreferrer')
    if (!win) return
    win.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>${shareTitle}</title>
          <style>
            body { margin: 0; padding: 24px; font-family: Arial, sans-serif; text-align: center; }
            img { max-width: 100%; height: auto; }
            h1 { font-size: 18px; margin: 0 0 16px; }
          </style>
        </head>
        <body>
          <h1>${shareTitle}</h1>
          <img src="${cropUrl}" alt="${shareTitle}" onload="window.print(); window.close();" />
        </body>
      </html>
    `)
    win.document.close()
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.82)',
        zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
        backdropFilter: 'blur(4px)',
        animation: 'fadeIn 0.18s ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--surface)',
          borderRadius: 12,
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-lg)',
          maxWidth: 820,
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease',
        }}
      >
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 10,
          padding: '12px 18px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--surface2)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }} />
            <span style={{ fontSize: 15, fontWeight: 600 }}>{region.label}</span>
            {region.notes && (
              <span style={{ fontSize: 12, color: 'var(--text2)', marginLeft: 4 }}>- {region.notes}</span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap' }}>
              {shareLinks.map(item => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => shareImage(item)}
                  title={`Share image on ${item.name}`}
                  style={actionButtonStyle}
                  onMouseEnter={e => {
                    e.currentTarget.style.color = 'var(--accent)'
                    e.currentTarget.style.borderColor = 'rgba(232,160,32,0.45)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.color = 'var(--text2)'
                    e.currentTarget.style.borderColor = 'var(--border)'
                  }}
                >
                  {item.icon}
                </button>
              ))}
              <button
                onClick={nativeShare}
                title={navigator.share ? 'Share news' : 'Copy news link'}
                style={{
                  ...actionButtonStyle,
                  background: copied ? 'rgba(52,211,153,0.14)' : 'var(--surface)',
                  borderColor: copied ? 'rgba(52,211,153,0.5)' : 'var(--border)',
                  color: copied ? '#34d399' : 'var(--text2)',
                }}
              >
                {ACTION_ICONS.copy}
              </button>
              <a href={cropUrl} download={downloadName} title="Download news clipping" style={actionButtonStyle}>
                {ACTION_ICONS.download}
              </a>
              <button onClick={printClip} title="Print news clipping" style={actionButtonStyle}>
                {ACTION_ICONS.print}
              </button>
            </div>
            {region.link_url && (
              <a
                href={region.link_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: 12, color: 'var(--accent)', textDecoration: 'none',
                  background: 'rgba(232,160,32,0.1)', padding: '4px 10px',
                  borderRadius: 20, border: '1px solid rgba(232,160,32,0.3)',
                  display: 'flex', alignItems: 'center', gap: 4,
                }}
              >
                Visit link
              </a>
            )}
            <button
              onClick={onClose}
              style={{
                width: 28, height: 28, borderRadius: 6,
                background: 'var(--surface)', border: '1px solid var(--border)',
                color: 'var(--text2)', fontSize: 14,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
              }}
            >x</button>
          </div>
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          padding: '8px 16px',
          background: 'var(--header)',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}>
          <button onClick={zoomOut} disabled={zoom <= 0.5}
            style={{
              width: 30, height: 30, borderRadius: 6,
              background: 'var(--surface2)', border: '1px solid var(--border)',
              color: zoom > 0.5 ? 'var(--text)' : 'var(--text3)',
              fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: zoom > 0.5 ? 'pointer' : 'not-allowed',
            }}
          >-</button>

          <button onClick={zoomReset}
            style={{
              height: 30, padding: '0 12px', borderRadius: 6,
              background: 'var(--surface2)', border: '1px solid var(--border)',
              color: 'var(--text)', fontSize: 12, fontWeight: 500,
              minWidth: 56, textAlign: 'center',
            }}
          >{Math.round(zoom * 100)}%</button>

          <button onClick={zoomIn} disabled={zoom >= 4}
            style={{
              width: 30, height: 30, borderRadius: 6,
              background: 'var(--surface2)', border: '1px solid var(--border)',
              color: zoom < 4 ? 'var(--text)' : 'var(--text3)',
              fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: zoom < 4 ? 'pointer' : 'not-allowed',
            }}
          >+</button>

          <div style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 4px' }} />
          <span style={{ fontSize: 11, color: 'var(--text3)' }}>Scroll to zoom - Drag to pan</span>
        </div>

        <div
          ref={imgRef}
          onWheel={onWheel}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onTouchCancel={onTouchEnd}
          style={{
            flex: 1,
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#111',
            cursor: zoom > 1 ? (dragging ? 'grabbing' : 'grab') : 'default',
            minHeight: 200,
            position: 'relative',
            touchAction: zoom > 1 ? 'none' : 'pan-y',
          }}
        >
          <img
            src={cropUrl}
            alt={region.label}
            draggable={false}
            style={{
              maxWidth: '100%',
              maxHeight: '60vh',
              width: 'auto',
              height: 'auto',
              objectFit: 'contain',
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'center center',
              userSelect: 'none',
              display: 'block',
              transition: dragging ? 'none' : 'transform 0.12s ease',
            }}
          />
        </div>

        <div style={{
          padding: '8px 16px',
          background: 'var(--header)',
          borderTop: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'monospace' }}>
            {Math.round(region.w)} x {Math.round(region.h)} px
          </span>
          <span style={{ fontSize: 11, color: 'var(--text3)' }}>Press Esc to close</span>
        </div>
      </div>
    </div>
  )
}





