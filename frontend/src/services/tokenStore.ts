const ACCESS_KEY = 'accessToken'
const ACCESS_KEY_ALT = 'token'
const REFRESH_KEY = 'refreshToken'

/** Tüm istemciler aynı token kaynağını kullanır (accessToken veya legacy token). */
export const tokenStore = {
  getAccess() {
    return localStorage.getItem(ACCESS_KEY) || localStorage.getItem(ACCESS_KEY_ALT)
  },
  getRefresh() {
    return localStorage.getItem(REFRESH_KEY)
  },
  setTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem(ACCESS_KEY, accessToken)
    localStorage.setItem(ACCESS_KEY_ALT, accessToken)
    localStorage.setItem(REFRESH_KEY, refreshToken)
  },
  clear() {
    localStorage.removeItem(ACCESS_KEY)
    localStorage.removeItem(ACCESS_KEY_ALT)
    localStorage.removeItem(REFRESH_KEY)
  },
}

