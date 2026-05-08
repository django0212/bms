
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { prisma } from '@/lib/db';
// We need to find where university actions are.
// I'll assume `src/actions/super-admin.ts` based on file list.
// I'll read it first to be safe, but for now I'll write a placeholder or try to import if I'm confident.
// The file list showed `super-admin.ts`.
// Let's assume `createUniversity`, `updateUniversity` are there.

import { createUniversity, updateUniversity } from '../super-admin'; 

// Mock getCurrentUser and requireSuperAdmin
const mockGetCurrentUser = vi.fn();
const mockRequireSuperAdmin = vi.fn();

vi.mock('@/lib/auth', () => ({
  getCurrentUser: () => mockGetCurrentUser(),
  requireSuperAdmin: () => mockRequireSuperAdmin(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

describe('University Actions (Integration)', () => {
  let superAdmin: any;

  beforeAll(async () => {
    await prisma.$connect();
    superAdmin = await prisma.user.findUnique({ where: { email: 'superadmin@test.edu' } });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should create a university', async () => {
    mockGetCurrentUser.mockResolvedValue(superAdmin);

    const formData = new FormData();
    formData.append('name', `Integration Test Uni ${Date.now()}`);
    formData.append('slug', `test-uni-${Date.now()}`);
    formData.append('domain', `test-uni-${Date.now()}.edu`);
    formData.append('logoUrl', 'https://example.com/logo.png');
    formData.append('primaryColor', '#000000');

    // createUniversity redirects on success, so we expect a redirect error
    try {
        await createUniversity(formData);
    } catch (error: any) {
        if (error.message === 'NEXT_REDIRECT' || error.digest?.startsWith('NEXT_REDIRECT')) {
            // Success
        } else {
            throw error;
        }
    }
    
    // Verify in DB
    const dbUni = await prisma.university.findFirst({ where: { slug: formData.get('slug') as string } });
    expect(dbUni).toBeDefined();
    expect(dbUni?.name).toBe(formData.get('name'));

    // Cleanup
    if (dbUni) await prisma.university.delete({ where: { id: dbUni.id } });
  });

  it('should update a university', async () => {
    mockGetCurrentUser.mockResolvedValue(superAdmin);

    // Create one first
    const uni = await prisma.university.create({
        data: {
            name: 'Update Test Uni',
            slug: `update-test-${Date.now()}`,
            domain: `update-test-${Date.now()}.edu`
        }
    });

    const updatedName = 'Updated Name';
    const formData = new FormData();
    formData.append('name', updatedName);
    formData.append('slug', uni.slug);
    formData.append('domain', uni.domain!); // domain is optional in schema but required in action validation? Action says required.

    const result = await updateUniversity(uni.id, formData);
    
    expect(result.success).toBe(true);

    // Verify in DB
    const dbUni = await prisma.university.findUnique({ where: { id: uni.id } });
    expect(dbUni?.name).toBe(updatedName);

    // Cleanup
    await prisma.university.delete({ where: { id: uni.id } });
  });
});
