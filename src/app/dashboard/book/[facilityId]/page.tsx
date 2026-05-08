import { getFacilityById } from '@/actions/facilities'
import { getCurrentUser } from '@/lib/auth'
import { notFound, redirect } from 'next/navigation'
import BookingForm from './booking-form'

interface PageProps {
  params: Promise<{ facilityId: string }>
}

export default async function BookingPage({ params }: PageProps) {
  const { facilityId } = await params
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }

  const facility = await getFacilityById(facilityId)

  if (!facility) {
    notFound()
  }

  // Fetch blackout dates
  const { prisma } = await import('@/lib/db')
  const blackoutDates = await prisma.blackoutDate.findMany({
    where: { universityId: user.universityId! },
    select: { date: true, reason: true }
  })

  return (
    <div className="container mx-auto py-8">
      <BookingForm 
        facility={facility} 
        userId={user.id} 
        universityId={user.universityId!}
        blackoutDates={blackoutDates}
      />
    </div>
  )
}
