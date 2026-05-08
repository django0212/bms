import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = 'student1@mit.edu'
  const password = 'password123'

  console.log(`Checking user: ${email}`)

  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) {
    console.error('❌ User not found in database!')
    return
  }

  console.log('✅ User found:', {
    id: user.id,
    email: user.email,
    role: user.role,
    universityId: user.universityId,
    passwordHash: user.password.substring(0, 10) + '...'
  })

  const match = await bcrypt.compare(password, user.password)

  if (match) {
    console.log('✅ Password matches!')
  } else {
    console.error('❌ Password DOES NOT match!')
    
    // Try to hash it again to see what it should be
    const newHash = await bcrypt.hash(password, 10)
    console.log('Expected hash for password123 would look like:', newHash.substring(0, 10) + '...')
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
