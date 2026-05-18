import React from 'react'

const SOCIAL = [
  {
    name: 'Facebook',
    url: 'https://facebook.com',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
      </svg>
    ),
  },
  {
    name: 'Twitter / X',
    url: 'https://twitter.com',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
  {
    name: 'Instagram',
    url: 'https://instagram.com',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
        <circle cx="12" cy="12" r="4"/>
        <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
      </svg>
    ),
  },
  {
    name: 'YouTube',
    url: 'https://youtube.com',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 001.46 6.42 29 29 0 001 12a29 29 0 00.46 5.58 2.78 2.78 0 001.95 1.95C5.12 20 12 20 12 20s6.88 0 8.59-.47a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58z"/>
        <polygon fill="white" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/>
      </svg>
    ),
  },
  {
    name: 'WhatsApp',
    url: 'https://wa.me',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.044L.786 23.267a.5.5 0 00.614.65l4.426-1.419A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.378 0-4.593-.737-6.426-1.993l-.32-.214-3.327 1.067 1.009-3.218-.228-.343A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
      </svg>
    ),
  },
  {
    name: 'Telegram',
    url: 'https://t.me',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
      </svg>
    ),
  },
]

function SocialBar() {
  return (
    <div style={{
      background: '#0a0a0a',
      borderBottom: '1px solid #1e1e1e',
      padding: '5px 20px',
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 8,
      }}>
        {/* Left: tagline */}
        <span style={{ fontSize: 11, color: '#555', letterSpacing: '0.04em' }}>
          Follow us on social media
        </span>

        {/* Right: social icons */}
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {SOCIAL.map(s => (
            <a
              key={s.name}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              title={s.name}
              style={{
                width: 28, height: 28,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 6,
                color: '#666',
                textDecoration: 'none',
                transition: 'all 0.15s',
                background: 'transparent',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color   = 'var(--accent)'
                e.currentTarget.style.background = 'rgba(232,160,32,0.08)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color   = '#666'
                e.currentTarget.style.background = 'transparent'
              }}
            >
              {s.icon}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

export function Header({
  date, onDateChange,
  epaper,
  onPrevDate, onNextDate, hasPrev, hasNext,
}) {
  const fmt = (d) => {
    if (!d) return ''
    const [y, m, day] = d.split('-')
    return new Date(Number(y), Number(m) - 1, Number(day)).toLocaleDateString('en-IN', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    })
  }

  const handlePdfOpen = () => {
    if (!epaper?.pdf_url) return
    window.open(epaper.pdf_url, '_blank', 'noopener,noreferrer')
  }

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 100 }}>
      {/* Social bar */}
      <SocialBar />

      {/* Accent strip */}
      <div style={{
        background: 'linear-gradient(90deg, var(--accent) 0%, #f0b840 100%)',
        padding: '3px 0', textAlign: 'center',
        fontSize: 10, fontWeight: 700,
        letterSpacing: '0.15em', color: '#000',
        textTransform: 'uppercase',
      }}>
        ◆ Daily ePaper Edition ◆
      </div>

      {/* Main header bar */}
      <div style={{
        background: 'var(--header)',
        borderBottom: '1px solid #2a2a2a',
        boxShadow: '0 2px 12px rgba(0,0,0,0.5)',
      }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto',
          padding: '10px 20px',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16, flexWrap: 'wrap',
        }}>

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 10,
              background: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, fontWeight: 800, color: '#000', flexShrink: 0,
            }}>E</div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', lineHeight: 1.1 }}>
                ePaper
              </div>
              <div style={{ fontSize: 11, color: 'var(--text3)', letterSpacing: '0.03em' }}>
                {epaper ? epaper.title : 'Daily Digital Edition'}
              </div>
            </div>
          </div>

          {/* Date controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>

            {/* Edition label */}
            <span style={{ fontSize: 11, color: 'var(--text3)', marginRight: 4 }}>
              {fmt(date)}
            </span>

            {/* ← Previous (older) edition */}
            <button
              onClick={onPrevDate}
              disabled={!hasPrev}
              title="Previous edition"
              style={{
                width: 32, height: 32, borderRadius: 6,
                background: hasPrev ? 'var(--surface2)' : 'transparent',
                border: `1px solid ${hasPrev ? 'var(--border)' : '#2a2a2a'}`,
                color: hasPrev ? 'var(--text)' : 'var(--text3)',
                fontSize: 16,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: hasPrev ? 'pointer' : 'not-allowed',
                transition: 'all 0.15s',
              }}
            >‹</button>

            {/* Date input */}
            <input
              type="date"
              value={date}
              max={new Date().toISOString().slice(0, 10)}
              onChange={e => e.target.value && onDateChange(e.target.value)}
              style={{ height: 32 }}
            />

            {/* → Next (newer) edition */}
            <button
              onClick={onNextDate}
              disabled={!hasNext}
              title="Next edition"
              style={{
                width: 32, height: 32, borderRadius: 6,
                background: hasNext ? 'var(--surface2)' : 'transparent',
                border: `1px solid ${hasNext ? 'var(--border)' : '#2a2a2a'}`,
                color: hasNext ? 'var(--text)' : 'var(--text3)',
                fontSize: 16,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: hasNext ? 'pointer' : 'not-allowed',
                transition: 'all 0.15s',
              }}
            >›</button>

            {/* PDF download button */}
            {epaper?.pdf_url && (
              <button
                onClick={handlePdfOpen}
                title="Open / download PDF"
                style={{
                  height: 32, padding: '0 14px',
                  borderRadius: 6,
                  background: 'var(--accent)',
                  border: 'none',
                  color: '#000',
                  fontSize: 12, fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: 6,
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                  whiteSpace: 'nowrap',
                  marginLeft: 4,
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent2)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent)')}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                PDF
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
