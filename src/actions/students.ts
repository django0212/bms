'use server'

import { prisma } from '@/lib/db'
import { Role } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { hash } from 'bcryptjs'

export async function getStudents(universityId: string) {
  return await prisma.user.findMany({
    where: {
      universityId,
      role: Role.STUDENT,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
}

export async function addStudent(data: {
  email: string
  studentId: string
  name: string
  universityId: string
}) {
  const { email, studentId, name, universityId } = data

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  })

  if (existingUser) {
    throw new Error('User with this email already exists')
  }

  // Default password is student ID
  const hashedPassword = await hash(studentId, 10)

  await prisma.user.create({
    data: {
      email,
      studentId,
      name,
      password: hashedPassword,
      universityId,
      role: Role.STUDENT,
    },
  })

  revalidatePath('/dashboard/students')
}

export async function removeStudent(userId: string) {
  await prisma.user.delete({
    where: { id: userId },
  })

  revalidatePath('/dashboard/students')
}
