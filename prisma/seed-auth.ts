import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

// You need to add SUPABASE_SERVICE_ROLE_KEY to your .env file
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

async function seedAuth() {
  console.log('🌱 Seeding Auth Users...')

  const users = [
    {
      email: 'superadmin@example.com',
      password: 'password123',
      role: 'SUPER_ADMIN',
      name: 'Super Admin',
    },
    {
      email: 'admin@mit.edu',
      password: 'password123',
      role: 'ADMIN',
      name: 'MIT Admin',
      universitySlug: 'mit',
    },
    {
      email: 'student@mit.edu',
      password: 'password123',
      role: 'STUDENT',
      name: 'MIT Student',
      universitySlug: 'mit',
    },
  ]

  for (const user of users) {
    // 1. Create Auth User in Supabase
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: { name: user.name },
    })

    if (authError) {
      console.log(`⚠️ Auth user ${user.email} already exists or failed:`, authError.message)
      // If user exists, we need to get their ID to sync with public table
      // In a real script we might fetch the user ID here, but for simplicity
      // we'll skip if they exist, assuming the public record might be out of sync
      // or we'd need to fetch the ID via admin.listUsers()
      continue
    }

    if (!authUser.user) continue

    console.log(`✅ Created Auth User: ${user.email}`)

    // 2. Sync with Public User Table (Prisma)
    // We need to ensure the ID matches the Auth ID
    
    let universityId: string | null = null
    if (user.universitySlug) {
      const uni = await prisma.university.findUnique({ where: { slug: user.universitySlug } })
      universityId = uni?.id || null
    }

    const hashedPassword = await hash(user.password, 12)

    // Upsert using the Auth ID
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        id: authUser.user.id, // Ensure IDs match
        role: user.role as any,
        universityId,
      },
      create: {
        id: authUser.user.id, // Use the ID from Supabase Auth
        email: user.email,
        name: user.name,
        role: user.role as any,
        universityId,
        password: hashedPassword,
      },
    })
    
    console.log(`✅ Synced Public User: ${user.email}`)
  }
}

seedAuth()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
