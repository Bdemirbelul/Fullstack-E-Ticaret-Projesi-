import { api } from './api'

export type MeResponse = {
  id: number
  name: string
  email: string
  roles: string[]
}

export async function getMe() {
  const { data } = await api.get<MeResponse>('/auth/me')
  return data
}

