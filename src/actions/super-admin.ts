'use server'

import { prisma } from '@/lib/db'
import { Role } from '@prisma/client'
import { requireSuperAdmin } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// University Actions

export async function createUniversity(formData: FormData) {
  await requireSuperAdmin()

  const name = formData.get('name') as string
  const slug = formData.get('slug') as string
  const domain = formData.get('domain') as string
  const allowedDomainsStr = formData.get('allowedDomains') as string
  const logoUrl = formData.get('logoUrl') as string
  const primaryColor = formData.get('primaryColor') as string

  if (!name || !slug || !domain) {
    return { error: 'Name, slug, and domain are required' }
  }

  // Parse allowed domains (comma separated)
  const allowedDomains = allowedDomainsStr 
    ? allowedDomainsStr.split(',').map(d => d.trim()).filter(Boolean) 
    : []

  try {
    await prisma.university.create({
      data: {
        name,
        slug,
        domain,
        allowedDomains,
        logoUrl: logoUrl || null,
        primaryColor: primaryColor || null,
      },
    })
  } catch (error: any) {
    console.error('Create University Error:', error)
    if (error.code === 'P2002') {
      return { error: 'University with this slug or domain already exists' }
    }
    return { error: 'Failed to create university' }
  }

  revalidatePath('/dashboard/universities')
  redirect('/dashboard/universities')
}

export async function deleteUniversity(id: string) {
  await requireSuperAdmin()

  try {
    await prisma.university.delete({
      where: { id },
    })
  } catch (error) {
    console.error('Delete University Error:', error)
    return { error: 'Failed to delete university' }
  }

  revalidatePath('/dashboard/universities')
}

export async function updateUniversity(id: string, formData: FormData) {
  await requireSuperAdmin()

  const name = formData.get('name') as string
  const slug = formData.get('slug') as string
  const domain = formData.get('domain') as string
  const allowedDomainsStr = formData.get('allowedDomains') as string
  const logoUrl = formData.get('logoUrl') as string
  const primaryColor = formData.get('primaryColor') as string

  if (!name || !slug || !domain) {
    return { error: 'Name, slug, and domain are required' }
  }

  const allowedDomains = allowedDomainsStr 
    ? allowedDomainsStr.split(',').map(d => d.trim()).filter(Boolean) 
    : []

  try {
    await prisma.university.update({
      where: { id },
      data: {
        name,
        slug,
        domain,
        allowedDomains,
        logoUrl: logoUrl || null,
        primaryColor: primaryColor || null,
      },
    })
  } catch (error: any) {
    console.error('Update University Error:', error)
    if (error.code === 'P2002') {
      return { error: 'University with this slug or domain already exists' }
    }
    return { error: 'Failed to update university' }
  }

  revalidatePath('/dashboard/universities')
  revalidatePath(`/dashboard/universities/${id}`)
  return { success: true }
}

// Admin Actions

export async function addUniversityAdmin(prevState: any, formData: FormData) {
  await requireSuperAdmin()

  const universityId = formData.get('universityId') as string
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!universityId || !email || !password) {
    return { error: 'All fields are required' }
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: Role.ADMIN,
        universityId,
      },
    })
  } catch (error: any) {
    console.error('Add Admin Error:', error)
    if (error.code === 'P2002') {
      return { error: 'User with this email already exists' }
    }
    return { error: 'Failed to create admin' }
  }

  revalidatePath(`/dashboard/universities/${universityId}`)
  return { success: true }
}

export async function removeUniversityAdmin(userId: string, universityId: string) {
  await requireSuperAdmin()

  try {
    await prisma.user.delete({
      where: { id: userId },
    })
  } catch (error) {
    console.error('Remove Admin Error:', error)
    return { error: 'Failed to remove admin' }
  }

  revalidatePath(`/dashboard/universities/${universityId}`)
}

export async function getSuperAdminStats() {
  await requireSuperAdmin()

  const [universityCount, adminCount, studentCount, bookingCount] = await Promise.all([
    prisma.university.count(),
    prisma.user.count({ where: { role: Role.ADMIN } }),
    prisma.user.count({ where: { role: Role.STUDENT } }),
    prisma.booking.count(),
  ])

  // Get recent activity (last 5 bookings)
  const recentBookings = await prisma.booking.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { name: true, email: true } },
      university: { select: { name: true } },
      facility: { select: { name: true } },
    },
  })

  return {
    universityCount,
    adminCount,
    studentCount,
    bookingCount,
    recentBookings,
  }
}

export async function getGlobalUsers(filters?: {
  role?: Role | 'ALL'
  universityId?: string
  search?: string
  sortBy?: 'newest' | 'oldest'
}) {
  await requireSuperAdmin()

  const where: any = {}

  if (filters?.role && filters.role !== 'ALL') {
    where.role = filters.role
  }

  if (filters?.universityId && filters.universityId !== 'ALL') {
    where.universityId = filters.universityId
  }

  if (filters?.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { email: { contains: filters.search, mode: 'insensitive' } },
    ]
  }

  const users = await prisma.user.findMany({
    where,
    include: {
      university: { select: { name: true } },
    },
    orderBy: {
      createdAt: filters?.sortBy === 'oldest' ? 'asc' : 'desc',
    },
  })

  return users
}

export async function getGlobalBookings(filters?: {
  universityId?: string
  facilityType?: string
  status?: string
  search?: string
  date?: Date
}) {
  await requireSuperAdmin()

  const where: any = {}

  if (filters?.universityId && filters.universityId !== 'ALL') {
    where.universityId = filters.universityId
  }

  if (filters?.facilityType && filters.facilityType !== 'ALL') {
    where.facility = { type: filters.facilityType }
  }

  if (filters?.status && filters.status !== 'ALL') {
    where.status = filters.status
  }

  if (filters?.search) {
    where.OR = [
      { user: { name: { contains: filters.search, mode: 'insensitive' } } },
      { user: { email: { contains: filters.search, mode: 'insensitive' } } },
      { facility: { name: { contains: filters.search, mode: 'insensitive' } } },
    ]
  }
  
  if (filters?.date) {
      // Simple date filter (starts on this date)
      const nextDay = new Date(filters.date)
      nextDay.setDate(nextDay.getDate() + 1)
      
      where.startTime = {
          gte: filters.date,
          lt: nextDay
      }
  }

  const bookings = await prisma.booking.findMany({
    where,
    include: {
      user: { select: { name: true, email: true } },
      university: { select: { name: true } },
      facility: { select: { name: true, type: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return bookings
}

export async function updateGlobalUser(id: string, data: any) {
    await requireSuperAdmin()
    
    try {
        await prisma.user.update({
            where: { id },
            data
        })
        revalidatePath('/dashboard/users')
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Failed to update user' }
    }
}
