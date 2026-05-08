import { describe, it, expect, vi, beforeEach } from 'vitest'
import { addFacility } from './facilities'
import { prisma } from '@/lib/db'

// Mock Prisma
vi.mock('@/lib/db', () => ({
  prisma: {
    facility: {
      create: vi.fn(),
    },
  },
}))

// Mock revalidatePath
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

describe('addFacility', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create a facility successfully', async () => {
    const mockData = {
      name: 'Test Facility',
      description: 'Test Description',
      type: 'PHYSICAL' as const,
      capacity: 10,
      universityId: 'uni-123',
    }

    // Mock successful creation
    const mockCreatedFacility = { id: 'fac-123', ...mockData }
    vi.mocked(prisma.facility.create).mockResolvedValue(mockCreatedFacility as any)

    const result = await addFacility(mockData)

    expect(prisma.facility.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        name: mockData.name,
        universityId: mockData.universityId,
      }),
    })
    expect(result).toEqual(mockCreatedFacility)
  })

  it('should throw error if name is missing', async () => {
    const mockData = {
      name: '',
      description: 'Test Description',
      type: 'PHYSICAL' as const,
      capacity: 10,
      universityId: 'uni-123',
    }

    await expect(addFacility(mockData)).rejects.toThrow()
  })
})
