import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const { login, loading, error, token } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (token) navigate('/dashboard', { replace: true })
  }, [token, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const ok = await login(username, password)
    if (ok) navigate('/dashboard', { replace: true })
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: 'var(--accent)', display: 'inline-flex',
            alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 24, fontWeight: 700, marginBottom: 12,
          }}>E</div>
          <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>ePaper Admin</h1>
          <p style={{ fontSize: 13, color: 'var(--text2)' }}>Sign in to your account</p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: 28 }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 6, color: 'var(--text2)' }}>
                Username
              </label>
              <input
                className="input"
                type="text"
                autoComplete="username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="admin"
                required
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 6, color: 'var(--text2)' }}>
                Password
              </label>
              <input
                className="input"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div style={{
                background: 'var(--danger-bg)', border: '1px solid #f8b4b4',
                borderRadius: 'var(--radius)', padding: '8px 12px',
                fontSize: 12, color: 'var(--danger)', marginBottom: 16,
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '9px 14px' }}
              disabled={loading}
            >
              {loading ? <><span className="spinner" style={{ borderTopColor: '#fff', width: 14, height: 14 }} /> Signing in…</> : 'Sign in'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text3)', marginTop: 16 }}>
          Default: admin / admin123
        </p>
      </div>
    </div>
  )
}
