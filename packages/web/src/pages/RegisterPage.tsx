import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { RegisterSchema, type RegisterInput } from '@fanfic/shared'
import { useAuthStore } from '../store/auth.js'
import { useApi } from '../hooks/useApi.js'
import Input from '../components/Input.js'
import Button from '../components/Button.js'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { setTokens } = useAuthStore()
  const api = useApi()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RegisterInput>({ resolver: zodResolver(RegisterSchema) })

  async function onSubmit(data: RegisterInput) {
    try {
      const tokens = await api.auth.register(data)
      setTokens(tokens.access_token, tokens.refresh_token)
      navigate('/')
    } catch {
      setError('root', { message: '注册失败，邮箱可能已被使用' })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">注册</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="昵称"
            placeholder="你的昵称"
            error={errors.nickname?.message}
            {...register('nickname')}
          />
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
            placeholder="至少 8 位"
            error={errors.password?.message}
            {...register('password')}
          />
          {errors.root && (
            <p className="text-sm text-red-500">{errors.root.message}</p>
          )}
          <Button type="submit" loading={isSubmitting} className="w-full">
            注册
          </Button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          已有账号？{' '}
          <Link to="/login" className="text-primary-600 hover:underline">
            登录
          </Link>
        </p>
      </div>
    </div>
  )
}
