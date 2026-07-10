import type { Metadata } from 'next'
import LoginForm from '@/components/auth/LoginForm'
import Link from 'next/link'
import { routes } from '@/config'

export const metadata: Metadata = {
  title: 'Sign in',
}

export default function LoginPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Heading */}
      <div className="space-y-1.5">
        <h2 className="font-display text-2xl font-bold text-surface-900">
          Welcome back
        </h2>
        <p className="text-sm text-surface-500">
          Sign in to your Casciz account to continue.
        </p>
      </div>

      <LoginForm />

      {/* Links */}
      <p className="text-center text-sm text-surface-500">
        {"Don't have an account? "}
        <Link
          href={routes.auth.register}
          className="font-medium text-primary-600 hover:text-primary-700 transition-colors"
        >
          Create one for free
        </Link>
      </p>
    </div>
  )
}
