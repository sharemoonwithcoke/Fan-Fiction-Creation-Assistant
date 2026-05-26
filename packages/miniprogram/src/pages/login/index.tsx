import { View, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { createApiClient } from '@fanfic/shared'
import { setTokens, getAccessToken } from '../../store/auth.js'

const API_BASE = 'https://api.your-domain.com/api/v1'

function buildClient() {
  return createApiClient({
    baseUrl: API_BASE,
    getToken: getAccessToken,
  })
}

export default function LoginPage() {
  async function handleWechatLogin() {
    try {
      const { code } = await Taro.login()
      const api = buildClient()
      const tokens = await api.auth.wechatLogin({ code })
      setTokens(tokens.access_token, tokens.refresh_token)
      Taro.switchTab({ url: '/pages/index/index' })
    } catch (err) {
      Taro.showToast({ title: '登录失败', icon: 'error' })
      console.error(err)
    }
  }

  return (
    <View className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-8">
      <Text className="text-2xl font-bold text-gray-900 mb-2">同人创作助手</Text>
      <Text className="text-gray-500 text-sm mb-12">使用微信账号登录</Text>
      <Button
        openType="getPhoneNumber"
        onClick={handleWechatLogin}
        className="w-full bg-green-500 text-white rounded-2xl py-4 text-base"
      >
        微信一键登录
      </Button>
    </View>
  )
}
