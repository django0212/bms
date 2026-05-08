import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { BookingStatus } from '@prisma/client'
import { Role } from '@prisma/client'
import ScheduleClient from './schedule-client'

export default async function SchedulePage() {
  const user = await getCurrentUser()

  if (!user || !([Role.ADMIN] as Role[]).includes(user.role)) {
    redirect('/dashboard')
  }

  return <ScheduleClient universityId={user.universityId!} />
}
