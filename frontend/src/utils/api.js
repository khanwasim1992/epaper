import axios from 'axios'

const http = axios.create({ baseURL: 'http://127.0.0.1:8000/api' })

// Attach token
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 globally
http.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    const msg = err.response?.data?.detail || err.message || 'Request failed'
    return Promise.reject(new Error(typeof msg === 'string' ? msg : JSON.stringify(msg)))
  }
)

export const authApi = {
  login: (username, password) => {
    const form = new URLSearchParams()
    form.append('username', username)
    form.append('password', password)
    return http.post('/auth/login', form, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
      .then(r => r.data)
  },
  me: () => http.get('/auth/me').then(r => r.data),
}

export const epaperApi = {
  dashboard:   ()              => http.get('/epapers/dashboard').then(r => r.data),
  list:        ()              => http.get('/epapers').then(r => r.data),
  get:         (id)            => http.get(`/epapers/${id}`).then(r => r.data),
  upload:      (form)          => http.post('/epapers', form, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data),
  delete:      (id)            => http.delete(`/epapers/${id}`).then(r => r.data),
  extract:     (id)            => http.post(`/epapers/${id}/extract`).then(r => r.data),
  publish:     (id)            => http.patch(`/epapers/${id}/publish`).then(r => r.data),

  pages:       (id)            => http.get(`/epapers/${id}/pages`).then(r => r.data),
  pageImageUrl:(id, pageNum)   => {
    const token = localStorage.getItem('token')
    return `http://127.0.0.1:8000/api/epapers/${id}/pages/${pageNum}/image${token ? '?token=' + token : ''}`
  },
  cropUrl:(id, pn, x, y, w, h) => {
    const token = localStorage.getItem('token')
    return `http://127.0.0.1:8000/api/epapers/${id}/crop/${pn}?x=${x}&y=${y}&w=${w}&h=${h}${token ? '&token=' + token : ''}`
  },

  getMappings: (id, pn)        => http.get(`/epapers/${id}/pages/${pn}/mappings`).then(r => r.data),
  createMapping: (id, pn, d)   => http.post(`/epapers/${id}/pages/${pn}/mappings`, d).then(r => r.data),
  updateMapping: (id, pn, mid, d) => http.patch(`/epapers/${id}/pages/${pn}/mappings/${mid}`, d).then(r => r.data),
  deleteMapping: (id, pn, mid) => http.delete(`/epapers/${id}/pages/${pn}/mappings/${mid}`).then(r => r.data),
}
