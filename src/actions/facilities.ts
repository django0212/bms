'use server'

import { prisma } from '@/lib/db'
import { FacilityType } from '@prisma/client'
import { revalidatePath } from 'next/cache'

export async function getFacilities(universityId: string) {
  return await prisma.facility.findMany({
    where: {
      universityId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
}

export async function getFacilityById(facilityId: string) {
  return await prisma.facility.findUnique({
    where: { id: facilityId },
  })
}

export async function addFacility(data: {
  name: string
  description?: string
  type: FacilityType
  location?: string
  startLocation?: string
  endLocation?: string
  operatingHours?: string
  capacity?: number
  requiresApproval?: boolean
  transportConfig?: any
  universityId: string
}) {
  if (!data.name || data.name.trim() === '') {
    throw new Error('Facility name is required')
  }

  const facility = await prisma.facility.create({
    data: {
      ...data,
      transportConfig: data.transportConfig || undefined,
    },
  })

  revalidatePath('/dashboard/facilities')
  return facility
}

export async function updateFacility(
  facilityId: string,
  data: {
    name?: string
    description?: string
    type?: FacilityType
    location?: string
    startLocation?: string
    endLocation?: string
    operatingHours?: string
    capacity?: number
    requiresApproval?: boolean
    transportConfig?: any
  }
) {
  await prisma.facility.update({
    where: { id: facilityId },
    data: {
      ...data,
      transportConfig: data.transportConfig || undefined,
    },
  })

  revalidatePath('/dashboard/facilities')
}

export async function removeFacility(facilityId: string) {
  await prisma.facility.delete({
    where: { id: facilityId },
  })

  revalidatePath('/dashboard/facilities')
}
