import axios from 'axios'

const http = axios.create({ baseURL: 'http://127.0.0.1:8000/api' })

export const publicApi = {
  getByDate: (date) =>
    http.get(`/epapers/public/by-date/${date}`).then(r => r.data),

  getAvailableDates: () =>
    http.get('/epapers/public/dates').then(r => r.data),

  pageImageUrl: (epaperId, pageNum) =>
    `http://127.0.0.1:8000/api/epapers/${epaperId}/pages/${pageNum}/image`,

  cropUrl: (epaperId, pageNum, x, y, w, h) =>
    `http://127.0.0.1:8000/api/epapers/${epaperId}/crop/${pageNum}?x=${Math.round(x)}&y=${Math.round(y)}&w=${Math.round(w)}&h=${Math.round(h)}`,

  pdfUrl: (epaperId) =>
    `/api/epapers/${epaperId}/pdf`,
}
