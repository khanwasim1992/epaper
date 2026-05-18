import React, { useState, useEffect } from 'react'
import { epaperApi } from '../../utils/api'
import { getColor } from '../../hooks/useMapCanvas'

export function MappingModal({ mapping, epaperId, pageNum, onClose, onSaved, onDeleted }) {
  const [label, setLabel]     = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [notes, setNotes]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)
  const isNew = !mapping?.id

  useEffect(() => {
    if (mapping) {
      setLabel(mapping.label || '')
      setLinkUrl(mapping.link_url || '')
      setNotes(mapping.notes || '')
    }
  }, [mapping])

  if (!mapping) return null

  const cropUrl = epaperId && !isNew
    ? epaperApi.cropUrl(epaperId, pageNum, Math.round(mapping.x), Math.round(mapping.y), Math.round(mapping.w), Math.round(mapping.h))
    : null

  const handleSave = async () => {
    if (!label.trim()) { setError('Label is required'); return }
    setLoading(true); setError(null)
    try {
      const payload = { label: label.trim(), link_url: linkUrl || null, notes: notes || null,
        x: mapping.x, y: mapping.y, w: mapping.w, h: mapping.h, color_idx: mapping.color_idx ?? 0 }
      let saved
      if (isNew) {
        saved = await epaperApi.createMapping(epaperId, pageNum, payload)
      } else {
        saved = await epaperApi.updateMapping(epaperId, pageNum, mapping.id, payload)
      }
      onSaved(saved, isNew)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (isNew) { onClose(); return }
    setLoading(true)
    try {
      await epaperApi.deleteMapping(epaperId, pageNum, mapping.id)
      onDeleted(mapping.id)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const col = getColor(mapping.color_idx ?? 0)

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
      zIndex: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }} onClick={onClose}>
      <div style={{
        background: 'var(--surface)', borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)',
        width: '100%', maxWidth: 460, overflow: 'hidden',
      }} onClick={e => e.stopPropagation()}>

        {/* Header strip */}
        <div style={{ height: 4, background: col }} />

        <div style={{ padding: '18px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600 }}>{isNew ? 'New mapping' : 'Edit mapping'}</h3>
            <button className="btn btn-icon" onClick={onClose}>✕</button>
          </div>

          {/* Crop preview */}
          {cropUrl && (
            <div style={{ marginBottom: 16, borderRadius: 'var(--radius)', overflow: 'hidden',
              border: '1px solid var(--border)', background: 'var(--surface2)',
              maxHeight: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={cropUrl} alt="Region" style={{ maxWidth: '100%', maxHeight: 160, objectFit: 'contain', display: 'block' }} />
            </div>
          )}

          {/* Coords */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 14,
            background: 'var(--surface2)', borderRadius: 'var(--radius)', padding: '8px 12px' }}>
            {[['x', mapping.x], ['y', mapping.y], ['width', mapping.w], ['height', mapping.h]].map(([k, v]) => (
              <div key={k} style={{ fontSize: 11 }}>
                <span style={{ color: 'var(--text3)', textTransform: 'uppercase', fontSize: 10 }}>{k}</span>
                <span style={{ fontFamily: 'var(--mono)', marginLeft: 6, color: 'var(--text2)' }}>{Math.round(v)}px</span>
              </div>
            ))}
          </div>

          {/* Label */}
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 5, color: 'var(--text2)' }}>
              Label <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <input className="input" type="text" value={label} onChange={e => setLabel(e.target.value)}
              placeholder="e.g. Advertisement, Article, Banner" autoFocus
              onKeyDown={e => e.key === 'Enter' && handleSave()} />
          </div>

          {/* Link URL */}
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 5, color: 'var(--text2)' }}>
              Link URL <span style={{ color: 'var(--text3)', fontWeight: 400 }}>(optional)</span>
            </label>
            <input className="input" type="url" value={linkUrl} onChange={e => setLinkUrl(e.target.value)}
              placeholder="https://example.com" />
          </div>

          {/* Notes */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 5, color: 'var(--text2)' }}>
              Notes <span style={{ color: 'var(--text3)', fontWeight: 400 }}>(optional)</span>
            </label>
            <textarea className="input" value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Any notes about this region…" rows={2}
              style={{ resize: 'vertical', fontFamily: 'var(--font)' }} />
          </div>

          {error && (
            <div style={{ background: 'var(--danger-bg)', border: '1px solid #f8b4b4',
              borderRadius: 'var(--radius)', padding: '7px 10px',
              fontSize: 12, color: 'var(--danger)', marginBottom: 14 }}>{error}</div>
          )}

          <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
            <div>
              {!isNew && (
                <button className="btn btn-sm btn-danger" onClick={handleDelete} disabled={loading}>
                  Delete
                </button>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-sm" onClick={onClose}>Cancel</button>
              <button className="btn btn-sm btn-primary" onClick={handleSave} disabled={loading}>
                {loading
                  ? <><span className="spinner" style={{ width: 12, height: 12, borderTopColor: '#fff' }} /> Saving…</>
                  : isNew ? 'Add mapping' : 'Save changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
