import type { Metadata } from 'next'
import ResetPasswordForm from '@/components/auth/ResetPasswordForm'

export const metadata: Metadata = {
  title: 'Set new password',
}

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="space-y-1.5">
        <h2 className="font-display text-2xl font-bold text-surface-900">
          Set a new password
        </h2>
        <p className="text-sm text-surface-500">
          Your new password must be at least 8 characters and include
          uppercase, lowercase, and a number.
        </p>
      </div>

      <ResetPasswordForm searchParams={searchParams} />
    </div>
  )
}
