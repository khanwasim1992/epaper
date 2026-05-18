import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { epaperApi } from '../utils/api'
import { AddEpaperModal } from '../components/ui/AddEpaperModal'
import { ConfirmModal } from '../components/ui/ConfirmModal'
import { useToast } from '../hooks/useToast'
import { ToastContainer } from '../components/ui/ToastContainer'

const STATUS_FILTERS = [
  { key: 'all',         label: 'All' },
  { key: 'published',   label: 'Published' },
  { key: 'unpublished', label: 'Unpublished' },
  { key: 'extracted',   label: 'Extracted' },
  { key: 'pending',     label: 'Pending extraction' },
]

function PublishToggle({ epaper, onToggle, loading }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: epaper.is_extracted ? 'pointer' : 'not-allowed', userSelect: 'none' }}
      title={!epaper.is_extracted ? 'Extract PDF first before publishing' : ''}>
      <div
        onClick={() => epaper.is_extracted && !loading && onToggle(epaper.id)}
        style={{
          width: 36, height: 20, borderRadius: 10, position: 'relative',
          background: epaper.is_published ? 'var(--success)' : 'var(--border2)',
          transition: 'background 0.2s',
          opacity: epaper.is_extracted ? 1 : 0.4,
        }}>
        <div style={{
          position: 'absolute', top: 2, left: epaper.is_published ? 18 : 2,
          width: 16, height: 16, borderRadius: '50%', background: '#fff',
          transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }} />
      </div>
      <span style={{ fontSize: 12, color: epaper.is_published ? 'var(--success)' : 'var(--text3)' }}>
        {epaper.is_published ? 'Published' : 'Draft'}
      </span>
    </label>
  )
}

export default function EpapersPage() {
  const [epapers, setEpapers] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionIds, setActionIds] = useState(new Set())
  const [showAdd, setShowAdd] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [searchParams, setSearchParams] = useSearchParams()
  const filter = searchParams.get('filter') || 'all'
  const { toasts, toast } = useToast()
  const navigate = useNavigate()

  const load = useCallback(async () => {
    try {
      const data = await epaperApi.list()
      setEpapers(data)
    } catch (e) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    if (searchParams.get('add') === '1') { setShowAdd(true); setSearchParams({}) }
  }, [])

  const setAction = (id, val) => setActionIds(prev => { const s = new Set(prev); val ? s.add(id) : s.delete(id); return s })

  const handleExtract = async (id) => {
    setAction(id, true)
    try {
      const updated = await epaperApi.extract(id)
      setEpapers(prev => prev.map(e => e.id === id ? updated : e))
      toast.success('PDF extracted successfully')
    } catch (e) {
      toast.error(e.message)
    } finally {
      setAction(id, false)
    }
  }

  const handlePublish = async (id) => {
    setAction(id, true)
    try {
      const updated = await epaperApi.publish(id)
      setEpapers(prev => prev.map(e => e.id === id ? updated : e))
      toast.success(updated.is_published ? 'ePaper published' : 'ePaper unpublished')
    } catch (e) {
      toast.error(e.message)
    } finally {
      setAction(id, false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await epaperApi.delete(deleteTarget)
      setEpapers(prev => prev.filter(e => e.id !== deleteTarget))
      toast.success('ePaper deleted')
    } catch (e) {
      toast.error(e.message)
    } finally {
      setDeleteTarget(null)
    }
  }

  const filtered = epapers.filter(e => {
    if (filter === 'published')   return e.is_published
    if (filter === 'unpublished') return !e.is_published
    if (filter === 'extracted')   return e.is_extracted
    if (filter === 'pending')     return !e.is_extracted
    return true
  })

  const fmt = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

  return (
    <div style={{ padding: 32 }}>
      <ToastContainer toasts={toasts} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 4 }}>ePapers</h1>
          <p style={{ fontSize: 13, color: 'var(--text2)' }}>{epapers.length} total ePapers</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Add new ePaper</button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 4, width: 'fit-content' }}>
        {STATUS_FILTERS.map(f => (
          <button
            key={f.key}
            className="btn btn-sm"
            style={{
              border: 'none',
              background: filter === f.key ? 'var(--accent)' : 'transparent',
              color: filter === f.key ? '#fff' : 'var(--text2)',
              borderRadius: 'var(--radius)',
            }}
            onClick={() => setSearchParams(filter === f.key ? {} : { filter: f.key })}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Edition date</th>
                <th>Pages</th>
                <th>Mappings</th>
                <th>Status</th>
                <th>Publish</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--text2)' }}>
                  <span className="spinner" style={{ marginRight: 8 }} />Loading…
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--text3)' }}>
                  No ePapers found{filter !== 'all' ? ` for filter "${filter}"` : ''}
                </td></tr>
              ) : filtered.map(ep => (
                <tr key={ep.id}>
                  {/* Title */}
                  <td>
                    <div style={{ fontWeight: 500, marginBottom: 2 }}>{ep.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>{ep.original_filename}</div>
                  </td>

                  {/* Edition date */}
                  <td style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>{ep.edition_date}</td>

                  {/* Pages */}
                  <td>
                    {ep.is_extracted
                      ? <span className="badge badge-info">{ep.page_count} pages</span>
                      : <span className="badge badge-gray">—</span>}
                  </td>

                  {/* Mappings */}
                  <td>
                    {ep.is_extracted
                      ? <span className="badge badge-info">{ep.mapping_count}</span>
                      : <span className="badge badge-gray">—</span>}
                  </td>

                  {/* Status */}
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {ep.is_extracted
                        ? <span className="badge badge-success">Extracted</span>
                        : <span className="badge badge-warn">Not extracted</span>}
                    </div>
                  </td>

                  {/* Publish toggle */}
                  <td>
                    <PublishToggle
                      epaper={ep}
                      onToggle={handlePublish}
                      loading={actionIds.has(ep.id)}
                    />
                  </td>

                  {/* Created */}
                  <td style={{ fontSize: 12, color: 'var(--text2)', whiteSpace: 'nowrap' }}>{fmt(ep.created_at)}</td>

                  {/* Actions */}
                  <td>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'nowrap' }}>
                      {/* Extract button — only when not extracted */}
                      {!ep.is_extracted && (
                        <button
                          className="btn btn-sm btn-warn"
                          disabled={actionIds.has(ep.id)}
                          onClick={() => handleExtract(ep.id)}
                        >
                          {actionIds.has(ep.id) ? <><span className="spinner" style={{ width: 12, height: 12 }} /> Extracting…</> : '⚙ Extract PDF'}
                        </button>
                      )}

                      {/* Mapping button — only when extracted */}
                      {ep.is_extracted && (
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => navigate(`/epapers/${ep.id}/map`)}
                        >
                          ◫ Map pages
                        </button>
                      )}

                      {/* Delete */}
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => setDeleteTarget(ep.id)}
                      >
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AddEpaperModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onCreated={(ep) => { setEpapers(prev => [ep, ...prev]); toast.success('ePaper uploaded!') }}
      />

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete ePaper"
        message="This will permanently delete the ePaper, all extracted pages, and all mappings. This cannot be undone."
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
