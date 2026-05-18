import React from 'react'
import { Header } from './components/Header'
import { EpaperSlider } from './components/EpaperSlider'
import { useEpaper } from './hooks/useEpaper'

function Spinner() {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, minHeight: 400 }}>
      <div style={{ width: 40, height: 40, border: '3px solid #2a2a2a', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <span style={{ fontSize: 13, color: 'var(--text2)' }}>Loading edition…</span>
    </div>
  )
}

function NotFound({ date }) {
  const fmt = (d) => {
    if (!d) return d
    const [y, m, day] = d.split('-')
    return new Date(Number(y), Number(m) - 1, Number(day)).toLocaleDateString('en-IN', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    })
  }
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: 48 }}>
      <div style={{ fontSize: 52 }}>📰</div>
      <h2 style={{ fontSize: 18, fontWeight: 600 }}>No edition available</h2>
      <p style={{ fontSize: 13, color: 'var(--text2)', textAlign: 'center', maxWidth: 340, lineHeight: 1.8 }}>
        There is no published ePaper for<br />
        <strong style={{ color: 'var(--accent)' }}>{fmt(date)}</strong>
      </p>
      <div style={{
        marginTop: 6, background: 'var(--surface2)',
        border: '1px solid var(--border)', borderRadius: 8,
        padding: '10px 18px', fontSize: 12, color: 'var(--text3)',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span style={{ color: 'var(--accent)', fontSize: 14 }}>ℹ</span>
        Use the date picker or ‹ › arrows to browse available editions
      </div>
    </div>
  )
}

function ErrorState({ message }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 48 }}>
      <div style={{ fontSize: 40 }}>⚠️</div>
      <h2 style={{ fontSize: 16, fontWeight: 600, color: '#f87171' }}>Failed to load</h2>
      <p style={{ fontSize: 13, color: 'var(--text2)', maxWidth: 340, textAlign: 'center' }}>{message}</p>
    </div>
  )
}

export default function App() {
  const {
    date, changeDate, epaper, loading, notFound, error,
    availableDates, goToPrevDate, goToNextDate, hasPrev, hasNext,
  } = useEpaper()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header
        date={date}
        onDateChange={changeDate}
        epaper={epaper}
        onPrevDate={goToPrevDate}
        onNextDate={goToNextDate}
        hasPrev={hasPrev}
        hasNext={hasNext}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {loading              && <Spinner />}
        {!loading && error    && <ErrorState message={error} />}
        {!loading && notFound && <NotFound date={date} />}
        {!loading && epaper   && <EpaperSlider key={epaper.id} epaper={epaper} />}
      </div>

      <footer style={{
        background: 'var(--header)', borderTop: '1px solid #2a2a2a',
        padding: '10px 20px', textAlign: 'center',
        fontSize: 11, color: 'var(--text3)',
      }}>
        © {new Date().getFullYear()} ePaper · All rights reserved
      </footer>
    </div>
  )
}
