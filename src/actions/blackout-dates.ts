'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function addBlackoutDate(data: {
  date: Date
  reason?: string
  universityId: string
}) {
  // Normalize date to start of day to ensure uniqueness works as expected
  const date = new Date(data.date)
  date.setHours(0, 0, 0, 0)

  await prisma.blackoutDate.create({
    data: {
      date,
      reason: data.reason,
      universityId: data.universityId,
    },
  })

  revalidatePath('/dashboard/settings')
}

export async function removeBlackoutDate(id: string) {
  await prisma.blackoutDate.delete({
    where: { id },
  })

  revalidatePath('/dashboard/settings')
}

export async function getBlackoutDates(universityId: string) {
  return await prisma.blackoutDate.findMany({
    where: { universityId },
    orderBy: { date: 'asc' },
  })
}
