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
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--paper-oat)', backgroundImage: 'var(--grain)', backgroundAttachment: 'fixed' }}>
      <div className="card w-full" style={{ maxWidth: 380, padding: '40px 36px' }}>
        <p className="eyebrow mb-2">同人创作助手</p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-2xl)', fontWeight: 600, marginBottom: 28 }}>
          欢迎回来
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input label="邮箱" type="email" placeholder="your@email.com" error={errors.email?.message} {...register('email')} />
          <Input label="密码" type="password" placeholder="••••••••" error={errors.password?.message} {...register('password')} />
          {errors.root && (
            <p className="field-help is-error">{errors.root.message}</p>
          )}
          <Button type="submit" loading={isSubmitting} block style={{ marginTop: 4 }}>
            登录
          </Button>
        </form>

        <p className="text-center mt-5" style={{ fontSize: 'var(--fs-sm)', color: 'var(--fg-3)' }}>
          还没有账号？{' '}
          <Link to="/register">注册</Link>
        </p>
      </div>
    </div>
  )
}
