// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { createEvent, registerForEvent, cancelRegistration, deleteEvent } from '../events';
import { prisma } from '@/lib/db';
import { FacilityType } from '@prisma/client';

// Mock getCurrentUser
const mockGetCurrentUser = vi.fn();

vi.mock('@/lib/auth', () => ({
  getCurrentUser: () => mockGetCurrentUser(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

describe('Event Actions (Integration)', () => {
  let studentUser: any;
  let adminUser: any;
  let university: any;
  let facility: any;

  beforeAll(async () => {
    await prisma.$connect();
    studentUser = await prisma.user.findUnique({ where: { email: 'student@test.edu' } });
    adminUser = await prisma.user.findUnique({ where: { email: 'admin@test.edu' } });
    university = await prisma.university.findUnique({ where: { slug: 'test-university' } });
    
    facility = await prisma.facility.create({
        data: {
            name: `Event Facility ${Date.now()}`,
            type: FacilityType.PHYSICAL,
            universityId: university.id,
            capacity: 50
        }
    });
  });

  afterAll(async () => {
    if (facility) {
        // Delete registrations for events associated with facility
        await prisma.eventRegistration.deleteMany({
            where: {
                event: {
                    facilityId: facility.id
                }
            }
        });
        // Delete events associated with facility
        await prisma.event.deleteMany({ where: { facilityId: facility.id } });
        await prisma.facility.delete({ where: { id: facility.id } });
    }
    await prisma.$disconnect();
  });

  it('should create an event successfully', async () => {
    mockGetCurrentUser.mockResolvedValue(studentUser);

    const eventData = {
        title: 'Integration Test Event',
        description: 'Testing event creation',
        startTime: new Date(Date.now() + 86400000), // Tomorrow
        endTime: new Date(Date.now() + 90000000),
        location: 'Test Location',
        facilityId: facility.id,
        allowedBatches: [],
        capacity: 20
    };

    const event = await createEvent(eventData);
    expect(event).toBeDefined();
    expect(event.title).toBe(eventData.title);
    expect(event.organizerId).toBe(studentUser.id);
  });

  it('should register for an event', async () => {
    mockGetCurrentUser.mockResolvedValue(studentUser);

    // Create a new event to register for
    const event = await prisma.event.create({
        data: {
            title: 'Registration Test Event',
            description: 'Testing registration',
            startTime: new Date(Date.now() + 100000000),
            endTime: new Date(Date.now() + 103600000),
            location: 'Hall A',
            universityId: university.id,
            organizerId: studentUser.id,
            facilityId: facility.id,
            capacity: 10
        }
    });

    const registration = await registerForEvent(event.id);
    expect(registration).toBeDefined();
    expect(registration.userId).toBe(studentUser.id);
    expect(registration.eventId).toBe(event.id);
  });

  it('should fail to register if event is full', async () => {
    mockGetCurrentUser.mockResolvedValue(studentUser);

    // Create a full event
    const event = await prisma.event.create({
        data: {
            title: 'Full Event',
            description: 'Testing capacity',
            startTime: new Date(Date.now() + 200000000),
            endTime: new Date(Date.now() + 203600000),
            location: 'Hall B',
            universityId: university.id,
            organizerId: studentUser.id,
            facilityId: facility.id,
            capacity: 0 // Full immediately
        }
    });

    await expect(registerForEvent(event.id)).rejects.toThrow('Event is full');
  });

  it('should cancel registration', async () => {
    mockGetCurrentUser.mockResolvedValue(studentUser);

    const event = await prisma.event.create({
        data: {
            title: 'Cancel Test Event',
            description: 'Testing cancellation',
            startTime: new Date(Date.now() + 300000000),
            endTime: new Date(Date.now() + 303600000),
            location: 'Hall C',
            universityId: university.id,
            organizerId: studentUser.id,
            facilityId: facility.id,
            capacity: 10
        }
    });

    await registerForEvent(event.id);
    
    // Verify registered
    const regBefore = await prisma.eventRegistration.findUnique({
        where: { eventId_userId: { eventId: event.id, userId: studentUser.id } }
    });
    expect(regBefore).toBeDefined();

    await cancelRegistration(event.id);

    // Verify cancelled (deleted)
    const regAfter = await prisma.eventRegistration.findUnique({
        where: { eventId_userId: { eventId: event.id, userId: studentUser.id } }
    });
    expect(regAfter).toBeNull();
  });

  it('should delete event', async () => {
    mockGetCurrentUser.mockResolvedValue(adminUser); // Admin can delete

    const event = await prisma.event.create({
        data: {
            title: 'Delete Test Event',
            description: 'Testing deletion',
            startTime: new Date(Date.now() + 400000000),
            endTime: new Date(Date.now() + 403600000),
            location: 'Hall D',
            universityId: university.id,
            organizerId: studentUser.id,
            facilityId: facility.id,
        }
    });

    const result = await deleteEvent(event.id);
    expect(result.success).toBe(true);

    const deletedEvent = await prisma.event.findUnique({ where: { id: event.id } });
    expect(deletedEvent).toBeNull();
  });
});
