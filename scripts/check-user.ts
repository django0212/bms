import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const email = 'superadmin@example.com'
  console.log(`Checking for user: ${email}`)

  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (user) {
    console.log('User found:')
    console.log(`ID: ${user.id}`)
    console.log(`Email: ${user.email}`)
    console.log(`Role: ${user.role}`)
    console.log(`Password Hash (first 10 chars): ${user.password.substring(0, 10)}...`)
  } else {
    console.log('User NOT found.')
  }
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
