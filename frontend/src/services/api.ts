import axios, { type InternalAxiosRequestConfig } from 'axios'
import { tokenStore } from './tokenStore'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080',
})

function setAuthHeader(config: InternalAxiosRequestConfig, token: string) {
  const bearer = `Bearer ${token}`
  const h = config.headers
  if (h && typeof (h as { set?: (k: string, v: string) => void }).set === 'function') {
    ;(h as { set: (k: string, v: string) => void }).set('Authorization', bearer)
  } else {
    config.headers = config.headers ?? {}
    ;(config.headers as Record<string, string>)['Authorization'] = bearer
  }
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStore.getAccess()
  if (token) {
    setAuthHeader(config, token)
  }
  return config
})
