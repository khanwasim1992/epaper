import axios from 'axios'

const http = axios.create({ baseURL: '/api' })

export const publicApi = {
  getByDate: (date) =>
    http.get(`/epapers/public/by-date/${date}`).then(r => r.data),

  getAvailableDates: () =>
    http.get('/epapers/public/dates').then(r => r.data),

  pageImageUrl: (epaperId, pageNum) =>
    `/api/epapers/${epaperId}/pages/${pageNum}/image`,

  cropUrl: (epaperId, pageNum, x, y, w, h) =>
    `/api/epapers/${epaperId}/crop/${pageNum}/${Math.round(x)}-${Math.round(y)}-${Math.round(w)}-${Math.round(h)}`,

  pdfUrl: (epaperId) =>
    `/api/epapers/${epaperId}/pdf`,
}
