import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'
import FacilityForm from '../../facility-form'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditFacilityPage({ params }: PageProps) {
  const user = await getCurrentUser()
  const { id } = await params

  if (!user || user.role !== 'ADMIN' || !user.universityId) {
    redirect('/dashboard')
  }

  const facility = await prisma.facility.findUnique({
    where: { id },
  })

  if (!facility || facility.universityId !== user.universityId) {
    redirect('/dashboard/facilities')
  }

  return <FacilityForm universityId={user.universityId} initialData={facility} isEditing />
}
