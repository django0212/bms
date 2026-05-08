'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { createSession, deleteSession } from '@/lib/session'

export async function loginAction(prevState: any, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const captchaToken = formData.get('captcha') as string

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  if (!captchaToken) {
    return { error: 'Please complete the CAPTCHA' }
  }

  // Verify CAPTCHA
  try {
    // Bypass for testing
    if (process.env.NODE_ENV !== 'production' && captchaToken === 'TEST_BYPASS_TOKEN') {
        console.log('CAPTCHA bypassed for testing');
    } else {
        const secretKey = process.env.RECAPTCHA_SECRET_KEY
        if (!secretKey) {
        console.error('RECAPTCHA_SECRET_KEY is not defined')
        return { error: 'Server configuration error' }
        }

        const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `secret=${secretKey}&response=${captchaToken}`,
        })

        const data = await response.json()

        if (!data.success) {
        return { error: 'CAPTCHA verification failed. Please try again.' }
        }
    }
  } catch (error) {
    console.error('CAPTCHA Error:', error)
    return { error: 'Failed to verify CAPTCHA' }
  }

  try {
    // Find user in database
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      console.log('Login failed: User not found')
      return { error: 'Invalid credentials' }
    }

    // Verify password
    const passwordsMatch = await bcrypt.compare(password, user.password)

    if (!passwordsMatch) {
      console.log('Login failed: Password mismatch')
      return { error: 'Invalid credentials' }
    }

    // Create session
    await createSession(user.id, user.email, user.role, user.universityId)

    // Handle University Context Cookie
    const cookieStore = await cookies()
    
    if (user.role === 'SUPER_ADMIN') {
      // For Super Admin, try to find a university to use as context if they don't have one
      let universityId = user.universityId

      if (!universityId) {
        const emailDomain = email.split('@')[1]
        const university = await prisma.university.findUnique({
          where: { domain: emailDomain },
        })
        
        if (university) {
          universityId = university.id
        } else {
           // Fallback to first university
           const firstUni = await prisma.university.findFirst()
           if (firstUni) universityId = firstUni.id
        }
      }

      if (universityId) {
        cookieStore.set('university_id', universityId, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 30, // 30 days
          path: '/',
        })
      }
    } else {
      // For regular users, ensure they have a university
      if (!user.universityId) {
        return { error: 'User is not associated with any university' }
      }

      cookieStore.set('university_id', user.universityId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
      })
    }

    redirect('/dashboard')
  } catch (error: any) {
    if (error.message === 'NEXT_REDIRECT') {
      throw error
    }
    console.error('Login Action Unexpected Error:', error)
    return { error: `System Error: ${error.message || 'Unknown error occurred'}` }
  }
}

export async function logout() {
  await deleteSession()
  
  const cookieStore = await cookies()
  cookieStore.delete('university_id')
  
  redirect('/login')
}
