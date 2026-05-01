import { api } from './api'
import { asArray } from '../utils/safeArray'

export type MeResponse = {
  id: number
  name: string
  email: string
  roles: string[]
}

export async function getMe() {
  const { data } = await api.get<unknown>('/auth/me')
  if (!data || typeof data !== 'object' || data === null) {
    throw new Error('Invalid /auth/me response')
  }
  const o = data as Record<string, unknown>
  return {
    id: Number(o.id ?? 0),
    name: String(o.name ?? ''),
    email: String(o.email ?? ''),
    roles: asArray<string>(o.roles),
  } satisfies MeResponse
}

