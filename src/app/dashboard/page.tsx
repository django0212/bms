import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { getAdminStats, getStudentStats } from '@/actions/dashboard-stats'
import { getSuperAdminStats } from '@/actions/super-admin'

import { getDashboardStats } from '@/actions/analytics'
import AnalyticsDashboard from '@/components/analytics-dashboard'
import SuperAdminDashboard from '@/components/super-admin-dashboard'
import { Role } from '@prisma/client'

import DashboardClient from './dashboard-client'

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  // If user is Admin or Super Admin, fetch analytics
  let analyticsData = null
  let superAdminStats = null
  let studentStats = null

  if (user.role === Role.ADMIN && user.universityId) {
      analyticsData = await getDashboardStats(user.universityId)
  } else if (user.role === Role.SUPER_ADMIN) {
      superAdminStats = await getSuperAdminStats()
  } else if (user.role === Role.STUDENT) {
      studentStats = await getStudentStats(user.id, user.universityId!)
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Dashboard</h1>
        <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-500">Welcome back,</span>
            <span className="font-medium text-zinc-900">{user.name}</span>
        </div>
      </div>

      {analyticsData && (
          <AnalyticsDashboard data={analyticsData} />
      )}

      {superAdminStats && (
          <SuperAdminDashboard data={superAdminStats} />
      )}
      
      {/* Fallback to existing client for students */}
      {studentStats && (
        <DashboardClient user={user} stats={studentStats} />
      )}
    </div>
  )
}
