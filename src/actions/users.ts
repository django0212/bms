'use server'

import { prisma } from '@/lib/db'
import { requireSuperAdmin } from '@/lib/auth'
import { Role } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { hash } from 'bcryptjs'

export async function getAllUsers() {
  await requireSuperAdmin()

  return await prisma.user.findMany({
    include: {
      university: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
}

export async function getStudents(
  universityId: string,
  query?: string,
  status?: 'active' | 'inactive' | 'all',
  batch?: string,
  role?: Role | 'all'
) {
  const where: any = {
    universityId,
  }

  // Role filter (default to STUDENT if not specified or specific role requested)
  // If role is 'all', we don't filter by role (or maybe we do? Requirement says "filter options for students", usually implies searching within students, but "role" implies maybe seeing other roles?)
  // The function is named `getStudents`, but the requirement says "filter options for students".
  // If the user wants to filter by role, they might want to see Admins too?
  // But `getStudents` implies only students.
  // Let's assume "Role" filter means filtering *among* users, so maybe we should rename or generalize.
  // However, the UI is "Student Management".
  // If I change `role: Role.STUDENT` to be dynamic, it becomes `getUsers`.
  // Let's keep it as `getStudents` but allow filtering if the user *really* wants to see others, OR strictly filter students.
  // Actually, the prompt says "filter options for students".
  // Columns usually include: Name, Email, ID, Batch, Role, Status.
  // So filtering by Role might mean finding "Class Representatives" if that was a role, but here Role is ADMIN/STUDENT.
  // If I allow filtering by Role, I should probably remove the hardcoded `role: Role.STUDENT`.
  
  if (role && role !== 'all') {
    where.role = role
  } else {
    // Default to STUDENT if no role specified, to maintain backward compatibility?
    // Or if 'all' is passed, show all?
    // Let's default to STUDENT to be safe, unless 'all' is explicitly passed.
    // But wait, the existing code hardcoded `role: Role.STUDENT`.
    // If I want to filter *students*, role is always STUDENT.
    // Maybe the user means filtering by "Batch" and "Status" primarily.
    // "filter options should utilise all appropriate student db columns"
    // Student DB columns: name, email, studentId, batch, role, isActive.
    // So yes, Batch and Status are the key ones. Role is likely just STUDENT.
    // But I will allow overriding it just in case.
    if (!role) {
        where.role = Role.STUDENT
    }
  }

  if (query) {
    where.OR = [
      { name: { contains: query, mode: 'insensitive' } },
      { email: { contains: query, mode: 'insensitive' } },
      { studentId: { contains: query, mode: 'insensitive' } },
    ]
  }

  if (status && status !== 'all') {
    where.isActive = status === 'active'
  }

  if (batch && batch !== 'all') {
    where.batch = batch
  }

  const students = await prisma.user.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  })

  return students
}

export async function bulkCreateStudents(
  students: { name: string; email: string; studentId: string; batch?: string }[],
  universityId: string
) {
  try {
    // Process in chunks to avoid overwhelming the DB
    const chunkSize = 50
    for (let i = 0; i < students.length; i += chunkSize) {
      const chunk = students.slice(i, i + chunkSize)
      
      // Pre-calculate passwords to avoid async inside transaction map
      const studentsWithPasswords = await Promise.all(
        chunk.map(async (student) => ({
          ...student,
          password: await hash(student.studentId, 12)
        }))
      )

      await prisma.$transaction(
        studentsWithPasswords.map((student) => 
          prisma.user.upsert({
            where: { email: student.email },
            update: {
                name: student.name,
                studentId: student.studentId,
                batch: student.batch,
                universityId,
                role: Role.STUDENT
            },
            create: {
              name: student.name,
              email: student.email,
              studentId: student.studentId,
              batch: student.batch,
              password: student.password,
              universityId,
              role: Role.STUDENT,
              isActive: true,
            },
          })
        )
      )
    }

    revalidatePath('/dashboard/students')
    return { success: true }
  } catch (error) {
    console.error('Bulk create error:', error)
    return { success: false, error: 'Failed to bulk create students' }
  }
}

export async function updateStudent(
  id: string,
  data: { name?: string; email?: string; studentId?: string; batch?: string | null; isActive?: boolean }
) {
  try {
    await prisma.user.update({
      where: { id },
      data,
    })
    revalidatePath('/dashboard/students')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to update student' }
  }
}

export async function changePassword(id: string, newPassword: string) {
  try {
    const hashedPassword = await hash(newPassword, 12)
    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    })
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to change password' }
  }
}

export async function createStudent(data: { name: string; email: string; studentId: string; batch?: string; universityId: string }) {
  try {
    const password = await hash(data.studentId, 12)
    
    await prisma.user.create({
      data: {
        ...data,
        password,
        role: Role.STUDENT,
        isActive: true,
      },
    })

    revalidatePath('/dashboard/students')
    return { success: true }
  } catch (error) {
    console.error('Create student error:', error)
    return { success: false, error: 'Failed to create student. Email or Student ID might already exist.' }
  }
}
