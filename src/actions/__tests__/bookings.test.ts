// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { createBooking as createStudentBooking, cancelBooking } from '../student-bookings';
import { prisma } from '@/lib/db';
import { FacilityType } from '@prisma/client';

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

describe('Booking Actions (Integration)', () => {
  let studentUser: any;
  let facility: any;
  let university: any;

  beforeAll(async () => {
    await prisma.$connect();
    // Fetch seeded data
    studentUser = await prisma.user.findUnique({ where: { email: 'student@test.edu' } });
    university = await prisma.university.findUnique({ where: { slug: 'test-university' } });
    
    // Create a specific facility for testing to avoid conflicts
    facility = await prisma.facility.create({
        data: {
            name: `Integration Test Facility ${Date.now()}`,
            type: FacilityType.PHYSICAL,
            universityId: university.id,
            capacity: 5
        }
    });
  });

  afterAll(async () => {
    // Cleanup
    if (facility) {
        await prisma.booking.deleteMany({ where: { facilityId: facility.id } });
        await prisma.facility.delete({ where: { id: facility.id } });
    }
    await prisma.$disconnect();
  });

  it('should create a valid booking', async () => {
    const startTime = new Date();
    startTime.setDate(startTime.getDate() + 1); // Tomorrow
    startTime.setHours(10, 0, 0, 0);
    
    const endTime = new Date(startTime);
    endTime.setHours(11, 0, 0, 0);

    const result = await createStudentBooking({
        userId: studentUser.id,
        facilityId: facility.id,
        universityId: university.id,
        startTime,
        endTime,
    });

    expect(result.success).toBe(true);

    // Verify in DB
    const booking = await prisma.booking.findFirst({
        where: {
            userId: studentUser.id,
            facilityId: facility.id,
            startTime
        }
    });
    expect(booking).toBeDefined();
    expect(booking?.status).toBe('CONFIRMED'); // Assuming no approval needed
  });

  it('should prevent overlapping bookings for same slot if capacity reached', async () => {
    // Create a small capacity facility
    const smallFacility = await prisma.facility.create({
        data: {
            name: `Small Facility ${Date.now()}`,
            type: FacilityType.PHYSICAL,
            universityId: university.id,
            capacity: 1
        }
    });

    const startTime = new Date();
    startTime.setDate(startTime.getDate() + 2);
    startTime.setHours(10, 0, 0, 0);
    const endTime = new Date(startTime);
    endTime.setHours(11, 0, 0, 0);

    // First booking
    await createStudentBooking({
        userId: studentUser.id,
        facilityId: smallFacility.id,
        universityId: university.id,
        startTime,
        endTime,
    });

    // Second booking (should fail)
    const result = await createStudentBooking({
        userId: studentUser.id,
        facilityId: smallFacility.id,
        universityId: university.id,
        startTime,
        endTime,
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('fully booked');

    // Cleanup
    await prisma.booking.deleteMany({ where: { facilityId: smallFacility.id } });
    await prisma.facility.delete({ where: { id: smallFacility.id } });
  });

  it('should cancel a booking', async () => {
    // Create a booking to cancel
    const startTime = new Date();
    startTime.setDate(startTime.getDate() + 3);
    const endTime = new Date(startTime);
    endTime.setHours(startTime.getHours() + 1);

    await createStudentBooking({
        userId: studentUser.id,
        facilityId: facility.id,
        universityId: university.id,
        startTime,
        endTime,
    });

    const booking = await prisma.booking.findFirst({
        where: {
            userId: studentUser.id,
            facilityId: facility.id,
            startTime
        }
    });

    expect(booking).toBeDefined();

    // Cancel it
    await cancelBooking(booking!.id, studentUser.id);

    const updatedBooking = await prisma.booking.findUnique({ where: { id: booking!.id } });
    expect(updatedBooking?.status).toBe('CANCELLED');
  });
});
