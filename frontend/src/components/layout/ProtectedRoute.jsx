import React, { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

export function ProtectedRoute({ children }) {
  const { token, user, fetchMe } = useAuthStore()

  useEffect(() => {
    if (token && !user) fetchMe()
  }, [token, user, fetchMe])

  if (!token) return <Navigate to="/login" replace />
  return children
}
