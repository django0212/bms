import { PrismaClient, Role, FacilityType, BookingStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding test data...');

  // 1. Clean up existing data (optional, but good for deterministic tests if we can)
  // Be careful running this on production!
  // For now, we'll just upsert to ensure existence.

  // 2. Create University
  const university = await prisma.university.upsert({
    where: { slug: 'test-university' },
    update: {},
    create: {
      name: 'Test University',
      slug: 'test-university',
      domain: 'test.edu',
      allowedDomains: ['test.edu'],
    },
  });

  // 3. Create Users
  const passwordHash = await bcrypt.hash('password123', 10);

  // Super Admin
  await prisma.user.upsert({
    where: { email: 'superadmin@test.edu' },
    update: { password: passwordHash, role: Role.SUPER_ADMIN },
    create: {
      email: 'superadmin@test.edu',
      name: 'Super Admin',
      password: passwordHash,
      role: Role.SUPER_ADMIN,
      universityId: university.id,
    },
  });

  // Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@test.edu' },
    update: { password: passwordHash, role: Role.ADMIN },
    create: {
      email: 'admin@test.edu',
      name: 'Admin User',
      password: passwordHash,
      role: Role.ADMIN,
      universityId: university.id,
    },
  });

  // Student
  const student = await prisma.user.upsert({
    where: { email: 'student@test.edu' },
    update: { password: passwordHash, role: Role.STUDENT },
    create: {
      email: 'student@test.edu',
      name: 'Student User',
      studentId: 'TEST-STU-001',
      password: passwordHash,
      role: Role.STUDENT,
      universityId: university.id,
    },
  });

  // 4. Create Facilities
  // Physical Facility
  const lab = await prisma.facility.upsert({
    where: { id: 'test-lab-facility' }, // UUIDs are usually random, but we can try to force one or find by name if we added a unique constraint (we didn't).
    // So we'll search by name for this seed script or just create if not exists (which might duplicate if we run multiple times without cleanup).
    // To be safe, let's delete facilities for this uni first or just create new ones and return them.
    // Ideally, we want stable IDs for tests.
    // Let's use a fixed UUID if possible, or just rely on finding them by name in tests.
    update: {},
    create: {
      name: 'Test Computer Lab',
      description: 'A lab for testing',
      type: FacilityType.PHYSICAL,
      universityId: university.id,
      amenities: ['Computers', 'Projector'],
    },
  });
  
  // We can't easily upsert by non-unique fields without a custom find.
  // Let's just find first.
  let transport = await prisma.facility.findFirst({
    where: { name: 'Test Shuttle', universityId: university.id }
  });

  if (!transport) {
    transport = await prisma.facility.create({
      data: {
        name: 'Test Shuttle',
        description: 'Shuttle for testing',
        type: FacilityType.TRANSPORT,
        universityId: university.id,
        capacity: 20,
        startLocation: 'Main Gate',
        endLocation: 'Dorms',
        transportConfig: {
            stops: ['Main Gate', 'Library', 'Dorms'],
            schedule: ['08:00', '09:00', '10:00']
        }
      }
    });
  }

  console.log('Test data seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
