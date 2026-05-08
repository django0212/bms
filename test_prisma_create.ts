
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🧪 Testing Prisma Event Create...')

  const user = await prisma.user.findFirst({
    where: { role: 'STUDENT' }
  })

  if (!user || !user.universityId) {
    console.error('❌ No suitable student found')
    return
  }

  console.log(`👤 User: ${user.email}, Uni: ${user.universityId}`)

  try {
    const event = await prisma.event.create({
      data: {
        title: "Direct Prisma Test Event",
        description: "Testing direct creation",
        startTime: new Date(),
        endTime: new Date(),
        location: "Test Loc",
        universityId: user.universityId,
        organizerId: user.id,
        allowedBatches: [],
        // facilityId is optional, leaving it undefined
      }
    })
    console.log('✅ Event created successfully:', event.id)
  } catch (error) {
    console.error('❌ Failed to create event:', error)
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
