import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getGlobalBookings } from '@/actions/super-admin'
import { Role } from '@prisma/client'
import { GlobalBookingsTable } from '@/components/dashboard/bookings/global-bookings-table'

export default async function GlobalBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; status?: string; university?: string; type?: string; date?: string }>
}) {
  const user = await getCurrentUser()

  if (!user || user.role !== Role.SUPER_ADMIN) {
    redirect('/dashboard')
  }

  const params = await searchParams
  const bookings = await getGlobalBookings({
    search: params.query,
    status: params.status,
    universityId: params.university,
    facilityType: params.type,
    date: params.date ? new Date(params.date) : undefined,
  })

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Global Bookings</h1>
          <p className="text-zinc-500">View and manage all bookings.</p>
        </div>
      </div>

      <GlobalBookingsTable bookings={bookings} />
    </div>
  )
}
