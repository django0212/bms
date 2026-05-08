import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import FacilityForm from '../facility-form'

export default async function NewFacilityPage() {
  const user = await getCurrentUser()

  if (!user || user.role !== 'ADMIN' || !user.universityId) {
    redirect('/dashboard')
  }

  return <FacilityForm universityId={user.universityId} />
}
