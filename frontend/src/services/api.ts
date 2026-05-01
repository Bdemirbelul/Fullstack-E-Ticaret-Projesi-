import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { tokenStore } from './tokenStore'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
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

function requestUrl(config: InternalAxiosRequestConfig): string {
  const u = config.url ?? ''
  if (u.startsWith('http')) return u
  return u
}

function isPublicAuthRequest(url: string): boolean {
  return (
    url.includes('/auth/login') ||
    url.includes('/auth/register')
  )
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const url = requestUrl(config)
  if (isPublicAuthRequest(url)) {
    const h = config.headers
    if (h && typeof (h as { delete?: (k: string) => void }).delete === 'function') {
      ;(h as { delete: (k: string) => void }).delete('Authorization')
    } else if (h && typeof h === 'object') {
      delete (h as Record<string, unknown>).Authorization
    }
    return config
  }
  const token = tokenStore.getAccess()
  if (token) {
    setAuthHeader(config, token)
  }
  return config
})

let authRedirectScheduled = false

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status
    const cfg = error.config as InternalAxiosRequestConfig | undefined
    const url = cfg ? requestUrl(cfg) : ''

    if (status !== 401 && status !== 403) {
      return Promise.reject(error)
    }

    if (isPublicAuthRequest(url)) {
      return Promise.reject(error)
    }

    if (typeof window === 'undefined') {
      return Promise.reject(error)
    }

    const path = window.location.pathname
    if (path.startsWith('/login') || path.startsWith('/register')) {
      return Promise.reject(error)
    }

    if (authRedirectScheduled) {
      return Promise.reject(error)
    }
    authRedirectScheduled = true
    tokenStore.clear()

    const next = encodeURIComponent(path + window.location.search)
    window.location.replace(`/login?next=${next}`)

    return Promise.reject(error)
  },
)
