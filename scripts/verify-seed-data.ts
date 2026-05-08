import { PrismaClient, FacilityType } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Verifying seed data...')

  // 1. Verify Student IDs
  const universities = await prisma.university.findMany({ include: { users: { where: { role: 'STUDENT' }, take: 3 } } })
  for (const uni of universities) {
    console.log(`\n🏫 ${uni.name} (${uni.slug}) Student IDs:`)
    uni.users.forEach(u => console.log(`   - ${u.studentId}`))
  }

  // 2. Verify Transport Bookings
  const transportBookings = await prisma.booking.findMany({
    where: { facility: { type: FacilityType.TRANSPORT } },
    take: 5,
    include: { facility: true }
  })
  console.log('\n🚌 Transport Bookings Sample:')
  transportBookings.forEach(b => {
    console.log(`   - Booking ${b.id}: Status: ${b.status}, Facility: ${b.facility.name}, RequiresApproval: ${b.facility.requiresApproval}`)
  })

  // 3. Verify Facility Data
  const facilities = await prisma.facility.findMany({ take: 5 })
  console.log('\n🏢 Facility Sample:')
  facilities.forEach(f => {
    const amenitiesStr = f.amenities && typeof f.amenities === 'object' ? JSON.stringify(f.amenities) : 'None';
    console.log(`   - ${f.name} (${f.type}): Desc: "${f.description?.substring(0, 30)}...", Amenities: ${amenitiesStr}`)
  })
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
