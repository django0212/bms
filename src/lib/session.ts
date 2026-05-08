import 'server-only'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { Role } from '@prisma/client'

const secretKey = process.env.SESSION_SECRET
if (!secretKey && process.env.NODE_ENV === 'production') {
  throw new Error('SESSION_SECRET is not defined')
}
const key = new TextEncoder().encode(secretKey || 'default-secret-key-change-me')

export type SessionPayload = {
  userId: string
  email: string
  role: Role
  universityId: string | null
  expiresAt: Date
}

export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(key)
}

export async function decrypt(session: string | undefined = '') {
  try {
    const { payload } = await jwtVerify(session, key, {
      algorithms: ['HS256'],
    })
    return payload as unknown as SessionPayload
  } catch (error) {
    return null
  }
}

export async function createSession(userId: string, email: string, role: Role, universityId: string | null) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  const session = await encrypt({ userId, email, role, universityId, expiresAt })
  const cookieStore = await cookies()

  cookieStore.set('session', session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  })
}

export async function verifySession() {
  const cookieStore = await cookies()
  const session = cookieStore.get('session')?.value
  const payload = await decrypt(session)

  if (!payload?.userId) {
    return null
  }

  return payload
}

export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete('session')
}
