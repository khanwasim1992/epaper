import React from 'react'

const icons = {
  success: '✓',
  error: '✕',
  warn: '⚠',
  info: 'ℹ',
}

const colors = {
  success: { bg: '#def7ec', border: '#bcf0da', color: '#057a55' },
  error:   { bg: '#fde8e8', border: '#f8b4b4', color: '#c81e1e' },
  warn:    { bg: '#fef3c7', border: '#fcd34d', color: '#92400e' },
  info:    { bg: '#eff4ff', border: '#c3ddfd', color: '#1e429f' },
}

export function ToastContainer({ toasts }) {
  if (!toasts.length) return null
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 360 }}>
      {toasts.map(t => {
        const c = colors[t.type] || colors.info
        return (
          <div key={t.id} style={{
            display: 'flex', alignItems: 'flex-start', gap: 10,
            background: c.bg, border: `1px solid ${c.border}`,
            borderRadius: 8, padding: '10px 14px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.10)',
            animation: 'slideIn 0.2s ease',
            fontSize: 13, color: c.color, fontFamily: 'var(--font)',
          }}>
            <span style={{ fontWeight: 600, fontSize: 14, flexShrink: 0 }}>{icons[t.type]}</span>
            <span style={{ lineHeight: 1.5 }}>{t.message}</span>
          </div>
        )
      })}
      <style>{`@keyframes slideIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  )
}
