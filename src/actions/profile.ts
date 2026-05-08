'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'

export async function updateProfile(userId: string, data: {
  name?: string
  currentPassword?: string
  newPassword?: string
}) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user) {
    throw new Error('User not found')
  }

  const updateData: any = {}

  if (data.name) {
    updateData.name = data.name
  }

  if (data.newPassword) {
    if (!data.currentPassword) {
      throw new Error('Current password is required to set a new password')
    }

    const passwordsMatch = await bcrypt.compare(data.currentPassword, user.password)
    if (!passwordsMatch) {
      throw new Error('Incorrect current password')
    }

    const hashedPassword = await bcrypt.hash(data.newPassword, 10)
    updateData.password = hashedPassword
  }

  await prisma.user.update({
    where: { id: userId },
    data: updateData,
  })

  revalidatePath('/dashboard/profile')
}
