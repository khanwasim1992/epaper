import { create } from 'zustand'
import { authApi } from '../utils/api'

export const useAuthStore = create((set, get) => ({
  token: localStorage.getItem('token') || null,
  user: null,
  loading: false,
  error: null,

  login: async (username, password) => {
    set({ loading: true, error: null })
    try {
      const data = await authApi.login(username, password)
      localStorage.setItem('token', data.access_token)
      set({ token: data.access_token, user: { username: data.username, role: data.role }, loading: false })
      return true
    } catch (e) {
      set({ error: e.message, loading: false })
      return false
    }
  },

  logout: () => {
    localStorage.removeItem('token')
    set({ token: null, user: null })
  },

  fetchMe: async () => {
    try {
      const data = await authApi.me()
      set({ user: data })
    } catch {
      get().logout()
    }
  },
}))
