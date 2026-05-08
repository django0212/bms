import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'
import SettingsClient from './settings-client'
import { Role } from '@prisma/client'

export default async function SettingsPage() {
  const user = await getCurrentUser()
  if (!user || user.role !== Role.ADMIN) {
    redirect('/dashboard')
  }

  const blackoutDates = await prisma.blackoutDate.findMany({
    where: { universityId: user.universityId! },
    orderBy: { date: 'asc' },
  })

  return (
    <SettingsClient 
        universityId={user.universityId!} 
        initialBlackoutDates={blackoutDates} 
    />
  )
}
