'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react'
import { authApi } from '@/lib/api/auth.api'
import { registerSchema, type RegisterFormValues } from '@/lib/validators/schemas'
import { getErrorMessage } from '@/lib/utils'
import { routes } from '@/config'

export default function RegisterForm() {
  const router = useRouter()
  const [showPassword, setShowPassword]           = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [serverError, setServerError]             = useState<string | null>(null)
  const [success, setSuccess]                     = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (values: RegisterFormValues) => {
    setServerError(null)
    try {
      await authApi.register({
        firstName: values.firstName,
        lastName:  values.lastName,
        email:     values.email,
        password:  values.password,
      })
      setSuccess(true)
    } catch (err) {
      setServerError(getErrorMessage(err))
    }
  }

  if (success) {
    return (
      <div className="rounded-xl bg-green-50 border border-green-200 p-6 text-center space-y-3">
        <CheckCircle2 className="mx-auto h-10 w-10 text-green-500" />
        <h3 className="font-semibold text-surface-900">Check your inbox</h3>
        <p className="text-sm text-surface-600">
          We&apos;ve sent a verification link to your email address.
          Click it to activate your account.
        </p>
        <button
          type="button"
          onClick={() => router.push(routes.auth.login)}
          className="btn-primary mt-2"
        >
          Go to sign in
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

      {/* Name row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="label">First name</label>
          <input
            {...register('firstName')}
            id="firstName"
            type="text"
            autoComplete="given-name"
            placeholder="Jane"
            className={`input ${errors.firstName ? 'input-error' : ''}`}
          />
          {errors.firstName && <p className="error-text" role="alert">{errors.firstName.message}</p>}
        </div>

        <div>
          <label htmlFor="lastName" className="label">Last name</label>
          <input
            {...register('lastName')}
            id="lastName"
            type="text"
            autoComplete="family-name"
            placeholder="Doe"
            className={`input ${errors.lastName ? 'input-error' : ''}`}
          />
          {errors.lastName && <p className="error-text" role="alert">{errors.lastName.message}</p>}
        </div>
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="label">Work email</label>
        <input
          {...register('email')}
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          className={`input ${errors.email ? 'input-error' : ''}`}
        />
        {errors.email && <p className="error-text" role="alert">{errors.email.message}</p>}
      </div>

      {/* Password */}
      <div>
        <label htmlFor="password" className="label">Password</label>
        <div className="relative">
          <input
            {...register('password')}
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="Min. 8 characters"
            className={`input pr-10 ${errors.password ? 'input-error' : ''}`}
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
        {errors.password && <p className="error-text" role="alert">{errors.password.message}</p>}
      </div>

      {/* Confirm password */}
      <div>
        <label htmlFor="confirmPassword" className="label">Confirm password</label>
        <div className="relative">
          <input
            {...register('confirmPassword')}
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="Repeat your password"
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

      <p className="text-xs text-surface-500">
        By creating an account you agree to our{' '}
        <a href="#" className="underline hover:text-primary-600">Terms of Service</a> and{' '}
        <a href="#" className="underline hover:text-primary-600">Privacy Policy</a>.
      </p>

      <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
        {isSubmitting ? (
          <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Creating account…</>
        ) : (
          'Create account'
        )}
      </button>
    </form>
  )
}
