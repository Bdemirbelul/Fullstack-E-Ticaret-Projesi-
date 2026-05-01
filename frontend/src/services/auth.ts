import { api } from './api'
import { tokenStore } from './tokenStore'

export type AuthResponse = {
  accessToken: string
  refreshToken: string
  tokenType: string
  accessTokenExpiresInSeconds: number
}

export async function login(email: string, password: string) {
  const { data } = await api.post<AuthResponse>(
    '/auth/login',
    {
      email: email,
      password: password,
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )
  tokenStore.setTokens(data.accessToken, data.refreshToken)
  return data
}

export async function register(name: string, email: string, password: string) {
  const { data } = await api.post<AuthResponse>(
    '/auth/register',
    {
      name,
      email,
      password,
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )
  tokenStore.setTokens(data.accessToken, data.refreshToken)
  return data
}

export function logoutLocal() {
  tokenStore.clear()
}

