import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { LoginSchema, type LoginInput } from '@fanfic/shared'
import { useAuthStore } from '../store/auth.js'
import { useApi } from '../hooks/useApi.js'
import Input from '../components/Input.js'
import Button from '../components/Button.js'

export default function LoginPage() {
  const navigate = useNavigate()
  const { setTokens } = useAuthStore()
  const api = useApi()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginInput>({ resolver: zodResolver(LoginSchema) })

  async function onSubmit(data: LoginInput) {
    try {
      const tokens = await api.auth.login(data)
      setTokens(tokens.access_token, tokens.refresh_token)
      navigate('/')
    } catch {
      setError('root', { message: '邮箱或密码错误' })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">登录</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="邮箱"
            type="email"
            placeholder="your@email.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="密码"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />
          {errors.root && (
            <p className="text-sm text-red-500">{errors.root.message}</p>
          )}
          <Button type="submit" loading={isSubmitting} className="w-full">
            登录
          </Button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          没有账号？{' '}
          <Link to="/register" className="text-primary-600 hover:underline">
            注册
          </Link>
        </p>
      </div>
    </div>
  )
}
