'use client'

import { use, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react'
import { authApi } from '@/lib/api/auth.api'
import { resetPasswordSchema, type ResetPasswordFormValues } from '@/lib/validators/schemas'
import { getErrorMessage } from '@/lib/utils'
import { routes } from '@/config'

interface Props {
  searchParams: Promise<{ token?: string }>
}

export default function ResetPasswordForm({ searchParams }: Props) {
  const resolvedParams = use(searchParams)
  const token          = resolvedParams.token ?? ''
  const router         = useRouter()

  const [showPassword, setShowPassword]             = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [serverError, setServerError]               = useState<string | null>(null)
  const [success, setSuccess]                       = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  })

  if (!token) {
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
        This reset link is invalid. Please request a new one.
      </div>
    )
  }

  const onSubmit = async (values: ResetPasswordFormValues) => {
    setServerError(null)
    try {
      await authApi.resetPassword({ token, newPassword: values.newPassword })
      setSuccess(true)
    } catch (err) {
      setServerError(getErrorMessage(err))
    }
  }

  if (success) {
    return (
      <div className="rounded-xl bg-green-50 border border-green-200 p-6 text-center space-y-3">
        <CheckCircle2 className="mx-auto h-10 w-10 text-green-500" />
        <h3 className="font-semibold text-surface-900">Password updated</h3>
        <p className="text-sm text-surface-600">
          Your password has been changed. You can now sign in.
        </p>
        <button
          type="button"
          onClick={() => router.push(routes.auth.login)}
          className="btn-primary"
        >
          Sign in
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {serverError && (
        <div role="alert" className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {serverError}
        </div>
      )}

      <div>
        <label htmlFor="newPassword" className="label">New password</label>
        <div className="relative">
          <input
            {...register('newPassword')}
            id="newPassword"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            className={`input pr-10 ${errors.newPassword ? 'input-error' : ''}`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.newPassword && <p className="error-text" role="alert">{errors.newPassword.message}</p>}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="label">Confirm new password</label>
        <div className="relative">
          <input
            {...register('confirmPassword')}
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            autoComplete="new-password"
            className={`input pr-10 ${errors.confirmPassword ? 'input-error' : ''}`}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 transition-colors"
            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="error-text" role="alert">{errors.confirmPassword.message}</p>
        )}
      </div>

      <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
        {isSubmitting ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Updating password…</>
        ) : (
          'Set new password'
        )}
      </button>
    </form>
  )
}
