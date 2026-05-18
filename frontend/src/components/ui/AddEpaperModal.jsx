import React, { useState, useRef } from 'react'
import { epaperApi } from '../../utils/api'

export function AddEpaperModal({ open, onClose, onCreated }) {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef()

  const reset = () => { setTitle(''); setDate(new Date().toISOString().slice(0, 10)); setFile(null); setError(null) }
  const handleClose = () => { reset(); onClose() }

  const handleFile = (f) => {
    if (!f) return
    if (!f.name.toLowerCase().endsWith('.pdf')) { setError('Only PDF files are accepted'); return }
    setFile(f); setError(null)
    if (!title) setTitle(f.name.replace(/\.pdf$/i, ''))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) { setError('Please select a PDF file'); return }
    if (!title.trim()) { setError('Title is required'); return }
    setLoading(true); setError(null)
    try {
      const form = new FormData()
      form.append('title', title.trim())
      form.append('edition_date', date)
      form.append('file', file)
      const created = await epaperApi.upload(form)
      onCreated(created)
      handleClose()
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
      zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }} onClick={handleClose}>
      <div style={{
        background: 'var(--surface)', borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)',
        width: '100%', maxWidth: 480, padding: 28,
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600 }}>Add new ePaper</h2>
          <button className="btn btn-icon" onClick={handleClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 6, color: 'var(--text2)' }}>
              Title <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <input className="input" type="text" value={title} onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Mumbai Mirror – Monday Edition" required />
          </div>

          {/* Date */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 6, color: 'var(--text2)' }}>
              Edition date <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <input className="input" type="date" value={date} onChange={e => setDate(e.target.value)} required />
          </div>

          {/* PDF drop zone */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 6, color: 'var(--text2)' }}>
              PDF File <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <div
              style={{
                border: `2px dashed ${dragging ? 'var(--accent)' : file ? '#bcf0da' : 'var(--border2)'}`,
                borderRadius: 'var(--radius-lg)', padding: '20px 16px',
                textAlign: 'center', cursor: 'pointer',
                background: dragging ? 'var(--accent-bg)' : file ? 'var(--success-bg)' : 'var(--surface2)',
                transition: 'all 0.15s',
              }}
              onClick={() => inputRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }}
            >
              <input ref={inputRef} type="file" accept=".pdf" style={{ display: 'none' }}
                onChange={e => handleFile(e.target.files[0])} />
              {file ? (
                <>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>✓</div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--success)' }}>{file.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 24, marginBottom: 6, opacity: 0.3 }}>📄</div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>Drop PDF here or click to browse</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>Only .pdf files accepted</div>
                </>
              )}
            </div>
          </div>

          {error && (
            <div style={{
              background: 'var(--danger-bg)', border: '1px solid #f8b4b4',
              borderRadius: 'var(--radius)', padding: '8px 12px',
              fontSize: 12, color: 'var(--danger)', marginBottom: 16,
            }}>{error}</div>
          )}

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button type="button" className="btn" onClick={handleClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><span className="spinner" style={{ borderTopColor: '#fff', width: 13, height: 13 }} /> Uploading…</> : 'Upload ePaper'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
