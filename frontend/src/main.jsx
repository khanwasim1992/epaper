import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { AppShell } from './components/layout/AppShell'
import LoginPage    from './pages/LoginPage'
import HomePage      from './pages/HomePage'
import DashboardPage from './pages/DashboardPage'
import ChangePasswordPage from './pages/ChangePasswordPage'
import EpapersPage  from './pages/EpapersPage'
import MapPage      from './pages/MapPage'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<LoginPage />} />
        <Route path="/login" element={<Navigate to="/admin" replace />} />
        <Route path="/" element={<HomePage />} />

        <Route path="/dashboard" element={
          <ProtectedRoute>
            <AppShell><DashboardPage /></AppShell>
          </ProtectedRoute>
        } />

        <Route path="/epapers" element={
          <ProtectedRoute>
            <AppShell><EpapersPage /></AppShell>
          </ProtectedRoute>
        } />

        <Route path="/change-password" element={
          <ProtectedRoute>
            <AppShell><ChangePasswordPage /></AppShell>
          </ProtectedRoute>
        } />

        {/* Map page has its own full-screen layout */}
        <Route path="/epapers/:id/map" element={
          <ProtectedRoute>
            <MapPage />
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
