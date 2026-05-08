import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { getPendingBookings, getAllBookings } from '@/actions/bookings'
import RequestsClient from './requests-client'

export default async function RequestsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  if (user.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  if (!user.universityId) {
    redirect('/dashboard')
  }

  const [pendingBookings, allBookings] = await Promise.all([
    getPendingBookings(user.universityId),
    getAllBookings(user.universityId)
  ])

  return <RequestsClient pendingBookings={pendingBookings} allBookings={allBookings} />
}
