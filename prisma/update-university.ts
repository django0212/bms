import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateUniversity() {
  const updated = await prisma.university.update({
    where: { slug: 'mit' },
    data: {
      domain: 'mit.edu',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/MIT_logo.svg/200px-MIT_logo.svg.png',
      primaryColor: '#A31F34',
    },
  })
  console.log('Updated university:', updated)
}

updateUniversity()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
