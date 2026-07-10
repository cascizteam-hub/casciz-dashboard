import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Settings' }
export default function SettingsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-surface-900">Settings</h1>
        <p className="text-sm text-surface-500 mt-1">Manage your account settings.</p>
      </div>
      <div className="card p-8 text-center text-surface-500 text-sm">
        Settings will be built in Milestone 3.
      </div>
    </div>
  )
}
