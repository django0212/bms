import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getGlobalUsers } from '@/actions/super-admin'
import { Role } from '@prisma/client'
import { GlobalUsersTable } from '@/components/dashboard/users/global-users-table'

export default async function GlobalUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; role?: string; university?: string }>
}) {
  const user = await getCurrentUser()

  if (!user || user.role !== Role.SUPER_ADMIN) {
    redirect('/dashboard')
  }

  const params = await searchParams
  const users = await getGlobalUsers({
    search: params.query,
    role: params.role as Role | 'ALL',
    universityId: params.university,
  })

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Global Users</h1>
          <p className="text-zinc-500">Manage all users across the platform.</p>
        </div>
      </div>

      <GlobalUsersTable users={users} />
    </div>
  )
}
