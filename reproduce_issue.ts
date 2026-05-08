
import { createEvent } from './src/actions/events'
import { prisma } from './src/lib/db'
import { Role } from '@prisma/client'

async function main() {
  console.log('🧪 Starting Event Creation Test...')

  // 1. Get a Student User
  const student = await prisma.user.findFirst({
    where: { role: Role.STUDENT }
  })

  if (!student) {
    console.error('❌ No student found to test with.')
    return
  }
  console.log(`👤 Testing as student: ${student.email}`)

  // 2. Get a Physical Facility
  const facility = await prisma.facility.findFirst({
    where: { 
        universityId: student.universityId!,
        type: 'PHYSICAL'
    }
  })

  if (!facility) {
    console.error('❌ No physical facility found.')
    return
  }
  console.log(`buildings Facility: ${facility.name} (Cap: ${facility.capacity})`)

  // 3. Mock the session (This is tricky since getCurrentUser uses cookies)
  // We might need to temporarily bypass auth or mock it. 
  // For this script, we will assume we can't easily mock next/headers cookies in a standalone script.
  // So we will inspect the code logic instead or try to invoke the internal logic if we extract it.
  
  // Actually, since we can't easily mock `getCurrentUser` which uses `cookies()`, 
  // we should create a test that calls the internal logic or temporarily modify the action to accept a user ID for testing (not recommended for prod).
  
  // BETTER APPROACH: Let's try to simulate the call if we can, but `createEvent` calls `getCurrentUser`.
  // `getCurrentUser` calls `verifySession` which calls `cookies()`.
  // This script won't work directly because of `cookies()`.
  
  // Plan B: We will inspect the code and maybe create a temporary "test" action or just review the logs if possible.
  // But wait, I can modify `src/lib/auth.ts` to return a mock user if a specific env var is set? No, that's risky.
  
  // Let's just try to call it and see if it fails with "Unauthorized" - that confirms the script is running but auth is the blocker.
  // If it fails with something else, we found a bug.
  
  try {
      // Mock data
      const eventData = {
        title: "Test Event",
        description: "Test Description",
        startTime: new Date(Date.now() + 86400000), // Tomorrow
        endTime: new Date(Date.now() + 90000000),
        location: "Test Location", // Should be overwritten by facility logic?
        facilityId: facility.id,
        allowedBatches: [],
        capacity: 10
      }

      console.log('🚀 Attempting to create event...')
      // This will likely fail due to missing session, but let's see the error.
      await createEvent(eventData)
      
  } catch (error) {
      console.log('⚠️ Caught error:', error)
  }
}

main()
