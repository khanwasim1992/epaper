import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { epaperApi } from '../utils/api'

function StatCard({ label, value, sub, color, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', padding: '20px 24px',
        boxShadow: 'var(--shadow)', cursor: onClick ? 'pointer' : 'default',
        transition: 'box-shadow 0.12s',
        borderTop: `3px solid ${color}`,
      }}
      onMouseEnter={e => onClick && (e.currentTarget.style.boxShadow = 'var(--shadow-md)')}
      onMouseLeave={e => onClick && (e.currentTarget.style.boxShadow = 'var(--shadow)')}
    >
      <div style={{ fontSize: 28, fontWeight: 600, color, marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--text3)' }}>{sub}</div>}
    </div>
  )
}

export default function DashboardPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const load = async () => {
    try {
      const data = await epaperApi.dashboard()
      setStats(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // Poll every 15s for real-time feel
    const t = setInterval(load, 15000)
    return () => clearInterval(t)
  }, [])

  return (
    <div style={{ padding: 32 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 4 }}>Dashboard</h1>
          <p style={{ fontSize: 13, color: 'var(--text2)' }}>Overview of your ePaper publications</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => navigate('/epapers?add=1')}
        >
          + Add new ePaper
        </button>
      </div>

      {/* Stats grid */}
      {loading ? (
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', color: 'var(--text2)', fontSize: 13 }}>
          <span className="spinner" /> Loading stats…
        </div>
      ) : stats ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
          <StatCard label="Total ePapers"      value={stats.total}              color="#1a56db" sub="All time"             onClick={() => navigate('/epapers')} />
          <StatCard label="Published"          value={stats.published}          color="#057a55" sub="Live & visible"       onClick={() => navigate('/epapers?filter=published')} />
          <StatCard label="Unpublished"        value={stats.unpublished}        color="#92400e" sub="Not yet live"         onClick={() => navigate('/epapers?filter=unpublished')} />
          <StatCard label="Extracted"          value={stats.extracted}          color="#5521b5" sub="Pages ready"          onClick={() => navigate('/epapers?filter=extracted')} />
          <StatCard label="Pending Extraction" value={stats.pending_extraction} color="#c81e1e" sub="Action required"      onClick={() => navigate('/epapers?filter=pending')} />
        </div>
      ) : null}

      {/* Quick actions */}
      <div className="card" style={{ padding: 20 }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Quick actions</h2>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn" onClick={() => navigate('/epapers?add=1')}>+ Upload new ePaper</button>
          <button className="btn" onClick={() => navigate('/epapers?filter=pending')}>Extract pending PDFs</button>
          <button className="btn" onClick={() => navigate('/epapers?filter=unpublished')}>Review unpublished</button>
        </div>
      </div>
    </div>
  )
}
