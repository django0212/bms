import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { getFacilities } from '@/actions/facilities'
import FacilitiesClient from './facilities-client'

export default async function FacilitiesPage() {
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

  const facilities = await getFacilities(user.universityId)

  return <FacilitiesClient facilities={facilities} universityId={user.universityId} />
}
