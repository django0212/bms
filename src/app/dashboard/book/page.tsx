import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { getFacilities } from '@/actions/facilities'
import BookingClient from './booking-client'

export default async function BookingPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  if (user.role !== 'STUDENT') {
    redirect('/dashboard')
  }

  if (!user.universityId) {
    redirect('/dashboard')
  }

  const facilities = await getFacilities(user.universityId)

  return <BookingClient facilities={facilities} userId={user.id} universityId={user.universityId} />
}
