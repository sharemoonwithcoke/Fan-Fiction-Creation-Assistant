import Taro from '@tarojs/taro'

const ACCESS_TOKEN_KEY = 'fanfic_access_token'
const REFRESH_TOKEN_KEY = 'fanfic_refresh_token'

export function getAccessToken(): string | null {
  try {
    return Taro.getStorageSync(ACCESS_TOKEN_KEY) || null
  } catch {
    return null
  }
}

export function setTokens(accessToken: string, refreshToken: string) {
  Taro.setStorageSync(ACCESS_TOKEN_KEY, accessToken)
  Taro.setStorageSync(REFRESH_TOKEN_KEY, refreshToken)
}

export function clearTokens() {
  Taro.removeStorageSync(ACCESS_TOKEN_KEY)
  Taro.removeStorageSync(REFRESH_TOKEN_KEY)
}

export function getRefreshToken(): string | null {
  try {
    return Taro.getStorageSync(REFRESH_TOKEN_KEY) || null
  } catch {
    return null
  }
}
