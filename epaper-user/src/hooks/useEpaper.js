import { useState, useEffect, useCallback } from 'react'
import { publicApi } from '../utils/api'

function todayISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function useEpaper() {
  const [date, setDate]                 = useState(todayISO)
  const [epaper, setEpaper]             = useState(null)
  const [notFound, setNotFound]         = useState(false)
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState(null)
  const [availableDates, setAvailableDates] = useState([])  // sorted newest → oldest

  // Load available dates once on mount
  useEffect(() => {
    publicApi.getAvailableDates()
      .then(dates => {
        // Ensure sorted newest-first  ["2024-12-31", "2024-12-30", ...]
        const sorted = [...dates].sort((a, b) => b.localeCompare(a))
        setAvailableDates(sorted)
      })
      .catch(() => {})
  }, [])

  const load = useCallback(async (d) => {
    setLoading(true)
    setError(null)
    setNotFound(false)
    setEpaper(null)
    try {
      const data = await publicApi.getByDate(d)
      if (!data) setNotFound(true)
      else       setEpaper(data)
    } catch (e) {
      setError(e.message || 'Failed to load ePaper')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(date) }, [date, load])

  const changeDate = (newDate) => setDate(newDate)

  // availableDates is newest-first → index 0 = newest, last index = oldest
  // "prev" means an OLDER edition  → higher index
  // "next" means a NEWER edition   → lower index
  const currentIdx = availableDates.indexOf(date)

  const goToPrevDate = () => {
    // go to an older edition (next higher index in the array)
    if (currentIdx === -1) {
      // current date not in list — find the nearest older available date
      const older = availableDates.find(d => d < date)
      if (older) setDate(older)
    } else if (currentIdx < availableDates.length - 1) {
      setDate(availableDates[currentIdx + 1])
    }
  }

  const goToNextDate = () => {
    // go to a newer edition (next lower index in the array)
    if (currentIdx === -1) {
      // current date not in list — find the nearest newer available date
      const newer = [...availableDates].reverse().find(d => d > date)
      if (newer) setDate(newer)
    } else if (currentIdx > 0) {
      setDate(availableDates[currentIdx - 1])
    }
  }

  // hasPrev = there is an older edition available
  const hasPrev = availableDates.length > 0 && (
    currentIdx === -1
      ? availableDates.some(d => d < date)
      : currentIdx < availableDates.length - 1
  )

  // hasNext = there is a newer edition available
  const hasNext = availableDates.length > 0 && (
    currentIdx === -1
      ? availableDates.some(d => d > date)
      : currentIdx > 0
  )

  return {
    date, changeDate,
    epaper, loading, notFound, error,
    availableDates,
    goToPrevDate, goToNextDate, hasPrev, hasNext,
  }
}
