import type { Metadata } from 'next'
import RegisterForm from '@/components/auth/RegisterForm'
import Link from 'next/link'
import { routes } from '@/config'

export const metadata: Metadata = {
  title: 'Create account',
}

export default function RegisterPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="space-y-1.5">
        <h2 className="font-display text-2xl font-bold text-surface-900">
          Create your account
        </h2>
        <p className="text-sm text-surface-500">
          Start building your store — free for 14 days.
        </p>
      </div>

      <RegisterForm />

      <p className="text-center text-sm text-surface-500">
        Already have an account?{' '}
        <Link
          href={routes.auth.login}
          className="font-medium text-primary-600 hover:text-primary-700 transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  )
}
