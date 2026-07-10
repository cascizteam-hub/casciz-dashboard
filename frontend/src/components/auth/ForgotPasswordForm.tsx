'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, MailCheck } from 'lucide-react'
import { authApi } from '@/lib/api/auth.api'
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '@/lib/validators/schemas'
import { getErrorMessage } from '@/lib/utils'

export default function ForgotPasswordForm() {
  const [serverError, setServerError] = useState<string | null>(null)
  const [submitted, setSubmitted]     = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    setServerError(null)
    try {
      await authApi.forgotPassword({ email: values.email })
      setSubmitted(true)
    } catch (err) {
      setServerError(getErrorMessage(err))
    }
  }

  if (submitted) {
    return (
      <div className="rounded-xl bg-primary-50 border border-primary-200 p-6 text-center space-y-3">
        <MailCheck className="mx-auto h-10 w-10 text-primary-500" />
        <h3 className="font-semibold text-surface-900">Check your email</h3>
        <p className="text-sm text-surface-600">
          If an account exists for that address, a password reset link is on its way.
        </p>
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
        <label htmlFor="email" className="label">Email address</label>
        <input
          {...register('email')}
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          className={`input ${errors.email ? 'input-error' : ''}`}
        />
        {errors.email && <p className="error-text" role="alert">{errors.email.message}</p>}
      </div>

      <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
        {isSubmitting ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Sending reset link…</>
        ) : (
          'Send reset link'
        )}
      </button>
    </form>
  )
}
