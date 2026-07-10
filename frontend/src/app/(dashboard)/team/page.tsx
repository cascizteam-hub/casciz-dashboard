import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Team' }
export default function TeamPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-surface-900">Team</h1>
        <p className="text-sm text-surface-500 mt-1">Manage team members and their permissions.</p>
      </div>
      <div className="card p-8 text-center text-surface-500 text-sm">
        Team management will be built in Milestone 3.
      </div>
    </div>
  )
}
