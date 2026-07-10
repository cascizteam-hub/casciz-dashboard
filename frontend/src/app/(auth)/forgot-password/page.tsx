import type { Metadata } from 'next'
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm'
import Link from 'next/link'
import { routes } from '@/config'

export const metadata: Metadata = {
  title: 'Reset password',
}

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="space-y-1.5">
        <h2 className="font-display text-2xl font-bold text-surface-900">
          Reset your password
        </h2>
        <p className="text-sm text-surface-500">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      <ForgotPasswordForm />

      <p className="text-center text-sm text-surface-500">
        <Link
          href={routes.auth.login}
          className="font-medium text-primary-600 hover:text-primary-700 transition-colors"
        >
          ← Back to sign in
        </Link>
      </p>
    </div>
  )
}
