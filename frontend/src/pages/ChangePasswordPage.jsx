import React, { useState } from 'react'
import { authApi } from '../utils/api'

export default function ChangePasswordPage() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match')
      return
    }

    setLoading(true)
    try {
      const data = await authApi.changePassword(newPassword, confirmPassword)
      setSuccess(data.message || 'Password changed successfully')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setError(err.message || 'Unable to change password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 32 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 4 }}>Change password</h1>
        <p style={{ fontSize: 13, color: 'var(--text2)' }}>Set a new password for the admin account</p>
      </div>

      <div className="card" style={{ padding: 24, maxWidth: 460 }}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 6, color: 'var(--text2)' }}>
              New password
            </label>
            <input
              className="input"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              minLength={6}
              required
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 6, color: 'var(--text2)' }}>
              Confirm password
            </label>
            <input
              className="input"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              minLength={6}
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

          {success && (
            <div style={{
              background: 'var(--success-bg)', border: '1px solid #bcf0da',
              borderRadius: 'var(--radius)', padding: '8px 12px',
              fontSize: 12, color: 'var(--success)', marginBottom: 16,
            }}>
              {success}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ justifyContent: 'center', minWidth: 140 }}
            disabled={loading}
          >
            {loading ? <><span className="spinner" style={{ borderTopColor: '#fff', width: 14, height: 14 }} /> Saving...</> : 'Save password'}
          </button>
        </form>
      </div>
    </div>
  )
}
