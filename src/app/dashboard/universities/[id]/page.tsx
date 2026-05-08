import { prisma } from '@/lib/db'
import { requireSuperAdmin } from '@/lib/auth'
import { notFound } from 'next/navigation'
import UniversityClient from './university-client'
import { Role } from '@prisma/client'

export default async function UniversityDetailsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ query?: string; role?: string }>
}) {
  await requireSuperAdmin()
  const { id } = await params
  const { query, role } = await searchParams

  const university = await prisma.university.findUnique({
    where: { id },
  })

  if (!university) {
    notFound()
  }

  const where: any = {
    universityId: id,
  }

  if (query) {
    where.OR = [
      { name: { contains: query, mode: 'insensitive' } },
      { email: { contains: query, mode: 'insensitive' } },
    ]
  }

  if (role && role !== 'ALL') {
    where.role = role
  }

  const users = await prisma.user.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  })

  const admins = users.filter(u => u.role === Role.ADMIN)
  const students = users.filter(u => u.role === Role.STUDENT)

  return (
    <UniversityClient 
      university={university} 
      admins={admins} 
      students={students} 
    />
  )
}
